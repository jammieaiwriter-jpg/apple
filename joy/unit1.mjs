export const dialogueLines = [
  { speaker: "Nick", text: "Ahh...", role: "nick", scene: "A new place", zh: "啊...", scored: false },
  { speaker: "Abby", text: "Ouch!", role: "abby", scene: "A little bump", zh: "哎呀！", scored: false },
  { speaker: "Nick", text: "Are you okay?", role: "nick", scene: "Checking in", zh: "你還好嗎？" },
  { speaker: "Abby", text: "Yes, I am. Thank you.", role: "abby", scene: "Answer gently", zh: "我還好，謝謝。" },
  { speaker: "Nick", text: "Hi, I'm Nick. What's your name?", role: "nick", scene: "Meet Nick", zh: "嗨，我是 Nick。你叫什麼名字？" },
  { speaker: "Abby", text: "Hello, Nick. I'm Abby.", role: "abby", scene: "Meet Abby", zh: "你好 Nick，我是 Abby。" },
  { speaker: "Fifi", text: "Hello, Nick. Hello, Abby. I'm Fifi.", role: "fifi", scene: "Meet Fifi", zh: "你們好，我是 Fifi。" },
  { speaker: "Nick + Abby", text: "Hi, Fifi!", role: "together", scene: "Say hello", zh: "嗨，Fifi！" },
  { speaker: "Nick", text: "Where are we?", role: "nick", scene: "Look around", zh: "我們在哪裡？" },
  { speaker: "Abby", text: "I don't know.", role: "abby", scene: "Not sure yet", zh: "我不知道。" },
  { speaker: "Nick", text: "Look, a door.", role: "nick", scene: "Find a door", zh: "看，一扇門。" },
  { speaker: "Abby", text: "Let's go!", role: "abby", scene: "Move forward", zh: "我們走吧！" },
];

const contractionMap = new Map([
  ["i'm", "i am"],
  ["im", "i am"],
  ["what's", "what is"],
  ["whats", "what is"],
  ["don't", "do not"],
  ["dont", "do not"],
  ["let's", "let us"],
  ["lets", "let us"],
]);

