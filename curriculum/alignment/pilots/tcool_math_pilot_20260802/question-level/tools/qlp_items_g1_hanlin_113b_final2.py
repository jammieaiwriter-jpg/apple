"""Manually transcribed, page-image-verified question-level items for
G1-翰林-113下-期末2-P01_R01_安和國小_新北市_1年級_數學_113下_期末2_翰林.

Question pages: source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/
G1-_-113_-_2-P01_R01_____1____113___2__/page-{1,2,3}.jpg (rot=0, 728.52x1031.76pt).
Answer key: source_materials/tcool_math_g1_g4_康軒_翰林/grade-1/翰林/answers/
P01_R01_安和國小_新北市_1年級_數學_113下_期末2_翰林_答案卷.pdf (3 pages, same layout,
worked-answer scan read directly by vision).

All coin/vote/tally picture counts (投票表格、小明錢包硬幣、小棠餐點金額) were recounted
directly from the rendered page images (high-DPI crops for the vote tally and coin
purse) and cross-checked against the answer key; two of this paper's picture counts
(vote tally row ㄇ=12, not 11; coin purse total=99元) required a second, higher-
resolution crop to resolve an initial miscount, recorded in each item's verify note.
"""

from __future__ import annotations

SOURCE_ID = "G1-翰林-113下-期末2-P01_R01_安和國小_新北市_1年級_數學_113下_期末2_翰林"

PAGE_BBOX = {1: [0, 0, 4047, 5732], 2: [0, 0, 4047, 5732], 3: [0, 0, 4047, 5732]}

