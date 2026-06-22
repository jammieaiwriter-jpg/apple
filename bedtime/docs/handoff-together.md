# Codex 交辦單 — 特別篇「一起玩」四篇（新模式，一次交）

任務：照配方卡寫特別篇「一起玩」**四篇一起寫、一起交**。Codex 寫稿、合成音檔並上線；Claude 只做 rubric 審核。

工作目錄 `bedtime/`。

> 這是一組**為雨芯量身設計**的特別篇，不屬於 W01–W12 主線。目的：用故事溫和疏導「太想贏、愛比較、想控制／命令同伴」的傾向，幫她在交朋友時更順。**因為故事結尾會直接對雨芯說晚安，寫法守則（下一段）比平常更重要，務必先讀。**

## 特別設計守則（最重要，先讀）

- **主角不可被責罵、被處罰、被外力糾正才改變。** 轉變一律靠主角**自己發現**朋友的反應（衝第一卻只剩自己、命令把朋友趕走…），再自己選擇換一種做法。
- **不可讓主角影射成「一個很愛控制／愛指揮的小女孩」被檢討。** 主角用配方指定的動物／物件，行為點到為止；不要寫成可被孩子對號入座、覺得被指責的角色。
- **至少 together 這篇要讓主角體驗「在後面、沒搶到第一」也很好**，正面翻轉「前面＝贏＝才好」。
- **不貼壞標籤、不訓話、不強迫道歉。** 道理只放 `prologue`（2–3 句、溫和明講），正文純演出、收尾不下結論——同 rubric 安全閥（價值與安全維度 ≤2 一律退回）。
- 被命令／被嫌的那一方要寫得有感受（會安靜、會走開、會難過），但**不要悲情或嚇人**，仍是低刺激睡前語氣。

## 先讀
- 四張配方卡：`stories/recipes/together.md` … `together-4.md`
- 規則：`docs/format-revamp-handoff.md`（含**命名規則**）、`stories/season01-plan.md`、`docs/story-scoring-rubric.md`、`docs/tts-audio-writing-guide.md`
- 結構樣板：`stories/week05-4.json`（守護型可參考）、`stories/week05.json`

## 四篇（夜間輪播序＝下表）
| id | 切點 focus | 形狀 | 主角 | 場景 | 結尾句式 |
|----|----|----|----|----|----|
| together | 比起搶第一，一起玩更開心 | 旅程型 | 一台亮紅色的小賽車 | 黃昏的玩具賽道 | 物件呼應式 |
| together-2 | 別人和我步調不同，不是錯 | 變化型 | 一隻急性子的小蜻蜓 | 開滿小花的長下坡小路 | 比喻式 |
| together-3 | 用邀請代替命令，朋友才會留下來 | 製作型 | 一支愛發號施令的小指揮棒 | 公園角落的沙坑 | 明日式 |
| together-4 | 先想對方的感受，問他想怎麼玩 | 守護型 | 一隻外硬內軟的小刺蝟 | 亮著路燈的回家小路 | 身體放鬆式 |

情緒曲線／解決方式／陪伴角色／主導感官／睡前收束／禁用元素：一律照各自配方卡。

