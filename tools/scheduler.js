// tools/scheduler.js
//
// Apple 小一數學系統 — 適性排課引擎。
// 純瀏覽器 ES module，零外部相依，可直接 <script type="module"> 或 import 使用。
//
// 設計原則（見 curriculum/BUILD_CONTRACT.md §0、§4.3）：
//   - 純函式：不修改傳入的 progress，一律回傳新物件。
//   - today 一律由呼叫端傳入字串（格式 "YYYY-MM-DD"），函式內部絕不呼叫 new Date() 取得「現在」，
//     這樣排課邏輯才能被測試、被回放（demo 模擬 30 天）。
//   - progress.json 的欄位是定死的契約，這個檔案不會新增或改名任何 skills[] 欄位。
//     mistakePool[] 裡每一筆的欄位是本檔案自訂的（契約沒有規定它的內部結構，
//     只規定要能標 track），詳見 SCHEDULER.md。
//
// 對外函式（介面契約，不可更改簽章）：
//   planDaily(progress, today)               → { items, meta }
//   recordAnswer(progress, answer, today)     → 新的 progress
//   updateStreak(progress, today)             → 新的 progress
//   importMistakes(progress, entries)         → 新的 progress

// ---------------------------------------------------------------------------
// 常數
// ---------------------------------------------------------------------------

/** 同一個技能，一天內最多出現幾題（不管是新題／複習／錯題變式）。 */
export const MAX_ITEMS_PER_SKILL_PER_DAY = 3;

/** 每個錯題最多接幾題變式。 */
export const VARIANTS_PER_MISTAKE = 2;

/**
 * 間隔複習序列（天）。
 *
 * 刻意選一個固定、好懂的序列，不做 SM-2 那種依「難度係數」動態調整間隔的複雜算法：
 * 小一學生的複習排程不需要那麼精細，固定序列容易解釋（「明天再考一次」「一週後再考一次」），
 * 也容易除錯 —— 出問題時攤開序列就知道現在第幾級。
 * 序列本身是 Leitner 卡片盒的常見分層：1 天 → 3 天 → 一週 → 兩週 → 一個月封頂。
 */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];

/** 錯題池：同一技能累積幾次「完美作答」後視為已改正，從池中撤下。 */
export const MISTAKE_RESOLVE_STREAK = 2;

const DEFAULT_DAILY = { quota: 12, newSkills: 6, review: 3, mistakes: 3 };

// ---------------------------------------------------------------------------
// 日期工具（全部是純函式，today / date 一律用外部傳入的 "YYYY-MM-DD" 字串）
// ---------------------------------------------------------------------------

