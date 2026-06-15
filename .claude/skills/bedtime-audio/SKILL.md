---
name: bedtime-audio
description: >-
  Regenerate and deploy the bedtime story narration audio. Use whenever a story
  JSON is written/edited, the pauses or voice change, a polyphone/tone is fixed,
  or the user asks to 重新產生/合成音檔, 上音檔, 換新聲音, deploy the bedtime voice, or
  publish a story to GitHub Pages. Pipeline: story JSON + Azure Neural →
  one combined MP3 per story (pauses baked in) → commit → GitHub Pages.
---

# Bedtime story audio (JSON + Azure → one MP3 per story)

Project: `bedtime/` in repo `jammieaiwriter-jpg/apple`. Live site is GitHub
Pages (static, no backend): <https://jammieaiwriter-jpg.github.io/apple/bedtime/>.

## Architecture (why it is this way)

- GitHub Pages cannot run `server.py`, so `/api/tts` does not exist there. The
  page plays a **single pre-rendered file per story**, `audio/<storyId>.mp3`.
- One continuous audio file is what lets iOS Safari keep playing on the lock
  screen / in the background; segment-by-segment JS playback stalls when locked.
- Section pauses are **baked into the file as silence** (0.9 / 1.9 / 2.3 s), so
  there are no runtime pause constants and no between-segment download gaps.
- Front-end (`index.html`, `week02.html`) plays `audio/<storyId>.mp3`, saves
  progress as `audio.currentTime`, sets `MediaSession`, and falls back to
  browser `speechSynthesis` only if the file fails to load.

## Regenerate audio

Requires `ffmpeg` and `bedtime/.env` (holds `AZURE_SPEECH_KEY` / `_REGION`;
never print or commit the key).

```bash
cd bedtime
python3 tools/generate-bedtime-audio.py            # all available stories
python3 tools/generate-bedtime-audio.py week01     # only listed stories
python3 tools/generate-bedtime-audio.py --force    # re-synthesize + rebuild (use after text/pronunciation changes)
```

Two stages: (1) `server.synthesize` renders each narration segment (intro →
sections → wind-down) with identical SSML / voice `zh-TW-HsiaoChenNeural` /
`rate="-15%" pitch="-2%"`, cached under `audio/<storyId>/`; (2) ffmpeg stitches
segments + silence into `audio/<storyId>.mp3`.

Only `audio/<storyId>.mp3` is committed; `audio/<storyId>/` and `audio/.silence/`
are git-ignored intermediates.

## Polyphone / tone fixes

Edit `PRONUNCIATIONS` in `bedtime/server.py` (shared by the proxy and the
generator, so one change covers both). The zh-TW `sapi` alphabet takes
**Zhuyin/Bopomofo, not Pinyin**:

```python
(re.compile(r"(?<!字)數(?![量學])"), '<phoneme alphabet="sapi" ph="ㄕㄨˇ">數</phoneme>'),
```

Pinyin (`ph="shu3"`) returns HTTP 400. After adding a fix, `--force` the
affected stories and have an adult listen to confirm the tone.

## Deploy

The live site builds from the `main` branch at `/`. Commit `audio/<id>.mp3`
(plus any code/doc changes) and push to `main`; GitHub Pages rebuilds in ~1 min.

```bash
# verify it went live
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
  https://jammieaiwriter-jpg.github.io/apple/bedtime/audio/<storyId>.mp3
```

## Verify before deploy

Serve statically (no backend, mimics Pages) and confirm it plays the file, not
the browser fallback:

```bash
cd bedtime && python3 -m http.server 8123   # then load http://localhost:8123
```

A combined story runs ~10–11 min — over Azure's single-request limit, which is
exactly why audio is stitched per-segment rather than synthesized in one call.
Program checks only confirm Azure accepts the SSML; an adult must still audition
the published URL (see `docs/azure-neural-narration-handoff.md`).
