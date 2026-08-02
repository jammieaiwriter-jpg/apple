#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Apple 小一數學 — 矩陣無限生題引擎（從 Bobo 國中版精簡移植）。

移植來源（唯讀參考，未修改）：
  /Users/emma/02_小孩教育/Bobo/考前任務包系統/國中_Bobo/tools/matrix_gen/generate.py

精簡內容（依 BUILD_CONTRACT.md §4.2、任務指示）：
  - 拿掉 Fraction／根式／LaTeX／國中專用 constraints 物件。
    小一範圍全部是 0-10 整數與字串代碼，直接用 Python int/str 求值即可。
  - 模板欄位精簡為：templateId / skillId / mode / difficulty / stem /
    params / reject / (可選 derived) / answer / distractors / hints /
    figureSpec（可選） / verify（單一布林運算式字串，而非物件）。
  - verify 是模板作者的責任：必須用跟 answer.formula 不同的計算路徑
    重新驗算一次，engine 只負責「跑過才收，跑不過就整批中止」。

保留的核心機制（跟國中版一致）：
  - 參數空間取樣：int_range（均勻整數）、choice（含結構化值，如陣列/物件）
  - 拒絕取樣 reject：任一條件成立就重抽，不硬塞不合理的題（如和超過 10）
  - 答案公式 / 干擾選項公式求值（含錯因 why）
  - 獨立驗算 verify：任何一題沒通過就丟 AssertionError 整批中止，
    不可靜默跳過 —— 代表模板本身寫錯，要修模板，不是吞掉這題。
  - figureSpec 參數代入：把 "a" 這種參數名字串換成抽到的實際值

CLI：
  python3 generate.py <模板檔或目錄> [<模板檔或目錄> ...] --n 10 \
      [--seed 42] [--out output/preview.html]

輸出：
  <--out 所在目錄>/generated_items.json   本次生成的題目 JSON 陣列
  <--out 路徑>                            人工目視檢查用 HTML 預覽頁
                                           （預設 tools/matrix_gen/output/preview.html）
