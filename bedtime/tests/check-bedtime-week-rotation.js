#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const base = path.resolve(__dirname, "..");
const storiesDir = path.join(base, "stories");
const catalog = JSON.parse(fs.readFileSync(path.join(storiesDir, "catalog.json"), "utf8"));

const targetIds = new Set(process.argv.slice(2));
let previous = null;
let failures = 0;

function fail(id, message) {
  failures += 1;
  console.error(`✗ ${id}: ${message}`);
}

function loadStory(id) {
  const file = path.join(storiesDir, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

for (const episode of catalog.episodes || []) {
  const facets = new Set(episode.facets || []);
  previous = null;
  for (const entry of episode.stories || []) {
    if (!entry.available || entry.status !== "adult_verified") continue;
    const id = entry.id;
    const story = loadStory(id);
    if (!story) {
      fail(id, "available adult_verified story is missing JSON");
      continue;
    }
    if (targetIds.size && !targetIds.has(id)) {
      previous = story;
      continue;
    }
    if (story.review_status !== "adult_verified") {
      fail(id, `review_status must be adult_verified, got ${story.review_status}`);
    }
    if (!facets.has(story.focus)) {
      fail(id, `focus is not declared in catalog facets: ${story.focus}`);
    }
    if (previous && previous.shape && story.shape === previous.shape) {
      fail(id, `shape matches previous rotation story (${previous.id}): ${story.shape}`);
    }
    for (const [index, section] of (story.sections || []).entries()) {
      const joined = (section.turns || []).map((turn) => turn.text || "").join("");
      if (joined && joined !== section.text) {
        fail(id, `section ${index + 1} text does not equal joined turns`);
      }
    }
    previous = story;
  }
}

if (failures) {
  console.error(`\n${failures} rotation issue(s).`);
  process.exit(1);
}

console.log("✓ bedtime week rotation checks passed");