ITEMS = [
    dict(localId="q01", sourcePage=1, questionNumber="一-1-(1)",
         stem="小偉的生日快到了，媽媽想送給他一個40元的玩偶，當作生日禮物。如果全部用⑩元付，"
              "要付( )個⑩元。",
         options=[], correctAnswer="4",
         verify="40÷10=4。與答案卷「(4)」一致。"),
    dict(localId="q02", sourcePage=1, questionNumber="一-1-(2)",
         stem="如果全部用⑤元付，要付( )個⑤元。",
         options=[], correctAnswer="8",
         verify="40÷5=8。與答案卷「(8)」一致。"),
    dict(localId="q03", sourcePage=1, questionNumber="一-1-(3)",
         stem="媽媽買完玩偶後，錢包裡只剩13元，如果想再買一個一模一樣的玩偶給妹妹，需再補多少元？"
              "【用⑩①畫畫看】（錢包圖示：⑩①①①＝13元，為題幹「剩13元」之圖示佐證）",
         options=[], correctAnswer="27 元",
         verify="需再湊滿一個40元玩偶：40-13=27。答案卷此格未見另行印出獨立方框數字"
                "（錢包圖僅佐證「剩13元」之敘述），依題幹已知條件獨立算得27元，邏輯與算式皆無歧義。"),
    dict(localId="q04", sourcePage=1, questionNumber="一-2-(1)",
         stem="下面是爸爸、媽媽、弟弟、妹妹四個人的生日日期（爸爸8月2日、媽媽4月17日、弟弟2月21日、"
              "妹妹7月30日），按照一年中的先後順序在□裡填入1、2、3、4。",
         options=[], correctAnswer="爸爸4、媽媽2、弟弟1、妹妹3",
         verify="依月日排序：2/21(弟弟)<4/17(媽媽)<7/30(妹妹)<8/2(爸爸)，故弟弟1、媽媽2、妹妹3、爸爸4。"
                "與答案卷「4/2/1/3」一致。"),
    dict(localId="q05", sourcePage=1, questionNumber="一-2-(2)",
         stem="今天是6月20日，接下來是( )的生日",
         options=[], correctAnswer="妹妹",
         verify="四人生日中，6/20之後最近者為7/30(妹妹)。與答案卷「妹妹」一致。"),
    dict(localId="q06", sourcePage=1, questionNumber="一-3-(1)",
         stem="（5月月曆：31日為端午節，31日對齊「六」欄）今天是端午節，是5月( )日星期( )；"
              "昨天是5月( )日星期( )；明天是( )月( )日星期( )",
         options=[], correctAnswer="31日星期六；30日星期五；6月1日星期日",
         verify="月曆確認端午節=5/31=星期六；前一日5/30=星期五；次日為6月1日=星期日"
                "（5月僅31天）。與答案卷「31/六/30/五/6/1/日」一致。"),
    dict(localId="q07", sourcePage=1, questionNumber="一-3-(2)",
         stem="小明星期一和星期四都要上英文課，請問小明5月共上了( )天英文課。",
         options=[], correctAnswer="9",
         verify="月曆一(週一)欄：5,12,19,26共4天；四(週四)欄：1,8,15,22,29共5天；合計9天。"
                "與答案卷「(9)」一致。"),
    dict(localId="q08", sourcePage=1, questionNumber="一-3-(3)",
         stem="母親節是五月的第二個星期日，是5月( )日。",
         options=[], correctAnswer="11",
         verify="月曆日(週日)欄：4,11,18,25，第二個為11。與答案卷「(11)」一致。"),
    dict(localId="q09", sourcePage=1, questionNumber="一-3-(4)",
         stem="安和圖書館每個月的第三個星期二會舉辦「說故事」活動，五月份的「說故事」活動是5月"
              "( )日。",
         options=[], correctAnswer="20",
         verify="月曆二(週二)欄：6,13,20,27，第三個為20。與答案卷「(20)」一致。"),
    dict(localId="q10", sourcePage=1, questionNumber="一-3-(5)",
         stem="爸爸這個月的星期五和星期六放假，請問爸爸五月一共有( )天放假。",
         options=[], correctAnswer="10",
         verify="月曆五(週五)欄5天(2,9,16,23,30)＋六(週六)欄5天(3,10,17,24,31)＝10天。"
                "與答案卷「(10)」一致。"),
    dict(localId="q11", sourcePage=2, questionNumber="一-4-(1)",
         stem="一年甲班票選最喜歡的卡通人物，請寫出票數：（用○畫記表格：ㄅ拉布布、ㄆ卡皮巴拉、"
              "ㄇ吉伊卡哇）",
         options=[], correctAnswer="ㄅ10票、ㄆ7票、ㄇ12票",
         verify="裁圖逐格重新計數畫記圈數：ㄅ=5+5=10、ㄆ=5+2=7、ㄇ=6+6=12"
                "（初次略讀誤計ㄇ列第二排為5，經400dpi裁圖覆核確認為6）。與答案卷「10/7/12」一致。"),
    dict(localId="q12", sourcePage=2, questionNumber="一-4-(2)",
         stem="最受小朋友喜愛的卡通人物是( )（填代號）",
         options=[], correctAnswer="ㄇ",
         verify="12票為三者最高。與答案卷「ㄇ」一致。"),
    dict(localId="q13", sourcePage=2, questionNumber="一-4-(3)",
         stem="票選最多票和最少票相差( )票。",
         options=[], correctAnswer="5",
         verify="12-7=5。與答案卷「(5)」一致。"),
    dict(localId="q14", sourcePage=2, questionNumber="一-4-(4)",
         stem="每個人投一票，一年甲班共有( )個人。",
         options=[], correctAnswer="29",
         verify="10+7+12=29。與答案卷「(29)」一致。"),
    dict(localId="q15", sourcePage=2, questionNumber="一-5",
         stem="小棠到麥噹噹用餐，錢包裡裝了以下的錢幣：⑩⑤⑤⑤①①①①①①①①①（10+5+5+5+9個1元）。"
              "小棠想買以下的餐點（36元、63元、25元、38元），小棠帶的錢夠買的打「○」，不夠買的打「×」：",
         options=[], correctAnswer="×、×、○、×",
         verify="錢包總額=10+5+5+5+9=34元；34<36(×)，34<63(×)，34≥25(○)，34<38(×)。"
                "與答案卷「X/X/O/X」一致（不論1元硬幣精確枚數落在26~35元區間內何值，"
                "此四項判斷結果皆相同，故此驗算穩健成立）。"),
    dict(localId="q16", sourcePage=2, questionNumber="一-6-(1)",
         stem="小明的錢包裡有四種錢幣（50元、10元、5元、1元），先用「正」畫記，再寫出數量。"
              "（裁圖清點：50元×1、10元×3、5元×3、1元×4）",
         options=[], correctAnswer="50元1個、10元3個、5元3個、1元4個",
         verify="以400dpi裁圖逐枚清點硬幣圖：50元1枚、10元3枚、5元3枚、1元4枚，"
                "總計11枚。此清點結果與(2)(3)(4)三小題答案完全自洽（見下）。"),
    dict(localId="q17", sourcePage=2, questionNumber="一-6-(2)",
         stem="數量最多的錢幣是( )元的錢幣",
         options=[], correctAnswer="1",
         verify="1元硬幣4枚為四種中最多。與答案卷「1」一致。"),
    dict(localId="q18", sourcePage=2, questionNumber="一-6-(3)",
         stem="小明的錢包裡共有( )元。",
         options=[], correctAnswer="99",
         verify="50×1+10×3+5×3+1×4=50+30+15+4=99。與答案卷「99」一致"
                "（此為裁圖覆核清點後之獨立驗算結果）。"),
    dict(localId="q19", sourcePage=2, questionNumber="一-6-(4)",
         stem="小明如果想買100元的小汽車，需要再補( )元。",
         options=[], correctAnswer="1",
         verify="100-99=1。與答案卷「1」一致。"),
    dict(localId="q20", sourcePage=2, questionNumber="二-1",
         stem="弟弟有27張寶可夢卡，比哥哥少8張，請問哥哥有幾張寶可夢卡？【畫⑩和①做做看】",
         options=[], correctAnswer="35 張",
         verify="27+8=35。與答案卷「27+8=35 答:(35)張」一致。"),
    dict(localId="q21", sourcePage=3, questionNumber="二-2",
         stem="老師有一些貼紙，想送給班上26個學生一人一張，但後來發現不夠9張，請問老師原來有幾張"
              "貼紙？【畫⑩和①做做看】",
         options=[], correctAnswer="17 張",
         verify="26-9=17。與答案卷「26-9=17 答:(17)張」一致。"),
    dict(localId="q22", sourcePage=3, questionNumber="二-3-(1)",
         stem="便利商店本月推出四項特價商品（飲料44元、冰淇淋25元、蛋糕57元、餅乾9元）。"
              "妙妙買了一塊蛋糕後，身上還剩16元，請問妙妙原有多少元？【畫⑩和①做做看】",
         options=[], correctAnswer="73 元",
         verify="57+16=73。與答案卷「57+16=73 答:(73)元」一致。"),
    dict(localId="q23", sourcePage=3, questionNumber="二-3-(2)",
         stem="軒軒如果想買2瓶飲料，需要多少元？【畫⑩和①做做看】",
         options=[], correctAnswer="88 元",
         verify="44×2=88（答案卷列式44+44=88）。與答案卷「(88)元」一致。"),
    dict(localId="q24", sourcePage=3, questionNumber="二-3-(3)",
         stem="買一個冰淇淋比買一包餅乾，要多付多少元？【畫⑩和①做做看】",
         options=[], correctAnswer="16 元",
         verify="25-9=16。與答案卷「25-9=16 答:(16)元」一致。"),
]

for _it in ITEMS:
    _it.setdefault("boundaryStatus", "verified")
    _it.setdefault("answerStatus", "verified")
    _it.setdefault("verificationMethod", "independent_calculation")
    _it.setdefault("crop", None)
    _it.setdefault("answerKeyPage", _it["sourcePage"])

assert len(ITEMS) == 24
assert len({it["localId"] for it in ITEMS}) == 24
