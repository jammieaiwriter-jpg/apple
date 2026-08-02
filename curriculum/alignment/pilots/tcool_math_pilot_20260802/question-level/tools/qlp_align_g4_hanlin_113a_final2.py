"""C3 curriculum alignment for G4-翰林-113上-期末2 (see qlp_items_g4_hanlin_113a_final2.py).
Publisher chapters: 翰林 G4 上 (10 chapters). localId<->questionNumber cross-checked
against the item file with rg before writing this table.
"""

from __future__ import annotations

CH6 = "翰林 G4 上 第6章 除法"
CH7 = "翰林 G4 上 第7章 三角形與全等"
CH8 = "翰林 G4 上 第8章 兩步驟問題與併式"
CH9 = "翰林 G4 上 第9章 二位小數"
CH10 = "翰林 G4 上 第10章 統計圖表"

ALIGN = {
    "q01": dict(officialContentCodes=["N-4-2"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["official N-4-2 較大位數之乘除計算", f"publisher {CH6}",
                                    "3024÷□商四位數的除數判斷，屬除法概念但無單一對應skill"]),
    "q02": dict(officialContentCodes=["N-4-3"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["1999÷5進位求最少硬幣數，屬除法應用但無單一對應skill"]),
    "q03": dict(officialContentCodes=["S-4-7"], publisherChapter=CH7, candidateSkillIds=["G4-07-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["official S-4-7 三角形", f"publisher {CH7}",
                                    "skill G4-07-01「分辨直角、銳角和鈍角三角形」對應敘述"
                                    "正誤判斷"]),
    "q04": dict(officialContentCodes=["S-4-7"], publisherChapter=CH7, candidateSkillIds=["G4-07-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["三角形有2銳角可能種類，對應 G4-07-01"]),
    "q05": dict(officialContentCodes=["R-4-1"], publisherChapter=CH8, candidateSkillIds=["G4-06-07"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["official R-4-1 兩步驟問題併式", f"publisher {CH8}",
                                    "珍珠鮮奶茶算式選擇，對應 G4-06-07 加減混合計算應用題"]),
    "q06": dict(officialContentCodes=["N-4-9"], publisherChapter="翰林 G4 上 第5章 公里",
                candidateSkillIds=[], alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["official N-4-9 長度；游泳池身高門檻判斷(1.4公尺)，"
                                    "屬長度單位比較但翰林G4上第5章「公里」matchedSkillIds"
                                    "皆為公里/公尺/公分換算，非此類門檻判斷題型，"
                                    "保留uncertain"]),
    "q07": dict(officialContentCodes=["N-4-7"], publisherChapter=CH9, candidateSkillIds=["G4-09-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["official N-4-7 二位小數", f"publisher {CH9}",
                                    "2.06中「6」的位值意義，對應 G4-09-02 二位小數的數值"]),
    "q08": dict(officialContentCodes=["D-4-1"], publisherChapter=CH10, candidateSkillIds=["G4-10-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["official D-4-1 報讀長條圖與折線圖以及製作長條圖",
                                    f"publisher {CH10}", "省略符號選擇，對應 G4-10-01 閱讀"
                                    "縱向長條圖(製圖前置判斷)"]),
    "q09": dict(officialContentCodes=["N-4-7"], publisherChapter=CH9, candidateSkillIds=["G4-09-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["9個1、12個0.1和9個0.01合起來，對應 G4-09-02"]),
    "q10": dict(officialContentCodes=["N-4-2"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["9600÷700商與餘數，屬除法概念但無單一對應skill"]),
    "q11": dict(officialContentCodes=["R-4-1"], publisherChapter=CH8, candidateSkillIds=["G4-06-04"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["湯圓合併算式(24x5)÷3，對應 G4-06-04「三個數的除法」"]),
    "q12": dict(officialContentCodes=["N-4-2"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["複選商是否與6000÷300相同，屬除法規律但無單一對應skill"]),
    "q13": dict(officialContentCodes=["N-4-7"], publisherChapter=CH9, candidateSkillIds=["G4-09-04"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["28.2+4.1=32.3 二位小數加法應用題，對應 G4-09 系列加法"]),
    "q14": dict(officialContentCodes=["R-4-1"], publisherChapter=CH8, candidateSkillIds=["G4-06-07"],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["骰子點數兩步驟合併算式，屬兩步驟問題但依賴圖像點數"
                                    "計數非純算式skill"]),
    "q15": dict(officialContentCodes=["D-4-1"], publisherChapter=CH10, candidateSkillIds=["G4-10-06"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["折線圖判讀最高點，對應 G4-10-06 閱讀折線圖"]),
    "q16": dict(officialContentCodes=["D-4-1"], publisherChapter=CH10, candidateSkillIds=["G4-10-07"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["折線圖各點加總，對應 G4-10-07 閱讀單一折線圖並運算"]),
    "q17": dict(officialContentCodes=["S-4-6"], publisherChapter=CH7, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["official S-4-6 平面圖形的全等", f"publisher {CH7}",
                                    "全等三角形對應點/角判斷，屬全等概念但翰林G4上該章"
                                    "matchedSkillIds為三角形分類(G4-07-*)，未見全等對應"
                                    "點skill，列partial"]),
    "q18": dict(officialContentCodes=["S-4-6"], publisherChapter=CH7, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["同 q17：對應邊長求值"]),
    "q19": dict(officialContentCodes=["S-4-6"], publisherChapter=CH7, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["同 q17：全等三角形皆為直角三角形"]),
    "q20": dict(officialContentCodes=["N-4-7"], publisherChapter=CH9, candidateSkillIds=["G4-09-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["圈出5.08張百格板，對應 G4-09-01「利用著色圖認識二位"
                                    "小數」"]),
    "q21": dict(officialContentCodes=["N-4-3"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["等重球秤重推算(除法+乘法)，翰林G4上章節無對應此類"
                                    "等重物品推算題型，保留uncertain"]),
    "q22": dict(officialContentCodes=["N-4-3"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["同 q21"]),
    "q23": dict(officialContentCodes=["N-4-7"], publisherChapter=CH9, candidateSkillIds=["G4-09-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["10-2.89 vs 7.1 小數比大小，對應 G4-09-02"]),
    "q24": dict(officialContentCodes=["N-4-9"], publisherChapter="翰林 G4 上 第5章 公里",
                candidateSkillIds=["G4-04-01"], alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["603公分 vs 6.3公尺，對應 G4-04-01 公分和公尺單位換算比較"]),
    "q25": dict(officialContentCodes=["N-4-2"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["9200÷200 vs 92÷2 除法規律比較，屬CH6但無單一對應skill"]),
    "q26": dict(officialContentCodes=["N-4-7"], publisherChapter=CH9, candidateSkillIds=["G4-09-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["99個0.01 vs 1.01 小數比大小，對應 G4-09-02"]),
    "q27": dict(officialContentCodes=["N-4-7"], publisherChapter=CH9, candidateSkillIds=["G4-09-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["36個0.1 vs 3.7 小數比大小，對應 G4-09-02"]),
    "q28": dict(officialContentCodes=["N-4-3"], publisherChapter=CH6, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["年票除法應用(3800÷888)判斷划算次數，屬除法應用但"
                                    "無單一對應skill"]),
    "q29": dict(officialContentCodes=["D-4-1"], publisherChapter=CH10, candidateSkillIds=["G4-10-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["長條圖標題填寫，對應 G4-10-01"]),
    "q30": dict(officialContentCodes=["N-4-9"], publisherChapter="翰林 G4 上 第5章 公里",
                candidateSkillIds=["G4-04-01"], alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["235公分=2.35公尺-1.2公尺，對應 G4-04-01 公分/公尺換算"
                                    "與 G4-09 小數減法"]),
    "q31": dict(officialContentCodes=["R-4-1"], publisherChapter=CH8, candidateSkillIds=["G4-06-06"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["蘋果蛋糕總價找零，對應 G4-06-06 加減應用題(一)"]),
    "q32": dict(officialContentCodes=["S-4-7"], publisherChapter=CH7, candidateSkillIds=["G4-07-03"],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["等腰三角形尺規作圖(開放式)，對應 G4-07-03 繪畫和製作"
                                    "三角形，惟無固定文字答案，保留uncertain"]),
}