"""
import os
import sys
import json
import glob
import random
import hashlib
import argparse

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_OUT = os.path.join(HERE, "output", "preview.html")

# 公式裡允許用的安全函式（夠小一用：最大最小、絕對值、長度、四捨五入、序列處理）
SAFE_BUILTINS = {
    "max": max, "min": min, "abs": abs, "len": len,
    "int": int, "round": round, "sum": sum,
    "range": range, "sorted": sorted, "list": list, "set": set,
    "any": any, "all": all, "str": str, "enumerate": enumerate,
}


class TemplateError(Exception):
    """模板本身寫錯（欄位缺漏、verify 沒過等），要修模板不是重抽。"""


def eval_formula(formula: str, env: dict):
    """以模板作者提供的公式字串求值。公式來自本機模板檔，非使用者輸入。"""
    # 一律當成 globals 傳，不要用 locals：在 eval 裡建立的 lambda 與生成式
    # 只會查 globals，放 locals 會出現 "NameError: name 'vals' is not defined"。
    full_env = dict(env)
    full_env.update(SAFE_BUILTINS)
    full_env["__builtins__"] = {}
    return eval(formula, full_env)


def sample_params(params: dict, rng: random.Random) -> dict:
    out = {}
    for name, spec in params.items():
        t = spec.get("type")
        if t == "int_range":
            out[name] = rng.randint(spec["min"], spec["max"])
        elif t == "choice":
            out[name] = rng.choice(spec["values"])
        else:
            raise TemplateError(
                f"未知參數型別: {t!r}（小一引擎只支援 int_range / choice，"
                f"分數/根式等國中專用型別不移植）"
            )
    return out


def substitute_figure(spec, env: dict):
    """遞迴把 figureSpec 裡等於某參數名稱的字串換成實際值；其餘原樣保留。"""
    if isinstance(spec, str):
        return env[spec] if spec in env else spec
    if isinstance(spec, list):
        return [substitute_figure(v, env) for v in spec]
    if isinstance(spec, dict):
        return {k: substitute_figure(v, env) for k, v in spec.items()}
    return spec


def qid_for(tpl: dict, p: dict) -> str:
    """以全部參數做唯一鍵（跟 Bobo 版一樣的作法，方便同 seed 重現、去重）。"""
    key = repr(sorted((k, repr(p[k])) for k in p))
    h = hashlib.md5(key.encode("utf-8")).hexdigest()[:8]
    scal = []
    for k in sorted(p):
        v = p[k]
        if isinstance(v, bool):
            continue
        if isinstance(v, int):
            scal.append(f"{k}{v}")
    slug = "_".join(scal)[:40]
    return f"{tpl['templateId']}-{slug}-{h}" if slug else f"{tpl['templateId']}-{h}"


REQUIRED_FIELDS = [
    "templateId", "skillId", "mode", "difficulty", "stem",
    "params", "answer", "distractors", "hints", "verify",
]


def validate_template_shape(tpl: dict):
    missing = [f for f in REQUIRED_FIELDS if f not in tpl]
    if missing:
        raise TemplateError(f"[{tpl.get('templateId', '?')}] 缺少必填欄位: {missing}")
    if len(tpl.get("hints", [])) != 3:
        raise TemplateError(
            f"[{tpl['templateId']}] hints 必須是三層遞進（觀察/方法/答案），"
            f"目前是 {len(tpl.get('hints', []))} 層"
        )
    for d in tpl["distractors"]:
        if "formula" not in d or "why" not in d:
            raise TemplateError(
                f"[{tpl['templateId']}] 每個 distractor 都要有 formula 與 why "
                f"（why 是錯題診斷的來源，不可省略）"
            )
    if not isinstance(tpl["verify"], str) or not tpl["verify"].strip():
        raise TemplateError(f"[{tpl['templateId']}] verify 必須是非空的布林運算式字串")
    if tpl["verify"].strip() == tpl["answer"]["formula"].strip():
        raise TemplateError(
            f"[{tpl['templateId']}] verify 不可以跟 answer.formula 逐字相同 —— "
            f"要用不同的計算路徑重新驗算一次"
        )


def build_one(tpl: dict, rng: random.Random):
    """嘗試生成一題；不符 reject 條件或選項湊不滿 4 個互異值就回 None 重抽。"""
    p = sample_params(tpl["params"], rng)

    # 前置過濾（如「和不可超過 10」）
    for expr in tpl.get("reject", []):
        if eval_formula(expr, p):
            return None

    # 衍生量（併入參數，供題幹/公式/提示/verify 引用）
    for name, expr in tpl.get("derived", {}).items():
        p[name] = eval_formula(expr, p)

    answer = eval_formula(tpl["answer"]["formula"], p)

    # 誘答（可引用 answer）；跟已收錄的值撞號就跳過這個誘答
    options = [answer]
    kept = []
    env_d = dict(p, answer=answer)
    for d in tpl["distractors"]:
        val = eval_formula(d["formula"], env_d)
        if val in options:
            continue
        options.append(val)
        kept.append({"value": val, "why": d["why"]})
    if len(options) < 4:
        return None  # 湊不滿四個互異選項，重抽參數

    # ---- 獨立驗算：verify 用跟 answer.formula 不同的路徑重新確認 ----
    env_v = dict(p, answer=answer)
    passed = eval_formula(tpl["verify"], env_v)
    if not passed:
        raise TemplateError(
            f"[{tpl['templateId']}] verify 沒通過！\n"
            f"  verify   = {tpl['verify']!r}\n"
            f"  params   = {p}\n"
            f"  answer   = {answer!r}\n"
            f"  這代表模板的 answer.formula 或 verify 寫錯了，不是資料問題 —— 要修模板。"
        )

    vals = [answer] + [d["value"] for d in kept[:3]]
    why_by_value = {d["value"]: d["why"] for d in kept[:3]}
    rng.shuffle(vals)
    letters = "ABCD"
    correct_letter = letters[vals.index(answer)]
    unit = tpl.get("answer", {}).get("unit", "")

    def render_val(v):
        s = str(v)
        return f"{s} {unit}".rstrip() if unit else s

    options_out = []
    for i, v in enumerate(vals):
        options_out.append({
            "letter": letters[i],
            "text": render_val(v),
            "value": v if not isinstance(v, (list, dict)) else str(v),
            "correct": (v == answer),
            "why": None if v == answer else why_by_value.get(v),
        })

    fmt_env = dict(p, answer=answer)
    stem = tpl["stem"].format(**fmt_env)
    hints = [h.format(**fmt_env) for h in tpl["hints"]]

    fig = tpl.get("figureSpec")
    figure_out = substitute_figure(fig, fmt_env) if fig else None

    qid = qid_for(tpl, p)
    item = {
        "itemId": qid,
        "templateId": tpl["templateId"],
        "skillId": tpl["skillId"],
        "mode": tpl["mode"],
        "difficulty": tpl["difficulty"],
        "stem": stem,
        "options": options_out,
        "answerLetter": correct_letter,
        "answerValue": render_val(answer),
        "hints": hints,
        "figureSpec": figure_out,
        "params": {k: v for k, v in p.items()},
        "verified": True,
    }
    return item


def param_space_size(params: dict):
    """參數空間的理論上限。無法估算（有連續型參數）時回傳 None。"""
    total = 1
    for spec in params.values():
        t = spec.get("type")
        if t == "int_range":
            total *= max(0, spec["max"] - spec["min"] + 1)
        elif t == "choice":
            total *= len(spec["values"])
        else:
            return None
    return total


def gen_for_template(tpl: dict, n: int, rng: random.Random):
    validate_template_shape(tpl)
    items, seen, tries = [], set(), 0
    max_tries = max(n * 500, 2000)
    while len(items) < n and tries < max_tries:
        tries += 1
        q = build_one(tpl, rng)
        if not q or q["itemId"] in seen:
            continue
        seen.add(q["itemId"])
        items.append(q)

    if len(items) < n:
        space = param_space_size(tpl["params"])
        # 分兩種情況：參數空間本來就小於 n（模板設計如此，不是錯），
        # 跟 reject 太嚴格／干擾選項湊不出來（模板要修）。
        if space is not None and space <= n:
            print(
                f"[空間上限] {tpl['templateId']}: 參數空間只有 {space} 種組合，"
                f"生出 {len(items)} 題已是全部。要更多變化請加參數或另寫一個模板。"
            )
            return items, tries
        raise TemplateError(
            f"[{tpl['templateId']}] 只生出 {len(items)}/{n} 題（試了 {tries} 次），"
            f"但參數空間有 {space if space is not None else '未知'} 種組合。"
            f"reject 條件太嚴格，或干擾選項跟正解重複湊不出四個相異選項 —— 請修模板。"
        )
    return items, tries


def write_preview(items, out_html_path):
    def esc(s):
        return (str(s).replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;"))

    rows = []
    for q in items:
        opt_lines = "".join(
            f'<li class="{"correct" if o["correct"] else "wrong"}">'
            f'({o["letter"]}) {esc(o["text"])}'
            + (f'<span class="why">why: {esc(o["why"])}</span>' if o["why"] else "")
            + "</li>"
            for o in q["options"]
        )
        hint_lines = "".join(f"<li>{esc(h)}</li>" for h in q["hints"])
        fig_html = (f'<pre class="fig">{esc(json.dumps(q["figureSpec"], ensure_ascii=False, indent=2))}</pre>'
                    if q["figureSpec"] else '<div class="nofig">（此技能無圖）</div>')
        rows.append(f'''<div class="card">
  <div class="tag">{esc(q["templateId"])} · {esc(q["skillId"])} · {esc(q["mode"])} · 難度{q["difficulty"]}</div>
  <div class="body">
    <div class="figcol">{fig_html}</div>
    <div class="qcol">
      <p class="stem">{esc(q["stem"])}</p>
      <ul class="opts">{opt_lines}</ul>
      <p class="ans">正解：({q["answerLetter"]}) {esc(q["answerValue"])} · 已通過 verify</p>
      <details><summary>提示（三層）</summary><ol class="hints">{hint_lines}</ol></details>
      <details><summary>params</summary><pre>{esc(json.dumps(q["params"], ensure_ascii=False))}</pre></details>
    </div>
  </div>
</div>''')

    html = f'''<!doctype html><html lang="zh-Hant"><meta charset="utf-8">
<title>Apple 小一矩陣生題預覽（共 {len(items)} 題）</title>
<style>
 body{{font-family:'PingFang TC','Microsoft JhengHei',sans-serif;background:#f6f7f9;margin:24px;color:#111}}
 h1{{font-size:20px}}
 .card{{background:#fff;border-radius:10px;padding:14px 18px;margin:14px 0;box-shadow:0 1px 4px rgba(0,0,0,.06)}}
 .tag{{font-size:12px;color:#2563eb;margin-bottom:8px}}
 .body{{display:flex;gap:18px;align-items:flex-start}}
 .figcol{{flex:0 0 260px}}
 .fig{{background:#f0f4ff;font-size:11px;padding:8px;border-radius:6px;max-height:220px;overflow:auto}}
 .nofig{{color:#999;font-size:12px}}
 .qcol{{flex:1}}
 .stem{{font-size:16px;font-weight:600}}
 .opts{{list-style:none;padding:0;margin:8px 0}}
 .opts li{{padding:4px 8px;border-radius:6px;margin:2px 0}}
 .opts li.correct{{background:#dcfce7;font-weight:600}}
 .opts li.wrong{{background:#fafafa}}
 .why{{color:#b91c1c;font-size:12px;margin-left:8px}}
 .ans{{color:#16a34a;font-weight:600}}
 .hints li{{margin:4px 0}}
</style>
<h1>Apple 小一矩陣生題預覽 — 共 {len(items)} 題（全部通過 verify）</h1>
{''.join(rows)}
</html>'''
    os.makedirs(os.path.dirname(out_html_path), exist_ok=True)
    with open(out_html_path, "w", encoding="utf-8") as f:
        f.write(html)


def collect_template_paths(args_paths):
    paths = []
    for p in args_paths:
        if os.path.isdir(p):
            paths.extend(sorted(glob.glob(os.path.join(p, "*.json"))))
        else:
            paths.append(p)
    return paths


def main():
    ap = argparse.ArgumentParser(description="Apple 小一矩陣無限生題引擎")
    ap.add_argument("templates", nargs="+", help="模板 JSON 檔或含模板的目錄")
    ap.add_argument("--n", type=int, default=10, help="每個模板生成幾題（預設 10）")
    ap.add_argument("--seed", type=int, default=None, help="亂數種子，固定後可重現")
    ap.add_argument("--out", default=DEFAULT_OUT, help="HTML 預覽輸出路徑")
    args = ap.parse_args()

    out_html = args.out
    out_dir = os.path.dirname(os.path.abspath(out_html))
    out_json = os.path.join(out_dir, "generated_items.json")

    rng = random.Random(args.seed)
    template_paths = collect_template_paths(args.templates)
    if not template_paths:
        print("找不到任何模板檔。", file=sys.stderr)
        return 1

    combined = []
    summary = []
    for path in template_paths:
        with open(path, encoding="utf-8") as f:
            tpl = json.load(f)
        items, tries = gen_for_template(tpl, args.n, rng)
        combined.extend(items)
        summary.append((tpl["templateId"], len(items), tries))
        print(f"[OK] {tpl['templateId']}: 生成 {len(items)} 題（嘗試 {tries} 次），全部通過 verify")

    os.makedirs(out_dir, exist_ok=True)
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)
    write_preview(combined, out_html)

    print("\n—— 統計 ——")
    print(f"   模板數：{len(summary)}　題目總數：{len(combined)}（全部通過 verify，無靜默跳過）")
    print(f"   題目 JSON：{out_json}")
    print(f"   預覽 HTML：{out_html}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except TemplateError as e:
        print(f"\n[FATAL] {e}", file=sys.stderr)
        sys.exit(1)