## 硬規則
- 每個 JSON 含：`schema_version:2`、`id`、`title`、`focus`、`shape`、`protagonist`、`scene`、`emotion_arc`、`resolution`、`dominant_sense`、`ending_style`、`theme_word`、`intro`、`prologue`、`voices`、`review_status:"pending_adult_review"`、`review_note`、`sections`（6 段，turns+text）、`wind_down`、`weekend_prompts`（2 則）。
- `text` 必須＝該段所有 turn 的 text 依序相接（程式產生，勿手抄）。
- 聲線：narrator=zh-TW-HsiaoChenNeural、女童=mimi(zh-CN-Xiaoshuang)、男童=dodo(zh-CN-Yunxia)、第二個會說話的女生=girl2(zh-CN-Xiaoyi)。
- **命名規則**（見 format-revamp-handoff.md）：新世界角色一律全新名字、不重用森林班底、一篇內不可同名、性別物種前後一致。
- **配角也要每篇不同名**：補位的對白夥伴每篇給不同新名、不要跨篇重用同一個名字。
- `theme_word` 用「一起玩」三字（一＝ㄧˋ、起＝ㄑㄧˇ、玩＝ㄨㄢˊ），`intro` 講「關於『一起玩』的故事」。
- `goodnight` 照各篇 `ending_style` 句式、開頭固定「雨芯，晚安。」。
- 長度以朗讀約 8–10 分鐘為準（對白＋停頓，字數會較少，別硬湊）。
- 形狀四篇皆不同（旅程／變化／製作／守護），相鄰不同形，已在配方卡排好，照寫即可。

## 自檢（零 token）
```bash
python3 tools/check-bedtime-story.py together together-2 together-3 together-4
```
- 結構／`text`==turns／聲線會被檢查；**focus 與形狀輪替會出現 warn「不在 catalog」屬正常**（catalog 要等 Claude 審過才補，見下）。
- 四篇結構全綠、交回給 Claude 審。

## Claude 審核結論（2026-06-22）

四篇內容**皆達標**，設計守則有守到（主角自己發現、配角不被羞辱、道理只在 prologue、不對號入座；together-3 命令→邀請、together-4 守護＝陪對方說出想要的位置，都很到位）。形狀／解法／感官／結尾四軸、命名、focus 全部岔開無重複。

**上線前一個必改（聲線／性別一致）：**
- `together`（**紅溜**）與 `together-4`（**白安**）這兩個角色用 `mimi`（女童聲）發聲，旁白卻一路稱「他」——聽起來會是女聲配「他」。請把這兩個角色改成「她」：只改旁白 text 裡指**這個角色**的「他」→「她」，**小心別動到同篇 `慢望`／`圓針` 等男角（dodo）的「他」**。慣例＝mimi→她、dodo→他（同 W04／W05）。改完每段 `text` 仍須 == turns 串接。
- `together-2`／`together-3` 聲線性別已一致，不用動。

改完上述必改，再進收尾。

## Claude 審核通過後（這批改由 Codex 收尾）
1. 把這四篇的 `review_status` 改 `adult_verified`。
2. `stories/catalog.json` 新增一個特別篇 episode（預設 id `together`、week 標記另議、title「一起玩」、`status/available`＝`adult_verified`/`true`、facets＝四個切點、stories 四篇照輪播序）。**務必維持精簡格式（一行一集、stories 一行一篇），不要 pretty-print／重排整檔。** 放在輪播的哪個位置由 Emma 決定，預設接在 W05 之後。
3. 合成音檔（兩套）：
   ```bash
   python3 tools/generate-bedtime-audio.py together together-2 together-3 together-4
   python3 tools/generate-bedtime-audio.py together together-2 together-3 together-4 --name "光哥、阿築" --suffix gz
   ```
   確認每篇時長 8–10 分；再跑 `python3 tools/check-bedtime-story.py together together-2 together-3 together-4`（此時已進 catalog）應全綠。
   - **務必用 `tools/generate-bedtime-audio.py`**（它會自動套 `rate="-15%"` 慢速）。**合成後一定要驗時長**：W05 上次出事就是走了別的合成路徑、沒套 −15%，跑出 ~6 分（該 8–10 分）。若有篇 ~6 分，代表語速沒套對，要重來。
   - Azure 已升 S0，連發不會再撞 429；若偶發 429，間隔幾秒重試即可。
4. commit + push（GitHub Pages）。

## 不要做
- Claude 審核前不要設 adult_verified、不要產音檔、不要動 catalog。
- 不要動其他週已上線的故事。
- 不要違反上面「特別設計守則」——這批的審核會特別嚴格看這幾點。
