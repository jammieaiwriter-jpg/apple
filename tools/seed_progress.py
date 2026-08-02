#!/usr/bin/env python3
"""從 curriculum/*.json 產生或補齊 progress.json。

已存在的技能紀錄不會被覆蓋（只補新技能、補新欄位），
所以之後加小二課綱或改課綱時可以重跑，不會清掉 Apple 的練習進度。

用法：
    python3 tools/seed_progress.py            # 補齊
    python3 tools/seed_progress.py --dry-run  # 只看會動到什麼
"""

import argparse
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CURRICULUM_DIR = ROOT / "curriculum"
PROGRESS_PATH = ROOT / "progress.json"

# 一筆技能紀錄的完整欄位與預設值
SKILL_DEFAULTS = {
    "attempts": 0,           # 總作答次數
    "correctFirstTry": 0,    # 首次作答就正確的次數
    "usedHint": 0,           # 用過提示的次數
    "currentStreak": 0,      # 目前連續「首次正確且無提示」的題數
    "perfectRuns": 0,        # 完美通關次數（currentStreak 達 10 即 +1 並歸零）
    "mastered": False,       # perfectRuns >= 10
    "unlocked": False,       # 是否已進入題池
    "lastPracticed": None,
    "nextReview": None,
}

DEFAULT_META = {
    "student": "Apple",
    "schemaVersion": 1,
    "masteryRule": {
        "perfectRunLength": 10,
        "perfectRunsToMaster": 10,
        "note": "連續 10 題『首次作答正確且全程無提示』＝ 1 次完美通關；"
                "累積 10 次完美通關即 mastered，永久撤出題池。"
                "答錯、看提示、看答案三者都會讓 currentStreak 歸零。",
    },
    "daily": {
        "quota": 12,
        "newSkills": 6,
        "review": 3,
        "mistakes": 3,
        "note": "錯題池空時，mistakes 配額讓給 review，不硬湊。",
    },
    "streak": {"current": 0, "longest": 0, "lastDone": None},
    "pointer": {"school": None},
}


def load_curriculum():
    """讀 curriculum/ 下所有課綱檔，攤平成技能清單。

    curriculum/ 底下也放了非課綱的設定檔（如 figure-specs.json），
    用有沒有 "chapters" 這個頂層欄位分辨，不是課綱檔就跳過。
    """
    skills = []
    for path in sorted(CURRICULUM_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if "chapters" not in data:
            continue
        meta = data["_meta"]
        for chapter in data["chapters"]:
            for skill in chapter["skills"]:
                skills.append({
                    "skillId": skill["skillId"],
                    "track": meta["track"],
                    "subject": meta["subject"],
                    "grade": meta["grade"],
                    "chapterId": chapter["chapterId"],
                    "chapter": chapter["name"],
                    "semester": chapter["semester"],
                    "chapterOrder": chapter["order"],
                    "skillName": skill["name"],
                    "mode": skill["mode"],
                    "difficulty": skill["difficulty"],
                })
    return skills


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    curriculum = load_curriculum()
    if not curriculum:
        sys.exit(f"找不到課綱檔：{CURRICULUM_DIR}")

    if PROGRESS_PATH.exists():
        progress = json.loads(PROGRESS_PATH.read_text(encoding="utf-8"))
    else:
        progress = {"_meta": DEFAULT_META, "skills": [], "mistakePool": []}

    progress.setdefault("_meta", DEFAULT_META)
    progress.setdefault("skills", [])
    progress.setdefault("mistakePool", [])

    existing = {s["skillId"]: s for s in progress["skills"]}
    added, updated = [], []

    for item in curriculum:
        record = existing.get(item["skillId"])
        if record is None:
            record = dict(item)
            record.update(SKILL_DEFAULTS)
            existing[item["skillId"]] = record
            added.append(item["skillId"])
            continue
        # 課綱端欄位以課綱為準（改名、換模式、調難度時同步過來）
        changed = [k for k, v in item.items() if record.get(k) != v]
        record.update(item)
        # 補上後來才加的統計欄位
        for key, default in SKILL_DEFAULTS.items():
            if key not in record:
                record[key] = default
                changed.append(key)
        if changed:
            updated.append((item["skillId"], sorted(set(changed))))

    # 依課綱順序排列
    order = {item["skillId"]: i for i, item in enumerate(curriculum)}
    progress["skills"] = sorted(existing.values(), key=lambda s: order.get(s["skillId"], 10**6))

    # 指標：第一個還沒精熟的技能
    pointer = next((s["skillId"] for s in progress["skills"]
                    if s["track"] == "school" and not s["mastered"]), None)
    progress["_meta"].setdefault("pointer", {})["school"] = pointer

    print(f"課綱技能 {len(curriculum)} 筆｜新增 {len(added)}｜更新 {len(updated)}")
    for skill_id, fields in updated:
        print(f"  更新 {skill_id}: {', '.join(fields)}")
    print(f"目前指標 school → {pointer}")

    if args.dry_run:
        print("(dry-run，未寫檔)")
        return

    PROGRESS_PATH.write_text(
        json.dumps(progress, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"已寫入 {PROGRESS_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
