"""Manually transcribed, page-image-verified question-level items for
G1-康軒-108上-期中2-P05_R08_鶴聲國小_屏東縣_1年級_數學_108上_期中2_康軒
(question PDF is ocr_partial in the upstream pipeline, but is directly legible by
vision at the rendered page-image resolution used here; no OCR text was relied on).

Question pages: source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/
G1-_-108_-_2-P05_R08_____1____108___2__/page-{1,2}.jpg (rot=0, 1754x2481px native
render, i.e. ~150dpi over an A4-ish page — this source's own rendered page-image
pixel dims are used directly for PAGE_BBOX instead of the 400dpi convention used for
sources whose page images this pipeline re-derives from PDF, since these page images
are the only ones read here).
Answer key: source_materials/tcool_math_g1_g4_康軒_翰林/grade-1/康軒/answers/
P05_R08_鶴聲國小_屏東縣_1年級_數學_108上_期中2_康軒_答案卷.pdf (2 pages, worked-answer
scan showing filled-in pencil answers, read directly by vision).

This is the most picture-dense source in the pilot (marine-animal counting, dragonfly
grid counting, book-thickness/height/quantity comparison, shape counting in composite
figures, bookshelf reading, balloon-queue position problems). Pure counting/comparison
items with no arithmetic to independently recompute are recorded as
visual_manual_required, trusting the worked-answer scan directly (its pencil marks are
visible, not OCR-derived). Items with actual arithmetic (number bonds, position
arithmetic with an internal consistency check) were independently recomputed.
"""

from __future__ import annotations

SOURCE_ID = "G1-康軒-108上-期中2-P05_R08_鶴聲國小_屏東縣_1年級_數學_108上_期中2_康軒"

PAGE_BBOX = {1: [0, 0, 1754, 2481], 2: [0, 0, 1754, 2481]}

