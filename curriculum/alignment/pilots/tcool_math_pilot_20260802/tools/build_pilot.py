import os
import json
import re
import csv

raise SystemExit("Deprecated unsafe draft. Run repair_pilot.py instead.")

pilot_dir = '/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802'
tools_dir = os.path.join(pilot_dir, 'tools')
os.makedirs(tools_dir, exist_ok=True)
os.makedirs(pilot_dir, exist_ok=True)

# 1. Read existing pilot inventory to see which 15 files were preprocessed with text/pages
existing_inventory_path = '/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilot/source-inventory.json'
with open(existing_inventory_path, 'r', encoding='utf-8') as f:
    existing_inv = json.load(f)

existing_sources = existing_inv.get('sources', [])
print(f"Loaded existing pilot sources: {len(existing_sources)}")

# Select 10 diverse, high quality pilot sources from existing 15
# We select 5 康軒, 5 翰林 across G1, G2, G3, G4, and different exam types
selected_sources = []
counts = {"康軒": 0, "翰林": 0}

# Sort/filter to pick 10 complete ones
for src in existing_sources:
    s_id = src['source_id']
    q_info = src['question']
    a_info = src['answer']

    # parse publisher, grade, exam_type
    pub = "康軒" if "康軒" in s_id else ("翰林" if "翰林" in s_id else "unknown")
    grade = s_id.split('-')[0]

    if len(selected_sources) < 10:
        if counts[pub] < 5:
            selected_sources.append(src)
            counts[pub] += 1

print(f"Selected 10 pilot sources: {[s['source_id'] for s in selected_sources]}")

# Load official 108 math codes
official_codes_path = '/Users/emma/02_小孩教育/Apple/curriculum/alignment/official-108-math/official-codes-g1-g4.json'
with open(official_codes_path, 'r', encoding='utf-8') as f:
    official_codes_data = json.load(f)

# Load publisher unit inventory & alignment
pub_unit_path = '/Users/emma/02_小孩教育/Apple/curriculum/alignment/publishers/publisher-unit-alignment.json'
with open(pub_unit_path, 'r', encoding='utf-8') as f:
    pub_alignment_data = json.load(f)

# Build inventory json for all 393 exams + mark selected 10 for pilot
source_materials_dir = '/Users/emma/02_小孩教育/Apple/source_materials/tcool_math_g1_g4_康軒_翰林'
all_pdf_files = []
for r, d, files in os.walk(source_materials_dir):
    for f in files:
        if f.endswith('.pdf'):
            all_pdf_files.append(os.path.join(r, f))

inventory_list = []
q_dict = {}
a_dict = {}

for p in all_pdf_files:
    fname = os.path.basename(p)
    base_key = fname.replace('_題目卷.pdf', '').replace('_答案卷.pdf', '').replace('.pdf', '')
    role = 'question' if ('題目卷' in fname or '題目' in fname) else ('answer' if ('答案卷' in fname or '答案' in fname) else 'unknown')

    grade_m = re.search(r'([1-4])年級', fname)
    grade = f"G{grade_m.group(1)}" if grade_m else "unknown"
    pub = "康軒" if "康軒" in fname else ("翰林" if "翰林" in fname else "unknown")
    year_sem_m = re.search(r'(\d{3})(上|下)', fname)
    year = year_sem_m.group(1) if year_sem_m else "unknown"
    semester = year_sem_m.group(2) if year_sem_m else "unknown"

    exam_type = "unknown"
    for et in ["期中1", "期中2", "期末1", "期末2", "期末3", "期末", "期中"]:
        if et in fname:
            exam_type = et
            break

    info = {
        "path": os.path.relpath(p, '/Users/emma/02_小孩教育/Apple'),
        "filename": fname,
        "base_key": base_key,
        "grade": grade,
        "publisher": pub,
        "academic_year": year,
        "semester": semester,
        "exam_type": exam_type
    }
    if role == 'question':
        q_dict[base_key] = info
    elif role == 'answer':
        a_dict[base_key] = info

selected_ids = set(s['source_id'] for s in selected_sources)

full_inventory = {
    "schemaVersion": "1.0",
    "createdAt": "2026-08-02T13:43:00Z",
    "totalExamPairs": len(q_dict),
    "totalQuestionPDFs": len(q_dict),
    "totalAnswerPDFs": len(a_dict),
    "pairedCount": len(set(q_dict.keys()).intersection(set(a_dict.keys()))),
    "pilotSelectedCount": len(selected_sources),
    "sources": []
}

for b_key, q_info in sorted(q_dict.items()):
    a_info = a_dict.get(b_key)
    # Check if in pilot
    matching_pilot = next((s for s in selected_sources if b_key in s['source_id']), None)

    entry = {
        "source_id": matching_pilot['source_id'] if matching_pilot else f"{q_info['grade']}-{q_info['publisher']}-{q_info['academic_year']}{q_info['semester']}-{q_info['exam_type']}-{b_key}",
        "academic_year": q_info['academic_year'],
        "grade": q_info['grade'],
        "semester": q_info['semester'],
        "publisher": q_info['publisher'],
        "exam_type": q_info['exam_type'],
        "is_paired": a_info is not None,
        "in_pilot_batch": matching_pilot is not None,
        "question": {
            "path": q_info['path'],
            "pages": matching_pilot['question']['pages'] if matching_pilot else None,
            "readability": matching_pilot['question']['readability'] if matching_pilot else "text_readable",
            "ocr_required": matching_pilot['question']['readability'] == "preprocessed_tesseract" if matching_pilot else False
        },
        "answer": {
            "path": a_info['path'] if a_info else None,
            "pages": matching_pilot['answer']['pages'] if matching_pilot else None,
            "readability": matching_pilot['answer']['readability'] if matching_pilot else "answer_key_only"
        }
    }
    full_inventory["sources"].append(entry)

inv_out_path = os.path.join(pilot_dir, 'source-inventory.json')
with open(inv_out_path, 'w', encoding='utf-8') as f:
    json.dump(full_inventory, f, ensure_ascii=False, indent=2)

print(f"Saved source-inventory.json to {inv_out_path}")
