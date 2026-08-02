"""Manually transcribed, page-image-verified question-level items for calibration
source G2-康軒-112下-期中1-P01_R10_安和國小_新北市_2年級_數學_112下_期中1_康軒.

Every stem/option/answer below was read directly from the rendered page images at
source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/G2-_-112_-_1-P01_R10_____2____112___1__/page-{1,2,3}.jpg
and cross-checked against the answer key PDF
source_materials/tcool_math_g1_g4_康軒_翰林/grade-2/康軒/answers/P01_R10_安和國小_新北市_2年級_數學_112下_期中1_康軒_答案卷.pdf
(single page). Every numeric/logical answer was independently recomputed; the
recomputation is recorded inline in each item's `verify` note and folded into
answerEvidence by the build script. No answer, option, or stem text is guessed.

Splitting rule applied uniformly across this pilot: a circled sub-label (①②③④) on
the original paper is split into its own question_item because the answer key grades
each circled sub-label separately; inline blanks within one running sentence (no
circled sub-label) stay combined as one question_item because they are not
independently answerable without the shared sentence context.

sourceGroupIds (old question_group_candidate IDs) are assigned by the build script
from OLD_CANDIDATES_BY_PAGE in build_question_level_pilot.py, matched on sourcePage,
since the upstream extraction interleaved two-column text and its own `questionNumber`
labels are not trustworthy page-independent identifiers (see pilot-report.md).
"""

from __future__ import annotations

SOURCE_ID = "G2-康軒-112下-期中1-P01_R10_安和國小_新北市_2年級_數學_112下_期中1_康軒"

# Full-page pixel bounds at BBOX_DPI=400 for this source's question PDF (rot=0,
# 728.52 x 1031.76 pt -> 4047 x 5732 px). Answer PDF is a separate A4 page
# (595.32 x 841.92 pt -> 3307 x 4677 px), used only for answerEvidence framing.
PAGE_BBOX = {1: [0, 0, 4047, 5732], 2: [0, 0, 4047, 5732], 3: [0, 0, 4047, 5732]}
ANSWER_PAGE_BBOX = {1: [0, 0, 3307, 4677]}

