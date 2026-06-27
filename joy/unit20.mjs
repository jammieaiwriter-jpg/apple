export const dialogueLines = [
  {
    "speaker": "Smart",
    "text": "Stand up, please.",
    "role": "smart",
    "scene": "TPR review",
    "zh": "請站起來。"
  },
  {
    "speaker": "Nick",
    "text": "OK!",
    "role": "nick",
    "scene": "Nick follows",
    "zh": "好的！"
  },
  {
    "speaker": "Abby",
    "text": "Sit down, please.",
    "role": "abby",
    "scene": "TPR review",
    "zh": "請坐下。"
  },
  {
    "speaker": "Fifi",
    "text": "OK!",
    "role": "fifi",
    "scene": "Fifi follows",
    "zh": "好的！"
  },
  {
    "speaker": "Smart",
    "text": "Come here.",
    "role": "smart",
    "scene": "Smart calls",
    "zh": "來這裡。"
  },
  {
    "speaker": "Dum-dum",
    "text": "I'm here.",
    "role": "dum-dum",
    "scene": "Dum-dum comes",
    "zh": "我在這裡。"
  },
  {
    "speaker": "Mad",
    "text": "Go back.",
    "role": "mad",
    "scene": "Mad gives a command",
    "zh": "回去。"
  },
  {
    "speaker": "Happy",
    "text": "OK!",
    "role": "happy",
    "scene": "Happy follows",
    "zh": "好的！"
  },
  {
    "speaker": "Abby",
    "text": "Be nice.",
    "role": "abby",
    "scene": "Character word",
    "zh": "要和善。"
  },
  {
    "speaker": "All",
    "text": "Be nice.",
    "role": "together",
    "scene": "Everyone repeats",
    "zh": "要和善。"
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

export function loadScores(storage, length, key = "joy-unit20-scores") {
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

export function saveScores(storage, scores, key = "joy-unit20-scores") {
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

// ---- Unit 20 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "stand up",
    "kk": "[stænd ʌp]",
    "pos": "phr.",
    "zh": "起立"
  },
  {
    "word": "sit down",
    "kk": "[sɪt daʊn]",
    "pos": "phr.",
    "zh": "坐下"
  },
  {
    "word": "here",
    "kk": "[hɪr]",
    "pos": "adv.",
    "zh": "這裡"
  },
  {
    "word": "back",
    "kk": "[bæk]",
    "pos": "adv.",
    "zh": "回來"
  },
  {
    "word": "what",
    "kk": "[(h)wɑt]",
    "pos": "pron.",
    "zh": "什麼"
  },
  {
    "word": "it",
    "kk": "[ɪt]",
    "pos": "pron.",
    "zh": "它"
  },
  {
    "word": "a",
    "kk": "[ə]",
    "pos": "art.",
    "zh": "一個",
    "say": "uh"
  },
  {
    "word": "an",
    "kk": "[ən]",
    "pos": "art.",
    "zh": "一個"
  }
];

export const phonics = {
  "letters": "重點發音複習",
  "items": [
    {
      "letter": "stand",
      "sound": "/æ/",
      "ipa": "æ",
      "nameIpa": "stænd",
      "examples": [
        {
          "w": "stand",
          "zh": "站",
          "seg": [
            "s",
            "t",
            "æ",
            "n",
            "d"
          ]
        },
        {
          "w": "back",
          "zh": "回來",
          "seg": [
            "b",
            "æ",
            "k"
          ]
        }
      ]
    },
    {
      "letter": "sit",
      "sound": "/ɪ/",
      "ipa": "ɪ",
      "nameIpa": "sɪt",
      "examples": [
        {
          "w": "sit",
          "zh": "坐",
          "seg": [
            "s",
            "ɪ",
            "t"
          ]
        },
        {
          "w": "it",
          "zh": "它",
          "seg": [
            "ɪ",
            "t"
          ]
        }
      ]
    },
    {
      "letter": "down",
      "sound": "/aʊ/",
      "ipa": "aʊ",
      "nameIpa": "daʊn",
      "examples": [
        {
          "w": "down",
          "zh": "下",
          "seg": [
            "d",
            "aʊ",
            "n"
          ]
        },
        {
          "w": "how",
          "zh": "如何",
          "seg": [
            "h",
            "aʊ"
          ]
        }
      ]
    }
  ]
};

export const grammar = {
  "title": "Review: what / it / a / an",
  "rule": "問物品用 What is it? 回答 It is a/an...。",
  "examples": [
    {
      "text": "What is it?",
      "zh": "它是什麼？"
    },
    {
      "text": "It is an apple.",
      "zh": "它是一顆蘋果。"
    }
  ],
  "quiz": [
    {
      "subject": "What",
      "answer": "it",
      "full": "What is it?",
      "prompt": "What is ___?",
      "zh": "它是什麼？"
    },
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
      "subject": "Be",
      "answer": "nice",
      "full": "Be nice.",
      "prompt": "Be ___.",
      "zh": "要和善。"
    }
  ]
};

export const beOptions = [
  "it",
  "a",
  "an",
  "nice",
  "here",
  "back"
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
