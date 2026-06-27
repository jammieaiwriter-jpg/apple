export const dialogueLines = [
  {
    "speaker": "Dum-dum",
    "text": "What... is... it...?",
    "role": "dum-dum",
    "scene": "Dum-dum asks slowly",
    "zh": "它……是……什麼？"
  },
  {
    "speaker": "Smart",
    "text": "It's an apple!",
    "role": "smart",
    "scene": "Smart answers",
    "zh": "它是一顆蘋果！"
  },
  {
    "speaker": "Mad",
    "text": "It's blue!",
    "role": "mad",
    "scene": "Mad notices the color",
    "zh": "它是藍色的！"
  },
  {
    "speaker": "Happy",
    "text": "It's a blue apple!",
    "role": "happy",
    "scene": "Happy combines color and noun",
    "zh": "它是一顆藍色的蘋果！"
  },
  {
    "speaker": "Nick",
    "text": "It's cool!",
    "role": "nick",
    "scene": "Nick reacts",
    "zh": "它好酷！"
  },
  {
    "speaker": "Abby",
    "text": "It's pretty!",
    "role": "abby",
    "scene": "Abby reacts",
    "zh": "它好漂亮！"
  },
  {
    "speaker": "Achoo, Shy, and Tired",
    "text": "It's a blue apple!",
    "role": "together",
    "scene": "They repeat",
    "zh": "它是一顆藍色的蘋果！"
  },
  {
    "speaker": "Dum-dum",
    "text": "It's...",
    "role": "dum-dum",
    "scene": "Dum-dum tries",
    "zh": "它是……"
  },
  {
    "speaker": "Abby",
    "text": "Yum, yum, yum!",
    "role": "abby",
    "scene": "Abby wants to eat",
    "zh": "好好吃！",
    "scored": false
  },
  {
    "speaker": "Mirror",
    "text": "Oh no! Don't eat it!",
    "role": "mirror",
    "scene": "Mirror warns Abby",
    "zh": "喔不！不要吃它！"
  },
  {
    "speaker": "Smart",
    "text": "Look! A chocolate house!",
    "role": "smart",
    "scene": "Smart sees a house",
    "zh": "看！一間巧克力房子！"
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

export function loadScores(storage, length, key = "joy-unit19-scores") {
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

export function saveScores(storage, scores, key = "joy-unit19-scores") {
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

// ---- Unit 19 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "oh",
    "kk": "[o]",
    "pos": "int.",
    "zh": "喔"
  },
  {
    "word": "no",
    "kk": "[no]",
    "pos": "adv.",
    "zh": "不"
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
    "word": "yellow",
    "kk": "[ˈjɛlo]",
    "pos": "adj.",
    "zh": "黃色的"
  },
  {
    "word": "apple",
    "kk": "[ˈæpəl]",
    "pos": "n.",
    "zh": "蘋果"
  },
  {
    "word": "orange",
    "kk": "[ˈɔrɪndʒ]",
    "pos": "n.",
    "zh": "柳橙"
  },
  {
    "word": "banana",
    "kk": "[bəˈnænə]",
    "pos": "n.",
    "zh": "香蕉"
  }
];

export const phonics = {
  "letters": "重點發音",
  "items": [
    {
      "letter": "blue apple",
      "sound": "/u/ + /æ/",
      "ipa": "u",
      "nameIpa": "blu æpəl",
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
          "w": "apple",
          "zh": "蘋果",
          "seg": [
            "æ",
            "p",
            "əl"
          ]
        }
      ]
    },
    {
      "letter": "green orange",
      "sound": "/i/ + /ɔ/",
      "ipa": "i",
      "nameIpa": "grin ɔrɪndʒ",
      "examples": [
        {
          "w": "green",
          "zh": "綠色的",
          "seg": [
            "g",
            "r",
            "i",
            "n"
          ]
        },
        {
          "w": "orange",
          "zh": "柳橙",
          "seg": [
            "ɔ",
            "r",
            "ɪ",
            "n",
            "dʒ"
          ]
        }
      ]
    },
    {
      "letter": "yellow banana",
      "sound": "/ɛ/ + /æ/",
      "ipa": "ɛ",
      "nameIpa": "jɛlo bənænə",
      "examples": [
        {
          "w": "yellow",
          "zh": "黃色的",
          "seg": [
            "j",
            "ɛ",
            "l",
            "o"
          ]
        },
        {
          "w": "banana",
          "zh": "香蕉",
          "seg": [
            "b",
            "ə",
            "n",
            "æ",
            "n",
            "ə"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "It is a blue apple",
  "rule": "英文形容詞放在名詞前面：a + color + fruit。",
  "examples": [
    {
      "text": "It is a blue apple.",
      "zh": "它是一顆藍色的蘋果。"
    },
    {
      "text": "It is a yellow banana.",
      "zh": "它是一根黃色的香蕉。"
    }
  ],
  "quiz": [
    {
      "subject": "It",
      "answer": "blue",
      "full": "It is a blue apple.",
      "prompt": "It is a ___ apple.",
      "zh": "它是一顆藍色的蘋果。"
    },
    {
      "subject": "It",
      "answer": "green",
      "full": "It is a green orange.",
      "prompt": "It is a ___ orange.",
      "zh": "它是一顆綠色的柳橙。"
    },
    {
      "subject": "It",
      "answer": "yellow",
      "full": "It is a yellow banana.",
      "prompt": "It is a ___ banana.",
      "zh": "它是一根黃色的香蕉。"
    }
  ]
};

export const beOptions = [
  "blue",
  "green",
  "yellow",
  "apple",
  "orange",
  "banana"
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
