const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const imageNames = fs.readdirSync(path.join(root, '錯題')).filter(name => name.endsWith('.png')).sort();

function extractConstArray(name) {
  const startToken = `const ${name} = [`;
  const start = html.indexOf(startToken);
  if (start === -1) throw new Error(`${name} was not found`);
  let i = start + `const ${name} = `.length;
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) {
        return vm.runInNewContext(`(${html.slice(start + `const ${name} = `.length, i + 1)})`);
      }
    }
  }
  throw new Error(`${name} array did not close`);
}

const mistakes = extractConstArray('ORIGINAL_MISTAKES');
const names = mistakes.map(item => item.file).sort();
const missing = imageNames.filter(name => !names.includes(name));
const extra = names.filter(name => !imageNames.includes(name));
const answerKnown = mistakes.filter(item => item.answer && item.answerType);
const autoCheckable = mistakes.filter(item => ['choice', 'text'].includes(item.answerType));

if (!html.includes('startOriginalMistakes()')) throw new Error('original mistake entry button missing');
if (!html.includes('function startOriginalMistakes()')) throw new Error('startOriginalMistakes function missing');
if (!html.includes('function generateOriginalMistakeQuestion()')) throw new Error('original mistake generator missing');
if (!html.includes('function reviewableOriginalMistakes()')) throw new Error('reviewable original mistake filter missing');
if (!html.includes('originalMistakeOrder = reviewableOriginalMistakes();')) throw new Error('original mistake practice does not use filtered 29-question list');
if (html.includes('localStorage.clear()')) throw new Error('math reset must not erase unrelated localStorage data');
if (missing.length || extra.length) {
  throw new Error(`screenshot coverage mismatch: missing=${JSON.stringify(missing)}, extra=${JSON.stringify(extra)}`);
}
if (answerKnown.length < 17) throw new Error(`expected at least 17 answer-known mistakes, got ${answerKnown.length}`);
if (autoCheckable.length < 15) throw new Error(`expected at least 15 auto-checkable mistakes, got ${autoCheckable.length}`);

console.log(JSON.stringify({
  screenshots: imageNames.length,
  originalMistakes: mistakes.length,
  answerKnown: answerKnown.length,
  autoCheckable: autoCheckable.length,
  pendingAnswers: mistakes.length - answerKnown.length,
  practiceQuestions: autoCheckable.length
}, null, 2));
