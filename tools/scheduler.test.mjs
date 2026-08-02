// tools/scheduler.test.mjs
//
// node 內建 test runner，零外部相依：
//   node --test tools/scheduler.test.mjs

import test from "node:test";
import assert from "node:assert/strict";

import {
  planDaily,
  recordAnswer,
  updateStreak,
  importMistakes,
  mapModeToSkillId,
  MAX_ITEMS_PER_SKILL_PER_DAY,
  REVIEW_INTERVALS_DAYS,
} from "./scheduler.js";

// ---------------------------------------------------------------------------
// 測試用的最小 progress fixture
// ---------------------------------------------------------------------------

function makeSkill(overrides) {
  return {
    skillId: "G1-00-00",
    track: "school",
    subject: "math",
    grade: "G1",
    chapterId: "G1-00",
    chapter: "測試章",
    semester: "上",
    chapterOrder: 0,
    skillName: "測試技能",
    mode: "jump",
    difficulty: 1,
    attempts: 0,
    correctFirstTry: 0,
    usedHint: 0,
    currentStreak: 0,
    perfectRuns: 0,
    mastered: false,
    unlocked: false,
    lastPracticed: null,
    nextReview: null,
    ...overrides,
  };
}

function makeProgress({ skills = [], mistakePool = [], metaOverrides = {} } = {}) {
  return {
    _meta: {
      student: "Test",
      schemaVersion: 1,
      masteryRule: { perfectRunLength: 10, perfectRunsToMaster: 10, note: "" },
      daily: { quota: 12, newSkills: 6, review: 3, mistakes: 3, note: "" },
      streak: { current: 0, longest: 0, lastDone: null },
      pointer: { school: skills[0] ? skills[0].skillId : null },
      ...metaOverrides,
    },
    skills,
    mistakePool,
  };
}

// 十個章節、每章節一個技能，足夠讓「新技能」配額有東西可推。
function bigCurriculumFixture() {
  const skills = [];
  for (let i = 1; i <= 15; i++) {
    const id = `G1-${String(i).padStart(2, "0")}-01`;
    skills.push(
      makeSkill({
        skillId: id,
        chapterId: `G1-${String(i).padStart(2, "0")}`,
        chapterOrder: i,
        skillName: `技能 ${i}`,
      })
    );
  }
  return skills;
}

// ---------------------------------------------------------------------------
// 1. 錯題池空時，配額怎麼讓渡
// ---------------------------------------------------------------------------

test("錯題池空時，mistake 配額讓給 review；review 也用不完時才讓給 new", () => {
  const skills = bigCurriculumFixture();
  // 只有一個技能到期複習
  skills[0].attempts = 5;
  skills[0].unlocked = true;
  skills[0].nextReview = "2026-08-01";
  skills[0].lastPracticed = "2026-07-25";

  const progress = makeProgress({ skills, mistakePool: [] });
  const { items, meta } = planDaily(progress, "2026-08-01");

  assert.equal(meta.quotas.mistake.filled, 0, "錯題池是空的，不該生出 mistake 題目");

  // review 只有 1 個技能可以出，上限是 MAX_ITEMS_PER_SKILL_PER_DAY
  const reviewItems = items.filter((it) => it.reason === "review");
  assert.equal(reviewItems.length, MAX_ITEMS_PER_SKILL_PER_DAY);
  assert.ok(reviewItems.every((it) => it.skillId === skills[0].skillId));

  // 剩下的名額（3 缺口的 mistake ＋ review 湊不滿的部分）全部讓給新技能，總數還是 12
  assert.equal(items.length, 12);
  const newItems = items.filter((it) => it.reason === "new");
  assert.equal(newItems.length, 12 - MAX_ITEMS_PER_SKILL_PER_DAY);
});