function toUTCDate(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`);
}

function daysBetween(fromStr, toStr) {
  const ms = toUTCDate(toStr).getTime() - toUTCDate(fromStr).getTime();
  return Math.round(ms / 86400000);
}

function addDays(dateStr, n) {
  const d = toUTCDate(dateStr);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// 1. 每日排課
// ---------------------------------------------------------------------------

/**
 * 排出今天的 12 題。
 *
 * 配額 6 / 3 / 3，優先順序：
 *   1) 錯題變式 —— 她已經露出破綻，先補洞。錯題池空／不夠時，名額讓給複習。
 *   2) 到期複習 —— nextReview <= today 且 unlocked 且未精熟的技能。複習也不夠時，名額讓給新技能。
 *   3) 新技能   —— 只從 unlocked === false（真正全新）的技能裡挑，依課綱順序
 *                  （grade → chapterOrder → skillId）往下推；只有全新技能挑光了，才回頭把
 *                  「已解鎖但還沒精熟」的技能當備援塞進來（見下方 inProgressBackup）。
 *                  這條規則是刻意的：絕不能跟「已解鎖但未精熟」的技能混在同一池排序選，
 *                  混在一起選會讓已解鎖技能每天優先吃滿名額，新技能配額永遠推不進課綱後面
 *                  （前一輪 agent 的 bug，見 SCHEDULER.md）。
 *                  排序鍵一定要先比 grade 再比 chapterOrder —— 每個年級的 chapterOrder 都是
 *                  各自從 1 開始編號，只比 chapterOrder 會讓 G2 第 1 章跟 G1 第 1 章排在一起，
 *                  她才剛開始學小一就會混到小二的新技能（2026-07-31 建 G2 課綱時發現的 bug，
 *                  已修正；回歸測試見 scheduler.test.mjs「跨年級不能混新技能」案例）。
 *
 * 同一技能一天內最多出現 MAX_ITEMS_PER_SKILL_PER_DAY（3）題，跨三個配額共用同一個上限，
 * 不是每個配額各自 3 題 —— 避免某個技能今天被塞爆、排擠掉其他技能。
 *
 * @param {object} progress progress.json 的內容（不會被修改）
 * @param {string} today "YYYY-MM-DD"
 * @returns {{items: Array<object>, meta: object}}
 */
export function planDaily(progress, today) {
  const daily = { ...DEFAULT_DAILY, ...((progress._meta && progress._meta.daily) || {}) };
  const skills = progress.skills || [];
  const bySkillId = new Map(skills.map((s) => [s.skillId, s]));

  const items = [];
  const perSkillCount = new Map();

  const roomFor = (skillId, want) => {
    const used = perSkillCount.get(skillId) || 0;
    return Math.max(0, Math.min(want, MAX_ITEMS_PER_SKILL_PER_DAY - used));
  };

  const pushItem = (skillId, reason, extra = {}) => {
    const skill = bySkillId.get(skillId);
    items.push({
      skillId,
      reason, // "new" | "review" | "mistake"
      difficulty: skill ? skill.difficulty : null,
      track: extra.track || (skill && skill.track) || "school",
      ...extra,
    });
    perSkillCount.set(skillId, (perSkillCount.get(skillId) || 0) + 1);
  };

  // ---- 1) 錯題變式：優先權最高 ----
  // 精熟的技能永久撤出題池（含錯題變式）—— 理論上 recordAnswer 精熟時 mistakePool 會被
  // resolveMistakesFor 清掉，這裡用 bySkillId 再擋一層防呆，避免資料不一致時漏網。
  let mistakeBudget = daily.mistakes;
  const activeMistakes = (progress.mistakePool || [])
    .filter((m) => !m.resolved)
    .filter((m) => {
      const skill = bySkillId.get(m.skillId);
      return !skill || !skill.mastered; // 奧數錯題（OLY-*）目前不在 skills[] 裡，一律放行
    })
    .slice()
    .sort((a, b) => (a.addedDate || "").localeCompare(b.addedDate || ""));

  for (const m of activeMistakes) {
    if (mistakeBudget <= 0) break;
    const want = Math.min(VARIANTS_PER_MISTAKE, mistakeBudget);
    const room = roomFor(m.skillId, want);
    for (let i = 0; i < room; i++) {
      pushItem(m.skillId, "mistake", { mistakeId: m.id, track: m.track, variantIndex: i + 1 });
      mistakeBudget--;
    }
  }

  // 錯題池空／不夠時，名額讓給複習（不硬湊）
  let reviewBudget = daily.review + mistakeBudget;

  // ---- 2) 到期複習：nextReview <= today 且 unlocked 且未精熟 ----
  const dueSkills = skills
    .filter((s) => s.unlocked && !s.mastered && s.nextReview && s.nextReview <= today)
    .slice()
    .sort((a, b) => a.nextReview.localeCompare(b.nextReview) || a.chapterOrder - b.chapterOrder);

  for (const s of dueSkills) {
    if (reviewBudget <= 0) break;
    const room = roomFor(s.skillId, reviewBudget);
    for (let i = 0; i < room; i++) {
      pushItem(s.skillId, "review");
      reviewBudget--;
    }
  }

  // 複習也不夠時，名額才讓給新技能
  let newBudget = daily.newSkills + reviewBudget;

  // ---- 3) 新技能：優先解鎖「真正全新」的技能，依課綱順序（chapterOrder → skillId）往下推 ----
  //
  // 這是回歸測試要守住的地方：新技能配額只能從 unlocked === false 的技能裡挑，
  // 絕對不能跟「已解鎖但還沒精熟」的技能混在同一個池子排序選 —— 混在一起選會導致
  // 已解鎖的技能因為 chapterOrder 排在前面、每天優先吃滿 MAX_ITEMS_PER_SKILL_PER_DAY，
  // 新技能配額永遠被同一批已解鎖技能吃光，課綱後面的技能永遠排不到（前一輪的 bug）。
  //
  // 跨年級（例如 progress.skills 同時有 G1 與 G2）還有第二條規則：新技能只從
  // 「目前作用年級」挑，目前作用年級＝還有技能沒精熟的最低年級。G2 要等 G1 全部
  // 技能都 mastered 才會出現在新技能池，不是 unlocked 完就換 —— 只解鎖過一遍不代表
  // 學會了，過早混入下一年級的新概念沒有意義。(2026-07-31 建 G2 課綱時發現：
  // 若只用「先比 grade 再比 chapterOrder」排序，會在 G1 最後一個技能剛解鎖的
  // 當天，把當天剩餘名額也分給 G2，等於她才學到小一最後一課就混到小二概念；
  // 改成下面這個「目前作用年級」關卡才會完全隔開。回歸測試見 scheduler.test.mjs
  // 「跨年級不能混新技能」案例。)
  const activeGrade = (() => {
    const grades = [...new Set(skills.map((s) => s.grade))].sort();
    return grades.find((g) => skills.some((s) => s.grade === g && !s.mastered)) ?? null;
  })();

  const lockedFrontier = skills
    .filter((s) => !s.unlocked && !s.mastered && s.grade === activeGrade)
    .slice()
    .sort((a, b) => a.chapterOrder - b.chapterOrder || a.skillId.localeCompare(b.skillId));

  for (const s of lockedFrontier) {
    if (newBudget <= 0) break;
    const room = roomFor(s.skillId, newBudget);
    if (room <= 0) continue; // 理論上不會發生（全新技能今天還沒被排過），防呆保留
    for (let i = 0; i < room; i++) {
      pushItem(s.skillId, "new");
      newBudget--;
    }
  }

  // 備援：只有當「真正全新」的技能已經全部解鎖完（lockedFrontier 空了，課綱推到底），
  // 新技能配額才允許回頭挑「已解鎖但還沒精熟、也還沒到複習週期」的技能，避免題目湊不滿 12 題。
  // 正常情況下這種技能該由 review 配額接手，這裡只是最後的安全網。
  if (newBudget > 0) {
    const inProgressBackup = skills
      .filter((s) => s.unlocked && !s.mastered && s.grade === activeGrade)
      .slice()
      .sort((a, b) => a.chapterOrder - b.chapterOrder || a.skillId.localeCompare(b.skillId));

    for (const s of inProgressBackup) {
      if (newBudget <= 0) break;
      const room = roomFor(s.skillId, newBudget);
      if (room <= 0) continue;
      for (let i = 0; i < room; i++) {
        pushItem(s.skillId, "new");
        newBudget--;
      }
    }
  }

  return {
    items,
    meta: {
      date: today,
      requested: daily.quota,
      planned: items.length,
      shortfall: Math.max(0, daily.quota - items.length),
      quotas: {
        mistake: { requested: daily.mistakes, filled: items.filter((i) => i.reason === "mistake").length },
        review: { requested: daily.review, filled: items.filter((i) => i.reason === "review").length },
        new: { requested: daily.newSkills, filled: items.filter((i) => i.reason === "new").length },
      },
      pointerSchool: progress._meta && progress._meta.pointer && progress._meta.pointer.school,
    },
  };
}

// ---------------------------------------------------------------------------
// 2. 作答結果回寫
// ---------------------------------------------------------------------------

/**
 * 記錄一題的作答結果，回傳新的 progress。
 *
 * 精熟規則（照 progress.json 的 _meta.masteryRule）：
 *   連續 10 題「首次作答正確且全程無提示」＝ 1 次完美通關，currentStreak 歸零。
 *   累積 10 次完美通關 → mastered: true，永久撤出題池。
 *   答錯、看提示、看答案，三者都讓 currentStreak 歸零，並把該技能推進 mistakePool。
 *
 * 注意：這個函式的簽章只給 { correct, usedHint, firstTry } 三個布林值（依契約），
 * 沒有另外區分「看提示」跟「看答案」。這裡把 usedHint 當作「這一題不是完全獨立作答」的
 * 總稱旗標 —— 對 streak / 錯題池的影響兩者是一樣的，差別只在統計分類，
 * 如果之後要分開統計需要擴充欄位（見 SCHEDULER.md 開放問題）。
 *
 * @param {object} progress
 * @param {{skillId: string, correct: boolean, usedHint: boolean, firstTry: boolean}} answer
 * @param {string} today "YYYY-MM-DD"
 * @returns {object} 新的 progress
 */
export function recordAnswer(progress, { skillId, correct, usedHint, firstTry }, today) {
  const rule = (progress._meta && progress._meta.masteryRule) || {
    perfectRunLength: 10,
    perfectRunsToMaster: 10,
  };

  const skills = progress.skills.map((s) => (s.skillId === skillId ? { ...s } : s));
  const skill = skills.find((s) => s.skillId === skillId);
  if (!skill) {
    throw new Error(`recordAnswer: progress.json 裡找不到技能 ${skillId}`);
  }

  const prevLastPracticed = skill.lastPracticed;
  const prevNextReview = skill.nextReview;

  skill.attempts += 1;
  skill.unlocked = true;
  if (usedHint) skill.usedHint += 1;
  if (correct && firstTry) skill.correctFirstTry += 1;

  let mistakePool = progress.mistakePool || [];

  if (skill.mastered) {
    // 已經永久撤出題池：只記統計數字，不再變動 streak / 複習排程 / 錯題池。
    skill.lastPracticed = today;
    return { ...progress, skills, mistakePool };
  }

  const isPerfect = correct === true && firstTry === true && usedHint !== true;

  if (isPerfect) {
    skill.currentStreak += 1;
    if (skill.currentStreak >= rule.perfectRunLength) {
      skill.perfectRuns += 1;
      skill.currentStreak = 0;
      if (skill.perfectRuns >= rule.perfectRunsToMaster) {
        skill.mastered = true;
      }
    }
    mistakePool = resolveMistakesFor(mistakePool, skillId, today);
  } else {
    skill.currentStreak = 0;
    const reason = !correct ? "wrong" : usedHint ? "hint" : "retry";
    mistakePool = pushMistake(mistakePool, {
      skillId,
      track: skill.track,
      reason,
      date: today,
      source: "answer",
    });
  }

  // 間隔複習：progress.json 沒有「目前第幾級」的欄位可以存，
  // 用舊的 lastPracticed / nextReview 反推上次排在哪一級，再依這次對錯前進或退回一級。
  //
  // 注意：一個技能一天可能被排到最多 3 題（新題或錯題變式都可能連續問同一技能）。
  // 如果每一題都各自往前/往後推一級，同一天問 3 題、3 題都答對，
  // 間隔會從「明天」一路跳到「一週後」，複習配額就會長期沒東西可排（demo 模擬時就抓到這個問題）。
  // 所以間隔調整「一天只認定一次」：用當天第一次作答這個技能的結果決定，
  // 同一天之後再考同一技能不會重複往前/往後推。這是刻意的簡化，見 SCHEDULER.md。
  const alreadyScheduledToday = prevLastPracticed === today;

  if (skill.mastered) {
    skill.nextReview = null;
  } else if (!alreadyScheduledToday) {
    const idx = inferIntervalIndex(prevLastPracticed, prevNextReview);
    const nextIdx = correct ? Math.min(idx + 1, REVIEW_INTERVALS_DAYS.length - 1) : Math.max(idx - 1, 0);
    skill.nextReview = addDays(today, REVIEW_INTERVALS_DAYS[nextIdx]);
  }
  // alreadyScheduledToday && !mastered → 保留今天稍早已經算好的 nextReview，不重複調整

  skill.lastPracticed = today;

  return { ...progress, skills, mistakePool };
}

function inferIntervalIndex(lastPracticed, nextReview) {
  if (!lastPracticed || !nextReview) return -1; // 從沒排過複習 → 這次當作第 0 級（1 天後）
  const prevInterval = daysBetween(lastPracticed, nextReview);
  let idx = REVIEW_INTERVALS_DAYS.indexOf(prevInterval);
  if (idx === -1) {
    // 防呆：如果日期被外部改過、對不上序列裡任何一個值，取最接近的級數，不會壞掉。
    idx = REVIEW_INTERVALS_DAYS.reduce(
      (best, val, i) => (Math.abs(val - prevInterval) < Math.abs(REVIEW_INTERVALS_DAYS[best] - prevInterval) ? i : best),
      0
    );
  }
  return idx;
}

// ---------------------------------------------------------------------------
// 3. 連續天數 streak
// ---------------------------------------------------------------------------

/**
 * 呼叫時機：當天的 12 題全部完成後，由呼叫端呼叫一次。
 * 這個函式本身不去推斷「今天是否做完 12 題」—— 那是呼叫端（index.html / 排課迴圈）的責任，
 * 因為 progress.json 沒有存「今天已完成幾題」這個逐題計數欄位。
 *
 * @param {object} progress
 * @param {string} today "YYYY-MM-DD"
 * @returns {object} 新的 progress
 */
export function updateStreak(progress, today) {
  const meta = progress._meta || {};
  const streak = meta.streak || { current: 0, longest: 0, lastDone: null };

  let current;
  if (streak.lastDone === today) {
    current = streak.current; // 同一天被呼叫兩次，不重複累加
  } else if (streak.lastDone && daysBetween(streak.lastDone, today) === 1) {
    current = streak.current + 1; // 昨天也做了，連續天數 +1
  } else {
    // 沒有紀錄，或斷了一天以上：累積的連續天數歸零，今天是新紀錄的第 1 天。
    current = 1;
  }
  const longest = Math.max(streak.longest || 0, current);

  return {
    ...progress,
    _meta: { ...meta, streak: { current, longest, lastDone: today } },
  };
}

// ---------------------------------------------------------------------------
// 4. 錯題匯入
// ---------------------------------------------------------------------------

/**
 * 把外部錯題資料吃進 mistakePool。支援兩種來源格式，見 normalizeMistakeEntry()。
 * 奧數（track: "olympiad"）與學校（track: "school"）錯題進同一個池，
 * 排課時不分開配額，只用 track 欄位區分統計。
 *
 * @param {object} progress
 * @param {Array<object>} entries
 * @returns {object} 新的 progress
 */
export function importMistakes(progress, entries) {
  let mistakePool = progress.mistakePool || [];
  for (const raw of entries || []) {
    const normalized = normalizeMistakeEntry(raw, progress.skills);
    if (!normalized) continue; // 無法辨識或對應不到技能，跳過
    mistakePool = pushMistake(mistakePool, normalized);
  }
  return { ...progress, mistakePool };
}

function normalizeMistakeEntry(raw, skills) {
  // 外部（截圖分析）格式：{ skillId, track?, date, reason?, note? }
  if (raw.skillId) {
    const skill = skills.find((s) => s.skillId === raw.skillId);
    return {
      skillId: raw.skillId,
      track: raw.track || (skill && skill.track) || "school",
      reason: raw.reason || "wrong",
      date: raw.date || raw.addedDate,
      source: raw.source || "external",
      note: raw.note,
    };
  }

  // 遊戲格式：{ unit, unitTitle, time, usedHint }（見 game-mistakes.json / game-mistakes-2.json）
  if (raw.unit) {
    const skillId = mapModeToSkillId(raw.unit, skills);
    if (!skillId) return null; // unit 代碼目前對應不到任何技能（連同 mode 都找不到），跳過
    return {
      skillId,
      track: "school",
      reason: raw.usedHint ? "hint" : "wrong",
      date: parseGameTime(raw.time),
      source: "game",
      inferred: true, // 遊戲格式從沒有給過 skillId，一律是猜的，人工可事後校正（見 SCHEDULER.md）
      note: raw.unitTitle,
    };
  }

  return null;
}

/**
 * 遊戲錯題只記錄舊系統的模式代碼（unit），沒有記錄實際 skillId，對應不到「明確」的技能。
 * 依規則：先在 math-g1-school.json 裡找 mode 欄位等於這個 unit 代碼、且未精熟的技能，
 * 在這些候選裡選「難度最低」的一個當代表技能（difficulty 由小到大；同難度時依課綱順序取最前面）。
 * 這是用猜的，不保證每次都對 —— 這也是為什麼 normalizeMistakeEntry 一律標 inferred: true，
 * 讓看 mistakePool 的人知道這筆是系統猜的，需要時可以手動改成正確的 skillId。
 *
 * 如果這個 unit 代碼在目前的課綱模式（jump/reverse/story/clock/space/length/chart）裡完全沒有
 * 對應（例如舊遊戲的「even 奇偶數判別」，目前小一課綱還沒有這個技能），就回傳 null，
 * 呼叫端會跳過這筆、不會硬塞進錯的技能裡。這是契約沒講清楚的地方，見 SCHEDULER.md。
 */
export function mapModeToSkillId(mode, skills) {
  const candidates = skills.filter((s) => s.mode === mode && !s.mastered);
  if (candidates.length === 0) return null;
  const pool = candidates.slice();
  pool.sort(
    (a, b) => a.difficulty - b.difficulty || a.chapterOrder - b.chapterOrder || a.skillId.localeCompare(b.skillId)
  );
  return pool[0].skillId;
}

function parseGameTime(timeStr) {
  // "2026/4/28 下午9:30:00" → "2026-04-28"（只取日期部分，時分秒排課用不到）
  if (!timeStr) return null;
  const m = timeStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// mistakePool 內部輔助函式
// ---------------------------------------------------------------------------

function findActiveMistake(mistakePool, skillId) {
  return mistakePool.find((m) => m.skillId === skillId && !m.resolved);
}

/**
 * 新增一筆錯題，或者如果這個技能已經有一筆「未解決」的錯題，就合併進去
 * （更新 lastSeenDate / reason / occurrences，correctStreak 歸零）—— 避免同一個技能
 * 每錯一次就在池子裡多開一筆，池子會無限長大。
 */
function pushMistake(mistakePool, { skillId, track, reason, date, source, note, inferred }) {
  const existing = findActiveMistake(mistakePool, skillId);
  if (existing) {
    return mistakePool.map((m) =>
      m === existing
        ? { ...m, lastSeenDate: date, reason, occurrences: (m.occurrences || 1) + 1, correctStreak: 0 }
        : m
    );
  }
  const entry = {
    id: `${skillId}::${date}`,
    skillId,
    track: track || "school",
    reason, // "wrong" | "hint" | "retry"
    source: source || "answer", // "answer" | "game" | "external"
    addedDate: date,
    lastSeenDate: date,
    occurrences: 1,
    correctStreak: 0,
    resolved: false,
    resolvedDate: null,
  };
  if (note) entry.note = note;
  if (inferred) entry.inferred = true; // 遊戲格式猜出來的 skillId，人工可事後校正
  return [...mistakePool, entry];
}

/**
 * 技能答對一題完美（isPerfect）時呼叫：幫這個技能所有未解決的錯題累加 correctStreak，
 * 累積到 MISTAKE_RESOLVE_STREAK 次就標記 resolved，從錯題池「畢業」。
 */
function resolveMistakesFor(mistakePool, skillId, today) {
  return mistakePool.map((m) => {
    if (m.skillId !== skillId || m.resolved) return m;
    const correctStreak = (m.correctStreak || 0) + 1;
    if (correctStreak >= MISTAKE_RESOLVE_STREAK) {
      return { ...m, correctStreak, resolved: true, resolvedDate: today };
    }
    return { ...m, correctStreak };
  });
}
