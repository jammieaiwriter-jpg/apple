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

// ---- Unit 3 加強內容：單字、Phonics、文法 ----
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
      "examples": [
        {
          "w": "gun",
          "zh": "槍"
        },
        {
          "w": "gold",
          "zh": "金色的"
        }
      ]
    },
    {
      "letter": "Hh",
      "sound": "/h/",
      "examples": [
        {
          "w": "hen",
          "zh": "母雞"
        }
      ]
    },
    {
      "letter": "Ii",
      "sound": "/ɪ/",
      "examples": [
        {
          "w": "inn",
          "zh": "小旅館"
        },
        {
          "w": "in",
          "zh": "在裡面"
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