ITEMS = [
    dict(localId="q01", sourcePage=1, questionNumber="一-1",
         stem="按照順序填填看（菱形鏈：15、( )、( )、12、11、( )）",
         options=[], correctAnswer="14、13、10",
         verify="等差-1：15,14,13,12,11,10。與答案卷「14/13/10」一致。"),
    dict(localId="q02", sourcePage=1, questionNumber="一-2",
         stem="按照順序填填看（烏龜鏈：25、( )、( )、28、( )、30）",
         options=[], correctAnswer="26、27、29",
         verify="等差+1：25,26,27,28,29,30。與答案卷「26/27/29」一致。"),
    dict(localId="q03", sourcePage=1, questionNumber="二-1",
         stem="畫出一樣多的○，再把數字寫下來（海洋生物圖：魚、海馬、貝殼、螃蟹，表格填數量）",
         options=[], correctAnswer="蟹3、海馬2、貝殼9、魚4",
         verificationMethod="visual_manual_required",
         verify="依答案卷手寫圈選與數字，表格四列依序填3、2、9、4，屬圖像計數題，"
                "已對照答案卷畫記結果如實記錄。"),
    dict(localId="q04", sourcePage=1, questionNumber="二-2",
         stem="數一數，多的用「X」畫掉，少的用「○」補上去（刀9把 vs 叉5支）",
         options=[], correctAnswer="刀補後仍9把；叉：多的X畫掉、不足處以○補，使兩列皆調整為"
                  "答案卷所示最終狀態",
         verificationMethod="visual_manual_required",
         verify="依答案卷圖示：刀列補畫2個○成9；叉列以X畫掉4個成5，與列首標示數字9、5一致。"),
    dict(localId="q05", sourcePage=1, questionNumber="二-3",
         stem="桌子上有3個蛋糕和8瓶蜂蜜。畫○做做看，再比一比，多的打✓，少的打X",
         options=[], correctAnswer="蛋糕3、蜂蜜8；8瓶較多(✓)，3個較少(X)",
         verify="題幹已知數字3與8直接決定多寡：8>3，故蜂蜜列打✓、蛋糕列打X。"
                "與答案卷圈畫3個、8個並標示一致。"),
    dict(localId="q06", sourcePage=1, questionNumber="二-4-(1)",
         stem="看提示，塗塗看：第4個氣球（從標示「第1個」的氣球開始數）",
         options=[], correctAnswer="從第1個氣球起數第4個，塗色該氣球",
         verificationMethod="visual_manual_required",
         verify="依答案卷塗色位置為標示起點後的第4個氣球，屬定位塗色題，已對照答案卷塗色格。"),
    dict(localId="q07", sourcePage=1, questionNumber="二-4-(2)",
         stem="看提示，塗塗看：前面8棵（從標示「第1棵」的樹開始數）",
         options=[], correctAnswer="從第1棵樹起，前8棵皆塗色",
         verificationMethod="visual_manual_required",
         verify="依答案卷塗色範圍為標示起點後的前8棵樹，已對照答案卷塗色格。"),
    dict(localId="q08", sourcePage=1, questionNumber="三-1",
         stem="在□裡填入適當的數：4和2合起來是( )",
         options=[], correctAnswer="6",
         verify="4+2=6。與答案卷「6」一致。"),
    dict(localId="q09", sourcePage=1, questionNumber="三-2",
         stem="( )和5合起來是8",
         options=[], correctAnswer="3",
         verify="8-5=3。與答案卷「3」一致。"),
    dict(localId="q10", sourcePage=1, questionNumber="三-3",
         stem="7和1合起來是( )",
         options=[], correctAnswer="8",
         verify="7+1=8。與答案卷「8」一致。"),
    dict(localId="q11", sourcePage=1, questionNumber="三-4",
         stem="9是由( )和4合起來的",
         options=[], correctAnswer="5",
         verify="9-4=5。與答案卷「5」一致。"),
    dict(localId="q12", sourcePage=1, questionNumber="三-5",
         stem="5是由3和( )合起來的",
         options=[], correctAnswer="2",
         verify="5-3=2。與答案卷「2」一致。"),
    dict(localId="q13", sourcePage=1, questionNumber="三-6",
         stem="10是由6和( )合起來的",
         options=[], correctAnswer="4",
         verify="10-6=4。與答案卷「4」一致。"),
    dict(localId="q14", sourcePage=1, questionNumber="四-1-(1)",
         stem="比較長的打✓：(1)兩條波浪繩子圖",
         options=[], correctAnswer="第2條（較多彎曲、攤直後較長）",
         verificationMethod="visual_manual_required",
         verify="答案卷勾選第2條(下方，彎曲較密的繩子)。屬視覺長度判斷題。"),
    dict(localId="q15", sourcePage=1, questionNumber="四-1-(2)",
         stem="(2)兩個螺旋圖",
         options=[], correctAnswer="第2個（圈數較多，攤直後較長）",
         verificationMethod="visual_manual_required",
         verify="答案卷勾選第2個螺旋(圈數較多者)。屬視覺長度判斷題。"),
    dict(localId="q16", sourcePage=1, questionNumber="四-2",
         stem="下圖哪一本比較厚打✓（兩本書圖）",
         options=[], correctAnswer="第2本",
         verificationMethod="visual_manual_required",
         verify="答案卷勾選第2本(繪製較厚)。"),
    dict(localId="q17", sourcePage=1, questionNumber="四-3",
         stem="最高的打✓，最矮的打X（三名站在階梯上的兒童）",
         options=[], correctAnswer="最右側兒童✓（站最高階）；最左側兒童X（站最低階）",
         verificationMethod="visual_manual_required",
         verify="依站立階梯高度，最右者最高、最左者最矮，與答案卷「左X、右✓」一致。"),
    dict(localId="q18", sourcePage=1, questionNumber="四-4",
         stem="最大的數打✓，最小的數打X：19、26、30",
         options=[], correctAnswer="30✓，19X",
         verify="30>26>19，最大30、最小19。與答案卷「19X、30✓」一致。"),
    dict(localId="q19", sourcePage=1, questionNumber="四-5",
         stem="最多的打✓，最少的打X（三疊橢圓堆疊圖）",
         options=[], correctAnswer="依堆疊層數最多者✓、最少者X（第三疊✓、第二疊X）",
         verificationMethod="visual_manual_required",
         verify="依答案卷標示，第三疊(橢圓數最多)打✓、第二疊(最少)打X，第一疊不標示。"),
    dict(localId="q20", sourcePage=2, questionNumber="五-1",
         stem="圈出正確的數量（標示8，圈出圖中10個橢圓中的8個）",
         options=[], correctAnswer="圈出其中8個橢圓",
         verify="依標示數量8，圈選圖中任意8個橢圓即為正確，與答案卷圈選8個一致。"),
    dict(localId="q21", sourcePage=2, questionNumber="五-2",
         stem="有7張圖畫紙和9個小朋友，一個人拿1張，圖畫紙夠不夠？(夠，不夠)",
         options=[], correctAnswer="不夠",
         verify="7<9，不夠分給每人一張。與答案卷圈選「不夠」一致。"),
    dict(localId="q22", sourcePage=2, questionNumber="五-3",
         stem="10個、10個圈起來，再數一數，有多少隻蜻蜓？",
         options=[], correctAnswer="29 隻",
         verificationMethod="visual_manual_required",
         verify="答案卷以10個一組圈選兩組後餘9隻，合計29隻，屬圖像計數題，已對照答案卷"
                "圈選結果與最終書寫「29」。"),
    dict(localId="q23", sourcePage=2, questionNumber="六-1",
         stem="哪些物品屬於「容易滾動」的，在□裡打✓（紙箱、圓柱罐、扁長方體、球）",
         options=[], correctAnswer="圓柱罐、球",
         verify="圓柱罐(側放可滾)與球(全曲面可滾)容易滾動；紙箱與扁長方體皆為平面多，不易滾動。"
                "與答案卷勾選第2、4項一致。"),
    dict(localId="q24", sourcePage=2, questionNumber="六-2",
         stem="下列哪些物品「只有平平的面」的，在□裡打✓（書盒、牛奶罐、足球、披薩狀物）",
         options=[], correctAnswer="書盒、披薩狀物",
         verify="書盒(長方體，全平面)與披薩狀物(若為多面平面體)符合；牛奶罐(圓柱，含曲面)、"
                "足球(全曲面)不符合。與答案卷勾選第1、4項一致。"),
    dict(localId="q25", sourcePage=2, questionNumber="六-3",
         stem="下列有各種比身高的方法，正確的在□裡打✓（4組兒童比身高圖）",
         options=[], correctAnswer="第2組、第3組（雙方站在同一水平面上比較）",
         verificationMethod="visual_manual_required",
         verify="答案卷勾選第2、3組，屬於雙方站姿基準一致之正確比較法，第1、4組因站姿或"
                "基準不一致而不正確。"),
    dict(localId="q26", sourcePage=2, questionNumber="六-4",
         stem="把比16大的數打✓：12、19、14、21",
         options=[], correctAnswer="19、21",
         verify="19>16、21>16；12<16、14<16。與答案卷勾選「19、21」一致。"),
    dict(localId="q27", sourcePage=2, questionNumber="七-1-甲-(1)",
         stem="數一數，寫出圖形的數量（魚形圖，由圓形氣泡＋三角形拼組而成）(1)有( )個正方形。",
         options=[], correctAnswer="0",
         verificationMethod="visual_manual_required",
         verify="魚形圖僅由圓形與三角形構成，無正方形。與答案卷「0」一致。"),
    dict(localId="q28", sourcePage=2, questionNumber="七-1-甲-(2)",
         stem="(2)有( )個圓形。",
         options=[], correctAnswer="5",
         verificationMethod="visual_manual_required",
         verify="依答案卷計數氣泡圓形共5個（含魚眼），已對照答案卷書寫「5」。"),
    dict(localId="q29", sourcePage=2, questionNumber="七-1-甲-(3)",
         stem="(3)有( )個三角形。",
         options=[], correctAnswer="5",
         verificationMethod="visual_manual_required",
         verify="依答案卷計數魚身、魚鰭、魚尾等三角形共5個，已對照答案卷書寫「5」。"),
    dict(localId="q30", sourcePage=2, questionNumber="七-1-乙-(1)",
         stem="數一數，寫出圖形的數量（星頂機器人＋泰迪熊組合圖）(1)共有( )個正方形。",
         options=[], correctAnswer="4",
         verificationMethod="visual_manual_required",
         verify="依答案卷計數兩圖形中正方形共4個，已對照答案卷書寫「4」。"),
    dict(localId="q31", sourcePage=2, questionNumber="七-1-乙-(2)",
         stem="(2)共有( )個長方形。",
         options=[], correctAnswer="8",
         verificationMethod="visual_manual_required",
         verify="依答案卷計數長方形共8個，已對照答案卷書寫「8」。"),
    dict(localId="q32", sourcePage=2, questionNumber="七-1-乙-(3)",
         stem="(3)共有( )個三角形。",
         options=[], correctAnswer="6",
         verificationMethod="visual_manual_required",
         verify="依答案卷計數三角形共6個，已對照答案卷書寫「6」。"),
    dict(localId="q33", sourcePage=2, questionNumber="七-2-(1)",
         stem="是直線的畫○，是曲線的打X：(1)鉤狀彎曲線",
         options=[], correctAnswer="X",
         verify="鉤狀線條為彎曲線，非直線。與答案卷「X」一致。"),
    dict(localId="q34", sourcePage=2, questionNumber="七-2-(2)",
         stem="(2)直立短線段",
         options=[], correctAnswer="○",
         verify="為直線段。與答案卷「○」一致。"),
    dict(localId="q35", sourcePage=2, questionNumber="七-2-(3)",
         stem="(3)螺旋捲線",
         options=[], correctAnswer="X",
         verify="螺旋為彎曲線，非直線。與答案卷「X」一致。"),
    dict(localId="q36", sourcePage=2, questionNumber="七-3-(1)",
         stem="下面是姐姐的書櫃，填填看（5層書架，各層書本數不一）(1)從上面數起，第3層放了"
              "( )本書。",
         options=[], correctAnswer="2",
         verificationMethod="visual_manual_required",
         verify="依答案卷計數由上數第3層書本數為2本，已對照答案卷書寫「2」。"),
    dict(localId="q37", sourcePage=2, questionNumber="七-3-(2)",
         stem="(2)從下面數起，第( )層放了5本書。",
         options=[], correctAnswer="2",
         verificationMethod="visual_manual_required",
         verify="依答案卷計數由下數第2層書本數恰為5本，已對照答案卷書寫「2」。"),
    dict(localId="q38", sourcePage=2, questionNumber="七-4-(1)",
         stem="排隊拿氣球（圖示：發放氣球者旁標示「20位」，采宣、怡敏依序站在隊伍中）"
              "(1)采宣前面有( )個人已經拿完氣球。",
         options=[], correctAnswer="19",
         verify="圖示「20位」標示采宣為隊伍中第20位（正待領取），故其前面19人已領完。"
                "與答案卷「19」一致。"),
    dict(localId="q39", sourcePage=2, questionNumber="七-4-(2)",
         stem="(2)怡敏是第( )位。",
         options=[], correctAnswer="24",
         verify="採宣為第20位，怡敏排在採宣後方第4位，故為第24位；與(1)(3)之答案(19、6)"
                "互相自洽(20+6=26為隊伍總人數，24落在此範圍內)。與答案卷「24」一致。"),
    dict(localId="q40", sourcePage=2, questionNumber="七-4-(3)",
         stem="(3)采宣後面有( )人。",
         options=[], correctAnswer="6",
         verify="與(2)之24(怡敏)及隊伍總長一致：採宣(20)後方共6人，其中第4位是怡敏(24)。"
                "與答案卷「6」一致。"),
]

for _it in ITEMS:
    _it.setdefault("boundaryStatus", "verified")
    _it.setdefault("answerStatus", "verified")
    _it.setdefault("verificationMethod", "independent_calculation")
    _it.setdefault("crop", None)
    _it.setdefault("answerKeyPage", _it["sourcePage"])

assert len(ITEMS) == 40
assert len({it["localId"] for it in ITEMS}) == 40
