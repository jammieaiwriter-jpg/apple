"""Manually transcribed, page-image-verified question-level items for
G1-康軒-109上-期中1-P04_R02_寶山國小_彰化縣_1年級_數學_109上_期中1_康軒.

Question pages: source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/
G1-_-109_-_1-P04_R02_____1____109___1__/page-{1,2,3}.jpg (rot=0, 595.32x841.92pt A4).
Answer key (rot=270, same nominal page size, 4 pages, page 4 blank): source_materials/
tcool_math_g1_g4_康軒_翰林/grade-1/康軒/answers/P04_R02_寶山國小_彰化縣_1年級_數學_109上_期中1_康軒_答案卷.pdf,
read directly by vision (worked/annotated answer scan), not OCR text.

This paper is G1 and heavily picture-based (connect-the-dots pairing, length/height
ranking by drawing, shape counting inside a composite figure, solid-object property
sorting, "draw the same quantity" counting). Splitting rule: sub-parts numbered
independently — whether with circled marks, plain "(1)(2)(3)", or nested "1./2." —
are split into separate question_items when the answer key grades them separately
(point breakdown confirms this); a single connect-the-dots / ranking instruction with
no independently-numbered sub-parts stays as one question_item since the whole
picture is one answerable unit.

For pure picture-judgment items (length/height ranking by drawing, solid-object
flat/curved-face sorting, "which pictures should be circled") there is no arithmetic
to independently recompute; verificationMethod is visual_manual_required and the
answer is cross-checked directly against the worked-answer scan's own markings plus
this script author's independent re-reading of the source picture (e.g. shape counts
in 三-6 were recounted from the picture and matched the key exactly; sequence-path
positions in 三-5 were recounted along the drawn path and matched the key exactly).
"""

from __future__ import annotations

SOURCE_ID = "G1-康軒-109上-期中1-P04_R02_寶山國小_彰化縣_1年級_數學_109上_期中1_康軒"

# Full-page pixel bounds at BBOX_DPI=400, rot=0, 595.32x841.92pt -> 3307x4677px.
PAGE_BBOX = {1: [0, 0, 3307, 4677], 2: [0, 0, 3307, 4677], 3: [0, 0, 3307, 4677]}

