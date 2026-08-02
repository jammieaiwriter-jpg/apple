"""C3 curriculum alignment for G2-康軒-112下-期中1 (see qlp_items_g2_kangxuan_112b_midterm1.py).

Evidence sources consulted for every mapping below:
- curriculum/alignment/official-108-math/official-codes-g1-g4.json (official content codes)
- curriculum/alignment/publishers/publisher-unit-alignment.json, records where
  publisher=康軒, grade=G2, semester=下 (10 chapters, chapter titles/codes copied
  verbatim from that file)
- curriculum/alignment/skills/skill-official-alignment.json, records with
  chapterId matching the above chapters (skill names copied verbatim)

alignmentStatus="direct"/confidence="high" is used only when the item's own content
singularly matches one official code, one publisher chapter, and one specific skill's
semantics with no real ambiguity. Anything spanning multiple codes/skills, or resting
on general reasoning not covered by a specific skill (estimation-by-elimination,
open-ended drawing, generic logic puzzles) is kept at partial/uncertain per
ALIGNMENT_CONTRACT.md ("不得為了 100% 覆蓋強制配對").
"""

from __future__ import annotations

CH1 = ("康軒", "G2", "下", 1)
CH2 = ("康軒", "G2", "下", 2)
CH3 = ("康軒", "G2", "下", 3)
CH4 = ("康軒", "G2", "下", 4)
CH5 = ("康軒", "G2", "下", 5)
CH6 = ("康軒", "G2", "下", 6)
CH7 = ("康軒", "G2", "下", 7)

