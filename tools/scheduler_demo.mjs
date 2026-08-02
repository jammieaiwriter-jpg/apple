// tools/scheduler_demo.mjs
//
// 排課引擎驗收 demo：讀真正的 progress.json 結構（在記憶體裡跑，不會覆寫檔案），
// 模擬 Apple 連續練習 30 天、每題答對率約 80%，印出：
//   - 每天 12 題怎麼分配（new / review / mistake）
//   - streak 怎麼變化
//   - 技能推進曲線（累計解鎖幾個技能、碰過幾個章節）
// 用來肉眼確認：不會卡在同一章、不會一直出已精熟的技能、配額讓渡邏輯合理。
//
// 用法：node tools/scheduler_demo.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { planDaily, recordAnswer, updateStreak } from "./scheduler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS_PATH = path.join(__dirname, "..", "progress.json");

// ---- 簡單、可重現的亂數（不依賴 Math.random，跑第二次結果一樣）----
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260731);

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ---- 讀真正的 progress.json 當初始狀態 ----
let progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"));

const START_DATE = "2026-08-01";
const DAYS = 30;
const CORRECT_RATE = 0.8;

console.log(`模擬 Apple 從 ${START_DATE} 開始連續練習 ${DAYS} 天，每題答對率 ${CORRECT_RATE * 100}%`);
console.log(`起始技能數：${progress.skills.length}，起始 mistakePool：${progress.mistakePool.length}\n`);

const touchedSkills = new Set();
const touchedChapters = new Set();
const dailyLog = [];

for (let day = 0; day < DAYS; day++) {
  const today = addDays(START_DATE, day);
  const { items, meta } = planDaily(progress, today);

  for (const item of items) {
    touchedSkills.add(item.skillId);
    const skill = progress.skills.find((s) => s.skillId === item.skillId);
    if (skill) touchedChapters.add(skill.chapterId);

    // 模擬作答：80% 機率「完美」（首次答對、不看提示），20% 機率答錯。
    const roll = rng();
    const correct = roll < CORRECT_RATE;
    const answer = { skillId: item.skillId, correct, usedHint: false, firstTry: true };
    progress = recordAnswer(progress, answer, today);
  }

  // 假設她每天都把排出來的題目做完，就點亮今天的 streak。
  if (items.length > 0) {
    progress = updateStreak(progress, today);
  }

  const masteredCount = progress.skills.filter((s) => s.mastered).length;
  const unlockedCount = progress.skills.filter((s) => s.unlocked).length;
  const activeMistakes = progress.mistakePool.filter((m) => !m.resolved).length;

  dailyLog.push({
    day: day + 1,
    date: today,
    planned: items.length,
    mistake: meta.quotas.mistake.filled,
    review: meta.quotas.review.filled,
    new: meta.quotas.new.filled,
    streak: progress._meta.streak.current,
    unlockedCount,
    masteredCount,
    activeMistakes,
  });
}

console.log("day  date        題數  錯題 複習 新題  streak  已解鎖  已精熟  錯題池");
for (const row of dailyLog) {
  console.log(
    `${String(row.day).padStart(3)}  ${row.date}   ${String(row.planned).padStart(2)}    ${String(row.mistake).padStart(
      2
    )}   ${String(row.review).padStart(2)}   ${String(row.new).padStart(2)}    ${String(row.streak).padStart(
      3
    )}     ${String(row.unlockedCount).padStart(3)}     ${String(row.masteredCount).padStart(3)}     ${row.activeMistakes}`
  );
}

console.log(`\n30 天內共碰過 ${touchedSkills.size} 個不同技能、${touchedChapters.size} 個不同章節。`);
console.log(
  touchedChapters.size > 3
    ? "→ 排課有持續往後面章節推進，沒有卡在同一章。"
    : "→ 注意：章節推進看起來偏慢，可能要檢查新技能配額邏輯。"
);
const finalStreak = dailyLog[dailyLog.length - 1];
console.log(`最終 streak：連續 ${finalStreak.streak} 天，歷史最長 ${progress._meta.streak.longest} 天。`);

// ---------------------------------------------------------------------------
// 附加驗證：精熟需要 10 次完美通關 × 10 題 = 100 題「首次答對且無提示」，
// 30 天的正常排課（配額分散在很多技能上）不太可能讓單一技能在 30 天內就精熟。
// 這裡額外對一個技能做「集中特訓」，證明精熟機制本身沒問題、而且精熟後真的會被撤出題池。
// ---------------------------------------------------------------------------

console.log("\n--- 附加測試：集中特訓一個技能，驗證『精熟後永久撤出題池』---");
let stress = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"));
const targetSkillId = stress.skills[0].skillId;
let stressDate = "2026-08-01";
for (let i = 0; i < 100; i++) {
  stress = recordAnswer(stress, { skillId: targetSkillId, correct: true, usedHint: false, firstTry: true }, stressDate);
  if (i % 10 === 9) stressDate = addDays(stressDate, 1);
}
const target = stress.skills.find((s) => s.skillId === targetSkillId);
console.log(`${targetSkillId} 集中特訓 100 題完美作答後：perfectRuns=${target.perfectRuns}, mastered=${target.mastered}`);

const { items: stressItems } = planDaily(stress, addDays(stressDate, 1));
const stillAppears = stressItems.some((it) => it.skillId === targetSkillId);
console.log(`隔天排課是否還會出現 ${targetSkillId}：${stillAppears ? "會（有問題！）" : "不會（正確）"}`);
