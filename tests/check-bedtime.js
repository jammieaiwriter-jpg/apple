const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const storiesDir = path.join(root, 'bedtime/stories');
const current = JSON.parse(fs.readFileSync(path.join(storiesDir, 'current.json'), 'utf8'));
if (!current.story || !/^[a-z0-9-]+$/.test(current.story)) throw new Error('current story pointer invalid');
const currentStoryPath = path.join(storiesDir, `${current.story}.json`);
if (!fs.existsSync(currentStoryPath)) throw new Error(`current story ${current.story} does not exist`);
const story = JSON.parse(fs.readFileSync(currentStoryPath, 'utf8'));
const html = fs.readFileSync(path.join(root, 'bedtime/index.html'), 'utf8');
const serialized = JSON.stringify(story);

if (story.id !== current.story) throw new Error('current story pointer must match story id');
if (story.review_status !== 'adult_verified') throw new Error('current story must be adult_verified');
if (!Array.isArray(story.theme_word) || !story.theme_word.length) throw new Error('theme_word missing');
if (!story.theme_word.every(item => item.char && item.zhuyin)) throw new Error('each theme character needs zhuyin');
if (!story.intro || !Array.isArray(story.sections) || story.sections.length < 5) throw new Error('story needs intro and at least five sections');
if (!story.sections.every(section => section.id && section.text && typeof section.text === 'string')) throw new Error('sections need id and plain text');
if (!story.wind_down || !['scene', 'breath', 'goodnight'].every(key => story.wind_down[key])) throw new Error('wind_down incomplete');

['acts', 'choice_A', 'choice_B', 'prompt_question', 'secret_hints', 'word_connection', 'next_hint_A', 'next_hint_B', 'segments']
  .forEach(token => { if (serialized.includes(`"${token}"`)) throw new Error(`story contains legacy field ${token}`); });

['秘密情報', '週末故事地圖', '詞彙寶盒', '需一點提示', '可以自己說', 'choiceA', 'choiceB', 'prompt_question', 'secret_hints', '答題', '測驗']
  .forEach(token => { if (html.includes(token)) throw new Error(`index.html contains legacy interaction ${token}`); });

[
  "stories/current.json", 'current.story',
  'speechSynthesis', 'zh-TW', 'localStorage', 'apple-bedtime-progress-v1',
  'apple-bedtime-last-played-v1', 'date: todayKey()', 'storyTitle: story.title',
  '今晚已聽完：', '昨晚已聽：',
  'theme-character', 'theme-zhuyin', 'dimmed', 'DIM_DELAY_MS',
  '開始今晚的故事', '暫停', '繼續', '重新播放',
  "setState('playing')", "setState('paused')", "setState('ended')", "setState('error')",
  'completedSection', 'revealControls'
].forEach(token => { if (!html.includes(token)) throw new Error(`index.html missing ${token}`); });

if (!html.includes('saved.date === todayKey()')) {
  throw new Error('progress must only resume on the same local date');
}
if (!html.includes('completed.date === yesterdayKey()')) {
  throw new Error('completion status must distinguish yesterday');
}
if (html.includes('重聽昨晚')) throw new Error('replay-yesterday control belongs to catalog phase');

if (html.includes('<ruby>')) throw new Error('use flex-based right-side zhuyin, not ruby');
if (html.includes('story.sections') && html.includes('textContent = section.text')) throw new Error('night screen must not display story body');
if (!html.includes('let speakTimer;') || !html.includes('clearTimeout(speakTimer);')) {
  throw new Error('pending speech start must be cancellable');
}
if (html.includes("document.getElementById('themeWord').innerHTML")) {
  throw new Error('theme word must not inject story data through innerHTML');
}

console.log(JSON.stringify({ sections: story.sections.length, theme: story.theme_word.map(item => item.char).join('') }, null, 2));
