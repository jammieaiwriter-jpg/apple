# Publisher unit inventory coverage

## Delivered

- 152 publisher chapter records: 2 publishers × G1–G4 × upper/lower semesters.
- Each record retains downloaded academic-year labels 108上–113下 but has **editionFamily = unknown**: no historic equivalence is assumed.
- Publisher-original subsection transcription remains incomplete. Inventory subsection labels are normalised SkillID candidates, never asserted as publisher wording.

## Official 108-code bridge

- Chapter rows with at least one official content code: 152/152 (100%).
- Unique official content codes represented: 81/85; unique linked learning-performance codes: 33.
- Every emitted content/performance code is checked against official-codes-g1-g4.json; codes are a chapter-level bridge only.
- No code is inferred from a claimed editionFamily; all chapter confidence remains medium because publisher historic editions and original subsections still require verification.

## Status exceptions

- cross_grade (0): 無
- enrichment (0): 無
- uncertain (0): 無

## Existing SkillID coverage

- Linked unique SkillIDs: 351/402.
- Missing from this publisher-title bridge (51): G1-11-01, G1-11-02, G1-11-03, G1-11-04, G1-11-05, G2-10-01, G2-10-02, G2-10-03, G2-10-04, G2-10-05, G3-03-01, G3-03-02, G3-03-03, G3-07-01, G3-07-02, G3-11-01, G3-11-02, G3-11-03, G3-11-04, G3-11-05, G3-15-01, G3-15-02, G3-15-03, G3-15-04, G3-15-05, G3-15-06, G3-15-07, G3-15-08, G3-15-09, G3-15-10, G3-15-11, G3-15-12, G3-15-13, G4-08-01, G4-08-02, G4-08-03, G4-08-04, G4-08-05, G4-08-06, G4-08-07, G4-16-01, G4-16-02, G4-16-03, G4-16-04, G4-16-05, G4-16-06, G4-16-07, G4-16-08, G4-16-09, G4-16-10, G4-16-11.
- A missing SkillID is a coverage gap, not evidence that it is out of curriculum; it may be a finer-grained/extension skill absent from the public publisher chapter title.

## Remaining limits before paper-level automatic alignment

1. Obtain original 康軒／翰林, date/version-specific tables of contents for each 108–113 edition family.
2. Replace normalised candidate subsection labels with original publisher subsection labels/pages before making subsection-level decisions.
3. Use paper OCR/image evidence to decide individual question scope; do not force a question to a chapter merely because it has a bridge code.
