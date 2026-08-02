"""Manually transcribed, page-image-verified question-level items for
G4-康軒-112下-期中1-P02_R06_安和國小_新北市_4年級_數學_112下_期中1_康軒.

Question pages: source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/
G4-_-112_-_1-P02_R06_____4____112___1__/page-{1,2,3}.jpg (rot=0, 728.52x1031.76pt).
Answer key: source_materials/tcool_math_g1_g4_康軒_翰林/grade-4/康軒/answers/
P02_R06_安和國小_新北市_4年級_數學_112下_期中1_康軒_答案卷.pdf (3 pages, worked-answer
scan read directly by vision).

IMPORTANT FINDING: item 四-1 (H/工-shaped composite figure area; overall 15+6+15=36cm
wide, 30cm tall, with a 6cm-wide x 8cm-deep notch cut into the top-middle and a
matching 6x8 notch cut into the bottom-middle, dimensions re-confirmed via two
independent 400dpi crops of the figure) — the answer key states 1044 平方公分, but
independent recomputation gives 36×30 - 2×(6×8) = 1080-96 = 984 平方公分 (equivalently:
two 15x30 side pillars + one 6x14 middle bar = 450+450+84 = 984). No consistent
misreading of the given dimensions reproduces 1044. Per the no-guessing rule this
item is kept as answerStatus=needs_review with the answer key's original value
preserved verbatim, not silently corrected, and routed to the answer-review-queue.

四-2 (staircase-shaped figure, all 5 labelled segments = 18) WAS independently
verified: reading the figure as 3 equal-width (18) columns of stacked height
18/36/54 gives 18×18+18×36+18×54 = 1944 平方公尺, matching the answer key exactly.

Item 二-6-(1), 五-(1), 五-(2), 九 (page1 number line) are open-ended drawing tasks with
no fixed textual answer ("略" in the answer key) and are recorded as needs_review.
"""

from __future__ import annotations

SOURCE_ID = "G4-康軒-112下-期中1-P02_R06_安和國小_新北市_4年級_數學_112下_期中1_康軒"

PAGE_BBOX = {1: [0, 0, 4047, 5732], 2: [0, 0, 4047, 5732], 3: [0, 0, 4047, 5732]}

