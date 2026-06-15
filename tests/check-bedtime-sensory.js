// Advisory sensory-imagery lint for bedtime stories.
// Prints a per-story report and warnings, but never fails the build (exit 0),
// unless a story file cannot be parsed. Use it as a writing aid, not a gate.
const fs = require('fs');
const path = require('path');

const storiesDir = path.resolve(__dirname, '..', 'bedtime/stories');

const SENSES = {
  視覺: ['光', '亮', '閃', '色', '紅', '藍', '黃', '綠', '金', '銀', '白', '黑', '影', '月', '星', '看', '望', '暗', '晶', '映', '照', '橘', '波光', '霞'],
  聽覺: ['聲', '響', '聽', '唱', '啪', '嗒', '叮', '咚', '沙', '咕', '嘩', '滴', '哼', '蟲鳴', '怦', '撲通', '唏嗦'],
  觸覺: ['涼', '暖', '軟', '濕', '乾', '摸', '碰', '抱', '毛', '滑', '冰', '熱', '溫', '風', '緊'],
  嗅覺: ['香', '味道', '聞', '氣味', '清香', '氣息'],
  味覺: ['甜', '嚐', '嚼', '酸', '苦', '點心', '莓', '果', '汁'],
};
const BODY = ['心裡', '胸口', '肩膀', '心跳', '怦', '鬆', '沉', '暖暖', '呼吸', '吸一口', '緊張', '放鬆', '輕飄飄', '眼皮'];

const has = (text, words) => words.some(w => text.includes(w));

const files = fs.readdirSync(storiesDir)
  .filter(name => /^week\d+(-\d+)?\.json$/.test(name))
  .sort();

let storiesWithWarnings = 0;
files.forEach(name => {
  let story;
  try {
    story = JSON.parse(fs.readFileSync(path.join(storiesDir, name), 'utf8'));
  } catch (err) {
    console.error(`PARSE ERROR ${name}: ${err.message}`);
    process.exitCode = 1;
    return;
  }
  const sections = story.sections || [];
  const all = sections.map(s => s.text).join('');
  const senses = Object.keys(SENSES).filter(k => has(all, SENSES[k]));
  const warnings = [];
  if (senses.length < 4) warnings.push(`只觸及 ${senses.length} 種感官（建議至少 4）`);
  if (!has(all, BODY)) warnings.push('全篇缺少身體感受詞');
  sections.forEach((section, i) => {
    const visual = has(section.text, SENSES.視覺);
    const soundTouch = has(section.text, SENSES.聽覺) || has(section.text, SENSES.觸覺);
    if (!visual) warnings.push(`第${i + 1}段缺畫面（視覺）`);
    if (!soundTouch) warnings.push(`第${i + 1}段缺聲音或觸感`);
  });
  const tag = warnings.length ? '⚠' : '✓';
  console.log(`${tag} ${name}  感官:[${senses.join('/')}]`);
  warnings.forEach(w => console.log(`    - ${w}`));
  if (warnings.length) storiesWithWarnings += 1;
});

console.log(`\n助言：${files.length} 篇，${storiesWithWarnings} 篇有提醒（此檢查不阻擋發布）。`);
