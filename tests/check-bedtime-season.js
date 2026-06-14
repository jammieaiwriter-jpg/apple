const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const storiesDir = path.join(root, 'bedtime/stories');
const week08Path = path.join(storiesDir, 'week08.json');
const planPath = path.join(storiesDir, 'season01-plan.md');

if (!fs.existsSync(week08Path)) throw new Error('week08 story missing');
if (!fs.existsSync(planPath)) throw new Error('season01 plan missing');

const story = JSON.parse(fs.readFileSync(week08Path, 'utf8'));
const serialized = JSON.stringify(story);
const plan = fs.readFileSync(planPath, 'utf8');

if (story.schema_version !== 2 || story.id !== 'week08') throw new Error('week08 identity invalid');
if (!Array.isArray(story.sections) || story.sections.length !== 6) throw new Error('week08 must keep six sections');
if (!story.wind_down || !['scene', 'breath', 'goodnight'].every(key => story.wind_down[key])) {
  throw new Error('week08 wind_down incomplete');
}
if (!Array.isArray(story.theme_word) || story.theme_word.map(item => item.char).join('') !== '道歉') {
  throw new Error('week08 must have one core word: 道歉');
}
if (!serialized.includes('廉頗') || !serialized.includes('藺相如') || !serialized.includes('負荊請罪')) {
  throw new Error('week08 needs an embedded three-part apology story');
}
if (story.sections.some(section => /^elder-story-/.test(section.id))) {
  throw new Error('embedded elder story must not add standalone sections');
}
if (!story.weekend_prompts.every(prompt => !prompt.includes('什麼是道歉') && !prompt.includes('解釋道歉'))) {
  throw new Error('weekend prompts must ask about actions, not definitions');
}

['核心詞', '行動衝突', '主角變化', '旅行物件流向', '老山羊段', '週末行動問題']
  .forEach(column => {
    if (!plan.includes(column)) throw new Error(`season plan missing column ${column}`);
  });

for (let week = 1; week <= 12; week += 1) {
  const label = `W${String(week).padStart(2, '0')}`;
  if (!plan.includes(label)) throw new Error(`season plan missing ${label}`);
}

console.log(JSON.stringify({ sections: story.sections.length, theme: '道歉', plannedWeeks: 12 }, null, 2));
