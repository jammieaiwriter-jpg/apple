const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const storiesDir = path.join(root, 'bedtime/stories');
const catalog = JSON.parse(fs.readFileSync(path.join(storiesDir, 'catalog.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'bedtime/index.html'), 'utf8');
const current = JSON.parse(fs.readFileSync(path.join(storiesDir, 'current.json'), 'utf8'));

// Each episode that opts into the multi-story model must list valid story entries.
catalog.episodes.forEach(episode => {
  if (!episode.stories) return;
  if (!Array.isArray(episode.stories) || !episode.stories.length) {
    throw new Error(`${episode.id} stories must be a non-empty array when present`);
  }
  episode.stories.forEach(entry => {
    if (!entry.id || !/^[a-z0-9-]+$/.test(entry.id)) throw new Error(`${episode.id} story id invalid`);
    if (!entry.title || !entry.status) throw new Error(`${entry.id} story metadata incomplete`);
    if (typeof entry.available !== 'boolean') throw new Error(`${entry.id} story needs boolean available`);
    if (entry.available && !fs.existsSync(path.join(storiesDir, `${entry.id}.json`))) {
      throw new Error(`${entry.id} marked available without story file`);
    }
  });
});

// W01 friendship week is the vertical slice: one theme, several parallel stories.
const w01 = catalog.episodes.find(episode => episode.id === 'week01');
if (!w01.stories || w01.stories.length < 3) throw new Error('W01 must hold at least three parallel stories');
if (w01.theme !== '友情') throw new Error('W01 theme must stay 友情');
['week01', 'week01-2', 'week01-3'].forEach(id => {
  if (!w01.stories.some(entry => entry.id === id)) throw new Error(`W01 missing story ${id}`);
});
w01.stories.forEach(entry => {
  const id = entry.id;
  const file = JSON.parse(fs.readFileSync(path.join(storiesDir, `${id}.json`), 'utf8'));
  if (file.id !== id || file.schema_version !== 2) throw new Error(`${id} identity invalid`);
  if (!Array.isArray(file.sections) || file.sections.length !== 6) throw new Error(`${id} must keep six sections`);
  if (file.sections.map(section => section.text).join('').length < 2000) {
    throw new Error(`${id}正文 must be at least 2000 characters`);
  }
  if (file.theme_word.map(item => item.char).join('') !== '友情') throw new Error(`${id} core word must be 友情`);
  if (!file.wind_down || !['scene', 'breath', 'goodnight'].every(key => file.wind_down[key])) {
    throw new Error(`${id} wind_down incomplete`);
  }
});

// Theme -> facet -> story model: each story's focus must be a declared facet.
catalog.episodes.forEach(episode => {
  if (!episode.facets) return;
  if (!Array.isArray(episode.facets) || episode.facets.length < 4 || episode.facets.length > 5) {
    throw new Error(`${episode.id} facets must list 4-5 teaching angles`);
  }
  (episode.stories || []).forEach(entry => {
    if (!entry.focus) throw new Error(`${entry.id} story needs a focus facet`);
    if (!episode.facets.includes(entry.focus)) {
      throw new Error(`${entry.id} focus "${entry.focus}" is not a declared facet of ${episode.id}`);
    }
  });
  const used = (episode.stories || []).map(entry => entry.focus);
  if (new Set(used).size !== used.length) throw new Error(`${episode.id} has two stories on the same facet`);
});

const w01Facets = w01.facets || [];
if (!w01Facets.includes('分辨善意與不友善')) {
  throw new Error('W01 facet syllabus must include 分辨善意與不友善');
}

// Nightly rotation only draws adult_verified stories; drafts stay trial-only.
const w01Pool = w01.stories.filter(entry => entry.available && entry.status === 'adult_verified');
if (!w01Pool.length) throw new Error('W01 rotation pool needs at least one adult_verified story');
if (w01.stories.some(entry => entry.status === 'planned' && entry.available)) {
  throw new Error('planned stories must not be available');
}

// current.json must resolve into a catalog week whose tonight pool is adult_verified.
const activeEpisode = catalog.episodes.find(episode =>
  episode.id === current.story || (episode.stories || []).some(entry => entry.id === current.story)
);
if (!activeEpisode) throw new Error('current.story does not map to any catalog week');
const activePool = (activeEpisode.stories || [activeEpisode]).filter(
  entry => entry.available && entry.status === 'adult_verified'
);
if (!activePool.length) throw new Error('active week has no adult_verified story to rotate tonight');

// Night page must implement the weekly-theme rotation, not a single pinned story.
[
  'ROTATION_KEY',
  'pickTonight',
  'weekRotationPool',
  'episodeStories',
  'episodeForStory',
  'tonightStoryId',
  "entry.status === 'adult_verified'",
  '本週主題'
].forEach(token => {
  if (!html.includes(token)) throw new Error(`index.html missing rotation token ${token}`);
});

console.log(JSON.stringify({
  w01Stories: w01.stories.length,
  w01VerifiedPool: w01Pool.length,
  activeWeek: activeEpisode.week
}, null, 2));
