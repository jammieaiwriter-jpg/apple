export const dialogueLines = [
  {
    "speaker": "Scarecrow",
    "text": "Where are we?",
    "role": "nick",
    "scene": "Looking around",
    "zh": "我們在哪裡？"
  },
  {
    "speaker": "Abby",
    "text": "I don't know.",
    "role": "abby",
    "scene": "Not sure yet",
    "zh": "我不知道。"
  },
  {
    "speaker": "Scarecrow",
    "text": "Who's he?",
    "role": "nick",
    "scene": "Ask about Oz",
    "zh": "他是誰啊？"
  },
  {
    "speaker": "Nick",
    "text": "He's Oz. He can help!",
    "role": "nick",
    "scene": "Oz can help",
    "zh": "他是歐茲王。他可以幫忙！"
  },
  {
    "speaker": "Scarecrow",
    "text": "Great! I want a brain.",
    "role": "nick",
    "scene": "Scarecrow wants a brain",
    "zh": "太棒了！我想要一個頭腦。"
  },
  {
    "speaker": "Fifi",
    "text": "I want yummy nuts.",
    "role": "fifi",
    "scene": "Fifi wants nuts",
    "zh": "我想要好吃的堅果。"
  },
  {
    "speaker": "All",
    "text": "Hahaha...",
    "role": "together",
    "scene": "Everyone laughs",
    "zh": "哈哈哈……",
    "scored": false
  },
  {
    "speaker": "All",
    "text": "Let's go!",
    "role": "together",
    "scene": "Go together",
    "zh": "我們走吧！"
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

export function loadScores(storage, length, key = "joy-unit4-scores") {
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

export function saveScores(storage, scores, key = "joy-unit4-scores") {
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

// ---- Unit 4 加強內容：單字、Phonics、文法 ----
export const vocab = [
  {
    "word": "great",
    "kk": "[gret]",
    "pos": "adj.",
    "zh": "棒的"
  },
  {
    "word": "want",
    "kk": "[wɑnt]",
    "pos": "v.",
    "zh": "想要"
  },
  {
    "word": "a",
    "kk": "[ə]",
    "pos": "art.",
    "zh": "一個",
    "say": "uh"
  },
  {
    "word": "brain",
    "kk": "[bren]",
    "pos": "n.",
    "zh": "頭腦"
  },
  {
    "word": "heart",
    "kk": "[hɑrt]",
    "pos": "n.",
    "zh": "心"
  }
];

export const phonics = {
  "letters": "Jj–Ll",
  "items": [
    {
      "letter": "Jj",
      "sound": "/dʒ/",
      "examples": [
        {
          "w": "jet",
          "zh": "噴射機"
        },
        {
          "w": "jar",
          "zh": "罐子"
        }
      ]
    },
    {
      "letter": "Kk",
      "sound": "/k/",
      "examples": [
        {
          "w": "kid",
          "zh": "小孩"
        },
        {
          "w": "keg",
          "zh": "小桶"
        }
      ]
    },
    {
      "letter": "Ll",
      "sound": "/l/",
      "examples": [
        {
          "w": "lamp",
          "zh": "燈"
        },
        {
          "w": "wall",
          "zh": "牆"
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "表達想要：I want...",
  "rule": "想表達「我想要」時，用 I want 加上想要的東西。",
  "examples": [
    {
      "text": "I want a brain.",
      "zh": "我想要一個頭腦。"
    },
    {
      "text": "I want a heart.",
      "zh": "我想要一顆心。"
    },
    {
      "text": "I want yummy nuts.",
      "zh": "我想要好吃的堅果。"
    }
  ],
  "quiz": [
    {
      "subject": "I want",
      "answer": "a brain",
      "full": "I want a brain.",
      "prompt": "I want ___.",
      "zh": "我想要一個頭腦。"
    },
    {
      "subject": "I want",
      "answer": "a heart",
      "full": "I want a heart.",
      "prompt": "I want ___.",
      "zh": "我想要一顆心。"
    },
    {
      "subject": "I want",
      "answer": "yummy nuts",
      "full": "I want yummy nuts.",
      "prompt": "I want ___.",
      "zh": "我想要好吃的堅果。"
    }
  ]
};

export const beOptions = [
  "a brain",
  "a heart",
  "yummy nuts"
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
