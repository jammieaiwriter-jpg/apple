# 工單：Sonnet 5 — TCOOL 數學 Pilot 逐題切分、答案與圖像證據複核

- 日期：2026-08-02
- 專案根目錄：`/Users/emma/02_小孩教育/Apple`
- Pilot 根目錄：`/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802`
- 基線 commit：`383026a`
- 執行角色：Sonnet 5
- 複核／發布角色：Codex（Sonnet 5 不得自行 commit 或 push）
- 任務性質：既有 10 份 pilot 的逐題證據修復；不是擴批、出題或上線任務

## 給 Sonnet 5 的啟動指令

請先完整閱讀本工單與下列「必讀檔案」，嚴格依 C0 → C1 → C2 → C3 → C4 順序實際執行，不得只寫計畫或完成報告。每一 checkpoint 完成立即執行 validator；硬性驗收失敗時停止，不得猜答案、官方碼、SkillID、出版社單元、題號或圖像內容。

所有 terminal 與 file 操作一律使用絕對路徑。禁止 `python3 -c`。所有可重跑邏輯只能放在本工單指定的兩支 Python 腳本中。不得要求一次性全面權限，不得使用 `--dangerously-skip-permissions`。

## 一、目前已確認的基線事實

現有 pilot 已完成「證據不遺失」修復，但仍是 **NO-GO**：

- 10 份試卷、117 筆 `question_group_candidate`。
- 117 筆答案皆空；`answerStatus` 為 `missing: 35`、`needs_review: 82`。
- 117 筆 options 皆空。
- 35 筆缺 `sourcePage`。
- 34 筆 `image_required` 均已保留上游 `questionImage` 路徑，但部分路徑只指向頁圖目錄，尚非逐題裁圖。
- 對齊狀態：`direct: 8`、`partial: 43`、`uncertain: 66`。
- 29 筆具有多個官方內容碼；不得截成第一碼。
- 舊下一批 35 筆建議只有 13 筆能唯一匹配 canonical inventory，22 筆不存在；本工單不得擴批。
- 既有 validator 結論：Integrity PASS、Release NO-GO。

本工單的目標是把 117 筆題組候選，依原始題目卷、答案卷與頁圖證據，整理成可稽核的「逐小題 first-pass 資料」及明確人工複核佇列。無法確認者必須留下，不得為了追求全通過而捏造。

## 二、必讀檔案

開始前必須唯讀檢查：

1. `/Users/emma/02_小孩教育/Apple/AGENTS.md`
2. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/ALIGNMENT_CONTRACT.md`
3. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/exams/README.md`
4. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/preprocessing/README.md`
5. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/pilot-report.md`
6. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/validation-report.md`
7. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/protected-inputs.json`
8. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/question-items.first-pass.json`
9. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/source-inventory.json`
10. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilot/extracted-questions.jsonl`
11. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilot/question-alignments.jsonl`
12. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/exams/exam-inventory.json`
13. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/official-108-math/official-codes-g1-g4.json`
14. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/publishers/publisher-unit-alignment.json`
15. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/skills/skill-official-alignment.json`

## 三、絕對修改邊界

### 唯一可新增／修改的位置

`/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/question-level/`

### 全部視為唯讀、禁止修改

- Pilot 根目錄中既有的 13 份成果與腳本。
- `source_materials/` 下全部題目卷、答案卷、分析產物與頁圖。
- `curriculum/alignment/pilot/`、`exams/`、`official-108-math/`、`publishers/`、`skills/`。
- 正式題庫、SkillID、HTML、bot、其他 Apple／Bobo／Joy／Diamond／bedtime 檔案。
- `.git/` 與任何未提交的使用者變更。

禁止刪除、搬動或改名原始 PDF。禁止安裝套件、網路下載、commit、push、生成練習題、建立題型矩陣或 HTML。

## 四、只允許兩支可執行腳本

所有邏輯集中在：

1. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/question-level/tools/build_question_level_pilot.py`
2. `/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/question-level/tools/validate_question_level_pilot.py`

可以建立純資料／共用 module，但不得另外執行第三支 Python。禁止 inline Python。外部讀取工具僅限 `rg`、`jq`、`cat`、`head`、`tail`、`wc`、`sort`、`uniq`、`stat`、`file`、`shasum`、`pdfinfo`、`pdftotext`、`pdftoppm`、`tesseract`、`diff`、`cmp`、`test`、`mkdir`。

## 五、必須產生的成果

全部放在 `question-level/`：

- `source-selection.json`：固定 10 份來源、題目與答案路徑、readability、pages、SHA-256。
- `split-manifest.json`：舊 117 candidate 到逐小題 ID 的一對多映射，包含未能切分原因。
- `question-items.question-level.first-pass.json`：逐小題 first-pass 主檔。
- `question-level-review.csv`：與 JSON 全欄位 parity 的人工複核表。
- `answer-review-queue.json`：答案缺失、答案卷對位不明或獨立驗算未通過的項目。
- `image-review-queue.json`：需要人工看圖、bbox／crop 不完整或 OCR 不可信的項目。
- `excluded-items.json`：無法辨識、重複、頁首頁尾或非題目內容；必須附排除理由與來源。
- `calibration-report.md`：C1 兩份校準卷的結果。
- `question-level-validation-report.md`：C4 最終真實驗證報告。
- `protected-inputs.question-level.json`：本工單開始時所有基線輸入 SHA-256。
- `tools/build_question_level_pilot.py`
- `tools/validate_question_level_pilot.py`

不得覆蓋現有 `question-items.first-pass.json`、`alignment-review.csv`、`pilot-report.md` 或 `validation-report.md`。

## 六、逐小題資料契約

每筆至少必須包含：

```json
{
  "questionId": "穩定且可重跑的唯一 ID",
  "sourceGroupIds": ["舊 candidate ID，可多筆"],
  "sourceId": "完整 canonical sourceId",
  "recordKind": "question_item",
  "boundaryStatus": "verified|needs_review",
  "sourceFile": "題目卷相對路徑",
  "sourcePage": 1,
  "sourceBBox": [0, 0, 0, 0],
  "questionImage": "逐題裁圖或可定位的頁圖路徑",
  "questionNumber": "原卷可見題號",
  "stem": "只包含本小題的題幹",
  "options": [],
  "answerKeySource": "答案卷相對路徑",
  "answerKeyPage": 1,
  "answerEvidence": "答案卷原始文字或可定位圖像",
  "correctAnswer": null,
  "answerStatus": "missing|from_answer_key|ai_suggested|verified|needs_review",
  "verificationMethod": "none|answer_key_only|independent_calculation|visual_manual_required",
  "publisher": "康軒|翰林",
  "grade": "G1|G2|G3|G4",
  "academicYear": "113",
  "semester": "上|下",
  "examType": "期中1|期中2|期末1|期末2|期末3",
  "questionType": "",
  "coreConcept": "",
  "commonTrap": "",
  "publisherChapter": null,
  "officialContentCodes": [],
  "officialPerformanceCodes": [],
  "candidateSkillIds": [],
  "skillIds": [],
  "alignmentStatus": "direct|partial|uncertain|out_of_scope",
  "alignmentConfidence": "high|medium|low",
  "alignmentEvidence": [],
  "includeDecision": "include|exclude_out_of_scope|include_for_type_only|uncertain_review",
  "reviewStatus": "first_pass"
}
```

規則：

- 一筆只能代表一個可作答小題；不得把整頁、雙欄或整大題當成一道題。
- `sourcePage` 必須是正整數；無法定位者留在 review queue，不得進可用題集合。
- 選擇題若題面有選項，`options` 不得為空；無法安全拆選項時標 `needs_review`。
- `from_answer_key` 只代表答案卷對位完成；必須再經獨立計算／邏輯檢查才能標 `verified`。
- `ai_suggested` 不得進可用題集合。
- 圖形、鐘面、表格、長度比較、立體物件、連連看等題型，必須保留逐題 crop 或可重現的 page＋bbox。
- 多個官方碼、Performance code、SkillID candidate 必須保留完整陣列。
- 現有 SkillID 是內部學習節點，不得冒充 108 官方碼。
- 無法確認的出版社單元、官方碼或 SkillID 一律保留 `uncertain`，不得用段考名稱反推。

## 七、Checkpoint 執行順序

### C0 — Preflight 與保護雜湊

1. 執行既有 validator：

```bash
python3 /Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/tools/validate_pilot.py
```

必須得到 `Integrity=PASS; release=NO-GO`。若不是，立即停止。

2. 建立 `protected-inputs.question-level.json`，至少包含：

- 現有 pilot 的 13 份檔案。
- 7 份既有 protected upstream inputs。
- 本次 10 份題目卷、10 份答案卷及使用到的頁圖／OCR 來源。

3. 建立固定 `source-selection.json`。不得替換或擴增來源。

### C1 — 兩份異質卷校準

先只處理下列兩份：

1. 文字層卷：`G2-康軒-112下-期中1-P01_R10_安和國小_新北市_2年級_數學_112下_期中1_康軒`
2. 掃描／OCR 卷：`G3-翰林-108上-期中1-P07_R06_鶴聲國小_屏東縣_3年級_數學_108上_期中1_翰林`

逐頁同時查看題目卷與答案卷，建立 question-level records、split mapping、答案／圖像 review queues。不得只讀既有 OCR JSON。

執行：

```bash
python3 /Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/question-level/tools/build_question_level_pilot.py --checkpoint calibration
python3 /Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/question-level/tools/validate_question_level_pilot.py --checkpoint calibration
```

C1 硬性通過條件：

- 兩份卷所有頁面均被盤點，題目／答案頁數與來源一致。
- 每一個輸出的 question item 均有 `sourcePage`、`sourceBBox`／crop、原題號或明確 `needs_review`。
- 雙欄與大題群組不得被當成單一題。
- 所有選擇題均有 options，或進 image review queue。
- 所有答案均有 answer evidence 與狀態；不得只有 AI 猜答。
- 校準輸出重跑兩次，所有 JSON／CSV／報告 SHA 完全相同。
- protected input SHA 全部不變。

任一條失敗：停止，不得進 C2；在 `calibration-report.md` 列出 blocker。

### C2 — 剩餘 8 份逐題處理

C1 全通過後才可處理固定 selection 的其餘 8 份。逐卷完成後立即跑 validator；任何一卷發生 source 遺失、題號／答案錯位、裁圖不可重現或 protected hash 變更，立即停止。

不得擴充到舊清單的 13 或 35 份。

### C3 — 課綱、出版社與 Skill 候選對齊

只對已完成逐小題切分的 records 對齊：

- 108 官方內容碼為基準。
- 出版社章節必須引用 `publisher-unit-alignment.json` 的實際條目與版次限制。
- SkillID 必須存在於 `skill-official-alignment.json`。
- `direct/high` 必須有題幹／圖像、官方定義、出版社單元與 Skill 語意的一致證據。
- `partial/medium` 與 `uncertain/low` 不得提升為 verified alignment。
- 跨單元、跨年級、圖像不完整與考試範圍不明者進 review queue。

### C4 — 最終驗證與交接

執行：

```bash
python3 /Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/question-level/tools/build_question_level_pilot.py --checkpoint final
python3 /Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/question-level/tools/validate_question_level_pilot.py --checkpoint final
```

最終 validator 必須實際檢查：

- 固定 10 份來源完整性與 SHA。
- 每個舊 candidate 被 split、merged、excluded 或 queued，不能靜默遺失。
- questionId 唯一、穩定、可重跑。
- source file／page／bbox／image 實際存在且可開啟。
- 題型與 options 完整性。
- answer evidence、answerStatus、獨立驗算一致性。
- 官方碼、Performance code、SkillID 存在與年級一致。
- alignmentStatus／confidence／includeDecision 一致。
- JSON／CSV 全欄位 parity。
- 報告統計由資料重算，不得硬編布林值。
- 連續兩次完整重建輸出 SHA 相同。
- 所有 protected inputs SHA 不變。

## 八、驗收判定

最終報告必須分開列出：

1. `integrityPass`：schema、來源、雜湊、可重現性與交叉引用是否通過。
2. `questionLevelReady`：逐小題邊界與圖像定位是否完成。
3. `answerReady`：可用題是否全部有 `verified` answer。
4. `alignmentReady`：可用題是否為 `direct` 或經複核可用的 `partial`。
5. `releaseDecision`：`GO` 或 `NO-GO`。

只有同時符合下列條件才可標 `GO`：

- 10 份來源全部處理且無靜默遺失。
- 可用題全部是 `recordKind=question_item`、`boundaryStatus=verified`。
- 可用題全部有正整數 sourcePage 與可重現 image evidence。
- 選擇題 options 完整。
- 可用題 answerStatus 全部為 `verified`。
- 可用題 alignmentStatus 僅為 `direct` 或有明確人工複核證據的 `partial`。
- review／excluded items 完整列出且不混入可用題。
- validator 無 integrity error；protected SHA 守恆；完整輸出可重現。

即使 `integrityPass=true`，只要任一內容 gate 未通過，仍必須 `releaseDecision=NO-GO`。

## 九、立即停止條件

遇到以下任一狀況立即停止並回報，不得自行繞過：

- 任一 protected input SHA 改變。
- 題目卷與答案卷無法唯一配對。
- 需要猜測原題號、答案、官方碼、SkillID 或出版社單元。
- 無法取得圖像題的實際頁圖／crop。
- validator 只能靠硬編碼 pass。
- 需要修改 question-level 目錄之外的檔案。
- 需要安裝套件、登入網站或網路下載。
- 想擴批、生成新題、建立矩陣或 HTML。

## 十、最終回報格式

完成後只回報：

1. C0–C4 每個 checkpoint 的 PASS／FAIL。
2. 10 份試卷各自的頁數、逐小題數、verified answer 數、review queue 數。
3. 總 question items、usable、review、excluded 數。
4. direct／partial／uncertain／out_of_scope 數。
5. image／answer／split 未解項目及完整 ID。
6. validator 完整輸出。
7. 連續兩次重建 SHA 比對。
8. protected input SHA 守恆聲明。
9. 實際新增或修改的檔案清單。
10. 明確聲明：未擴批、未生成題、未修改原始 PDF／canonical 資產、未 commit／push。

不得以「已完成報告」取代實際檔案、逐題證據或 validator 執行結果。
