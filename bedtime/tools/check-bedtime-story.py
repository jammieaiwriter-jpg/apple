#!/usr/bin/env python3
"""Deterministic validator for the new bedtime-story format (no LLM, no tokens).

Runs all the *mechanical* hard checks so that Codex (writing) and Claude
(reviewing) never spend tokens catching structural mistakes — Claude's review
is then only about writing quality (the rubric's 8 dimensions).

What it checks per story JSON (see docs/format-revamp-handoff.md):
  - required top-level fields incl. new ones: shape / prologue / voices
  - shape is one of the six allowed story shapes
  - voices maps narrator/mimi/dodo to the locked Azure voices
  - exactly 6 sections, each with an id
  - multi-voice sections: every turn.role is declared in voices, and the flat
    section `text` is EXACTLY the concatenation of the turns' text
  - wind_down has scene/breath/goodnight; weekend_prompts has 2 entries
  - focus is one of the owning week's catalog facets
  - shape != the shape of the previous story in the week's rotation order
  - (if audio/<id>.mp3 exists) duration is within 8-10 min, else a warning

Usage (run from bedtime/, or anywhere — paths resolve relative to this file):
    python3 tools/check-bedtime-story.py             # all stories in catalog
    python3 tools/check-bedtime-story.py week01-2b    # only listed ids
    python3 tools/check-bedtime-story.py --strict     # warnings also fail

Exit code 0 = all checked stories pass; 1 = at least one failed.
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
STORIES = BASE / "stories"
AUDIO = BASE / "audio"

SHAPES = {"旅程型", "相遇型", "等待型", "製作型", "尋找型", "來訪型", "變化型", "守護型"}
SENSES = {"視覺", "聽覺", "觸覺", "嗅覺", "味覺"}
ENDING_STYLES = {"願式", "比喻式", "物件呼應式", "身體放鬆式", "明日式"}
# Axes that must differ from the previous night in the rotation (within + cross week).
ROTATION_AXES = ["shape", "resolution", "dominant_sense", "ending_style"]
# Required in every story.
VOICES = {
    "narrator": "zh-TW-HsiaoChenNeural",
    "mimi": "zh-CN-XiaoshuangNeural",
    "dodo": "zh-CN-YunxiaNeural",
}
# Optional roles (used only when a story needs them), still pinned to one voice.
OPTIONAL_VOICES = {
    "girl2": "zh-CN-XiaoyiNeural",  # second girl, distinct from mimi
}
LOCKED_VOICES = {**VOICES, **OPTIONAL_VOICES}
DURATION_MIN_S = 7 * 60 + 30   # ~8 min target, small grace under (don't fail on a few seconds)
DURATION_MAX_S = 10 * 60 + 30  # small grace over 10:00


def load_catalog():
    return json.loads((STORIES / "catalog.json").read_text(encoding="utf-8"))


def story_index(catalog):
    """Map story id -> (episode, facets, rotation_prev_id).

    ``prev_id`` carries across episode boundaries so the shape-adjacency check
    also catches the cross-week seam (last night of one theme → first night of
    the next), which the child hears on consecutive nights.
    """
    index = {}
    prev = None
    for ep in catalog["episodes"]:
        entries = ep.get("stories")
        if not entries:
            continue  # planning-only week, no story files yet
        facets = set(ep.get("facets") or [])
        for entry in entries:
            sid = entry.get("id")
            if sid:
                index[sid] = {"episode": ep, "facets": facets, "prev_id": prev}
                prev = sid
    return index


def mp3_duration_s(story_id):
    path = AUDIO / f"{story_id}.mp3"
    if not path.exists() or not shutil.which("ffprobe"):
        return None
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True,
    )
    try:
        return float(out.stdout.strip())
    except ValueError:
        return None


def check_story(sid, index, loaded):
    """Return (errors, warnings) lists for one story id."""
    errs, warns = [], []
    path = STORIES / f"{sid}.json"
    if not path.exists():
        return [f"檔案不存在：{path.name}"], []
    try:
        s = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return [f"JSON 解析失敗：{e}"], []
    loaded[sid] = s

    # top-level required fields
    if s.get("schema_version") != 2:
        errs.append("schema_version 必須為 2")
    for f in ("id", "title", "intro", "review_status", "review_note"):
        if not s.get(f):
            errs.append(f"缺少欄位：{f}")
    if s.get("id") != sid:
        errs.append(f"id（{s.get('id')}）與檔名（{sid}）不符")
    for tw in s.get("theme_word") or []:
        if not tw.get("char") or not tw.get("zhuyin"):
            errs.append("theme_word 每字需含 char 與 zhuyin")

    # new-format fields
    shape = s.get("shape")
    if shape not in SHAPES:
        errs.append(f"shape 必須為六形狀之一，目前：{shape!r}")
    if not (s.get("prologue") or "").strip():
        errs.append("缺少 prologue（點題前言）")
    # recipe axes (故事配方表) — declared per story before writing
    for f in ("emotion_arc", "resolution", "protagonist", "scene"):
        if not (s.get(f) or "").strip():
            errs.append(f"缺少配方欄位：{f}")
    if s.get("dominant_sense") not in SENSES:
        errs.append(f"dominant_sense 必須為五感之一，目前：{s.get('dominant_sense')!r}")
    if s.get("ending_style") not in ENDING_STYLES:
        errs.append(f"ending_style 必須為定案五句式之一，目前：{s.get('ending_style')!r}")
    voices = s.get("voices") or {}
    for role, want in VOICES.items():
        if role not in voices:
            errs.append(f"voices 缺少角色：{role}")
        elif voices[role] != want:
            warns.append(f"voices.{role} = {voices[role]}（定案為 {want}）")
    for role, voice in voices.items():
        if role in LOCKED_VOICES and voice != LOCKED_VOICES[role]:
            warns.append(f"voices.{role} = {voice}（定案為 {LOCKED_VOICES[role]}）")

    # sections
    sections = s.get("sections") or []
    if len(sections) != 6:
        errs.append(f"sections 必須正好 6 段，目前 {len(sections)} 段")
    for i, sec in enumerate(sections, 1):
        if not sec.get("id"):
            errs.append(f"第 {i} 段缺少 id")
        turns = sec.get("turns")
        if turns:
            for j, t in enumerate(turns):
                if t.get("role") not in voices:
                    errs.append(f"第 {i} 段第 {j} 輪 role={t.get('role')!r} 未在 voices 宣告")
            joined = "".join(t.get("text", "") for t in turns)
            if joined != sec.get("text", ""):
                errs.append(f"第 {i} 段（{sec.get('id')}）text 不等於 turns 串接")
        elif not (sec.get("text") or "").strip():
            errs.append(f"第 {i} 段缺少 text")

    # wind_down + weekend_prompts
    wd = s.get("wind_down") or {}
    for f in ("scene", "breath", "goodnight"):
        if not wd.get(f):
            errs.append(f"wind_down 缺少 {f}")
    wp = s.get("weekend_prompts") or []
    if len(wp) != 2:
        errs.append(f"weekend_prompts 必須 2 則，目前 {len(wp)} 則")

    # focus within week facets + shape adjacency
    meta = index.get(sid)
    if not meta:
        warns.append("不在 catalog.json 的任何 episode（無法檢查 focus／形狀輪替）")
    else:
        if s.get("focus") not in meta["facets"]:
            errs.append(f"focus（{s.get('focus')!r}）不在本週 facets")
        prev_id = meta["prev_id"]
        if prev_id and prev_id in loaded:
            prev = loaded[prev_id]
            for axis in ROTATION_AXES:
                cur, pre = s.get(axis), prev.get(axis)
                if cur and pre and cur == pre:
                    errs.append(f"{axis} 與輪播前一晚（{prev_id}）相同：{cur}")
        elif prev_id:
            warns.append(f"前一晚（{prev_id}）尚未載入或未遷移，無法比對輪替軸")

    # duration (only if rendered)
    dur = mp3_duration_s(sid)
    if dur is None:
        warns.append("尚無 audio/<id>.mp3，無法檢查時長（合成後再驗）")
    elif not (DURATION_MIN_S <= dur <= DURATION_MAX_S):
        errs.append(f"時長 {int(dur//60)}:{int(dur%60):02d} 不在 8–10 分鐘")

    return errs, warns


def main():
    ap = argparse.ArgumentParser(description="Validate bedtime story JSON (new format).")
    ap.add_argument("stories", nargs="*", help="story ids (default: all in catalog rotation order)")
    ap.add_argument("--strict", action="store_true", help="warnings also cause failure")
    args = ap.parse_args()

    catalog = load_catalog()
    index = story_index(catalog)
    # default: every catalog id that actually has a story file (skip planning-only weeks)
    ids = args.stories or [sid for sid in index if (STORIES / f"{sid}.json").exists()]

    loaded = {}
    # pre-load so shape-adjacency can see the previous story even when checking one id
    for sid in index:
        p = STORIES / f"{sid}.json"
        if p.exists():
            try:
                loaded[sid] = json.loads(p.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                pass

    failed = 0
    for sid in ids:
        errs, warns = check_story(sid, index, loaded)
        if errs or (args.strict and warns):
            failed += 1
            print(f"✗ {sid}")
        else:
            print(f"✓ {sid}")
        for e in errs:
            print(f"    ERROR  {e}")
        for w in warns:
            print(f"    warn   {w}")

    total = len(ids)
    print(f"\n{total - failed}/{total} 通過。" + ("" if not failed else f" {failed} 篇需修。"))
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
