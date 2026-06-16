# Codex 交辦單 — W03「友善」五篇（新模式）

任務：照配方卡寫 W03「友善」五篇睡前故事。Codex 寫稿，Claude 審＋合成童聲音檔＋上線。

倉庫 jammieaiwriter-jpg/apple，分支 main，工作目錄 `bedtime/`。

## 先讀

- 五張配方卡（照這個寫，不要自己另想）：
  `stories/recipes/week03.md`、`week03-2.md`、`week03-3.md`、`week03-4.md`、`week03-5.md`
- 規格與規則：`docs/format-revamp-handoff.md`、`stories/season01-plan.md`、
  `docs/story-scoring-rubric.md`、`docs/tts-audio-writing-guide.md`
- 結構樣板（照欄位結構／對白密度）：`stories/week02-2.json`

## 要產出

五個檔：`stories/week03.json` … `week03-5.json`，夜間輪播序＝下表順序：

| id | 切點 focus | 形狀 | 主角 | 場景 | 結尾句式 |
|----|----|----|----|----|----|
| week03   | 主動邀請還沒加入的人 | 相遇型 | 一隻想念朋友的小狐狸 | 夜晚的麵包店 | 身體放鬆式 |
| week03-2 | 用小行動讓別人感到舒服 | 製作型 | 一盞小檯燈精靈 | 睡前的小臥室 | 明日式 |
| week03-3 | 尊重別人不同的玩法與喜好 | 來訪型 | 一隻夜裡才醒的小貓頭鷹 | 一列開往夢裡的小火車 | 物件呼應式 |
| week03-4 | 友善也可以保留自己的界線 | 變化型 | 一朵棉花雲 | 海邊的小燈塔 | 願式 |
| week03-5 | 把收到的善意傳給下一個人 | 旅程型 | 一隻迷你小火車 | 雲上的小陽台 | 比喻式 |

情緒曲線、解決方式、陪伴角色、主導感官、睡前收束、禁用元素：一律照各自配方卡，不要改。

## 每個 JSON 必含欄位

`schema_version:2`、`id`、`title`、`focus`、`shape`、`protagonist`、`scene`、`emotion_arc`、
`resolution`、`dominant_sense`、`ending_style`、`theme_word`（友 ㄧㄡˇ／善 ㄕㄢˋ）、
`intro`、`prologue`、`voices`、`review_status:"pending_adult_review"`、`review_note`、
`sections`（正好 6 段，每段 `turns[{role,text}]` ＋ `text`）、`wind_down`（scene/breath/goodnight）、
`weekend_prompts`（2 則行動式）。

## 硬規則

- `text` 必須＝該段所有 turn 的 text 依序相接（用程式產生，不要手抄）。
- 聲線：`narrator`=zh-TW-HsiaoChenNeural、女童=`mimi`(zh-CN-Xiaoshuang)、男童=`dodo`(zh-CN-Yunxia)；
  同篇若有第二個會說話的女生才加 `girl2`(zh-CN-Xiaoyi)。主角不是米米也沒關係，依角色性別配 mimi/dodo。
- `prologue`：intro 之後 2–3 句明講今晚的小道理；正文只演出、不再說教。
- 旁白只接場景與轉場，角色自己說話；一輪一兩句就換人。
- `goodnight` 要照該篇 `ending_style` 的句式寫（5 種句式見 `season01-plan.md`），開頭固定「雨芯，晚安。」。
- 長度以朗讀約 8–10 分鐘為準（對白＋停頓，字數會比純旁白少，別硬湊字數）。
- 嚴守禁用元素：每篇不可出現自己配方卡列的禁用項（和前兩晚岔開）。

## 交稿前自己跑（零 token，把結構錯誤清乾淨再交）

```bash
python3 tools/check-bedtime-story.py week03 week03-2 week03-3 week03-4 week03-5
```

## 不要做（這些是 Claude 的事）

- 不要自設 `adult_verified`；`review_status` 一律 `pending_adult_review`。
- 不要改 `stories/catalog.json`、`stories/current.json`。
- 不要產生音檔、不要 push。

## 節奏

先做前兩篇 `week03`、`week03-2`，自檢通過後交回給 Claude 審；Claude 審完＋合成童聲音檔＋上線，再做下一批。
