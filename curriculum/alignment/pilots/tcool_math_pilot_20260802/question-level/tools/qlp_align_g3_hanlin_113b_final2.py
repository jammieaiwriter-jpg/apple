"""C3 curriculum alignment for G3-翰林-113下-期末2 (see qlp_items_g3_hanlin_113b_final2.py).
Publisher chapters: 翰林 G3 下 (9 chapters).

exam-inventory.json records this source's own scopeEvidence as
declaredUnitRanges=[{"start":6,"end":9}] ("單元 6～單元 9"), i.e. the exam paper
itself states it covers chapters 6-9 (一位小數/時間/乘與除/面積). Most items below map
into that declared range; the few that don't (位值換算、估算) are kept uncertain
rather than forced into the declared range, consistent with ALIGNMENT_CONTRACT.md's
"expectedUnits/observedUnits 必須分開" rule — a paper can still test material outside
its own declared unit range, and that must not be hidden by a forced match.

localId <-> questionNumber mapping was re-verified against the actual item file with
a small script before writing this table, after an earlier draft mis-indexed by 2 for
q13 onward and was discarded.
"""

from __future__ import annotations

CH6 = ("翰林", "G3", "下", 6)
CH7 = ("翰林", "G3", "下", 7)
CH8 = ("翰林", "G3", "下", 8)
CH9 = ("翰林", "G3", "下", 9)

