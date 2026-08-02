import os
import json
import re

root = '/Users/emma/02_小孩教育/Apple'
target_dir = '/Users/emma/02_小孩教育/Apple/source_materials/tcool_math_g1_g4_康軒_翰林'

pdf_files = []
for r, d, files in os.walk(target_dir):
    for f in files:
        if f.endswith('.pdf'):
            pdf_files.append(os.path.join(r, f))

questions = {}
answers = {}

for p in pdf_files:
    fname = os.path.basename(p)
    if '題目卷' in fname or '題目' in fname or '問卷' in fname or '試題' in fname:
        role = 'question'
    elif '答案卷' in fname or '答案' in fname or '解答' in fname:
        role = 'answer'
    else:
        role = 'unknown'

    base_key = fname.replace('_題目卷.pdf', '').replace('_答案卷.pdf', '').replace('.pdf', '')

    grade_m = re.search(r'([1-4])年級', fname)
    grade = f"G{grade_m.group(1)}" if grade_m else "unknown"

    pub = "unknown"
    if "康軒" in fname:
        pub = "康軒"
    elif "翰林" in fname:
        pub = "翰林"

    year_sem_m = re.search(r'(\d{3})(上|下)', fname)
    year = year_sem_m.group(1) if year_sem_m else "unknown"
    semester = year_sem_m.group(2) if year_sem_m else "unknown"

    exam_type = "unknown"
    if "期中1" in fname:
        exam_type = "期中1"
    elif "期中2" in fname:
        exam_type = "期中2"
    elif "期末1" in fname:
        exam_type = "期末1"
    elif "期末2" in fname:
        exam_type = "期末2"
    elif "期末3" in fname:
        exam_type = "期末3"
    elif "期末" in fname:
        exam_type = "期末"
    elif "期中" in fname:
        exam_type = "期中"

    item = {
        "path": p,
        "filename": fname,
        "base_key": base_key,
        "grade": grade,
        "publisher": pub,
        "academic_year": year,
        "semester": semester,
        "exam_type": exam_type
    }

    if role == 'question':
        questions[base_key] = item
    elif role == 'answer':
        answers[base_key] = item

print(f"Total question files: {len(questions)}")
print(f"Total answer files: {len(answers)}")

paired_keys = set(questions.keys()).intersection(set(answers.keys()))
print(f"Paired files count: {len(paired_keys)}")
