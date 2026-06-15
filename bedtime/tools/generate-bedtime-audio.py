#!/usr/bin/env python3
"""Pre-render bedtime story narration to static MP3 files.

GitHub Pages can only serve static files, so it cannot run the ``/api/tts``
Azure proxy in ``server.py``. This script calls Azure once per narration
segment and then stitches the segments — with the inter-section pauses baked
in as silence — into a single ``audio/<storyId>.mp3`` per story.

A single continuous audio file is what the front-end plays: it lets iOS Safari
keep playing on the lock screen / in the background (segment-by-segment JS
playback stalls when the screen locks), removes between-segment download gaps,
and is also directly usable as a podcast episode.

Pipeline per story:
  1. Synthesize each narration segment via ``server.synthesize`` (identical
     SSML / voice / prosody rate -15% pitch -2% / format as the Render proxy).
     Segments are cached under ``audio/<storyId>/`` (git-ignored intermediates).
  2. ffmpeg-concat the segments with silence clips between them into the
     committed ``audio/<storyId>.mp3``.

Pause lengths baked between segments (mirrors the old front-end constants):
  - between story sections: 0.9 s
  - before the wind-down: 1.9 s
  - between wind-down lines: 2.3 s

Usage (run from the ``bedtime`` directory, or anywhere — paths resolve relative
to this file):

    python3 tools/generate-bedtime-audio.py            # all available stories
    python3 tools/generate-bedtime-audio.py week01     # only listed stories
    python3 tools/generate-bedtime-audio.py --force    # re-synthesize + rebuild

The Azure key is read from ``bedtime/.env`` and is never written or printed.
Requires ``ffmpeg`` on PATH for the concatenation step.
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent

sys.path.insert(0, str(BASE))
import server  # noqa: E402  (reuses load_local_env / synthesize / Azure config)

# server.load_local_env() already ran at import using the process CWD; load the
# bedtime/.env explicitly so the script works regardless of where it is invoked.
server.load_local_env(str(BASE / ".env"))

SECTION_PAUSE_MS = 900
BEFORE_WIND_DOWN_PAUSE_MS = 1900
WIND_DOWN_PAUSE_MS = 2300

AUDIO_ROOT = BASE / "audio"
SILENCE_DIR = AUDIO_ROOT / ".silence"


def narration_segments(story):
    """Return [(segment_id, text)] in the same order as the front-end narration()."""
    segments = [("intro", story["intro"])]
    for section in story["sections"]:
        segments.append((section["id"], section["text"]))
    wind_down = story["wind_down"]
    segments.append(("wind-down-scene", wind_down["scene"]))
    segments.append(("wind-down-breath", wind_down["breath"]))
    segments.append(("wind-down-goodnight", wind_down["goodnight"]))
    return segments


def pause_after(index, num_sections):
    """Silence (ms) that follows narration item ``index`` (0-based)."""
    next_index = index + 1
    first_wind_down = num_sections + 1
    if next_index == first_wind_down:
        return BEFORE_WIND_DOWN_PAUSE_MS
    if next_index > first_wind_down:
        return WIND_DOWN_PAUSE_MS
    return SECTION_PAUSE_MS


def available_story_ids(catalog):
    ids = []
    seen = set()
    for episode in catalog["episodes"]:
        entries = episode.get("stories") or [episode]
        for entry in entries:
            story_id = entry.get("id")
            if entry.get("available") and story_id and story_id not in seen:
                seen.add(story_id)
                ids.append(story_id)
    return ids


def ensure_silence(duration_ms):
    """Create (once) a silent MP3 matching the Azure output format."""
    path = SILENCE_DIR / f"{duration_ms}.mp3"
    if path.exists():
        return path
    SILENCE_DIR.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", "anullsrc=r=24000:cl=mono",
            "-t", f"{duration_ms / 1000:.3f}",
            "-c:a", "libmp3lame", "-b:a", "48k", "-ar", "24000", "-ac", "1",
            str(path),
        ],
        check=True, capture_output=True,
    )
    return path


def build_combined(story_id, segments, num_sections, seg_dir):
    """ffmpeg-concat segment MP3s + silence into one audio/<storyId>.mp3."""
    entries = []
    for index, (segment_id, _text) in enumerate(segments):
        entries.append(seg_dir / f"{segment_id}.mp3")
        if index < len(segments) - 1:
            entries.append(ensure_silence(pause_after(index, num_sections)))

    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as listing:
        for path in entries:
            listing.write(f"file '{path.resolve()}'\n")
        list_path = listing.name

    out_path = AUDIO_ROOT / f"{story_id}.mp3"
    try:
        subprocess.run(
            [
                "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_path,
                "-c:a", "libmp3lame", "-b:a", "48k", "-ar", "24000", "-ac", "1",
                str(out_path),
            ],
            check=True, capture_output=True,
        )
    finally:
        Path(list_path).unlink(missing_ok=True)
    return out_path


def main():
    parser = argparse.ArgumentParser(description="Pre-render bedtime narration to combined MP3.")
    parser.add_argument("stories", nargs="*", help="story ids to render (default: all available)")
    parser.add_argument("--force", action="store_true", help="re-synthesize segments and rebuild combined files")
    args = parser.parse_args()

    if not all(server.speech_config()):
        sys.exit("Azure Speech not configured: set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in bedtime/.env")
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg not found on PATH; required to stitch segments into one file")

    catalog = json.loads((BASE / "stories" / "catalog.json").read_text(encoding="utf-8"))
    story_ids = available_story_ids(catalog)
    if args.stories:
        wanted = set(args.stories)
        missing = wanted - set(story_ids)
        if missing:
            print(f"warning: not in available catalog, skipping: {', '.join(sorted(missing))}")
        story_ids = [sid for sid in story_ids if sid in wanted]

    combined = 0
    total_bytes = 0
    for story_id in story_ids:
        story = json.loads((BASE / "stories" / f"{story_id}.json").read_text(encoding="utf-8"))
        segments = narration_segments(story)
        num_sections = len(story["sections"])
        seg_dir = AUDIO_ROOT / story_id
        seg_dir.mkdir(parents=True, exist_ok=True)
        print(f"{story_id}: {story.get('title', '')}")

        for segment_id, text in segments:
            seg_path = seg_dir / f"{segment_id}.mp3"
            if seg_path.exists() and not args.force:
                continue
            seg_path.write_bytes(server.synthesize(text))
            print(f"  synth {segment_id}.mp3")

        out_path = build_combined(story_id, segments, num_sections, seg_dir)
        size = out_path.stat().st_size
        combined += 1
        total_bytes += size
        print(f"  -> {out_path.name}  ({size / 1_048_576:.1f} MB)")

    print(
        f"\ndone: {combined} combined files across {len(story_ids)} stories "
        f"({total_bytes / 1_048_576:.1f} MB). Segment intermediates live under audio/<id>/."
    )


if __name__ == "__main__":
    main()
