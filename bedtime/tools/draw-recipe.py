#!/usr/bin/env python3
"""故事配方表：寫稿前先抽一張配方卡（零 token、純腳本）。

每篇故事「先抽配方、再照配方寫」，讓變化來自設計而非運氣。本工具讀取已存在
的故事，算出最近幾晚用過什麼，然後抽出一組**和最近不撞**的配方，並自動產生
「禁用元素」清單，輸出一張給 Codex 直接照著寫的配方卡。

切點（focus）由各週教學大綱給定（--facet），其餘軸自由抽。主角／場景自 2026-06
起全放開（不再鎖森林）。被強制不撞前一晚的軸：形狀／解決方式／主導感官／結尾句式
（與 check-bedtime-story.py 的硬閘一致）。

用法：
    python3 tools/draw-recipe.py --facet "犯錯後勇敢說出真相" --theme 誠實 --id week02
    python3 tools/draw-recipe.py --facet "..." --seed 7      # 可重現
    python3 tools/draw-recipe.py --facet "..." --write       # 同時寫 stories/recipes/<id>.md
"""
import argparse
import json
import random
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
STORIES = BASE / "stories"

SHAPES = {
    "旅程型": "出門遠行、一路過關",
    "相遇型": "兩人各做各的後相遇、化解小誤會",
    "等待型": "安靜守候一件事慢慢發生",
    "製作型": "一起動手做或修一個東西",
    "尋找型": "循線索找一個遺失的東西或聲音",
    "來訪型": "到別人的地方作客、靠對話推進",
    "變化型": "主角慢慢從一個狀態變成另一個",
    "守護型": "輕輕守護、照顧一個更小更弱的對象",
}
PROTAGONISTS = [
    "一隻怕黑的小刺蝟", "一個睡不著的小女孩", "一朵棉花雲", "一艘紙船",
    "一顆等待發芽的種子", "一隻迷你小火車", "一塊害羞的小餅乾", "一盞小檯燈精靈",
    "一隻想念朋友的小狐狸", "一片飄下來的落葉", "一隻布偶熊", "一滴小水珠",
    "一支愛畫畫的蠟筆", "一隻夜裡才醒的小貓頭鷹", "一個小小的鬧鐘精靈",
    "一隻慢吞吞的小烏龜", "一團毛線球", "一隻小章魚", "一把會唱歌的小雨傘",
    "一顆滾來滾去的小皮球", "一隻迷路的小螢火蟲", "一個圓圓的小月亮",
    "一隻穿雨鞋的小青蛙", "一片小小的雪花", "一隻紙摺的小鶴",
    "一個愛收集聲音的小貝殼", "一隻棉花糖小綿羊", "一台舊舊的小收音機",
]
SCENES = [
    "窗邊的月光花園", "廚房裡的星星餅乾店", "睡前的小臥室", "下雪的屋頂",
    "書頁之間的微小世界", "雲上的小陽台", "海邊的小燈塔", "抽屜裡的玩具城",
    "春雨後的小水窪", "夜晚的麵包店", "一列開往夢裡的小火車", "森林邊的小木屋",
    "閣樓上的舊鐘塔", "池塘邊的荷葉舞台", "月亮背面的小郵局", "沙灘上的貝殼小屋",
    "雨後的彩虹橋下", "一格一格的棋盤花園", "夜市尾端的小燈籠攤", "星星掉下來的草原",
    "圖書館深處的安靜角落", "會發光的蘑菇山洞", "屋頂水塔旁的小天台", "結霜的玻璃窗內側",
]
START_EMOTIONS = ["期待", "擔心", "害羞", "想念", "好奇", "緊張", "興奮", "孤單"]
MID_EMOTIONS = ["發現", "小混亂", "猶豫", "驚喜", "被理解", "鼓起勇氣", "慢慢明白"]
CALM_ENDS = ["放鬆", "安心", "滿足", "安穩", "暖暖的"]
RESOLUTIONS = ["觀察", "等待", "合作", "分享", "修補", "唱歌", "擁抱", "想像", "放下", "傾聽", "深呼吸"]
SENSES = ["視覺", "聽覺", "觸覺", "嗅覺", "味覺"]
COMPANIONS = [
    "一盞不會說話的小夜燈", "會打噴嚏的麵粉罐", "一隻安靜的螢火蟲", "一條舊圍巾",
    "一顆會發光的小石頭", "窗外的月亮", "一隻打瞌睡的小貓", "一個會回聲的空罐子",
    "一把溫柔的小掃帚", "一隻不會說話的紙鶴",
]
WIND_DOWN_STYLES = [
    "呼吸變慢、身體變暖、眼睛變重",
    "香味變淡、燈光變柔、聲音變小",
    "影子變短、月光變亮、心跳變慢",
    "動作變慢、被子變暖、世界變安靜",
    "顏色變淡、風變輕、念頭一個一個睡著",
]
ENDING_STYLES = {
    "願式": "雨芯，晚安。願～，做一個～的夢。",
    "比喻式": "雨芯，晚安。今晚就像～，～。",
    "物件呼應式": "雨芯，晚安。～（故事裡的物件）也～了，妳也～。",
    "身體放鬆式": "雨芯，晚安。讓～慢慢～，～地睡。",
    "明日式": "雨芯，晚安。～還在那裡等明天，先安心睡吧。",
}
ROTATION_AXES = ["shape", "resolution", "dominant_sense", "ending_style"]


