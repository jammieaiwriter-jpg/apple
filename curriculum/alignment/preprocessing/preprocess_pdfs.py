#!/usr/bin/env python3
"""Deterministic, resumable PDF evidence preprocessing (no semantic alignment)."""
from __future__ import annotations

import argparse
import fcntl
import hashlib
import json
import re
import unicodedata
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
INVENTORY = ROOT / "curriculum/alignment/exams/exam-inventory.json"
SOURCE_ROOT = ROOT / "source_materials/tcool_math_g1_g4_康軒_翰林"
ANALYSIS_ROOT = SOURCE_ROOT / "_analysis"
OUT_ROOT = ROOT / "curriculum/alignment/preprocessing"
MIN_DIRECT_CHARS = 80


def run(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                          encoding="utf-8", errors="replace", check=False)


def safe_id(value: str) -> str:
    """Readable Unicode slug plus full-source-id digest; never use a lossy slug alone."""
    slug = unicodedata.normalize("NFKC", value)
    slug = re.sub(r"[^\w.-]+", "_", slug, flags=re.UNICODE).strip("_.")
    slug = slug[:72] or "source"
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()[:12]
    return f"{slug}-{digest}"


def fingerprint(path: Path) -> dict[str, int]:
    stat = path.stat()
    return {"size": stat.st_size, "mtimeNs": stat.st_mtime_ns}


def pages(pdf: Path) -> tuple[int | None, str | None]:
    result = run("pdfinfo", str(pdf))
    if result.returncode:
        return None, result.stderr.strip() or "pdfinfo failed"
    match = re.search(r"^Pages:\s+(\d+)", result.stdout, re.M)
    return (int(match.group(1)) if match else None), None


def inspect_pdf(pdf: Path) -> tuple[int, int, str | None]:
    fonts = run("pdffonts", str(pdf))
    images = run("pdfimages", "-list", str(pdf))
    error = None
    if fonts.returncode:
        error = fonts.stderr.strip() or "pdffonts failed"
    elif images.returncode:
        error = images.stderr.strip() or "pdfimages -list failed"
    font_count = max(0, len([line for line in fonts.stdout.splitlines()[2:] if line.strip()]))
    image_count = len([line for line in images.stdout.splitlines() if re.match(r"^\s*\d+\s+\d+\s+", line)])
    return font_count, image_count, error


def extract_direct(pdf: Path, text_path: Path) -> tuple[str, str | None]:
    text_path.parent.mkdir(parents=True, exist_ok=True)
    result = run("pdftotext", "-layout", str(pdf), str(text_path))
    if result.returncode:
        return "", result.stderr.strip() or "pdftotext failed"
    try:
        return text_path.read_text(encoding="utf-8", errors="replace"), None
    except OSError as exc:
        return "", str(exc)


def ocr(pdf: Path, ocr_dir: Path, page_count: int | None) -> tuple[str, str | None]:
    ocr_dir.mkdir(parents=True, exist_ok=True)
    prefix = ocr_dir / "page"
    try:
        rendered = run("pdftoppm", "-r", "300", "-png", str(pdf), str(prefix))
        if rendered.returncode:
            return "", rendered.stderr.strip() or "pdftoppm failed"
        outputs: list[str] = []
        pngs = sorted(ocr_dir.glob("page-*.png"))
        if page_count is not None and len(pngs) != page_count:
            return "", f"OCR rendered {len(pngs)} pages; expected {page_count}"
        for png in pngs:
            base = png.with_suffix("")
            result = run("tesseract", str(png), str(base), "-l", "chi_tra+eng", "--psm", "4")
            if result.returncode:
                return "", result.stderr.strip() or f"tesseract failed for {png.name}"
            text_file = base.with_suffix(".txt")
            outputs.append(text_file.read_text(encoding="utf-8", errors="replace"))
        return "\n\f\n".join(outputs), None
    finally:
        # These 300-DPI page images are OCR-only temporary files. Keep text, never images.
        for png in ocr_dir.glob("page-*.png"):
            png.unlink(missing_ok=True)


