export const dialogueLines = [
  {
    "speaker": "Abby",
    "text": "Where are we?",
    "role": "abby",
    "scene": "Looking around",
    "zh": "我們在哪裡？"
  },
  {
    "speaker": "Nick",
    "text": "I don't know.",
    "role": "nick",
    "scene": "Not sure yet",
    "zh": "我不知道。"
  },
  {
    "speaker": "Abby",
    "text": "Wow! It's pretty here.",
    "role": "abby",
    "scene": "A pretty place",
    "zh": "哇！這裡好漂亮。"
  },
  {
    "speaker": "Abby",
    "text": "Look! Who's that?",
    "role": "abby",
    "scene": "Someone over there",
    "zh": "看啊！那是誰？"
  },
  {
    "speaker": "Fifi",
    "text": "I don't know.",
    "role": "fifi",
    "scene": "Fifi is not sure",
    "zh": "我不知道。"
  },
  {
    "speaker": "Nick",
    "text": "He's Oz. He can help.",
    "role": "nick",
    "scene": "Meet Oz",
    "zh": "他是歐茲王。他可以幫忙。"
  },
  {
    "speaker": "Abby",
    "text": "Yay! We can go home.",
    "role": "abby",
    "scene": "Hopeful news",
    "zh": "耶！我們可以回家了。"
  },
  {
    "speaker": "Fifi",
    "text": "He's Oz. He can help.",
    "role": "fifi",
    "scene": "Fifi repeats",
    "zh": "他是歐茲王。他可以幫忙。"
  },
  {
    "speaker": "Nick + Abby",
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

export function loadScores(storage, length, key = "joy-unit2-scores") {
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

export function saveScores(storage, scores, key = "joy-unit2-scores") {
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

// ---- Unit 2 加強內容：單字、Phonics、文法 ----
export const vocab = [
  {
    "word": "look",
    "kk": "[lʊk]",
    "pos": "v.",
    "zh": "看；注視"
  },
  {
    "word": "he",
    "kk": "[hi]",
    "pos": "pron.",
    "zh": "他"
  },
  {
    "word": "she",
    "kk": "[ʃi]",
    "pos": "pron.",
    "zh": "她"
  },
  {
    "word": "Oz",
    "kk": "[ɑz]",
    "pos": "n.",
    "zh": "歐茲王（人名）"
  },
  {
    "word": "Fifi",
    "kk": "[ˈfɪfɪ]",
    "pos": "n.",
    "zh": "菲菲（人名）"
  },
  {
    "word": "can",
    "kk": "[kæn]",
    "pos": "aux.",
    "zh": "可以；能；會"
  },
  {
    "word": "help",
    "kk": "[hɛlp]",
    "pos": "v.",
    "zh": "幫忙"
  },
  {
    "word": "let's",
    "kk": "[lɛts]",
    "pos": "phr.",
    "zh": "讓我們"
  },
  {
    "word": "go",
    "kk": "[go]",
    "pos": "v.",
    "zh": "去"
  }
];

export const phonics = {
  "letters": "Dd–Ff",
  "items": [
    {
      "letter": "Dd",
      "sound": "/d/",
      "examples": [
        {
          "w": "duck",
          "zh": "鴨子"
        },
        {
          "w": "sad",
          "zh": "傷心的"
        }
      ]
    },
    {
      "letter": "Ee",
      "sound": "/ɛ/",
      "examples": [
        {
          "w": "egg",
          "zh": "蛋"
        },
        {
          "w": "red",
          "zh": "紅色的"
        }
      ]
    },
    {
      "letter": "Ff",
      "sound": "/f/",
      "examples": [
        {
          "w": "fish",
          "zh": "魚"
        },
        {
          "w": "fat",
          "zh": "胖胖的"
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "介紹他人：He is / She is",
  "rule": "男生或男性角色用 He is...；女生或女性角色用 She is...。",
  "examples": [
    {
      "text": "He is Oz.",
      "zh": "他是歐茲王。"
    },
    {
      "text": "She is Fifi.",
      "zh": "她是菲菲。"
    },
    {
      "text": "He can help.",
      "zh": "他可以幫忙。"
    }
  ],
  "quiz": [
    {
      "subject": "He",
      "answer": "is",
      "full": "He is Oz.",
      "zh": "他是歐茲王。"
    },
    {
      "subject": "She",
      "answer": "is",
      "full": "She is Fifi.",
      "zh": "她是菲菲。"
    },
    {
      "subject": "He",
      "answer": "can",
      "full": "He can help.",
      "zh": "他可以幫忙。"
    },
    {
      "subject": "She",
      "answer": "can",
      "full": "She can help.",
      "zh": "她可以幫忙。"
    }
  ]
};

export const beOptions = [
  "is",
  "can",
  "are"
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