test("mistake 與 review 都空的時候，12 題全部是 new，且不會超過每技能 3 題上限", () => {
  const skills = bigCurriculumFixture();
  const progress = makeProgress({ skills, mistakePool: [] });
  const { items, meta } = planDaily(progress, "2026-08-01");

  assert.equal(meta.quotas.mistake.filled, 0);
  assert.equal(meta.quotas.review.filled, 0);
  assert.equal(items.length, 12);
  assert.ok(items.every((it) => it.reason === "new"));

  const perSkill = new Map();
  for (const it of items) perSkill.set(it.skillId, (perSkill.get(it.skillId) || 0) + 1);
  for (const count of perSkill.values()) {
    assert.ok(count <= MAX_ITEMS_PER_SKILL_PER_DAY);
  }
  // 至少涵蓋兩個以上不同技能（6 題新配額 ÷ 3 題上限 ≥ 2），不會卡在同一個技能
  assert.ok(perSkill.size >= 2);
});

// ---------------------------------------------------------------------------
// 1b. 回歸測試：前一輪 agent 的 bug —— 新技能配額卡在同一批已解鎖技能，推不進課綱後面
// ---------------------------------------------------------------------------

test("回歸測試：已解鎖 4 個技能、其餘 75 個都還沒解鎖時，new 配額會持續解鎖新的 skillId，不會卡住", () => {
  // 模擬真正的 79 技能課綱形狀：17 章，前 4 個技能（依課綱順序）已經 unlocked，
  // 其餘 75 個 unlocked: false —— 這正是前一輪 agent 死前回報的卡住場景。
  const skills = [];
  let skillCounter = 0;
  for (let ch = 1; ch <= 17; ch++) {
    const skillsInChapter = ch <= 4 ? 3 : 5; // 隨便湊出接近 79 筆的分佈，不用跟真課綱一模一樣
    for (let k = 1; k <= skillsInChapter; k++) {
      skillCounter++;
      const skillId = `G1-${String(ch).padStart(2, "0")}-${String(k).padStart(2, "0")}`;
      skills.push(
        makeSkill({
          skillId,
          chapterId: `G1-${String(ch).padStart(2, "0")}`,
          chapterOrder: ch,
          skillName: `技能 ${skillCounter}`,
          unlocked: skillCounter <= 4, // 前 4 個（課綱順序）已解鎖，其餘全新
          attempts: skillCounter <= 4 ? 12 : 0,
        })
      );
    }
  }
  assert.ok(skills.length >= 75, "確保有夠多技能可以推進，重現卡住的場景");

  let progress = makeProgress({ skills });
  const unlockedOverTime = [];

  // 跑 15 天，模擬「今天排出來的 new 題目全部答對」，藉此讓 recordAnswer 把新技能標成 unlocked。
  for (let day = 0; day < 15; day++) {
    const today = `2026-08-${String(day + 1).padStart(2, "0")}`;
    const { items } = planDaily(progress, today);
    for (const item of items) {
      if (item.reason !== "new") continue;
      progress = recordAnswer(
        progress,
        { skillId: item.skillId, correct: true, usedHint: false, firstTry: true },
        today
      );
    }
    const unlockedCount = progress.skills.filter((s) => s.unlocked).length;
    unlockedOverTime.push(unlockedCount);
  }

  // 核心斷言：已解鎖技能數要持續往上爬，不能卡在 4（前一輪的 bug）。
  assert.ok(
    unlockedOverTime[unlockedOverTime.length - 1] > 4,
    `已解鎖技能數應該超過原本卡住的 4，實際曲線：${unlockedOverTime.join(",")}`
  );
  // 而且要是「持續」推進，不是解鎖一次就又卡住：後半段仍要比前半段多。
  assert.ok(
    unlockedOverTime[14] > unlockedOverTime[4],
    `第 15 天的已解鎖數應該明顯多於第 5 天，實際曲線：${unlockedOverTime.join(",")}`
  );

  // 額外檢查：每天的 new 配額裡，一定要能找到「今天之前還是 unlocked:false」的全新 skillId，
  // 不能每天都只重複挑同一批已解鎖但未精熟的技能。
  let progress2 = makeProgress({ skills });
  const newlyUnlockedPerDay = [];
  for (let day = 0; day < 10; day++) {
    const today = `2026-09-${String(day + 1).padStart(2, "0")}`;
    const beforeUnlocked = new Set(progress2.skills.filter((s) => s.unlocked).map((s) => s.skillId));
    const { items } = planDaily(progress2, today);
    const newReasonSkillIds = new Set(items.filter((it) => it.reason === "new").map((it) => it.skillId));
    const genuinelyNew = [...newReasonSkillIds].filter((id) => !beforeUnlocked.has(id));
    newlyUnlockedPerDay.push(genuinelyNew.length);
    for (const item of items) {
      progress2 = recordAnswer(
        progress2,
        { skillId: item.skillId, correct: true, usedHint: false, firstTry: true },
        today
      );
    }
  }
  const daysWithGenuineProgress = newlyUnlockedPerDay.filter((n) => n > 0).length;
  assert.ok(
    daysWithGenuineProgress >= 8,
    `10 天裡至少 8 天要真的解鎖新技能，實際每天新解鎖數：${newlyUnlockedPerDay.join(",")}`
  );
});

