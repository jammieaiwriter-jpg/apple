export const dialogueLines = [
  {
    "speaker": "Nick",
    "text": "Hi, I'm Nick. What's your name?",
    "role": "nick",
    "scene": "Review greetings",
    "zh": "嗨，我是 Nick。你叫什麼名字？"
  },
  {
    "speaker": "Abby",
    "text": "Hello, Nick. I'm Abby.",
    "role": "abby",
    "scene": "Review introductions",
    "zh": "你好 Nick，我是 Abby。"
  },
  {
    "speaker": "Abby",
    "text": "Good morning. I'm Abby. This is Nick.",
    "role": "abby",
    "scene": "Review morning",
    "zh": "早安，我是艾比。這位是尼克。"
  },
  {
    "speaker": "Nick",
    "text": "He's Oz. He can help.",
    "role": "nick",
    "scene": "Review he is",
    "zh": "他是歐茲王。他可以幫忙。"
  },
  {
    "speaker": "Scarecrow",
    "text": "Great! I want a brain.",
    "role": "nick",
    "scene": "Review I want",
    "zh": "太棒了！我想要一個頭腦。"
  },
  {
    "speaker": "Fifi",
    "text": "Let's go!",
    "role": "fifi",
    "scene": "Review action",
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

export function loadScores(storage, length, key = "joy-unit5-scores") {
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

export function saveScores(storage, scores, key = "joy-unit5-scores") {
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

// ---- Unit 5 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "draw",
    "kk": "[drɔ]",
    "pos": "v.",
    "zh": "畫"
  },
  {
    "word": "color",
    "kk": "[ˈkʌlɚ]",
    "pos": "v.",
    "zh": "著色"
  },
  {
    "word": "I",
    "kk": "[aɪ]",
    "pos": "pron.",
    "zh": "我",
    "say": "eye"
  },
  {
    "word": "am",
    "kk": "[æm]",
    "pos": "v.",
    "zh": "是（配 I）"
  },
  {
    "word": "you",
    "kk": "[ju]",
    "pos": "pron.",
    "zh": "你"
  },
  {
    "word": "are",
    "kk": "[ɑr]",
    "pos": "v.",
    "zh": "是（配 you）"
  },
  {
    "word": "Be good.",
    "kk": "[bi gʊd]",
    "pos": "phr.",
    "zh": "要乖；要做好",
    "say": "be good"
  }
];

export const phonics = {
  "letters": "Aa–Ll Review",
  "items": [
    {
      "letter": "Aa",
      "sound": "/æ/",
      "ipa": "æ",
      "nameIpa": "eɪ",
      "examples": [
        {
          "w": "ant",
          "zh": "螞蟻",
          "seg": [
            "æ",
            "n",
            "t"
          ]
        }
      ]
    },
    {
      "letter": "Bb",
      "sound": "/b/",
      "ipa": "b",
      "nameIpa": "bi",
      "examples": [
        {
          "w": "bag",
          "zh": "袋子",
          "seg": [
            "b",
            "æ",
            "g"
          ]
        }
      ]
    },
    {
      "letter": "Cc",
      "sound": "/k/",
      "ipa": "k",
      "nameIpa": "si",
      "examples": [
        {
          "w": "cat",
          "zh": "貓",
          "seg": [
            "k",
            "æ",
            "t"
          ]
        }
      ]
    },
    {
      "letter": "Dd",
      "sound": "/d/",
      "ipa": "d",
      "nameIpa": "di",
      "examples": [
        {
          "w": "duck",
          "zh": "鴨子",
          "seg": [
            "d",
            "ʌ",
            "k"
          ]
        },
        {
          "w": "sad",
          "zh": "傷心的",
          "seg": [
            "s",
            "æ",
            "d"
          ]
        }
      ]
    },
    {
      "letter": "Ee",
      "sound": "/ɛ/",
      "ipa": "ɛ",
      "nameIpa": "i",
      "examples": [
        {
          "w": "egg",
          "zh": "蛋",
          "seg": [
            "ɛ",
            "g"
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
      "letter": "Ff",
      "sound": "/f/",
      "ipa": "f",
      "nameIpa": "ɛf",
      "examples": [
        {
          "w": "fish",
          "zh": "魚",
          "seg": [
            "f",
            "ɪ",
            "ʃ"
          ]
        },
        {
          "w": "fat",
          "zh": "胖胖的",
          "seg": [
            "f",
            "æ",
            "t"
          ]
        }
      ]
    },
    {
      "letter": "Gg",
      "sound": "/g/",
      "ipa": "g",
      "nameIpa": "dʒi",
      "examples": [
        {
          "w": "good",
          "zh": "好的",
          "seg": [
            "g",
            "ʊ",
            "d"
          ]
        },
        {
          "w": "gun",
          "zh": "槍",
          "seg": [
            "g",
            "ʌ",
            "n"
          ]
        }
      ]
    },
    {
      "letter": "Hh",
      "sound": "/h/",
      "ipa": "h",
      "nameIpa": "eɪtʃ",
      "examples": [
        {
          "w": "hen",
          "zh": "母雞",
          "seg": [
            "h",
            "ɛ",
            "n"
          ]
        }
      ]
    },
    {
      "letter": "Ii",
      "sound": "/ɪ/",
      "ipa": "ɪ",
      "nameIpa": "aɪ",
      "examples": [
        {
          "w": "in",
          "zh": "在裡面",
          "seg": [
            "ɪ",
            "n"
          ]
        }
      ]
    },
    {
      "letter": "Jj",
      "sound": "/dʒ/",
      "ipa": "dʒ",
      "nameIpa": "dʒeɪ",
      "examples": [
        {
          "w": "jet",
          "zh": "噴射機",
          "seg": [
            "dʒ",
            "ɛ",
            "t"
          ]
        }
      ]
    },
    {
      "letter": "Kk",
      "sound": "/k/",
      "ipa": "k",
      "nameIpa": "keɪ",
      "examples": [
        {
          "w": "kid",
          "zh": "小孩",
          "seg": [
            "k",
            "ɪ",
            "d"
          ]
        }
      ]
    },
    {
      "letter": "Ll",
      "sound": "/l/",
      "ipa": "l",
      "nameIpa": "ɛl",
      "examples": [
        {
          "w": "lamp",
          "zh": "燈",
          "seg": [
            "l",
            "æ",
            "m",
            "p"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "複習 be 動詞：I am / You are",
  "rule": "I 配 am；you 配 are；he / she 配 is。Sight Words 要能一眼認出來。",
  "examples": [
    {
      "text": "I am Abby.",
      "zh": "我是 Abby。"
    },
    {
      "text": "You are Nick.",
      "zh": "你是 Nick。"
    },
    {
      "text": "He is Oz.",
      "zh": "他是歐茲王。"
    },
    {
      "text": "Be good.",
      "zh": "要乖；要做好。"
    }
  ],
  "quiz": [
    {
      "subject": "I",
      "answer": "am",
      "full": "I am Abby.",
      "zh": "我是 Abby。"
    },
    {
      "subject": "You",
      "answer": "are",
      "full": "You are Nick.",
      "zh": "你是 Nick。"
    },
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
    }
  ]
};

export const beOptions = [
  "am",
  "are",
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
