# Codex 交辦單 — W05「傾聽」五篇（新模式，一次交）

任務：照配方卡寫 W05「傾聽」**五篇一起寫、一起交**。Codex 寫稿、合成音檔並上線；Claude 只做 rubric 審核。

工作目錄 `bedtime/`。

---

## 附帶任務（先做）：W04「米娜」回修重合成

W04 已上線，但「米娜」被當成 mimi 那個說話的女生連用了三篇（`week04`／`week04-4`／`week04-5`），跨世界撞名、聽幾晚會膩。回修方式：

- **`week04` 保留「米娜」不動**（含音檔，不要重合成）。
- **`week04-4` 和 `week04-5` 各換一個全新女生名**：兩個名字彼此不同、且不與「米娜」及 W04／W05 任何角色撞名；性別維持女、不用森林班底。名字由 Codex 取（這是寫稿，Claude 只審）。
- 改的是**旁白 text 裡出現的名字**（mimi 的對白是第一人稱、不會講自己名字）：`week04-4` 1 處、`week04-5` 2 處。改完務必讓每段 `text` 仍 == 該段 turns 串接（程式產生，勿手抄）。
- 不要動 `week04-4`／`week04-5` 的其他內容、`review_status`（維持 `adult_verified`）、catalog、title；這是純改名。
- **只重合成這兩篇、兩套音檔**：
  ```bash
  python3 tools/generate-bedtime-audio.py week04-4 week04-5
  python3 tools/generate-bedtime-audio.py week04-4 week04-5 --name "光哥、阿築" --suffix gz
  ```
  確認兩篇時長仍 8–10 分，再跑 `python3 tools/check-bedtime-story.py week04-4 week04-5` 應全綠。
- 改名 diff 與新音檔交回，Claude 複查後一起 commit。

---

## 先讀
- 五張配方卡：`stories/recipes/week05.md` … `week05-5.md`
- 規則：`docs/format-revamp-handoff.md`（含**命名規則**）、`stories/season01-plan.md`、`docs/story-scoring-rubric.md`、`docs/tts-audio-writing-guide.md`
- 結構樣板：`stories/week03-3.json`

## 五篇（夜間輪播序＝下表）
| id | 切點 focus | 形狀 | 主角 | 場景 | 結尾句式 |
|----|----|----|----|----|----|
| week05 | 停下自己的聲音，讓身體安靜 | 來訪型 | 一隻紙摺的小鶴 | 閣樓上的舊鐘塔 | 物件呼應式 |
| week05-2 | 注意表情、動作與沒有說出口的訊息 | 變化型 | 一隻穿雨鞋的小青蛙 | 圖書館深處的安靜角落 | 願式 |
| week05-3 | 不確定時先詢問，不急著猜答案 | 製作型 | 一盞小檯燈精靈 | 雨後的彩虹橋下 | 明日式 |
| week05-4 | 讓對方慢慢說完，不搶著回應 | 守護型 | 一片小小的雪花 | 夜晚的麵包店 | 身體放鬆式 |
| week05-5 | 用行動回應真正聽見的需要 | 旅程型 | 一隻慢吞吞的小烏龜 | 抽屜裡的玩具城 | 比喻式 |

情緒曲線／解決方式／陪伴角色／主導感官／睡前收束／禁用元素：一律照各自配方卡。

## 硬規則
- 每個 JSON 含：`schema_version:2`、`id`、`title`、`focus`、`shape`、`protagonist`、`scene`、`emotion_arc`、`resolution`、`dominant_sense`、`ending_style`、`theme_word`、`intro`、`prologue`、`voices`、`review_status:"pending_adult_review"`、`review_note`、`sections`（6 段，turns+text）、`wind_down`、`weekend_prompts`（2 則）。
- `text` 必須＝該段所有 turn 的 text 依序相接（程式產生，勿手抄）。
- 聲線：narrator=zh-TW-HsiaoChenNeural、女童=mimi(zh-CN-Xiaoshuang)、男童=dodo(zh-CN-Yunxia)、第二個會說話的女生=girl2(zh-CN-Xiaoyi)。
- **命名規則**（見 format-revamp-handoff.md）：新世界角色一律全新名字、不重用森林班底、一篇內不可同名、性別物種前後一致；米米可當錨點但非必要。
- **配角也要每篇不同名（W04 教訓）**：當配方的陪伴角色不會說話（本週多篇如此：不會說話的紙鶴／舊圍巾／小石頭／小掃帚／窗外月亮），需要再補一個會說話的對白夥伴時，**每篇給不同新名、不要跨篇重用同一個名字**（W04 把「米娜」連用 week04／week04-4／week04-5 三篇，聽起來會膩，本週請避免）。
- **`week05-2` 特別注意**：主角＋場景（穿雨鞋的小青蛙＋圖書館深處的安靜角落）與 W04 的 `week04` 完全相同——請給青蛙**換一個名字**（W04 叫「雨蹦」），且**不可重用** W04 的「米娜／呼嚕」。
- `goodnight` 照各篇 `ending_style` 句式、開頭固定「雨芯，晚安。」。
- 長度以朗讀約 8–10 分鐘為準（對白＋停頓，字數會較少，別硬湊）。
- **本季第一篇守護型（`week05-4`）**：守護型＝輕輕照顧一個更小／更弱的對象。注意別寫成上對下的指導或說教，仍是「陪伴、等對方說完」，呼應切點「讓對方慢慢說完，不搶著回應」。

## 自檢（零 token）
```bash
python3 tools/check-bedtime-story.py week05 week05-2 week05-3 week05-4 week05-5
```
全部通過、五篇交回給 Claude 審。

## Claude 審核通過後（這批改由 Codex 收尾）
1. 把這五篇的 `review_status` 改 `adult_verified`（依 Claude 的審核結論；待修的先改）。
2. `stories/catalog.json` 的 W05 episode 補上這五篇（title/focus/status/available），episode 設 available:true、title 用主題「傾聽」。
3. 合成音檔（兩套）：
   ```bash
   python3 tools/generate-bedtime-audio.py week05 week05-2 week05-3 week05-4 week05-5
   python3 tools/generate-bedtime-audio.py week05 week05-2 week05-3 week05-4 week05-5 --name "光哥、阿築" --suffix gz
   ```
   確認每篇時長 8–10 分；再跑 `python3 tools/check-bedtime-story.py week05 week05-2 week05-3 week05-4 week05-5` 應全綠。
4. 上面 `check-bedtime-story.py` 全綠（已內含結構／focus／形狀與輪替檢查）後，commit + push（GitHub Pages）。

## 不要做
- Claude 審核前不要設 adult_verified、不要產音檔、不要動 catalog。
- 不要動其他週已上線的故事（唯一例外＝上面「附帶任務」指定的 `week04-4`／`week04-5` 改名重合成）。
