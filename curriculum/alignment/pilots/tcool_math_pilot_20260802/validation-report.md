# TCOOL 數學考卷 Pilot 驗證報告

## Verdict

- Integrity：**PASS**
- Release decision：**NO-GO**
- Protected upstream hashes match：**yes**

## Checked evidence

- source existence、sourceId / questionId uniqueness、官方碼與 SkillID existence / grade consistency、status consistency、答案／選項／圖像缺口、多碼陣列保存、CSV/JSON parity、報告統計與 protected SHA。
- Records: 117; selected sources: 10; sourcePage missing: 35; image-required missing path: 0.
- answer present: 0; options empty: 117; candidates: 117.

## Integrity errors

- 無

## Release blockers

- all records remain unsplit question-group candidates
- item-level answer evidence is absent for one or more records
- options are unavailable for one or more records
- source-page evidence is missing for one or more records
- one or more records retain uncertain curriculum alignment

## Protected input SHA-256

- `canonical_pilot_inventory`: `1c137519df594410238217ba496f492ab0bcbf01a98ce3269b1b6ab5547c4638`
- `canonical_extracted_questions`: `c2b268338ab4cebad2048c619558b0398d482034d28b4e7b16537d11c45c88ee`
- `canonical_question_alignments`: `9d2c14f9eea6e83a38567194987ed6184504630a2ddff4c2ffed095180a883f3`
- `exam_inventory`: `41334d5577d3a8b55a6a9c6c396b9167ff5a950acab092324ad260f254c73144`
- `official_codes`: `34343ef325cc899e04ae07854d87ccf6e50c93ba1781b5de37cd01a0f0e0d7b1`
- `publisher_alignment`: `2fe8ec3bfc04ed2d4ed6604f42594218bbf75647333c6843b41459db0571a1d9`
- `skill_bridge`: `436bae970589107747b998bcd922d90a348f9c89f8d5773fbed4b790e204efda`
