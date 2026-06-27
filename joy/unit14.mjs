export const dialogueLines = [
  {
    "speaker": "Shy",
    "text": "Look! This is my hat. It's white.",
    "role": "shy",
    "scene": "Shy shows a white hat",
    "zh": "看！這是我的帽子。它是白色的。"
  },
  {
    "speaker": "Abby",
    "text": "It's cool!",
    "role": "abby",
    "scene": "Abby reacts",
    "zh": "它好酷！"
  },
  {
    "speaker": "Achoo",
    "text": "Look! This is my hat. It's black.",
    "role": "achoo",
    "scene": "Achoo shows a black hat",
    "zh": "看！這是我的帽子。它是黑色的。"
  },
  {
    "speaker": "Nick",
    "text": "It's pretty!",
    "role": "nick",
    "scene": "Nick reacts",
    "zh": "它好漂亮！"
  },
  {
    "speaker": "Dum-dum",
    "text": "Look! This is...",
    "role": "dum-dum",
    "scene": "Dum-dum hesitates",
    "zh": "看！這是……"
  },
  {
    "speaker": "Abby",
    "text": "This is your hat. It's orange.",
    "role": "abby",
    "scene": "Abby helps",
    "zh": "這是你的帽子。它是橘色的。"
  },
  {
    "speaker": "Dum-dum",
    "text": "Right.",
    "role": "dum-dum",
    "scene": "Dum-dum agrees",
    "zh": "對。"
  },
  {
    "speaker": "All",
    "text": "Hahaha...",
    "role": "together",
    "scene": "Everyone laughs",
    "zh": "哈哈哈。",
    "scored": false
  },
  {
    "speaker": "Fifi",
    "text": "It's great!",
    "role": "fifi",
    "scene": "Fifi reacts",
    "zh": "它好棒！"
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

export function loadScores(storage, length, key = "joy-unit14-scores") {
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

export function saveScores(storage, scores, key = "joy-unit14-scores") {
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

// ---- Unit 14 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "white",
    "kk": "[(h)waɪt]",
    "pos": "adj.",
    "zh": "白色的"
  },
  {
    "word": "black",
    "kk": "[blæk]",
    "pos": "adj.",
    "zh": "黑色的"
  },
  {
    "word": "orange",
    "kk": "[ˈɔrɪndʒ]",
    "pos": "adj.",
    "zh": "橘色的"
  },
  {
    "word": "right",
    "kk": "[raɪt]",
    "pos": "adj.",
    "zh": "對的"
  }
];

export const phonics = {
  "letters": "重點發音",
  "items": [
    {
      "letter": "white",
      "sound": "/aɪ/",
      "ipa": "aɪ",
      "nameIpa": "waɪt",
      "examples": [
        {
          "w": "white",
          "zh": "白色的",
          "seg": [
            "w",
            "aɪ",
            "t"
          ]
        },
        {
          "w": "right",
          "zh": "對的",
          "seg": [
            "r",
            "aɪ",
            "t"
          ]
        }
      ]
    },
    {
      "letter": "black",
      "sound": "/æ/",
      "ipa": "æ",
      "nameIpa": "blæk",
      "examples": [
        {
          "w": "black",
          "zh": "黑色的",
          "seg": [
            "b",
            "l",
            "æ",
            "k"
          ]
        },
        {
          "w": "hat",
          "zh": "帽子",
          "seg": [
            "h",
            "æ",
            "t"
          ]
        }
      ]
    },
    {
      "letter": "orange",
      "sound": "/ɔ/",
      "ipa": "ɔ",
      "nameIpa": "ɔrɪndʒ",
      "examples": [
        {
          "w": "orange",
          "zh": "橘色的",
          "seg": [
            "ɔ",
            "r",
            "ɪ",
            "n",
            "dʒ"
          ]
        },
        {
          "w": "for",
          "zh": "給",
          "seg": [
            "f",
            "ɔ",
            "r"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "This is your hat",
  "rule": "說對方的東西用 your。This is your hat. 這是你的帽子。",
  "examples": [
    {
      "text": "This is your hat.",
      "zh": "這是你的帽子。"
    },
    {
      "text": "It is orange.",
      "zh": "它是橘色的。"
    }
  ],
  "quiz": [
    {
      "subject": "This",
      "answer": "your",
      "full": "This is your hat.",
      "prompt": "This is ___ hat.",
      "zh": "這是你的帽子。"
    },
    {
      "subject": "It",
      "answer": "orange",
      "full": "It is orange.",
      "prompt": "It is ___.",
      "zh": "它是橘色的。"
    },
    {
      "subject": "It",
      "answer": "black",
      "full": "It is black.",
      "prompt": "It is ___.",
      "zh": "它是黑色的。"
    }
  ]
};

export const beOptions = [
  "my",
  "your",
  "white",
  "black",
  "orange",
  "right"
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
