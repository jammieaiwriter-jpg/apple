export const dialogueLines = [
  {
    "speaker": "Nick",
    "text": "Where are we?",
    "role": "nick",
    "scene": "Nick wonders",
    "zh": "我們在哪裡？"
  },
  {
    "speaker": "Abby",
    "text": "I don't know.",
    "role": "abby",
    "scene": "Abby is unsure",
    "zh": "我不知道。"
  },
  {
    "speaker": "Smart",
    "text": "Let's go! Come, Abby! Come, Nick!",
    "role": "smart",
    "scene": "Smart calls them",
    "zh": "走吧！來吧，Abby！來吧，Nick！"
  },
  {
    "speaker": "Nick",
    "text": "Look! It's a house.",
    "role": "nick",
    "scene": "Nick sees a house",
    "zh": "看！是一棟房子。"
  },
  {
    "speaker": "Abby",
    "text": "It's pretty!",
    "role": "abby",
    "scene": "Abby likes it",
    "zh": "它好漂亮！"
  },
  {
    "speaker": "Fifi",
    "text": "Cool! Let's go!",
    "role": "fifi",
    "scene": "Fifi is excited",
    "zh": "酷！走吧！"
  },
  {
    "speaker": "Smart",
    "text": "Come in!",
    "role": "smart",
    "scene": "Smart invites them in",
    "zh": "進來吧！"
  },
  {
    "speaker": "Nick and Abby",
    "text": "Thank you.",
    "role": "together",
    "scene": "They thank Smart",
    "zh": "謝謝你。"
  },
  {
    "speaker": "Fifi",
    "text": "Your house is cool!",
    "role": "fifi",
    "scene": "Fifi compliments",
    "zh": "你的房子好酷！"
  },
  {
    "speaker": "Smart",
    "text": "Look! That's my book. It's blue.",
    "role": "smart",
    "scene": "Smart shows a book",
    "zh": "看！那是我的書。它是藍色的。"
  },
  {
    "speaker": "Mad",
    "text": "Look! That's my marker. It's green.",
    "role": "mad",
    "scene": "Mad shows a marker",
    "zh": "看！那是我的麥克筆。它是綠色的。"
  },
  {
    "speaker": "Happy",
    "text": "Look! That's my bag. It's red.",
    "role": "happy",
    "scene": "Happy shows a bag",
    "zh": "看！那是我的袋子。它是紅色的。"
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

export function loadScores(storage, length, key = "joy-unit16-scores") {
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

export function saveScores(storage, scores, key = "joy-unit16-scores") {
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

// ---- Unit 16 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "come",
    "kk": "[kʌm]",
    "pos": "v.",
    "zh": "來"
  },
  {
    "word": "in",
    "kk": "[ɪn]",
    "pos": "prep.",
    "zh": "在……裡面"
  },
  {
    "word": "that",
    "kk": "[ðæt]",
    "pos": "pron.",
    "zh": "那個"
  },
  {
    "word": "book",
    "kk": "[bʊk]",
    "pos": "n.",
    "zh": "書"
  },
  {
    "word": "marker",
    "kk": "[ˈmɑrkɚ]",
    "pos": "n.",
    "zh": "麥克筆"
  },
  {
    "word": "bag",
    "kk": "[bæg]",
    "pos": "n.",
    "zh": "袋子"
  }
];

export const phonics = {
  "letters": "重點發音",
  "items": [
    {
      "letter": "book",
      "sound": "/ʊ/",
      "ipa": "ʊ",
      "nameIpa": "bʊk",
      "examples": [
        {
          "w": "book",
          "zh": "書",
          "seg": [
            "b",
            "ʊ",
            "k"
          ]
        },
        {
          "w": "look",
          "zh": "看",
          "seg": [
            "l",
            "ʊ",
            "k"
          ]
        }
      ]
    },
    {
      "letter": "bag",
      "sound": "/æ/",
      "ipa": "æ",
      "nameIpa": "bæg",
      "examples": [
        {
          "w": "bag",
          "zh": "袋子",
          "seg": [
            "b",
            "æ",
            "g"
          ]
        },
        {
          "w": "that",
          "zh": "那個",
          "seg": [
            "ð",
            "æ",
            "t"
          ]
        }
      ]
    },
    {
      "letter": "come",
      "sound": "/ʌ/",
      "ipa": "ʌ",
      "nameIpa": "kʌm",
      "examples": [
        {
          "w": "come",
          "zh": "來",
          "seg": [
            "k",
            "ʌ",
            "m"
          ]
        },
        {
          "w": "up",
          "zh": "向上",
          "seg": [
            "ʌ",
            "p"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "That is my...",
  "rule": "指遠一點的東西用 That is...，自己的東西用 my。",
  "examples": [
    {
      "text": "That is my book.",
      "zh": "那是我的書。"
    },
    {
      "text": "That is my marker.",
      "zh": "那是我的麥克筆。"
    }
  ],
  "quiz": [
    {
      "subject": "That",
      "answer": "my",
      "full": "That is my book.",
      "prompt": "That is ___ book.",
      "zh": "那是我的書。"
    },
    {
      "subject": "That",
      "answer": "book",
      "full": "That is my book.",
      "prompt": "That is my ___.",
      "zh": "那是我的書。"
    },
    {
      "subject": "That",
      "answer": "marker",
      "full": "That is my marker.",
      "prompt": "That is my ___.",
      "zh": "那是我的麥克筆。"
    }
  ]
};

export const beOptions = [
  "my",
  "your",
  "book",
  "marker",
  "bag"
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
