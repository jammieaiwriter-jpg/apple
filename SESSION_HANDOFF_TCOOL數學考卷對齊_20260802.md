# SESSION HANDOFF：TCOOL 數學考卷對齊與段考題庫

- 更新時間：2026-08-02（Asia/Taipei）
- Repo：`/Users/emma/02_小孩教育/Apple`
- GitHub：`jammieaiwriter-jpg/apple`
- Branch：`main`
- 最新相關 commit：`26b3032`（Sonnet 5 工單）
- 前一相關 commit：`383026a`（TCOOL pilot 稽核修復）
- 目前階段：來源／課綱／候選對齊；**尚未進題型矩陣、AI 生題或 HTML 上線**
- 發布判定：**NO-GO**

## 0. 新接手 agent 先做什麼

1. 完整閱讀：
   - `/Users/emma/02_小孩教育/Apple/AGENTS.md`
   - 本 handoff
   - `/Users/emma/02_小孩教育/Apple/curriculum/alignment/ALIGNMENT_CONTRACT.md`
   - `/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/validation-report.md`
   - `/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802/工單_Sonnet5_TCOOL數學Pilot逐題切分與答案複核_20260802.md`
2. 執行既有 validator，確認基線仍是 `Integrity=PASS; release=NO-GO`。
3. 檢查 Git，只能處理 `curriculum/alignment/` 本任務檔案；不得碰其他 141 筆既有未提交變更。
4. 下一張已核准工作是執行 Sonnet 5 question-level 工單；不得擴到 13、35 或 393 份。

基線驗證命令：

```bash
cd "/Users/emma/02_小孩教育/Apple"
python3 curriculum/alignment/pilots/tcool_math_pilot_20260802/tools/repair_pilot.py
python3 curriculum/alignment/pilots/tcool_math_pilot_20260802/tools/validate_pilot.py
```

預期輸出：

```text
Rebuilt 117 evidence-preserving candidate records from 10 existing pilot sources.
Integrity=PASS; release=NO-GO
```

## 1. 產品北極星與不可改變的架構

本系統以台灣段考為主軸，不以 KooBits 章節或 SkillID 當權威：

```text
108 官方課綱
  -> 康軒／翰林原始版次章節與小節
  -> 學校本次段考 expectedUnits
  -> 歷屆考卷逐題證據
  -> 題型矩陣
  -> 離線預生成＋獨立驗算的變式題
  -> 隨堂練習／段考範圍測試
  -> 依孩子乾淨答對、錯題、提示與看答案調整矩陣權重
```

權威順序固定為：

`108 官方課綱 > 出版社版次章節 > 本次段考範圍 > 考卷逐題證據 > SkillID > KooBits 分類`

KooBits 只借鏡技能顆粒度、短回合、難度分層、錯題回補與家長報告。不能用 KooBits SkillID 推翻官方碼、出版社版次或卷面範圍。詳見：

- `curriculum/alignment/KOOBITS_ADOPTION_DECISION.md`
- `curriculum/alignment/ALIGNMENT_CONTRACT.md`

## 2. 已完成的資料資產

### 2.1 108 課綱官方基準

檔案：

- `curriculum/alignment/official-108-math/official-codes-g1-g4.json`
- `curriculum/alignment/official-108-math/README.md`

現況：

- G1–G4 共 **85 個官方學習內容碼**。
- 涵蓋 N、S、R、D；資料保留官方頁碼、學習表現碼與來源。
- 官方碼是逐題對齊主標籤；SkillID 不是官方碼。

### 2.2 現有 SkillID 橋接

檔案：

- `curriculum/alignment/skills/skill-official-alignment.json`
- `curriculum/alignment/skills/coverage-summary.json`
- `curriculum/alignment/skills/QA_REPORT.md`

現況：

- 共 **402 個唯一 SkillID**。
- `direct: 312`、`partial: 60`、`cross_grade: 13`、`enrichment: 4`、`uncertain: 13`。
- 信心度：`high: 328`、`medium: 60`、`low: 14`。
- 389 筆有官方內容碼，13 筆沒有；69/85 官方碼已被 Skill 橋接使用。
- SkillID 與官方碼是多對多，不得裁成一對一。

### 2.3 康軒／翰林章節候選

檔案：

- `curriculum/alignment/publishers/publisher-unit-alignment.json`
- `curriculum/alignment/publishers/coverage-report.md`
- `curriculum/alignment/publishers/sources.md`

現況：

