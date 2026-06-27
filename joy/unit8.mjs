export const dialogueLines = [
  {
    "speaker": "Lion",
    "text": "Roar...",
    "role": "nick",
    "scene": "Lion roars",
    "zh": "吼……",
    "scored": false
  },
  {
    "speaker": "Nick",
    "text": "Listen!",
    "role": "nick",
    "scene": "Listen",
    "zh": "聽啊！"
  },
  {
    "speaker": "Abby",
    "text": "Look!",
    "role": "abby",
    "scene": "Look",
    "zh": "看啊！"
  },
  {
    "speaker": "Lion",
    "text": "I'm... scared!",
    "role": "nick",
    "scene": "Lion is scared",
    "zh": "我……我好害怕！"
  },
  {
    "speaker": "Abby",
    "text": "Hey, it's OK.",
    "role": "abby",
    "scene": "Comfort Lion",
    "zh": "嘿，沒事的。"
  },
  {
    "speaker": "Fifi",
    "text": "It's OK. Don't cry.",
    "role": "fifi",
    "scene": "Fifi comforts Lion",
    "zh": "沒關係。不要哭。"
  },
  {
    "speaker": "Abby",
    "text": "I'm Abby. What's your name?",
    "role": "abby",
    "scene": "Ask his name",
    "zh": "我是艾比。你的名字叫什麼？"
  },
  {
    "speaker": "Lion",
    "text": "I... I... am... Lion.",
    "role": "nick",
    "scene": "Lion answers",
    "zh": "我……我……我叫……膽小獅。"
  },
  {
    "speaker": "Nick",
    "text": "Hi, Lion. I'm Nick.",
    "role": "nick",
    "scene": "Nick says hi",
    "zh": "嗨，膽小獅。我是尼克。"
  },
  {
    "speaker": "Scarecrow",
    "text": "I'm Scarecrow. This is Tin Man.",
    "role": "nick",
    "scene": "Introduce Tin Man",
    "zh": "我是稻草人。這位是錫人。"
  },
  {
    "speaker": "Fifi",
    "text": "Hi, Lion. I'm Fifi.",
    "role": "fifi",
    "scene": "Fifi says hi",
    "zh": "嗨，膽小獅。我是菲菲。"
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

export function loadScores(storage, length, key = "joy-unit8-scores") {
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

export function saveScores(storage, scores, key = "joy-unit8-scores") {
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

// ---- Unit 8 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "roar",
    "kk": "[rɔr]",
    "pos": "n.",
    "zh": "吼叫聲"
  },
  {
    "word": "hey",
    "kk": "[he]",
    "pos": "int.",
    "zh": "嘿"
  },
  {
    "word": "Lion",
    "kk": "[ˈlaɪən]",
    "pos": "n.",
    "zh": "獅子；膽小獅"
  },
  {
    "word": "up",
    "kk": "[ʌp]",
    "pos": "adv.",
    "zh": "向上"
  },
  {
    "word": "wake up",
    "kk": "[wek ʌp]",
    "pos": "phr.",
    "zh": "醒來"
  },
  {
    "word": "us",
    "kk": "[ʌs]",
    "pos": "pron.",
    "zh": "我們"
  },
  {
    "word": "van",
    "kk": "[væn]",
    "pos": "n.",
    "zh": "箱型車"
  },
  {
    "word": "drive",
    "kk": "[draɪv]",
    "pos": "v.",
    "zh": "駕駛"
  },
  {
    "word": "wig",
    "kk": "[wɪg]",
    "pos": "n.",
    "zh": "假髮"
  },
  {
    "word": "wear",
    "kk": "[wɛr]",
    "pos": "v.",
    "zh": "穿戴"
  }
];

export const phonics = {
  "letters": "Uu–Ww",
  "items": [
    {
      "letter": "Uu",
      "sound": "/ʌ/",
      "ipa": "ʌ",
      "nameIpa": "ju",
      "examples": [
        {
          "w": "up",
          "zh": "向上",
          "seg": [
            "ʌ",
            "p"
          ]
        },
        {
          "w": "us",
          "zh": "我們",
          "seg": [
            "ʌ",
            "s"
          ]
        }
      ]
    },
    {
      "letter": "Vv",
      "sound": "/v/",
      "ipa": "v",
      "nameIpa": "vi",
      "examples": [
        {
          "w": "van",
          "zh": "箱型車",
          "seg": [
            "v",
            "æ",
            "n"
          ]
        },
        {
          "w": "drive",
          "zh": "駕駛",
          "seg": [
            "d",
            "r",
            "aɪ",
            "v"
          ]
        }
      ]
    },
    {
      "letter": "Ww",
      "sound": "/w/",
      "ipa": "w",
      "nameIpa": "dʌbəl ju",
      "examples": [
        {
          "w": "wig",
          "zh": "假髮",
          "seg": [
            "w",
            "ɪ",
            "g"
          ]
        },
        {
          "w": "wear",
          "zh": "穿戴",
          "seg": [
            "w",
            "ɛ",
            "r"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "介紹朋友：This is...",
  "rule": "介紹身邊的人時，可以說 This is 加上名字。",
  "examples": [
    {
      "text": "This is Tin Man.",
      "zh": "這位是錫人。"
    },
    {
      "text": "This is Lion.",
      "zh": "這位是膽小獅。"
    },
    {
      "text": "I'm Abby.",
      "zh": "我是艾比。"
    }
  ],
  "quiz": [
    {
      "subject": "This",
      "answer": "is",
      "full": "This is Tin Man.",
      "zh": "這位是錫人。"
    },
    {
      "subject": "This",
      "answer": "is",
      "full": "This is Lion.",
      "zh": "這位是膽小獅。"
    },
    {
      "subject": "I",
      "answer": "am",
      "full": "I am Abby.",
      "zh": "我是艾比。"
    },
    {
      "subject": "It",
      "answer": "is",
      "full": "It is OK.",
      "zh": "沒關係。"
    }
  ]
};

export const beOptions = [
  "is",
  "am",
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
