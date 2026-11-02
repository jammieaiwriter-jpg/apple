"""Build joy/flash/index.html (Joy 認字閃卡) from source_materials/joy/book*/lessons.json.

Usage: python3 tools/joy-flash/build.py            # build
       python3 tools/joy-flash/make_zhuyin.py      # refresh zhuyin.json after changing any Chinese text
Books listed in BOOKS are the ones shipped to the child; add 2 here when book 2 is ready (needs pos/kid via enrich).
"""
from pathlib import Path
import json
import re
import sys

root = Path(__file__).resolve().parents[2]
here = Path(__file__).parent
BOOKS = [1]

# Introduced first: tiny high-frequency words the child must recognise instantly.
SIGHT = ['i', 'you', 'am', 'is', 'are', 'he', 'she', 'it', 'my', 'your', 'this', 'that', 'what', 'how', 'a', 'an', 'can',
         'good', 'and', 'to', 'at', 'in', 'for', 'me', 'us', 'too', 'no', 'here', 'back', 'again', 'up', 'be', 'hi', 'hello', 'oh']
# Look-alike words that are not in the book, only used as wrong answers.
FOILS = ('art ate car cap cat cut if of on off or out bad bed big bit but boy day did do dog end eat far fat get got had has '
         'him his hot let man may new not now old our put ran sat see set sit the was way who why win yes zoo ant').split()
# Words that sound the same: never offered together in a listening question.
HOMOPHONES = [['to', 'too', 'two'], ['for', 'four'], ['right', 'write'], ['eight', 'ate'], ['one', 'won'], ['no', 'know'],
              ['here', 'hear'], ['be', 'bee'], ['i', 'eye'], ['see', 'sea'], ['red', 'read'], ['hi', 'high'], ['our', 'hour']]


def sentence_for(word, lines):
    pat = re.compile(r"(?<![A-Za-z'])" + re.escape(word) + r"(?![A-Za-z'])", re.I)
    cands = [l for l in lines if pat.search(l['text'])]
    multi = [l for l in cands if len(l['text'].split()) >= 2]
    pool = multi or cands
    if not pool:
        return None
    best = min(pool, key=lambda l: (len(l['text']), l['text']))
    return {'en': best['text'], 'zh': best.get('zh', '')}


def load_words():
    words, seen = [], {}
    for book in BOOKS:
        lessons = json.loads((root / f'source_materials/joy/book{book}/lessons.json').read_text())
        lines = [l for u in lessons for l in u['dialogueLines']]
        for u in lessons:
            for v in u['vocab']:
                if v.get('flash') is False or not v.get('pos'):
                    continue
                key = v['word'].lower()
                if key in seen:
                    old = seen[key]
                    if v['kid'] not in old['zh']:
                        old['zh'] += '；' + v['kid']
                        old['sort'] = False
                    continue
                shown = v['word'].lower() if v['word'][:1].isupper() and v['word'] not in ('I', 'OK') else v['word']
                w = {'key': key, 'word': shown, 'zh': v['kid'], 'kk': v.get('kk', ''), 'pos': v['pos'], 'alt': v.get('alt', ''),
                     'sort': v.get('sort', True) is not False and v['pos'] in ('n', 'v', 'adj') and not v.get('alt'),
                     'book': book, 'unit': u['unit'], 'sent': sentence_for(v['word'], lines)}
                if v.get('say') and v['say'] != shown:
                    w['say'] = v['say']
                seen[key] = w
                words.append(w)
    rank = {k: i for i, k in enumerate(SIGHT)}
    for i, w in enumerate(words):
        w['order'] = (rank[w['key']] if w['key'] in rank else 100 + w['book'] * 100 + w['unit']) * 1000 + i
    words.sort(key=lambda w: w['order'])
    return words


UI_RE = re.compile(r"zy\('([^']*)'\)")


def chinese_strings(words, template):
    out = set(UI_RE.findall(template))
    for w in words:
        out.add(w['zh'])
        if w['sent'] and w['sent']['zh']:
            out.add(w['sent']['zh'])
    return sorted(s for s in out if re.search(r'[一-鿿]', s))


def build():
    words = load_words()
    template = (here / 'template.html').read_text()
    zy = json.loads((here / 'zhuyin.json').read_text())
    need = chinese_strings(words, template)
    missing = [s for s in need if s not in zy]
    if missing:
        sys.exit(f'zhuyin.json is missing {len(missing)} strings (run make_zhuyin.py): {missing[:5]}')
    ruby = {}
    for s in need:
        html = ''
        for ch, z in zy[s]:
            html += f'<ruby>{ch}<rt>{z}</rt></ruby>' if z else ch
        ruby[s] = html
    data = {'words': words, 'foils': FOILS, 'homophones': HOMOPHONES, 'books': BOOKS}
    j = lambda x: json.dumps(x, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    html = template.replace('__FLASH_DATA__', j(data)).replace('__RUBY__', j(ruby))
    out = root / 'joy/flash'
    out.mkdir(parents=True, exist_ok=True)
    (out / 'index.html').write_text(html)
    print(f'Built {len(words)} cards, {len(ruby)} ruby strings ->', out / 'index.html')


if __name__ == '__main__':
    build()
