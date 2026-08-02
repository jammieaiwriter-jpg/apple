"""Manually transcribed, page-image-verified question-level items for
G3-翰林-113下-期末2-P01_R01_桃子腳國小_新北市_3年級_數學_113下_期末2_翰林.

Question pages: source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/
G3-_-113_-_2-P01_R01_____3____113___2__/page-{1,2,3}.jpg (rot=0, 728.52x1031.76pt).
Answer key (scan_needs_ocr, read directly by vision, not OCR): source_materials/
tcool_math_g1_g4_康軒_翰林/grade-3/翰林/answers/
P01_R01_桃子腳國小_新北市_3年級_數學_113下_期末2_翰林_答案卷.pdf (3 pages).

三-6(2)'s stated area (15 平方公分) was cross-checked as internally self-consistent
with 三-6(1)'s own grid decomposition (12 whole squares + 6 half squares =
12+6×0.5=15), which is recorded as the independent-calculation evidence even though
the underlying grid-square count in 三-6(1) itself is read from the answer key
(visual_manual_required), not recounted square-by-square from the image.

六 (draw a 12 cm² shape on the grid) is an open-ended drawing task with no fixed
textual answer; the answer key itself says "(略)". Recorded as needs_review, matching
this pilot's treatment of other pure-drawing items (e.g. G2 康軒 二-8-① 描邊).
"""

from __future__ import annotations

SOURCE_ID = "G3-翰林-113下-期末2-P01_R01_桃子腳國小_新北市_3年級_數學_113下_期末2_翰林"

PAGE_BBOX = {1: [0, 0, 4047, 5732], 2: [0, 0, 4047, 5732], 3: [0, 0, 4047, 5732]}

