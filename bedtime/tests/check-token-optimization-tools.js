const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

const storyId = 'week05-5';
const storyPath = path.join(root, 'stories', `${storyId}.json`);
const story = readJson(`stories/${storyId}.json`);

const packetRaw = execFileSync(
  'python3',
  [path.join(root, 'tools', 'export-review-packet.py'), storyId, '--format', 'json'],
  { cwd: root, encoding: 'utf8' }
);
const packet = JSON.parse(packetRaw);

assert.strictEqual(packet.id, storyId);
assert(packet.sections.length > 0, 'review packet should include sections');
assert(packet.sections.some(section => Array.isArray(section.turns)), 'review packet should keep role turns');
assert(
  packet.sections.every(section => !Object.prototype.hasOwnProperty.call(section, 'text')),
  'review packet must not include duplicated sections[].text when turns are present'
);
assert(
  Buffer.byteLength(packetRaw, 'utf8') < fs.statSync(storyPath).size,
  'review packet should be smaller than the source story JSON'
);

const markdown = execFileSync(
  'python3',
  [path.join(root, 'tools', 'export-review-packet.py'), storyId],
  { cwd: root, encoding: 'utf8' }
);
assert(markdown.includes('省 token 審稿包'), 'markdown packet should be clearly labeled');
assert(!markdown.includes('"turns"'), 'markdown packet should not dump raw JSON');

const indexPath = path.join(root, 'stories', 'story-index.json');
assert(fs.existsSync(indexPath), 'stories/story-index.json should exist');
const indexRaw = fs.readFileSync(indexPath, 'utf8');
const index = JSON.parse(indexRaw);
assert(Array.isArray(index.stories), 'story index should contain stories array');
assert(index.stories.some(entry => entry.id === storyId), 'story index should include known stories');
for (const forbidden of ['sections', 'turns', 'intro', 'prologue', 'wind_down']) {
  assert(
    !indexRaw.includes(`"${forbidden}"`),
    `story index should not include full-story field ${forbidden}`
  );
}

console.log('token optimization tools ok');
