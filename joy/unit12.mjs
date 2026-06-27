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
    "speaker": "Shy",
    "text": "Good afternoon. My name is Shy. I'm 6.",
    "role": "shy",
    "scene": "Shy introduces himself",
    "zh": "午安。我的名字叫 Shy。我六歲。"
  },
  {
    "speaker": "Nick",
    "text": "Hi, Shy, nice to meet you.",
    "role": "nick",
    "scene": "Nick greets Shy",
    "zh": "嗨，Shy，很高興認識你。"
  },
  {
    "speaker": "Achoo",
    "text": "Good afternoon. My name is Achoo. I'm 7.",
    "role": "achoo",
    "scene": "Achoo introduces himself",
    "zh": "午安。我的名字叫 Achoo。我七歲。"
  },
  {
    "speaker": "Abby",
    "text": "Hi, Achoo, nice to meet you.",
    "role": "abby",
    "scene": "Abby greets Achoo",
    "zh": "嗨，Achoo，很高興認識你。"
  },
  {
    "speaker": "Dum-dum",
    "text": "Good afternoon. My name is...",
    "role": "dum-dum",
    "scene": "Dum-dum pauses",
    "zh": "午安。我的名字叫……"
  },
  {
    "speaker": "Smart",
    "text": "He's Dum-dum.",
    "role": "smart",
    "scene": "Smart helps",
    "zh": "他是 Dum-dum。"
  },
  {
    "speaker": "Fifi",
    "text": "Hi, Dum-dum, nice to meet you.",
    "role": "fifi",
    "scene": "Fifi greets Dum-dum",
    "zh": "嗨，Dum-dum，很高興認識你。"
  },
  {
    "speaker": "Smart",
    "text": "Nice to meet you, too.",
    "role": "smart",
    "scene": "Smart replies",
    "zh": "我也很高興認識你。"
  },
  {
    "speaker": "Nick",
    "text": "Nice to meet you, too.",
    "role": "nick",
    "scene": "Nick replies",
    "zh": "我也很高興認識你。"
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

export function loadScores(storage, length, key = "joy-unit12-scores") {
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

export function saveScores(storage, scores, key = "joy-unit12-scores") {
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

// ---- Unit 12 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "Shy",
    "kk": "[ʃaɪ]",
    "pos": "n.",
    "zh": "害羞",
    "say": "shy"
  },
  {
    "word": "Achoo",
    "kk": "[əˈtʃu]",
    "pos": "int.",
    "zh": "哈啾",
    "say": "achoo"
  },
  {
    "word": "Dum-dum",
    "kk": "[dʌm dʌm]",
    "pos": "n.",
    "zh": "笨笨",
    "say": "dum dum"
  },
  {
    "word": "too",
    "kk": "[tu]",
    "pos": "adv.",
    "zh": "也"
  },
  {
    "word": "seven",
    "kk": "[ˈsɛvən]",
    "pos": "num.",
    "zh": "七"
  },
  {
    "word": "eight",
    "kk": "[et]",
    "pos": "num.",
    "zh": "八"
  },
  {
    "word": "nine",
    "kk": "[naɪn]",
    "pos": "num.",
    "zh": "九"
  },
  {
    "word": "ten",
    "kk": "[tɛn]",
    "pos": "num.",
    "zh": "十"
  },
  {
    "word": "eleven",
    "kk": "[ɪˈlɛvən]",
    "pos": "num.",
    "zh": "十一"
  },
  {
    "word": "twelve",
    "kk": "[twɛlv]",
    "pos": "num.",
    "zh": "十二"
  }
];

export const phonics = {
  "letters": "重點發音",
  "items": [
    {
      "letter": "sh",
      "sound": "/ʃ/",
      "ipa": "ʃ",
      "nameIpa": "ʃ",
      "examples": [
        {
          "w": "Shy",
          "zh": "害羞",
          "seg": [
            "ʃ",
            "aɪ"
          ]
        },
        {
          "w": "she",
          "zh": "她",
          "seg": [
            "ʃ",
            "i"
          ]
        }
      ]
    },
    {
      "letter": "too",
      "sound": "/u/",
      "ipa": "u",
      "nameIpa": "tu",
      "examples": [
        {
          "w": "too",
          "zh": "也",
          "seg": [
            "t",
            "u"
          ]
        },
        {
          "w": "two",
          "zh": "二",
          "seg": [
            "t",
            "u"
          ]
        }
      ]
    },
    {
      "letter": "ten",
      "sound": "/ɛ/",
      "ipa": "ɛ",
      "nameIpa": "tɛn",
      "examples": [
        {
          "w": "ten",
          "zh": "十",
          "seg": [
            "t",
            "ɛ",
            "n"
          ]
        },
        {
          "w": "seven",
          "zh": "七",
          "seg": [
            "s",
            "ɛ",
            "v",
            "ən"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "Nice to meet you",
  "rule": "初次見面說 Nice to meet you. 回答可以說 Nice to meet you, too.",
  "examples": [
    {
      "text": "Nice to meet you.",
      "zh": "很高興認識你。"
    },
    {
      "text": "Nice to meet you, too.",
      "zh": "我也很高興認識你。"
    }
  ],
  "quiz": [
    {
      "subject": "Nice to meet you",
      "answer": "too",
      "full": "Nice to meet you, too.",
      "prompt": "Nice to meet you, ___.",
      "zh": "我也很高興認識你。"
    },
    {
      "subject": "I",
      "answer": "am",
      "full": "I am 8.",
      "prompt": "I ___ 8.",
      "zh": "我八歲。"
    },
    {
      "subject": "My name",
      "answer": "is",
      "full": "My name is Shy.",
      "prompt": "My name ___ Shy.",
      "zh": "我的名字叫 Shy。"
    }
  ]
};

export const beOptions = [
  "am",
  "is",
  "are",
  "too",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve"
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
