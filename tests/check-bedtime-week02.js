const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const story = JSON.parse(fs.readFileSync(path.join(root, 'bedtime/stories/week02.json'), 'utf8'));
const sectionText = story.sections.map(section => section.text).join('');

if (story.id !== 'week02') throw new Error('week02 id invalid');
if (!['pending_adult_review', 'adult_verified'].includes(story.review_status)) throw new Error('week02 review_status invalid');
if (!Array.isArray(story.sections) || story.sections.length !== 6) throw new Error('week02 must have six sections');
if (sectionText.length < 2100 || sectionText.length > 2400) {
  throw new Error(`week02正文 must be 2100-2400 characters; received ${sectionText.length}`);
}
if (!story.sections.every(section => section.id && section.text && typeof section.text === 'string')) {
  throw new Error('week02 sections need id and plain text');
}
if (!story.wind_down || !['scene', 'breath', 'goodnight'].every(key => story.wind_down[key])) {
  throw new Error('week02 wind_down incomplete');
}

console.log(JSON.stringify({
  id: story.id,
  sectionCharacters: sectionText.length,
  reviewStatus: story.review_status
}, null, 2));
