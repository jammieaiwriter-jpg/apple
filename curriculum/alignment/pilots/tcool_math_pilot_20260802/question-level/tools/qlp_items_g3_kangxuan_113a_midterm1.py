"""Manually transcribed, page-image-verified question-level items for
G3-康軒-113上-期中1-P01_R07_安和國小_新北市_3年級_數學_113上_期中1_康軒.

Question pages: source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/
G3-_-113_-_1-P01_R07_____3____113___1__/page-{1,2,3}.jpg (rot=0, 728.52x1031.76pt).
Answer key: source_materials/tcool_math_g1_g4_康軒_翰林/grade-3/康軒/answers/
P01_R07_安和國小_新北市_3年級_數學_113上_期中1_康軒_答案卷.pdf (3 pages, worked-answer
scan read directly by vision).

IMPORTANT FINDING: item 一-4 ("5467>54□6，□中可以填入哪些數字？") — the answer key
states "6、7、8、9", but independent recomputation shows this is mathematically wrong:
54□6 = 5406+10×□; 5467 > 5406+10□  <=>  □ < 6.1  <=>  □ ∈ {0,1,2,3,4,5,6}, not
{6,7,8,9} (e.g. □=7 gives 5476, and 5467 is NOT greater than 5476). This was
re-verified twice (digit-place recomputation and a boundary check at □=6 and □=7)
and the printed inequality direction was re-cropped and confirmed to be exactly
"5467＞54□6". Per the no-guessing rule this item is kept as answerStatus=needs_review
with the answer key's original text preserved verbatim in correctAnswer, not silently
corrected — it is routed to the answer-review-queue.

The two "紙條有多長" ruler-reading items (三-1, 三-2) cannot be independently
recomputed (they require measuring a printed strip against a physical ruler, which
this pipeline cannot simulate reliably from PDF point-geometry); they are recorded as
visual_manual_required, trusting the worked-answer scan's stated mm/cm values.
"""

from __future__ import annotations

SOURCE_ID = "G3-康軒-113上-期中1-P01_R07_安和國小_新北市_3年級_數學_113上_期中1_康軒"

PAGE_BBOX = {1: [0, 0, 4047, 5732], 2: [0, 0, 4047, 5732], 3: [0, 0, 4047, 5732]}

