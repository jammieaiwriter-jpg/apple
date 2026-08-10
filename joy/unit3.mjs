export const dialogueLines = [
  {
    "speaker": "Scarecrow",
    "text": "Boohooo...",
    "role": "nick",
    "scene": "Someone is crying",
    "zh": "嗚嗚……",
    "scored": false
  },
  {
    "speaker": "Nick",
    "text": "Listen!",
    "role": "nick",
    "scene": "Listen carefully",
    "zh": "聽啊！"
  },
  {
    "speaker": "Abby",
    "text": "Let's help!",
    "role": "abby",
    "scene": "Go help",
    "zh": "我們去幫忙吧！"
  },
  {
    "speaker": "Abby",
    "text": "Are you okay?",
    "role": "abby",
    "scene": "Checking in",
    "zh": "你還好嗎？"
  },
  {
    "speaker": "Scarecrow",
    "text": "Yes, I am.",
    "role": "nick",
    "scene": "Scarecrow answers",
    "zh": "嗯，我還好。"
  },
  {
    "speaker": "Abby",
    "text": "Good morning. I'm Abby. This is Nick.",
    "role": "abby",
    "scene": "Morning greeting",
    "zh": "早安，我是艾比。這位是尼克。"
  },
  {
    "speaker": "Scarecrow",
    "text": "Good morning. I'm Scarecrow.",
    "role": "nick",
    "scene": "Meet Scarecrow",
    "zh": "早安。我是稻草人。"
  },
  {
    "speaker": "Fifi",
    "text": "Good morning. I'm Fifi.",
    "role": "fifi",
    "scene": "Fifi says hello",
    "zh": "早安。我是菲菲。"
  }
];

const contractionMap = new Map([
  ["i'm", "i am"],
  ["im", "i am"],
  ["what's", "what is"],
  ["whats", "what is"],
  ["who's", "who is"],
  ["whos", "who is"],
  ["he's", "he is"],
  ["hes", "he is"],
  ["it's", "it is"],
  ["its", "it is"],
  ["don't", "do not"],
  ["dont", "do not"],
  ["let's", "let us"],
  ["lets", "let us"],
]);

const HOMO = new Map(Object.entries({
  to:'two',too:'two',two:'two',for:'four',fore:'four',four:'four',ate:'eight',eight:'eight',
  won:'one',one:'one',our:'our',hour:'our',no:'no',know:'no',new:'new',knew:'new',
  there:'there',their:'there',theyre:'there',here:'here',hear:'here',your:'your',youre:'your',
  by:'by',buy:'by',bye:'by',see:'see',sea:'see',be:'be',bee:'be',right:'right',write:'right',
  son:'son',sun:'son',meat:'meat',meet:'meat',week:'week',weak:'weak',wait:'wait',weight:'wait',
  pair:'pair',pear:'pair',plane:'plane',plain:'plain',road:'road',rode:'road',sale:'sale',sail:'sale',
  tail:'tail',tale:'tale',threw:'threw',through:'threw',wood:'wood',would:'wood',
  flour:'flour',flower:'flour',blue:'blue',blew:'blue',night:'night',knight:'night',
  hi:'hi',high:'hi',mail:'mail',male:'mail',eye:'i',i:'i',red:'red',read:'red',
}));
const CN1 = { zero:0,oh:0,o:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9 };
const CN2 = { ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19 };
const CN3 = { twenty:20,thirty:30,forty:40,fourty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90 };

// 同音字 + 數字收斂。兩者都是「孩子沒唸錯卻被扣分」的來源：
//   ① to / two / too 在語音上是同一個音，辨識器選哪個是它的猜測（實際遇過只給 1 星）
//   ② 「Taipei 101」會被聽成「taipei one o one」，o / oh 也要當 zero
// 連續個位數只在 3 位以上才合併，否則 "two to" 會被誤併成 22。
export function canonSeq(str) {
  let words = String(str || "").toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  words = words.map((w) => (HOMO.has(w) ? HOMO.get(w) : w));
  const out = [];
  let i = 0;
  while (i < words.length) {
    const w = words[i];
    let v = null;
    if (/^\d+$/.test(w)) { out.push(w); i += 1; continue; }
    if (CN3[w] !== undefined) { v = CN3[w]; if (CN1[words[i + 1]] > 0) { v += CN1[words[i + 1]]; i += 1; } }
    else if (CN2[w] !== undefined) v = CN2[w];
    else if (CN1[w] !== undefined) v = CN1[w];
    if (v === null) { out.push(w); i += 1; continue; }
    while (words[i + 1] === "hundred" || words[i + 1] === "thousand") {
      v *= words[i + 1] === "hundred" ? 100 : 1000;
      i += 1;
      if (words[i + 1] === "and") i += 1;
      const nx = words[i + 1];
      let add = null;
      if (nx !== undefined) {
        if (CN3[nx] !== undefined) { add = CN3[nx]; if (CN1[words[i + 2]] > 0) { add += CN1[words[i + 2]]; i += 1; } }
        else if (CN2[nx] !== undefined) add = CN2[nx];
        else if (CN1[nx] > 0) add = CN1[nx];
        if (add !== null) { v += add; i += 1; }
      }
    }
    out.push(String(v));
    i += 1;
  }
  const merged = [];
  let run = [];
  const flush = () => {
    if (run.length >= 3) merged.push(run.join(""));
    else run.forEach((x) => merged.push(x));
    run = [];
  };
  out.forEach((t) => { if (/^\d$/.test(t)) run.push(t); else { flush(); merged.push(t); } });
  flush();
  return merged;
}

