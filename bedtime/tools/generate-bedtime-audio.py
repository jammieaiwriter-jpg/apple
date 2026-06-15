#!/usr/bin/env python3
"""Pre-render bedtime story narration to static MP3 files.

GitHub Pages can only serve static files, so it cannot run the ``/api/tts``
Azure proxy in ``server.py``. This script calls Azure once per narration
segment and writes the audio to ``audio/<storyId>/<segmentId>.mp3`` so the
static site can play the real ``zh-TW-HsiaoChenNeural`` voice with no backend.

It reuses ``server.synthesize`` so the SSML, voice, prosody (rate -15%,
pitch -2%) and audio format are byte-for-byte identical to the Render proxy.

Usage (run from the ``bedtime`` directory, or anywhere — paths are resolved
relative to this file):

    python3 tools/generate-bedtime-audio.py            # all available stories
    python3 tools/generate-bedtime-audio.py week01     # only listed stories
    python3 tools/generate-bedtime-audio.py --force    # re-render even if file exists

The Azure key is read from ``bedtime/.env`` (AZURE_SPEECH_KEY / _REGION) and
is never written to disk or printed.
"""
import argparse
import json
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent

sys.path.insert(0, str(BASE))
import server  # noqa: E402  (reuses load_local_env / synthesize / Azure config)

# server.load_local_env() already ran at import using the process CWD; load the
# bedtime/.env explicitly so the script works regardless of where it is invoked.
server.load_local_env(str(BASE / ".env"))


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


def main():
    parser = argparse.ArgumentParser(description="Pre-render bedtime narration to MP3.")
    parser.add_argument("stories", nargs="*", help="story ids to render (default: all available)")
    parser.add_argument("--force", action="store_true", help="re-render even if the MP3 already exists")
    args = parser.parse_args()

    if not all(server.speech_config()):
        sys.exit("Azure Speech not configured: set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in bedtime/.env")

    catalog = json.loads((BASE / "stories" / "catalog.json").read_text(encoding="utf-8"))
    story_ids = available_story_ids(catalog)
    if args.stories:
        wanted = set(args.stories)
        missing = wanted - set(story_ids)
        if missing:
            print(f"warning: not in available catalog, skipping: {', '.join(sorted(missing))}")
        story_ids = [sid for sid in story_ids if sid in wanted]

    audio_root = BASE / "audio"
    total = generated = skipped = 0
    total_bytes = 0
    for story_id in story_ids:
        story = json.loads((BASE / "stories" / f"{story_id}.json").read_text(encoding="utf-8"))
        out_dir = audio_root / story_id
        out_dir.mkdir(parents=True, exist_ok=True)
        print(f"{story_id}: {story.get('title', '')}")
        for segment_id, text in narration_segments(story):
            total += 1
            out_path = out_dir / f"{segment_id}.mp3"
            if out_path.exists() and not args.force:
                skipped += 1
                continue
            audio = server.synthesize(text)
            out_path.write_bytes(audio)
            generated += 1
            total_bytes += len(audio)
            print(f"  {segment_id}.mp3  ({len(audio):,} bytes)")

    print(
        f"\ndone: {generated} rendered, {skipped} skipped, {total} segments "
        f"across {len(story_ids)} stories ({total_bytes / 1_048_576:.1f} MB written)"
    )


if __name__ == "__main__":
    main()
