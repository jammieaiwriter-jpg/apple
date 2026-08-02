"""Manually transcribed, page-image-verified question-level items for
G2-翰林-113上-期末2-P01_R08_安和國小_新北市_2年級_數學_113上_期末2_翰林.

Question pages: source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/
G2-_-113_-_2-P01_R08_____2____113___2__/page-{1,2,3,4}.jpg (page 5 is blank;
rot=0, 728.52x1031.76pt). Answer key: source_materials/tcool_math_g1_g4_康軒_翰林/
grade-2/翰林/answers/P01_R08_安和國小_新北市_2年級_數學_113上_期末2_翰林_答案卷.pdf
(5 pages, page 5 blank, worked-answer scan read directly by vision).

This paper is clock/time-reading heavy (七/四 sections) and includes one irregular
grid-area counting item (2-(2) on page 3). Clock reads and the grid-area counts are
recorded as visual_manual_required, cross-checked against the answer key's own marks
and, where practical, against a directly re-examined high-DPI crop of the clock/grid
(e.g. 一-3's clock hour hand was re-cropped and confirmed to sit between 7 and 8, not
near 12 as a low-res thumbnail first suggested, confirming the key's 7:55 reading).
"""

from __future__ import annotations

SOURCE_ID = "G2-翰林-113上-期末2-P01_R08_安和國小_新北市_2年級_數學_113上_期末2_翰林"

PAGE_BBOX = {1: [0, 0, 4047, 5732], 2: [0, 0, 4047, 5732], 3: [0, 0, 4047, 5732], 4: [0, 0, 4047, 5732]}

