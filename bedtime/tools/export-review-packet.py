#!/usr/bin/env python3
"""Export low-token packets for bedtime story review and planning.

The story JSON intentionally stores both ``sections[].turns`` and the flattened
``sections[].text`` for runtime fallback. Reviewers do not need both copies.
This tool emits a compact packet that keeps the role turns and omits duplicate
flat text, and can also rebuild ``stories/story-index.json`` for cross-story
variation checks without loading full story bodies into an LLM prompt.

Usage:
    python3 tools/export-review-packet.py week05-5
    python3 tools/export-review-packet.py week05-5 --format json
    python3 tools/export-review-packet.py --write-index
    python3 tools/export-review-packet.py --index-only
"""
import argparse
import json
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
STORIES = BASE / "stories"
CATALOG_PATH = STORIES / "catalog.json"
INDEX_PATH = STORIES / "story-index.json"

DESIGN_FIELDS = [
    "shape",
    "protagonist",
    "scene",
    "emotion_arc",
    "resolution",
    "dominant_sense",
    "ending_style",
]


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def dump_json(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def story_path(story_id):
    return STORIES / f"{story_id}.json"


def catalog_entries(catalog):
    for episode in catalog["episodes"]:
        entries = episode.get("stories") or []
        if entries:
            for index, entry in enumerate(entries, 1):
                yield episode, entry, index
        else:
            yield episode, {
                "id": episode.get("id"),
                "title": episode.get("title"),
                "focus": None,
                "status": episode.get("status"),
                "available": episode.get("available", False),
            }, 1


def text_from_section(section):
    turns = section.get("turns") or []
    if turns:
        return "".join(turn.get("text", "") for turn in turns)
    return section.get("text", "")


def story_text_chars(story):
    return sum(len(text_from_section(section)) for section in story.get("sections") or [])


def compact_section(section):
    out = {"id": section.get("id")}
    turns = section.get("turns") or []
    if turns:
        out["turns"] = [
            {"role": turn.get("role"), "text": turn.get("text", "")}
            for turn in turns
        ]
    else:
        out["text"] = section.get("text", "")
    return out


def load_story(story_id):
    path = story_path(story_id)
    if not path.exists():
        raise FileNotFoundError(f"story not found: stories/{story_id}.json")
    return read_json(path)


def find_catalog_meta(story_id, catalog):
    for episode, entry, index in catalog_entries(catalog):
        if entry.get("id") == story_id:
            return episode, entry, index
    return None, None, None


def review_packet(story_id, catalog):
    story = load_story(story_id)
    episode, entry, index = find_catalog_meta(story_id, catalog)
    packet = {
        "packet_type": "bedtime_review_packet_v1",
        "id": story_id,
        "title": story.get("title"),
        "week": episode.get("week") if episode else None,
        "theme": episode.get("theme") if episode else None,
        "focus": story.get("focus") or (entry or {}).get("focus"),
        "catalog_status": (entry or {}).get("status"),
        "review_status": story.get("review_status"),
        "available": (entry or {}).get("available"),
        "story_order_in_week": index,
        "theme_word": story.get("theme_word") or [],
        "design": {field: story.get(field) for field in DESIGN_FIELDS if story.get(field)},
        "voices": story.get("voices") or {},
        "intro": story.get("intro"),
        "prologue": story.get("prologue"),
        "sections": [compact_section(section) for section in story.get("sections") or []],
        "wind_down": story.get("wind_down") or {},
        "weekend_prompts": story.get("weekend_prompts") or [],
        "review_note": story.get("review_note"),
        "metrics": {
            "section_count": len(story.get("sections") or []),
            "section_text_chars": story_text_chars(story),
            "omitted_duplicate_fields": ["sections[].text when sections[].turns exists"],
        },
    }
    return packet


def tail_snippet(text, limit=90):
    text = " ".join((text or "").split())
    if len(text) <= limit:
        return text
    return text[-limit:]


def index_entry(episode, entry, order):
    story_id = entry.get("id")
    path = story_path(story_id) if story_id else None
    story = read_json(path) if path and path.exists() else None
    facets = episode.get("facets") or []

    out = {
        "id": story_id,
        "week": episode.get("week"),
        "theme": episode.get("theme"),
        "week_title": episode.get("title"),
        "story_order_in_week": order,
        "title": (story or entry).get("title"),
        "focus": (story or entry).get("focus"),
        "status": entry.get("status") or episode.get("status"),
        "available": bool(entry.get("available", episode.get("available", False))),
        "facet_index": (facets.index((story or entry).get("focus")) + 1)
        if (story or entry).get("focus") in facets else None,
    }
    if not story:
        out["file"] = "missing" if story_id else "planned"
        return out

    for field in DESIGN_FIELDS:
        if story.get(field):
            out[field] = story[field]
    if story.get("review_status"):
        out["review_status"] = story["review_status"]
    if story.get("voices"):
        out["voice_roles"] = sorted(story["voices"])
    sections = story.get("sections") or []
    if sections:
        out["section_ids"] = [section.get("id") for section in sections if section.get("id")]
        out["section_text_chars"] = story_text_chars(story)
        out["ending_image_hint"] = tail_snippet(text_from_section(sections[-1]))
    wind_down = story.get("wind_down") or {}
    if wind_down.get("scene"):
        out["wind_down_scene_hint"] = tail_snippet(wind_down["scene"], 70)
    if story.get("weekend_prompts"):
        out["weekend_prompt_count"] = len(story["weekend_prompts"])
    return out


def build_story_index(catalog):
    stories = [
        index_entry(episode, entry, order)
        for episode, entry, order in catalog_entries(catalog)
    ]
    return {
        "schema_version": 1,
        "generated_by": "tools/export-review-packet.py --index-only",
        "source": "stories/catalog.json + per-story metadata only",
        "purpose": "Low-token cross-story variation index for drafting; omits full prose.",
        "stories": stories,
    }


def markdown_packet(packet):
    lines = [
        f"# 省 token 審稿包 — {packet['id']}《{packet.get('title') or ''}》",
        "",
        "## 基本資料",
        f"- 週次／主題：{packet.get('week') or '未列入 catalog'}／{packet.get('theme') or '未知'}",
        f"- 切點：{packet.get('focus') or '未標示'}",
        f"- 狀態：catalog={packet.get('catalog_status')}; review={packet.get('review_status')}",
        f"- 正文段數／字數：{packet['metrics']['section_count']} 段／{packet['metrics']['section_text_chars']} 字",
        "",
        "## 故事設計",
    ]
    for key, value in packet["design"].items():
        lines.append(f"- {key}: {value}")
    if packet.get("prologue"):
        lines.extend(["", "## Prologue", packet["prologue"]])
    lines.extend(["", "## Sections"])
    for index, section in enumerate(packet["sections"], 1):
        lines.append(f"### {index}. {section.get('id')}")
        if "turns" in section:
            for turn in section["turns"]:
                lines.append(f"- {turn.get('role')}: {turn.get('text')}")
        else:
            lines.append(section.get("text", ""))
        lines.append("")
    wind_down = packet.get("wind_down") or {}
    lines.extend([
        "## Wind Down",
        f"- scene: {wind_down.get('scene', '')}",
        f"- breath: {wind_down.get('breath', '')}",
        f"- goodnight: {wind_down.get('goodnight', '')}",
        "",
        "## Weekend Prompts",
    ])
    for prompt in packet.get("weekend_prompts") or []:
        lines.append(f"- {prompt}")
    if packet.get("review_note"):
        lines.extend(["", "## Review Note", packet["review_note"]])
    lines.extend([
        "",
        "## Token Note",
        "- 已省略每段重複的 flattened `sections[].text`；多聲線段落只保留 `turns`。",
    ])
    return "\n".join(lines).rstrip() + "\n"


def main():
    parser = argparse.ArgumentParser(description="Export low-token bedtime review packets.")
    parser.add_argument("story_id", nargs="?", help="story id, e.g. week05-5")
    parser.add_argument("--format", choices=("markdown", "json"), default="markdown")
    parser.add_argument("--write-index", action="store_true", help="rebuild stories/story-index.json")
    parser.add_argument("--index-only", action="store_true", help="only rebuild stories/story-index.json")
    args = parser.parse_args()

    catalog = read_json(CATALOG_PATH)

    if args.write_index or args.index_only:
        INDEX_PATH.write_text(dump_json(build_story_index(catalog)), encoding="utf-8")
        print(f"wrote {INDEX_PATH.relative_to(BASE)}", file=sys.stderr)

    if args.index_only:
        return
    if not args.story_id:
        parser.error("story_id is required unless --index-only is used")

    packet = review_packet(args.story_id, catalog)
    if args.format == "json":
        print(dump_json(packet), end="")
    else:
        print(markdown_packet(packet), end="")


if __name__ == "__main__":
    main()