- 共 **152 個章節候選**：康軒 76、翰林 76。
- 152/152 都有 chapter-level 官方碼橋接。
- **152/152 的 `editionFamily` 仍是 `unknown`**。
- 目前章節與小節主要來自公開 publisher-oriented catalogue 與正規化 Skill 候選，不等於 108–113 各年度出版社原始目次。
- 原始、年度／版本可驗證的康軒／翰林目次與小節仍未補齊；不得宣稱不同年度版次相同。

### 2.4 TCOOL 考卷 inventory

檔案：

- `curriculum/alignment/exams/exam-inventory.json`
- `curriculum/alignment/exams/exam-scope-profiles.json`
- `curriculum/alignment/exams/validation-summary.json`

現況：

- **393 份題目卷＋393 份答案卷，393/393 配對成功**。
- 考次：`期中1: 204`、`期中2: 13`、`期末2: 161`、`期末3: 15`。
- 題目卷 readability：`text_readable: 332`、`scan_needs_ocr: 61`。
- 答案卷 readability：`answer_key_only: 198`、`scan_needs_ocr: 193`、`ocr_partial: 2`。
- 共 59 個 exam scope profiles；**59/59 的 `expectedUnits` 仍為空**。
- 28 個 profiles 有卷面範圍證據，但仍不足以把考次名稱直接等同固定章節。
- `expectedUnits` 與 `observedUnits` 必須分開；期末須判定 window／cumulative／unknown。

### 2.5 PDF 前處理

檔案：

- `curriculum/alignment/preprocessing/preprocess-inventory.json`
- `curriculum/alignment/preprocessing/validation-summary.json`
- `curriculum/alignment/preprocessing/ocr-queue.json`
- `curriculum/alignment/preprocessing/render-queue.json`

現況：

- **786/786** 份來源都有唯一前處理記錄與分析路徑。
- `text_readable: 332`、`ocr_partial: 243`、`answer_key_only: 198`、`unreadable: 13`。
- OCR：`completed: 243`、`not_needed: 530`、`insufficient: 13`。
- OCR queue 13；render queue 744。
- `tesseractChiTraAvailable=true`。
- `validation-summary.json` 的 `valid=true` 只表示 inventory／路徑結構完整，不表示逐題可用或答案已驗證。

## 3. 目前 10 份 Pilot 的真實狀態

目錄：

`curriculum/alignment/pilots/tcool_math_pilot_20260802/`

核心檔案：

- `source-inventory.json`
- `question-items.first-pass.json`
- `alignment-review.csv`
- `pilot-report.md`
- `validation-report.md`
- `protected-inputs.json`
- `tools/pilot_common.py`
- `tools/repair_pilot.py`
- `tools/validate_pilot.py`

真實統計：

- 10 份 pilot 來源，117 筆記錄。
- 117/117 都是 `question_group_candidate`，不是已完成逐小題。
- 答案有值：**0**。
- `answerStatus`：`missing: 35`、`needs_review: 82`。
- options 非空：**0**。
- `sourcePage` 缺失：35。
- `image_required`: 34；缺 `questionImage` path：0，但部分只指向頁圖／目錄，尚未逐題 crop。
- 對齊：`direct: 8`、`partial: 43`、`uncertain: 66`。
- 29 筆有多個官方碼；完整陣列已保存。
- 舊 35 份擴批清單只有 13 筆 canonical unique match，22 筆不存在；不得沿用舊清單。

判定：

- Integrity：**PASS**。
- Release：**NO-GO**。
- 尚不可進答案判分、題型矩陣、AI 生題或 HTML。

### 3.1 Legacy 腳本警告

以下三支是早期 Antigravity 失真產物，已在檔案開頭加 `SystemExit` 停用：

- `tools/build_pilot.py`
- `tools/parse_questions.py`
- `tools/build_reports.py`

不得移除停用保護，也不得用它們重建資料。只能使用 `repair_pilot.py` 與 `validate_pilot.py`。

## 4. 已發生的失敗與不要重踩的坑

### 4.1 Gemini 3.6 Flash Low

Antigravity 第一輪輸出存在：

- 117/117 答案為 null、options 全空。
- `pilot-report.md` 與實際 JSON 統計不一致。
- validation 把多項布林值硬編碼為通過。
- source inventory 對非 pilot metadata 使用假的預設值。
- 35 份下一批清單只有 13 份真實存在。
- 只把既有 15 份 pilot 轉格式，沒有真正重新解析 PDF。

