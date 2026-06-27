export const dialogueLines = [
  {
    "speaker": "Smart",
    "text": "Let's sing!",
    "role": "smart",
    "scene": "Smart invites everyone",
    "zh": "我們一起唱歌吧！"
  },
  {
    "speaker": "All",
    "text": "Heigh-ho, heigh-ho, it's home from work we go.",
    "role": "together",
    "scene": "Everyone sings",
    "zh": "大家唱歌。",
    "scored": false
  },
  {
    "speaker": "Smart",
    "text": "Look! This is my hat. It's blue.",
    "role": "smart",
    "scene": "Smart shows a blue hat",
    "zh": "看！這是我的帽子。它是藍色的。"
  },
  {
    "speaker": "Nick",
    "text": "It's cool!",
    "role": "nick",
    "scene": "Nick likes it",
    "zh": "它好酷！"
  },
  {
    "speaker": "Mad",
    "text": "Look! This is my hat. It's green.",
    "role": "mad",
    "scene": "Mad shows a green hat",
    "zh": "看！這是我的帽子。它是綠色的。"
  },
  {
    "speaker": "Abby",
    "text": "It's pretty!",
    "role": "abby",
    "scene": "Abby likes it",
    "zh": "它好漂亮！"
  },
  {
    "speaker": "Happy",
    "text": "Look! This is my hat. It's red.",
    "role": "happy",
    "scene": "Happy shows a red hat",
    "zh": "看！這是我的帽子。它是紅色的。"
  },
  {
    "speaker": "Fifi",
    "text": "It's great!",
    "role": "fifi",
    "scene": "Fifi likes it",
    "zh": "它好棒！"
  },
  {
    "speaker": "Tired",
    "text": "Look! This is my hat. It's yellow.",
    "role": "tired",
    "scene": "Tired shows a yellow hat",
    "zh": "看！這是我的帽子。它是黃色的。"
  },
  {
    "speaker": "Nick and Abby",
    "text": "It's cool!",
    "role": "together",
    "scene": "Nick and Abby react",
    "zh": "它好酷！"
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

export function loadScores(storage, length, key = "joy-unit13-scores") {
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

export function saveScores(storage, scores, key = "joy-unit13-scores") {
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

// ---- Unit 13 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "hat",
    "kk": "[hæt]",
    "pos": "n.",
    "zh": "帽子"
  },
  {
    "word": "blue",
    "kk": "[blu]",
    "pos": "adj.",
    "zh": "藍色的"
  },
  {
    "word": "green",
    "kk": "[grin]",
    "pos": "adj.",
    "zh": "綠色的"
  },
  {
    "word": "red",
    "kk": "[rɛd]",
    "pos": "adj.",
    "zh": "紅色的"
  },
  {
    "word": "yellow",
    "kk": "[ˈjɛlo]",
    "pos": "adj.",
    "zh": "黃色的"
  }
];

export const phonics = {
  "letters": "重點發音",
  "items": [
    {
      "letter": "hat",
      "sound": "/æ/",
      "ipa": "æ",
      "nameIpa": "hæt",
      "examples": [
        {
          "w": "hat",
          "zh": "帽子",
          "seg": [
            "h",
            "æ",
            "t"
          ]
        },
        {
          "w": "Mad",
          "zh": "生氣",
          "seg": [
            "m",
            "æ",
            "d"
          ]
        }
      ]
    },
    {
      "letter": "blue",
      "sound": "/u/",
      "ipa": "u",
      "nameIpa": "blu",
      "examples": [
        {
          "w": "blue",
          "zh": "藍色的",
          "seg": [
            "b",
            "l",
            "u"
          ]
        },
        {
          "w": "cool",
          "zh": "酷",
          "seg": [
            "k",
            "u",
            "l"
          ]
        }
      ]
    },
    {
      "letter": "red",
      "sound": "/ɛ/",
      "ipa": "ɛ",
      "nameIpa": "rɛd",
      "examples": [
        {
          "w": "red",
          "zh": "紅色的",
          "seg": [
            "r",
            "ɛ",
            "d"
          ]
        },
        {
          "w": "yellow",
          "zh": "黃色的",
          "seg": [
            "j",
            "ɛ",
            "l",
            "o"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "This is my hat. It is blue.",
  "rule": "介紹近處自己的東西用 This is my...；說顏色用 It is + color.",
  "examples": [
    {
      "text": "This is my hat.",
      "zh": "這是我的帽子。"
    },
    {
      "text": "It is blue.",
      "zh": "它是藍色的。"
    }
  ],
  "quiz": [
    {
      "subject": "It",
      "answer": "blue",
      "full": "It is blue.",
      "prompt": "It is ___.",
      "zh": "它是藍色的。"
    },
    {
      "subject": "It",
      "answer": "green",
      "full": "It is green.",
      "prompt": "It is ___.",
      "zh": "它是綠色的。"
    },
    {
      "subject": "This",
      "answer": "my",
      "full": "This is my hat.",
      "prompt": "This is ___ hat.",
      "zh": "這是我的帽子。"
    }
  ]
};

export const beOptions = [
  "my",
  "your",
  "blue",
  "green",
  "red",
  "yellow"
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
