"""Regenerate zhuyin.json (string -> [[char, zhuyin], ...]) for every Chinese string the flash page shows.

Needs `pip install pypinyin` (only for this step; build.py itself has no dependency).
Always spot-check polyphones; add fixes to OVERRIDE.
"""
from pathlib import Path
import json
import re
from pypinyin import Style, pinyin
import build

# Taiwan school readings that pypinyin gets wrong in these short phrases.
OVERRIDE = {
    '和': ['ㄏㄢˋ'], '喔': ['ㄛ'], '犛牛': ['ㄇㄠˊ', 'ㄋㄧㄡˊ'], '一個': ['ㄧˊ', '˙ㄍㄜ'], '嗨': ['ㄏㄞ'], '哈囉': ['ㄏㄚ', 'ㄌㄨㄛ'],
    '哎喲': ['ㄞ', 'ㄧㄠ'], '假髮': ['ㄐㄧㄚˇ', 'ㄈㄚˇ'], '哎呀': ['ㄞ', 'ㄧㄚ'], '嘿': ['ㄏㄟ'],
}


HAN = re.compile(r'[\u4e00-\u9fff]')
TONE_MARKS = 'ˊˇˋ˙'


def tone_of(z):
    if not z:
        return None
    for mark, t in (('ˊ', 2), ('ˇ', 3), ('ˋ', 4), ('˙', 5)):
        if mark in z:
            return t
    return 1


def run_zhuyin(run):
    """Zhuyin for one run of Han characters (phrase-aware), neutral-tone dot placed before the syllable."""
    if run in OVERRIDE:
        return list(OVERRIDE[run])
    out = []
    for p in pinyin(run, style=Style.BOPOMOFO, heteronym=False):
        z = p[0]
        if z.endswith('˙'):
            z = '˙' + z[:-1]
        out.append(z)
    # 一 changes tone before another syllable (not as an ordinal such as 第一)
    for i, c in enumerate(run):
        if c == '一' and i + 1 < len(run) and not (i > 0 and run[i - 1] in '第十'):
            nxt = tone_of(out[i + 1])
            out[i] = 'ㄧˊ' if nxt in (4, 5) else 'ㄧˋ'
    return out


def zhuyin(s):
    if s in OVERRIDE:
        return [[c, z] for c, z in zip(s, OVERRIDE[s])]
    result = []
    for m in re.finditer(r'[\u4e00-\u9fff]+|[^\u4e00-\u9fff]', s):
        part = m.group()
        if HAN.match(part):
            result.extend([c, z] for c, z in zip(part, run_zhuyin(part)))
        else:
            result.append([part, ''])
    return result


if __name__ == '__main__':
    words = build.load_words()
    template = (build.here / 'template.html').read_text()
    strings = build.chinese_strings(words, template)
    table = {s: zhuyin(s) for s in strings}
    (build.here / 'zhuyin.json').write_text(json.dumps(table, ensure_ascii=False, indent=0) + '\n')
    print(len(table), 'strings')
    for s in strings[:400]:
        print(s, ' '.join(z for _, z in table[s] if z))
