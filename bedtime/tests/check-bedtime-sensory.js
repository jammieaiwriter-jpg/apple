#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const base = path.resolve(__dirname, "..");
const storiesDir = path.join(base, "stories");
const ids = process.argv.slice(2);

const soundWords = /(沙沙|嘩|咕嚕|噗|嗡嗡|滴答|唧|啪|咚|叮|刷刷|嗒|喀|咻|窸窣|呼(?!吸))/g;
const imageWords = /(光|影|月|星|風|香|味|暖|涼|軟|濕|亮|暗|手|腳|肩|胸口|指尖|像|慢慢|輕輕)/;

function storyIds() {
  if (ids.length) return ids;
  const catalog = JSON.parse(fs.readFileSync(path.join(storiesDir, "catalog.json"), "utf8"));
  const out = [];
  for (const episode of catalog.episodes || []) {
    for (const entry of episode.stories || []) {
      if (entry.available && entry.status === "adult_verified") out.push(entry.id);
    }
  }
  return out;
}

let failures = 0;
const windDownScenes = new Map();

for (const id of storyIds()) {
  const story = JSON.parse(fs.readFileSync(path.join(storiesDir, `${id}.json`), "utf8"));
  const sections = story.sections || [];
  const body = sections.map((section) => section.text || "").join("");
  const sounds = body.match(soundWords) || [];
  const prologueLength = (story.prologue || "").length;

  if (prologueLength < 120 || prologueLength > 220) {
    failures += 1;
    console.error(`✗ ${id}: prologue length ${prologueLength}, expected 120-220 chars`);
  }
  if (sounds.length > 5) {
    failures += 1;
    console.error(`✗ ${id}: too many sound-word hits (${sounds.length})`);
  }

  const scene = ((story.wind_down || {}).scene || "").trim();
  if (scene) {
    if (windDownScenes.has(scene)) {
      failures += 1;
      console.error(`✗ ${id}: wind_down.scene duplicates ${windDownScenes.get(scene)}`);
    } else {
      windDownScenes.set(scene, id);
    }
  }

  sections.forEach((section, index) => {
    if (!imageWords.test(section.text || "")) {
      failures += 1;
      console.error(`✗ ${id}: section ${index + 1} lacks a simple sensory/image cue`);
    }
  });
}

if (failures) {
  console.error(`\n${failures} sensory issue(s).`);
  process.exit(1);
}

console.log("✓ bedtime sensory checks passed");
