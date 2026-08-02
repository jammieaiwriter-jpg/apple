#!/usr/bin/env python3
"""Rebuild this pilot only, preserving every upstream evidence field verbatim."""

from __future__ import annotations

import argparse
import ast
from copy import deepcopy

from pilot_common import (
    CSV_PATH, INVENTORY_PATH, ITEMS_PATH, PATHS, PILOT_DIR, ROOT, load_json,
    load_jsonl, report_count_errors, validate_or_bootstrap_input_manifest,
    validate_pilot, write_csv, write_json, write_reports,
)


def existing_selection() -> set[str]:
    """Use the established pilot selection; never select a replacement source."""
    if INVENTORY_PATH.exists():
        existing = load_json(INVENTORY_PATH)
        selected = {
            row["source_id"] for row in existing.get("sources", [])
            if row.get("inPilotBatch") or row.get("in_pilot_batch")
        }
        if selected:
            return selected
    if ITEMS_PATH.exists():
        selected = {item["sourceId"] for item in load_json(ITEMS_PATH) if item.get("sourceId")}
        if selected:
            return selected
    # The old parser is retained as an auditable, pilot-local selection record.
    # Read its literal only; never execute the legacy script.
    legacy_path = PILOT_DIR / "tools" / "parse_questions.py"
    if legacy_path.exists():
        tree = ast.parse(legacy_path.read_text(encoding="utf-8"), filename=str(legacy_path))
        for node in tree.body:
            if isinstance(node, ast.Assign) and any(
                isinstance(target, ast.Name) and target.id == "selected_10_ids"
                for target in node.targets
            ):
                value = ast.literal_eval(node.value)
                if isinstance(value, list) and all(isinstance(source_id, str) for source_id in value):
                    return set(value)
    raise RuntimeError("No existing pilot selection found; pass one or more --source-id values explicitly.")


def source_metadata(source_id: str) -> dict[str, str]:
    grade, publisher, year_semester, exam_type, *_ = source_id.split("-")
    return {
        "grade": grade,
        "publisher": publisher,
        "academicYear": year_semester[:3],
        "semester": year_semester[3:],
        "examType": exam_type,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-id", action="append", default=[], help="Explicitly restore a known pilot source; no discovery occurs.")
    args = parser.parse_args()

    validate_or_bootstrap_input_manifest()
    selected = set(args.source_id) if args.source_id else existing_selection()
    canonical_sources = load_json(PATHS["canonical_pilot_inventory"])["sources"]
    source_by_id = {source["source_id"]: source for source in canonical_sources}
    unknown = sorted(selected - set(source_by_id))
    if unknown:
        raise RuntimeError("Selected source is not in canonical pilot inventory: " + ", ".join(unknown))

    sources = []
    for source in canonical_sources:
        row = deepcopy(source)
        row["inPilotBatch"] = source["source_id"] in selected
        sources.append(row)
    inventory = {
        "schemaVersion": "2.0",
        "sourcePolicy": "Copied from canonical pilot inventory; readability and pages are never inferred here.",
        "canonicalSourceInventory": str(PATHS["canonical_pilot_inventory"].relative_to(ROOT)),
        "canonicalSourceCount": len(canonical_sources),
        "pilotSelectedCount": len(selected),
        "sources": sources,
    }

    extracted = {row["id"]: row for row in load_jsonl(PATHS["canonical_extracted_questions"])}
    alignments = {row["question_id"]: row for row in load_jsonl(PATHS["canonical_question_alignments"])}
    items = []
    for question_id, extraction in extracted.items():
        source_id = extraction.get("source_id")
        if source_id not in selected:
            continue
        alignment = alignments.get(question_id)
        if alignment is None:
            raise RuntimeError(f"Missing canonical alignment for {question_id}")
        source = source_by_id[source_id]
        metadata = source_metadata(source_id)
        needs_image = bool(extraction.get("needs_image"))
        canonical_options = extraction.get("options", [])
        item = {
            "questionId": question_id,
            "sourceId": source_id,
            "recordKind": "question_group_candidate",
            "questionBoundaryStatus": "not_verified_from_available_extraction",
            "sourceFile": source["question"]["path"],
            "answerKeySource": extraction.get("answer_key_source") or source["answer"]["path"],
            "sourcePage": extraction.get("source_page"),
            "questionImage": extraction.get("question_image"),
            "questionNumber": extraction.get("original_number"),
            "stem": extraction.get("raw_text"),
            "options": canonical_options,
            "correctAnswer": extraction.get("answer"),
            "answerStatus": extraction.get("answer_status"),
            "answerNote": extraction.get("answer_note"),
            "ocrQuality": extraction.get("ocr_quality"),
            "needsImage": needs_image,
            "imageRequirement": "image_required" if needs_image else "text_only",
            **metadata,
            "questionType": alignment.get("question_type"),
            "coreConcept": alignment.get("core_concept"),
            "commonTrap": alignment.get("common_trap"),
            "publisherChapter": alignment.get("publisherChapter"),
            "officialContentCodes": alignment.get("officialContentCodes", []),
            "officialPerformanceCodes": alignment.get("officialPerformanceCodes", []),
            "candidateSkillIds": alignment.get("candidateSkillIds", []),
            "skillIds": alignment.get("skillIds", []),
            "alignmentStatus": alignment.get("alignmentStatus"),
            "alignmentConfidence": alignment.get("confidence"),
            "alignmentReason": alignment.get("notes"),
            "scopeOutlier": alignment.get("scope_outlier"),
            "includeDecision": alignment.get("include_decision"),
            "extractionEvidence": {
                "ocrQuality": extraction.get("ocr_quality"),
                "needsImage": extraction.get("needs_image"),
                "questionImage": extraction.get("question_image"),
                "sourcePage": extraction.get("source_page"),
                "answerKeySource": extraction.get("answer_key_source"),
                "answerNote": extraction.get("answer_note"),
            },
            "alignmentEvidence": {
                "publisherChapter": alignment.get("publisherChapter"),
                "notes": alignment.get("notes"),
                "scopeOutlier": alignment.get("scope_outlier"),
                "includeDecision": alignment.get("include_decision"),
            },
            "canonicalExtracted": extraction,
            "canonicalAlignment": alignment,
            "reviewStatus": "first_pass",
        }
        items.append(item)
    items.sort(key=lambda item: item["questionId"])

    write_json(INVENTORY_PATH, inventory)
    write_json(ITEMS_PATH, items)
    write_csv(items)
    result = validate_pilot()
    write_reports(result)
    result["errors"].extend(report_count_errors(result))
    result["errors"] = sorted(set(result["errors"]))
    result["integrityPass"] = not result["errors"]
    if not result["integrityPass"]:
        result["releaseDecision"] = "NO-GO"
        write_reports(result)
    print(f"Rebuilt {len(items)} evidence-preserving candidate records from {len(selected)} existing pilot sources.")
    print(f"Integrity={'PASS' if result['integrityPass'] else 'FAIL'}; release={result['releaseDecision']}")
    return 0 if result["integrityPass"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
