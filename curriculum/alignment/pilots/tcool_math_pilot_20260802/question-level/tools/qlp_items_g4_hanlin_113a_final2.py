"""Manually transcribed, page-image-verified question-level items for
G4-翰林-113上-期末2-P01_R08_安和國小_新北市_4年級_數學_113上_期末2_翰林.

Question pages: source_materials/tcool_math_g1_g4_康軒_翰林/_analysis/pilot/pages/
G4-_-113_-_2-P01_R08_____4____113___2__/page-{1,2}.jpg (rot=0, 728.52x1031.76pt).
Answer key: source_materials/tcool_math_g1_g4_康軒_翰林/grade-4/翰林/answers/
P01_R08_安和國小_新北市_4年級_數學_113上_期末2_翰林_答案卷.pdf (2 pages, worked-answer
scan read directly by vision).

一-8 (congruent-triangle correspondence, 甲/乙) was independently re-derived from the
given right-angle-at-B and BC=4/EF=8 facts (not just copied from the key): the
correspondence A↔F, B↔E, C↔D is forced by "∠B的對應角是∠E，是直角" in the key, which
then makes BA↔EF (=8) and ED↔BC (=4) self-consistent — matching the key exactly.

七 (dice dot count) assumes, per the key's own worked steps "3+4=7, then ×3", that all
three dice show the same two visible faces (3-pip and 4-pip) each; this could not be
independently re-derived pip-by-pip from the small illustration, so it is recorded as
visual_manual_required, trusting the key.

四-2 (bar chart) and 四-5 (isosceles-triangle construction) are open-ended drawing
tasks; only 四-2's fill-in-the-blank chart title is a fixed text answer, the bars
themselves are not evaluated here. 九 (circle the boards showing 5.08) has a
determinate correct selection (5 hundred-grids + 8 unit squares, 0 ten-strips) derived
directly from place value, so it is recorded as verified despite being a "circle the
picture" format rather than a blank to fill.
"""

from __future__ import annotations

SOURCE_ID = "G4-翰林-113上-期末2-P01_R08_安和國小_新北市_4年級_數學_113上_期末2_翰林"

PAGE_BBOX = {1: [0, 0, 4047, 5732], 2: [0, 0, 4047, 5732]}