ITEMS = [
    dict(localId="q01", sourcePage=1, questionNumber="一-1",
         stem="氣球攤原本有52顆氣球，飛走了18顆，老闆又賣掉16顆，請問老闆現在剩下幾顆氣球？",
         options=["①34", "②50", "③18", "④28"], correctAnswer="③18",
         verify="52-18-16=18。與答案卷「3」一致。"),
    dict(localId="q02", sourcePage=1, questionNumber="一-2",
         stem="如上圖，每1個蛋糕上有兩根蠟燭，7個蛋糕共有幾根蠟燭？下列哪一個答案與其他三個不同？",
         options=["①2+2+2+2+2+2+2", "②2×7", "③2+7", "④7個2"], correctAnswer="③2+7",
         verify="①②④皆=14（①經裁圖確認為7項2相加），③2+7=9，與其他三者不同。與答案卷「3」一致。"),
    dict(localId="q03", sourcePage=1, questionNumber="一-3",
         stem="觀察鐘面，以下敘述何者正確？（鐘面圖：經400dpi裁圖確認時針落在7與8之間、分針指向11）",
         options=["①鐘面是11時40分", "②鐘面是7時55分", "③可以說是11點多", "④可以說是8點多"],
         correctAnswer="②鐘面是7時55分",
         verificationMethod="visual_manual_required",
         verify="裁圖確認時針在7-8之間偏近8（非近12），分針指11（55分），讀作7時55分，"
                "故②正確、④「8點多」不精確亦非最佳描述、①③錯誤。與答案卷「2」一致。"),
    dict(localId="q04", sourcePage=1, questionNumber="一-4",
         stem="依照乘法算式3×9=27，下列敘述何者正確？",
         options=["①3個9是27", "②3是乘數", "③9是被乘數", "④積是27"], correctAnswer="④積是27",
         verify="27為3×9之積，④恆真；②③混淆被乘數(3)／乘數(9)角色為誤；①依本卷「被乘數×乘數＝"
                "(乘數)個(被乘數)」之慣例亦非正確表述，僅④在任何慣例下皆成立。與答案卷「4」一致。"),
    dict(localId="q05", sourcePage=1, questionNumber="二-1",
         stem="一包緞帶有72條，共有三個顏色（藍色17條、黃色36條、紅色?條），小智跟皮卡丘用不同方法"
              "算出紅色有幾條，請把數字填入空格。小智：先算17+36=( )，再算72-( )=( )。"
              "皮卡丘：先算72-17=( )，再算( )-36=( )。",
         options=[], correctAnswer="小智：17+36=53，72-53=19；皮卡丘：72-17=55，55-36=19",
         verify="17+36=53，72-53=19；72-17=55，55-36=19；兩法皆得紅色=19，且17+36+19=72"
                "與總數一致，互相驗證成立。與答案卷「53/19/55/19」一致。"),
    dict(localId="q06", sourcePage=1, questionNumber="二-2",
         stem="8×9比8×6多( )個8，是多( )。",
         options=[], correctAnswer="3個8，是多24",
         verify="8×9-8×6=8×(9-6)=8×3=24。與答案卷「3/24」一致。"),
    dict(localId="q07", sourcePage=1, questionNumber="二-3",
         stem="7×3比7×7少( )個7，是少( )。",
         options=[], correctAnswer="4個7，是少28",
         verify="7×7-7×3=7×(7-3)=7×4=28。與答案卷「4/28」一致。"),
    dict(localId="q08", sourcePage=1, questionNumber="二-4",
         stem="（葡萄圖，4串，每串9顆）1串葡萄有9顆，4串葡萄用加法算式記成9+9+9+9=( )，"
              "也可以說是9的( )倍，用乘法算式記成( )。",
         options=[], correctAnswer="36；4倍；9×4=36",
         verify="9+9+9+9=36=9×4。與答案卷「36/4/9×4=36」一致。"),
    dict(localId="q09", sourcePage=2, questionNumber="二-5-(1)",
         stem="一隻瓢蟲有6隻腳，5隻瓢蟲共有多少隻腳？(1)用連加算式記成( )",
         options=[], correctAnswer="6+6+6+6+6=30",
         verify="6×5=30，連加式5個6相加=30。與答案卷「6+6+6+6+6=30」一致。"),
    dict(localId="q10", sourcePage=2, questionNumber="二-5-(2)",
         stem="(2)用乘法算式記成( )",
         options=[], correctAnswer="6×5=30",
         verify="6×5=30。與答案卷「6×5=30」一致。"),
    dict(localId="q11", sourcePage=2, questionNumber="二-6",
         stem="乘法算式4×5=20，算式中的被乘數是( )，乘數是( )，積是( )。",
         options=[], correctAnswer="被乘數4，乘數5，積20",
         verify="依4×5=20之算式結構直接對應。與答案卷「4/5/20」一致。"),
    dict(localId="q12", sourcePage=2, questionNumber="二-7",
         stem="（兩鐘面圖，左鐘面時針指3、分針指12＝3時0分）請觀察鐘面，從3時開始，分針從鐘面數字12"
              "開始走4大格，也可以說是走了( )小格，此時鐘面是( )時( )分。",
         options=[], correctAnswer="20小格；3時20分",
         verify="1大格=5小格，4大格=20小格=20分鐘；3:00+20分=3:20。與答案卷「20/3/20」一致"
                "（右鐘面圖亦顯示分針約於20分位置、時針略過3，互為佐證）。"),
    dict(localId="q13", sourcePage=2, questionNumber="二-8",
         stem="將甲、乙、丙三個面的大小，由大到小在( )裡寫上1、2、3。（圖：甲=小正方形、"
              "乙=大正方形、丙=菱形，中等大小）",
         options=[], correctAnswer="甲3、乙1、丙2",
         verificationMethod="visual_manual_required",
         verify="原圖乙為三者中最大之正方形、甲為最小之正方形、丙菱形居中，故乙1、丙2、甲3。"
                "與答案卷「3/1/2」一致。"),
    dict(localId="q14", sourcePage=2, questionNumber="三",
         stem="連連看：將算式與其計算結果連起來。5+5+5、28、24（上排）；6×4、4個7、15（下排）",
         options=[], correctAnswer="5+5+5(15)—15；6×4(24)—24；4個7(28)—28",
         verify="5+5+5=15、6×4=24、4個7=28，三組唯一對應。與答案卷連線結果一致。"),
    dict(localId="q15", sourcePage=2, questionNumber="四-1-(1)",
         stem="鐘面上是幾時幾分？（鐘面(1)：時針在11與12之間偏近11、分針指5）",
         options=[], correctAnswer="11時25分",
         verificationMethod="visual_manual_required",
         verify="時針略過11指向約11-12間偏11處、分針指5(25分)，讀作11:25。與答案卷「11/25」一致。"),
    dict(localId="q16", sourcePage=2, questionNumber="四-1-(2)",
         stem="鐘面上是幾時幾分？（鐘面(2)：時針指6、分針指6）",
         options=[], correctAnswer="6時30分",
         verificationMethod="visual_manual_required",
         verify="時針指6、分針指6(30分)，讀作6:30。與答案卷「6/30」一致。"),
    dict(localId="q17", sourcePage=2, questionNumber="四-2-(1)",
         stem="把正確時刻的鐘面在( )裡打✓：妹妹早上7點多才起床（三鐘面選一）",
         options=["鐘面①", "鐘面②", "鐘面③"], correctAnswer="鐘面①",
         verificationMethod="visual_manual_required",
         verify="三鐘面中僅第①面時針落在7-8之間符合「7點多」。與答案卷勾選①一致。"),
    dict(localId="q18", sourcePage=2, questionNumber="四-2-(2)",
         stem="把正確時刻的鐘面在( )裡打✓：爺爺下午5點多去散步（三鐘面選一）",
         options=["鐘面①", "鐘面②", "鐘面③"], correctAnswer="鐘面②",
         verificationMethod="visual_manual_required",
         verify="三鐘面中僅第②面時針落在5-6之間符合「5點多」。與答案卷勾選②一致。"),
    dict(localId="q19", sourcePage=3, questionNumber="五-1-(1)",
         stem="哥哥跟同學要報名參加籃球比賽。每支隊伍需要5人，總共有9隊報名參加，這次比賽共有幾個"
              "人參加？",
         options=[], correctAnswer="45 人",
         verify="5×9=45。與答案卷「5×9=45 答:(45)人」一致。"),
    dict(localId="q20", sourcePage=3, questionNumber="五-1-(2)",
         stem="哥哥原本有75元，爸爸又給他15元，哥哥買早餐花了68元，請問哥哥剩下多少元？",
         options=[], correctAnswer="22 元",
         verify="75+15-68=22。與答案卷「75+15=90;90-68=22 答:(22)元」一致。"),
    dict(localId="q21", sourcePage=3, questionNumber="五-1-(3)",
         stem="哥哥上午7時出門，回到家是上午11時，請問經過了幾小時？（不用寫計算過程；鐘面圖佐證"
              "7:00與11:00）",
         options=[], correctAnswer="4 小時",
         verify="11-7=4。與答案卷「經過(4)小時」一致，並與兩鐘面圖示之7:00、11:00相符。"),
    dict(localId="q22", sourcePage=3, questionNumber="2-(1)",
         stem="安和國小二年級校外教學到台北市立動物園參觀。上午8時出發，上午8時45分鐘抵達動物園，"
              "請問分針走了( )大格，是( )分鐘(不用寫計算過程)（兩鐘面圖：出發8:00、抵達8:45）",
         options=[], correctAnswer="9大格，45分鐘",
         verify="45分鐘÷5分/大格=9大格。與答案卷「9/45」一致，並與兩鐘面圖示之8:00、8:45相符。"),
    dict(localId="q23", sourcePage=3, questionNumber="2-(2)",
         stem="在地圖上，動物園分成甲、乙、丙共3區，如下圖（不規則方格圖，甲、乙、丙為粗框標示區域，"
              "每格為1個□）。甲區和( )個□一樣大，乙區和( )個□一樣大，丙區和( )個□一樣大，"
              "( )區的面積比較大。",
         options=[], correctAnswer="甲12、乙13、丙15；丙區較大",
         verificationMethod="visual_manual_required",
         verify="依答案卷所載方格計數甲=12、乙=13、丙=15，三者中丙最大，與答案卷結論"
                "「丙區的面積比較大」一致；不規則方格逐格計數已對照原圖粗框範圍核對整體合理性"
                "（丙區於圖中占據面積確實目視最大）。"),
    dict(localId="q24", sourcePage=3, questionNumber="3",
         stem="哥哥吃了18顆水餃，弟弟比哥哥少吃5顆水餃，請問兄弟兩人一共吃了幾顆水餃？",
         options=[], correctAnswer="31 顆",
         verify="18-5=13(弟弟)；18+13=31。與答案卷「18-5=13;18+13=31 答:(31)顆」一致。"),
    dict(localId="q25", sourcePage=4, questionNumber="4",
         stem="小新要存錢買水彩，第1週存25元，第2週比第1週多存32元，第3週比第2週多存19元，請問"
              "第三週存了多少元？",
         options=[], correctAnswer="76 元",
         verify="第2週=25+32=57；第3週=57+19=76。與答案卷「25+32=57;57+19=76 答:(76)元」一致。"),
    dict(localId="q26", sourcePage=4, questionNumber="5",
         stem="小傑帶了95元，午餐時間走到餐廳，看了菜單後，買了一個漢堡(48元)和一瓶柳橙汁(15元)，"
              "請問小傑還剩多少元？",
         options=[], correctAnswer="32 元",
         verify="95-48-15=32。與答案卷「95-48=47;47-15=32 答:(32)元」一致。"),
]

for _it in ITEMS:
    _it.setdefault("boundaryStatus", "verified")
    _it.setdefault("answerStatus", "verified")
    _it.setdefault("verificationMethod", "independent_calculation")
    _it.setdefault("crop", None)
    _it.setdefault("answerKeyPage", _it["sourcePage"])

assert len(ITEMS) == 26
assert len({it["localId"] for it in ITEMS}) == 26
