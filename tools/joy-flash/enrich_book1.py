"""One-off: add flash-card metadata (pos, kid-friendly meaning, flash flag) to book1 lessons.json vocab.

pos: n v adj pron int prep conj art adv num phr   (alt: second possible pos)
kid: short Chinese meaning for a 7-year-old (no notes in brackets)
flash=False: names, sound words, sentences -- not drilled as sight words
sort=False: kept out of the noun/verb/adjective sorting game (ambiguous or function words)
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
path = root / 'source_materials/joy/book1/lessons.json'

# word.lower() -> (pos, kid meaning, extra flags)
META = {
 'hi': ('int', '嗨'), 'hello': ('int', '哈囉'), 'i': ('pron', '我'), 'you': ('pron', '你'), 'your': ('pron', '你的'),
 'am': ('v', '是', 'nosort'), 'is': ('v', '是', 'nosort'), 'are': ('v', '是', 'nosort'),
 'name': ('n', '名字'), 'what': ('pron', '什麼'), 'ouch': ('int', '哎喲'),
 'look': ('v', '看'), 'he': ('pron', '他'), 'she': ('pron', '她'), 'can': ('v', '會；可以', 'nosort'),
 'help': ('v', '幫忙'), "let's": ('v', '讓我們', 'nosort'), 'go': ('v', '去'),
 'listen': ('v', '聽'), 'good': ('adj', '好'), 'morning': ('n', '早上'), 'afternoon': ('n', '下午'),
 'evening': ('n', '晚上'), 'this': ('pron', '這個'), 'scarecrow': ('n', '稻草人'),
 'great': ('adj', '很棒'), 'want': ('v', '想要'), 'a': ('art', '一個'), 'brain': ('n', '頭腦'), 'heart': ('n', '心'),
 'draw': ('v', '畫'), 'color': ('v', '塗顏色', 'alt:n'), 'thank': ('v', '謝謝', 'nosort'), 'oops': ('int', '哎呀'),
 'sorry': ('adj', '對不起', 'nosort'), 'it': ('pron', '它'), 'ok': ('adj', '好', 'nosort'),
 'how': ('adv', '怎麼樣'), 'write': ('v', '寫'), 'be': ('v', '是', 'nosort'), 'fine': ('adj', '很好'),
 'and': ('conj', '和'), 'so-so': ('adj', '普普通通', 'nosort'),
 'hey': ('int', '嘿'), 'lion': ('n', '獅子'), 'up': ('adv', '向上'), 'wake up': ('phr', '醒來'),
 'us': ('pron', '我們'), 'van': ('n', '箱型車'), 'drive': ('v', '開車'), 'wig': ('n', '假髮'), 'wear': ('v', '穿；戴'),
 'scared': ('adj', '害怕'), 'courage': ('n', '勇氣'), 'stop': ('v', '停'), 'sing': ('v', '唱歌'), 'dance': ('v', '跳舞'),
 'fox': ('n', '狐狸'), 'fax': ('n', '傳真'), 'to': ('prep', '到'), 'yak': ('n', '犛牛'), 'yell': ('v', '大叫'),
 'at': ('prep', '在'), 'zip': ('v', '拉上', 'nosort'), 'zipper': ('n', '拉鍊'),
 'hurry up': ('phr', '快一點'), 'run': ('v', '跑'), 'walk': ('v', '走路'), 'on time': ('phr', '準時'),
 'my': ('pron', '我的'), 'smart': ('adj', '聰明'), 'mad': ('adj', '生氣'), 'happy': ('adj', '開心'), 'tired': ('adj', '累'),
 'one': ('num', '一'), 'two': ('num', '二'), 'three': ('num', '三'), 'four': ('num', '四'), 'five': ('num', '五'), 'six': ('num', '六'),
 'shy': ('adj', '害羞'), 'too': ('adv', '也'),
 'seven': ('num', '七'), 'eight': ('num', '八'), 'nine': ('num', '九'), 'ten': ('num', '十'), 'eleven': ('num', '十一'), 'twelve': ('num', '十二'),
 'hat': ('n', '帽子'), 'blue': ('adj', '藍色', 'alt:n'), 'green': ('adj', '綠色', 'alt:n'), 'red': ('adj', '紅色', 'alt:n'), 'yellow': ('adj', '黃色', 'alt:n'),
 'white': ('adj', '白色', 'alt:n'), 'black': ('adj', '黑色', 'alt:n'), 'right': ('adj', '對', 'nosort'),
 'point to': ('phr', '指向'), 'circle': ('v', '圈起來', 'alt:n'), 'show': ('v', '給你看'), 'me': ('pron', '我'),
 'touch': ('v', '摸'), 'try': ('v', '試試看'), 'again': ('adv', '再一次'),
 'come': ('v', '來'), 'in': ('prep', '在裡面'), 'that': ('pron', '那個'), 'book': ('n', '書'), 'marker': ('n', '彩色筆'), 'bag': ('n', '袋子'),
 'eraser': ('n', '橡皮擦'), 'ruler': ('n', '尺'), 'pencil': ('n', '鉛筆'),
 'for': ('prep', '給'), 'an': ('art', '一個'), 'apple': ('n', '蘋果'), 'banana': ('n', '香蕉'),
 'oh': ('int', '喔'), 'no': ('int', '不'), 'stand up': ('phr', '起立'), 'sit down': ('phr', '坐下'),
 'here': ('adv', '這裡'), 'back': ('adv', '回來'),
}
ORANGE = {14: ('adj', '橘色'), 18: ('n', '柳橙'), 19: ('n', '柳橙')}
# Not drilled as sight words: character names, sound effects, whole sentences.
SKIP = {'nick', 'abby', 'oz', 'fifi', 'tin man', 'boohoo', 'squeak', 'roar', 'achoo', 'heigh-ho', 'dum-dum', 'be good.', 'be on time.'}

data = json.loads(path.read_text())
missing = []
for u in data:
    for v in u['vocab']:
        key = v['word'].lower()
        for k in ('pos', 'alt', 'kid', 'flash', 'sort'):
            v.pop(k, None)
        if key in SKIP:
            v['flash'] = False
            continue
        if key == 'orange':
            pos, kid = ORANGE[u['unit']]
            meta = (pos, kid, 'nosort')
        else:
            meta = META.get(key)
        if not meta:
            missing.append((u['unit'], v['word']))
            continue
        v['pos'], v['kid'] = meta[0], meta[1]
        for flag in meta[2:]:
            if flag == 'nosort':
                v['sort'] = False
            elif flag.startswith('alt:'):
                v['alt'] = flag[4:]
                v['sort'] = False
if missing:
    raise SystemExit(f'missing meta: {missing}')
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
n = sum(1 for u in data for v in u['vocab'] if v.get('pos'))
print('enriched', n, 'of', sum(len(u['vocab']) for u in data))
