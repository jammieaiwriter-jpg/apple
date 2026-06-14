const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'bedtime/week02.html'), 'utf8');

[
  'SECTION_PAUSE_MS = 1800',
  'WIND_DOWN_PAUSE_MS = 3000',
  'BEFORE_WIND_DOWN_PAUSE_MS = 2500',
  'speechSynthesis.getVoices()',
  "voice.lang === 'zh-TW'",
  'utterance.voice = preferredVoice',
  'pauseBeforeNext',
  'clearTimeout(pauseTimer)'
].forEach(token => {
  if (!html.includes(token)) throw new Error(`week02 narration preview missing ${token}`);
});

console.log(JSON.stringify({
  preview: 'week02',
  sectionPauseMs: 1800,
  beforeWindDownPauseMs: 2500,
  windDownPauseMs: 3000
}, null, 2));