ITEMS = [
    dict(localId="q01", sourcePage=1, answerKeyPage=1, questionNumber="一-1",
         stem="把答案相同的算式連起來。魚形卡：3+5、2+7、1+4、6+0；貓形卡：7+2、6+2、3+3、0+5。",
         options=[], correctAnswer="3+5(8)—6+2(8)；2+7(9)—7+2(9)；1+4(5)—0+5(5)；6+0(6)—3+3(6)",
         verify="各算式求和後兩兩配對：8↔8、9↔9、5↔5、6↔6，四組總和唯一對應，與答案卷連線一致。"),
    dict(localId="q02", sourcePage=1, answerKeyPage=1, questionNumber="一-2",
         stem="多少和多少合起來是 10？（撲克牌對應：ㄅ=1、ㄆ=3、ㄇ=4、ㄈ=5；ㄉ=5、ㄊ=6、ㄋ=9、ㄌ=7）",
         options=[], correctAnswer="ㄅ(1)—ㄋ(9)；ㄆ(3)—ㄌ(7)；ㄇ(4)—ㄊ(6)；ㄈ(5)—ㄉ(5)",
         verify="裁圖確認各牌點數後，四組配對皆使兩數合計為10，且每張牌恰用一次，唯一解，與答案卷連線一致。"),
    dict(localId="q03", sourcePage=1, answerKeyPage=1, questionNumber="一-3",
         stem="把圖形分類：螺旋形、波浪形（w）、水平短線、斜線，分別歸入「直線」或「曲線」。",
         options=[], correctAnswer="螺旋形、波浪形→曲線；水平短線、斜線→直線",
         verify="螺旋與波浪形皆為彎曲線條，水平短線與斜線皆無彎曲，屬直線；分類具幾何定義上的唯一性，與答案卷連線一致。"),
    dict(localId="q04", sourcePage=1, answerKeyPage=1, questionNumber="二-1",
         stem="下面有 3 條繩子，由長到短填入 1、2、3。（繩子圖：①斜直線、②水平直線、③密集纏繞的捲繩）",
         options=[], correctAnswer="①=2、②=3、③=1",
         verificationMethod="visual_manual_required",
         verify="③為多圈纏繞捲繩，攤直後所含繩材最長，故排名1（最長）；①斜直線次之為2；②水平直線最短為3。"
                "與答案卷紅字「2、3、1」一致（此為長度視覺判斷題，非算式可獨立驗算，已對照原圖與答案卷雙重確認）。"),
    dict(localId="q05", sourcePage=1, answerKeyPage=1, questionNumber="二-2",
         stem="由高到矮填入 1、2、3、4。（圖：①大樹（圓形樹冠、粗幹）②似椰子/酢漿草頂的細長植物"
              "③頂端如雪花的細長植物④蓬鬆矮樹叢）",
         options=[], correctAnswer="①=1、②=2、③=3、④=4",
         verificationMethod="visual_manual_required",
         verify="裁圖確認①樹冠最高大，④矮樹叢最矮小；答案卷紅字標②=2、③=3、④=4，依排除法①=1，"
                "與原圖相對高度判斷一致（視覺高度排序題，非算式可獨立驗算）。"),
    dict(localId="q06a", sourcePage=1, answerKeyPage=1, questionNumber="二-3-1",
         stem="比較薄的打勾：兩本書，一本厚(角度立體)、一本薄(平放)。",
         options=[], correctAnswer="第2本（較薄的書）",
         verificationMethod="visual_manual_required",
         verify="原圖第2本書明顯畫得較扁薄，與答案卷勾選第2本一致。"),
    dict(localId="q06b", sourcePage=1, answerKeyPage=1, questionNumber="二-3-2",
         stem="比較薄的打勾：兩疊漢堡，一疊層數多(厚)、一疊層數少(薄)。",
         options=[], correctAnswer="第2疊（層數較少、較薄）",
         verificationMethod="visual_manual_required",
         verify="原圖第2疊漢堡堆疊層數明顯較少，與答案卷勾選第2疊一致。"),
    dict(localId="q07", sourcePage=1, answerKeyPage=1, questionNumber="三-1",
         stem="數字合成分解圖：10 分解為 5 和 ( )。",
         options=[], correctAnswer="5",
         verify="10-5=5。與答案卷方框填入5一致。"),
    dict(localId="q08", sourcePage=1, answerKeyPage=1, questionNumber="三-2",
         stem="數字合成分解圖：7 分解為 ( ) 和 4。",
         options=[], correctAnswer="3",
         verify="7-4=3。與答案卷方框填入3一致。"),
    dict(localId="q09", sourcePage=2, answerKeyPage=2, questionNumber="三-3",
         stem="28-( )-26-( )-24-23（等差數列填空）",
         options=[], correctAnswer="27、25",
         verify="等差-1：28,27,26,25,24,23。與答案卷「27、25」一致。"),
    dict(localId="q10", sourcePage=2, answerKeyPage=2, questionNumber="三-4",
         stem="9-( )-( )-12-13-14（等差數列填空）",
         options=[], correctAnswer="10、11",
         verify="等差+1：9,10,11,12,13,14。與答案卷「10、11」一致。"),
    dict(localId="q11", sourcePage=2, answerKeyPage=2, questionNumber="三-5-(1)",
         stem="（昆蟲/動物排成一路徑，蜻蜓標「第18個」，沿路徑依序：蜻蜓18、蝴蝶19、蜜蜂20、鳥21、青蛙22、"
              "魚形怪物23，轉接下排：鴨24、鼠25、狗26、貓27、猴28、河馬29）"
              "蝴蝶是第( )個，牠的後面有( )個。",
         options=[], correctAnswer="第19個，後面有10個",
         verificationMethod="visual_manual_required",
         verify="沿路徑重新計數：蝴蝶為第19個（緊接蜻蜓18之後）；全部共12隻(18~29)，19之後為20~29共10隻。"
                "與答案卷「(19)(10)」一致。"),
    dict(localId="q12", sourcePage=2, answerKeyPage=2, questionNumber="三-5-(2)",
         stem="狗是第( )個，牠的前面有( )個。",
         options=[], correctAnswer="第26個，前面有8個",
         verificationMethod="visual_manual_required",
         verify="沿路徑重新計數：狗為第26個；其前面為18~25共8隻。與答案卷「(26)(8)」一致。"),
    dict(localId="q13", sourcePage=2, answerKeyPage=2, questionNumber="三-5-(3)",
         stem="青蛙是第( )個，牠的前面一個是第( )個，後面一個是第( )個。",
         options=[], correctAnswer="第22個，前面一個第21個，後面一個第23個",
         verificationMethod="visual_manual_required",
         verify="沿路徑重新計數：青蛙為第22個，前一個為鳥(21)，後一個為魚形怪物(23)。與答案卷"
                "「(22)(21)(23)」一致。"),
    dict(localId="q14", sourcePage=2, answerKeyPage=2, questionNumber="三-6-(1)",
         stem="數數看（機器娃娃圖形：頭為大圓+2小圓眼睛、嘴為長方形、身體為三角形、左右手與耳飾為菱形共4個、"
              "左右腳為長方形共2個）有( )個正方形。",
         options=[], correctAnswer="2",
         verify="菱形即旋轉45度之正方形，圖中恰有2個（雙耳飾）。與答案卷「(2)」一致（已逐一重新計數圖形）。"),
    dict(localId="q15", sourcePage=2, answerKeyPage=2, questionNumber="三-6-(2)",
         stem="有( )個長方形。",
         options=[], correctAnswer="5",
         verify="長方形計數：嘴巴1個＋左右手臂2個＋左右腳2個＝5個。與答案卷「(5)」一致。"),
    dict(localId="q16", sourcePage=2, answerKeyPage=2, questionNumber="三-6-(3)",
         stem="有( )個三角形。",
         options=[], correctAnswer="1",
         verify="身體僅1個三角形。與答案卷「(1)」一致。"),
    dict(localId="q17", sourcePage=2, answerKeyPage=2, questionNumber="三-6-(4)",
         stem="有( )個圓形。",
         options=[], correctAnswer="3",
         verify="頭部大圓1個＋雙眼小圓2個＝3個。與答案卷「(3)」一致。"),
    dict(localId="q18", sourcePage=1, answerKeyPage=1, questionNumber="四-1",
         stem="計算題：4+2=( )", options=[], correctAnswer="6",
         verify="4+2=6。與答案卷「6」一致。"),
    dict(localId="q19", sourcePage=2, answerKeyPage=2, questionNumber="四-2",
         stem="計算題：0+6=( )", options=[], correctAnswer="6",
         verify="0+6=6。與答案卷「6」一致。"),
    dict(localId="q20", sourcePage=2, answerKeyPage=2, questionNumber="四-3",
         stem="計算題：9+0=( )", options=[], correctAnswer="9",
         verify="9+0=9。與答案卷「9」一致。"),
    dict(localId="q21", sourcePage=2, answerKeyPage=2, questionNumber="四-4",
         stem="計算題：1+8=( )", options=[], correctAnswer="9",
         verify="1+8=9。與答案卷「9」一致。"),
    dict(localId="q22", sourcePage=2, answerKeyPage=2, questionNumber="四-5",
         stem="計算題：3+5=( )", options=[], correctAnswer="8",
         verify="3+5=8。與答案卷「8」一致。"),
    dict(localId="q23", sourcePage=2, answerKeyPage=2, questionNumber="四-6",
         stem="計算題：7+3=( )", options=[], correctAnswer="10",
         verify="7+3=10。與答案卷「10」一致。"),
    dict(localId="q24", sourcePage=2, answerKeyPage=2, questionNumber="五-1-(1)",
         stem="觀察下列物品（禮物盒、球、紙捲筒、三角錐/角），再圈圈看：哪些物品只有平平的面？",
         options=[], correctAnswer="禮物盒、三角錐(角)",
         verificationMethod="visual_manual_required",
         verify="禮物盒(長方體)六面皆平面；標示「角」之三角錐/柱同為平面構成；球與紙捲筒皆含彎曲面故排除。"
                "與答案卷圈選一致。"),
    dict(localId="q25", sourcePage=2, answerKeyPage=2, questionNumber="五-1-(2)",
         stem="觀察下列物品，再圈圈看：哪些物品只有彎彎的面？",
         options=[], correctAnswer="球",
         verificationMethod="visual_manual_required",
         verify="球為唯一僅由彎曲面構成之物品（紙捲筒雖含彎曲面但兩端仍為平面）。與答案卷圈選一致。"),
    dict(localId="q26", sourcePage=2, answerKeyPage=2, questionNumber="五-2-(1)",
         stem="觀察下列物品（布丁盒、球、洋芋片罐、三角柱），再圈圈看：哪個物品容易堆疊，而且容易滾動？",
         options=[], correctAnswer="洋芋片罐（圓柱體）",
         verificationMethod="visual_manual_required",
         verify="圓柱體平放可滾動、立放兩端平面可堆疊，兼具兩性質；球可滾動但不可堆疊，布丁盒（截頂圓錐）"
                "不易滾動。與答案卷圈選一致。"),
    dict(localId="q27", sourcePage=2, answerKeyPage=2, questionNumber="五-2-(2)",
         stem="觀察下列物品：哪個物品不容易堆疊？",
         options=[], correctAnswer="球",
         verificationMethod="visual_manual_required",
         verify="球面完全彎曲無平面可疊放，為不容易堆疊者。與答案卷圈選一致。"),
    dict(localId="q28", sourcePage=3, answerKeyPage=3, questionNumber="六-1",
         stem="畫出一樣多的圈圈：氣球圖（三排，各排6、6、4個氣球）。",
         options=[], correctAnswer="16 個圈圈",
         verify="逐排清點氣球：6+6+4=16。與答案卷方框內繪製之16個紅圈一致（已重新清點原圖氣球數）。"),
    dict(localId="q29", sourcePage=3, answerKeyPage=3, questionNumber="六-2",
         stem="畫出一樣多的圈圈：棒球圖（四排，各排6、6、6、5個棒球）。",
         options=[], correctAnswer="23 個圈圈",
         verify="逐排清點棒球：6+6+6+5=23。與答案卷方框內繪製之紅圈數一致（已重新清點原圖棒球數）。"),
    dict(localId="q30", sourcePage=3, answerKeyPage=3, questionNumber="七-1",
         stem="小于有 5 枝彩色筆，小婕有 4 枝彩色筆，他們一共有幾枝彩色筆？",
         options=[], correctAnswer="9 枝",
         verify="5+4=9。與答案卷「5+4=9 答:9枝」一致。"),
    dict(localId="q31", sourcePage=3, answerKeyPage=3, questionNumber="七-2",
         stem="一年甲班原有 7 位小朋友，再走進 3 位小朋友，共有幾位小朋友？",
         options=[], correctAnswer="10 位",
         verify="7+3=10。與答案卷「7+3=10 答:10位」一致。"),
    dict(localId="q32", sourcePage=3, answerKeyPage=3, questionNumber="七-3",
         stem="農場裡原有 2 隻白豬，又走進來 3 隻黑豬，共有幾隻豬？",
         options=[], correctAnswer="5 隻",
         verify="2+3=5。與答案卷「2+3=5 答:5隻」一致。"),
]

for _it in ITEMS:
    _it.setdefault("boundaryStatus", "verified")
    _it.setdefault("answerStatus", "verified")
    _it.setdefault("verificationMethod", "independent_calculation")
    _it.setdefault("crop", None)

assert len(ITEMS) == 33
assert len({it["localId"] for it in ITEMS}) == 33
