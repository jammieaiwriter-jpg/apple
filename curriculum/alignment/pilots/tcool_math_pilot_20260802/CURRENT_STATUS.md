# TCOOL 數學考卷 Pilot：目前發布狀態

更新日期：2026-08-02

## 判定

- 逐題切分與課綱對齊：**已完成**。
- Question-level Pilot 發布判定：**GO**（僅限 `includeDecision=include` 的可用題集合）。
- 處理範圍：固定 10 份 TCOOL 數學考卷，未擴批。

此狀態以 `question-level/` 的 C4 逐題成果為準。根目錄的
`pilot-report.md` 與 `validation-report.md` 是切題前 117 筆
`question_group_candidate` 的歷史基線；其 `NO-GO` 僅描述舊候選資料，
不再代表目前的逐題 Pilot 發布結果。

## 已驗證的逐題成果

- 逐題記錄：346 題；每題皆為 `question_item`，且 `boundaryStatus=verified`。
- 固定 10 份來源均已處理，來源與保護輸入 SHA-256 均通過驗證。
- 223 題進入可用集合：均具已驗證答案、可重現頁面／圖像證據，且對齊狀態為
  `direct` 或 `partial`。
- 123 題維持 `uncertain_review`，不混入可用集合；其中 10 題因開放式作圖或
  答案卷與獨立驗算不一致，列在答案／圖像複核佇列，未以推測覆蓋。
- 最終獨立 validator：`Integrity=PASS`、`release=GO`。
- 連續兩次完整重建的 9 項逐題交付物 SHA-256 完全一致。

## 權威文件

- [逐題最終驗證報告](question-level/question-level-validation-report.md)
- [校準報告](question-level/calibration-report.md)
- [答案複核佇列](question-level/answer-review-queue.json)
- [圖像複核佇列](question-level/image-review-queue.json)

## 使用邊界

可用集合可作為本 Pilot 的課綱／題型對齊依據；`uncertain_review` 與
`needs_review` 記錄仍須完成個別人工複核後，才可升入可用集合。本判定不表示
擴展至未選取的其他 TCOOL 試卷，也不把開放式作圖題誤標為具單一可自動判定答案的題目。
