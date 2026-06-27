export const dialogueLines = [
  {
    "speaker": "The seven dwarfs",
    "text": "Heigh-ho, heigh-ho, it's home from work we go.",
    "role": "together",
    "scene": "Seven dwarfs sing",
    "zh": "七矮人唱著歌下班回家。",
    "scored": false
  },
  {
    "speaker": "Nick",
    "text": "Listen!",
    "role": "nick",
    "scene": "Nick hears singing",
    "zh": "聽啊！"
  },
  {
    "speaker": "The seven dwarfs",
    "text": "Heigh-ho, heigh-ho, it's home from work we go.",
    "role": "together",
    "scene": "Seven dwarfs sing again",
    "zh": "七矮人又唱著歌。",
    "scored": false
  },
  {
    "speaker": "Abby",
    "text": "Look! Who are they?",
    "role": "abby",
    "scene": "Abby sees them",
    "zh": "看啊！他們是誰？"
  },
  {
    "speaker": "Nick",
    "text": "I don't know.",
    "role": "nick",
    "scene": "Nick is unsure",
    "zh": "我不知道。"
  },
  {
    "speaker": "Abby",
    "text": "Let's go.",
    "role": "abby",
    "scene": "Abby decides",
    "zh": "我們走吧。"
  },
  {
    "speaker": "Fifi",
    "text": "Let's go.",
    "role": "fifi",
    "scene": "Fifi follows",
    "zh": "走吧。"
  },
  {
    "speaker": "Smart",
    "text": "Good afternoon. My name is Smart. I'm 4.",
    "role": "smart",
    "scene": "Smart introduces himself",
    "zh": "午安。我的名字叫 Smart。我四歲。"
  },
  {
    "speaker": "Nick",
    "text": "Good afternoon. My name is Nick.",
    "role": "nick",
    "scene": "Nick introduces himself",
    "zh": "午安。我的名字叫 Nick。"
  },
  {
    "speaker": "Mad",
    "text": "Good afternoon. My name is Mad. I'm 2.",
    "role": "mad",
    "scene": "Mad introduces himself",
    "zh": "午安。我的名字叫 Mad。我兩歲。"
  },
  {
    "speaker": "Abby",
    "text": "Good afternoon. My name is Abby.",
    "role": "abby",
    "scene": "Abby introduces herself",
    "zh": "午安。我的名字叫 Abby。"
  },
  {
    "speaker": "Happy",
    "text": "Good afternoon. My name is Happy. I'm 1.",
    "role": "happy",
    "scene": "Happy introduces himself",
    "zh": "午安。我的名字叫 Happy。我一歲。"
  },
  {
    "speaker": "Fifi",
    "text": "Good afternoon. My name is Fifi.",
    "role": "fifi",
    "scene": "Fifi introduces herself",
    "zh": "午安。我的名字叫 Fifi。"
  },
  {
    "speaker": "Tired",
    "text": "Good afternoon. My name is Tired. I'm 3.",
    "role": "tired",
    "scene": "Tired introduces himself",
    "zh": "午安。我的名字叫 Tired。我三歲。"
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

export function loadScores(storage, length, key = "joy-unit11-scores") {
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

export function saveScores(storage, scores, key = "joy-unit11-scores") {
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

// ---- Unit 11 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "heigh-ho",
    "kk": "[haɪ ho]",
    "pos": "int.",
    "zh": "嗨喲"
  },
  {
    "word": "my",
    "kk": "[maɪ]",
    "pos": "det.",
    "zh": "我的"
  },
  {
    "word": "Smart",
    "kk": "[smɑrt]",
    "pos": "n.",
    "zh": "聰明",
    "say": "smart"
  },
  {
    "word": "Mad",
    "kk": "[mæd]",
    "pos": "n.",
    "zh": "生氣",
    "say": "mad"
  },
  {
    "word": "Happy",
    "kk": "[ˈhæpɪ]",
    "pos": "n.",
    "zh": "開心",
    "say": "happy"
  },
  {
    "word": "Tired",
    "kk": "[taɪrd]",
    "pos": "n.",
    "zh": "累",
    "say": "tired"
  },
  {
    "word": "one",
    "kk": "[wʌn]",
    "pos": "num.",
    "zh": "一"
  },
  {
    "word": "two",
    "kk": "[tu]",
    "pos": "num.",
    "zh": "二"
  },
  {
    "word": "three",
    "kk": "[θri]",
    "pos": "num.",
    "zh": "三"
  },
  {
    "word": "four",
    "kk": "[fɔr]",
    "pos": "num.",
    "zh": "四"
  },
  {
    "word": "five",
    "kk": "[faɪv]",
    "pos": "num.",
    "zh": "五"
  },
  {
    "word": "six",
    "kk": "[sɪks]",
    "pos": "num.",
    "zh": "六"
  }
];

export const phonics = {
  "letters": "重點發音",
  "items": [
    {
      "letter": "my",
      "sound": "/aɪ/",
      "ipa": "aɪ",
      "nameIpa": "maɪ",
      "examples": [
        {
          "w": "my",
          "zh": "我的",
          "seg": [
            "m",
            "aɪ"
          ]
        },
        {
          "w": "five",
          "zh": "五",
          "seg": [
            "f",
            "aɪ",
            "v"
          ]
        }
      ]
    },
    {
      "letter": "name",
      "sound": "/eɪ/",
      "ipa": "eɪ",
      "nameIpa": "neɪm",
      "examples": [
        {
          "w": "name",
          "zh": "名字",
          "seg": [
            "n",
            "eɪ",
            "m"
          ]
        },
        {
          "w": "eight",
          "zh": "八",
          "seg": [
            "eɪ",
            "t"
          ]
        }
      ]
    },
    {
      "letter": "six",
      "sound": "/ɪ/",
      "ipa": "ɪ",
      "nameIpa": "sɪks",
      "examples": [
        {
          "w": "six",
          "zh": "六",
          "seg": [
            "s",
            "ɪ",
            "k",
            "s"
          ]
        },
        {
          "w": "Nick",
          "zh": "尼克",
          "seg": [
            "n",
            "ɪ",
            "k"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "My name is... / I am...",
  "rule": "介紹名字用 My name is...，介紹年紀用 I am + number.",
  "examples": [
    {
      "text": "My name is Smart.",
      "zh": "我的名字叫 Smart。"
    },
    {
      "text": "I am 4.",
      "zh": "我四歲。"
    }
  ],
  "quiz": [
    {
      "subject": "My name",
      "answer": "is",
      "full": "My name is Smart.",
      "prompt": "My name ___ Smart.",
      "zh": "我的名字叫 Smart。"
    },
    {
      "subject": "I",
      "answer": "am",
      "full": "I am 4.",
      "prompt": "I ___ 4.",
      "zh": "我四歲。"
    },
    {
      "subject": "I",
      "answer": "am",
      "full": "I am 6.",
      "prompt": "I ___ 6.",
      "zh": "我六歲。"
    }
  ]
};

export const beOptions = [
  "am",
  "is",
  "are",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six"
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