def rotation_order():
    """Existing story dicts in catalog rotation order (those with files)."""
    catalog = json.loads((STORIES / "catalog.json").read_text(encoding="utf-8"))
    out = []
    for ep in catalog["episodes"]:
        for entry in ep.get("stories") or []:
            p = STORIES / f"{entry['id']}.json"
            if p.exists():
                d = json.loads(p.read_text(encoding="utf-8"))
                if not d.get("shape"):
                    continue  # skip pre-migration drafts (no recipe fields) — they shouldn't set context
                d["_id"] = entry["id"]
                out.append(d)
    return out


def pick(rng, options, avoid):
    allowed = [o for o in options if o not in avoid] or list(options)
    return rng.choice(allowed)


def main():
    ap = argparse.ArgumentParser(description="抽一張故事配方卡")
    ap.add_argument("--facet", required=True, help="本篇切點（教學角度）")
    ap.add_argument("--theme", default="", help="本週核心詞，例如 誠實")
    ap.add_argument("--id", default="weekNN-x", help="故事 id，用於輸出檔名")
    ap.add_argument("--seed", type=int, default=None, help="可重現的隨機種子")
    ap.add_argument("--write", action="store_true", help="同時寫到 stories/recipes/<id>.md")
    args = ap.parse_args()
    rng = random.Random(args.seed)

    history = rotation_order()
    recent = history[-2:]                      # 最近兩晚：用來算禁用元素
    prev = history[-1] if history else {}      # 前一晚：四軸不可撞

    shape = pick(rng, list(SHAPES), {prev.get("shape")})
    resolution = pick(rng, RESOLUTIONS, {prev.get("resolution")})
    sense = pick(rng, SENSES, {prev.get("dominant_sense")})
    ending = pick(rng, list(ENDING_STYLES), {prev.get("ending_style")})
    protagonist = pick(rng, PROTAGONISTS, {h.get("protagonist") for h in recent})
    scene = pick(rng, SCENES, {h.get("scene") for h in recent})
    companion = rng.choice(COMPANIONS)
    emo = f"{rng.choice(START_EMOTIONS)} → {rng.choice(MID_EMOTIONS)} → {rng.choice(CALM_ENDS)}"
    wind = rng.choice(WIND_DOWN_STYLES)

    # 禁用元素：自動帶入最近兩晚的形狀動作 / 場景 / 主角，逼這篇岔開
    forbidden = []
    for h in recent:
        if h.get("shape") in SHAPES:
            forbidden.append(f"不要{SHAPES[h['shape']]}")
        if h.get("scene"):
            forbidden.append(f"不要重複場景「{h['scene']}」")
    forbidden.append("不要和前兩晚用同一種解決方式或結尾句式")
    forbidden = list(dict.fromkeys(forbidden))  # 去重、保序

    card = f"""# 故事配方卡 — {args.id}（{args.theme}）

- 切點（focus，固定）：{args.facet}
- 故事形狀：{shape}（{SHAPES[shape]}）
- 主角：{protagonist}
- 場景：{scene}
- 情緒曲線：{emo}
- 核心事件：（依切點自填一句：今晚發生什麼小事）
- 解決方式：{resolution}
- 陪伴角色：{companion}
- 主導感官：{sense}
- 睡前收束：{wind}
- 結尾句式：{ending}  → 範式「{ENDING_STYLES[ending]}」
- 禁用元素：
""" + "\n".join(f"  - {x}" for x in forbidden) + f"""

> 寫法提醒：道理只放 prologue（明講 2–3 句）；正文以對白演出、旁白只接場景；
> 聲線 narrator/mimi/dodo（第二個會說話的女生用 girl2）；結尾須照「{ending}」句式，
> 不可又用成別篇的願式套路。寫完跑 `python3 tools/check-bedtime-story.py {args.id}`。
"""
    print(card)
    if args.write:
        out = STORIES / "recipes" / f"{args.id}.md"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(card, encoding="utf-8")
        print(f"\n（已寫入 {out.relative_to(BASE)}）")


if __name__ == "__main__":
    main()
