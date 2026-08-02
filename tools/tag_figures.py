#!/usr/bin/env python3
"""為 curriculum/math-g1-school.json 的每個技能標上圖形需求等級。

等級定義：
  none      不需要圖，純數字或純文字題
  param     參數化 SVG，幾十行就能畫（時鐘、數線、月曆、長條圖、點群、線段、定位板、十格框）
  grid      格線／多邊形組合，需要拼砌與干擾選項邏輯（拼砌、分割、七巧板、複合圖形）
  asset     需要現成素材圖（立體實物、生活情境圖），程式畫不出來或畫了也不像
"""

import json
import pathlib
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parent.parent
PATH = ROOT / "curriculum" / "math-g1-school.json"

# 只列非 param 的；其餘一律 param（多數技能都要圖，且都是參數化畫得出來的）
NONE = {
    "G1-03-01", "G1-04-01",
    "G1-06-02", "G1-06-03", "G1-06-04",
    "G1-07-02", "G1-07-03",
    "G1-08-03", "G1-08-04", "G1-08-05",
    "G1-10-01", "G1-10-03",
    "G1-12-03",
    "G1-13-03", "G1-13-08", "G1-13-09", "G1-13-10",
    "G1-15-04",
    "G1-16-01", "G1-16-03", "G1-16-04",
}
GRID = {
    "G1-05-04", "G1-05-05",
    "G1-14-01", "G1-14-02", "G1-14-03", "G1-14-04",
}
ASSET = {
    "G1-05-01",  # 認識立體圖形（球/圓柱/正方體/長方體/圓錐實物感）
    "G1-05-03",  # 生活中的平面圖形（真實物品照片或插圖）
    "G1-09-04",  # 一天中不同時刻事件的適當性（生活情境圖）
}

# 已有現成畫法可直接沿用的來源
SOURCE = {
    "G1-05-01": "Bobo math_diagram_kit: solid_shape",
    "G1-05-04": "index.html 現有 mkSVG/cell/gap（奧數補合題）",
    "G1-05-05": "index.html 現有 mkSVG/cell/gap",
    "G1-14-01": "index.html 現有 mkSVG/cell/gap",
    "G1-14-02": "index.html 現有 mkSVG/cell/gap",
    "G1-14-03": "index.html 現有 mkSVG/cell/gap",
    "G1-17-01": "Bobo math_diagram_kit: bar",
    "G1-17-02": "Bobo math_diagram_kit: bar（橫向）",
    "G1-02-02": "Bobo math_diagram_kit: segment_compare",
    "G1-02-06": "Bobo math_diagram_kit: segment_compare",
    "G1-13-04": "Bobo math_diagram_kit: number_line",
}


def main():
    data = json.loads(PATH.read_text(encoding="utf-8"))
    tally = Counter()

    for chapter in data["chapters"]:
        for skill in chapter["skills"]:
            sid = skill["skillId"]
            if sid in NONE:
                level = "none"
            elif sid in GRID:
                level = "grid"
            elif sid in ASSET:
                level = "asset"
            else:
                level = "param"
            skill["figure"] = level
            if sid in SOURCE:
                skill["figureSource"] = SOURCE[sid]
            tally[level] += 1

    data["_meta"]["figureLoad"] = {
        "none": tally["none"],
        "param": tally["param"],
        "grid": tally["grid"],
        "asset": tally["asset"],
        "note": "none=無圖；param=參數化SVG；grid=格線拼砌；asset=需素材圖。"
                "param 走 index.html 既有 mkSVG 模式或移植 Bobo tools/math_diagram_kit。",
    }

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    total = sum(tally.values())
    need = total - tally["none"]
    print(f"總技能 {total}｜需要圖 {need} ({need/total:.0%})")
    for level in ("none", "param", "grid", "asset"):
        print(f"  {level:6} {tally[level]:3}")
    print(f"真正要新寫繪圖邏輯的只有 grid+asset = {tally['grid'] + tally['asset']} 個")


if __name__ == "__main__":
    main()