def process_asset(item: dict, role: str, tess_ok: bool, force: bool, retry_ocr_errors: bool) -> dict:
    source_id = item["id"]
    source = item[role]
    pdf = ROOT / source["path"]
    asset_dir = ANALYSIS_ROOT / "assets" / safe_id(source_id)
    base = asset_dir / role
    metadata_path = base.with_suffix(".json")
    if metadata_path.exists() and not force:
        try:
            cached = json.loads(metadata_path.read_text())
            retryable = cached.get("ocrStatus") in {"failed", "insufficient", "blocked_missing_chi_tra"}
            if cached.get("fingerprint") == fingerprint(pdf) and not (retry_ocr_errors and retryable):
                return cached
        except (OSError, json.JSONDecodeError):
            pass
    record = {
        "sourceId": source_id, "role": role, "path": source["path"],
        "analysisPath": str(base.relative_to(ROOT)), "fingerprint": fingerprint(pdf),
        "pages": None, "textCharacters": 0, "readability": "unreadable",
        "method": [], "ocrStatus": "not_needed", "needsImageReview": False, "error": None,
        "fontCount": 0, "embeddedImageCount": 0,
    }
    if not pdf.is_file():
        record["error"] = "source PDF missing"
        return record
    count, err = pages(pdf); record["pages"] = count; record["method"].append("pdfinfo")
    fonts, images, inspect_err = inspect_pdf(pdf)
    record["fontCount"], record["embeddedImageCount"] = fonts, images
    record["method"].extend(["pdffonts", "pdfimages-list"])
    direct, direct_err = extract_direct(pdf, base.with_suffix(".txt"))
    record["method"].append("pdftotext-layout")
    direct_chars = len(re.sub(r"\s+", "", direct))
    final_text = direct
    if direct_chars >= MIN_DIRECT_CHARS:
        record["readability"] = "answer_key_only" if role == "answer" else "text_readable"
    else:
        record["needsImageReview"] = True
        if tess_ok:
            record["ocrStatus"] = "attempted"
            ocr_text, ocr_err = ocr(pdf, ANALYSIS_ROOT / "ocr" / safe_id(source_id) / role, count)
            record["method"].extend(["pdftoppm-300", "tesseract-chi_tra+eng-psm4"])
            ocr_chars = len(re.sub(r"\s+", "", ocr_text))
            if ocr_err:
                record["ocrStatus"] = "failed"; record["error"] = ocr_err
            elif ocr_chars >= MIN_DIRECT_CHARS:
                record["ocrStatus"] = "completed"; record["readability"] = "ocr_partial"; final_text = ocr_text
                base.with_suffix(".ocr.txt").write_text(ocr_text, encoding="utf-8")
            else:
                record["ocrStatus"] = "insufficient"; record["error"] = "OCR text below readability threshold"
        else:
            record["ocrStatus"] = "blocked_missing_chi_tra"
            record["error"] = "chi_tra tessdata unavailable; OCR not run"
    record["textCharacters"] = len(final_text)
    record["needsImageReview"] = record["needsImageReview"] or images > 0
    if not record["error"]:
        record["error"] = err or inspect_err or direct_err
    asset_dir.mkdir(parents=True, exist_ok=True)
    metadata_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return record


