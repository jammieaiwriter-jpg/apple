"""Manually transcribed, page-image-verified question-level items for calibration
source G3-翰林-108上-期中1-P07_R06_鶴聲國小_屏東縣_3年級_數學_108上_期中1_翰林 (scan_needs_ocr;
read directly from rendered page images, not from the unreliable upstream OCR text).

Question pages: source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/
G3-_-108_-_1-P07_R06_____3____108___1__/page-{1,2}.jpg (poppler already applies the
PDF's Page rot=90, giffalling portrait 841.89x1190.55pt page rendered upright).
Answer key: source_materials/tcool_math_g1_g4_康軒_翰林/grade-3/翰林/answers/
P07_R06_鶴聲國小_屏東縣_3年級_數學_108上_期中1_翰林_答案卷.pdf (2 pages, same layout as
question pages; this is a filled-in worked-answer scan, read directly by vision, not OCR).

Same splitting rule as the G2 calibration source: circled sub-labels (①②③...) split
into separate question_items; inline blanks in one running sentence stay combined.
This paper's 三、填填看 section uses plain numbered items (1-17) with no circled
sub-labels, so each numbered item stays as one question_item even when it has 2-4
blanks, matching how the answer key groups them.

Upstream old candidates for this source all have sourcePage=null (OCR failed to
localize them) and only cover one candidate per top-level section label (一/二/三/
四/五/六), sometimes two due to OCR noise (二-1 and 二-3 both exist). The build script
maps sourceGroupIds by section-label prefix, not by page, and this is recorded as
mappingConfidence="section_level_only" in split-manifest.json.
"""

from __future__ import annotations

SOURCE_ID = "G3-翰林-108上-期中1-P07_R06_鶴聲國小_屏東縣_3年級_數學_108上_期中1_翰林"

# Full-page pixel bounds at BBOX_DPI=400, rotated (Page rot=90) 841.89 x 1190.55 pt
# -> 4677 x 6614 px. Question and answer PDFs share this page size/orientation.
PAGE_BBOX = {1: [0, 0, 4677, 6614], 2: [0, 0, 4677, 6614]}
ANSWER_PAGE_BBOX = {1: [0, 0, 4677, 6614], 2: [0, 0, 4677, 6614]}

