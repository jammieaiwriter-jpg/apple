import os
import json

raise SystemExit("Deprecated hard-coded reporter. Run validate_pilot.py instead.")

out_dir = '/Users/emma/02_小孩教育/Apple/curriculum/alignment/pilots/tcool_math_pilot_20260802'

inv_path = os.path.join(out_dir, 'source-inventory.json')
items_path = os.path.join(out_dir, 'question-items.first-pass.json')

with open(inv_path, 'r', encoding='utf-8') as f:
    inv = json.load(f)

with open(items_path, 'r', encoding='utf-8') as f:
    items = json.load(f)

confidence_counts = {"high": 0, "medium": 0, "low": 0}
code_counts = {"official_assigned": 0, "needs_review": 0}
image_counts = {"image_required": 0, "text_only": 0}

for item in items:
    conf = item.get('alignmentConfidence', 'low')
    confidence_counts[conf] = confidence_counts.get(conf, 0) + 1

    code = item.get('proposedOfficialCode')
    if code and code != 'needs_review':
        code_counts["official_assigned"] += 1
    else:
        code_counts["needs_review"] += 1

    img_req = item.get('imageRequirement')
    image_counts[img_req] = image_counts.get(img_req, 0) + 1

# Validation report
val_report = {
    "schemaVersion": "1.0",
    "timestamp": "2026-08-02T13:44:00Z",
    "pilotDirectory": out_dir,
    "inventoryValidation": {
        "totalExamsFound": inv["totalExamPairs"],
        "totalPaired": inv["pairedCount"],
        "pilotExamCount": inv["pilotSelectedCount"]
    },
    "questionValidation": {
        "totalQuestionsParsed": len(items),
        "confidenceBreakdown": confidence_counts,
        "officialCodeBreakdown": code_counts,
        "imageRequirementBreakdown": image_counts,
        "allReviewStatusFirstPass": all(i["reviewStatus"] == "first_pass" for i in items)
    },
    "integrityCheck": {
        "utf8Encoding": True,
        "stableIds": True,
        "reproducible": True,
        "originalPDFsModified": False,
        "officialSkillIDsModified": False
    }
}

val_path = os.path.join(out_dir, 'validation-report.md')
with open(val_path, 'w', encoding='utf-8') as f:
    f.write("# TCOOL 數學考卷 Pilot 驗證報告 (Validation Report)\n\n")
    f.write("## 1. 執行資訊\n")
    f.write(f"- 產生時間：2026-08-02\n")
    f.write(f"- Pilot 輸出路徑：`{out_dir}`\n\n")
    f.write("## 2. 盤點驗證數據\n")
    f.write(f"- **專案總考卷數**：{inv['totalExamPairs']} 份\n")
    f.write(f"- **題本與答案配對數**：{inv['pairedCount']} 份 (100% 配對)\n")
    f.write(f"- **Pilot 涵蓋試卷數**：{inv['pilotSelectedCount']} 份\n\n")
    f.write("## 3. 逐題對齊驗證\n")
    f.write(f"- **解析題目總數**：{len(items)} 題\n")
    f.write(f"- **對齊信心度分布**：\n")
    f.write(f"  - High (高信心): {confidence_counts['high']} 題\n")
    f.write(f"  - Medium (中信心): {confidence_counts['medium']} 題\n")
    f.write(f"  - Low (低信心): {confidence_counts['low']} 題\n")
    f.write(f"- **官方碼對齊狀態**：\n")
    f.write(f"  - 已指定 108 官方條目: {code_counts['official_assigned']} 題\n")
    f.write(f"  - needs_review (暫不硬塞): {code_counts['needs_review']} 題\n")
    f.write(f"- **圖表與 OCR 需求**：\n")
    f.write(f"  - 需要原頁圖/圖表 (image_required): {image_counts['image_required']} 題\n")
    f.write(f"  - 純文字可解析 (text_only): {image_counts['text_only']} 題\n\n")
    f.write("## 4. 系統合規性驗證\n")
    f.write("- UTF-8 編碼與穩定 ID 產生：`通過`\n")
    f.write("- 原始 PDF 未修改／未刪除／未改名：`通過`\n")
    f.write("- 正式 SkillID 與正式題庫未改動：`通過`\n")
    f.write("- 無 git commit / git push 動作：`通過`\n")

print(f"Saved validation-report.md to {val_path}")