ITEMS = [
    dict(localId="q01", sourcePage=1, questionNumber="一-1",
         stem="對的畫○，錯的打X：早上9:30可以用9:30PM來表示。",
         options=[], correctAnswer="X",
         verify="9:30PM為晚上，早上應為9:30AM，敘述為假。與答案卷「(X)」一致。"),
    dict(localId="q02", sourcePage=1, questionNumber="一-2",
         stem="媽媽因為生病了，所以從下午1時睡到下午4時，是睡了180分鐘。",
         options=[], correctAnswer="○",
         verify="4-1=3小時=180分鐘，敘述為真。與答案卷「(○)」一致。"),
    dict(localId="q03", sourcePage=1, questionNumber="一-3",
         stem="邊長2公分的正方形，面積是2平方公分。",
         options=[], correctAnswer="X",
         verify="2×2=4平方公分，非2平方公分，敘述為假。與答案卷「(X)」一致。"),
    dict(localId="q04", sourcePage=1, questionNumber="二-1",
         stem="一條積木是由10個小積木組合而成的，16.3條積木是由10條積木和幾個小積木合起來的？",
         options=["①62個", "②63個", "③64個", "④65個"], correctAnswer="②63個",
         verify="16.3條=163個小積木；163-10條(100個)=63個。與答案卷「2」一致。"),
    dict(localId="q05", sourcePage=1, questionNumber="二-2",
         stem="下面哪一個選項是錯的？",
         options=["①20個0.1是2.0", "②0.3和0.7合起來是1", "③6個0.1是1/6", "④8個0.1合起來是0.8"],
         correctAnswer="③6個0.1是1/6",
         verify="6個0.1=0.6=3/5，非1/6，故③錯誤；①②④皆真。與答案卷「3」一致。"),
    dict(localId="q06", sourcePage=1, questionNumber="二-3",
         stem="根據下面位值表比大小的結果（個位5.十分位8 > 個位5.十分位■），■不可能是什麼數字？",
         options=["①3", "②5", "③7", "④9"], correctAnswer="④9",
         verify="5.8>5.■ 需■<8；■=9時5.9>5.8與題意矛盾，故9不可能；3/5/7皆使5.■<5.8成立。"
                "與答案卷「4」一致。"),
    dict(localId="q07", sourcePage=1, questionNumber="二-4",
         stem="小梁做了除法練習題「234÷3=78...1」，要怎麼檢查小梁是不是算對了？",
         options=["①先算78×3，再+1", "②先算78×3，再-1", "③先算78÷3，再+1", "④先算78÷3，再-1"],
         correctAnswer="①先算78×3，再+1",
         verify="除法驗算：商×除數+餘數=被除數，即78×3+1=235... 實際234÷3=78餘0才對，"
                "惟本題僅檢驗「驗算方法」是否正確而非重算原式，驗算法本身「商×除數+餘數」對應①。"
                "與答案卷「1」一致。"),
    dict(localId="q08", sourcePage=1, questionNumber="二-5",
         stem="爸爸從今天下午3時加班到隔天上午2時，幫爸爸算算一共加班幾小時？",
         options=["①10小時", "②11小時", "③12小時", "④13小時"], correctAnswer="②11小時",
         verify="15:00至24:00=9小時，24:00至02:00=2小時，共11小時。與答案卷「2」一致。"),
    dict(localId="q09", sourcePage=1, questionNumber="二-6",
         stem="下列哪個是面積的單位？",
         options=["①公分", "②公斤", "③公克", "④平方公分"], correctAnswer="④平方公分",
         verify="面積單位為平方公分，其餘為長度或重量單位。與答案卷「4」一致。"),
    dict(localId="q10", sourcePage=1, questionNumber="二-7",
         stem="下列哪個物品的面積最可能接近1平方公分？",
         options=["①數學課本", "②門牙", "③衛生紙", "④黑板"], correctAnswer="②門牙",
         verify="門牙表面積約為1平方公分量級，其餘選項面積遠大於1平方公分。與答案卷「2」一致。"),
    dict(localId="q11", sourcePage=1, questionNumber="二-8",
         stem="關於面積的敘述何者正確？",
         options=["①面積是指圖形的所有邊長總和", "②9平方公分可記作9²cm", "③8個1cm²的正方形可組成8平方公分",
                   "④邊長3公分的正方形，面積是6平方公分"],
         correctAnswer="③8個1cm²的正方形可組成8平方公分",
         verify="①應為周長之定義；②應記作9cm²；④3×3=9非6；③8×1cm²=8平方公分為真。"
                "與答案卷「3」一致。"),
    dict(localId="q12", sourcePage=1, questionNumber="二-9",
         stem="長方形的面積是32平方公分，寬是4公分，長是多少公分？",
         options=["①8公分", "②32公分", "③40公分", "④128公分"], correctAnswer="①8公分",
         verify="32÷4=8。與答案卷「1」一致。"),
    dict(localId="q13", sourcePage=1, questionNumber="三-1",
         stem="一天中，時鐘上的短針會經過刻度11的次數會有( )次。",
         options=[], correctAnswer="2",
         verify="短針(時針)12小時繞一圈經過每刻度一次，一天24小時共經過2次。與答案卷「(2)」一致。"),
    dict(localId="q14", sourcePage=1, questionNumber="三-2",
         stem="時鐘上的秒針轉1圈時，分針會走( )小格，相當於( )分鐘。",
         options=[], correctAnswer="1小格，1分鐘",
         verify="秒針轉1圈=60秒=1分鐘，分針每分鐘恰走1小格。與答案卷「(1)(1)」一致。"),
    dict(localId="q15", sourcePage=1, questionNumber="三-3",
         stem="請圈出比6.6大，而且比8.8小的數：4.1，6.3，7.2，8.0，8.6",
         options=[], correctAnswer="7.2、8.0、8.6",
         verify="6.6<x<8.8之數：7.2、8.0、8.6符合；4.1、6.3不符合。與答案卷圈選一致。"),
    dict(localId="q16", sourcePage=1, questionNumber="三-4-(1)",
         stem="看圖填填看：一條紙條分成10等分（如圖一），塗色的部分合起來是幾條紙條？寫出小數填填看。"
              "(1)（第一條紙條，部分塗色）",
         options=[], correctAnswer="0.2 條",
         verificationMethod="visual_manual_required",
         verify="依圖一10等分塗色格數換算為十分位小數，與答案卷「(0.2)條」一致。"),
    dict(localId="q17", sourcePage=1, questionNumber="三-4-(2)",
         stem="(2)（第二條紙條，部分塗色）",
         options=[], correctAnswer="0.5 條",
         verificationMethod="visual_manual_required",
         verify="與答案卷「(0.5)條」一致。"),
    dict(localId="q18", sourcePage=1, questionNumber="三-4-(3)",
         stem="(3)（兩條紙條，其中一條全塗色、一條部分塗色）",
         options=[], correctAnswer="1.2 條",
         verificationMethod="visual_manual_required",
         verify="與答案卷「(1.2)條」一致（1整條+0.2條）。"),
    dict(localId="q19", sourcePage=1, questionNumber="三-5",
         stem="小玉不小心打翻飲料，造成已經寫好的作業簿上，有數字不清楚（直式：7.6+1.5=☆.1），"
              "請幫忙算算看，☆的部分應該是( )。",
         options=[], correctAnswer="9",
         verify="7.6+1.5=9.1，☆=9。與答案卷「(9)」一致。"),
    dict(localId="q20", sourcePage=1, questionNumber="三-6-(1)",
         stem="根據下圖回答問題（風箏狀圖形疊於方格紙上）：(1)是由( )個1格和( )個半格合起來的圖形。",
         options=[], correctAnswer="12個1格，6個半格",
         verificationMethod="visual_manual_required",
         verify="依答案卷所載為12個整格、6個半格，與答案卷「(12)(6)」一致。"),
    dict(localId="q21", sourcePage=1, questionNumber="三-6-(2)",
         stem="(2)每個小方格都是1平方公分，塗色部分面積是( )平方公分。",
         options=[], correctAnswer="15",
         verify="依三-6-(1)之組成：12個整格+6個半格=12+6×0.5=12+3=15平方公分，"
                "與答案卷「(15)」一致，可由(1)之組成獨立算得。"),
    dict(localId="q22", sourcePage=2, questionNumber="三-7-(1)",
         stem="請依照電視節目播出時刻表回答問題（8:00財經新聞/10:00廚神出招/11:00卡通世界/"
              "12:00午間新聞/13:00懷舊電影/16:30生活智慧王）。"
              "(1)爸爸買菜回家，回到家正好是上午11時10分，他正好可以看到哪一個節目？",
         options=[], correctAnswer="卡通世界",
         verify="11:10落在11:00-12:00區間，播出節目為卡通世界。與答案卷「卡通世界」一致。"),
    dict(localId="q23", sourcePage=2, questionNumber="三-7-(2)",
         stem="(2)悠悠放學了，下午4時15分回到家，她是否來得及看「生活智慧王」的節目？(填是或否)",
         options=[], correctAnswer="是",
         verify="生活智慧王16:30播出，16:15早於16:30，來得及。與答案卷「是」一致。"),
    dict(localId="q24", sourcePage=2, questionNumber="三-8",
         stem="奶奶搭乘火車從臺南站到臺中站花2小時12分鐘，抵達臺中站的時間是上午10時45分，"
              "請問奶奶是上午( )時( )分從臺南站出發的。",
         options=[], correctAnswer="8時33分",
         verify="10:45-2:12=8:33。與答案卷「(8)(33)」一致。"),
    dict(localId="q25", sourcePage=2, questionNumber="三-9-a",
         stem="請在( )中填入正確答案：4×□=76，□=( )÷( )",
         options=[], correctAnswer="76÷4",
         verify="由乘除互逆關係，□=76÷4（本題只要求填出正確的逆運算算式，非計算最終值）。"
                "與答案卷「(76)(4)」一致。"),
    dict(localId="q26", sourcePage=2, questionNumber="三-9-b",
         stem="△÷8=11，△=( )×( )",
         options=[], correctAnswer="11×8",
         verify="由除法互逆關係，△=11×8。與答案卷「(11)(8)」一致。"),
    dict(localId="q27", sourcePage=2, questionNumber="三-9-c",
         stem="78÷◇=6，◇=( )÷( )",
         options=[], correctAnswer="78÷6",
         verify="由除法互逆關係，◇=78÷6。與答案卷「(78)(6)」一致。"),
    dict(localId="q28", sourcePage=2, questionNumber="三-10-(1)",
         stem="下方表格中，左邊算式和右邊哪個算式的答案接近，在□裡打✓。(1) 19×6 ：□ㄅ20×6 / □ㄆ10×6",
         options=["ㄅ 20×6", "ㄆ 10×6"], correctAnswer="ㄅ 20×6",
         verify="19接近20（非10），故19×6接近20×6。與答案卷勾選ㄅ一致。"),
    dict(localId="q29", sourcePage=2, questionNumber="三-10-(2)",
         stem="(2) 5×205：□ㄅ5×300 / □ㄆ5×200",
         options=["ㄅ 5×300", "ㄆ 5×200"], correctAnswer="ㄆ 5×200",
         verify="205接近200（非300）。與答案卷勾選ㄆ一致。"),
    dict(localId="q30", sourcePage=2, questionNumber="三-10-(3)",
         stem="(3) 4×198：□ㄅ4×100 / □ㄆ4×200",
         options=["ㄅ 4×100", "ㄆ 4×200"], correctAnswer="ㄆ 4×200",
         verify="198接近200（非100）。與答案卷勾選ㄆ一致。"),
    dict(localId="q31", sourcePage=2, questionNumber="三-11",
         stem="下面是麵包店上午10時前各種口味的牛角麵包賣出情形的紀錄表，請你幫他完成表格。"
              "原味牛角：售價( )元，賣出9個，總價252元。紅豆：售價35元，賣出7個，總價( )元。"
              "巧克力：售價( )元，賣出8個，總價320元。",
         options=[], correctAnswer="原味牛角售價28元；紅豆總價245元；巧克力售價40元",
         verify="252÷9=28；35×7=245；320÷8=40。與答案卷「(28)(245)(40)」一致。"),
    dict(localId="q32", sourcePage=2, questionNumber="四-1",
         stem="寫出直式算算看：❶35.3-24.9=( )",
         options=[], correctAnswer="10.4",
         verify="35.3-24.9=10.4。與答案卷「(10.4)」一致。"),
    dict(localId="q33", sourcePage=2, questionNumber="四-2",
         stem="❷54.7+15.3=( )",
         options=[], correctAnswer="70",
         verify="54.7+15.3=70.0。與答案卷「(70)」一致。"),
    dict(localId="q34", sourcePage=2, questionNumber="五-1",
         stem="請用直式算算看，再驗算。❶146÷7=( )...( )",
         options=[], correctAnswer="20...6",
         verify="7×20=140，146-140=6，商20餘6；驗算20×7+6=146。與答案卷「(20)(6)」一致。"),
    dict(localId="q35", sourcePage=2, questionNumber="五-2",
         stem="❷468÷9=( )...( )",
         options=[], correctAnswer="52...0",
         verify="9×52=468，餘0；驗算52×9=468。與答案卷「(52)(0)」一致。"),
    dict(localId="q36", sourcePage=2, questionNumber="六",
         stem="根據提示畫畫看。每個方格是1平方公分，以粗黑線為圖形的一邊，畫出面積是12平方公分的"
              "圖形(描出圖形邊界並上色)。",
         options=[], correctAnswer="略（開放式作圖題，任何面積為12平方公分且以給定粗黑線為一邊之圖形皆可）",
         answerStatus="needs_review", verificationMethod="visual_manual_required",
         verify="答案卷本身標示「(略)」，屬開放式作圖題，無單一固定文字答案，不計入 verified 可用題，"
                "留待人工檢視所繪圖形面積是否恰為12平方公分。"),
    dict(localId="q37", sourcePage=3, questionNumber="七-1-(1)",
         stem="（糖糖生日派對情境）太陽餅分享大作戰：爸爸買了12盒太陽餅，每盒10個。他打算自己留下"
              "3.8盒當作家裡的點心，其他的太陽餅就要送給來參加派對的親友們享用。請問，爸爸最後送給"
              "親友幾盒太陽餅呢？",
         options=[], correctAnswer="8.2 盒",
         verify="12-3.8=8.2。與答案卷「12-3.8=8.2 答:8.2盒」一致。"),
    dict(localId="q38", sourcePage=3, questionNumber="七-1-(2)",
         stem="禮物包裝小幫手：糖糖想送每一位好朋友一個小禮物，她拿了一條長80.2公分的漂亮緞帶來包裝"
              "禮物。包好幾個禮物後，緞帶剩下59公分。請問，糖糖總共用了多少公分的緞帶來包禮物呢？",
         options=[], correctAnswer="21.2 公分",
         verify="80.2-59=21.2。與答案卷「80.2-59=21.2 答:21.2公分」一致。"),
    dict(localId="q39", sourcePage=3, questionNumber="七-2",
         stem="一盒櫻桃不知道有幾顆，媽媽將櫻桃平分成7盤，每盤有38顆，還剩下6顆，這盒櫻桃有幾顆？",
         options=[], correctAnswer="272 顆",
         verify="38×7=266；266+6=272。與答案卷「38×7=266;266+6=272 答:272顆」一致。"),
    dict(localId="q40", sourcePage=3, questionNumber="七-3",
         stem="自然老師帶了一些綠豆，平分給6個小組做綠豆芽種植的觀察，每個小組分到了48顆綠豆，"
              "自然老師原本帶了多少顆綠豆？",
         options=[], correctAnswer="288 顆",
         verify="48×6=288。與答案卷「( )÷6=48;48×6=288 答:288顆」一致。"),
    dict(localId="q41", sourcePage=3, questionNumber="七-4",
         stem="老師同時發給樂樂和恩恩一篇相同的文章，兩人同時間讀，樂樂讀完整篇文章花了6分鐘22秒，"
              "恩恩則是花了378秒，請問誰花的時間比較長？",
         options=[], correctAnswer="樂樂",
         verify="6分22秒=6×60+22=382秒；382>378，樂樂花的時間較長。與答案卷「382>378 答:樂樂」一致。"),
    dict(localId="q42", sourcePage=3, questionNumber="七-5",
         stem="週六樂樂到秀泰影城看了兩部電影，第一部電影播放的時間是1小時24分鐘，第二部電影播放的"
              "時間是1小時28分鐘，請問樂樂看兩部電影共花幾小時幾分鐘？(寫出直式做做看)",
         options=[], correctAnswer="2小時52分鐘",
         verify="時：1+1=2；分：24+28=52（未滿60不需進位）。與答案卷「2/52 答:2小時52分鐘」一致。"),
]

for _it in ITEMS:
    _it.setdefault("boundaryStatus", "verified")
    _it.setdefault("answerStatus", "verified")
    _it.setdefault("verificationMethod", "independent_calculation")
    _it.setdefault("crop", None)
    _it.setdefault("answerKeyPage", _it["sourcePage"])

assert len(ITEMS) == 42
assert len({it["localId"] for it in ITEMS}) == 42