ITEMS = [
    dict(localId="q01", sourcePage=1, questionNumber="一-1",
         stem="下列關於四邊形的敘述，有幾個正確？(A)四邊形中四個角都是直角的只有正方形 "
              "(B)只有一雙對邊互相平行的是梯形 (C)四條邊都一樣長的有正方形、菱形和平行四邊形 "
              "(D)四邊形的對角線數量都一樣 (E)平行四邊形和菱形都有兩雙對邊互相平行，兩雙對角"
              "分別一樣大",
         options=["①1個", "②2個", "③3個", "④4個"], correctAnswer="③3個",
         verify="(A)錯：長方形亦四角皆直角但非正方形；(B)對；(C)錯：平行四邊形不保證四邊等長；"
                "(D)對：任意四邊形恰有2條對角線；(E)對。正確共B、D、E三項。與答案卷「3」一致。"),
    dict(localId="q02", sourcePage=1, questionNumber="一-2",
         stem="一個正方形面積36平方公尺，正方形的邊長是？",
         options=["①6公分", "②60公分", "③600公分", "④60000公分"], correctAnswer="③600公分",
         verify="√36=6公尺=600公分。與答案卷「3」一致。"),
    dict(localId="q03", sourcePage=1, questionNumber="一-3",
         stem="下列算式何者有誤？",
         options=["①480-280-100 =480-(280-100)", "②450+(188+70)=450+70+188",
                   "③450÷9x7 =450x7÷9", "④480+20+70 =480+(20+70)"],
         correctAnswer="①480-280-100 =480-(280-100)",
         verify="①左式=100，右式=480-180=300，不相等，錯誤；②③④三式左右皆相等，成立。"
                "與答案卷「1」一致。"),
    dict(localId="q04", sourcePage=1, questionNumber="一-4",
         stem="有一隻小螞蟻在數線上3.6的位置，要去搬一顆在數線上1.9的糖果，請問下列哪一個方式最後"
              "可以停在糖果處？",
         options=["①向右0.4再向左1.1", "②向左1.5再向右0.7", "③向左0.5再向左0.9",
                   "④向左1.1再向左0.6"],
         correctAnswer="④向左1.1再向左0.6",
         verify="①3.6+0.4-1.1=2.9；②3.6-1.5+0.7=2.8；③3.6-0.5-0.9=2.2；④3.6-1.1-0.6=1.9。"
                "僅④=1.9。與答案卷「4」一致。"),
    dict(localId="q05", sourcePage=1, questionNumber="一-5",
         stem="以下敘述何者正確？",
         options=["①面積一樣大的圖形，周長一定不一樣長", "②長方形周長= 長x2+寬x2 = 長x寬",
                   "③1平方公尺 = 100平方公分", "④正方形周長 = 邊長x4"],
         correctAnswer="④正方形周長 = 邊長x4",
         verify="①錯(面積同周長可同可不同，非「一定不一樣」)；②錯(長×2+寬×2≠長×寬)；"
                "③錯(應為10000平方公分)；④正確。與答案卷「4」一致。"),
    dict(localId="q06", sourcePage=1, questionNumber="二-1",
         stem="若知65000÷130=500，那650000÷1300=( )。",
         options=[], correctAnswer="500",
         verify="被除數與除數同乘10，商不變：500。與答案卷「500」一致。"),
    dict(localId="q07", sourcePage=1, questionNumber="二-2-(1)",
         stem="若已知224 X 50 =11200。(1) 2.24 X 50 = ( )。",
         options=[], correctAnswer="112",
         verify="2.24=224/100，故2.24×50=11200/100=112。與答案卷「112」一致。"),
    dict(localId="q08", sourcePage=1, questionNumber="二-2-(2)",
         stem="(2) 224000 X 500 = ( )。",
         options=[], correctAnswer="112000000",
         verify="224000=224×1000；500=50×10；224000×500=(224×50)×(1000×10)=11200×10000"
                "=112000000。與答案卷「112000000」一致。"),
    dict(localId="q09", sourcePage=1, questionNumber="二-3-(1)",
         stem="將以下四邊形沿著一條對角線剪開，可以剪成兩個全等三角形，分別是什麼三角形？"
              "(1) 菱形：兩個全等( )。",
         options=[], correctAnswer="等腰三角形",
         verify="菱形四邊等長，對角線剪開後兩三角形皆為等腰三角形。與答案卷「等腰三角形」一致。"),
    dict(localId="q10", sourcePage=1, questionNumber="二-3-(2)",
         stem="(2) 長方形：兩個全等( )。",
         options=[], correctAnswer="直角三角形",
         verify="長方形四角皆直角，對角線剪開後每個三角形皆保留一直角。與答案卷「直角三角形」一致。"),
    dict(localId="q11", sourcePage=1, questionNumber="二-3-(3)",
         stem="(3) 正方形：兩個全等( )。",
         options=[], correctAnswer="等腰直角三角形",
         verify="正方形兼具菱形(等腰)與長方形(直角)性質，剪開後為等腰直角三角形。"
                "與答案卷「等腰直角三角形」一致。"),
    dict(localId="q12", sourcePage=1, questionNumber="二-4",
         stem="3500000平方公分= ( )平方公尺",
         options=[], correctAnswer="350",
         verify="1平方公尺=10000平方公分；3500000÷10000=350。與答案卷「350」一致。"),
    dict(localId="q13", sourcePage=1, questionNumber="二-5-(1)",
         stem="比大小：(1) 16平方公尺( )1600平方公分",
         options=[], correctAnswer=">",
         verify="16平方公尺=160000平方公分＞1600平方公分。與答案卷「〉」一致。"),
    dict(localId="q14", sourcePage=1, questionNumber="二-5-(2)",
         stem="(2) 0.7 x 600 ( ) 7 x 60",
         options=[], correctAnswer="=",
         verify="0.7×600=420；7×60=420，相等。與答案卷「=」一致。"),
    dict(localId="q15", sourcePage=1, questionNumber="二-5-(3)",
         stem="(3) 5200 x 300 ( ) 52 x 3000",
         options=[], correctAnswer=">",
         verify="5200×300=1,560,000；52×3000=156,000；前者較大。與答案卷「〉」一致。"),
    dict(localId="q16", sourcePage=1, questionNumber="二-6-(1)",
         stem="(平行四邊形ABCD，A左上B右上D左下C右下) (1)把右圖全部的對角線畫出來。",
         options=[], correctAnswer="略（作圖題，畫出AC、BD兩條對角線）",
         answerStatus="needs_review", verificationMethod="visual_manual_required",
         verify="開放式作圖題，答案卷標示「略」，無固定文字答案，不計入verified可用題。"),
    dict(localId="q17", sourcePage=1, questionNumber="二-6-(2)",
         stem="(2) BC的對邊是( )。",
         options=[], correctAnswer="邊AD",
         verify="平行四邊形ABCD中BC與AD為對邊。與答案卷「邊AD」一致。"),
    dict(localId="q18", sourcePage=1, questionNumber="二-6-(3)",
         stem="(3) AB的鄰邊是( )和( )。",
         options=[], correctAnswer="邊AD、邊BC",
         verify="AB相鄰兩邊為AD、BC。與答案卷「邊AD和邊BC」一致。"),
    dict(localId="q19", sourcePage=1, questionNumber="二-6-(4)",
         stem="(4)∠A的對角是∠( )。",
         options=[], correctAnswer="C",
         verify="四邊形ABCD中∠A對角為∠C。與答案卷「C」一致。"),
    dict(localId="q20", sourcePage=1, questionNumber="二-7",
         stem="爸爸的一步長是0.76公尺，弟弟的一步長是0.47公尺，兩人同時同地反方向各走15步後，"
              "兩人相距( )公尺。",
         options=[], correctAnswer="18.45",
         verify="0.76×15=11.4；0.47×15=7.05；反方向相加=11.4+7.05=18.45。"
                "與答案卷「18.45」一致。"),
    dict(localId="q21", sourcePage=1, questionNumber="二-8",
         stem="媽媽帶了1400元去菜市場買東西，在豬肉攤買了236元，在水果攤買了264元，回家時還剩"
              "( )元。",
         options=[], correctAnswer="900",
         verify="1400-236-264=900。與答案卷「900」一致。"),
    dict(localId="q22", sourcePage=1, questionNumber="二-9",
         stem="請在數線上標示出「2.7、4.4、3.9和1.2」。",
         options=[], correctAnswer="略（開放式數線標示作圖題）",
         answerStatus="needs_review", verificationMethod="visual_manual_required",
         verify="開放式作圖題，答案卷標示「略」，不計入verified可用題。"),
    dict(localId="q23", sourcePage=2, questionNumber="三-1",
         stem="請用直式算出答案：(1) 39.15 x 24 =( )",
         options=[], correctAnswer="939.6",
         verify="39.15×24=939.6。與答案卷「939.6」一致。"),
    dict(localId="q24", sourcePage=2, questionNumber="三-2",
         stem="(2) 560000 ÷ 1500 =( )……( )",
         options=[], correctAnswer="373...500",
         verify="1500×373=559500；560000-559500=500。與答案卷「373/500」一致。"),
    dict(localId="q25", sourcePage=2, questionNumber="三-3",
         stem="(3) 8600 x 3500 =( )",
         options=[], correctAnswer="30100000",
         verify="8600×3500=30,100,000。與答案卷「30100000」一致。"),
    dict(localId="q26", sourcePage=2, questionNumber="四-1",
         stem="算出圖形面積：(1)（工字形圖，整體寬15+6+15=36公分、高30公分，上方中央缺口寬6"
              "深8、下方中央缺口寬6深8，經400dpi裁圖兩次覆核確認）(單位：公分)",
         options=[], correctAnswer="1044 平方公分",
         answerStatus="needs_review", verificationMethod="independent_calculation",
         verify="獨立驗算：整體矩形36×30=1080，扣除上下兩缺口各6×8=48，即1080-48-48=984"
                "平方公分（等價算法：兩側柱15×30各450＋中間連接段6×14=84，450+450+84=984）。"
                "與答案卷所載「1044平方公分」不符，已兩次裁圖覆核尺寸(15,6,15,30,6,8,8,6)"
                "無誤，仍找不到能得出1044之合理讀法。依規定如實保留答案卷原始數值，"
                "標記needs_review，列入answer-review-queue，不得逕自改為984。"),
    dict(localId="q27", sourcePage=2, questionNumber="四-2",
         stem="(2)（階梯狀圖，5段標示皆為18：由左上至右下依序為豎18、橫18、豎18、橫18、豎18）"
              "(單位：公尺)",
         options=[], correctAnswer="1944 平方公尺",
         verify="以三段等寬(18)柱狀分解：右柱18×18=324，中柱18×36=648，左柱18×54=972，"
                "總和324+648+972=1944，與答案卷「1944平方公尺」一致（已重新以矩形分解法驗算）。"),
    dict(localId="q28", sourcePage=2, questionNumber="五-1",
         stem="畫圖題：(1)請在方格點上畫出一個菱形和一個平行四邊形（請在圖形上標示名稱）",
         options=[], correctAnswer="略（開放式作圖題）",
         answerStatus="needs_review", verificationMethod="visual_manual_required",
         verify="開放式作圖題，答案卷標示「略」，不計入verified可用題。"),
    dict(localId="q29", sourcePage=2, questionNumber="五-2",
         stem="(2)畫一條通過ㄅ點，且和甲線互相平行的直線，並畫出兩條平行線間的最短距離。",
         options=[], correctAnswer="略（開放式作圖題）",
         answerStatus="needs_review", verificationMethod="visual_manual_required",
         verify="開放式作圖題，答案卷標示「略」，不計入verified可用題。"),
    dict(localId="q30", sourcePage=2, questionNumber="六-1",
         stem="想想看，要怎麼算比較快算出答案？(1) 1997 + 197 + 1002 + 12",
         options=[], correctAnswer="3208",
         verify="1997+197+1002+12=3208（可湊整：1997+1002=2999加上197+12=209，2999+209=3208）。"
                "與答案卷「3208」一致。"),
    dict(localId="q31", sourcePage=2, questionNumber="六-2",
         stem="(2) 125 x 33 x 8",
         options=[], correctAnswer="33000",
         verify="125×8=1000，1000×33=33000。與答案卷「33000」一致。"),
    dict(localId="q32", sourcePage=3, questionNumber="七-1",
         stem="應用題：(1)書香文具店舉辦優惠活動，當日消費滿577元可馬上折抵77元。媽媽買了一本250"
              "元的記帳本和一本677元的字典，付了1000元，請問可以找回多少錢？",
         options=[], correctAnswer="150 元",
         verify="250+677=927(≥577，折抵77)；927-77=850；1000-850=150。與答案卷「150元」一致。"),
    dict(localId="q33", sourcePage=3, questionNumber="七-2",
         stem="(2)有一條64公尺的繩子要圍成一個正方形，請問此正方形的邊長是多少公尺？若有一樣大的"
              "正方形10個，它們全部的面積總共是多少平方公尺？",
         options=[], correctAnswer="邊長16公尺；總面積2560平方公尺",
         verify="64÷4=16；16²=256；256×10=2560。與答案卷「16公尺，2560平方公尺」一致。"),
    dict(localId="q34", sourcePage=3, questionNumber="七-3",
         stem="(3)大水管一分鐘注水30.2公升，小水管一分鐘注水11.9公升。水族館的人員同時使用大小"
              "水管各2根注水5分鐘，請問共注入多少公升的水？",
         options=[], correctAnswer="421 公升",
         verify="(30.2×2+11.9×2)×5=(60.4+23.8)×5=84.2×5=421。與答案卷「421公升」一致。"),
    dict(localId="q35", sourcePage=3, questionNumber="八-1",
         stem="閱讀文章：快樂國小決定鋪設一間全新有木頭地板的閱讀教室，教室長是1050公分、寬是800"
              "公分，木頭地板施工材料費1平方公尺要2200元，會派4個師傅負責施工，一個師傅1天薪水"
              "2150元，預計2.5天施工完成。(1)長方形教室的面積是多少平方公尺？",
         options=[], correctAnswer="84 平方公尺",
         verify="1050公分=10.5公尺，800公分=8公尺；10.5×8=84。與答案卷「84平方公尺」一致。"),
    dict(localId="q36", sourcePage=3, questionNumber="八-2",
         stem="(2)木頭地板的施工材料費要多少元？",
         options=[], correctAnswer="184800 元",
         verify="84×2200=184800。與答案卷「184800元」一致。"),
    dict(localId="q37", sourcePage=3, questionNumber="八-3",
         stem="(3)全部施工師傅的工錢總共是多少元？怎樣算比較快，把做法用一個算式記下來，再算算看。",
         options=[], correctAnswer="21500 元",
         verify="2150×2.5×4=21500（或2150×4×2.5）。與答案卷「21500元」一致。"),
]

for _it in ITEMS:
    _it.setdefault("boundaryStatus", "verified")
    _it.setdefault("answerStatus", "verified")
    _it.setdefault("verificationMethod", "independent_calculation")
    _it.setdefault("crop", None)
    _it.setdefault("answerKeyPage", _it["sourcePage"])

assert len(ITEMS) == 37
assert len({it["localId"] for it in ITEMS}) == 37