// ---------------------------------------------------------------------------
// 1c. 回歸測試：跨年級不能混新技能（2026-07-31 建 G2 課綱時發現的 bug）
//
// G1 跟 G2 各自的 chapterOrder 都是從 1 開始編號。舊排序鍵只比 chapterOrder，
// 導致 G1 第 1 章跟 G2 第 1 章被當同一順位，她才剛開始學小一，新技能配額就會
// 混進小二的技能。正確行為：G1 的技能要先全部解鎖過，才輪得到 G2。
// ---------------------------------------------------------------------------

test("跨年級不能混新技能：G1 還沒解鎖完之前，new 配額不會挑到 G2 的技能", () => {
  const skills = [];
  for (const grade of ["G1", "G2"]) {
    for (let ch = 1; ch <= 3; ch++) {
      for (let k = 1; k <= 3; k++) {
        skills.push(
          makeSkill({
            skillId: `${grade}-${String(ch).padStart(2, "0")}-${String(k).padStart(2, "0")}`,
            grade,
            chapterId: `${grade}-${String(ch).padStart(2, "0")}`,
            chapterOrder: ch, // 兩個年級都從 1 開始編號 —— 這正是舊 bug 的觸發條件
            skillName: `${grade} 技能 ${ch}-${k}`,
          })
        );
      }
    }
  }
  // 9 個 G1 技能、9 個 G2 技能，全部 unlocked: false（剛開始）
  let progress = makeProgress({ skills });
  let today = new Date("2026-08-01");

  for (let day = 0; day < 10; day++) {
    const dateStr = today.toISOString().slice(0, 10);
    const plan = planDaily(progress, dateStr);
    const newItems = plan.items.filter((it) => it.reason === "new");
    const touchedG2 = newItems.some((it) => it.skillId.startsWith("G2-"));
    const g1Remaining = progress.skills.some(
      (s) => s.grade === "G1" && !s.unlocked && !s.mastered
    );
    assert.ok(
      !(touchedG2 && g1Remaining),
      `第 ${day + 1} 天：G1 還有 ${
        progress.skills.filter((s) => s.grade === "G1" && !s.unlocked).length
      } 個技能沒解鎖，卻已經排到 G2 的新技能`
    );
    for (const item of newItems) {
      progress = recordAnswer(
        progress,
        { skillId: item.skillId, correct: true, usedHint: false, firstTry: true },
        dateStr
      );
    }
    today.setDate(today.getDate() + 1);
  }

  const g1AllUnlocked = progress.skills
    .filter((s) => s.grade === "G1")
    .every((s) => s.unlocked);
  assert.ok(g1AllUnlocked, "10 天後 G1 的 9 個技能應該都解鎖完了");
});