ALIGN = {
    "q01": dict(  # 218元不能買哪個套餐
        officialContentCodes=["N-2-1"], publisherChapter=CH1,
        candidateSkillIds=["G2-11-06", "G2-11-07"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["official N-2-1 一千以內的數", f"publisher {CH1}",
                            "情境為金額比較而非正式比大小教學，故列 partial"]),
    "q02": dict(  # 存錢達1000元最少幾個月 (重複加法)
        officialContentCodes=["N-2-2"], publisherChapter=CH2,
        candidateSkillIds=["G2-12-11", "G2-12-12"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["official N-2-2 加減算式與直式計算", f"publisher {CH2}",
                            "本題為重複加法達標型應用，非單一skill精確對應"]),
    "q03": dict(  # 4人生日先後排序
        officialContentCodes=["N-2-14"], publisherChapter=CH4,
        candidateSkillIds=["G2-15-01"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["official N-2-14 時間", f"publisher {CH4} 認識一年的12個月",
                            "屬日期先後排序，非該章明確定義之單一skill"]),
    "q04": dict(  # 一星期説法對錯(含算頭算尾陷阱)
        officialContentCodes=["N-2-14"], publisherChapter=CH4,
        candidateSkillIds=["G2-15-05"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["official N-2-14 時間", f"publisher {CH4} 日期應用題-求所用日數"]),
    "q05": dict(  # 保固期限最長(月/年換算比較)
        officialContentCodes=["N-2-14"], publisherChapter=CH4,
        candidateSkillIds=["G2-15-01"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["official N-2-14 時間", f"publisher {CH4}",
                            "月/年單位換算比較，非該章逐項skill唯一對應"]),
    "q06": dict(  # 年月日敘述何者正確(平閏年/大小月)
        officialContentCodes=["N-2-14"], publisherChapter=CH4,
        candidateSkillIds=["G2-15-02", "G2-15-03"],
        alignmentStatus="direct", alignmentConfidence="high",
        alignmentEvidence=["official N-2-14 時間", f"publisher {CH4}",
                            "skill G2-15-02「平年及閏年」、G2-15-03「每月的日數」與題幹"
                            "(大小月、閏年、2月天數)語意完全一致"]),
    "q07": dict(  # 四邊形敘述何者不對
        officialContentCodes=["S-2-1", "S-2-2"], publisherChapter=CH3,
        candidateSkillIds=["G2-17-01"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["official S-2-1 物體之幾何特徵/S-2-2 簡單幾何形體",
                            f"publisher {CH3}", "涉及正方形/長方形邊角性質綜合判斷"]),
    "q08": dict(  # 按順序填填看 665-765-()-() (+100)
        officialContentCodes=["N-2-1"], publisherChapter=CH1,
        candidateSkillIds=["G2-11-01"],
        alignmentStatus="direct", alignmentConfidence="high",
        alignmentEvidence=["official N-2-1 一千以內的數", f"publisher {CH1}",
                            "skill G2-11-01「順數和倒數」直接對應等差數列填空"]),
    "q09": dict(officialContentCodes=["N-2-1"], publisherChapter=CH1,
                candidateSkillIds=["G2-11-01"], alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["同 q08：910-900-()-()-870 等差-10 數列", f"publisher {CH1}"]),
    "q10": dict(  # 估算 707-598 打勾
        officialContentCodes=["N-2-2"], publisherChapter=CH2,
        candidateSkillIds=[],
        alignmentStatus="uncertain", alignmentConfidence="low",
        alignmentEvidence=["official N-2-2 加減算式與直式計算", f"publisher {CH2}",
                            "估算勾選題在康軒G2下skill清單中無明確對應項目，保留uncertain"]),
    "q11": dict(officialContentCodes=["N-2-2"], publisherChapter=CH2, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["同 q10：估算 610+99"]),
    "q12": dict(  # 數字卡排最大最小三位數
        officialContentCodes=["N-2-1"], publisherChapter=CH1,
        candidateSkillIds=["G2-11-02"],
        alignmentStatus="direct", alignmentConfidence="high",
        alignmentEvidence=["official N-2-1 一千以內的數", f"publisher {CH1}",
                            "skill G2-11-02「認識三位數」對應位值排列求最大最小三位數"]),
    "q13": dict(  # 蘋果箱盒問題(除法情境, 康軒G2下未含正式除法章)
        officialContentCodes=["N-2-8"], publisherChapter=None,
        candidateSkillIds=[],
        alignmentStatus="uncertain", alignmentConfidence="low",
        alignmentEvidence=["official N-2-8 解題(除法應用情境)",
                            "康軒G2下課本除法列於第9-10章「分分看/分數」而非本題之"
                            "箱盒進位分裝情境，出版社章節無法唯一對應，保留uncertain"]),
    "q14": dict(  # 比大小 408 vs 4個百18個一
        officialContentCodes=["N-2-1"], publisherChapter=CH1,
        candidateSkillIds=["G2-11-06", "G2-11-07"],
        alignmentStatus="direct", alignmentConfidence="high",
        alignmentEvidence=["official N-2-1", f"publisher {CH1}", "skill G2-11-06/07 比較大小"]),
    "q15": dict(officialContentCodes=["N-2-1"], publisherChapter=CH1,
                candidateSkillIds=["G2-11-06", "G2-11-07"], alignmentStatus="direct",
                alignmentConfidence="high", alignmentEvidence=["同 q14：位值合成後比大小"]),
    "q16": dict(  # 4x6 vs 8x6 (乘法比大小)
        officialContentCodes=["N-2-6"], publisherChapter=CH5,
        candidateSkillIds=["G2-06-03"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["official N-2-6 乘法", "康軒G2下第5章乘法",
                            "乘積比大小非單一skill精確對應，列partial"]),
    "q17": dict(officialContentCodes=["N-2-6"], publisherChapter=CH5,
                candidateSkillIds=[], alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["6x9 vs 9x6 驗證交換律，official R-2-3 兩數相乘的順序不影響其積"]),
    "q18": dict(  # 月曆推理(3件, 3-6-1/2/3)
        officialContentCodes=["N-2-14"], publisherChapter=CH4,
        candidateSkillIds=["G2-15-04"],
        alignmentStatus="direct", alignmentConfidence="high",
        alignmentEvidence=["official N-2-14 時間", f"publisher {CH4}",
                            "skill G2-15-04「日期應用題-求結束日期」對應月曆展覽結束日推算"]),
    "q19": dict(officialContentCodes=["N-2-14"], publisherChapter=CH4,
                candidateSkillIds=["G2-15-04", "G2-15-06"], alignmentStatus="direct",
                alignmentConfidence="high",
                alignmentEvidence=["出差結束日期+來得及判斷，對應 G2-15-04/06 日期應用題"]),
    "q20": dict(officialContentCodes=["N-2-14"], publisherChapter=CH4,
                candidateSkillIds=["G2-15-01"], alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["月曆對照求星期幾，屬 G2-15 章節但無逐項對應skill"]),
    "q21": dict(  # 三角形/邊/頂點/角辨識
        officialContentCodes=["S-2-1"], publisherChapter=CH3,
        candidateSkillIds=["G2-17-01"],
        alignmentStatus="direct", alignmentConfidence="high",
        alignmentEvidence=["official S-2-1 物體之幾何特徵", f"publisher {CH3}",
                            "skill G2-17-01「認識平面圖形的基本概念」對應頂點/邊/角辨識"]),
    "q22": dict(  # 描邊(略, needs_review 不列入 usable)
        officialContentCodes=["S-2-4"], publisherChapter=CH3, candidateSkillIds=["G2-17-01"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["描邊操作題對應 S-2-4 平面圖形的邊長，但無固定文字答案故仍needs_review"]),
    "q23": dict(  # 正三角形+正方形組合
        officialContentCodes=["S-2-1", "S-2-2"], publisherChapter=CH3,
        candidateSkillIds=["G2-17-01"], alignmentStatus="direct", alignmentConfidence="high",
        alignmentEvidence=["組合圖形辨識正三角形與正方形，對應 G2-17-01"]),
    "q24": dict(  # 周長=30公分
        officialContentCodes=["S-2-4"], publisherChapter=CH3, candidateSkillIds=["G2-17-01"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["official S-2-4 平面圖形的邊長，周長計算為G2下延伸應用，"
                           "無單一對應skill(周長多列於G3-03)"]),
    "q25": dict(  # 500元存幾百元買蛋糕餅乾(估算)
        officialContentCodes=["N-2-2"], publisherChapter=CH2, candidateSkillIds=["G2-12-13"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["official N-2-2", f"publisher {CH2}",
                            "先估後算之應用題，貼近 G2-12-13 減法應用題但含估算成分"]),
    "q26": dict(  # 錢包清點(874元)
        officialContentCodes=["N-2-1"], publisherChapter=CH1, candidateSkillIds=["G2-11-02"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["硬幣/鈔票清點求總金額，對應三位數認識但非正式skill定義範圍"]),
    "q27": dict(officialContentCodes=["N-2-2"], publisherChapter=CH2, candidateSkillIds=["G2-12-13"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["874-380=494 為三位數減法應用題，對應 G2-12-13 減法應用題(一)"]),
    "q28": dict(  # 17+287直式
        officialContentCodes=["N-2-2"], publisherChapter=CH2, candidateSkillIds=["G2-12-02"],
        alignmentStatus="direct", alignmentConfidence="high",
        alignmentEvidence=["17+287=304 為一位數加三位數不進位/進位，對應 G2-12-01/02"]),
    "q29": dict(officialContentCodes=["N-2-2"], publisherChapter=CH2, candidateSkillIds=["G2-12-08"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["807-423=384 為三位數退位減法，對應 G2-12-08 退位減法(一)"]),
    "q30": dict(officialContentCodes=["N-2-2"], publisherChapter=CH2, candidateSkillIds=["G2-12-11"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["263+157=420 加法應用題，對應 G2-12-11 加法應用題(一)"]),
    "q31": dict(  # 10x6乘法應用
        officialContentCodes=["N-2-6"], publisherChapter=CH5,
        candidateSkillIds=["G2-06-03"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["official N-2-6 乘法", "10x6乘法應用題，本卷未涵蓋10的乘法正式skill條目"]),
    "q32": dict(  # 梯形周長31公分
        officialContentCodes=["S-2-4"], publisherChapter=CH3, candidateSkillIds=["G2-17-01"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["四邊周長加總，對應S-2-4但無單一skill"]),
    "q33": dict(  # 水球得分(乘加應用)
        officialContentCodes=["N-2-8"], publisherChapter=CH6,
        candidateSkillIds=["G3-14-01"],
        alignmentStatus="partial", alignmentConfidence="medium",
        alignmentEvidence=["official N-2-8 解題", "康軒G2下第6章兩步驟應用問題",
                            "乘法+加法兩步驟情境，matchedSkillIds為G3-14-01(除法應用題，"
                            "章節橋接資料本身列此skill，非本題除法內容，故僅partial)"]),
    "q34": dict(officialContentCodes=["N-2-8"], publisherChapter=CH6,
                candidateSkillIds=[], alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["胖虎擲球得分：乘法+加法兩步驟應用，對應章節但無精確skill"]),
}
