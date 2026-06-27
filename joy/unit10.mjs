export const dialogueLines = [
  {
    "speaker": "Scarecrow",
    "text": "I want a brain!",
    "role": "nick",
    "scene": "Review wants",
    "zh": "我想要一個頭腦！"
  },
  {
    "speaker": "Tin Man",
    "text": "I want a heart!",
    "role": "nick",
    "scene": "Review wants",
    "zh": "我想要一顆心！"
  },
  {
    "speaker": "Lion",
    "text": "I'm scared. I want courage.",
    "role": "nick",
    "scene": "Review courage",
    "zh": "我害怕。我想要勇氣。"
  },
  {
    "speaker": "Nick + Abby",
    "text": "He's Oz. He can help!",
    "role": "together",
    "scene": "Review he can",
    "zh": "他是歐茲王。他可以幫忙！"
  },
  {
    "speaker": "Eric",
    "text": "Let's go! Let's play ball.",
    "role": "nick",
    "scene": "Play ball",
    "zh": "我們走吧！我們去打球。"
  },
  {
    "speaker": "Tom + Lucy",
    "text": "OK, let's go! Yeah!",
    "role": "together",
    "scene": "Go play",
    "zh": "好啊，我們走吧！耶！"
  },
  {
    "speaker": "Tom",
    "text": "He can sing!",
    "role": "nick",
    "scene": "He can sing",
    "zh": "他會唱歌！"
  },
  {
    "speaker": "Woman",
    "text": "He can dance.",
    "role": "abby",
    "scene": "He can dance",
    "zh": "他會跳舞。"
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

export function loadScores(storage, length, key = "joy-unit10-scores") {
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

export function saveScores(storage, scores, key = "joy-unit10-scores") {
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

// ---- Unit 10 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "hurry up",
    "kk": "[ˈhɝɪ ʌp]",
    "pos": "phr.",
    "zh": "快一點"
  },
  {
    "word": "run",
    "kk": "[rʌn]",
    "pos": "v.",
    "zh": "跑"
  },
  {
    "word": "walk",
    "kk": "[wɔk]",
    "pos": "v.",
    "zh": "走"
  },
  {
    "word": "on time",
    "kk": "[ɑn ˈtaɪm]",
    "pos": "phr.",
    "zh": "準時"
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
    "word": "is",
    "kk": "[ɪz]",
    "pos": "v.",
    "zh": "是"
  },
  {
    "word": "Be on time.",
    "kk": "[bi ɑn ˈtaɪm]",
    "pos": "phr.",
    "zh": "要準時",
    "say": "be on time"
  }
];

export const phonics = {
  "letters": "Mm–Zz Review",
  "items": [
    {
      "letter": "Mm",
      "sound": "/m/",
      "ipa": "m",
      "nameIpa": "ɛm",
      "examples": [
        {
          "w": "map",
          "zh": "地圖",
          "seg": [
            "m",
            "æ",
            "p"
          ]
        },
        {
          "w": "yam",
          "zh": "番薯",
          "seg": [
            "j",
            "æ",
            "m"
          ]
        }
      ]
    },
    {
      "letter": "Nn",
      "sound": "/n/",
      "ipa": "n",
      "nameIpa": "ɛn",
      "examples": [
        {
          "w": "net",
          "zh": "網子",
          "seg": [
            "n",
            "ɛ",
            "t"
          ]
        },
        {
          "w": "man",
          "zh": "男人",
          "seg": [
            "m",
            "æ",
            "n"
          ]
        }
      ]
    },
    {
      "letter": "Oo",
      "sound": "/ɑ/",
      "ipa": "ɑ",
      "nameIpa": "oʊ",
      "examples": [
        {
          "w": "ox",
          "zh": "牛",
          "seg": [
            "ɑ",
            "k",
            "s"
          ]
        },
        {
          "w": "box",
          "zh": "箱子",
          "seg": [
            "b",
            "ɑ",
            "k",
            "s"
          ]
        }
      ]
    },
    {
      "letter": "Pp",
      "sound": "/p/",
      "ipa": "p",
      "nameIpa": "pi",
      "examples": [
        {
          "w": "pig",
          "zh": "豬",
          "seg": [
            "p",
            "ɪ",
            "g"
          ]
        },
        {
          "w": "pond",
          "zh": "池塘",
          "seg": [
            "p",
            "ɑ",
            "n",
            "d"
          ]
        }
      ]
    },
    {
      "letter": "Qq",
      "sound": "/kw/",
      "ipa": "kw",
      "nameIpa": "kju",
      "examples": [
        {
          "w": "quilt",
          "zh": "被子",
          "seg": [
            "kw",
            "ɪ",
            "l",
            "t"
          ]
        },
        {
          "w": "queen",
          "zh": "皇后",
          "seg": [
            "kw",
            "i",
            "n"
          ]
        }
      ]
    },
    {
      "letter": "Rr",
      "sound": "/r/",
      "ipa": "r",
      "nameIpa": "ɑr",
      "examples": [
        {
          "w": "rat",
          "zh": "老鼠",
          "seg": [
            "r",
            "æ",
            "t"
          ]
        },
        {
          "w": "bear",
          "zh": "熊",
          "seg": [
            "b",
            "ɛ",
            "r"
          ]
        }
      ]
    },
    {
      "letter": "Ss",
      "sound": "/s/",
      "ipa": "s",
      "nameIpa": "ɛs",
      "examples": [
        {
          "w": "sun",
          "zh": "太陽",
          "seg": [
            "s",
            "ʌ",
            "n"
          ]
        },
        {
          "w": "seal",
          "zh": "海豹",
          "seg": [
            "s",
            "i",
            "l"
          ]
        }
      ]
    },
    {
      "letter": "Tt",
      "sound": "/t/",
      "ipa": "t",
      "nameIpa": "ti",
      "examples": [
        {
          "w": "top",
          "zh": "陀螺",
          "seg": [
            "t",
            "ɑ",
            "p"
          ]
        },
        {
          "w": "toad",
          "zh": "蟾蜍",
          "seg": [
            "t",
            "oʊ",
            "d"
          ]
        }
      ]
    },
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
    },
    {
      "letter": "Xx",
      "sound": "/ks/",
      "ipa": "ks",
      "nameIpa": "ɛks",
      "examples": [
        {
          "w": "fox",
          "zh": "狐狸",
          "seg": [
            "f",
            "ɑ",
            "k",
            "s"
          ]
        },
        {
          "w": "fax",
          "zh": "傳真",
          "seg": [
            "f",
            "æ",
            "k",
            "s"
          ]
        }
      ]
    },
    {
      "letter": "Yy",
      "sound": "/j/",
      "ipa": "j",
      "nameIpa": "waɪ",
      "examples": [
        {
          "w": "yak",
          "zh": "犛牛",
          "seg": [
            "j",
            "æ",
            "k"
          ]
        },
        {
          "w": "yell",
          "zh": "喊叫",
          "seg": [
            "j",
            "ɛ",
            "l"
          ]
        }
      ]
    },
    {
      "letter": "Zz",
      "sound": "/z/",
      "ipa": "z",
      "nameIpa": "zi",
      "examples": [
        {
          "w": "zip",
          "zh": "拉上",
          "seg": [
            "z",
            "ɪ",
            "p"
          ]
        },
        {
          "w": "zipper",
          "zh": "拉鍊",
          "seg": [
            "z",
            "ɪ",
            "p",
            "ɚ"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "複習：he / she / is / can",
  "rule": "he 是他，she 是她；he/she 配 is，也可以用 can 表達能力。",
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
      "text": "He can sing.",
      "zh": "他會唱歌。"
    },
    {
      "text": "Be on time.",
      "zh": "要準時。"
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
      "subject": "He can",
      "answer": "sing",
      "full": "He can sing.",
      "prompt": "He can ___.",
      "zh": "他會唱歌。"
    },
    {
      "subject": "Be",
      "answer": "on time",
      "full": "Be on time.",
      "prompt": "Be ___.",
      "zh": "要準時。"
    }
  ]
};

export const beOptions = [
  "is",
  "sing",
  "dance",
  "on time"
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