test("G1 全部技能都 mastered 之後，G2 的新技能才會出現在排課裡（確認不是永遠卡住）", () => {
  const skills = [];
  for (const grade of ["G1", "G2"]) {
    for (let ch = 1; ch <= 2; ch++) {
      for (let k = 1; k <= 2; k++) {
        skills.push(
          makeSkill({
            skillId: `${grade}-${String(ch).padStart(2, "0")}-${String(k).padStart(2, "0")}`,
            grade,
            chapterId: `${grade}-${String(ch).padStart(2, "0")}`,
            chapterOrder: ch,
            // G1 全部先設成已精熟，G2 全部還沒解鎖 —— 直接跳過漫長的刷題模擬
            unlocked: grade === "G1",
            mastered: grade === "G1",
          })
        );
      }
    }
  }
  const progress = makeProgress({ skills });
  const plan = planDaily(progress, "2026-08-01");
  const newG2 = plan.items.filter((it) => it.reason === "new" && it.skillId.startsWith("G2-"));
  assert.ok(newG2.length > 0, "G1 全部精熟後，G2 應該立刻能被排進新技能配額");
});

test("四個年級（G1-G4）依序推進，任何一個時間點都只會從單一年級挑新技能", () => {
  // 2026-08-01 建 G3/G4 課綱、併進 progress.json（79+79+96+148=402 筆）後的真實場景：
  // 排序鍵是 grade 字串字典序（"G1"<"G2"<"G3"<"G4"），要確認這對 4 個年級一樣成立，
  // 不是只驗證過 2 個年級就假設它會自動推廣。
  const grades = ["G1", "G2", "G3", "G4"];
  const skills = [];
  for (const grade of grades) {
    for (let ch = 1; ch <= 2; ch++) {
      for (let k = 1; k <= 2; k++) {
        skills.push(
          makeSkill({
            skillId: `${grade}-${String(ch).padStart(2, "0")}-${String(k).padStart(2, "0")}`,
            grade,
            chapterId: `${grade}-${String(ch).padStart(2, "0")}`,
            chapterOrder: ch,
          })
        );
      }
    }
  }

  const gradesTouchedWhenMasteredUpTo = (masteredGrades) => {
    const progress = makeProgress({
      skills: skills.map((s) => ({
        ...s,
        unlocked: masteredGrades.includes(s.grade),
        mastered: masteredGrades.includes(s.grade),
      })),
    });
    const plan = planDaily(progress, "2026-08-01");
    return new Set(
      plan.items
        .filter((it) => it.reason === "new")
        .map((it) => skills.find((s) => s.skillId === it.skillId).grade)
    );
  };

  assert.deepEqual(gradesTouchedWhenMasteredUpTo([]), new Set(["G1"]), "全新狀態只會挑 G1");
  assert.deepEqual(gradesTouchedWhenMasteredUpTo(["G1"]), new Set(["G2"]), "G1 精熟完只會挑 G2");
  assert.deepEqual(
    gradesTouchedWhenMasteredUpTo(["G1", "G2"]),
    new Set(["G3"]),
    "G1+G2 精熟完只會挑 G3"
  );
  assert.deepEqual(
    gradesTouchedWhenMasteredUpTo(["G1", "G2", "G3"]),
    new Set(["G4"]),
    "G1+G2+G3 精熟完只會挑 G4"
  );
});

// ---------------------------------------------------------------------------
// 2. 連續 10 題無提示才算 1 次完美通關；中間看一次提示就歸零
// ---------------------------------------------------------------------------

test("連續 10 題首次正確且無提示 → perfectRuns +1、currentStreak 歸零", () => {
  const skills = [makeSkill({ skillId: "G1-01-01", chapterOrder: 1 })];
  let progress = makeProgress({ skills });

  for (let i = 0; i < 10; i++) {
    progress = recordAnswer(
      progress,
      { skillId: "G1-01-01", correct: true, usedHint: false, firstTry: true },
      "2026-08-01"
    );
  }

  const skill = progress.skills.find((s) => s.skillId === "G1-01-01");
  assert.equal(skill.perfectRuns, 1);
  assert.equal(skill.currentStreak, 0);
  assert.equal(skill.mastered, false);
});

