# Codex 交辦單 — W06「嘗試」五篇（新模式，一次交）

任務：照配方卡寫 W06「嘗試」**五篇一起寫、一起交**。Codex 寫稿、合成音檔並上線；Claude 只做 rubric 審核。

工作目錄 `bedtime/`。

## 先讀
- 五張配方卡：`stories/recipes/week06.md` … `week06-5.md`
- 規則：`docs/format-revamp-handoff.md`（含**命名規則**）、`stories/season01-plan.md`、`docs/story-scoring-rubric.md`、`docs/tts-audio-writing-guide.md`
- 結構樣板：`stories/week03-3.json`

## 五篇（夜間輪播序＝下表）
| id | 切點 focus | 形狀 | 主角 | 場景 | 結尾句式 |
|----|----|----|----|----|----|
| week06 | 還沒有把握，也願意開始 | 變化型 | 一隻想念朋友的小狐狸 | 結霜的玻璃窗內側 | 物件呼應式 |
| week06-2 | 把失敗當成尋找方法的線索 | 等待型 | 一隻夜裡才醒的小貓頭鷹 | 雲上的小陽台 | 明日式 |
| week06-3 | 一種方法不行，就換一種試試看 | 守護型 | 一把會唱歌的小雨傘 | 圖書館深處的安靜角落 | 比喻式 |
| week06-4 | 遇到困難時願意請人幫忙 | 相遇型 | 一片小小的雪花 | 一格一格的棋盤花園 | 身體放鬆式 |
| week06-5 | 休息、調整，再決定下一步 | 來訪型 | 一塊害羞的小餅乾 | 森林邊的小木屋 | 願式 |

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
python3 tools/check-bedtime-story.py week06 week06-2 week06-3 week06-4 week06-5
```
全部通過、五篇交回給 Claude 審。

## Claude 審核通過後（這批改由 Codex 收尾）
1. 把這五篇的 `review_status` 改 `adult_verified`（依 Claude 的審核結論；待修的先改）。
2. `stories/catalog.json` 的 W06 episode 補上這五篇（title/focus/status/available），episode 設 available:true、title 用主題「嘗試」。
3. 合成音檔（兩套）：
   ```bash
   python3 tools/generate-bedtime-audio.py week06 week06-2 week06-3 week06-4 week06-5
   python3 tools/generate-bedtime-audio.py week06 week06-2 week06-3 week06-4 week06-5 --name "光哥、阿築" --suffix gz
   ```
   確認每篇時長 8–10 分；再跑 `python3 tools/check-bedtime-story.py week06 week06-2 week06-3 week06-4 week06-5` 應全綠。
4. `node tests/check-bedtime-week-rotation.js` 通過後 commit + push（GitHub Pages）。

## 不要做
- Claude 審核前不要設 adult_verified、不要產音檔、不要動 catalog。
- 不要動其他週已上線的故事。
