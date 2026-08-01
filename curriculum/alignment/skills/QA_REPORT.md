# SkillID ↔ 108 課綱橋接 QA — Final Release Rerun

QA date: 2026-08-01
Scope: structural revalidation plus targeted rerun of the seven records changed after the prior independent audit. The mapping was not modified by QA.

## PASS

### Structure and summary

- The mapping still contains exactly 402 records and 402 unique SkillIDs. Its set exactly equals the four source catalogues: G1 79, G2 79, G3 96, G4 148; no missing or extra SkillID exists.
- All official content/performance references resolve. No `direct` or `partial` record emits a different-grade content code.
- Only the 13 `uncertain` records have empty official-code arrays; their evidence and notes remain present.
- `coverage-summary.json` recomputes exactly from the mapping:

| Metric | Recomputed value |
| --- | ---: |
| direct | 312 |
| partial | 60 |
| cross_grade | 13 |
| enrichment | 4 |
| uncertain | 13 |
| high / medium / low | 328 / 60 / 14 |
| records with / without content codes | 389 / 13 |
| official content-code coverage | 69 / 85 |

The summary's SkillID totals, status counts, confidence counts, grade counts, used/unused code sets, and with/without-code totals all match independent recomputation.

### Targeted correction audit

All seven affected records now pass:

- `G4-01-01` is `cross_grade/high` with G3 `N-3-1`. This correctly represents “萬以內的數（複習）” and prevents its G4 chapter from forcing `N-4-1`.
- `G4-13-12`, `G4-13-16`, and `G4-13-17` are `enrichment/high`, retaining `S-4-3` only as the nearest official baseline. Their notes explicitly preserve the official two-shape/simple-composite limit and explain why “複雜複合圖形” exceeds it.
- `G4-05-04` is `partial/medium` with `N-4-2`. Its notes correctly require question evidence before adding or preferring `N-4-3` for two-step/continued-division problems.
- `G1-15-03` now has `matchedCodes: [N-1-6]` and separately records rejected `N-2-14` under `consideredButRejectedCodes`.
- `G1-16-03` now has `matchedCodes: [N-1-2]` and separately records rejected `R-2-2` under `consideredButRejectedCodes`.

The last two records now distinguish emitted evidence from considered/rejected alternatives without losing the reasoning trail.

### Prior audit coverage retained

The release decision also relies on the completed prior audit: 12 distributed records per grade (48 total), all 13 then-uncertain records, all 12 then-cross-grade records, and the then-single enrichment record were manually reviewed. This rerun did not expand sampling; it revalidated only the changed records and structural outputs as requested.

## WARN

- There are still 29 chapters with at least three skills sharing one identical content-code signature (40 chapters if singleton/two-skill chapters are included). This is acceptable only because official codes are often intentionally broader than SkillIDs; downstream logic must continue reading each row's `alignmentStatus`, confidence, evidence, and notes rather than treating a chapter code as an automatic per-skill truth.
- In particular, `partial`, `cross_grade`, `enrichment`, and `uncertain` must remain active boundaries in matrix generation. They must not be silently promoted to `direct` to maximize coverage.
- Publisher `editionFamily` and exam scope are separate evidence layers. This bridge cannot identify a paper's publisher edition or prove that a question appeared within a specific assessment range.

## FAIL

No FAIL findings remain in the targeted release rerun.

## Final release decision

**PASS for use as “題型矩陣候選課綱標籤”.** The matrix pipeline may use this bridge to propose official-code candidates while preserving status and confidence.

This release does **not** mean per-question exam alignment is complete. Each paper question still requires question text/image evidence, publisher/edition and exam-scope checks, `needs_image`, `scope_outlier`, confidence, and answer-status review. The bridge must not be used alone to claim that all 393 papers—or any individual paper—have finished final alignment.