test("連續作答中間看一次提示，streak 就歸零、不會累積成完美通關", () => {
  const skills = [makeSkill({ skillId: "G1-01-01", chapterOrder: 1 })];
  let progress = makeProgress({ skills });

  // 先答對 9 題
  for (let i = 0; i < 9; i++) {
    progress = recordAnswer(
      progress,
      { skillId: "G1-01-01", correct: true, usedHint: false, firstTry: true },
      "2026-08-01"
    );
  }
  let skill = progress.skills.find((s) => s.skillId === "G1-01-01");
  assert.equal(skill.currentStreak, 9);

  // 第 10 題看了提示
  progress = recordAnswer(
    progress,
    { skillId: "G1-01-01", correct: true, usedHint: true, firstTry: true },
    "2026-08-01"
  );
  skill = progress.skills.find((s) => s.skillId === "G1-01-01");
  assert.equal(skill.currentStreak, 0, "看提示要讓 streak 歸零");
  assert.equal(skill.perfectRuns, 0, "還沒滿 10 題完美作答，不該算完美通關");

  // 這一題也要進錯題池
  const mistake = progress.mistakePool.find((m) => m.skillId === "G1-01-01" && !m.resolved);
  assert.ok(mistake, "看提示要進錯題池");
  assert.equal(mistake.reason, "hint");
});

// ---------------------------------------------------------------------------
// 3. 累積 10 次完美通關後，該技能不再被 planDaily 選出
// ---------------------------------------------------------------------------

test("累積 10 次完美通關 → mastered，之後 planDaily 不會再選到它", () => {
  const skills = bigCurriculumFixture();
  let progress = makeProgress({ skills });

  for (let run = 0; run < 10; run++) {
    for (let q = 0; q < 10; q++) {
      progress = recordAnswer(
        progress,
        { skillId: "G1-01-01", correct: true, usedHint: false, firstTry: true },
        "2026-08-01"
      );
    }
  }

  const mastered = progress.skills.find((s) => s.skillId === "G1-01-01");
  assert.equal(mastered.perfectRuns, 10);
  assert.equal(mastered.mastered, true);
  assert.equal(mastered.nextReview, null, "精熟後不再排入複習排程");

  const { items } = planDaily(progress, "2026-08-02");
  assert.ok(
    items.every((it) => it.skillId !== "G1-01-01"),
    "已精熟的技能永久撤出題池，不該再出現在今天的 12 題裡"
  );
});

// ---------------------------------------------------------------------------
// 4. streak 斷一天歸零
// ---------------------------------------------------------------------------

test("連續完成隔天 → streak +1", () => {
  const progress = makeProgress({ skills: [], metaOverrides: { streak: { current: 5, longest: 5, lastDone: "2026-08-01" } } });
  const updated = updateStreak(progress, "2026-08-02");
  assert.equal(updated._meta.streak.current, 6);
  assert.equal(updated._meta.streak.longest, 6);
});

test("斷了一天以上 → streak 歸零重新起算（今天算新紀錄的第 1 天）", () => {
  const progress = makeProgress({ skills: [], metaOverrides: { streak: { current: 5, longest: 8, lastDone: "2026-07-20" } } });
  const updated = updateStreak(progress, "2026-08-01"); // 中間斷了 10 幾天
  assert.equal(updated._meta.streak.current, 1, "斷掉之後不能延續原本的 5，要歸零重新起算");
  assert.equal(updated._meta.streak.longest, 8, "歷史最長紀錄不會因為這次中斷被抹掉");
});