def execute(args: argparse.Namespace) -> int:
    """Run only while main() owns _analysis/.preprocess.lock."""
    inv = json.loads(INVENTORY.read_text())
    # A prior interrupted run may have left only our OCR page-image temp files.
    # They are never evidence artifacts; remove them only while holding the lock.
    for stale_png in (ANALYSIS_ROOT / "ocr").glob("**/page-*.png"):
        stale_png.unlink(missing_ok=True)
    tess_ok = "chi_tra" in run("tesseract", "--list-langs").stdout.split()
    assets = [(exam, role) for exam in inv["exams"] for role in ("question", "answer")]
    records = []
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = [pool.submit(process_asset, exam, role, tess_ok, args.force, args.retry_ocr_errors) for exam, role in assets]
        for future in as_completed(futures):
            records.append(future.result())
    records.sort(key=lambda r: (r["sourceId"], r["role"]))
    questions = [r for r in records if r["role"] == "question"]
    answers = [r for r in records if r["role"] == "answer"]
    counts = {}
    for record in records:
        counts[record["readability"]] = counts.get(record["readability"], 0) + 1
    ocr_counts = {}
    for record in records:
        ocr_counts[record["ocrStatus"]] = ocr_counts.get(record["ocrStatus"], 0) + 1
    ocr_queue = [r for r in records if r["ocrStatus"] in {"blocked_missing_chi_tra", "failed", "insufficient"}]
    render_queue = [r for r in records if r["needsImageReview"]]
    source_role_keys = [f"{r['sourceId']}::{r['role']}" for r in records]
    analysis_paths = [r["analysisPath"] for r in records]
    duplicate_analysis_paths = sorted({path for path in analysis_paths if analysis_paths.count(path) > 1})
    missing_metadata_paths = [r["analysisPath"] for r in records if not (ROOT / r["analysisPath"]).with_suffix(".json").is_file()]
    missing_text_paths = [r["analysisPath"] for r in records if not (ROOT / r["analysisPath"]).with_suffix(".txt").is_file()]
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    payload = {"schemaVersion": 1, "generatedAt": datetime.now(timezone.utc).isoformat(), "sourceInventory": str(INVENTORY.relative_to(ROOT)), "tesseractChiTraAvailable": tess_ok, "records": records}
    (OUT_ROOT / "preprocess-inventory.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT_ROOT / "ocr-queue.json").write_text(json.dumps({"schemaVersion": 1, "tesseractChiTraAvailable": tess_ok, "records": ocr_queue}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT_ROOT / "render-queue.json").write_text(json.dumps({"schemaVersion": 1, "policy": "Do not bulk-render; these assets need targeted visual review.", "records": render_queue}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    summary = {"schemaVersion": 1, "generatedAt": datetime.now(timezone.utc).isoformat(), "expected": {"question": 393, "answer": 393, "total": 786}, "actual": {"question": len(questions), "answer": len(answers), "total": len(records)}, "uniqueSourceRoleKeys": len(set(source_role_keys)), "uniqueAnalysisPaths": len(set(analysis_paths)), "duplicateAnalysisPaths": duplicate_analysis_paths, "missingMetadataPaths": missing_metadata_paths, "missingTextPaths": missing_text_paths, "readabilityCounts": counts, "ocrStatusCounts": ocr_counts, "ocrQueue": len(ocr_queue), "renderQueue": len(render_queue), "errors": sum(1 for r in records if r["error"]), "valid": len(questions) == 393 and len(answers) == 393 and len(records) == 786 and len(set(source_role_keys)) == 786 and len(set(analysis_paths)) == 786 and not duplicate_analysis_paths and not missing_metadata_paths and not missing_text_paths}
    (OUT_ROOT / "validation-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))
    return 0 if summary["valid"] else 2


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--retry-ocr-errors", action="store_true", help="Retry only cached failed/insufficient/blocked OCR assets.")
    args = parser.parse_args()
    ANALYSIS_ROOT.mkdir(parents=True, exist_ok=True)
    lock_path = ANALYSIS_ROOT / ".preprocess.lock"
    with lock_path.open("w") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print(f"preprocess lock busy: {lock_path}", file=sys.stderr)
            return 3
        try:
            return execute(args)
        finally:
            fcntl.flock(lock, fcntl.LOCK_UN)

if __name__ == "__main__":
    raise SystemExit(main())
