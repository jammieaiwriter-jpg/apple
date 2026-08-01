# PDF 前處理

此目錄只保存 393 份題目卷與 393 份答案卷的機械式可重跑前處理結果；不做課綱、出版社章節或 SkillID 語意判定。

執行：

```bash
python3 curriculum/alignment/preprocessing/preprocess_pdfs.py --workers 4
```

每次執行會取得 `_analysis/.preprocess.lock` 的非阻塞獨佔鎖；若已有批次執行，命令會明確失敗而不讀寫任何 OCR 暫存。若要只重試既有 `failed`、`insufficient` 或 `blocked_missing_chi_tra` 的 OCR 記錄，使用：

```bash
python3 curriculum/alignment/preprocessing/preprocess_pdfs.py --retry-ocr-errors --workers 4
```

每個 PDF 均執行 `pdfinfo`、`pdftotext -layout`、`pdffonts`、`pdfimages -list`。直接文字少於 80 個非空白字元時，僅在本機有 `chi_tra` tessdata 時以 300 DPI `pdftoppm` 加 `tesseract chi_tra+eng --psm 4` OCR；否則進 `ocr-queue.json`，不下載任何資料。

中間文字、PDF 檢查 metadata 與 OCR 文字位於 `source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/`。每個資料夾名為 Unicode 可讀 slug 加上完整 `sourceId` 的 SHA-256 前 12 碼，避免不同中文來源覆寫。`validation-summary.json` 會驗證 786 個 `sourceId::role`、786 個分析路徑，並列出所有碰撞或遺失實體檔；任一項不符即 `valid: false`。

OCR 使用的 300 DPI 頁面 PNG 是逐份暫存，`finally` 一律清除；不會長期保留或批量渲染。`render-queue.json` 是後續人工視覺檢查的目標清單。
