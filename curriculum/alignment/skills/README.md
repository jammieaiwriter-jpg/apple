# KooBits-derived SkillID ↔ 108 課綱橋接

本目錄把現有數學系統的 402 個穩定 `SkillID`，逐筆連到教育部 108 數學領域的官方學習內容碼與學習表現碼。它是執行層與官方課綱之間的橋接，不會更名、刪除或重編既有 SkillID。

## 產物

- `skill-official-alignment.json`：402 筆逐技能資料，含原始技能名稱、官方碼、狀態、信心、證據與限制。
- `coverage-summary.json`：覆蓋與完整性統計。

## 判定原則

權威順序為官方 108 課綱、官方課程手冊、可驗證出版社章節、題目證據，最後才是語意推論。

- `direct`：SkillID 名稱與官方碼的年級、概念直接吻合。
- `partial`：只涵蓋官方碼的一部分，或官方條目比 SkillID 粗／廣。
- `cross_grade`：SkillID 主要落在其他年級的官方範圍。
- `enrichment`：既有技能超出官方該年級的範圍。
- `uncertain`：名稱不足以安全對齊；官方碼保持空陣列。

出版社章節資料僅列為輔助證據：它是章節級、`editionFamily: unknown` 的候選 bridge，不能把同一章的所有官方碼直接灌入每個 SkillID。

## 統計

目前共 402 筆：G1 79、G2 79、G3 96、G4 148。狀態與官方碼覆蓋請以 `coverage-summary.json` 為準。

## 使用限制

- `direct` 不等同於特定出版社 108–113 年版教材已被確認；版別仍需另行舉證。
- `cross_grade` 與 `enrichment` 應在排課／出題時顯示為年級邊界提示，而非刪除 SkillID。
- `uncertain` 不是缺漏；它是防止把模糊 KooBits 名稱硬對齊的安全狀態。
- 逐題對齊仍必須以題幹、圖像與段考範圍驗證；不可用本表單獨自動判定考卷題目。