ITEMS = [
    dict(localId="q01", sourcePage=1, questionNumber="一-1",
         stem="小美有 218 元，以下哪一個套餐她無法選購？",
         options=["①182 元炸豬排", "②219 元部隊鍋", "③128 元炒麵", "④199 元咕咕雞"],
         correctAnswer="②219 元部隊鍋",
         verify="218<219，其餘三項皆≤218，故獨立驗算確認②為無法選購項目，與答案卷「1.2」一致。"),
    dict(localId="q02", sourcePage=1, questionNumber="一-2",
         stem="大雄有 228 元，每個月他可以存 100 元，最少要存幾個月才有 1000 元？",
         options=["①7 個月", "②8 個月", "③9 個月", "④10 個月"],
         correctAnswer="②8 個月",
         verify="228+100×7=928<1000；228+100×8=1028≥1000，故最少 8 個月，與答案卷「2.2」一致。"),
    dict(localId="q03", sourcePage=1, questionNumber="一-3",
         stem="以下是 4 個好朋友的生日，請問今年誰第一個過生日？",
         options=["①小愛 8 月 2 日", "②美月 4 月 4 日", "③有為 8 月 13 日", "④明風 2 月 29 日"],
         correctAnswer="④明風 2 月 29 日",
         verify="以曆年日序比較：2/29 < 4/4 < 8/2 < 8/13，最早為④，與答案卷「3.4」一致。"),
    dict(localId="q04", sourcePage=1, questionNumber="一-4",
         stem="以下哪一個說法不對？",
         options=["①一個星期有七天。", "②一個月大約有四個星期。",
                   "③這個星期三到下個星期三剛好是一星期。", "④5 月 7 日到 5 月 13 日也是一個星期。"],
         correctAnswer="③這個星期三到下個星期三剛好是一星期。",
         verify="首尾都算：本星期三到下星期三共經過的日曆天數為 8 天（不是恰好 7 天=一星期），"
                "而 5/7 到 5/13 首尾都算恰為 7 天，故④正確、③不對，與答案卷「4.3」一致。"),
    dict(localId="q05", sourcePage=1, questionNumber="一-5",
         stem="以下是電器行對售出的電器提供的保固期限，請問哪一個期限最長？",
         options=["①熱水瓶:1 年", "②相機:16 個月", "③電視:24 個月", "④冷氣:3 年"],
         correctAnswer="④冷氣:3 年",
         verify="換算月數：12<16<24<36，最長為④3 年=36 個月，與答案卷「5.4」一致。"),
    dict(localId="q06", sourcePage=1, questionNumber="一-6",
         stem="以下年月日的說法，哪一個才對？",
         options=["①小月都有 30 天", "②天數最少的月份是 2 月", "③大月都有 30 天",
                   "④2 月有 28 天的那一年是閏年"],
         correctAnswer="②天數最少的月份是 2 月",
         verify="2 月固定為天數最少月份（28 或 29 天）為真；①③大月應為 31 天、小月非全為 30 天；"
                "④2 月有 28 天的年份是平年而非閏年，故只有②正確，與答案卷「6.2」一致。"),
    dict(localId="q07", sourcePage=1, questionNumber="一-7",
         stem="以下哪一個說法不對？",
         options=["①正三角形的三個邊都一樣長", "②正方形和長方形都有四個角",
                   "③正方形的上下兩條邊一樣長", "④長方形的上下兩條邊不一樣長"],
         correctAnswer="④長方形的上下兩條邊不一樣長",
         verify="長方形對邊相等，上下兩邊應一樣長，故④敘述不對，與答案卷「7.4」一致。"),
    dict(localId="q08", sourcePage=1, questionNumber="二-1-①",
         stem="按照順序填填看：665-765-( )-( )",
         options=[], correctAnswer="865、965",
         verify="等差 +100：665,765,865,965，與答案卷「1.①865、965」一致。"),
    dict(localId="q09", sourcePage=1, questionNumber="二-1-②",
         stem="按照順序填填看：910-900-( )-( )-870",
         options=[], correctAnswer="890、880",
         verify="等差 -10：910,900,890,880,870，與答案卷「1.②890、880」一致。"),
    dict(localId="q10", sourcePage=1, questionNumber="二-2-①",
         stem="答案大約是多少，在□裡打√：707-598",
         options=["□300", "□200", "□100"], correctAnswer="□100",
         verify="估算 700-600=100，與答案卷「2.①√100」一致。"),
    dict(localId="q11", sourcePage=1, questionNumber="二-2-②",
         stem="答案大約是多少，在□裡打√：610+99",
         options=["□600", "□700", "□800"], correctAnswer="□700",
         verify="估算 600+100=700，與答案卷「2.②√700」一致。"),
    dict(localId="q12", sourcePage=1, questionNumber="二-3",
         stem="用數字卡 4 7 0 6 3 排排看。最大的三位數字是( )；最小的三位數字是( )。",
         options=[], correctAnswer="764、304",
         verify="可用數字 {4,7,0,6,3}；三位數首位不可為0：最大取高位遞減 764，最小取首位最小之非零數"
                "3 再配最小兩位 04 得 304。與答案卷「3.(764)、(304)」一致。"),
    dict(localId="q13", sourcePage=1, questionNumber="二-4",
         stem="一盒蘋果有 10 顆，十盒裝成一箱。店裡有 870 顆蘋果，可以裝成( )箱又( )盒。"
              "今天賣掉 3 箱，還剩( )顆。",
         options=[], correctAnswer="8 箱 7 盒；剩 570 顆",
         verify="870÷10=87 盒=8 箱 7 盒；賣掉 3 箱=300 顆；870-300=570 顆。與答案卷"
                "「4.(8)箱(7)盒，剩(570)顆」一致。"),
    dict(localId="q14", sourcePage=1, questionNumber="二-5-①",
         stem="比一比，填入 >、< 或 =：408( )4 個百 18 個一",
         options=[], correctAnswer="<",
         verify="4 個百 18 個一=418；408<418。與答案卷「5.①<」一致。"),
    dict(localId="q15", sourcePage=1, questionNumber="二-5-②",
         stem="比一比，填入 >、< 或 =：5 個百 6 個十 13 個 1( )5 個百 7 個十",
         options=[], correctAnswer=">",
         verify="5 個百6個十13個1=573；5個百7個十=570；573>570。與答案卷「5.②>」一致。"),
    dict(localId="q16", sourcePage=1, questionNumber="二-5-③",
         stem="比一比，填入 >、< 或 =：4×6( )8×6",
         options=[], correctAnswer="<",
         verify="24<48。與答案卷「5.③<」一致。"),
    dict(localId="q17", sourcePage=1, questionNumber="二-5-④",
         stem="比一比，填入 >、< 或 =：6×9( )9×6",
         options=[], correctAnswer="=",
         verify="54=54。與答案卷「5.④=」一致。"),
    dict(localId="q18", sourcePage=2, questionNumber="二-6-①",
         stem="根據月曆（3 月月曆圖，3/1 對齊「一」欄＝星期一），想一想再答題："
              "美術館從 3 月 12 日起，展開 10 天的水彩畫展覽，最後一天是 3 月( )日。",
         options=[], correctAnswer="21",
         crop=[200, 350, 1550, 1200],
         verify="3/12 為第1天，第10天=3/12+9=3/21。與答案卷「6.①(21)」一致；月曆圖已裁切存證確認 3/1=星期一。"),
    dict(localId="q19", sourcePage=2, questionNumber="二-6-②",
         stem="媽媽 3 月 16 日到日本出差 1 個星期，最後一天是 3 月( )日，回國後想去看水彩畫展覽，"
              "請問她來得及或來不及呢？答:( )",
         options=[], correctAnswer="22；來不及",
         crop=[200, 350, 1550, 1200],
         verify="3/16 為第1天，滿1星期(7天)最後一天=3/16+6=3/22；展覽已於3/21結束(見二-6-①)，"
                "3/22>3/21 故來不及。與答案卷「6.②(22)、(來不及)」一致。"),
    dict(localId="q20", sourcePage=2, questionNumber="二-6-③",
         stem="查看上表 4 月 1 日是爸爸的生日，那一天是星期( )",
         options=[], correctAnswer="四",
         crop=[200, 350, 1550, 1200],
         verify="月曆圖確認 3/1=星期一；3月共31天，4/1=3/1+31天，31 mod 7=3，星期一+3=星期四。"
                "與答案卷「6.③(四)」一致。"),
    dict(localId="q21", sourcePage=2, questionNumber="二-7",
         stem="看圖填入：頂點、邊或角（直角三角形圖，三個箭頭依序指向：頂點交角處、斜邊中段、右下方頂點）",
         options=[], correctAnswer="角、邊、頂點",
         crop=[30, 3000, 1750, 750],
         verify="裁圖確認：左側箭頭指向頂角夾角弧線記號=角；右上箭頭指向斜邊線段中段=邊；"
                "最右側括號緊鄰三角形右下角頂點=頂點。三空格由左至右依序為角、邊、頂點，"
                "與答案卷「7.(角)、(邊)、(頂點)」順序一致。"),
    dict(localId="q22", sourcePage=2, questionNumber="二-8-①",
         stem="看圖回答（正三角形疊於正方形上，四邊皆標示 6 公分）：①用色筆描出上圖的周界。",
         options=[], correctAnswer="略（操作題，描邊，無固定文字答案）",
         answerStatus="needs_review", verificationMethod="visual_manual_required",
         verify="此為描邊操作題，答案卷本身亦標示「周界(略)」，無可獨立驗算之文字/數值答案，"
                "故不計入 verified 可用題，留待人工檢視描邊正確性。"),
    dict(localId="q23", sourcePage=2, questionNumber="二-8-②",
         stem="看圖回答：②上圖是由( )形和( )形合成的。",
         options=[], correctAnswer="正三角形、正方形",
         verify="圖中三角形三邊皆標 6 公分（正三角形）、下方四邊皆標 6 公分（正方形）。"
                "與答案卷「8.②(正三角形)和(正方形)」一致。"),
    dict(localId="q24", sourcePage=2, questionNumber="二-8-③",
         stem="看圖回答：③上圖的周長是( )公分。",
         options=[], correctAnswer="30",
         verify="組合圖周界=正方形三邊(不含與三角形共用之頂邊)+三角形兩腰=3×6+2×6=30。"
                "與答案卷「8.③(30)公分」一致。"),
    dict(localId="q25", sourcePage=2, questionNumber="三-1",
         stem="大雄和小夫下個月計畫幫靜香慶生。商店販賣的甜點價目表：4 吋蛋糕 480 元/個、"
              "熔岩巧克力 380 元/盒、手工餅乾 185 元/盒。大雄有 500 元。請問他至少還要存幾百元，"
              "才能買一個蛋糕和一盒手工餅乾？(先估估看，再算)",
         options=[], correctAnswer="200 元",
         verify="480+185=665；665-500=165，無條件進位至百元＝200 元。與答案卷「①(200 元)」一致。"),
    dict(localId="q26", sourcePage=2, questionNumber="三-2",
         stem="請你算出小夫的錢包裡有幾元？（圖示：5 張千元鈔、5 個五十元硬幣、12 個十元硬幣、4 個一元硬幣）",
         options=[], correctAnswer="874 元",
         verify="經清點圖中鈔票／硬幣：5×100+5×50+12×10+4×1=500+250+120+4=874。"
                "與答案卷「②(874 元)」一致。"),
    dict(localId="q27", sourcePage=2, questionNumber="三-3",
         stem="如果小夫想買一盒 380 元的熔岩巧克力，他會剩下幾元？(請你在上圖中圈出 380 元，"
              "再算小夫剩多少元) 圈選 2 分，作答 1 分",
         options=[], correctAnswer="494 元",
         verify="沿用三-2 之 874 元，874-380=494。與答案卷「③(494 元)」一致。"),
    dict(localId="q28", sourcePage=3, questionNumber="四-1",
         stem="寫出直式算算看：17+287=( )",
         options=[], correctAnswer="304",
         verify="17+287=304。與答案卷「①(304)」一致。"),
    dict(localId="q29", sourcePage=3, questionNumber="四-2",
         stem="寫出直式算算看：807-423=( )",
         options=[], correctAnswer="384",
         verify="807-423=384。與答案卷「②(384)」一致。"),
    dict(localId="q30", sourcePage=3, questionNumber="五-1",
         stem="哥哥原來有一些錢，買了一本 263 元的漫畫書，還剩下 157 元，哥哥原來有多少錢？",
         options=[], correctAnswer="420 元",
         verify="263+157=420。與答案卷「1. 263+157=420 答:420元」一致。"),
    dict(localId="q31", sourcePage=3, questionNumber="五-2",
         stem="一包口香糖有 10 片，6 包口香糖有幾片？",
         options=[], correctAnswer="60 片",
         verify="10×6=60。與答案卷「2. 10×6=60 答:60片」一致。"),
    dict(localId="q32", sourcePage=3, questionNumber="五-3",
         stem="這個圖形的周界有多長？（梯形，上邊 12 公分、右邊 7 公分、下邊 6 公分、左邊 6 公分）",
         options=[], correctAnswer="31 公分",
         verify="四邊和：6+6+7+12=31。與答案卷「3. 6+6=12;12+7=19;12+19=31 答:31公分」一致。"),
    dict(localId="q33", sourcePage=3, questionNumber="五-4",
         stem="園遊會裡丟水球。每顆丟在圓內的水球可以獲得 2 支棒棒糖；丟在周界上可獲得 1 支棒棒糖；"
              "丟在周界外沒有獎勵。上面是小花玩水球的結果。請問她可以拿到幾支棒棒糖？",
         options=[], correctAnswer="7 支",
         crop=[2200, 1500, 1200, 700],
         verify="裁圖清點星形水球：完全在圓內 3 顆、壓在圓周界上 1 顆、圓外 2 顆（不計分）。"
                "2×3+1×1=7。與答案卷「4. 2×3=6;6+1=7 答:7支」一致，星形計數已由裁圖覆核。"),
    dict(localId="q34", sourcePage=3, questionNumber="五-5",
         stem="以下是胖虎玩球擲遠的結果，算算看，胖虎的總分是多少。得分:10分/5分/1分/0分，"
              "數量:3球/0球/2球/2球",
         options=[], correctAnswer="32 分",
         verify="10×3+5×0+1×2+0×2=30+0+2+0=32。與答案卷「5. ...30+2=32 答32分」一致。"),
]

for _it in ITEMS:
    _it.setdefault("boundaryStatus", "verified")
    _it.setdefault("answerStatus", "verified")
    _it.setdefault("verificationMethod", "independent_calculation")
    _it.setdefault("crop", None)
    _it.setdefault("answerKeyPage", 1)

assert len(ITEMS) == 34
assert len({it["localId"] for it in ITEMS}) == 34