因此 Flash Low 只適合 schema 已固定後的機械批次，不可負責語意裁決、答案對位或 release gate。

### 4.2 Antigravity 的 Claude Sonnet 4.6

本機 `agy models` 當時沒有 Sonnet 5，最近似模型為 `claude-sonnet-4-6`。

實測結果：

- 大量讀檔但沒有落地腳本。
- 會自行使用未允許的 `find`，造成 headless auto-deny。
- 同一 conversation 約 411 秒仍未產生修復檔，最後 timeout，已終止。
- 未修改原始 PDF 或 canonical assets。

結論：Antigravity harness 暫不適合需要多輪判斷的退修；只能在固定腳本、固定 schema、固定輸入後做機械批次。

### 4.3 Terra 修復

Terra 已完成 evidence-preserving 修復與真實 validator：

- 報告統計改由資料重算。
- 保存 answerStatus、完整多碼、SkillID、alignmentStatus、questionImage 與 canonical evidence。
- 新增 7 份 protected upstream SHA 驗證。
- repair／validate 可重跑，連跑輸出 SHA 一致。
- 誠實保留 `release=NO-GO`，未猜答案。

## 5. Antigravity CLI 現況

- CLI：`/Users/emma/.local/bin/agy`
- 版本：1.1.9（先前檢查值）
- 設定：`/Users/emma/.gemini/antigravity-cli/settings.json`
- trusted workspaces：
  - `/Users/emma/02_小孩教育/Apple`
  - `/Users/emma/02_小孩教育/Bobo`

主要 deny：

- `sudo`
- `rm -rf`
- `python3 -c`
- 讀寫 `~/.ssh/`
- 寫入 Apple／Bobo `.git/`

Sonnet 5 工單的兩支預定腳本已加入精確 allow：

- `question-level/tools/build_question_level_pilot.py`
- `question-level/tools/validate_question_level_pilot.py`

不要使用 `--dangerously-skip-permissions`。Antigravity command permission 是 token-prefix 規則；未列入 allow 的新命令仍會 Ask。新任務若要無人值守，應先建立固定腳本名稱、精確白名單，再 headless 執行，不要開 `command(*)`。

## 6. 下一張已開工單：Sonnet 5 Question-Level 修復

工單：

`curriculum/alignment/pilots/tcool_math_pilot_20260802/工單_Sonnet5_TCOOL數學Pilot逐題切分與答案複核_20260802.md`

工單重點：

- 現有 13 份 pilot 成果／腳本全部視為唯讀基線。
- Sonnet 5 只能新增／修改 `question-level/` 子目錄。
- C0 preflight → C1 一份文字卷＋一份掃描卷校準 → C2 剩餘 8 份 → C3 對齊 → C4 final validation。
- C1 失敗就停止，不得處理其餘 8 份。
- 每筆必須是一個可作答小題，有 source page、bbox／crop、答案證據與狀態。
- `from_answer_key` 不等於 `verified`；必須獨立驗算。
- 無法確認的答案、圖像、題號、官方碼、SkillID、出版社單元進 review queue，不得猜。
- 不擴批、不生成題、不建立矩陣、不做 HTML、不 commit／push。
- 最後由 Codex 獨立複驗、精準 stage、commit、push。

目前 `question-level/` 尚未被本 handoff 宣告完成。新 agent 接手時先檢查該目錄是否已出現；若已存在，視為 Sonnet 執行中或待複核，不得直接相信其報告。

## 7. Sonnet 5 完成後的 Codex 複核順序

1. 確認只修改 `question-level/`，沒有碰現有 pilot、PDF、canonical assets 或其他 repo 檔案。
2. 執行 C0 與 C4 validator，保留完整輸出。
3. 重算所有 protected SHA。
4. 任選至少：
   - 一份 text-readable 卷。
   - 一份 scan／OCR 卷。
   - 一題選擇題。
   - 一題圖像／表格／鐘面／幾何題。
   - 一題多官方碼題。
5. 視覺核對題目卷、答案卷、crop、題號與答案對位。
6. 檢查 `verified` 是否真的有 answer-key evidence＋獨立驗算。
7. 連續重建兩次，比對 JSON／CSV／報告 SHA。
8. `integrityPass` 與 `releaseDecision` 必須分開；內容 gate 未過仍是 NO-GO。
9. 只 stage `question-level/`；禁止 `git add -A`。

## 8. 尚未完成、會阻擋數學卷上線的工作