export function normalizeSpeech(value) {
  let normalized = value.toLowerCase();
  for (const [from, to] of contractionMap.entries()) {
    normalized = normalized.replaceAll(from, to);
  }
  return normalized
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreSpeech(expected, heard) {
  const expectedWords = normalizeSpeech(expected).split(" ").filter(Boolean);
  const heardWords = normalizeSpeech(heard).split(" ").filter(Boolean);

  if (!heardWords.length) {
    return { stars: 0, percent: 0, matched: 0, total: expectedWords.length };
  }

  let cursor = 0;
  let matched = 0;
  for (const word of expectedWords) {
    const foundAt = heardWords.indexOf(word, cursor);
    if (foundAt !== -1) {
      matched += 1;
      cursor = foundAt + 1;
    }
  }

  const coverage = matched / Math.max(expectedWords.length, 1);
  const extraPenalty = Math.max(heardWords.length - expectedWords.length - 2, 0) * 0.04;
  const percent = Math.max(0, Math.min(1, coverage - extraPenalty));
  let stars = Math.ceil(percent * 5 + 0.25);

  if (matched === expectedWords.length) stars = 5;
  if (matched === 0) stars = 1;
  if (stars === 0 && heardWords.length) stars = 1;

  return {
    stars,
    percent: Math.round(percent * 100),
    matched,
    total: expectedWords.length,
  };
}

export function getPracticeTurn(line, childRole = "abby") {
  if (line.role === "together") return "一起說";
  if (line.role === childRole) return "你的回合";
  return "先聽網頁說";
}

// 每個角色一種聲音，語速放慢給小一孩子。回傳純資料（voiceName + pitch + rate），
// 方便測試；瀏覽器端再依 voiceName 找實際 voice 物件。
export function resolveVoiceProfile(voices, role) {
  const profiles = {
    nick: { candidates: ["Aaron", "Daniel", "Fred", "Arthur", "Albert", "Reed"], pitch: 0.8, rate: 0.66 },
    abby: { candidates: ["Samantha", "Allison", "Ava", "Karen", "Susan"], pitch: 1.2, rate: 0.68 },
    fifi: { candidates: ["Karen", "Samantha", "Allison", "Ava"], pitch: 1.3, rate: 0.7 },
    together: { candidates: ["Samantha", "Karen"], pitch: 1.05, rate: 0.68 },
  };
  const profile = profiles[role] ?? profiles.together;
  const enVoices = (voices ?? []).filter((voice) => voice?.lang?.toLowerCase?.().startsWith("en"));
  let voice = null;
  for (const name of profile.candidates) {
    voice = enVoices.find((v) => v.name === name) ?? enVoices.find((v) => v.name?.includes(name));
    if (voice) break;
  }
  if (!voice) voice = enVoices.find((v) => v.lang === "en-US") ?? enVoices[0] ?? null;
  return { voiceName: voice ? voice.name : null, pitch: profile.pitch, rate: profile.rate };
}

export function isLineScored(line) {
  return line.scored !== false;
}

export function chooseRecorderMimeType(isTypeSupported) {
  const candidates = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/aac"];
  return candidates.find((type) => isTypeSupported(type)) ?? "";
}

export function loadScores(storage, length, key = "joy-unit1-scores") {
  try {
    const parsed = JSON.parse(storage?.getItem(key) ?? "[]");
    if (!Array.isArray(parsed)) return new Array(length).fill(0);
    return Array.from({ length }, (_, index) => {
      const value = Number(parsed[index]);
      return Number.isFinite(value) ? Math.max(0, Math.min(5, Math.round(value))) : 0;
    });
  } catch {
    return new Array(length).fill(0);
  }
}

export function saveScores(storage, scores, key = "joy-unit1-scores") {
  try {
    storage?.setItem(key, JSON.stringify(scores));
  } catch {
    // Safari private mode can throw on localStorage writes.
  }
}

export function getSortedLineIndexes(lines, scores) {
  return lines
    .map((line, index) => ({ line, index, score: scores[index] ?? 0 }))
    .sort((a, b) => {
      const aWeak = isLineScored(a.line) && a.score < 5;
      const bWeak = isLineScored(b.line) && b.score < 5;
      if (aWeak !== bWeak) return aWeak ? -1 : 1;
      return a.index - b.index;
    })
    .map((item) => item.index);
}

// ---- Unit 1 加強內容：單字、Phonics、文法（be 動詞）----

// 核心單字（KK 音標出自佳音單字表）
export const vocab = [
  { word: "hi", kk: "[haɪ]", pos: "int.", zh: "嗨" },
  { word: "hello", kk: "[hɛˈlo]", pos: "int.", zh: "哈囉" },
  { word: "I", kk: "[aɪ]", pos: "pron.", zh: "我" },
  { word: "you", kk: "[ju]", pos: "pron.", zh: "你" },
  { word: "your", kk: "[jʊr]", pos: "pron.", zh: "你的" },
  { word: "am", kk: "[æm]", pos: "v.", zh: "是（be 動詞，配 I）" },
  { word: "is", kk: "[ɪz]", pos: "v.", zh: "是（be 動詞，配 he/she）" },
  { word: "are", kk: "[ɑr]", pos: "v.", zh: "是（be 動詞，配 you）" },
  { word: "name", kk: "[nem]", pos: "n.", zh: "名字" },
  { word: "what", kk: "[(h)wɑt]", pos: "pron.", zh: "什麼" },
  { word: "ouch", kk: "[aʊtʃ]", pos: "int.", zh: "哎喲" },
  { word: "Nick", kk: "[nɪk]", pos: "n.", zh: "尼克（人名）" },
  { word: "Abby", kk: "[ˈæbɪ]", pos: "n.", zh: "艾比（人名）" },
];

// Phonics 字母篇：Unit 1 = Aa–Cc
export const phonics = {
  letters: "Aa–Cc",
  items: [
    { letter: "Aa", sound: "/æ/", examples: [{ w: "ant", zh: "螞蟻" }, { w: "mad", zh: "生氣的" }] },
    { letter: "Bb", sound: "/b/", examples: [{ w: "bag", zh: "袋子" }, { w: "big", zh: "大的" }] },
    { letter: "Cc", sound: "/k/", examples: [{ w: "cat", zh: "貓" }, { w: "cute", zh: "可愛的" }] },
  ],
};

// 文法：be 動詞 I am / You are / He·She is
export const grammar = {
  title: "be 動詞：am / is / are",
  rule: "I 配 am；you 配 are；he / she / it 配 is。",
  examples: [
    { text: "I am Nick.", zh: "我是 Nick。" },
    { text: "You are Abby.", zh: "你是 Abby。" },
    { text: "She is Fifi.", zh: "她是 Fifi。" },
  ],
  quiz: [
    { subject: "I", answer: "am", full: "I am Nick.", zh: "我是 Nick。" },
    { subject: "You", answer: "are", full: "You are Abby.", zh: "你是 Abby。" },
    { subject: "She", answer: "is", full: "She is Fifi.", zh: "她是 Fifi。" },
    { subject: "I", answer: "am", full: "I am happy.", zh: "我很開心。" },
    { subject: "You", answer: "are", full: "You are good.", zh: "你很棒。" },
  ],
};

export const beOptions = ["am", "is", "are"];

export function checkBeAnswer(item, picked) {
  return Boolean(item) && item.answer === picked;
}

// 通用的「看過/聽過」布林記錄（給預習各區塊用），讀寫都防 Safari 無痕例外
export function loadFlags(storage, length, key) {
  try {
    const parsed = JSON.parse(storage?.getItem(key) ?? "[]");
    if (!Array.isArray(parsed)) return new Array(length).fill(false);
    return Array.from({ length }, (_, i) => Boolean(parsed[i]));
  } catch {
    return new Array(length).fill(false);
  }
}

export function saveFlags(storage, flags, key) {
  try {
    storage?.setItem(key, JSON.stringify(flags));
  } catch {
    // Safari private mode can throw on localStorage writes.
  }
}
