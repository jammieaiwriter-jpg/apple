const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const reviewPath = path.join(root, 'exam-review.html');

function extractArray(html, name) {
  const token = `const ${name} = [`;
  const start = html.indexOf(token);
  if (start === -1) throw new Error(`${name} not found`);
  let i = start + `const ${name} = `.length;
  let depth = 0, inString = false, quote = '', escaped = false;
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
      if (depth === 0) return vm.runInNewContext(`(${html.slice(start + `const ${name} = `.length, i + 1)})`);
    }
  }
  throw new Error(`${name} did not close`);
}

if (!fs.existsSync(reviewPath)) throw new Error('exam-review.html missing');
const mistakes = extractArray(indexHtml, 'ORIGINAL_MISTAKES');
const verified = mistakes.filter(item => item.answer && ['choice', 'text'].includes(item.answerType));
const reviewHtml = fs.readFileSync(reviewPath, 'utf8');
const reviewQuestions = extractArray(reviewHtml, 'EXAM_REVIEW_QUESTIONS');
const reviewFiles = new Set(reviewQuestions.map(q => q.file));
const missing = verified.filter(q => !reviewFiles.has(q.file));
const bad = reviewQuestions.filter(q => !q.answer || q.answerType === 'pending' || q.answerType === 'duplicate');

if (missing.length) throw new Error(`verified questions missing from exam review: ${missing.map(q => q.file).join(', ')}`);
if (bad.length) throw new Error(`non-verified questions included: ${bad.map(q => q.file).join(', ')}`);
if (!reviewHtml.includes('renderStepAnswer')) throw new Error('step answer UI missing');
if (!reviewHtml.includes('左') || !reviewHtml.includes('中') || !reviewHtml.includes('右')) throw new Error('direction controls missing');
if (!/const DEFAULT_UNIT_ORDER = \['space', 'jump', 'clock'\]/.test(indexHtml)) throw new Error('focused 3-unit order missing');
if (!indexHtml.includes('roundState.unitQueue = (roundState.unitQueue || []).filter(id => queueOrder.includes(id));')) throw new Error('old unit queue is not filtered to focused units');

console.log(JSON.stringify({
  verified: verified.length,
  examReviewQuestions: reviewQuestions.length,
  focusedUnits: ['space', 'jump', 'clock']
}, null, 2));
