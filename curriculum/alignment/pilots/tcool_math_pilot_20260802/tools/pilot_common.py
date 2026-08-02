#!/usr/bin/env python3
"""Shared, evidence-preserving helpers for the TCOOL pilot repair.

This module deliberately treats the upstream alignment artefacts as protected
inputs.  It does not infer answers, split question groups, or manufacture
publisher / curriculum evidence.
"""

from __future__ import annotations

import csv
import hashlib
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


PILOT_DIR = Path(__file__).resolve().parents[1]
ROOT = PILOT_DIR.parents[3]

PATHS = {
    "canonical_pilot_inventory": ROOT / "curriculum/alignment/pilot/source-inventory.json",
    "canonical_extracted_questions": ROOT / "curriculum/alignment/pilot/extracted-questions.jsonl",
    "canonical_question_alignments": ROOT / "curriculum/alignment/pilot/question-alignments.jsonl",
    "exam_inventory": ROOT / "curriculum/alignment/exams/exam-inventory.json",
    "official_codes": ROOT / "curriculum/alignment/official-108-math/official-codes-g1-g4.json",
    "publisher_alignment": ROOT / "curriculum/alignment/publishers/publisher-unit-alignment.json",
    "skill_bridge": ROOT / "curriculum/alignment/skills/skill-official-alignment.json",
}
MANIFEST_PATH = PILOT_DIR / "protected-inputs.json"
INVENTORY_PATH = PILOT_DIR / "source-inventory.json"
ITEMS_PATH = PILOT_DIR / "question-items.first-pass.json"
CSV_PATH = PILOT_DIR / "alignment-review.csv"
PILOT_REPORT_PATH = PILOT_DIR / "pilot-report.md"
VALIDATION_REPORT_PATH = PILOT_DIR / "validation-report.md"

CSV_FIELDS = [
    "questionId", "sourceId", "recordKind", "questionBoundaryStatus",
    "sourceFile", "answerKeySource", "sourcePage", "questionImage",
    "questionNumber", "stem", "options", "correctAnswer", "answerStatus",
    "answerNote", "ocrQuality", "needsImage", "imageRequirement", "publisher",
    "grade", "academicYear", "semester", "examType", "questionType",
    "coreConcept", "commonTrap", "publisherChapter", "officialContentCodes",
    "officialPerformanceCodes", "candidateSkillIds", "skillIds", "alignmentStatus",
    "alignmentConfidence", "alignmentReason", "scopeOutlier", "includeDecision",
    "extractionEvidence", "alignmentEvidence", "canonicalExtracted",
    "canonicalAlignment", "reviewStatus",
]

ALLOWED_ALIGNMENT_STATUS = {"direct", "partial", "cross_grade", "enrichment", "uncertain"}
ALLOWED_CONFIDENCE = {"high", "medium", "low"}
ALLOWED_ANSWER_STATUS = {"missing", "from_answer_key", "ai_suggested", "verified", "needs_review"}


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def write_json(path: Path, payload: Any) -> None:
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def current_input_hashes() -> dict[str, dict[str, str]]:
    return {
        name: {"path": str(path.relative_to(ROOT)), "sha256": sha256(path)}
        for name, path in PATHS.items()
    }


def validate_or_bootstrap_input_manifest() -> dict[str, dict[str, str]]:
    """Freeze upstream inputs on first repair; later runs fail rather than mask drift."""
    current = current_input_hashes()
    if MANIFEST_PATH.exists():
        prior = load_json(MANIFEST_PATH)
        expected = prior.get("protectedInputs", {})
        if expected != current:
            changed = [name for name in current if expected.get(name) != current.get(name)]
            raise RuntimeError(
                "Protected upstream input hash changed; refusing to overwrite pilot output: "
                + ", ".join(changed)
            )
        return current
    write_json(MANIFEST_PATH, {
        "schemaVersion": "1.0",
        "purpose": "Guard upstream canonical inputs used by this pilot repair.",
        "protectedInputs": current,
    })
    return current


def json_cell(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def write_csv(items: list[dict[str, Any]]) -> None:
    with CSV_PATH.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELDS, lineterminator="\n")
        writer.writeheader()
        for item in items:
            writer.writerow({field: json_cell(item.get(field)) for field in CSV_FIELDS})


