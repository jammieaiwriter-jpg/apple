const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const storiesDir = path.join(root, 'bedtime/stories');
const catalogPath = path.join(storiesDir, 'catalog.json');
const html = fs.readFileSync(path.join(root, 'bedtime/index.html'), 'utf8');

if (!fs.existsSync(catalogPath)) throw new Error('podcast catalog missing');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
if (!Array.isArray(catalog.episodes)) {
  throw new Error('podcast catalog episodes missing');
}

catalog.episodes.forEach((episode, index) => {
  const weekMatch = /^week(\d{2})$/.exec(episode.id || '');
  if (weekMatch) {
    const expectedId = `week${weekMatch[1]}`;
    if (episode.id !== expectedId) throw new Error(`catalog episode ${index + 1} id invalid`);
  }
  if (!episode.title || !episode.theme || !episode.status) {
    throw new Error(`${episode.id || `episode ${index + 1}`} catalog metadata incomplete`);
  }
  if (!Array.isArray(episode.theme_word) || !episode.theme_word.every(item => item.char && item.zhuyin)) {
    throw new Error(`${episode.id} catalog theme_word pronunciation incomplete`);
  }
  if (episode.available && !fs.existsSync(path.join(storiesDir, `${episode.id}.json`))) {
    throw new Error(`${episode.id} marked available without story file`);
  }
});

for (let week = 1; week <= 12; week += 1) {
  const expectedId = `week${String(week).padStart(2, '0')}`;
  if (!catalog.episodes.some(episode => episode.id === expectedId)) {
    throw new Error(`podcast catalog missing ${expectedId}`);
  }
}

['adult_verified', 'pending_adult_review', 'planned'].forEach(status => {
  if (!catalog.episodes.some(episode => episode.status === status)) {
    throw new Error(`catalog missing status ${status}`);
  }
});

[
  '第一季故事',
  'podcastList',
  "stories/catalog.json",
  'renderPodcastList',
  'selectEpisode',
  'episode.available',
  '今晚播放',
  '草稿試聽',
  '規劃中',
  'storyCache',
  'preloadAvailableStories',
  'playStory(0)',
  'splitZhuyin',
  'episode-pronunciation',
  'theme-tone',
  'fetchJson',
  "cache:'no-store'"
].forEach(token => {
  if (!html.includes(token)) throw new Error(`podcast homepage missing ${token}`);
});

console.log(JSON.stringify({
  episodes: catalog.episodes.length,
  mainSeason: catalog.episodes.filter(episode => /^week\d{2}$/.test(episode.id)).length,
  specials: catalog.episodes.filter(episode => !/^week\d{2}$/.test(episode.id)).length,
  available: catalog.episodes.filter(episode => episode.available).length
}, null, 2));
