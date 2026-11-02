# Joy 認字閃卡（joy/flash/）

網址：https://jammieaiwriter-jpg.github.io/apple/joy/flash/

認讀訓練，與 `joy/words/`（單字小花園，練拼寫）互補。每天 20 個字：新字最少 8 個，複習最多 12 個（間隔 1/3/7/14/30 天）。

流程：閃卡（先自己念→翻面看中文、詞性、例句）→ 聽音選字（選項都是長得像的字，不含同音字）→ 看字選意思 → 分類小遊戲（動作字／名稱字／樣子字，每種至少學過 3 個字才解鎖）。
中文全部加注音，且每個中文意思都有 🔊 可朗讀（純 speechSynthesis，不用 Audio、不用麥克風）。
「很熟」＝連續 3 次、不同天答對（box ≥ 3）。第一冊 90% 字很熟時，頁面自動傳 Telegram 提醒加入第二冊。
練完自動傳成績到 Telegram（`bobo-math-notify` 代理，同單字小花園）。

資料：單字的 `pos`（詞性）、`kid`（給小一的短中文）、`alt`、`sort` 欄位放在 `source_materials/joy/book*/lessons.json` 的 vocab；人名／擬聲詞／句子標 `flash:false`。
第一冊以 `單字表-1.pdf` 與 `docs/joy/佳音-教材重點整理.md` 為準；第二冊還沒補。

建置：`python3 tools/joy-flash/build.py`（改了任何中文字之後先跑 `make_zhuyin.py`，需要 `pip install pypinyin`，並抽查破音字）
測試：`node tools/joy-flash/test.cjs`
提醒：`.github/workflows/joy-flash-reminder.yml`（週一到五 21:00、週六日 09:00，台灣時間）

加入第二冊：
1. 對 `book2/lessons.json` 補 `pos`／`kid`（比照 `enrich_book1.py`），
2. `build.py` 的 `BOOKS=[1,2]`，重跑 `make_zhuyin.py` 與 `build.py`，
3. 已學紀錄存在 localStorage `joy-flash-v1`，加書不會重來。
