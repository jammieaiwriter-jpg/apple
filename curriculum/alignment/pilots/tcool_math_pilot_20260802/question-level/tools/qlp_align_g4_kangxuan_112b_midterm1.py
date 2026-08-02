"""C3 curriculum alignment for G4-康軒-112下-期中1 (see qlp_items_g4_kangxuan_112b_midterm1.py).
Publisher chapters: 康軒 G4 下 (10 chapters). localId<->questionNumber cross-checked
against the item file with rg before writing this table.
"""

from __future__ import annotations

CH1 = "康軒 G4 下 第1章 多位數的乘與除"
CH2 = "康軒 G4 下 第2章 四邊形"
CH5 = "康軒 G4 下 第5章 小數乘法"
CH6 = "康軒 G4 下 第6章 周長與面積"
CH8 = "康軒 G4 下 第8章 簡化計算"

ALIGN = {
    "q01": dict(officialContentCodes=["S-4-5", "S-4-8"], publisherChapter=CH2,
                candidateSkillIds=["G4-12-08", "G4-12-09"], alignmentStatus="direct",
                alignmentConfidence="high",
                alignmentEvidence=["official S-4-5/S-4-8 垂直與平行/四邊形", f"publisher {CH2}",
                                    "四邊形性質綜合判斷，對應 G4-12-08/09 四邊形關係與邊角"]),
    "q02": dict(officialContentCodes=["N-4-11", "S-4-3"], publisherChapter=CH6,
                candidateSkillIds=["G4-13-04"], alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["official N-4-11/S-4-3 面積", f"publisher {CH6}",
                                    "正方形面積36求邊長，對應 G4-13-04「運用面積公式求正方形"
                                    "的邊長(反推)」"]),
    "q03": dict(officialContentCodes=["R-4-2"], publisherChapter=CH8, candidateSkillIds=["G4-15-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["official R-4-2 四則計算規律(I)", f"publisher {CH8}",
                                    "驗證結合律/交換律算式是否成立，對應 G4-15-01 快捷計算"]),
    "q04": dict(officialContentCodes=["N-4-8"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["official N-4-8 數線與分數、小數；數線上小數移動題，"
                                    "康軒G4下無獨立數線章節，保留uncertain"]),
    "q05": dict(officialContentCodes=["N-4-11", "S-4-3"], publisherChapter=CH6,
                candidateSkillIds=[], alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["面積/周長概念綜合敘述判斷，屬 CH6 但橫跨多個skill無單一"
                                    "對應"]),
    "q06": dict(officialContentCodes=["N-4-2"], publisherChapter=CH1, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["official N-4-2 較大位數之乘除計算", f"publisher {CH1}",
                                    "65000÷130推算650000÷1300商不變，屬除法規律但無單一"
                                    "對應skill"]),
    "q07": dict(officialContentCodes=["N-4-7"], publisherChapter=CH5, candidateSkillIds=["G4-09-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["official N-4-7 二位小數", f"publisher {CH5}",
                                    "2.24x50=112 由224x50=11200推算，對應 G4-09-01/02 二位"
                                    "小數概念"]),
    "q08": dict(officialContentCodes=["N-4-2"], publisherChapter=CH1, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["224000x500 大數乘法規律推算，屬CH1但無單一對應skill"]),
    "q09": dict(officialContentCodes=["S-4-6"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["official S-4-6 平面圖形的全等；菱形沿對角線剪開為等腰"
                                    "三角形，康軒G4下無三角形專章(該內容於翰林G4上第7章)，"
                                    "版本間單元不可互用，保留uncertain"]),
    "q10": dict(officialContentCodes=["S-4-6"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["同 q09：長方形沿對角線剪開為直角三角形"]),
    "q11": dict(officialContentCodes=["S-4-6"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["同 q09：正方形沿對角線剪開為等腰直角三角形"]),
    "q12": dict(officialContentCodes=["N-4-11"], publisherChapter=CH6, candidateSkillIds=["G4-13-06"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["3500000平方公分=350平方公尺，對應 G4-13-06「平方公分和"
                                    "平方公尺(單位換算)」"]),
    "q13": dict(officialContentCodes=["N-4-11"], publisherChapter=CH6, candidateSkillIds=["G4-13-06"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["16平方公尺 vs 1600平方公分，對應 G4-13-06"]),
    "q14": dict(officialContentCodes=["N-4-2"], publisherChapter=CH1, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["0.7x600 vs 7x60 純算式比大小，非面積脈絡，且康軒G4下"
                                    "無獨立整數運算規律章節對應此比較型式，保留uncertain"]),
    "q15": dict(officialContentCodes=["N-4-2"], publisherChapter=CH1, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["同 q14：5200x300 vs 52x3000"]),
    "q16": dict(officialContentCodes=["S-4-5"], publisherChapter=CH2, candidateSkillIds=["G4-12-05"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["平行四邊形畫出全部對角線，對應 G4-12-05 認識平行四邊形"]),
    "q17": dict(officialContentCodes=["S-4-8"], publisherChapter=CH2, candidateSkillIds=["G4-12-09"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["BC的對邊，對應 G4-12-09 四邊形的邊和角"]),
    "q18": dict(officialContentCodes=["S-4-8"], publisherChapter=CH2, candidateSkillIds=["G4-12-09"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["AB的鄰邊，對應 G4-12-09"]),
    "q19": dict(officialContentCodes=["S-4-8"], publisherChapter=CH2, candidateSkillIds=["G4-12-09"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["∠A的對角，對應 G4-12-09"]),
    "q20": dict(officialContentCodes=["N-4-7"], publisherChapter=CH5, candidateSkillIds=["G4-09-09"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["兩人步長(小數)x15步相距，對應 G4-09-09 小數加減應用題"]),
    "q21": dict(officialContentCodes=["N-4-3"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["1400-236-264=900 連續減法應用，屬三年級程度複習內容，"
                                    "康軒G4下章節無對應此基礎題型，保留uncertain"]),
    "q22": dict(officialContentCodes=["N-4-8"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["開放式數線標示小數作圖題，無固定文字答案，保留uncertain"]),
    "q23": dict(officialContentCodes=["N-4-7"], publisherChapter=CH5, candidateSkillIds=["G4-09-04"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["39.15x24 小數乘整數，對應 G4-09 系列(小數計算延伸)"]),
    "q24": dict(officialContentCodes=["N-4-2"], publisherChapter=CH1, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["560000÷1500有餘除法，對應CH1但無單一對應skill"]),
    "q25": dict(officialContentCodes=["N-4-2"], publisherChapter=CH1, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["8600x3500 大數乘法，對應CH1但無單一對應skill"]),
    "q26": dict(officialContentCodes=["N-4-11", "S-4-3"], publisherChapter=CH6,
                candidateSkillIds=["G4-13-16"], alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["工字形複合圖形面積，對應 G4-13-16「求複雜複合圖形的"
                                    "面積-分割法」，惟本題 answerStatus 已因與獨立驗算不符"
                                    "標記 needs_review，對齊保留uncertain避免掩蓋答案爭議"]),
    "q27": dict(officialContentCodes=["N-4-11", "S-4-3"], publisherChapter=CH6,
                candidateSkillIds=["G4-13-15"], alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["階梯狀複合圖形面積(已獨立驗算1944)，對應 G4-13-15「求"
                                    "簡單複合圖形的面積」"]),
    "q28": dict(officialContentCodes=["S-4-6"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["開放式作圖題(畫菱形與平行四邊形)，無固定文字答案，"
                                    "保留uncertain"]),
    "q29": dict(officialContentCodes=["S-4-5"], publisherChapter=CH2, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["開放式作圖題(畫平行線及最短距離)，無固定文字答案，"
                                    "保留uncertain"]),
    "q30": dict(officialContentCodes=["R-4-2"], publisherChapter=CH8, candidateSkillIds=["G4-15-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["1997+197+1002+12 湊整快捷計算，對應 G4-15-01 快捷計算"]),
    "q31": dict(officialContentCodes=["R-4-2"], publisherChapter=CH8, candidateSkillIds=["G4-15-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["125x33x8 交換律快捷計算，對應 G4-15-01"]),
    "q32": dict(officialContentCodes=["N-4-3"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["消費滿額折抵找零應用題，康軒G4下章節無對應此類促銷"
                                    "折抵情境，保留uncertain"]),
    "q33": dict(officialContentCodes=["N-4-11", "S-4-3"], publisherChapter=CH6,
                candidateSkillIds=["G4-13-09"], alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["64公尺繩圍成正方形求邊長及10個正方形總面積，對應"
                                    "G4-13-09「運用周長公式求正方形的邊長(反推)」與"
                                    "G4-13-05正方形面積應用題"]),
    "q34": dict(officialContentCodes=["N-4-7"], publisherChapter=CH5, candidateSkillIds=["G4-09-09"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["大小水管注水量(小數)應用題，對應 G4-09-09 小數加減"
                                    "應用題"]),
    "q35": dict(officialContentCodes=["N-4-11", "S-4-3"], publisherChapter=CH6,
                candidateSkillIds=["G4-13-03"], alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["長方形教室面積(公分轉公尺後長x寬)，對應 G4-13-03「運用"
                                    "面積公式求長方形、正方形的面積」"]),
    "q36": dict(officialContentCodes=["N-4-11"], publisherChapter=CH6, candidateSkillIds=["G4-13-18"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["面積x單價求材料費，對應 G4-13-18 長方形面積應用題"]),
    "q37": dict(officialContentCodes=["N-4-13"], publisherChapter="康軒 G4 下 第9章 時間的計算",
                candidateSkillIds=[], alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["official N-4-13 解題", "康軒G4下第9章時間的計算",
                                    "師傅工錢(天數x薪水x人數)非時間計算而是純乘法應用，"
                                    "章節匹配薄弱，列partial"]),
}