test("同一天重複呼叫 updateStreak 不會重複累加", () => {
  const progress = makeProgress({ skills: [], metaOverrides: { streak: { current: 3, longest: 3, lastDone: "2026-08-01" } } });
  const updated = updateStreak(progress, "2026-08-01");
  assert.equal(updated._meta.streak.current, 3);
});

// ---------------------------------------------------------------------------
// 5. 奧數錯題與學校錯題混在同一組 12 題裡
// ---------------------------------------------------------------------------

test("奧數與學校錯題進同一個 mistakePool，排課時混在同一組 12 題、不分開配額", () => {
  const skills = bigCurriculumFixture();
  const mistakePool = [
    {
      id: "G1-01-01::2026-07-30",
      skillId: "G1-01-01",
      track: "school",
      reason: "wrong",
      source: "answer",
      addedDate: "2026-07-30",
      lastSeenDate: "2026-07-30",
      occurrences: 1,
      correctStreak: 0,
      resolved: false,
      resolvedDate: null,
    },
    {
      id: "OLY-03-02::2026-07-29",
      skillId: "OLY-03-02", // 奧數技能，不在 progress.skills 裡（軌 B 按需加入）
      track: "olympiad",
      reason: "wrong",
      source: "external",
      addedDate: "2026-07-29",
      lastSeenDate: "2026-07-29",
      occurrences: 1,
      correctStreak: 0,
      resolved: false,
      resolvedDate: null,
    },
  ];

  const progress = makeProgress({ skills, mistakePool });
  const { items, meta } = planDaily(progress, "2026-08-01");

  const mistakeItems = items.filter((it) => it.reason === "mistake");
  assert.equal(mistakeItems.length, 3, "3 題錯題變式配額：先進池的奧數錯題 2 題 + 學校錯題 1 題");

  const tracks = new Set(mistakeItems.map((it) => it.track));
  assert.ok(tracks.has("school") && tracks.has("olympiad"), "同一批 mistake 題目裡要同時看到兩種 track");

  // 沒有另外切配額 —— 這些 mistake 題目跟 new/review 題目都在同一個 items 陣列裡
  assert.equal(items.length, 12);
  assert.ok(items.some((it) => it.reason === "new"));
});

// ---------------------------------------------------------------------------
// 額外：間隔複習序列 / 錯題自動畢業 / importMistakes 兩種格式
// ---------------------------------------------------------------------------

test("答對就往下一級間隔前進，答錯退回上一級", () => {
  const skills = [makeSkill({ skillId: "G1-01-01", chapterOrder: 1 })];
  let progress = makeProgress({ skills });

  progress = recordAnswer(progress, { skillId: "G1-01-01", correct: true, usedHint: false, firstTry: true }, "2026-08-01");
  let skill = progress.skills.find((s) => s.skillId === "G1-01-01");
  assert.equal(skill.nextReview, "2026-08-02"); // 第 0 級：1 天後

  progress = recordAnswer(progress, { skillId: "G1-01-01", correct: true, usedHint: false, firstTry: true }, "2026-08-02");
  skill = progress.skills.find((s) => s.skillId === "G1-01-01");
  assert.equal(skill.nextReview, "2026-08-05"); // 第 1 級：3 天後

  progress = recordAnswer(progress, { skillId: "G1-01-01", correct: false, usedHint: false, firstTry: true }, "2026-08-05");
  skill = progress.skills.find((s) => s.skillId === "G1-01-01");
  assert.equal(skill.nextReview, "2026-08-06"); // 答錯退回第 0 級：1 天後
});

test("同一技能連續 2 次完美作答後，錯題池裡對應的錯題會被標記解決", () => {
  const skills = [makeSkill({ skillId: "G1-01-01", chapterOrder: 1 })];
  let progress = makeProgress({ skills });

  progress = recordAnswer(progress, { skillId: "G1-01-01", correct: false, usedHint: false, firstTry: true }, "2026-08-01");
  assert.equal(progress.mistakePool.filter((m) => !m.resolved).length, 1);

  progress = recordAnswer(progress, { skillId: "G1-01-01", correct: true, usedHint: false, firstTry: true }, "2026-08-02");
  progress = recordAnswer(progress, { skillId: "G1-01-01", correct: true, usedHint: false, firstTry: true }, "2026-08-03");

  const active = progress.mistakePool.filter((m) => m.skillId === "G1-01-01" && !m.resolved);
  assert.equal(active.length, 0, "連續兩次完美作答後應該從錯題池畢業");
});

