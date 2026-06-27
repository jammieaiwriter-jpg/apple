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


TURN_PAUSE_MS = 250  # gentle gap between speaker turns inside one section
DEFAULT_NAME = "雨芯"  # name spoken in the goodnight of the default audio set


def narration_segments(story):
    """Return [(segment_id, text)] in the same order as the front-end narration().

    Mirrors index.html narration(): intro, optional prologue, sections, wind-down.
    """
    segments = [("intro", story["intro"])]
    if story.get("prologue"):
        segments.append(("prologue", story["prologue"]))
    for section in story["sections"]:
        segments.append((section["id"], section["text"]))
    wind_down = story["wind_down"]
    segments.append(("wind-down-scene", wind_down["scene"]))
    segments.append(("wind-down-breath", wind_down["breath"]))
    segments.append(("wind-down-goodnight", wind_down["goodnight"]))
    return segments


def section_turns(story, segment_id):
    """If ``segment_id`` is a multi-voice section, return [(voice, text)] turns.

    Maps each turn's ``role`` to an Azure voice via story ``voices`` (falling
    back to the default voice). Returns None for single-voice segments.
    """
    voices = story.get("voices") or {}
    for section in story["sections"]:
        if section["id"] != segment_id:
            continue
        turns = section.get("turns")
        if not turns:
            return None
        return [(voices.get(turn.get("role")), turn["text"]) for turn in turns]
    return None


def pause_after(index, segments):
    """Silence (ms) that follows narration item ``index`` (0-based).

    Derives the wind-down boundary from the segment ids so it stays correct
    regardless of leading items (intro / optional prologue).
    """
    is_wind_down = [sid.startswith("wind-down") for sid, _ in segments]
    first_wind_down = is_wind_down.index(True)
    next_index = index + 1
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


def concat_mp3s(entries, out_path):
    """ffmpeg-concat a list of MP3 paths into ``out_path`` (re-encoded uniformly)."""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as listing:
        for path in entries:
            listing.write(f"file '{Path(path).resolve()}'\n")
        list_path = listing.name
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


def synthesize_segment(story, segment_id, text, seg_path, seg_dir):
    """Render one narration segment to ``seg_path``.

    Multi-voice sections (those with ``turns``) are synthesized turn-by-turn —
    each turn in its mapped voice — and concatenated with a short gap; all other
    segments use the single default voice.
    """
    turns = section_turns(story, segment_id)
    if not turns:
        seg_path.write_bytes(server.synthesize(text))
        return
    turn_entries = []
    for i, (voice, turn_text) in enumerate(turns):
        turn_path = seg_dir / f"{segment_id}-t{i}.mp3"
        turn_path.write_bytes(server.synthesize(turn_text, voice))
        turn_entries.append(turn_path)
        if i < len(turns) - 1:
            turn_entries.append(ensure_silence(TURN_PAUSE_MS))
    concat_mp3s(turn_entries, seg_path)


def build_combined(story_id, segments, seg_dir, overrides=None, out_suffix=""):
    """ffmpeg-concat segment MP3s + silence into audio/<storyId>[.<suffix>].mp3.

    ``overrides`` maps segment_id -> a replacement mp3 path (used by name
    variants to swap only the goodnight segment); everything else reuses the
    default cached segments.
    """
    overrides = overrides or {}
    entries = []
    for index, (segment_id, _text) in enumerate(segments):
        entries.append(overrides.get(segment_id, seg_dir / f"{segment_id}.mp3"))
        if index < len(segments) - 1:
            entries.append(ensure_silence(pause_after(index, segments)))

    name = f"{story_id}.{out_suffix}.mp3" if out_suffix else f"{story_id}.mp3"
    out_path = AUDIO_ROOT / name
    return concat_mp3s(entries, out_path)


def main():
    parser = argparse.ArgumentParser(description="Pre-render bedtime narration to combined MP3.")
    parser.add_argument("stories", nargs="*", help="story ids to render (default: all available)")
    parser.add_argument("--force", action="store_true", help="re-synthesize segments and rebuild combined files")
    parser.add_argument("--name", help="念這個稱呼的晚安變體（取代預設「%s」），例如「光哥、阿築」" % DEFAULT_NAME)
    parser.add_argument("--suffix", help="變體檔名後綴＝網址 ?for= 代號，例如 gz → audio/<id>.gz.mp3")
    args = parser.parse_args()
    if args.name and not args.suffix:
        sys.exit("--name 需搭配 --suffix（網址代號，如 gz）")

    if not all(server.speech_config()):
        sys.exit("Azure Speech not configured: set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in bedtime/.env")
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg not found on PATH; required to stitch segments into one file")

    catalog = json.loads((BASE / "stories" / "catalog.json").read_text(encoding="utf-8"))
    story_ids = available_story_ids(catalog)
    if args.stories:
        available = set(story_ids)
        story_ids = []
        for sid in args.stories:
            if sid in available or (BASE / "stories" / f"{sid}.json").exists():
                if sid not in story_ids:
                    story_ids.append(sid)
            else:
                print(f"warning: story not found, skipping: {sid}")

    combined = 0
    total_bytes = 0
    for story_id in story_ids:
        story = json.loads((BASE / "stories" / f"{story_id}.json").read_text(encoding="utf-8"))
        segments = narration_segments(story)
        seg_dir = AUDIO_ROOT / story_id
        seg_dir.mkdir(parents=True, exist_ok=True)
        print(f"{story_id}: {story.get('title', '')}")

        for segment_id, text in segments:
            seg_path = seg_dir / f"{segment_id}.mp3"
            if seg_path.exists() and not args.force:
                continue
            synthesize_segment(story, segment_id, text, seg_path, seg_dir)
            print(f"  synth {segment_id}.mp3")

        if args.name:
            # Name variant: re-synth only the goodnight (swap the spoken name),
            # reuse every other cached segment, output audio/<id>.<suffix>.mp3.
            good_text = story["wind_down"]["goodnight"].replace(DEFAULT_NAME, args.name)
            var_good = seg_dir / f"wind-down-goodnight.{args.suffix}.mp3"
            if args.force or not var_good.exists():
                var_good.write_bytes(server.synthesize(good_text))
                print(f"  synth wind-down-goodnight.{args.suffix}.mp3")
            out_path = build_combined(
                story_id, segments, seg_dir,
                overrides={"wind-down-goodnight": var_good}, out_suffix=args.suffix,
            )
        else:
            out_path = build_combined(story_id, segments, seg_dir)
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
