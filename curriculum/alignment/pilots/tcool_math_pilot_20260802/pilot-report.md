# TCOOL 數學考卷 Pilot 第一批修復報告

## 結論

- 發布判定：**NO-GO**
- 這是逐筆證據保存與對齊候選資料，不是可自動判分題庫；未生成題目、矩陣或 HTML。
- 117 筆均標為 `question_group_candidate`，因上游抽取未能安全確認小題邊界。

## 真實統計（與 validation-report.md 同一份資料）

- Pilot 選取來源：10 份（canonical source inventory 共 15 份）。
- 候選記錄：117；答案有來源：0；空選項：117。
- answerStatus：`{"missing":35,"needs_review":82}`。
- sourcePage 缺失：35；image_required：34；其中缺 questionImage path：0。
- alignmentStatus：`{"direct":8,"partial":43,"uncertain":66}`；confidence：`{"high":8,"low":66,"medium":43}`。
- 官方碼筆數分布：`{"0":51,"1":37,"2":12,"3":11,"4":6}`；SkillID 筆數分布：`{"0":109,"1":8}`。

## 未解 NO-GO gates

- all records remain unsplit question-group candidates
- item-level answer evidence is absent for one or more records
- options are unavailable for one or more records
- source-page evidence is missing for one or more records
- one or more records retain uncertain curriculum alignment

## 下一批舊清單對帳（不擴批）

舊有 35 筆簡寫建議，只有 **13 筆**在 canonical exam inventory 中唯一匹配；其餘 **22 筆**未匹配，已排除而非以其他考卷補位。以下是唯一允許進入後續人工選批的完整 `sourceId`：

- `G1-翰林-110下-期末2-P04_R09_安和國小_新北市_1年級_數學_110下_期末2_翰林`
- `G1-翰林-112下-期末2-P02_R06_安和國小_新北市_1年級_數學_112下_期末2_翰林`
- `G2-康軒-110上-期中1-P04_R08_安和國小_新北市_2年級_數學_110上_期中1_康軒`
- `G2-翰林-111下-期末2-P04_R08_安和國小_新北市_2年級_數學_111下_期末2_翰林`
- `G2-康軒-112上-期末2-P02_R02_安和國小_新北市_2年級_數學_112上_期末2_康軒`
- `G2-翰林-113下-期中1-P01_R06_安和國小_新北市_2年級_數學_113下_期中1_翰林`
- `G3-翰林-110下-期末2-P04_R04_安和國小_新北市_3年級_數學_110下_期末2_翰林`
- `G3-翰林-112下-期末2-P02_R01_安和國小_新北市_3年級_數學_112下_期末2_翰林`
- `G3-康軒-113下-期末2-P01_R01_安和國小_新北市_3年級_數學_113下_期末2_康軒`
- `G4-康軒-110上-期中1-P06_R01_安和國小_新北市_4年級_數學_110上_期中1_康軒`
- `G4-翰林-111下-期末2-P03_R09_安和國小_新北市_4年級_數學_111下_期末2_翰林`
- `G4-康軒-112上-期末2-P02_R09_安和國小_新北市_4年級_數學_112上_期末2_康軒`
- `G4-翰林-113下-期中1-P01_R06_安和國小_新北市_4年級_數學_113下_期中1_翰林`

未匹配舊描述（不作替代選取）：

- `G1-康軒-110上-期中1-安和國小_新北市`
- `G1-康軒-111上-期中1-安和國小_新北市`
- `G1-翰林-111下-期末2-安和國小_新北市`
- `G1-康軒-112上-期末2-安和國小_新北市`
- `G1-康軒-113上-期中1-安和國小_新北市`
- `G1-翰林-113下-期末1-安和國小_新北市`
- `G2-翰林-110下-期末2-安和國小_新北市`
- `G2-康軒-111上-期中1-安和國小_新北市`
- `G2-翰林-112下-期末2-安和國小_新北市`
- `G2-康軒-113上-期中1-安和國小_新北市`
- `G2-康軒-113下-期末2-安和國小_新北市`
- `G3-康軒-110上-期中1-安和國小_新北市`
- `G3-康軒-111上-期中1-安和國小_新北市`
- `G3-翰林-111下-期末2-安和國小_新北市`
- `G3-康軒-112上-期末2-安和國小_新北市`
- `G3-康軒-113上-期中2-安和國小_新北市`
- `G3-翰林-113下-期中1-安和國小_新北市`
- `G4-翰林-110下-期末2-安和國小_新北市`
- `G4-康軒-111上-期中1-安和國小_新北市`
- `G4-翰林-112下-期末2-安和國小_新北市`
- `G4-康軒-113上-期中1-安和國小_新北市`
- `G4-康軒-113下-期末2-安和國小_新北市`

## Protected upstream inputs

所有下列 SHA-256 於驗證時重新計算，並與 `protected-inputs.json` 比對：

- `canonical_pilot_inventory`: `1c137519df594410238217ba496f492ab0bcbf01a98ce3269b1b6ab5547c4638`
- `canonical_extracted_questions`: `c2b268338ab4cebad2048c619558b0398d482034d28b4e7b16537d11c45c88ee`
- `canonical_question_alignments`: `9d2c14f9eea6e83a38567194987ed6184504630a2ddff4c2ffed095180a883f3`
- `exam_inventory`: `41334d5577d3a8b55a6a9c6c396b9167ff5a950acab092324ad260f254c73144`
- `official_codes`: `34343ef325cc899e04ae07854d87ccf6e50c93ba1781b5de37cd01a0f0e0d7b1`
- `publisher_alignment`: `2fe8ec3bfc04ed2d4ed6604f42594218bbf75647333c6843b41459db0571a1d9`
- `skill_bridge`: `436bae970589107747b998bcd922d90a348f9c89f8d5773fbed4b790e204efda`

完整性驗證：**PASS**。
