import os
import json
import csv

raise SystemExit("Deprecated lossy projection. Run repair_pilot.py instead.")

out_dir = '/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802'

# Selected 10 source_ids
selected_10_ids = [
    'G1-康軒-109上-期中1-P04_R02_寶山國小_彰化縣_1年級_數學_109上_期中1_康軒',
    'G1-翰林-113下-期末2-P01_R01_安和國小_新北市_1年級_數學_113下_期末2_翰林',
    'G2-康軒-112下-期中1-P01_R10_安和國小_新北市_2年級_數學_112下_期中1_康軒',
    'G2-翰林-113上-期末2-P01_R08_安和國小_新北市_2年級_數學_113上_期末2_翰林',
    'G3-康軒-113上-期中1-P01_R07_安和國小_新北市_3年級_數學_113上_期中1_康軒',
    'G3-翰林-113下-期末2-P01_R01_桃子腳國小_新北市_3年級_數學_113下_期末2_翰林',
    'G4-康軒-112下-期中1-P02_R06_安和國小_新北市_4年級_數學_112下_期中1_康軒',
    'G4-翰林-113上-期末2-P01_R08_安和國小_新北市_4年級_數學_113上_期末2_翰林',
    'G1-康軒-108上-期中2-P05_R08_鶴聲國小_屏東縣_1年級_數學_108上_期中2_康軒',
    'G3-翰林-108上-期中1-P07_R06_鶴聲國小_屏東縣_3年級_數學_108上_期中1_翰林'
]

# Read extracted questions
ext_path = '/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilot/extracted-questions.jsonl'
align_path = '/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilot/question-alignments.jsonl'

extracted_map = {}
with open(ext_path, 'r', encoding='utf-8') as f:
    for line in f:
        item = json.loads(line)
        extracted_map[item['id']] = item

alignments_map = {}
with open(align_path, 'r', encoding='utf-8') as f:
    for line in f:
        item = json.loads(line)
        alignments_map[item['question_id']] = item

# Build question-items.first-pass.json
questions_first_pass = []
review_rows = []

for q_id, ext_item in extracted_map.items():
    s_id = ext_item['source_id']
    if s_id not in selected_10_ids:
        continue

    align_item = alignments_map.get(q_id, {})

    # Parse source meta from s_id
    parts = s_id.split('-')
    grade = parts[0]
    publisher = parts[1]
    sem_str = parts[2] # 109上
    academic_year = sem_str[:3]
    semester = sem_str[3:]
    exam_type = parts[3]

    # Map alignment fields
    official_codes = align_item.get('officialContentCodes', [])
    proposed_official = official_codes[0] if official_codes else "needs_review"

    skill_ids = align_item.get('skillIds', [])
    proposed_skill = skill_ids[0] if skill_ids else None

    confidence = align_item.get('confidence', 'low')
    notes = align_item.get('notes', '')
    evidence = align_item.get('notes', '')

    # Determine diagram / image requirement
    needs_image = ext_item.get('needs_image', False)
    image_requirement = "image_required" if needs_image else "text_only"

    # Normalize choices and stem
    raw_text = ext_item.get('raw_text', '')
    question_stem = raw_text
    options = [] # Extract choices if present in raw_text (1)... (2)...

    q_entry = {
        "questionId": q_id,
        "sourceFile": ext_item.get('answer_key_source', '').replace('/answers/', '/questions/').replace('_答案卷.pdf', '_題目卷.pdf'),
        "sourcePage": ext_item.get('source_page', 1),
        "questionNumber": ext_item.get('original_number', ''),
        "stem": question_stem,
        "options": options,
        "correctAnswer": ext_item.get('answer'),
        "questionType": align_item.get('question_type', '文字計算／概念判斷'),
        "imageRequirement": image_requirement,
        "publisher": publisher,
        "grade": grade,
        "semester": semester,
        "examType": exam_type,
        "proposedSkillId": proposed_skill,
        "proposedOfficialCode": proposed_official,
        "alignmentConfidence": confidence,
        "alignmentReason": notes,
        "evidence": evidence,
        "reviewStatus": "first_pass"
    }

    questions_first_pass.append(q_entry)

    # For alignment-review.csv
    review_rows.append({
        "questionId": q_id,
        "sourceFile": q_entry["sourceFile"],
        "sourcePage": q_entry["sourcePage"],
        "questionNumber": q_entry["questionNumber"],
        "publisher": publisher,
        "grade": grade,
        "semester": semester,
        "examType": exam_type,
        "questionType": q_entry["questionType"],
        "imageRequirement": image_requirement,
        "proposedOfficialCode": proposed_official,
        "proposedSkillId": proposed_skill or "",
        "alignmentConfidence": confidence,
        "reviewStatus": "first_pass",
        "alignmentReason": notes
    })

# Save question-items.first-pass.json
items_out_path = os.path.join(out_dir, 'question-items.first-pass.json')
with open(items_out_path, 'w', encoding='utf-8') as f:
    json.dump(questions_first_pass, f, ensure_ascii=False, indent=2)

print(f"Saved {len(questions_first_pass)} questions to {items_out_path}")

# Save alignment-review.csv
csv_out_path = os.path.join(out_dir, 'alignment-review.csv')
fieldnames = [
    "questionId", "sourceFile", "sourcePage", "questionNumber",
    "publisher", "grade", "semester", "examType", "questionType",
    "imageRequirement", "proposedOfficialCode", "proposedSkillId",
    "alignmentConfidence", "reviewStatus", "alignmentReason"
]

with open(csv_out_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(review_rows)

print(f"Saved {len(review_rows)} rows to {csv_out_path}")
