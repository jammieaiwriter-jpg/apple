"""Pure data module: fixed 10-source selection for the TCOOL math question-level pilot.

No logic beyond simple derivation from literal source records. Never executed directly;
imported by build_question_level_pilot.py and validate_question_level_pilot.py only.

All manual transcription (stems, options, answers, image evidence) lives in
qlp_items_*.py sibling modules, one per source, so any single source's data can be
reviewed independently. This module only carries source-level metadata (paths, pages,
grade/publisher/term) copied verbatim from
curriculum/alignment/pilots/tcool_math_pilot_20260802/source-inventory.json, which is
itself copied from the canonical curriculum/alignment/pilot/source-inventory.json.
"""

from __future__ import annotations

# DPI used for every sourceBBox pixel coordinate recorded in this pilot. All bboxes are
# expressed in the *rendered* (post page-rotation) pixel space produced by:
#   pdftoppm -r 400 -jpeg -f <page> -l <page> [-x X -y Y -W W -H H] <pdf> <out>
BBOX_DPI = 400

# Fixed 10-source selection. This list must never grow or shrink for this pilot task.
# calibration=True marks the two sources processed first at the C1 checkpoint.
SOURCES = [
    {
        "sourceId": "G1-康軒-109上-期中1-P04_R02_寶山國小_彰化縣_1年級_數學_109上_期中1_康軒",
        "grade": "G1", "publisher": "康軒", "academicYear": "109", "semester": "上", "examType": "期中1",
        "questionPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-1/康軒/questions/P04_R02_寶山國小_彰化縣_1年級_數學_109上_期中1_康軒_題目卷.pdf",
        "answerPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-1/康軒/answers/P04_R02_寶山國小_彰化縣_1年級_數學_109上_期中1_康軒_答案卷.pdf",
        "questionPages": 3, "answerPages": 4,
        "questionPageImages": "source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/G1-_-109_-_1-P04_R02_____1____109___1__",
        "questionReadability": "text_readable", "answerReadability": "answer_key_only",
        "calibration": False,
    },
    {
        "sourceId": "G1-翰林-113下-期末2-P01_R01_安和國小_新北市_1年級_數學_113下_期末2_翰林",
        "grade": "G1", "publisher": "翰林", "academicYear": "113", "semester": "下", "examType": "期末2",
        "questionPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-1/翰林/questions/P01_R01_安和國小_新北市_1年級_數學_113下_期末2_翰林_題目卷.pdf",
        "answerPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-1/翰林/answers/P01_R01_安和國小_新北市_1年級_數學_113下_期末2_翰林_答案卷.pdf",
        "questionPages": 3, "answerPages": 3,
        "questionPageImages": "source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/G1-_-113_-_2-P01_R01_____1____113___2__",
        "questionReadability": "text_readable", "answerReadability": "answer_key_only",
        "calibration": False,
    },
    {
        "sourceId": "G2-康軒-112下-期中1-P01_R10_安和國小_新北市_2年級_數學_112下_期中1_康軒",
        "grade": "G2", "publisher": "康軒", "academicYear": "112", "semester": "下", "examType": "期中1",
        "questionPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-2/康軒/questions/P01_R10_安和國小_新北市_2年級_數學_112下_期中1_康軒_題目卷.pdf",
        "answerPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-2/康軒/answers/P01_R10_安和國小_新北市_2年級_數學_112下_期中1_康軒_答案卷.pdf",
        "questionPages": 3, "answerPages": 1,
        "questionPageImages": "source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/G2-_-112_-_1-P01_R10_____2____112___1__",
        "questionReadability": "text_readable", "answerReadability": "answer_key_only",
        "calibration": True,
    },
    {
        "sourceId": "G2-翰林-113上-期末2-P01_R08_安和國小_新北市_2年級_數學_113上_期末2_翰林",
        "grade": "G2", "publisher": "翰林", "academicYear": "113", "semester": "上", "examType": "期末2",
        "questionPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-2/翰林/questions/P01_R08_安和國小_新北市_2年級_數學_113上_期末2_翰林_題目卷.pdf",
        "answerPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-2/翰林/answers/P01_R08_安和國小_新北市_2年級_數學_113上_期末2_翰林_答案卷.pdf",
        "questionPages": 5, "answerPages": 5,
        "questionPageImages": "source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/G2-_-113_-_2-P01_R08_____2____113___2__",
        "questionReadability": "text_readable", "answerReadability": "answer_key_only",
        "calibration": False,
    },
    {
        "sourceId": "G3-康軒-113上-期中1-P01_R07_安和國小_新北市_3年級_數學_113上_期中1_康軒",
        "grade": "G3", "publisher": "康軒", "academicYear": "113", "semester": "上", "examType": "期中1",
        "questionPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-3/康軒/questions/P01_R07_安和國小_新北市_3年級_數學_113上_期中1_康軒_題目卷.pdf",
        "answerPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-3/康軒/answers/P01_R07_安和國小_新北市_3年級_數學_113上_期中1_康軒_答案卷.pdf",
        "questionPages": 3, "answerPages": 3,
        "questionPageImages": "source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/G3-_-113_-_1-P01_R07_____3____113___1__",
        "questionReadability": "text_readable", "answerReadability": "answer_key_only",
        "calibration": False,
    },
    {
        "sourceId": "G3-翰林-113下-期末2-P01_R01_桃子腳國小_新北市_3年級_數學_113下_期末2_翰林",
        "grade": "G3", "publisher": "翰林", "academicYear": "113", "semester": "下", "examType": "期末2",
        "questionPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-3/翰林/questions/P01_R01_桃子腳國小_新北市_3年級_數學_113下_期末2_翰林_題目卷.pdf",
        "answerPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-3/翰林/answers/P01_R01_桃子腳國小_新北市_3年級_數學_113下_期末2_翰林_答案卷.pdf",
        "questionPages": 3, "answerPages": 3,
        "questionPageImages": "source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/G3-_-113_-_2-P01_R01_____3____113___2__",
        "questionReadability": "text_readable", "answerReadability": "scan_needs_ocr",
        "calibration": False,
    },
    {
        "sourceId": "G4-康軒-112下-期中1-P02_R06_安和國小_新北市_4年級_數學_112下_期中1_康軒",
        "grade": "G4", "publisher": "康軒", "academicYear": "112", "semester": "下", "examType": "期中1",
        "questionPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-4/康軒/questions/P02_R06_安和國小_新北市_4年級_數學_112下_期中1_康軒_題目卷.pdf",
        "answerPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-4/康軒/answers/P02_R06_安和國小_新北市_4年級_數學_112下_期中1_康軒_答案卷.pdf",
        "questionPages": 3, "answerPages": 3,
        "questionPageImages": "source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/G4-_-112_-_1-P02_R06_____4____112___1__",
        "questionReadability": "text_readable", "answerReadability": "answer_key_only",
        "calibration": False,
    },
    {
        "sourceId": "G4-翰林-113上-期末2-P01_R08_安和國小_新北市_4年級_數學_113上_期末2_翰林",
        "grade": "G4", "publisher": "翰林", "academicYear": "113", "semester": "上", "examType": "期末2",
        "questionPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-4/翰林/questions/P01_R08_安和國小_新北市_4年級_數學_113上_期末2_翰林_題目卷.pdf",
        "answerPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-4/翰林/answers/P01_R08_安和國小_新北市_4年級_數學_113上_期末2_翰林_答案卷.pdf",
        "questionPages": 2, "answerPages": 2,
        "questionPageImages": "source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/G4-_-113_-_2-P01_R08_____4____113___2__",
        "questionReadability": "text_readable", "answerReadability": "answer_key_only",
        "calibration": False,
    },
    {
        "sourceId": "G1-康軒-108上-期中2-P05_R08_鶴聲國小_屏東縣_1年級_數學_108上_期中2_康軒",
        "grade": "G1", "publisher": "康軒", "academicYear": "108", "semester": "上", "examType": "期中2",
        "questionPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-1/康軒/questions/P05_R08_鶴聲國小_屏東縣_1年級_數學_108上_期中2_康軒_題目卷.pdf",
        "answerPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-1/康軒/answers/P05_R08_鶴聲國小_屏東縣_1年級_數學_108上_期中2_康軒_答案卷.pdf",
        "questionPages": 2, "answerPages": 2,
        "questionPageImages": "source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/G1-_-108_-_2-P05_R08_____1____108___2__",
        "questionReadability": "ocr_partial", "answerReadability": "answer_key_only",
        "calibration": False,
    },
    {
        "sourceId": "G3-翰林-108上-期中1-P07_R06_鶴聲國小_屏東縣_3年級_數學_108上_期中1_翰林",
        "grade": "G3", "publisher": "翰林", "academicYear": "108", "semester": "上", "examType": "期中1",
        "questionPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-3/翰林/questions/P07_R06_鶴聲國小_屏東縣_3年級_數學_108上_期中1_翰林_題目卷.pdf",
        "answerPath": "source_materials/tcool_math_g1_g4_康軒_翰林/grade-3/翰林/answers/P07_R06_鶴聲國小_屏東縣_3年級_數學_108上_期中1_翰林_答案卷.pdf",
        "questionPages": 2, "answerPages": 2,
        "questionPageImages": "source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/G3-_-108_-_1-P07_R06_____3____108___1__",
        "questionReadability": "scan_needs_ocr", "answerReadability": "scan_needs_ocr",
        "calibration": True,
    },
]

SOURCES_BY_ID = {s["sourceId"]: s for s in SOURCES}

assert len(SOURCES) == 10
assert len(SOURCES_BY_ID) == 10
assert sum(1 for s in SOURCES if s["calibration"]) == 2
