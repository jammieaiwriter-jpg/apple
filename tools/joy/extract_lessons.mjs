// 從既有的 20 個 review 頁抽出「純資料」，存成單一資料檔，供 generate_joy_pages 使用。
// 抽取後必須用回填比對驗證無損（見 verify_joy_pages.mjs）。
import fs from 'fs'; import vm from 'vm'; import path from 'path';
const JOY = '/Users/emma/02_小孩教育/Apple/joy';
const OUT = '/Users/emma/02_小孩教育/Apple/tools/joy/joy_lessons_data.json';
const KEYS = ['dialogueLines','vocab','phonics','grammar','beOptions','talkPairs'];

const units = [], problems = [];
for (let n = 1; n <= 20; n++) {
  const f = path.join(JOY, `unit${n}-review.html`);
  if (!fs.existsSync(f)) { problems.push(`unit${n}-review.html 不存在`); continue; }
  const html = fs.readFileSync(f, 'utf8');
  const ctx = {}; vm.createContext(ctx);
  let ok = true;
  for (const k of KEYS) {
    const m = html.match(new RegExp(`var\\s+${k}\\s*=\\s*`));
    if (!m) { problems.push(`unit${n} 缺 ${k}`); ok = false; continue; }
    const rest = html.slice(m.index + m[0].length);
    const end = rest.search(/;\s*\n\s*(var |function |\/\* |const )/);
    const expr = rest.slice(0, end < 0 ? rest.length : end);
    try { ctx[k] = vm.runInContext('(' + expr + ')', ctx); }
    catch (e) { problems.push(`unit${n} ${k} 解析失敗: ${e.message.slice(0,70)}`); ok = false; }
  }
  if (ok) {
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    units.push({ unit: n, title, ...Object.fromEntries(KEYS.map(k => [k, ctx[k]])) });
  }
}
fs.writeFileSync(OUT, JSON.stringify(units, null, 2));
console.log(`抽出 ${units.length}/20 課 → ${OUT}`);
console.log('問題:', problems.length ? problems : '無');
units.forEach(u => console.log(
  `  unit${String(u.unit).padStart(2)}  對話${String(u.dialogueLines.length).padStart(2)}` +
  ` 單字${String(u.vocab.length).padStart(2)}` +
  ` 發音${String((u.phonics||[]).length).padStart(2)}` +
  ` 文法${String((u.grammar||[]).length).padStart(2)}` +
  ` 配對${String((u.talkPairs||[]).length).padStart(2)}`));
