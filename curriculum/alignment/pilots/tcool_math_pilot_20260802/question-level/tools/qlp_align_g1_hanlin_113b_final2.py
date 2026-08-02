"""C3 curriculum alignment for G1-翰林-113下-期末2 (see qlp_items_g1_hanlin_113b_final2.py).
Publisher chapters: 翰林 G1 下 (9 chapters).
"""

from __future__ import annotations

CH4 = ("翰林", "G1", "下", 4)
CH6 = ("翰林", "G1", "下", 6)
CH7 = ("翰林", "G1", "下", 7)
CH8 = ("翰林", "G1", "下", 8)

ALIGN = {
    "q01": dict(officialContentCodes=["N-1-4"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["official N-1-4 解題(貨幣情境)", f"publisher {CH6}",
                                    "翰林G1下該章matchedSkillIds為空，無正式skill條目可精確對應"]),
    "q02": dict(officialContentCodes=["N-1-4"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["同 q01：5元硬幣個數"]),
    "q03": dict(officialContentCodes=["N-1-4"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["同 q01：補多少元"]),
    "q04": dict(officialContentCodes=["N-1-6"], publisherChapter=CH7, candidateSkillIds=["G1-15-01"],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["official N-1-6 日常時間用語", f"publisher {CH7}",
                                    "生日先後排序，貼近 G1-15-01 認識星期/月曆但非逐項對應"]),
    "q05": dict(officialContentCodes=["N-1-6"], publisherChapter=CH7, candidateSkillIds=["G1-15-04"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["skill G1-15-04「生活中日期的運用」對應下個生日推算"]),
    "q06": dict(officialContentCodes=["N-1-6"], publisherChapter=CH7, candidateSkillIds=["G1-15-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["月曆讀取今日/昨日/明日星期幾，對應 G1-15-02 認識月曆"]),
    "q07": dict(officialContentCodes=["N-1-6"], publisherChapter=CH7, candidateSkillIds=["G1-15-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["月曆統計週一週四天數，對應 G1-15-02"]),
    "q08": dict(officialContentCodes=["N-1-6"], publisherChapter=CH7, candidateSkillIds=["G1-15-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["月曆第二個星期日，對應 G1-15-02"]),
    "q09": dict(officialContentCodes=["N-1-6"], publisherChapter=CH7, candidateSkillIds=["G1-15-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["月曆第三個星期二，對應 G1-15-02"]),
    "q10": dict(officialContentCodes=["N-1-6"], publisherChapter=CH7, candidateSkillIds=["G1-15-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["月曆統計週五週六天數，對應 G1-15-02"]),
    "q11": dict(officialContentCodes=["N-1-1"], publisherChapter=CH4,
                candidateSkillIds=[], alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["票數表格讀取，屬100以內的數應用但無正式統計圖表skill(該"
                                    "能力至G2-17/G4-10始有專章)"]),
    "q12": dict(officialContentCodes=["N-1-1"], publisherChapter=CH4,
                candidateSkillIds=["G1-13-09"], alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["票數最多者判斷，貼近 G1-13-09 比較兩個數(此為三數比較)"]),
    "q13": dict(officialContentCodes=["N-1-2"], publisherChapter=CH8, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["official N-1-2 加法和減法", f"publisher {CH8}",
                                    "12-7=5 兩位數減法，屬本章official碼(N-1-2/R-1-1)範疇，"
                                    "但該章 matchedSkillIds 於 publisher-unit-alignment.json "
                                    "為空陣列(章節橋接資料未涵蓋逐項skill)，故不列candidateSkillIds"]),
    "q14": dict(officialContentCodes=["N-1-2"], publisherChapter=CH8, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["10+7+12=29 三數連加，同 q13：章節official碼相符但無"
                                    "skill橋接資料"]),
    "q15": dict(officialContentCodes=["N-1-1"], publisherChapter=CH4,
                candidateSkillIds=["G1-13-09"], alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["34元與四項金額比較判斷可否購買，對應數的大小比較但情境化"]),
    "q16": dict(officialContentCodes=["N-1-4"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["硬幣清點與畫記，對應 chapter6 但該章無正式skill條目"]),
    "q17": dict(officialContentCodes=["N-1-4"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["同 q16：數量最多的錢幣"]),
    "q18": dict(officialContentCodes=["N-1-4"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["同 q16：錢包總額99元"]),
    "q19": dict(officialContentCodes=["N-1-4"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["同 q16：補1元到100元"]),
    "q20": dict(officialContentCodes=["N-1-2"], publisherChapter=CH8, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["27+8=35 兩位數加一位數應用題，同 q13：章節official碼"
                                    "相符但無skill橋接資料"]),
    "q21": dict(officialContentCodes=["N-1-2"], publisherChapter=CH8, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["26-9=17 應用題，同 q13"]),
    "q22": dict(officialContentCodes=["N-1-2"], publisherChapter=CH8, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["57+16=73 兩位數加法應用題，同 q13"]),
    "q23": dict(officialContentCodes=["N-2-6"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["44x2=88 為乘法概念，翰林G1下並無正式乘法章節(乘法始於G2)，"
                                    "官方碼N-2-6屬二年級範疇，本題對一年級課程而言為超綱應用，"
                                    "保留uncertain"]),
    "q24": dict(officialContentCodes=["N-1-2"], publisherChapter=CH8, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["25-9=16 應用題，同 q13"]),
}