按依賴順序：

1. **Sonnet 5 question-level 逐題切分與答案／圖像證據複核**（目前工單）。
2. **補齊康軒／翰林各版次原始目次**，建立 edition family 指紋與有效年度，取代 152 筆 `unknown`。
3. **確認首發 MVP 真實範圍**：Emma 必須指定年級、出版社、學期、考次與孩子目前學校範圍；不能由 AI 猜。
4. **填 expectedUnits**：由原始目次＋卷面範圍證據建立；59 profiles 現在全空。
5. **逐題 alignment release gate**：只讓答案已驗、圖像完整、範圍內、`direct` 或經複核 `partial` 的題進可用集合。
6. **題型矩陣**：單元 × 觀念 × 題型 × 表徵 × 問法 × 陷阱 × 難度 × evidenceQuestionIds。
7. **12 題 MVP**：先做單一範圍的 12 題短回合及每題兩個離線 retry variants，全部獨立驗算。
8. **隨堂練習／段考測試 UI**：不得即時 AI 生題；只載入 verified 題庫。
9. **真機驗收**：iPad Safari／Chrome、進度保存、錯題／提示／看答案的 retry 誠信。

不要等待 393 份全部完成才做 MVP；但在一個可驗證範圍包完成前，也不得用未驗資料搶先上線。

## 9. 建議角色分工

- Sonnet 5：目前 10 份 pilot 的逐頁、逐題、答案卷與圖像語意複核；嚴格依工單。
- Terra：schema、可重跑 builder、validator、交叉引用、報告聚合。
- 視覺能力 agent／Luna：雙欄、圖形、鐘面、表格、題號與答案頁對位候選；不可作最終課綱政策。
- Antigravity CLI：schema 固定後的 PDF 前處理、OCR、批次候選與固定腳本執行；不可自行宣告 verified。
- 高價主代理：裁決版本衝突、跨年級／enrichment、抽驗與 release decision；不做大量 OCR 苦工。
- Emma：確認孩子真實年級／出版社／段考範圍，複核所有圖像、歧義與例外題，做最終 UAT。

## 10. Git 與工作樹安全

截至本 handoff 建立前：

- Branch：`main`，`origin/main` 已含 `26b3032`。
- 工作樹約有 **141 筆其他既有未提交變更**，涵蓋 bedtime、diamond、joy 等；這些不屬於本任務。
- staged files：0。
- 不得 reset、checkout、restore、刪除或整理其他人的變更。
- 只能使用精確路徑 `git add -- <本任務檔案>`。

相關 commits：

- `39aba26` — SkillID 對齊官方課綱。
- `4222d76` — TCOOL language PDF recovery（鄰近但非本數學 pilot）。
- `383026a` — TCOOL 數學 pilot evidence-preserving 修復與 validator。
- `26b3032` — Sonnet 5 question-level 工單。

## 11. 保護雜湊與健康檢查

修復前後已比對的集合雜湊：

- 786 份 TCOOL 數學來源 PDF 集合：`e7c8119ba8b44e8df3d70a7f250b0dc4e2d589bd`
- official／publisher／skills 資產集合：`2124ad0894aa8bd88eec7d9dc1559221d527f954`

Pilot 的 7 份逐檔 protected SHA 在：

`curriculum/alignment/pilots/tcool_math_pilot_20260802/protected-inputs.json`

不要把上述集合 SHA 當成單一檔案 SHA；它們是排序後逐檔 SHA 清單再聚合的健康檢查值。

重算命令：

```bash
cd "/Users/emma/02_小孩教育/Apple"
rg --files -0 source_materials/tcool_math_g1_g4_康軒_翰林 | sort -z | xargs -0 shasum | shasum
rg --files -0 curriculum/alignment/official-108-math curriculum/alignment/publishers curriculum/alignment/skills | sort -z | xargs -0 shasum | shasum
```

## 12. 交接完成條件

新 agent 只有在以下事項都回答清楚後才算真正接手：

- 現在為什麼是 NO-GO？
- 哪些資料是官方／canonical，哪些只是候選？
- 為什麼不能直接擴 35 或 393 份？
- Sonnet 5 只能修改哪個目錄？
- `from_answer_key` 與 `verified` 差在哪裡？
- 哪些 protected SHA 必須守恆？
- 哪些工作樹變更不能碰？
- 何時才能進題型矩陣與 AI 生題？

若任一答案不確定，先停在唯讀檢查，不要執行批次或修改資料。
