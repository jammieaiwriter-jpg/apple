# TCOOL 小一至小四國語／英語段考題庫

來源：TCOOL（<https://www.tcool.cc/>）。篩選條件為小一至小四、康軒／翰林、國語／英語、學期不限、段考不限、限有答案卷。

每個「年級／出版社／科目」資料夾包含：

- `manifest.json`：去重後的題目卷＋答案卷成對清單
- `manifest.csv`：方便後續 OCR、題型矩陣與課程對齊
- `download_summary.json`：本機 PDF 下載與檔案驗證結果
- `questions/`、`answers/`：原始 PDF（只保留在本機，不納入 Git）

TCOOL 的分頁結果會重複邊界資料，清單以題目卷 `sourceBasename` 去重，且只保留同時有題目卷與答案卷的資料。TCOOL 的英文科目在網站上標示為「英語」。

PDF 下載透過 Chrome 可見頁面操作；若網站限流或 Chrome 暫時未完成下載，`download_summary.json` 會列出缺漏檔案，後續可只補下載缺漏項目。