ITEMS = [
    dict(localId="q01", sourcePage=1, questionNumber="一-1-(1)",
         stem="按照順序填填看：8588→8598→( )→( )→8628",
         options=[], correctAnswer="8608、8618",
         verify="等差+10：8588,8598,8608,8618,8628。與答案卷「(8608)(8618)」一致。"),
    dict(localId="q02", sourcePage=1, questionNumber="一-1-(2)",
         stem="按照順序填填看：( )→5226→5126→( )→( )",
         options=[], correctAnswer="5326、5026、4926",
         verify="等差-100：5326,5226,5126,5026,4926。與答案卷「(5326)(5026)(4926)」一致。"),
    dict(localId="q03", sourcePage=1, questionNumber="一-2",
         stem="8個千、22個十和17個一合起來是( )，讀作( )。",
         options=[], correctAnswer="8237，讀作八千二百三十七",
         verify="8000+220+17=8237。與答案卷「(8237)(八千二百三十七)」一致。"),
    dict(localId="q04", sourcePage=1, questionNumber="一-3",
         stem="有5張數字卡8、0、5、9、2，用其中的4張組成，最大的四位數是( )，最小的四位數是( )。",
         options=[], correctAnswer="9852、2058",
         verify="最大：降冪取9852；最小：首位取最小非零數字2，其餘升冪配置得2058。"
                "與答案卷「(9852)(2058)」一致。"),
    dict(localId="q05", sourcePage=1, questionNumber="一-4",
         stem="5467>54□6，□中可以填入哪些數字？",
         options=[], correctAnswer="6、7、8、9",
         answerStatus="needs_review", verificationMethod="independent_calculation",
         verify="獨立驗算：54□6=5406+10□；5467>5406+10□ 等價於 □<6.1，"
                "故合理解應為 □∈{0,1,2,3,4,5,6}（例：□=7時54□6=5476，5467並不大於5476）。"
                "此與答案卷所載「6、7、8、9」不符，已重新核對原題不等式方向確為「5467＞54□6」，"
                "非誤讀。依規定如實保留答案卷原始文字，標記 needs_review，列入 answer-review-queue，"
                "不得逕自改為獨立驗算結果。"),
    dict(localId="q06", sourcePage=1, questionNumber="一-5",
         stem="玩具店裡的一個海豚玩偶1895元，比機器人模型便宜490元，一個機器人模型多少元？"
              "請用1000、100、10和1畫畫看。",
         options=[], correctAnswer="2385 元",
         verify="1895+490=2385。與答案卷「2385元(圖略)」一致。"),
    dict(localId="q07", sourcePage=1, questionNumber="一-6-(1)",
         stem="安和購物中心的手錶標價，但百位、十位數被擋住了（2●●9元）。豆豆的爸爸想買這只手錶，"
              "請問：(1)爸爸最多可能要付多少元？",
         options=[], correctAnswer="2999 元",
         verify="百位十位未知數取最大值9、9：2999。與答案卷「(2999)元」一致。"),
    dict(localId="q08", sourcePage=1, questionNumber="一-6-(2)",
         stem="(2)爸爸最少可能要付多少元？",
         options=[], correctAnswer="2009 元",
         verify="百位十位未知數取最小值0、0：2009。與答案卷「(2009)元」一致。"),
    dict(localId="q09", sourcePage=1, questionNumber="一-7-(1)",
         stem="有一隻毛毛蟲停在數線上40的位置（數線刻度0,10,20,...,100，每格10）。"
              "(1)毛毛蟲往右邊移動3格，會到數字( )。",
         options=[], correctAnswer="70",
         verify="40+3×10=70。與答案卷「(70)」一致。"),
    dict(localId="q10", sourcePage=1, questionNumber="一-7-(2)",
         stem="(2)接著牠又往( )移動4格，最後到數字30。(填左邊或右邊)",
         options=[], correctAnswer="左邊",
         verify="70→30需減少40=4格×10，故往左邊移動。與答案卷「(左邊)」一致。"),
    dict(localId="q11", sourcePage=1, questionNumber="一-8-(1)",
         stem="下表是2023年1~5月在臺灣第一高峰「玉山」的月雨量統計表（1月62mm、2月4mm、3月9mm、"
              "4月74mm、5月301mm）。(1)一月的降雨量62毫米是( )公分( )毫米。",
         options=[], correctAnswer="6公分2毫米",
         verify="62mm=60mm+2mm=6cm2mm。與答案卷「(6)(2)」一致。"),
    dict(localId="q12", sourcePage=1, questionNumber="一-8-(2)",
         stem="(2)四月的降雨量74毫米是( )公分( )毫米。",
         options=[], correctAnswer="7公分4毫米",
         verify="74mm=7cm4mm。與答案卷「(7)(4)」一致。"),
    dict(localId="q13", sourcePage=1, questionNumber="一-8-(3)",
         stem="(3)五月的降雨量301毫米是( )公分( )毫米。",
         options=[], correctAnswer="30公分1毫米",
         verify="301mm=30cm1mm。與答案卷「(30)(1)」一致。"),
    dict(localId="q14", sourcePage=1, questionNumber="一-8-(4)",
         stem="(4) 2023年1~5月在玉山測得的雨量中，雨量最高的月分和雨量最低的月分相差( )公分( )毫米。",
         options=[], correctAnswer="29公分7毫米",
         verify="最高5月301mm，最低2月4mm，差=297mm=29cm7mm。與答案卷「(29)(7)」一致。"),
    dict(localId="q15", sourcePage=1, questionNumber="一-9-(1)",
         stem="想想看，□裡要填什麼數字呢？(1) 2□4□ + 4 2□7 = □205（直式加法，4個空格）",
         options=[], correctAnswer="2948+4257=7205（依序：百位9、個位8、十位5、千位7）",
         verify="逐位驗算：2948+4257=7205，與各空格紅字9/8/5/7完全相符（已重新用直式加法驗算全式）。"),
    dict(localId="q16", sourcePage=1, questionNumber="一-9-(2)",
         stem="(2) 6□04 - 1 7□5 = □729（直式減法，3個空格）",
         options=[], correctAnswer="6504-1775=4729（依序：百位5、十位7、千位4）",
         verify="逐位驗算：6504-1775=4729，與各空格紅字5/7/4相符（已重新用直式減法驗算全式）。"),
    dict(localId="q17", sourcePage=1, questionNumber="一-9-(3)",
         stem="(3) □2□ × 5 = 3615（直式乘法，2個空格）",
         options=[], correctAnswer="723×5=3615（依序：百位7、個位3）",
         verify="723×5=3615（已重新驗算）。與答案卷紅字7/3相符。"),
    dict(localId="q18", sourcePage=1, questionNumber="一-9-(4)",
         stem="(4) 想一想，在□裡填入6、9、1，怎麼填，算式的答案會最大？（格式：7□□ × □）",
         options=[], correctAnswer="761×9=6849（最大值）",
         verify="窮舉三種乘數指派：乘數1時最大796×1=796；乘數6時最大791×6=4746；乘數9時最大"
                "761×9=6849。6849為三者最大，與答案卷手寫「761×9」一致。"),
    dict(localId="q19", sourcePage=1, questionNumber="二-1-(1)",
         stem="請根據下面的價錢估算看看，並圈出正確答案（手套595元、洋娃娃305元、玩具飛機399元、"
              "玩具汽車501元）。(1)一隻手套和一個玩具飛機的價錢合起來大約是：(800元、900元、1000元)",
         options=["800元", "900元", "1000元"], correctAnswer="1000元",
         verify="595+399=994，最接近1000元。與答案卷圈選「1000元」一致。"),
    dict(localId="q20", sourcePage=1, questionNumber="二-1-(2)",
         stem="(2)一個洋娃娃和一個玩具汽車的價錢大約相差：(100元、200元、300元)",
         options=["100元", "200元", "300元"], correctAnswer="200元",
         verify="501-305=196，最接近200元。與答案卷圈選「200元」一致。"),
    dict(localId="q21", sourcePage=1, questionNumber="二-1-(3)",
         stem="(3)豆豆要和家人練習傳接球買了4隻手套，大約需多少錢：(2000元、2200元、2400元)",
         options=["2000元", "2200元", "2400元"], correctAnswer="2400元",
         verify="4×595=2380，最接近2400元。與答案卷圈選「2400元」一致。"),
    dict(localId="q22", sourcePage=2, questionNumber="二-2",
         stem="豆豆的媽媽去賣場買東西，大約花了900元，他可能是買了哪樣東西？請打✓"
              "（205元沖泡式咖啡3包／294元茶葉3罐／312元餅乾禮盒4盒）",
         options=["205元沖泡式咖啡3包", "294元茶葉3罐", "312元餅乾禮盒4盒"],
         correctAnswer="294元茶葉3罐",
         verify="205×3=615、294×3=882、312×4=1248，僅882最接近900元。與答案卷勾選「294元茶葉3罐」一致。"),
    dict(localId="q23", sourcePage=2, questionNumber="三-1",
         stem="量量看，紙條有多長：（灰底圓點花紋紙條圖）( )毫米",
         options=[], correctAnswer="57 毫米",
         verificationMethod="visual_manual_required",
         verify="此題要求以實體直尺量測印刷紙條長度，PDF點座標無法可靠換算為列印後之實際毫米，"
                "無法以獨立算式驗算，依答案卷所載「57毫米」如實記錄，標記視覺人工複核方式。"),
    dict(localId="q24", sourcePage=2, questionNumber="三-2",
         stem="量量看，紙條有多長：（灰底星星花紋紙條圖）( )公分( )毫米",
         options=[], correctAnswer="6公分5毫米",
         verificationMethod="visual_manual_required",
         verify="同三-1，需實體量測，依答案卷所載「6公分5毫米」如實記錄。"),
    dict(localId="q25", sourcePage=2, questionNumber="四-1",
         stem="寫出直式算算看：4084+2935=( )",
         options=[], correctAnswer="7019",
         verify="4084+2935=7019。與答案卷「(7019)」一致。"),
    dict(localId="q26", sourcePage=2, questionNumber="四-2",
         stem="寫出直式算算看：7030-2469=( )",
         options=[], correctAnswer="4561",
         verify="7030-2469=4561。與答案卷「(4561)」一致。"),
    dict(localId="q27", sourcePage=2, questionNumber="四-3",
         stem="649×5=( )",
         options=[], correctAnswer="3245",
         verify="649×5=3245。與答案卷「(3245)」一致。"),
    dict(localId="q28", sourcePage=2, questionNumber="四-4",
         stem="408×7=( )",
         options=[], correctAnswer="2856",
         verify="408×7=2856。與答案卷「(2856)」一致。"),
    dict(localId="q29", sourcePage=2, questionNumber="四-5",
         stem="16公分9毫米-123毫米=( )公分( )毫米",
         options=[], correctAnswer="4公分6毫米",
         verify="169mm-123mm=46mm=4cm6mm。與答案卷「(4)(6)」一致。"),
    dict(localId="q30", sourcePage=2, questionNumber="四-6",
         stem="76毫米+5公分3毫米=( )毫米",
         options=[], correctAnswer="129",
         verify="76mm+53mm=129mm。與答案卷「(129)」一致。"),
    dict(localId="q31", sourcePage=2, questionNumber="五-1",
         stem="小蝸牛沿著牆壁爬，從甲地出發，經過乙地到丙地（甲到乙8公分6毫米，乙到丙4公分8毫米），"
              "一共爬了幾公分幾毫米？",
         options=[], correctAnswer="13公分4毫米",
         verify="86mm+48mm=134mm=13cm4mm。與答案卷「答:13公分4毫米」一致。"),
    dict(localId="q32", sourcePage=2, questionNumber="五-2",
         stem="將兩根竹竿像這樣用繩子綁起來（25公分5毫米、37公分3毫米，重疊部分6公分），"
              "綁完後總長度是長幾公分幾毫米？",
         options=[], correctAnswer="56公分8毫米",
         verify="255mm+373mm-60mm(重疊)=568mm=56cm8mm。與答案卷「答:56公分8毫米」一致。"),
    dict(localId="q33", sourcePage=3, questionNumber="六-1",
         stem="（豆豆暑假日記：四人小隊加邁斯和樂樂共6人去快樂農場一日遊；農場地圖：園區入口經遊客"
              "中心到餐廳746公尺+1545公尺）請參考快樂農場地圖，他們從農場入口經過遊客中心走到餐廳，"
              "共走了多少公尺？",
         options=[], correctAnswer="2291 公尺",
         verify="1545+746=2291。與答案卷「1545+746=2291 答:2291公尺」一致。"),
    dict(localId="q34", sourcePage=3, questionNumber="六-2",
         stem="接第1題，竹林步道比從入口經過遊客中心到餐廳的路線還要短355公尺，請問竹林步道的長度"
              "是幾公尺？",
         options=[], correctAnswer="1936 公尺",
         verify="2291-355=1936。與答案卷「2291-355=1936 答:1936公尺」一致。"),
    dict(localId="q35", sourcePage=3, questionNumber="六-3",
         stem="他們中午享用了農場的特色餐點（每份295元），請問6份餐點共要多少元？",
         options=[], correctAnswer="1770 元",
         verify="295×6=1770。與答案卷「295×6=1770 答:1770元」一致。"),
    dict(localId="q36", sourcePage=3, questionNumber="六-4",
         stem="水蜜桃禮盒一層有15個水蜜桃，一箱有2層，6箱共有幾個水蜜桃？",
         options=[], correctAnswer="180 個",
         verify="15×2=30(每箱)；30×6=180。與答案卷「15×2=30;30×6=180 答:180個」一致。"),
]

for _it in ITEMS:
    _it.setdefault("boundaryStatus", "verified")
    _it.setdefault("answerStatus", "verified")
    _it.setdefault("verificationMethod", "independent_calculation")
    _it.setdefault("crop", None)
    _it.setdefault("answerKeyPage", _it["sourcePage"])

assert len(ITEMS) == 36
assert len({it["localId"] for it in ITEMS}) == 36
