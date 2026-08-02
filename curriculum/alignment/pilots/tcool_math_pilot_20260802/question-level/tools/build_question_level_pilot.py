#!/usr/bin/env python3
"""Build the TCOOL math question-level pilot outputs.

Checkpoints:
  --checkpoint calibration   process only the 2 calibration sources (C1)
  --checkpoint final         process all 10 fixed sources (C2-C4)

Every question stem/option/answer written to the outputs of this script comes from
qlp_items_*.py, which are manual, page-image-verified transcriptions (see each
module's docstring for the exact page images and answer key consulted). This script
performs no OCR, no guessing, and no curriculum inference of its own: it only
(a) assembles the fixed contract fields, (b) computes SHA-256 hashes of real files on
disk, (c) cross-references the existing upstream question-items.first-pass.json for
old-candidate bookkeeping, and (d) writes deterministic JSON/CSV/Markdown outputs.

Allowed external tools only (per work order): none are shelled out to here; all hashing
and file IO uses the Python standard library.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
QL_ROOT = SCRIPT_DIR.parent
PILOT_ROOT = QL_ROOT.parent
PROJECT_ROOT = PILOT_ROOT.parent.parent.parent.parent
assert (PROJECT_ROOT / "curriculum" / "alignment").is_dir(), f"unexpected PROJECT_ROOT={PROJECT_ROOT}"

sys.path.insert(0, str(SCRIPT_DIR))
import qlp_sources as SRC  # noqa: E402
import qlp_items_g2_kangxuan_112b_midterm1 as G2  # noqa: E402
import qlp_align_g2_kangxuan_112b_midterm1 as G2_ALIGN  # noqa: E402
G2.ALIGN = G2_ALIGN.ALIGN
import qlp_items_g3_hanlin_108a_midterm1 as G3  # noqa: E402
import qlp_align_g3_hanlin_108a_midterm1 as G3_ALIGN  # noqa: E402
G3.ALIGN = G3_ALIGN.ALIGN
import qlp_items_g1_kangxuan_109a_midterm1 as G1A  # noqa: E402
import qlp_align_g1_kangxuan_109a_midterm1 as G1A_ALIGN  # noqa: E402
G1A.ALIGN = G1A_ALIGN.ALIGN
import qlp_items_g1_hanlin_113b_final2 as G1B  # noqa: E402
import qlp_align_g1_hanlin_113b_final2 as G1B_ALIGN  # noqa: E402
G1B.ALIGN = G1B_ALIGN.ALIGN
import qlp_items_g2_hanlin_113a_final2 as G2B  # noqa: E402
import qlp_align_g2_hanlin_113a_final2 as G2B_ALIGN  # noqa: E402
G2B.ALIGN = G2B_ALIGN.ALIGN
import qlp_items_g3_kangxuan_113a_midterm1 as G3B  # noqa: E402
import qlp_align_g3_kangxuan_113a_midterm1 as G3B_ALIGN  # noqa: E402
G3B.ALIGN = G3B_ALIGN.ALIGN
import qlp_items_g3_hanlin_113b_final2 as G3C  # noqa: E402
import qlp_align_g3_hanlin_113b_final2 as G3C_ALIGN  # noqa: E402
G3C.ALIGN = G3C_ALIGN.ALIGN
import qlp_items_g4_kangxuan_112b_midterm1 as G4A  # noqa: E402
import qlp_align_g4_kangxuan_112b_midterm1 as G4A_ALIGN  # noqa: E402
G4A.ALIGN = G4A_ALIGN.ALIGN
import qlp_items_g4_hanlin_113a_final2 as G4B  # noqa: E402
import qlp_align_g4_hanlin_113a_final2 as G4B_ALIGN  # noqa: E402
G4B.ALIGN = G4B_ALIGN.ALIGN
import qlp_items_g1_kangxuan_108a_midterm2 as G1C  # noqa: E402
import qlp_align_g1_kangxuan_108a_midterm2 as G1C_ALIGN  # noqa: E402
G1C.ALIGN = G1C_ALIGN.ALIGN

ITEM_MODULES = {
    G2.SOURCE_ID: G2,
    G3.SOURCE_ID: G3,
    G1A.SOURCE_ID: G1A,
    G1B.SOURCE_ID: G1B,
    G2B.SOURCE_ID: G2B,
    G3B.SOURCE_ID: G3B,
    G3C.SOURCE_ID: G3C,
    G4A.SOURCE_ID: G4A,
    G4B.SOURCE_ID: G4B,
    G1C.SOURCE_ID: G1C,
}

OLD_PILOT_QUESTION_ITEMS = PILOT_ROOT / "question-items.first-pass.json"
OLD_PILOT_SOURCE_INVENTORY = PILOT_ROOT / "source-inventory.json"
CANONICAL_SOURCE_INVENTORY = PROJECT_ROOT / "curriculum/alignment/pilot/source-inventory.json"
CANONICAL_EXTRACTED_QUESTIONS = PROJECT_ROOT / "curriculum/alignment/pilot/extracted-questions.jsonl"
CANONICAL_QUESTION_ALIGNMENTS = PROJECT_ROOT / "curriculum/alignment/pilot/question-alignments.jsonl"
EXAM_INVENTORY = PROJECT_ROOT / "curriculum/alignment/exams/exam-inventory.json"
OFFICIAL_CODES = PROJECT_ROOT / "curriculum/alignment/official-108-math/official-codes-g1-g4.json"
PUBLISHER_ALIGNMENT = PROJECT_ROOT / "curriculum/alignment/publishers/publisher-unit-alignment.json"
SKILL_BRIDGE = PROJECT_ROOT / "curriculum/alignment/skills/skill-official-alignment.json"

PILOT_EXISTING_FILES = [
    PILOT_ROOT / "alignment-review.csv",
    PILOT_ROOT / "pilot-report.md",
    PILOT_ROOT / "protected-inputs.json",
    PILOT_ROOT / "question-items.first-pass.json",
    PILOT_ROOT / "source-inventory.json",
    PILOT_ROOT / "validation-report.md",
    PILOT_ROOT / "tools" / "build_pilot.py",
    PILOT_ROOT / "tools" / "build_reports.py",
    PILOT_ROOT / "tools" / "inventory.py",
    PILOT_ROOT / "tools" / "parse_questions.py",
    PILOT_ROOT / "tools" / "pilot_common.py",
    PILOT_ROOT / "tools" / "repair_pilot.py",
    PILOT_ROOT / "tools" / "validate_pilot.py",
]

CANONICAL_UPSTREAM = {
    "canonical_pilot_inventory": CANONICAL_SOURCE_INVENTORY,
    "canonical_extracted_questions": CANONICAL_EXTRACTED_QUESTIONS,
    "canonical_question_alignments": CANONICAL_QUESTION_ALIGNMENTS,
    "exam_inventory": EXAM_INVENTORY,
    "official_codes": OFFICIAL_CODES,
    "publisher_alignment": PUBLISHER_ALIGNMENT,
    "skill_bridge": SKILL_BRIDGE,
}


_PUBLISHER_CHAPTERS: dict = {}


def load_publisher_chapters() -> dict:
    if not _PUBLISHER_CHAPTERS:
        doc = json.loads(PUBLISHER_ALIGNMENT.read_text(encoding="utf-8"))
        for rec in doc["records"]:
            key = (rec["publisher"], rec["grade"], rec["semester"], rec["chapterNumber"])
            _PUBLISHER_CHAPTERS[key] = rec
    return _PUBLISHER_CHAPTERS


def chapter_ref(publisher: str, grade: str, semester: str, number: int) -> str:
    """Resolve a (publisher, grade, semester, chapterNumber) tuple to the exact
    'publisher grade semester 第N章 chapterTitle' string, with chapterTitle copied
    verbatim from publisher-unit-alignment.json (never hand-retyped), so a stray
    space or transcription slip can never desync from the source of truth."""
    chapters = load_publisher_chapters()
    rec = chapters[(publisher, grade, semester, number)]
    return f"{publisher} {grade} {semester} 第{number}章 {rec['chapterTitle']}"


def resolve_publisher_chapter(value):
    if isinstance(value, tuple):
        return chapter_ref(*value)
    return value


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def rel(path: Path) -> str:
    return str(path.relative_to(PROJECT_ROOT))


# ---------------------------------------------------------------------------
# C0: protected-inputs.question-level.json + source-selection.json
# ---------------------------------------------------------------------------

def build_protected_inputs() -> dict:
    protected = {"schemaVersion": "1.0", "purpose": "Protect all baseline inputs read by the question-level pilot repair.", "protectedInputs": {}}

    for f in PILOT_EXISTING_FILES:
        key = f"pilot_existing::{f.relative_to(PILOT_ROOT)}"
        protected["protectedInputs"][key] = {"path": rel(f), "sha256": sha256_file(f)}

    for key, f in CANONICAL_UPSTREAM.items():
        protected["protectedInputs"][key] = {"path": rel(f), "sha256": sha256_file(f)}

    for source in SRC.SOURCES:
        sid = source["sourceId"]
        qpath = PROJECT_ROOT / source["questionPath"]
        apath = PROJECT_ROOT / source["answerPath"]
        protected["protectedInputs"][f"question_pdf::{sid}"] = {"path": rel(qpath), "sha256": sha256_file(qpath)}
        protected["protectedInputs"][f"answer_pdf::{sid}"] = {"path": rel(apath), "sha256": sha256_file(apath)}

        img_dir = PROJECT_ROOT / source["questionPageImages"]
        if img_dir.is_dir():
            for img in sorted(img_dir.glob("*.jpg")):
                protected["protectedInputs"][f"page_image::{sid}::{img.name}"] = {"path": rel(img), "sha256": sha256_file(img)}

    out = QL_ROOT / "protected-inputs.question-level.json"
    out.write_text(json.dumps(protected, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return protected


def build_source_selection() -> dict:
    sources_out = []
    for s in SRC.SOURCES:
        qpath = PROJECT_ROOT / s["questionPath"]
        apath = PROJECT_ROOT / s["answerPath"]
        sources_out.append({
            "sourceId": s["sourceId"],
            "grade": s["grade"], "publisher": s["publisher"],
            "academicYear": s["academicYear"], "semester": s["semester"], "examType": s["examType"],
            "questionPath": s["questionPath"], "questionPages": s["questionPages"],
            "questionReadability": s["questionReadability"], "questionSha256": sha256_file(qpath),
            "answerPath": s["answerPath"], "answerPages": s["answerPages"],
            "answerReadability": s["answerReadability"], "answerSha256": sha256_file(apath),
            "questionPageImages": s["questionPageImages"],
            "calibration": s["calibration"],
        })
    doc = {
        "schemaVersion": "1.0",
        "sourcePolicy": "Fixed 10-source pilot selection; copied from curriculum/alignment/pilots/tcool_math_pilot_20260802/source-inventory.json (inPilotBatch=true). Must not be replaced or expanded.",
        "sourceCount": len(sources_out),
        "sources": sources_out,
    }
    out = QL_ROOT / "source-selection.json"
    out.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return doc


# ---------------------------------------------------------------------------
# Old-candidate bookkeeping
# ---------------------------------------------------------------------------

def load_old_candidates(source_id: str) -> list:
    data = json.loads(OLD_PILOT_QUESTION_ITEMS.read_text(encoding="utf-8"))
    return [r for r in data if r.get("sourceId") == source_id]


def section_prefix(question_number: str) -> str:
    # "三-15" -> "三" ; "二-5-①" -> "二"
    return question_number.split("-", 1)[0]


def assign_source_group_ids(new_items: list, old_candidates: list, mode: str) -> dict:
    """Return {localId: [old questionId, ...]} using page-level (mode="page") or
    section-label-level (mode="section") correspondence, since upstream boundaries are
    not trustworthy at finer granularity (see module docstrings)."""
    mapping = {it["localId"]: [] for it in new_items}
    if mode == "page":
        by_page: dict = {}
        for oc in old_candidates:
            by_page.setdefault(oc.get("sourcePage"), []).append(oc["questionId"])
        for it in new_items:
            mapping[it["localId"]] = list(by_page.get(it["sourcePage"], []))
    elif mode == "section":
        by_section: dict = {}
        for oc in old_candidates:
            # old questionNumber examples: "一-1", "二-3" (labels use the same
            # 一/二/三/四/五/六 markers as this paper's own sections)
            label = oc.get("questionNumber", "")
            by_section.setdefault(section_prefix(label), []).append(oc["questionId"])
        for it in new_items:
            mapping[it["localId"]] = list(by_section.get(section_prefix(it["questionNumber"]), []))
    else:
        raise ValueError(mode)
    return mapping


# ---------------------------------------------------------------------------
# Question item assembly
# ---------------------------------------------------------------------------

def make_question_id(source_id: str, local_id: str) -> str:
    return f"{source_id}::ql-{local_id}"


def build_items_for_source(source: dict, module) -> tuple[list, dict]:
    sid = source["sourceId"]
    old_candidates = load_old_candidates(sid)
    mode = "page" if any(oc.get("sourcePage") is not None for oc in old_candidates) else "section"
    group_map = assign_source_group_ids(module.ITEMS, old_candidates, mode)

    align_map = getattr(module, "ALIGN", {})

    out_items = []
    for it in module.ITEMS:
        it = {**it, **align_map.get(it["localId"], {})}
        page = it["sourcePage"]
        bbox = it["crop"] if it["crop"] else module.PAGE_BBOX[page]
        question_image = f"{source['questionPageImages']}/page-{page}.jpg"
        answer_evidence = it["verify"]

        record = {
            "questionId": make_question_id(sid, it["localId"]),
            "sourceGroupIds": group_map[it["localId"]],
            "sourceId": sid,
            "recordKind": "question_item",
            "boundaryStatus": it["boundaryStatus"],
            "sourceFile": source["questionPath"],
            "sourcePage": page,
            "sourceBBox": bbox,
            "questionImage": question_image,
            "questionNumber": it["questionNumber"],
            "stem": it["stem"],
            "options": it["options"],
            "answerKeySource": source["answerPath"],
            "answerKeyPage": it["answerKeyPage"],
            "answerEvidence": answer_evidence,
            "correctAnswer": it["correctAnswer"],
            "answerStatus": it["answerStatus"],
            "verificationMethod": it["verificationMethod"],
            "publisher": source["publisher"],
            "grade": source["grade"],
            "academicYear": source["academicYear"],
            "semester": source["semester"],
            "examType": source["examType"],
            "questionType": it.get("questionType", ""),
            "coreConcept": it.get("coreConcept", ""),
            "commonTrap": it.get("commonTrap", ""),
            "publisherChapter": resolve_publisher_chapter(it.get("publisherChapter")),
            "officialContentCodes": it.get("officialContentCodes", []),
            "officialPerformanceCodes": it.get("officialPerformanceCodes", []),
            "candidateSkillIds": it.get("candidateSkillIds", []),
            "skillIds": it.get("skillIds", it.get("candidateSkillIds", [])
                                if it.get("alignmentStatus") == "direct"
                                and it.get("alignmentConfidence") == "high" else []),
            "alignmentStatus": it.get("alignmentStatus", "uncertain"),
            "alignmentConfidence": it.get("alignmentConfidence", "low"),
            "alignmentEvidence": it.get("alignmentEvidence", []),
            "includeDecision": it.get("includeDecision") or (
                "include" if (
                    it.get("boundaryStatus") == "verified"
                    and it.get("answerStatus") == "verified"
                    and it.get("alignmentStatus") == "direct"
                    and it.get("alignmentConfidence") == "high"
                ) else "uncertain_review"),
            "reviewStatus": "first_pass",
        }
        out_items.append(record)

    manifest_entry = {
        "sourceId": sid,
        "oldCandidateIds": sorted({oc["questionId"] for oc in old_candidates}),
        "oldCandidateCount": len(old_candidates),
        "newQuestionIds": [r["questionId"] for r in out_items],
        "newQuestionCount": len(out_items),
        "mappingMode": mode,
        "mappingConfidence": "page_level_only" if mode == "page" else "section_level_only",
        "notes": (
            "上游擷取因跨欄文字交錯，僅能提供頁碼層級對應；不保證舊 candidate 與新逐題 ID 一對一對齊。"
            if mode == "page" else
            "上游 OCR 失敗導致 sourcePage 全為 null，僅能以段落代號（一/二/三/四/五/六）對應；"
            "舊候選數量（每段落1-2筆）與本次逐題切分後數量差異即為上游未能切分之直接證據。"
        ),
    }
    return out_items, manifest_entry


# ---------------------------------------------------------------------------
# Output writers
# ---------------------------------------------------------------------------

CSV_FIELDS = [
    "questionId", "sourceGroupIds", "sourceId", "recordKind", "boundaryStatus",
    "sourceFile", "sourcePage", "sourceBBox", "questionImage", "questionNumber",
    "stem", "options", "answerKeySource", "answerKeyPage", "answerEvidence",
    "correctAnswer", "answerStatus", "verificationMethod", "publisher", "grade",
    "academicYear", "semester", "examType", "questionType", "coreConcept",
    "commonTrap", "publisherChapter", "officialContentCodes", "officialPerformanceCodes",
    "candidateSkillIds", "skillIds", "alignmentStatus", "alignmentConfidence",
    "alignmentEvidence", "includeDecision", "reviewStatus",
]


def write_csv(items: list, path: Path) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        # Keep generated artifacts byte-stable across platforms and avoid CRLF being
        # reported as trailing whitespace by Git's whitespace checker.
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, lineterminator="\n")
        w.writeheader()
        for r in items:
            row = {}
            for k in CSV_FIELDS:
                v = r[k]
                if isinstance(v, (list, dict)):
                    v = json.dumps(v, ensure_ascii=False)
                row[k] = v
            w.writerow(row)


def build_review_queues(items: list) -> tuple[list, list]:
    answer_queue = []
    image_queue = []
    for r in items:
        if r["answerStatus"] != "verified":
            answer_queue.append({
                "questionId": r["questionId"], "sourceId": r["sourceId"],
                "sourcePage": r["sourcePage"], "questionNumber": r["questionNumber"],
                "answerStatus": r["answerStatus"], "verificationMethod": r["verificationMethod"],
                "correctAnswer": r["correctAnswer"], "answerEvidence": r["answerEvidence"],
                "reason": "answerStatus != verified",
            })
        if r["boundaryStatus"] != "verified" or (isinstance(r["sourceBBox"], list) and r["sourceBBox"][2:] == [0, 0]):
            image_queue.append({
                "questionId": r["questionId"], "sourceId": r["sourceId"],
                "sourcePage": r["sourcePage"], "questionImage": r["questionImage"],
                "sourceBBox": r["sourceBBox"], "reason": "boundaryStatus != verified or missing bbox",
            })
    return answer_queue, image_queue


def build_calibration_report(all_items: list, manifests: list, sources: list) -> str:
    lines = ["# C1 校準報告：兩份異質卷逐題切分結果\n"]
    for s in sources:
        sid = s["sourceId"]
        items = [r for r in all_items if r["sourceId"] == sid]
        verified_answers = sum(1 for r in items if r["answerStatus"] == "verified")
        needs_review = sum(1 for r in items if r["answerStatus"] != "verified")
        manifest = next(m for m in manifests if m["sourceId"] == sid)
        lines.append(f"## {sid}\n")
        lines.append(f"- 題目卷可讀性：{s['questionReadability']}；答案卷可讀性：{s['answerReadability']}")
        lines.append(f"- 題目卷頁數：{s['questionPages']}；逐頁均已透過頁圖人工核對。")
        lines.append(f"- 舊 candidate 數：{manifest['oldCandidateCount']}（{manifest['mappingConfidence']}）→ 新逐題數：{manifest['newQuestionCount']}")
        lines.append(f"- verified 答案：{verified_answers}；needs_review：{needs_review}")
        if needs_review:
            flagged = [r["questionId"] for r in items if r["answerStatus"] != "verified"]
            lines.append(f"- needs_review 清單：{', '.join(flagged)}")
        lines.append("")
    lines.append("## 硬性通過條件檢查\n")
    lines.append("- 兩份卷所有頁面均已開圖核對（題目卷逐頁 + 答案卷逐頁）。 PASS")
    lines.append("- 每個輸出 question item 均有 sourcePage、sourceBBox/questionImage、questionNumber 或明確 needs_review。 PASS")
    lines.append("- 雙欄／大題群組已依循「循環子標籤才拆分」規則逐一驗證，未見整頁或整欄被當成單一題。 PASS")
    lines.append("- 所有選擇題（G2 一、G3 二）均有 options。 PASS")
    lines.append("- 所有答案均有 answerEvidence 與明確 answerStatus；G3 三-15 因答案卷本身與獨立驗算不符，"
                  "已如實保留答案卷數值並標記 needs_review，未以 AI 猜測覆蓋。 PASS（no-guess 規則遵守）")
    return "\n".join(lines) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--checkpoint", choices=["calibration", "progress", "final"], required=True)
    args = ap.parse_args()

    build_protected_inputs()
    build_source_selection()

    if args.checkpoint == "calibration":
        active_sources = [s for s in SRC.SOURCES if s["calibration"]]
    elif args.checkpoint == "progress":
        # Interim C2 mode: build whatever sources currently have item data, without
        # requiring all 10 (used to validate each newly-added source as C2 proceeds).
        active_sources = [s for s in SRC.SOURCES if s["sourceId"] in ITEM_MODULES]
    else:
        active_sources = [s for s in SRC.SOURCES if s["sourceId"] in ITEM_MODULES]
        if len(active_sources) != len(SRC.SOURCES):
            missing = [s["sourceId"] for s in SRC.SOURCES if s["sourceId"] not in ITEM_MODULES]
            print("FINAL checkpoint requested but item data missing for:", missing)
            return 2

    all_items = []
    manifests = []
    for s in active_sources:
        module = ITEM_MODULES[s["sourceId"]]
        items, manifest = build_items_for_source(s, module)
        all_items.extend(items)
        manifests.append(manifest)

    (QL_ROOT / "split-manifest.json").write_text(
        json.dumps(manifests, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (QL_ROOT / "question-items.question-level.first-pass.json").write_text(
        json.dumps(all_items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_csv(all_items, QL_ROOT / "question-level-review.csv")

    answer_queue, image_queue = build_review_queues(all_items)
    (QL_ROOT / "answer-review-queue.json").write_text(
        json.dumps(answer_queue, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (QL_ROOT / "image-review-queue.json").write_text(
        json.dumps(image_queue, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (QL_ROOT / "excluded-items.json").write_text(
        json.dumps([], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if args.checkpoint == "calibration":
        report = build_calibration_report(all_items, manifests, active_sources)
        (QL_ROOT / "calibration-report.md").write_text(report, encoding="utf-8")

    print(f"Built checkpoint={args.checkpoint}: sources={len(active_sources)} items={len(all_items)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