ALIGN = {
    "q01": dict(officialContentCodes=["N-3-17"], publisherChapter=CH7, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["official N-3-17 時間", f"publisher {CH7}",
                                    "9:30AM/PM表示法敘述，屬時間概念但無單一對應skill"]),
    "q02": dict(officialContentCodes=["N-3-17"], publisherChapter=CH7, candidateSkillIds=["G3-15-11"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["下午1時睡到4時共180分鐘敘述，對應 G3-15-11「時間應用題"
                                    "(一)-過了多久」"]),
    "q03": dict(officialContentCodes=["N-3-14"], publisherChapter=CH9, candidateSkillIds=["G3-12-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["official N-3-14 面積", f"publisher {CH9}",
                                    "邊長2公分正方形面積敘述，對應 G3-12-02"]),
    "q04": dict(officialContentCodes=["N-3-1"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["16.3條積木位值換算，非本卷宣告單元6-9範圍主題，"
                                    "保留uncertain"]),
    "q05": dict(officialContentCodes=["N-3-10"], publisherChapter=CH6, candidateSkillIds=["G3-16-03"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["skill G3-16-03「一位小數的數值」對應0.1敘述判讀"]),
    "q06": dict(officialContentCodes=["N-3-10"], publisherChapter=CH6, candidateSkillIds=["G3-16-03"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["位值表小數比大小，對應 G3-16-03"]),
    "q07": dict(officialContentCodes=["N-3-6"], publisherChapter=CH8, candidateSkillIds=["G3-06-13"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["234÷3=78餘1 驗算方法，對應 G3-06-13 認識除法的基本概念"]),
    "q08": dict(officialContentCodes=["N-3-17"], publisherChapter=CH7, candidateSkillIds=["G3-15-11"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["下午3時至隔天上午2時加班時數，對應 G3-15-11"]),
    "q09": dict(officialContentCodes=["N-3-14"], publisherChapter=CH9, candidateSkillIds=["G3-12-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["面積單位辨識，對應 G3-12-01"]),
    "q10": dict(officialContentCodes=["N-3-14"], publisherChapter=CH9, candidateSkillIds=["G3-12-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["物品面積接近1平方公分判斷，對應 G3-12-01"]),
    "q11": dict(officialContentCodes=["N-3-14"], publisherChapter=CH9, candidateSkillIds=["G3-12-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["面積相關敘述正誤判斷，對應 G3-12-01"]),
    "q12": dict(officialContentCodes=["N-3-14"], publisherChapter=CH9, candidateSkillIds=["G3-12-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["長方形面積32平方公分求長，對應 G3-12-01"]),
    "q13": dict(officialContentCodes=["N-3-17"], publisherChapter=CH7, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["短針經過刻度11次數(一天2次)，屬時間概念但無單一對應skill"]),
    "q14": dict(officialContentCodes=["N-3-17"], publisherChapter=CH7, candidateSkillIds=["G3-15-04"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["秒針轉1圈分針走幾小格，對應 G3-15-04 認識分鐘"]),
    "q15": dict(officialContentCodes=["N-3-10"], publisherChapter=CH6, candidateSkillIds=["G3-16-03"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["圈出6.6~8.8之間的小數，對應 G3-16-03"]),
    "q16": dict(officialContentCodes=["N-3-10"], publisherChapter=CH6, candidateSkillIds=["G3-16-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["紙條著色圖表示小數，對應 G3-16-01「利用著色圖認識一位"
                                    "小數」"]),
    "q17": dict(officialContentCodes=["N-3-10"], publisherChapter=CH6, candidateSkillIds=["G3-16-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["同 q16"]),
    "q18": dict(officialContentCodes=["N-3-10"], publisherChapter=CH6, candidateSkillIds=["G3-16-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["同 q16：兩條紙條合計1.2條"]),
    "q19": dict(officialContentCodes=["N-3-10"], publisherChapter=CH6, candidateSkillIds=["G3-16-06"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["7.6+1.5=9.1 一位小數進位加法，對應 G3-16-06「2個一位"
                                    "小數進位加法」"]),
    "q20": dict(officialContentCodes=["N-3-14"], publisherChapter=CH9, candidateSkillIds=["G3-12-01"],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["方格圖1格+半格組成計數，屬面積概念但涉及圖像計數"
                                    "非該章單一skill完整涵蓋"]),
    "q21": dict(officialContentCodes=["N-3-14"], publisherChapter=CH9, candidateSkillIds=["G3-12-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["由(1)組成獨立算得塗色面積15平方公分，對應 G3-12-02"]),
    "q22": dict(officialContentCodes=["N-3-17"], publisherChapter=CH7, candidateSkillIds=["G3-17-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["電視節目時刻表查詢，對應 G3-17-01「24小時報時制在生活"
                                    "中的運用」"]),
    "q23": dict(officialContentCodes=["N-3-17"], publisherChapter=CH7, candidateSkillIds=["G3-17-01"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["同 q22：來得及看節目判斷"]),
    "q24": dict(officialContentCodes=["N-3-17"], publisherChapter=CH7, candidateSkillIds=["G3-15-08"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["火車行程時間反推出發時刻，對應 G3-15-08 之逆推應用"]),
    "q25": dict(officialContentCodes=["N-3-6"], publisherChapter=CH8, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["4x□=76 乘除互逆關係填空，屬乘除概念但無單一對應skill"]),
    "q26": dict(officialContentCodes=["N-3-6"], publisherChapter=CH8, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["同 q25：△÷8=11 互逆關係"]),
    "q27": dict(officialContentCodes=["N-3-6"], publisherChapter=CH8, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["同 q25：78÷◇=6 互逆關係"]),
    "q28": dict(officialContentCodes=["N-3-3"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["估算比較(19x6≈20x6)，翰林G3下該範圍章節無估算專項"
                                    "skill，保留uncertain"]),
    "q29": dict(officialContentCodes=["N-3-3"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["同 q28"]),
    "q30": dict(officialContentCodes=["N-3-3"], publisherChapter=None, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["同 q28"]),
    "q31": dict(officialContentCodes=["N-3-6"], publisherChapter=CH8, candidateSkillIds=[],
                alignmentStatus="partial", alignmentConfidence="medium",
                alignmentEvidence=["麵包店表格除法/乘法反推售價與總價，屬乘除應用但表格"
                                    "形式非單一skill明確對應"]),
    "q32": dict(officialContentCodes=["N-3-10"], publisherChapter=CH6, candidateSkillIds=["G3-16-07"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["35.3-24.9=10.4 一位小數退位減法，對應 G3-16-08「2個一位"
                                    "小數退位減法」"]),
    "q33": dict(officialContentCodes=["N-3-10"], publisherChapter=CH6, candidateSkillIds=["G3-16-06"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["54.7+15.3=70.0 一位小數進位加法，對應 G3-16-06"]),
    "q34": dict(officialContentCodes=["N-3-5"], publisherChapter=CH8, candidateSkillIds=["G3-11-02"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["official N-3-5 除以一位數", f"publisher {CH8}",
                                    "146÷7=20...6 兩位數除以一位數有餘數，對應 G3-11-02"]),
    "q35": dict(officialContentCodes=["N-3-5"], publisherChapter=CH8, candidateSkillIds=["G3-11-04"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["468÷9=52...0 三位數除以一位數沒有餘數，對應 G3-11-04"]),
    "q36": dict(officialContentCodes=["N-3-14"], publisherChapter=CH9, candidateSkillIds=[],
                alignmentStatus="uncertain", alignmentConfidence="low",
                alignmentEvidence=["開放式作圖題(畫12平方公分圖形)，無固定文字答案，"
                                    "已於answerStatus標needs_review，對齊亦保留uncertain"]),
    "q37": dict(officialContentCodes=["N-3-10"], publisherChapter=CH6, candidateSkillIds=["G3-16-07"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["12-3.8=8.2 一位小數退位減法應用題(太陽餅)，對應 G3-16-08"]),
    "q38": dict(officialContentCodes=["N-3-10"], publisherChapter=CH6, candidateSkillIds=["G3-16-07"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["80.2-59=21.2 一位小數減整數應用題(緞帶)，對應 G3-16-08"]),
    "q39": dict(officialContentCodes=["N-3-6"], publisherChapter=CH8, candidateSkillIds=["G3-06-14"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["38x7+6=272 乘法加法混合應用題(櫻桃)，對應乘與除章節"
                                    "應用題類型 G3-06-14"]),
    "q40": dict(officialContentCodes=["N-3-6"], publisherChapter=CH8, candidateSkillIds=["G3-06-15"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["48x6=288 除法逆推應用題(綠豆)，對應 G3-06-15 除法應用題"
                                    "(二)"]),
    "q41": dict(officialContentCodes=["N-3-17"], publisherChapter=CH7, candidateSkillIds=["G3-15-06"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["6分22秒=382秒 vs 378秒比較，對應 G3-15-06「以秒為單位"
                                    "量度及比較時間間隔」"]),
    "q42": dict(officialContentCodes=["N-3-17"], publisherChapter=CH7, candidateSkillIds=["G3-15-10"],
                alignmentStatus="direct", alignmentConfidence="high",
                alignmentEvidence=["兩部電影播放時間相加，對應 G3-15-10「以分鐘為單位求"
                                    "時間間隔」"]),
}