export function normalizeSpeech(value) {
  let normalized = String(value || "").toLowerCase();
  for (const [from, to] of contractionMap.entries()) {
    normalized = normalized.replaceAll(from, to);
  }
  return canonSeq(normalized).join(" ");
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

export const AZURE_VOICE = {
  nick: "en-US-GuyNeural",
  abby: "en-US-JennyNeural",
  fifi: "en-US-AnaNeural",
  together: "en-US-AriaNeural",
};

export function azureVoiceForRole(role) {
  return AZURE_VOICE[role] ?? AZURE_VOICE.together;
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

export function loadScores(storage, length, key = "joy-unit3-scores") {
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

export function saveScores(storage, scores, key = "joy-unit3-scores") {
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

// ---- Unit 3 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "listen",
    "kk": "[ˈlɪsən]",
    "pos": "v.",
    "zh": "聽"
  },
  {
    "word": "good",
    "kk": "[gʊd]",
    "pos": "adj.",
    "zh": "好的"
  },
  {
    "word": "morning",
    "kk": "[ˈmɔrnɪŋ]",
    "pos": "n.",
    "zh": "早上"
  },
  {
    "word": "afternoon",
    "kk": "[ˌæftɚˈnun]",
    "pos": "n.",
    "zh": "下午"
  },
  {
    "word": "evening",
    "kk": "[ˈivnɪŋ]",
    "pos": "n.",
    "zh": "傍晚；晚上"
  },
  {
    "word": "this",
    "kk": "[ðɪs]",
    "pos": "pron.",
    "zh": "這個"
  },
  {
    "word": "boohoo",
    "kk": "[buˈhu]",
    "pos": "n.",
    "zh": "哭聲"
  },
  {
    "word": "Scarecrow",
    "kk": "[ˈskɛrˌkro]",
    "pos": "n.",
    "zh": "稻草人"
  }
];

export const phonics = {
  "letters": "Gg–Ii",
  "items": [
    {
      "letter": "Gg",
      "sound": "/g/",
      "ipa": "g",
      "nameIpa": "dʒi",
      "examples": [
        {
          "w": "gun",
          "zh": "槍",
          "seg": [
            "g",
            "ʌ",
            "n"
          ]
        },
        {
          "w": "gold",
          "zh": "金色的",
          "seg": [
            "g",
            "oʊ",
            "l",
            "d"
          ]
        }
      ]
    },
    {
      "letter": "Hh",
      "sound": "/h/",
      "ipa": "h",
      "nameIpa": "eɪtʃ",
      "examples": [
        {
          "w": "hen",
          "zh": "母雞",
          "seg": [
            "h",
            "ɛ",
            "n"
          ]
        }
      ]
    },
    {
      "letter": "Ii",
      "sound": "/ɪ/",
      "ipa": "ɪ",
      "nameIpa": "aɪ",
      "examples": [
        {
          "w": "inn",
          "zh": "小旅館",
          "seg": [
            "ɪ",
            "n"
          ]
        },
        {
          "w": "in",
          "zh": "在裡面",
          "seg": [
            "ɪ",
            "n"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "打招呼：Good morning / afternoon / evening",
  "rule": "早上說 Good morning；下午說 Good afternoon；晚上說 Good evening。",
  "examples": [
    {
      "text": "Good morning.",
      "zh": "早安。"
    },
    {
      "text": "Good afternoon.",
      "zh": "午安。"
    },
    {
      "text": "Good evening.",
      "zh": "晚安。"
    },
    {
      "text": "This is Nick.",
      "zh": "這位是尼克。"
    }
  ],
  "quiz": [
    {
      "subject": "Good",
      "answer": "morning",
      "full": "Good morning.",
      "prompt": "Good ___.",
      "zh": "早安。"
    },
    {
      "subject": "Good",
      "answer": "afternoon",
      "full": "Good afternoon.",
      "prompt": "Good ___.",
      "zh": "午安。"
    },
    {
      "subject": "Good",
      "answer": "evening",
      "full": "Good evening.",
      "prompt": "Good ___.",
      "zh": "晚安。"
    },
    {
      "subject": "This",
      "answer": "is",
      "full": "This is Nick.",
      "prompt": "This ___ Nick.",
      "zh": "這位是尼克。"
    }
  ]
};

export const beOptions = [
  "morning",
  "afternoon",
  "evening",
  "is"
];

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