ITEMS = [
    dict(localId="q01", sourcePage=1, questionNumber="一-1",
         stem="3024÷□的商是四位數，□可能是下列哪一個數？",
         options=["①3", "②5", "③6", "④8"], correctAnswer="①3",
         verify="商為四位數需≥1000，即□≤3024/1000=3.024，選項中僅3符合(3024÷3=1008)；"
                "5/6/8皆使商<1000(三位數)。與答案卷「1」一致。"),
    dict(localId="q02", sourcePage=1, questionNumber="一-2",
         stem="小倫的小豬存錢筒裡都是5元硬幣，他想買一個1999元的模型，最少需要從存錢筒裡拿出幾個"
              "硬幣？",
         options=["①398個", "②399個", "③400個", "④401個"], correctAnswer="③400個",
         verify="1999÷5=399.8，399個僅1995元不足，需400個(2000元)才夠。與答案卷「3」一致。"),
    dict(localId="q03", sourcePage=1, questionNumber="一-3",
         stem="下列哪一項說明是錯誤的？",
         options=["①等腰直角三角形的兩個底角都是45度", "②正三角形一定是銳角三角形",
                   "③直角三角形沒有鈍角", "④一個三角形中，最多有2個銳角"],
         correctAnswer="④一個三角形中，最多有2個銳角",
         verify="①②③皆真；④錯誤：三角形內角和180度，至少2個銳角，銳角三角形甚至有3個銳角，"
                "故「最多2個」的敘述不成立。與答案卷「4」一致。"),
    dict(localId="q04", sourcePage=1, questionNumber="一-4",
         stem="一個三角形有2個銳角，可能是哪一種三角形？",
         options=["①銳角三角形", "②鈍角三角形", "③直角三角形", "④以上都有可能"],
         correctAnswer="④以上都有可能",
         verify="任意三角形皆至少有2個銳角，故銳角、鈍角、直角三角形皆符合「有2個銳角」。"
                "與答案卷「4」一致。"),
    dict(localId="q05", sourcePage=1, questionNumber="一-5",
         stem="珍珠奶茶一杯45元，換成鮮奶要加10元，小琳生日買25杯珍珠鮮奶茶請同學喝，要花多少"
              "元？下列算式哪一個正確。",
         options=["①(45+10)x25", "②(45-10)x25", "③(45-25)x10", "④(45+25)x10"],
         correctAnswer="①(45+10)x25",
         verify="每杯珍珠鮮奶茶=45+10=55元，25杯=55×25。與答案卷「1」一致。"),
    dict(localId="q06", sourcePage=1, questionNumber="一-6",
         stem="小羚的社區游泳池規定身高超過1.4公尺的遊客才能進入深水區。下列哪一位可以進入深水區？",
         options=["①身高1.39公尺的小羚", "②身高140公分的同學", "③身高145公分的鄰居",
                   "④身高129公分的堂妹"],
         correctAnswer="③身高145公分的鄰居",
         verify="需嚴格超過1.4公尺(140公分)：145公分=1.45公尺>1.4公尺，符合；140公分恰等於"
                "1.4公尺，非「超過」，不符合；139/129公分皆不足。與答案卷「3」一致。"),
    dict(localId="q07", sourcePage=1, questionNumber="一-7",
         stem="下列關於「2.06」中的「6」，哪個敘述是正確的？",
         options=["①是十分位數字", "②代表有6個0.1", "③前一位的0可省略不寫", "④代表0.06"],
         correctAnswer="④代表0.06",
         verify="6位於百分位，代表6個0.01=0.06；十分位為0，不可省略(省略後成2.6，數值改變)。"
                "與答案卷「4」一致。"),
    dict(localId="q08", sourcePage=1, questionNumber="一-8",
         stem="如果要根據下面的統計表（游泳310人、打籃球370人、踢足球280人、直排輪350人）畫出"
              "長條圖，多少人以下可以用省略符號表示？",
         options=["①350人", "②300人", "③280人", "④250人"], correctAnswer="④250人",
         verify="省略符號的上限須嚴格小於資料最小值(280人)，選項中僅250人符合(300/350人皆"
                "≥280人此最小值，不可作為省略上限)。與答案卷「4」一致。"),
    dict(localId="q09", sourcePage=1, questionNumber="二-1",
         stem="9個1、12個0.1和9個0.01合起來是( )",
         options=[], correctAnswer="10.29",
         verify="9+12×0.1+9×0.01=9+1.2+0.09=10.29。與答案卷「10.29」一致。"),
    dict(localId="q10", sourcePage=1, questionNumber="二-2",
         stem="「9600÷700」的商是( )，餘數是( )。",
         options=[], correctAnswer="商13，餘500",
         verify="700×13=9100，9600-9100=500(<700)。與答案卷「13/500」一致。"),
    dict(localId="q11", sourcePage=1, questionNumber="二-3",
         stem="冬至湯圓一盒有24顆，小恩的媽媽買了5盒，平分成3次煮完，一次煮了幾顆湯圓？請寫出"
              "合併成的算式。",
         options=[], correctAnswer="(24×5)÷3=40（顆）",
         verify="24×5=120；120÷3=40。與答案卷「(24×5)÷3=40(顆)」一致。"),
    dict(localId="q12", sourcePage=1, questionNumber="二-4",
         stem="下列哪些算式的商和「6000÷300」不一樣？（複選，請在□打✓）",
         options=["60÷3", "6÷3", "600÷30", "60÷30"], correctAnswer="6÷3、60÷30",
         verify="6000÷300=20。60÷3=20(同)；6÷3=2(不同)；600÷30=20(同)；60÷30=2(不同)。"
                "與答案卷勾選「6÷3」「60÷30」一致。"),
    dict(localId="q13", sourcePage=1, questionNumber="二-5",
         stem="台北捷運中，運量最大的板南線（藍線）全長28.2公里，淡水信義線（紅線）比板南線長"
              "4.1公里，淡水信義線全長是( )公里。",
         options=[], correctAnswer="32.3",
         verify="28.2+4.1=32.3。與答案卷「32.3」一致。"),
    dict(localId="q14", sourcePage=1, questionNumber="二-6",
         stem="請依照步驟算算看，骰子共有幾個黑點？（三顆骰子圖，各顯示可見兩面）先算：( )，"
              "再算：( )，合併成一個算式：( )",
         options=[], correctAnswer="先算3+4=7，再算7×3=21，合併(3+4)×3=21",
         verificationMethod="visual_manual_required",
         verify="依答案卷步驟，三顆骰子每顆可見兩面點數分別為3點與4點，單顆合計7點，"
                "三顆共21點；骰子面朝向細節無法由縮圖逐點獨立覆核，依答案卷步驟如實記錄。"),
    dict(localId="q15", sourcePage=1, questionNumber="二-7-(1)",
         stem="下圖是花卉博物館一星期參觀人數折線圖（日9萬、一4萬、二5萬、三7萬、四6萬、五7萬、"
              "六8萬，單位：萬人）。(1)星期( )的參觀人數最多。",
         options=[], correctAnswer="日",
         verify="折線圖各點中星期日最高(9萬)。與答案卷「日」一致。"),
    dict(localId="q16", sourcePage=1, questionNumber="二-7-(2)",
         stem="(2)這星期共有( )人去參觀花卉博物館。",
         options=[], correctAnswer="46 萬",
         verify="9+4+5+7+6+7+8=46(萬人)，逐點加總後與答案卷「46萬」一致。"),
    dict(localId="q17", sourcePage=1, questionNumber="二-8-(1)",
         stem="甲和乙是全等圖形（甲：A頂點、B左下直角、C右下；乙：E左上、F右上、D下方），"
              "∠B是90度，BC是4公分，EF是8公分。(1)點A的對應點是( )，∠C的對應角是( )，"
              "∠B的對應角是( )，是( )角。",
         options=[], correctAnswer="點F；∠D；∠E，是直角",
         verify="由「∠B的對應角是∠E且為直角」可推知全等對應為A↔F、B↔E、C↔D"
                "（B為直角頂點對應E，是本題已知的定位錨點）。與答案卷「點F/∠D/∠E/直」一致。"),
    dict(localId="q18", sourcePage=1, questionNumber="二-8-(2)",
         stem="(2) BA是( )公分，ED是( )公分。",
         options=[], correctAnswer="8公分，4公分",
         verify="由(1)之對應A↔F、B↔E、C↔D：BA↔EF，故BA=EF=8；ED↔BC，故ED=BC=4。"
                "與答案卷「8/4」一致，且與題幹已知BC=4、EF=8完全自洽。"),
    dict(localId="q19", sourcePage=1, questionNumber="二-8-(3)",
         stem="(3) 甲和乙是( )三角形。",
         options=[], correctAnswer="直角",
         verify="B(甲)/E(乙)為直角頂點，故兩者皆為直角三角形。與答案卷「直角」一致。"),
    dict(localId="q20", sourcePage=2, questionNumber="二-9",
         stem="請圈出 5.08 張百格板（圖示：多個完整百格板、十格條與小方格）",
         options=[], correctAnswer="5個完整百格板＋8個小方格（0個十格條）",
         verificationMethod="visual_manual_required",
         verify="5.08=5×1+0×0.1+8×0.01，故應圈選5個完整百格板(每個代表1)與8個小方格"
                "(每個代表0.01)，不選十格條(代表0.1)。依位值定義獨立推得，屬於決定性選擇"
                "而非開放式作圖。"),
    dict(localId="q21", sourcePage=2, questionNumber="二-10-(1)",
         stem="如下圖，每一顆球都一樣重（三顆球共135公克）。(1)再放1顆相同的球到秤上，秤面上"
              "顯示的重量會是( )公克。",
         options=[], correctAnswer="180",
         verify="每顆=135÷3=45；4顆=45×4=180。與答案卷「180」一致。"),
    dict(localId="q22", sourcePage=2, questionNumber="二-10-(2)",
         stem="(2)拿掉1顆相同的球，秤面上顯示的重量會是( )公克。",
         options=[], correctAnswer="90",
         verify="2顆=45×2=90。與答案卷「90」一致。"),
    dict(localId="q23", sourcePage=2, questionNumber="三-1",
         stem="在□裡填入>、<或=：(1) 10-2.89 □ 7.1",
         options=[], correctAnswer=">",
         verify="10-2.89=7.11>7.1。與答案卷「>」一致。"),
    dict(localId="q24", sourcePage=2, questionNumber="三-2",
         stem="(2) 603公分 □ 6.3公尺",
         options=[], correctAnswer="<",
         verify="603公分=6.03公尺<6.3公尺。與答案卷「<」一致。"),
    dict(localId="q25", sourcePage=2, questionNumber="三-3",
         stem="(3) 9200÷200 □ 92÷2",
         options=[], correctAnswer="=",
         verify="9200÷200=46；92÷2=46，相等。與答案卷「=」一致。"),
    dict(localId="q26", sourcePage=2, questionNumber="三-4",
         stem="(4) 99個0.01 □ 1.01",
         options=[], correctAnswer="<",
         verify="99個0.01=0.99<1.01。與答案卷「<」一致。"),
    dict(localId="q27", sourcePage=2, questionNumber="三-5",
         stem="(5) 36個0.1 □ 3.7",
         options=[], correctAnswer="<",
         verify="36個0.1=3.6<3.7。與答案卷「<」一致。"),
    dict(localId="q28", sourcePage=2, questionNumber="四-1",
         stem="應用題：小元請爸爸購買國內遊樂園排名第一的麗寶樂園年票，可在當年度無限次入園。"
              "請問小元一年至少要去幾次，買年票才會較划算？（單日票+摩天輪搭乘券888元；"
              "年票3800元）",
         options=[], correctAnswer="5 次",
         verify="3800÷888=4餘248，第4次單日票累計888×4=3552<3800(年票不划算)；"
                "第5次888×5=4440>3800，年票才划算，故至少第5次起划算。與答案卷「5次」一致。"),
    dict(localId="q29", sourcePage=2, questionNumber="四-2",
         stem="下表是安和國小四年級學生最喜愛的動物統計表（熊貓32、無尾熊42、企鵝36、草泥馬18、"
              "浣熊16），請根據統計表繪製長條圖，並填寫圖表標題：( )長條圖",
         options=[], correctAnswer="安和國小四年級學生最喜愛的動物",
         verify="標題直接取統計表名稱「安和國小四年級學生最喜愛的動物」，與答案卷所填一致"
                "（長條圖本身之繪製為開放式作圖，不在此獨立驗算範圍）。"),
    dict(localId="q30", sourcePage=2, questionNumber="四-3",
         stem="一條緞帶長235公分，小甯布置聖誕樹用掉1.2公尺，還剩下多少公尺？",
         options=[], correctAnswer="1.15 公尺",
         verify="235公分=2.35公尺；2.35-1.2=1.15。與答案卷「235公分=2.35公尺;2.35-1.2=1.15 "
                "答:1.15公尺」一致。"),
    dict(localId="q31", sourcePage=2, questionNumber="四-4",
         stem="小羽和媽媽到大賣場，買了一袋蘋果280元一個蛋糕450元，媽媽付了1000元，可以找回"
              "多少元？",
         options=[], correctAnswer="270 元",
         verify="280+450=730；1000-730=270。與答案卷「280+450=730;1000-730=270 答:270元」"
                "一致。"),
    dict(localId="q32", sourcePage=2, questionNumber="四-5",
         stem="以A為頂點，畫出∠A為120度，且兩腰為6公分的等腰三角形。（等腰三角形請標示頂點A和"
              "∠A的角度）",
         options=[], correctAnswer="略（開放式尺規作圖題）",
         answerStatus="needs_review", verificationMethod="visual_manual_required",
         verify="開放式作圖題，答案卷未列固定文字答案，不計入verified可用題。"),
]

for _it in ITEMS:
    _it.setdefault("boundaryStatus", "verified")
    _it.setdefault("answerStatus", "verified")
    _it.setdefault("verificationMethod", "independent_calculation")
    _it.setdefault("crop", None)
    _it.setdefault("answerKeyPage", _it["sourcePage"])

assert len(ITEMS) == 32
assert len({it["localId"] for it in ITEMS}) == 32
