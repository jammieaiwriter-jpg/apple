#!/usr/bin/env python3
"""一次抽好 W04–W12 的故事配方卡＋每週交辦單（零 token、純腳本）。

跨週連續輪播：每篇的 shape/resolution/dominant_sense/ending_style 不撞前一晚
（含跨週接縫），每週五篇形狀全不同、結尾五句式全輪替、五感各用一次；主角／場景
避開最近幾篇且全新（跳出森林）。禁用元素自最近兩篇自動帶入。

輸出：
  stories/recipes/weekNN[-x].md   每篇配方卡
  docs/handoff-WNN.md             每週交辦單（Codex 一次寫 5 篇）

用法：python3 tools/batch-recipes.py [--seed 20260616]
"""
import argparse
import importlib.util
import json
import random
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
STORIES = BASE / "stories"
DOCS = BASE / "docs"

# 重用 draw-recipe.py 的詞庫（canonical）
_spec = importlib.util.spec_from_file_location("draw_recipe", BASE / "tools" / "draw-recipe.py")
dr = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dr)

WEEKS = list(range(4, 13))  # W04..W12


def episode_meta():
    cat = json.loads((STORIES / "catalog.json").read_text(encoding="utf-8"))
    return {ep["id"]: ep for ep in cat["episodes"]}


def last_existing():
    """最後一篇已存在（已遷移）故事，當作 W04 第一晚的『前一晚』。"""
    cat = json.loads((STORIES / "catalog.json").read_text(encoding="utf-8"))
    prev = None
    for ep in cat["episodes"]:
        for entry in ep.get("stories") or []:
            p = STORIES / f"{entry['id']}.json"
            if p.exists():
                d = json.loads(p.read_text(encoding="utf-8"))
                if d.get("shape"):
                    prev = d
    return prev


def ids_for(weeknum):
    base = f"week{weeknum:02d}"
    return [base] + [f"{base}-{i}" for i in range(2, 6)]


def distinct_seq(rng, pool, k, first_not):
    """k 個相異值；第一個不等於 first_not。"""
    for _ in range(200):
        pick = rng.sample(list(pool), k)
        if pick[0] != first_not:
            return pick
    return rng.sample(list(pool), k)


def pick_avoiding(rng, pool, avoid):
    allowed = [x for x in pool if x not in avoid] or list(pool)
    return rng.choice(allowed)


def build_card(weeknum, theme, sid, facet, r):
    forb = "\n".join(f"  - {x}" for x in r["forbidden"])
    return f"""# 故事配方卡 — {sid}（{theme}）

- 切點（focus，固定）：{facet}
- 故事形狀：{r['shape']}（{dr.SHAPES[r['shape']]}）
- 主角：{r['protagonist']}
- 場景：{r['scene']}
- 情緒曲線：{r['emotion_arc']}
- 核心事件：（依切點自填一句：今晚發生什麼小事）
- 解決方式：{r['resolution']}
- 陪伴角色：{r['companion']}
- 主導感官：{r['dominant_sense']}
- 睡前收束：{r['wind_down_style']}
- 結尾句式：{r['ending_style']}  → 範式「{dr.ENDING_STYLES[r['ending_style']]}」
- 禁用元素：
{forb}
"""