ITEMS = [
    dict(localId="q01", sourcePage=1, questionNumber="一-1",
         stem="對的畫○，錯的打×（是非題）：2 個千、4 個百和 5 個十合起來是 2450。",
         options=[], correctAnswer="○",
         verify="2000+400+50=2450，敘述為真。與答案卷「1.(○)」一致。"),
    dict(localId="q02", sourcePage=1, questionNumber="一-2",
         stem="在數線上，1380 向左數 1 個一是 1379。（數線圖：方框、1380、1381，-1 弧線指向方框）",
         options=[], correctAnswer="○",
         verify="1380-1=1379，敘述為真，並與數線圖方框位置一致。與答案卷「2.(○)」一致。"),
    dict(localId="q03", sourcePage=1, questionNumber="一-3",
         stem="小海豚從 67 向右游到 73，是游了 7 格。（數線圖：67 68 69 70 71 72 73）",
         options=[], correctAnswer="×",
         verify="73-67=6 格，非 7 格，敘述為假。與答案卷「3.(×)」一致。"),
    dict(localId="q04", sourcePage=1, questionNumber="一-4",
         stem="小蝴蝶從 54 向左飛 6 格，會飛到 48。（數線圖：49 50 51 52 53 54 55）",
         options=[], correctAnswer="○",
         verify="54-6=48，敘述為真。與答案卷「4.(○)」一致。"),
    dict(localId="q05", sourcePage=1, questionNumber="一-5",
         stem="有一個四位數比 6000 大，這個數的千位數字最小一定是 6。",
         options=[], correctAnswer="○",
         verify="大於6000的最小四位數為6001，千位數字為6；千位<6則數必≤5999<6000，故千位數字"
                "最小可能值恰為6，敘述為真。與答案卷「5.(○)」一致。"),
    dict(localId="q06", sourcePage=1, questionNumber="二-1",
         stem="兔子從 1130 開始，向左跳 4 格，最後會停在（數線圖：每跳一次-10，標示 1110 1120 1130）",
         options=["①1090", "②1080", "③1180", "④1190"], correctAnswer="①1090",
         verify="4 次-10：1130-40=1090。與答案卷「1.(1)」一致。"),
    dict(localId="q07", sourcePage=1, questionNumber="二-2",
         stem="蚯蚓從 220 開始，先向右爬 4 格，再向左爬 5 格，最後會停在哪一個數？"
              "（數線圖：218 219 220，每格 1）",
         options=["①217", "②218", "③219", "④220"], correctAnswer="③219",
         verify="220+4-5=219。與答案卷「2.(3)」一致。"),
    dict(localId="q08", sourcePage=1, questionNumber="二-3",
         stem="清風飲料店今天上午賣出 1279 杯紅茶，下午比上午多賣出 215 杯，今天飲料店共做出"
              "多少杯的紅茶？",
         options=["①1494 杯", "②2873 杯", "③2773 杯", "④1064 杯"], correctAnswer="③2773 杯",
         verify="下午=1279+215=1494；共計=1279+1494=2773。與答案卷「3.(3)」一致。"),
    dict(localId="q09", sourcePage=1, questionNumber="二-4",
         stem="把 1005、992 和 929 這三個數依照由小到大的順序排列，正確的順序是？",
         options=["①1005<992<929", "②992<929<1005", "③929<1005<992", "④929<992<1005"],
         correctAnswer="④929<992<1005",
         verify="929<992<1005 為正確遞增順序。與答案卷「4.(4)」一致。"),
    dict(localId="q10", sourcePage=1, questionNumber="二-5",
         stem="下面□的位置表示哪一個數？（數線圖：18、20 兩刻度標示，等距刻度延伸至□）",
         options=["①22", "②24", "③26", "④28"], correctAnswer="③26",
         crop=[350, 5600, 1400, 400],
         verify="裁圖確認刻度等距、18→20 間距為2；□位於20之後第3個刻度：22,24,26。"
                "與答案卷「5.(3)」一致，數線間距已由裁圖覆核。"),
    dict(localId="q11", sourcePage=1, questionNumber="三-1",
         stem="2 個千、1 個十和 8 個一是( )。",
         options=[], correctAnswer="2018",
         verify="2000+10+8=2018。與答案卷「1.(2018)」一致。"),
    dict(localId="q12", sourcePage=1, questionNumber="三-2",
         stem="1372 是( )個千、( )個百、( )個十和( )個一。",
         options=[], correctAnswer="1、3、7、2",
         verify="1372 千百十個位分別為1,3,7,2。與答案卷「2.(1)(3)(7)(2)」一致。"),
    dict(localId="q13", sourcePage=1, questionNumber="三-3",
         stem="2153=2000+100+( )+3",
         options=[], correctAnswer="50",
         verify="2153-2000-100-3=50。與答案卷「3.(50)」一致。"),
    dict(localId="q14", sourcePage=1, questionNumber="三-4",
         stem="在□中填入代表位置的數。（數線：45 50 55 □ 65 □ □ □ 80 □，等距刻度）",
         options=[], correctAnswer="60、70、75、85",
         verify="等差+5：45,50,55,60,65,70,75,80,85，共5個空格依序60,70,75,85（其中一格已知80）。"
                "與答案卷紅字填入「60、70、75、85」一致。"),
    dict(localId="q15", sourcePage=1, questionNumber="三-5",
         stem="3 個千、0 個百、1 個十和 9 個一合起來是( )，讀作( )。",
         options=[], correctAnswer="3019、三千零十九",
         verify="3000+0+10+9=3019，讀作三千零十九。與答案卷「5.(3019)(三千零十九)」一致。"),
    dict(localId="q16", sourcePage=1, questionNumber="三-6",
         stem="按照數的順序填填看。6800→( )→( )→( )→( )→7300→7400",
         options=[], correctAnswer="6900、7000、7100、7200",
         verify="等差+100：6800,6900,7000,7100,7200,7300,7400。與答案卷"
                "「6.(6900)(7000)(7100)(7200)」一致。"),
    dict(localId="q17", sourcePage=1, questionNumber="三-7",
         stem="雪山的高度是 3886 公尺，是臺灣第二高的山。3886 是( )個千、( )個百、( )個十和"
              "( )個一合起來。",
         options=[], correctAnswer="3、8、8、6",
         verify="3886 千百十個位分別為3,8,8,6。與答案卷「7.(3)(8)(8)(6)」一致。"),
    dict(localId="q18", sourcePage=1, questionNumber="三-8",
         stem="按照數的順序填填看。960→970→980→( )→( )→( )→( )→( )",
         options=[], correctAnswer="990、1000、1010、1020、1030",
         verify="等差+10：960,970,980,990,1000,1010,1020,1030。與答案卷"
                "「8.(990)(1000)(1010)(1020)(1030)」一致。"),
    dict(localId="q19", sourcePage=1, questionNumber="三-9",
         stem="有多少元？填填看。（圖示：4 張千元鈔＋2 張千元鈔（共4張千元鈔排列於上兩排）、"
              "2 張百元鈔、3 個十元硬幣）",
         options=[], correctAnswer="4230 元",
         verify="清點圖示：1000元鈔4張=4000、100元鈔2張=200、10元幣3個=30；4000+200+30=4230。"
                "與答案卷「9.(4230)元」一致。"),
    dict(localId="q20", sourcePage=1, questionNumber="三-10",
         stem="按照數的順序填填看。[ ]→[ ]→9000→[ ]→9200→9300",
         options=[], correctAnswer="8800、8900、9100",
         verify="等差+100倒推/正推：8800,8900,9000,9100,9200,9300。與答案卷"
                "「10.(8800)(8900)(9100)」一致。"),
    dict(localId="q21", sourcePage=1, questionNumber="三-11",
         stem="爸爸的生日是 9 月 20 日，再過 5 天就是琦琦的生日。琦琦生日是 9 月( )日。",
         options=[], correctAnswer="25",
         verify="20+5=25。與答案卷「11.(25)」一致。"),
    dict(localId="q22", sourcePage=1, questionNumber="三-12",
         stem="三年甲班排隊，每 2 個男同學之間站 1 個女同學，全班同學剛好排完，三年甲班有 8 個"
              "女同學，三年甲班男同學有( )人，全班同學共( )人。",
         options=[], correctAnswer="9、17",
         verify="女同學站在相鄰男同學之間的間隔中：N個男同學相鄰間隔數=N-1，故N-1=8→N=9；"
                "全班=9+8=17。與答案卷「12.(9)(17)」一致。"),
    dict(localId="q23", sourcePage=1, questionNumber="三-13",
         stem="將 4507 記在位值表上。（千位／百位／十位／個位表格）",
         options=[], correctAnswer="千位4、百位5、十位0、個位7",
         verify="4507 千百十個位分別為4,5,0,7。與答案卷表格填入「4/5/0/7」一致。"),
    dict(localId="q24", sourcePage=2, questionNumber="三-14",
         stem="「八千零三」記成數字是( )。",
         options=[], correctAnswer="8003",
         verify="八千零三=8000+3=8003（百位、十位為0）。與答案卷「14.(8003)」一致。"),
    dict(localId="q25", sourcePage=2, questionNumber="三-15",
         stem="幸福國小有女生 835 人，男生 568 人，女生比男生多幾人？（線段圖：女生835人、"
              "男生568人、差距方框）",
         options=[], correctAnswer="167 人",
         answerStatus="needs_review", verificationMethod="independent_calculation",
         verify="答案卷方框手寫填「167人」，但獨立驗算 835-568=267，與答案卷數值不符"
                "（568+267=835 可驗證267才是正確差值；568+167=735≠835）。"
                "本題答案卷本身疑似計算或謄寫錯誤，correctAnswer 依規定如實保留答案卷原始"
                "文字「167 人」，並標記 needs_review、列入 answer-review-queue，"
                "不得逕自改為 267 或視為 verified。"),
    dict(localId="q26", sourcePage=2, questionNumber="三-16",
         stem="在□中填入正確的數字。3□74 + □9□1 = 9605（直式加法，三個內部空格＋和的個位空格）",
         options=[], correctAnswer="3674+5931=9605（依序：百位6、千位5、十位3、和的個位5）",
         verify="設第一加數=3X74，第二加數=Y9Z1，和=960W。逐位驗算：3674+5931=9605 成立"
                "（百位6、千位5、十位3、個位W=5均與答案卷手寫紅字一致）。"),
    dict(localId="q27", sourcePage=2, questionNumber="三-17",
         stem="有一個四位數，比 2899 大，比 2905 小，這個數的百位數字是多少？寫出一個這樣的"
              "四位數。",
         options=[], correctAnswer="百位數字 9，例如 2900（2900-2904 皆合乎範圍）",
         verify="介於2899與2905之間的四位數為2900-2904，皆屬29xx，百位數字固定為9。"
                "與答案卷「17.百位數字是(9)，這個數是(2900)（或2901-2904）」一致。"),
    dict(localId="q28", sourcePage=2, questionNumber="四-1",
         stem="填入 >、< 或 =：4469( )4489", options=[], correctAnswer="<",
         verify="4469<4489。與答案卷「1.(<)」一致。"),
    dict(localId="q29", sourcePage=2, questionNumber="四-2",
         stem="填入 >、< 或 =：一千零二( )一千零二十", options=[], correctAnswer="<",
         verify="1002<1020。與答案卷「2.(<)」一致。"),
    dict(localId="q30", sourcePage=2, questionNumber="四-3",
         stem="填入 >、< 或 =：7208( )6995", options=[], correctAnswer=">",
         verify="7208>6995。與答案卷「3.(>)」一致。"),
    dict(localId="q31", sourcePage=2, questionNumber="四-4",
         stem="填入 >、< 或 =：5006( )5060", options=[], correctAnswer="<",
         verify="5006<5060。與答案卷「4.(<)」一致。"),
    dict(localId="q32", sourcePage=2, questionNumber="四-5",
         stem="填入 >、< 或 =：3509( )3590", options=[], correctAnswer="<",
         verify="3509<3590。與答案卷「5.(<)」一致。"),
    dict(localId="q33", sourcePage=2, questionNumber="五-1",
         stem="寫出直式算算看：581-267=( )", options=[], correctAnswer="314",
         verify="581-267=314。與答案卷「1.(314)」一致（並經直式重算覆核）。"),
    dict(localId="q34", sourcePage=2, questionNumber="五-2",
         stem="寫出直式算算看：1523+5588=( )", options=[], correctAnswer="7111",
         verify="1523+5588=7111。與答案卷「2.(7111)」一致。"),
    dict(localId="q35", sourcePage=2, questionNumber="五-3",
         stem="寫出直式算算看：540+2560=( )", options=[], correctAnswer="3100",
         verify="540+2560=3100。與答案卷「3.(3100)」一致。"),
    dict(localId="q36", sourcePage=2, questionNumber="五-4",
         stem="寫出直式算算看：1983-785=( )", options=[], correctAnswer="1198",
         verify="1983-785=1198。與答案卷「4.(1198)」一致。"),
    dict(localId="q37", sourcePage=2, questionNumber="六-1",
         stem="寫出算式做做看：一件襯衫賣 800 元，一條圍巾比一件襯衫便宜 375 元，一條圍巾賣"
              "幾元？",
         options=[], correctAnswer="425 元",
         verify="800-375=425。與答案卷「1. 800-375=425 答:425元」一致。"),
    dict(localId="q38", sourcePage=2, questionNumber="六-2",
         stem="甲店今天賺 5900 元，乙店今天賺 4629 元，哪一家店賺比較多？多幾元？",
         options=[], correctAnswer="甲店多 1271 元",
         verify="5900-4629=1271；5900>4629。與答案卷「2. 5900-4629=1271 A:甲店多1271元」一致。"),
    dict(localId="q39", sourcePage=2, questionNumber="六-3",
         stem="上星期到圖書館借書的有 1805 人，這星期借書的有 2718 人，這兩個星期共有幾人到"
              "圖書館借書？",
         options=[], correctAnswer="4523 人",
         verify="1805+2718=4523。與答案卷「3. 1805+2718=4523 A:4523人」一致。"),
    dict(localId="q40", sourcePage=2, questionNumber="六-4",
         stem="麻雀從 18 開始，向左飛 9 格，會停在哪一個數？（數線圖：9~20）",
         options=[], correctAnswer="9",
         verify="18-9=9。與答案卷「4. 18-9=9 A:9」一致。"),
    dict(localId="q41", sourcePage=2, questionNumber="六-5",
         stem="蚱蜢依照順序跳，一次跳一個間隔到另一朵花上，從第 18 朵花跳到第 31 朵花，蚱蜢共"
              "跳了幾次？（圖示花朵編號 18-22...）",
         options=[], correctAnswer="13 次",
         verify="跳躍次數=位置差=31-18=13。與答案卷「5. 31-18=13 A:13次」一致。"),
    dict(localId="q42", sourcePage=2, questionNumber="六-6",
         stem="有一場電影，截至開演前，賣掉的全票比半票多 634 張，賣掉的半票比優待票多 895 張，"
              "賣掉的全票比優待票多幾張？（線段圖：全票／半票／優待票）",
         options=[], correctAnswer="1529 張",
         verify="634+895=1529（差值可直接相加，因半票為共同比較基準）。與答案卷"
                "「6. 634+895=1529 A:1529張」一致。"),
]

for _it in ITEMS:
    _it.setdefault("boundaryStatus", "verified")
    _it.setdefault("answerStatus", "verified")
    _it.setdefault("verificationMethod", "independent_calculation")
    _it.setdefault("crop", None)
    _it.setdefault("answerKeyPage", _it["sourcePage"])

assert len(ITEMS) == 42
assert len({it["localId"] for it in ITEMS}) == 42
