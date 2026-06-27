export const dialogueLines = [
  {
    "speaker": "Abby",
    "text": "Who is she?",
    "role": "abby",
    "scene": "Abby sees someone",
    "zh": "她是誰？"
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
    "text": "Let's see.",
    "role": "abby",
    "scene": "Abby checks",
    "zh": "我們來看看吧。"
  },
  {
    "speaker": "Abby",
    "text": "How are you?",
    "role": "abby",
    "scene": "Abby asks",
    "zh": "你好嗎？"
  },
  {
    "speaker": "Witch",
    "text": "So-so.",
    "role": "witch",
    "scene": "Witch answers",
    "zh": "普通。"
  },
  {
    "speaker": "Witch",
    "text": "What's your name?",
    "role": "witch",
    "scene": "Witch asks",
    "zh": "你的名字是什麼？"
  },
  {
    "speaker": "Abby",
    "text": "My name is Abby.",
    "role": "abby",
    "scene": "Abby answers",
    "zh": "我的名字叫 Abby。"
  },
  {
    "speaker": "Witch",
    "text": "This is for you, Abby.",
    "role": "witch",
    "scene": "Witch gives something",
    "zh": "這是給你的，Abby。"
  },
  {
    "speaker": "Abby",
    "text": "Thank you.",
    "role": "abby",
    "scene": "Abby thanks her",
    "zh": "謝謝你。"
  },
  {
    "speaker": "Smart",
    "text": "What is it?",
    "role": "smart",
    "scene": "Smart asks",
    "zh": "它是什麼？"
  },
  {
    "speaker": "Witch",
    "text": "It's an apple.",
    "role": "witch",
    "scene": "Witch answers",
    "zh": "它是一顆蘋果。"
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

export function loadScores(storage, length, key = "joy-unit18-scores") {
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

export function saveScores(storage, scores, key = "joy-unit18-scores") {
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

// ---- Unit 18 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "for",
    "kk": "[fɔr]",
    "pos": "prep.",
    "zh": "給"
  },
  {
    "word": "an",
    "kk": "[ən]",
    "pos": "art.",
    "zh": "一個"
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
      "letter": "apple",
      "sound": "/æ/",
      "ipa": "æ",
      "nameIpa": "æpəl",
      "examples": [
        {
          "w": "apple",
          "zh": "蘋果",
          "seg": [
            "æ",
            "p",
            "əl"
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
    },
    {
      "letter": "orange",
      "sound": "/ɔ/",
      "ipa": "ɔ",
      "nameIpa": "ɔrɪndʒ",
      "examples": [
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
    },
    {
      "letter": "an",
      "sound": "/ən/",
      "ipa": "ən",
      "nameIpa": "ən",
      "examples": [
        {
          "w": "an",
          "zh": "一個",
          "seg": [
            "ə",
            "n"
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
  "title": "What is it? It is a/an...",
  "rule": "子音音開頭用 a，母音音開頭用 an。apple/orange 前用 an。",
  "examples": [
    {
      "text": "It is an apple.",
      "zh": "它是一顆蘋果。"
    },
    {
      "text": "It is a banana.",
      "zh": "它是一根香蕉。"
    }
  ],
  "quiz": [
    {
      "subject": "It",
      "answer": "an",
      "full": "It is an apple.",
      "prompt": "It is ___ apple.",
      "zh": "它是一顆蘋果。"
    },
    {
      "subject": "It",
      "answer": "a",
      "full": "It is a banana.",
      "prompt": "It is ___ banana.",
      "zh": "它是一根香蕉。"
    },
    {
      "subject": "What",
      "answer": "apple",
      "full": "It is an apple.",
      "prompt": "It is an ___.",
      "zh": "它是一顆蘋果。"
    }
  ]
};

export const beOptions = [
  "a",
  "an",
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
