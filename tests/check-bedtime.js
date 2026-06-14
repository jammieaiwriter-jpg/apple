const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const storyPath = path.join(root, 'bedtime', 'stories', 'week01.json');
const indexPath = path.join(root, 'bedtime', 'index.html');

if (!fs.existsSync(storyPath)) throw new Error('week01.json missing');
if (!fs.existsSync(indexPath)) throw new Error('bedtime/index.html missing');

const story = JSON.parse(fs.readFileSync(storyPath, 'utf8'));
const html = fs.readFileSync(indexPath, 'utf8');
const banned = /答錯|錯了|答對|考試|分數|過關/;

if (!['pending_adult_review', 'adult_verified'].includes(story.review_status)) throw new Error('story lacks a valid review status');
if (!Array.isArray(story.acts) || story.acts.length !== 5) throw new Error('story must contain five acts');

story.acts.forEach((act, index) => {
  const required = [
    'id', 'act_title', 'lines', 'target_word', 'word_connection',
    'prompt_question', 'choice_A', 'choice_B', 'next_hint_A', 'next_hint_B', 'secret_hints'
  ];
  required.forEach(key => {
    if (!act[key] || (Array.isArray(act[key]) && !act[key].length)) {
      throw new Error(`act ${index + 1} missing ${key}`);
    }
  });
  if (!act.lines.every(line => {
    if (!line.text) return false;
    if (!line.segments) return Boolean(line.zhuyin);
    return line.segments.every(segment =>
      [...segment.text].length === 1 &&
      typeof segment.zhuyin === 'string' &&
      (!/[，。！？、]/.test(segment.text) || segment.zhuyin === '')
    );
  })) throw new Error(`act ${index + 1} lacks real zhuyin content`);
  if (act.secret_hints.length !== 3) throw new Error(`act ${index + 1} needs three secret hints`);
  if (!['觀察', '方法', '關鍵'].every(label => act.secret_hints.some(hint => hint.startsWith(label)))) {
    throw new Error(`act ${index + 1} lacks observation-method-key hints`);
  }
  if (banned.test(JSON.stringify(act))) throw new Error(`act ${index + 1} contains test language`);
});

[
  'speechSynthesis', 'zh-TW', 'localStorage',
  'apple-bedtime-choices', 'apple-bedtime-vocabulary', 'apple-bedtime-completed', 'apple-bedtime-retell',
  '秘密情報', '週末故事地圖', '需一點提示', '可以自己說'
].forEach(token => {
  if (!html.includes(token)) throw new Error(`index.html missing ${token}`);
});

if (banned.test(html)) throw new Error('index.html contains test language');
if (html.includes("bubble.querySelector('.text').textContent")) {
  throw new Error('listen handler must not read ruby zhuyin from textContent');
}
if (!html.includes('const lines = story.acts[activeAct].lines;')) {
  throw new Error('listen handler must read plain text from the active act');
}

console.log(JSON.stringify({ acts: story.acts.length, targetWords: story.acts.map(act => act.target_word) }, null, 2));