def build_handoff(weeknum, theme, rows):
    table = "\n".join(
        f"| {r['id']} | {r['focus']} | {r['shape']} | {r['protagonist']} | {r['scene']} | {r['ending_style']} |"
        for r in rows
    )
    ids = " ".join(r["id"] for r in rows)
    return f"""# Codex 交辦單 — W{weeknum:02d}「{theme}」五篇（新模式，一次交）

任務：照配方卡寫 W{weeknum:02d}「{theme}」**五篇一起寫、一起交**。Codex 寫稿、合成音檔並上線；Claude 只做 rubric 審核。

工作目錄 `bedtime/`。

## 先讀
- 五張配方卡：`stories/recipes/{rows[0]['id']}.md` … `{rows[-1]['id']}.md`
- 規則：`docs/format-revamp-handoff.md`（含**命名規則**）、`stories/season01-plan.md`、`docs/story-scoring-rubric.md`、`docs/tts-audio-writing-guide.md`
- 結構樣板：`stories/week03-3.json`

## 五篇（夜間輪播序＝下表）
| id | 切點 focus | 形狀 | 主角 | 場景 | 結尾句式 |
|----|----|----|----|----|----|
{table}

情緒曲線／解決方式／陪伴角色／主導感官／睡前收束／禁用元素：一律照各自配方卡。

## 硬規則
- 每個 JSON 含：`schema_version:2`、`id`、`title`、`focus`、`shape`、`protagonist`、`scene`、`emotion_arc`、`resolution`、`dominant_sense`、`ending_style`、`theme_word`、`intro`、`prologue`、`voices`、`review_status:"pending_adult_review"`、`review_note`、`sections`（6 段，turns+text）、`wind_down`、`weekend_prompts`（2 則）。
- `text` 必須＝該段所有 turn 的 text 依序相接（程式產生，勿手抄）。
- 聲線：narrator=zh-TW-HsiaoChenNeural、女童=mimi(zh-CN-Xiaoshuang)、男童=dodo(zh-CN-Yunxia)、第二個會說話的女生=girl2(zh-CN-Xiaoyi)。
- **命名規則**（見 format-revamp-handoff.md）：新世界角色一律全新名字、不重用森林班底、一篇內不可同名、性別物種前後一致；米米可當錨點但非必要。
- `goodnight` 照各篇 `ending_style` 句式、開頭固定「雨芯，晚安。」。
- 長度以朗讀約 8–10 分鐘為準（對白＋停頓，字數會較少，別硬湊）。

## 自檢（零 token）
```bash
python3 tools/check-bedtime-story.py {ids}
```
全部通過、五篇交回給 Claude 審。

## Claude 審核通過後（這批改由 Codex 收尾）
1. 把這五篇的 `review_status` 改 `adult_verified`（依 Claude 的審核結論；待修的先改）。
2. `stories/catalog.json` 的 W{weeknum:02d} episode 補上這五篇（title/focus/status/available），episode 設 available:true、title 用主題「{theme}」。
3. 合成音檔（兩套）：
   ```bash
   python3 tools/generate-bedtime-audio.py {ids}
   python3 tools/generate-bedtime-audio.py {ids} --name "光哥、阿築" --suffix gz
   ```
   確認每篇時長 8–10 分；再跑 `python3 tools/check-bedtime-story.py {ids}` 應全綠。
4. `node tests/check-bedtime-week-rotation.js` 通過後 commit + push（GitHub Pages）。

## 不要做
- Claude 審核前不要設 adult_verified、不要產音檔、不要動 catalog。
- 不要動其他週已上線的故事。
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=20260616)
    args = ap.parse_args()
    rng = random.Random(args.seed)

    eps = episode_meta()
    prev = last_existing() or {}
    recent_prot, recent_scene = [], []  # 最近用過的主角/場景（滑動視窗）

    (STORIES / "recipes").mkdir(parents=True, exist_ok=True)
    summary = []

    for wk in WEEKS:
        ep = eps[f"week{wk:02d}"]
        theme = ep["theme"]
        facets = ep["facets"]
        ids = ids_for(wk)

        shapes = distinct_seq(rng, list(dr.SHAPES), 5, prev.get("shape"))
        endings = distinct_seq(rng, list(dr.ENDING_STYLES), 5, prev.get("ending_style"))
        senses = distinct_seq(rng, dr.SENSES, 5, prev.get("dominant_sense"))
        resolutions = distinct_seq(rng, dr.RESOLUTIONS, 5, prev.get("resolution"))

        rows = []
        for i, (sid, facet) in enumerate(zip(ids, facets)):
            prot = pick_avoiding(rng, dr.PROTAGONISTS, set(recent_prot) | {p["protagonist"] for p in rows})
            scene = pick_avoiding(rng, dr.SCENES, set(recent_scene) | {p["scene"] for p in rows})
            emo = f"{rng.choice(dr.START_EMOTIONS)} → {rng.choice(dr.MID_EMOTIONS)} → {rng.choice(dr.CALM_ENDS)}"
            companion = rng.choice(dr.COMPANIONS)
            wind = rng.choice(dr.WIND_DOWN_STYLES)
            # 禁用元素：最近兩晚（prev + 本週已抽）的形狀動作 / 場景
            ctx = ([prev] if prev else []) + rows
            forb = []
            for h in ctx[-2:]:
                if h.get("shape") in dr.SHAPES:
                    forb.append(f"不要{dr.SHAPES[h['shape']]}")
                if h.get("scene"):
                    forb.append(f"不要重複場景「{h['scene']}」")
            forb.append("不要和前兩晚用同一種解決方式或結尾句式")
            forb = list(dict.fromkeys(forb))

            r = {
                "id": sid, "focus": facet, "shape": shapes[i], "protagonist": prot,
                "scene": scene, "emotion_arc": emo, "resolution": resolutions[i],
                "companion": companion, "dominant_sense": senses[i],
                "wind_down_style": wind, "ending_style": endings[i], "forbidden": forb,
            }
            (STORIES / "recipes" / f"{sid}.md").write_text(build_card(wk, theme, sid, facet, r), encoding="utf-8")
            rows.append(r)
            prev = r
            recent_prot = (recent_prot + [prot])[-4:]
            recent_scene = (recent_scene + [scene])[-4:]

        (DOCS / f"handoff-W{wk:02d}.md").write_text(build_handoff(wk, theme, rows), encoding="utf-8")
        summary.append((wk, theme, rows))

    # 摘要 + 接縫自檢
    axes = ["shape", "resolution", "dominant_sense", "ending_style"]
    flat = []
    for wk, theme, rows in summary:
        flat.extend(rows)
    clashes = 0
    seq = ([prev_start] if (prev_start := last_existing()) else []) + flat
    for a, b in zip(seq, seq[1:]):
        for ax in axes:
            if a.get(ax) and b.get(ax) and a[ax] == b[ax]:
                clashes += 1
                print(f"  ✗ {b['id']} 撞 {a.get('id','(上週末)')} 於 {ax}={a[ax]}")
    for wk, theme, rows in summary:
        print(f"W{wk:02d} {theme}: 形狀 {'/'.join(r['shape'] for r in rows)} | 結尾 {'/'.join(r['ending_style'] for r in rows)}")
    print(f"\n共 {len(flat)} 篇配方卡 + 9 張交辦單。相鄰四軸撞號：{clashes}（應為 0）")


if __name__ == "__main__":
    main()
