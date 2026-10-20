# Joy 第一、二冊教材庫

兩冊教材與單字資料統一從這裡管理；仍保留冊別與課次。

- `book1/lessons.json`：第一冊20課，單字、中文、課文、拼讀及練習資料。
- `book2/lessons.json`：第二冊20課，同上。
- `vocabulary-index.json`：兩冊合併索引，保留每個詞條的所有冊別、課次與中文；是衍生資料，修改應回到各冊 lessons.json。
- `book1/*.pdf`：原本在「英文/佳音」的4份第一冊 PDF。
- `book2/Joy2-5,10,15,20.pdf`：目前找到的第二冊部分課次 PDF，不能視為整冊原始單字表已齊全。

正式網頁仍在 `Apple/joy/`，入口：https://jammieaiwriter-jpg.github.io/apple/joy/
產生器仍在 `Apple/tools/joy/`，透過 library.json 指向本教材庫。
舊 JSON 與 PDF 路徑改為相對符號連結，舊工具仍可使用。舊「英文」網頁保留作歷史資料，不覆蓋較新的 joy 正式網頁。
原始 PDF 僅保留本機，不推送 GitHub。

注意：詞條包含角色名、片語和句子；索引尚未等同於適合7歲孩子全部默寫的單字清單。後續單字遊戲應依冊別、課次與能力分級。