def read_csv_records() -> list[dict[str, Any]]:
    with CSV_PATH.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != CSV_FIELDS:
            raise ValueError("CSV fields do not match the evidence-preserving schema")
        return [{field: json.loads(row[field]) for field in CSV_FIELDS} for row in reader]


def counter_dict(values: list[Any]) -> dict[str, int]:
    return dict(sorted(Counter(values).items(), key=lambda pair: str(pair[0])))


def legacy_next_batch_matches() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Reconcile, but never enlarge, the 35 legacy compact recommendations."""
    legacy = [
        ("G1", "康軒", "110上", "期中1"), ("G1", "康軒", "111上", "期中1"),
        ("G1", "翰林", "110下", "期末2"), ("G1", "翰林", "111下", "期末2"),
        ("G1", "康軒", "112上", "期末2"), ("G1", "翰林", "112下", "期末2"),
        ("G1", "康軒", "113上", "期中1"), ("G1", "翰林", "113下", "期末1"),
        ("G2", "康軒", "110上", "期中1"), ("G2", "翰林", "110下", "期末2"),
        ("G2", "康軒", "111上", "期中1"), ("G2", "翰林", "111下", "期末2"),
        ("G2", "康軒", "112上", "期末2"), ("G2", "翰林", "112下", "期末2"),
        ("G2", "康軒", "113上", "期中1"), ("G2", "翰林", "113下", "期中1"),
        ("G2", "康軒", "113下", "期末2"),
        ("G3", "康軒", "110上", "期中1"), ("G3", "翰林", "110下", "期末2"),
        ("G3", "康軒", "111上", "期中1"), ("G3", "翰林", "111下", "期末2"),
        ("G3", "康軒", "112上", "期末2"), ("G3", "翰林", "112下", "期末2"),
        ("G3", "康軒", "113上", "期中2"), ("G3", "翰林", "113下", "期中1"),
        ("G3", "康軒", "113下", "期末2"),
        ("G4", "康軒", "110上", "期中1"), ("G4", "翰林", "110下", "期末2"),
        ("G4", "康軒", "111上", "期中1"), ("G4", "翰林", "111下", "期末2"),
        ("G4", "康軒", "112上", "期末2"), ("G4", "翰林", "112下", "期末2"),
        ("G4", "康軒", "113上", "期中1"), ("G4", "翰林", "113下", "期中1"),
        ("G4", "康軒", "113下", "期末2"),
    ]
    exams = load_json(PATHS["exam_inventory"])["exams"]
    matched, missing = [], []
    for grade, publisher, year_semester, exam_label in legacy:
        school_year, semester = year_semester[:3], year_semester[3:]
        hits = [
            exam for exam in exams
            if exam["grade"] == int(grade[1:])
            and exam["publisher"] == publisher
            and exam["school"] == "安和國小"
            and exam["schoolYear"] == school_year
            and exam["semester"] == semester
            and exam["examLabel"] == exam_label
        ]
        descriptor = f"{grade}-{publisher}-{year_semester}-{exam_label}-安和國小_新北市"
        if len(hits) == 1:
            matched.append({"legacyDescriptor": descriptor, "sourceId": hits[0]["id"]})
        else:
            missing.append({"legacyDescriptor": descriptor, "canonicalMatches": len(hits)})
    return matched, missing


def build_stats(items: list[dict[str, Any]], inventory: dict[str, Any]) -> dict[str, Any]:
    matched, legacy_missing = legacy_next_batch_matches()
    image_required = [item for item in items if item["imageRequirement"] == "image_required"]
    return {
        "itemCount": len(items),
        "selectedSourceCount": inventory.get("pilotSelectedCount"),
        "canonicalSourceCount": inventory.get("canonicalSourceCount"),
        "recordKind": counter_dict([item["recordKind"] for item in items]),
        "answerStatus": counter_dict([item["answerStatus"] for item in items]),
        "answerPresent": sum(item["correctAnswer"] is not None for item in items),
        "optionsEmpty": sum(not item["options"] for item in items),
        "sourcePageMissing": sum(item["sourcePage"] is None for item in items),
        "imageRequirement": counter_dict([item["imageRequirement"] for item in items]),
        "imageRequiredWithoutPath": sum(not item["questionImage"] for item in image_required),
        "alignmentStatus": counter_dict([item["alignmentStatus"] for item in items]),
        "alignmentConfidence": counter_dict([item["alignmentConfidence"] for item in items]),
        "officialCodeCardinality": counter_dict([len(item["officialContentCodes"]) for item in items]),
        "skillCardinality": counter_dict([len(item["skillIds"]) for item in items]),
        "legacyNextBatch": {"matched": matched, "missing": legacy_missing},
    }


def validate_pilot() -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    inventory = load_json(INVENTORY_PATH)
    items = load_json(ITEMS_PATH)
    hashes = current_input_hashes()
    manifest = load_json(MANIFEST_PATH) if MANIFEST_PATH.exists() else {}
    protected_hashes_match = manifest.get("protectedInputs") == hashes
    if not protected_hashes_match:
        errors.append("protected_input_hash_mismatch")

    source_rows = inventory.get("sources", [])
    source_by_id = {row.get("source_id"): row for row in source_rows}
    if len(source_by_id) != len(source_rows):
        errors.append("source_inventory_ids_not_unique")
    selected_source_ids = {row["source_id"] for row in source_rows if row.get("inPilotBatch")}
    if inventory.get("pilotSelectedCount") != len(selected_source_ids):
        errors.append("pilot_selected_count_mismatch")
    for source_id in selected_source_ids:
        source = source_by_id[source_id]
        for role in ("question", "answer"):
            path = source.get(role, {}).get("path")
            if not path or not (ROOT / path).exists():
                errors.append(f"missing_{role}_source:{source_id}")

    question_ids = [item.get("questionId") for item in items]
    if len(question_ids) != len(set(question_ids)):
        errors.append("question_ids_not_unique")

    official = {row["code"]: row for row in load_json(PATHS["official_codes"])["codes"]}
    skills = {row["skillId"]: row for row in load_json(PATHS["skill_bridge"])["records"]}
    for item in items:
        question_id = item.get("questionId", "<missing>")
        source_id = item.get("sourceId")
        if source_id not in selected_source_ids:
            errors.append(f"item_not_in_selected_source:{question_id}")
        if item.get("recordKind") != "question_group_candidate":
            errors.append(f"unsafe_question_granularity:{question_id}")
        if item.get("reviewStatus") != "first_pass":
            errors.append(f"review_status_not_first_pass:{question_id}")
        if item.get("alignmentStatus") not in ALLOWED_ALIGNMENT_STATUS:
            errors.append(f"invalid_alignment_status:{question_id}")
        if item.get("alignmentConfidence") not in ALLOWED_CONFIDENCE:
            errors.append(f"invalid_confidence:{question_id}")
        if item.get("answerStatus") not in ALLOWED_ANSWER_STATUS:
            errors.append(f"invalid_answer_status:{question_id}")
        if item.get("imageRequirement") == "image_required" and not item.get("questionImage"):
            errors.append(f"image_required_without_path:{question_id}")
        for path_field in ("sourceFile", "answerKeySource"):
            path = item.get(path_field)
            if not path or not (ROOT / path).exists():
                errors.append(f"missing_item_{path_field}:{question_id}")
        if item.get("questionImage") and not (ROOT / item["questionImage"]).exists():
            errors.append(f"missing_question_image:{question_id}")
        for code in item.get("officialContentCodes", []):
            if code not in official:
                errors.append(f"unknown_official_code:{question_id}:{code}")
            elif official[code]["grade"] != int(item["grade"][1:]):
                errors.append(f"official_code_grade_mismatch:{question_id}:{code}")
        for skill_id in item.get("candidateSkillIds", []) + item.get("skillIds", []):
            if skill_id not in skills:
                errors.append(f"unknown_skill_id:{question_id}:{skill_id}")
            elif skills[skill_id]["grade"] != int(item["grade"][1:]):
                errors.append(f"skill_grade_mismatch:{question_id}:{skill_id}")
        canonical_extracted = item.get("canonicalExtracted", {})
        canonical_alignment = item.get("canonicalAlignment", {})
        checks = {
            "sourceId": canonical_extracted.get("source_id"),
            "sourcePage": canonical_extracted.get("source_page"),
            "questionImage": canonical_extracted.get("question_image"),
            "options": canonical_extracted.get("options", []),
            "correctAnswer": canonical_extracted.get("answer"),
            "answerStatus": canonical_extracted.get("answer_status"),
            "officialContentCodes": canonical_alignment.get("officialContentCodes", []),
            "officialPerformanceCodes": canonical_alignment.get("officialPerformanceCodes", []),
            "candidateSkillIds": canonical_alignment.get("candidateSkillIds", []),
            "skillIds": canonical_alignment.get("skillIds", []),
            "alignmentStatus": canonical_alignment.get("alignmentStatus"),
            "alignmentConfidence": canonical_alignment.get("confidence"),
        }
        for field, expected in checks.items():
            if item.get(field) != expected:
                errors.append(f"canonical_field_not_preserved:{question_id}:{field}")

    try:
        csv_items = read_csv_records()
        if len(csv_items) != len(items):
            errors.append("csv_row_count_mismatch")
        else:
            json_rows = {item["questionId"]: item for item in items}
            csv_rows = {item["questionId"]: item for item in csv_items}
            if set(json_rows) != set(csv_rows):
                errors.append("csv_question_id_set_mismatch")
            elif any(json_rows[key] != csv_rows[key] for key in json_rows):
                errors.append("csv_json_content_mismatch")
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        errors.append(f"csv_unreadable_or_non_parity:{exc}")

    stats = build_stats(items, inventory)
    no_go_gates = []
    if stats["recordKind"].get("question_group_candidate", 0):
        no_go_gates.append("all records remain unsplit question-group candidates")
    if stats["answerPresent"] < stats["itemCount"]:
        no_go_gates.append("item-level answer evidence is absent for one or more records")
    if stats["optionsEmpty"]:
        no_go_gates.append("options are unavailable for one or more records")
    if stats["sourcePageMissing"]:
        no_go_gates.append("source-page evidence is missing for one or more records")
    if stats["alignmentStatus"].get("uncertain", 0):
        no_go_gates.append("one or more records retain uncertain curriculum alignment")
    return {
        "integrityPass": not errors,
        "releaseDecision": "GO" if not errors and not no_go_gates else "NO-GO",
        "errors": sorted(set(errors)),
        "warnings": warnings,
        "noGoGates": no_go_gates,
        "protectedInputHashes": hashes,
        "protectedHashesMatch": protected_hashes_match,
        "stats": stats,
    }


def write_reports(result: dict[str, Any]) -> None:
    stats = result["stats"]
    legacy = stats["legacyNextBatch"]
    lines = [
        "# TCOOL 數學考卷 Pilot 第一批修復報告",
        "",
        "## 結論",
        "",
        f"- 發布判定：**{result['releaseDecision']}**",
        "- 這是逐筆證據保存與對齊候選資料，不是可自動判分題庫；未生成題目、矩陣或 HTML。",
        f"- 117 筆均標為 `question_group_candidate`，因上游抽取未能安全確認小題邊界。",
        "",
        "## 真實統計（與 validation-report.md 同一份資料）",
        "",
        f"- Pilot 選取來源：{stats['selectedSourceCount']} 份（canonical source inventory 共 {stats['canonicalSourceCount']} 份）。",
        f"- 候選記錄：{stats['itemCount']}；答案有來源：{stats['answerPresent']}；空選項：{stats['optionsEmpty']}。",
        f"- answerStatus：`{json_cell(stats['answerStatus'])}`。",
        f"- sourcePage 缺失：{stats['sourcePageMissing']}；image_required：{stats['imageRequirement'].get('image_required', 0)}；其中缺 questionImage path：{stats['imageRequiredWithoutPath']}。",
        f"- alignmentStatus：`{json_cell(stats['alignmentStatus'])}`；confidence：`{json_cell(stats['alignmentConfidence'])}`。",
        f"- 官方碼筆數分布：`{json_cell(stats['officialCodeCardinality'])}`；SkillID 筆數分布：`{json_cell(stats['skillCardinality'])}`。",
        "",
        "## 未解 NO-GO gates",
        "",
    ]
    lines += [f"- {gate}" for gate in result["noGoGates"]] or ["- 無"]
    lines += [
        "",
        "## 下一批舊清單對帳（不擴批）",
        "",
        f"舊有 35 筆簡寫建議，只有 **{len(legacy['matched'])} 筆**在 canonical exam inventory 中唯一匹配；其餘 **{len(legacy['missing'])} 筆**未匹配，已排除而非以其他考卷補位。以下是唯一允許進入後續人工選批的完整 `sourceId`：",
        "",
    ]
    lines += [f"- `{row['sourceId']}`" for row in legacy["matched"]]
    lines += [
        "",
        "未匹配舊描述（不作替代選取）：",
        "",
    ]
    lines += [f"- `{row['legacyDescriptor']}`" for row in legacy["missing"]]
    lines += [
        "",
        "## Protected upstream inputs",
        "",
        "所有下列 SHA-256 於驗證時重新計算，並與 `protected-inputs.json` 比對：",
        "",
    ]
    lines += [f"- `{name}`: `{info['sha256']}`" for name, info in result["protectedInputHashes"].items()]
    lines += ["", f"完整性驗證：**{'PASS' if result['integrityPass'] else 'FAIL'}**。"]
    PILOT_REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

    validation = [
        "# TCOOL 數學考卷 Pilot 驗證報告",
        "",
        "## Verdict",
        "",
        f"- Integrity：**{'PASS' if result['integrityPass'] else 'FAIL'}**",
        f"- Release decision：**{result['releaseDecision']}**",
        f"- Protected upstream hashes match：**{'yes' if result['protectedHashesMatch'] else 'no'}**",
        "",
        "## Checked evidence",
        "",
        f"- source existence、sourceId / questionId uniqueness、官方碼與 SkillID existence / grade consistency、status consistency、答案／選項／圖像缺口、多碼陣列保存、CSV/JSON parity、報告統計與 protected SHA。",
        f"- Records: {stats['itemCount']}; selected sources: {stats['selectedSourceCount']}; sourcePage missing: {stats['sourcePageMissing']}; image-required missing path: {stats['imageRequiredWithoutPath']}.",
        f"- answer present: {stats['answerPresent']}; options empty: {stats['optionsEmpty']}; candidates: {stats['recordKind'].get('question_group_candidate', 0)}.",
        "",
        "## Integrity errors",
        "",
    ]
    validation += [f"- `{error}`" for error in result["errors"]] or ["- 無"]
    validation += ["", "## Release blockers", ""]
    validation += [f"- {gate}" for gate in result["noGoGates"]] or ["- 無"]
    validation += ["", "## Protected input SHA-256", ""]
    validation += [f"- `{name}`: `{info['sha256']}`" for name, info in result["protectedInputHashes"].items()]
    VALIDATION_REPORT_PATH.write_text("\n".join(validation) + "\n", encoding="utf-8")


def report_count_errors(result: dict[str, Any]) -> list[str]:
    """Check the rendered reports, not merely the in-memory counters."""
    stats = result["stats"]
    expected_pilot_fragments = [
        f"候選記錄：{stats['itemCount']}；答案有來源：{stats['answerPresent']}；空選項：{stats['optionsEmpty']}。",
        f"sourcePage 缺失：{stats['sourcePageMissing']}；image_required：{stats['imageRequirement'].get('image_required', 0)}；其中缺 questionImage path：{stats['imageRequiredWithoutPath']}。",
        f"只有 **{len(stats['legacyNextBatch']['matched'])} 筆**",
        f"其餘 **{len(stats['legacyNextBatch']['missing'])} 筆**未匹配",
    ]
    expected_validation_fragments = [
        f"Records: {stats['itemCount']}; selected sources: {stats['selectedSourceCount']}; sourcePage missing: {stats['sourcePageMissing']}; image-required missing path: {stats['imageRequiredWithoutPath']}.",
        f"answer present: {stats['answerPresent']}; options empty: {stats['optionsEmpty']}; candidates: {stats['recordKind'].get('question_group_candidate', 0)}.",
    ]
    pilot_text = PILOT_REPORT_PATH.read_text(encoding="utf-8") if PILOT_REPORT_PATH.exists() else ""
    validation_text = VALIDATION_REPORT_PATH.read_text(encoding="utf-8") if VALIDATION_REPORT_PATH.exists() else ""
    errors = []
    if any(fragment not in pilot_text for fragment in expected_pilot_fragments):
        errors.append("pilot_report_count_mismatch")
    if any(fragment not in validation_text for fragment in expected_validation_fragments):
        errors.append("validation_report_count_mismatch")
    return errors
