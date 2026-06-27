export const dialogueLines = [
  {
    "speaker": "Tired",
    "text": "Look! That's my eraser. It's yellow.",
    "role": "tired",
    "scene": "Tired shows an eraser",
    "zh": "看！那是我的橡皮擦。它是黃色的。"
  },
  {
    "speaker": "Nick",
    "text": "It's cool!",
    "role": "nick",
    "scene": "Nick reacts",
    "zh": "它好酷！"
  },
  {
    "speaker": "Shy",
    "text": "Look! That's my ruler. It's white.",
    "role": "shy",
    "scene": "Shy shows a ruler",
    "zh": "看！那是我的尺。它是白色的。"
  },
  {
    "speaker": "Abby",
    "text": "It's pretty!",
    "role": "abby",
    "scene": "Abby reacts",
    "zh": "它好漂亮！"
  },
  {
    "speaker": "Achoo",
    "text": "Look! That's my pencil. It's black.",
    "role": "achoo",
    "scene": "Achoo shows a pencil",
    "zh": "看！那是我的鉛筆。它是黑色的。"
  },
  {
    "speaker": "Fifi",
    "text": "It's great!",
    "role": "fifi",
    "scene": "Fifi reacts",
    "zh": "它好棒！"
  },
  {
    "speaker": "Dum-dum",
    "text": "Look! That's...",
    "role": "dum-dum",
    "scene": "Dum-dum hesitates",
    "zh": "看！那是……"
  },
  {
    "speaker": "Nick",
    "text": "That's your marker. It's orange.",
    "role": "nick",
    "scene": "Nick helps Dum-dum",
    "zh": "那是你的麥克筆。它是橘色的。"
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

export function loadScores(storage, length, key = "joy-unit17-scores") {
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

export function saveScores(storage, scores, key = "joy-unit17-scores") {
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

// ---- Unit 17 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "eraser",
    "kk": "[ɪˈresɚ]",
    "pos": "n.",
    "zh": "橡皮擦"
  },
  {
    "word": "ruler",
    "kk": "[ˈrulɚ]",
    "pos": "n.",
    "zh": "尺"
  },
  {
    "word": "pencil",
    "kk": "[ˈpɛnsəl]",
    "pos": "n.",
    "zh": "鉛筆"
  }
];

export const phonics = {
  "letters": "重點發音",
  "items": [
    {
      "letter": "pencil",
      "sound": "/ɛ/",
      "ipa": "ɛ",
      "nameIpa": "pɛnsəl",
      "examples": [
        {
          "w": "pencil",
          "zh": "鉛筆",
          "seg": [
            "p",
            "ɛ",
            "n",
            "s",
            "əl"
          ]
        },
        {
          "w": "red",
          "zh": "紅色的",
          "seg": [
            "r",
            "ɛ",
            "d"
          ]
        }
      ]
    },
    {
      "letter": "ruler",
      "sound": "/u/",
      "ipa": "u",
      "nameIpa": "rulɚ",
      "examples": [
        {
          "w": "ruler",
          "zh": "尺",
          "seg": [
            "r",
            "u",
            "l",
            "ɚ"
          ]
        },
        {
          "w": "blue",
          "zh": "藍色的",
          "seg": [
            "b",
            "l",
            "u"
          ]
        }
      ]
    },
    {
      "letter": "eraser",
      "sound": "/eɪ/",
      "ipa": "eɪ",
      "nameIpa": "ɪresɚ",
      "examples": [
        {
          "w": "eraser",
          "zh": "橡皮擦",
          "seg": [
            "ɪ",
            "r",
            "eɪ",
            "s",
            "ɚ"
          ]
        },
        {
          "w": "name",
          "zh": "名字",
          "seg": [
            "n",
            "eɪ",
            "m"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "This is my... / That is your...",
  "rule": "近處用 this，遠處用 that；我的 my，你的 your。",
  "examples": [
    {
      "text": "That's my eraser.",
      "zh": "那是我的橡皮擦。"
    },
    {
      "text": "That's your marker.",
      "zh": "那是你的麥克筆。"
    }
  ],
  "quiz": [
    {
      "subject": "That",
      "answer": "my",
      "full": "That is my eraser.",
      "prompt": "That is ___ eraser.",
      "zh": "那是我的橡皮擦。"
    },
    {
      "subject": "That",
      "answer": "your",
      "full": "That is your marker.",
      "prompt": "That is ___ marker.",
      "zh": "那是你的麥克筆。"
    },
    {
      "subject": "That",
      "answer": "pencil",
      "full": "That is my pencil.",
      "prompt": "That is my ___.",
      "zh": "那是我的鉛筆。"
    }
  ]
};

export const beOptions = [
  "my",
  "your",
  "eraser",
  "ruler",
  "pencil",
  "marker"
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