test("importMistakes 吃得進遊戲格式與外部截圖格式，並各自標對 track", () => {
  const skills = bigCurriculumFixture();
  skills[0] = { ...skills[0], mode: "reverse" }; // 讓 mapModeToSkillId 有東西可對應
  const progress = makeProgress({ skills });

  const gameEntries = [
    { unit: "reverse", unitTitle: "🧠 逆向大偵探", time: "2026/4/28 下午9:30:00", usedHint: false },
  ];
  const externalEntries = [{ skillId: "G1-05-01", track: "school", date: "2026-07-20", note: "截圖分析：立體圖形認錯" }];

  const afterGame = importMistakes(progress, gameEntries);
  assert.equal(afterGame.mistakePool.length, 1);
  assert.equal(afterGame.mistakePool[0].source, "game");
  assert.equal(afterGame.mistakePool[0].addedDate, "2026-04-28");
  assert.equal(afterGame.mistakePool[0].inferred, true, "遊戲格式沒給 skillId，一律要標 inferred: true 讓人工校正");

  const afterBoth = importMistakes(afterGame, externalEntries);
  assert.equal(afterBoth.mistakePool.length, 2);
  const external = afterBoth.mistakePool.find((m) => m.skillId === "G1-05-01");
  assert.equal(external.source, "external");
  assert.equal(external.track, "school");
});

test("mapModeToSkillId 找不到對應 mode 時回傳 null（呼叫端要能優雅跳過）", () => {
  const skills = bigCurriculumFixture();
  assert.equal(mapModeToSkillId("不存在的模式", skills), null);
});

test("mapModeToSkillId 同 mode 有多個候選時，挑難度最低的未精熟技能", () => {
  const skills = [
    makeSkill({ skillId: "G1-06-03", mode: "reverse", chapterOrder: 6, difficulty: 2 }),
    makeSkill({ skillId: "G1-04-01", mode: "reverse", chapterOrder: 4, difficulty: 1 }),
    makeSkill({ skillId: "G1-16-02", mode: "reverse", chapterOrder: 16, difficulty: 4, mastered: true }),
  ];
  // 難度最低（1）的是 G1-04-01，即使它的 chapterOrder 比較後面也一樣要選它；
  // 已精熟的 G1-16-02 即使難度看起來吻合也不該被選到。
  assert.equal(mapModeToSkillId("reverse", skills), "G1-04-01");
});

test("REVIEW_INTERVALS_DAYS 是遞增序列（間隔複習設計上的基本假設）", () => {
  for (let i = 1; i < REVIEW_INTERVALS_DAYS.length; i++) {
    assert.ok(REVIEW_INTERVALS_DAYS[i] > REVIEW_INTERVALS_DAYS[i - 1]);
  }
});

test("planDaily 不會修改傳入的 progress（純函式）", () => {
  const skills = bigCurriculumFixture();
  const progress = makeProgress({ skills });
  const snapshot = JSON.stringify(progress);
  planDaily(progress, "2026-08-01");
  assert.equal(JSON.stringify(progress), snapshot);
});

test("recordAnswer 不會修改傳入的 progress（純函式）", () => {
  const skills = [makeSkill({ skillId: "G1-01-01", chapterOrder: 1 })];
  const progress = makeProgress({ skills });
  const snapshot = JSON.stringify(progress);
  recordAnswer(progress, { skillId: "G1-01-01", correct: true, usedHint: false, firstTry: true }, "2026-08-01");
  assert.equal(JSON.stringify(progress), snapshot);
});
