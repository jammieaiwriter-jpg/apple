# Alignment QA Report — Final Third Rerun

QA date: 2026-08-01
Scope: all `curriculum/alignment/` JSON/JSONL structure and references, plus a semantic check of every remaining `high` + `direct` pilot alignment. This QA modified no source data.

## PASS

### Structure, inventory, and reference integrity

- All alignment JSON and JSONL files parse successfully.
- Official baseline: 85 codes (G1 11, G2 24, G3 24, G4 26).
- Existing execution catalogue: 402 SkillIDs.
- Publisher bridge: 152 records (康軒 76, 翰林 76), every record has source evidence. It emits 81 official content codes, 33 performance codes, and 351 SkillIDs; every emitted reference resolves.
- Exam inventory: 393 papers; every question PDF and paired answer PDF exists. Pair status is `matched_present` 393. Exam-label distribution is 期中1 204 / 期中2 13 / 期末2 161 / 期末3 15.
- Pilot linkage: 15 selected papers, 15 source-inventory rows, 15 scope-validation rows, 180 extracted question groups, and 180 alignment rows. All source and question-ID joins resolve; there are no duplicate pilot question IDs.
- Pilot answer/image safety: answer status is `needs_review` 95 / `missing` 85; all 180 answer values remain null (no guessed answer). `needs_image` is true 50 / false 130.
- No dangling pilot references: all used official content codes (51), performance codes (12), and SkillIDs (12) exist in their source catalogues.

### Contract fixes and final semantic audit

- All 180 alignment rows now have contract-required `alignmentStatus`: `direct` 16, `partial` 82, `uncertain` 82.
- All 180 rows have `scope_outlier: "not_evaluable"`. No Boolean `false` or asserted outlier result remains while `expectedUnits` is unevidenced.
- Confidence matches status conservatism: high 16, medium 82, low 82.
- The prior five wrong mappings remain correctly repaired: three unsuitable SkillIDs were cleared and downgraded to `partial`/medium; ending-time and two-decimal-multiplication mappings were corrected to their exact SkillIDs.
- The subsequent three high/direct failures are now corrected: digit-card greatest/least-number and area-side-relation rows were cleared/downgraded; the dumpling money application now uses `G4-16-11` (小數乘法與加減混合應用題涉及貨幣).
- **All remaining 16 high/direct rows were manually rechecked against the actual existing SkillID names and the readable question text. No semantic SkillID mismatch remains.** Representative checks include:

| Prompt evidence | Final SkillID | Result |
| --- | --- | --- |
| 8588 → 8598 → … → 8628 | `G3-01-06` 順數和倒數 | PASS |
| 8個千、22個十、17個一組成與讀數 | `G3-01-02` 認識千位的概念 | PASS |
| 5467 > 54□6 | `G3-01-04` 比較大小—千位數字相同 | PASS |
| 16.3 由十個一與小積木組成 | `G3-16-03` 一位小數的數值 | PASS |
| 5000元平分4人／92朵分23束 | `G4-05-04` 除法應用題 | PASS |
| 9:20 加 2小時20分求結束時刻 | `G4-17-14` 應用題—結束時刻（12小時報時制） | PASS |
| 水餃單價3.5元、三人數量加總求金額 | `G4-16-11` 小數乘法與加減混合應用題涉及貨幣 | PASS |
| 0.67×23、1.02×28 | `G4-16-03` 兩位小數與兩位整數相乘 | PASS |

## WARN

- This is deliberately conservative pilot data, not a completed paper-level corpus: 16/180 are high/direct; 164/180 remain partial or uncertain; `expectedUnits`/scope is still non-evaluable.
- The publisher bridge covers 351/402 existing SkillIDs and 81/85 official content codes. Its remaining coverage gaps and `editionFamily: unknown` status must stay visible; it cannot prove a particular 108–113 paper's exact textbook edition or scope.
- The 50 `needs_image` groups and 180 unverified/missing answers cannot be promoted to final auto-checkable items without image review and answer-key pairing.

## Preprocessing release gate

### PASS

- `preprocess-inventory.json` contains 786 records: question 393 and answer 393. This equals the 393 paired-paper inventory and the preprocessing validation summary's expected/actual totals.
- All 786 `sourceId::role` keys and all 786 analysis paths are unique. `duplicateAnalysisPaths`, `missingMetadataPaths`, and `missingTextPaths` are all empty.
- Physical artifact check agrees with the JSON summary: 786 metadata JSON files and 786 direct text files exist at the recorded analysis paths.
- The preprocessing OCR temporary directory contains **0 PNG files**. The script's `finally` cleanup removes `page-*.png`, so no 300-DPI OCR intermediates are retained as accidental evidence artifacts.
- Readability counts sum to 786: `text_readable` 332 + `answer_key_only` 198 + `ocr_partial` 243 + `unreadable` 13. OCR-status counts also sum to 786: `not_needed` 530 + `completed` 243 + `insufficient` 13; there are **no `failed` records**.
- `render-queue.json` has 744 records and is a subset of the 786 preprocessing records (question 375, answer 369). This matches the summary's `renderQueue: 744`.
- The `safe_id` implementation is collision-safe for the source set: it retains a Unicode-readable slug **and** appends the first 12 hexadecimal characters of SHA-256 over the full UTF-8 `sourceId`; it never uses a lossy Chinese slug alone. Recomputing all 393 source IDs produced 393 distinct safe IDs (zero collisions).
- The latest two completed preprocessing runs are stable at the release-gate statistics: 786 records, OCR queue 13, render queue 744, and no OCR failures. The current summary is `valid: true` and its queues agree with the corresponding queue files.
- The concurrency repair is present in both implementation and operating instructions: `main()` takes a non-blocking exclusive `fcntl.flock` on `_analysis/.preprocess.lock` before cleanup or work; a concurrent invocation exits with status 3. `--retry-ocr-errors` retries only cached `failed`/`insufficient`/`blocked_missing_chi_tra` assets, while cache reuse otherwise requires the matching PDF fingerprint.

- `ocr-queue.json` now contains exactly 13 records, all `insufficient` (answer 13, question 0), matching `ocrQueue: 13` in the validation summary. The earlier 63 target and transient 173-record failure state are superseded; neither is present in the latest release artifacts.

## FAIL

No FAIL findings in the final release QA.

## Release decision

The 16 `high` + `direct` rows remain suitable as **conservative calibration/few-shot examples** for a batch extractor such as Google Antigravity CLI. They are **not authorization for full-volume final alignment**: the batch workflow must preserve `partial`, `uncertain`, `not_evaluable`, `needs_image`, and answer-review states; it must not invent a final SkillID, scope, or answer for the remaining evidence-limited records. The preprocessing release gate is now PASS.
