export const dialogueLines = [
  {
    "speaker": "Tin Man",
    "text": "How are you, Scarecrow?",
    "role": "nick",
    "scene": "Ask how he is",
    "zh": "稻草人，你好嗎？"
  },
  {
    "speaker": "Scarecrow",
    "text": "Fine. Thank you. And you?",
    "role": "nick",
    "scene": "Scarecrow answers",
    "zh": "很好，謝謝。你呢？"
  },
  {
    "speaker": "Tin Man",
    "text": "So-so. I want a heart.",
    "role": "nick",
    "scene": "Tin Man feels so-so",
    "zh": "普普通通。我想要一顆心。"
  },
  {
    "speaker": "Scarecrow",
    "text": "I want a brain.",
    "role": "nick",
    "scene": "Scarecrow wants a brain",
    "zh": "我想要一個頭腦。"
  },
  {
    "speaker": "Abby",
    "text": "He's Oz. He can help!",
    "role": "abby",
    "scene": "Oz can help",
    "zh": "他是歐茲王。他可以幫忙！"
  },
  {
    "speaker": "Tin Man",
    "text": "Great!",
    "role": "nick",
    "scene": "Tin Man is happy",
    "zh": "太棒了！"
  },
  {
    "speaker": "All",
    "text": "Let's go!",
    "role": "together",
    "scene": "Everyone goes",
    "zh": "我們走吧！"
  },
  {
    "speaker": "Fifi",
    "text": "Let's go!",
    "role": "fifi",
    "scene": "Fifi repeats",
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

export function loadScores(storage, length, key = "joy-unit7-scores") {
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

export function saveScores(storage, scores, key = "joy-unit7-scores") {
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

// ---- Unit 7 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "how",
    "kk": "[haʊ]",
    "pos": "adv.",
    "zh": "如何"
  },
  {
    "word": "write",
    "kk": "[raɪt]",
    "pos": "v.",
    "zh": "寫"
  },
  {
    "word": "be",
    "kk": "[bi]",
    "pos": "v.",
    "zh": "是；be 動詞原形"
  },
  {
    "word": "fine",
    "kk": "[faɪn]",
    "pos": "adj.",
    "zh": "好的"
  },
  {
    "word": "and",
    "kk": "[ænd]",
    "pos": "conj.",
    "zh": "和；而"
  },
  {
    "word": "so-so",
    "kk": "[ˈsoˌso]",
    "pos": "adj.",
    "zh": "普普通通"
  }
];

export const phonics = {
  "letters": "Qq–Tt",
  "items": [
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
    }
  ]
};

export const grammar = {
  "title": "詢問近況：How are you?",
  "rule": "回答 How are you? 可以用 Great, Fine, OK, 或 So-so。",
  "examples": [
    {
      "text": "How are you?",
      "zh": "你好嗎？"
    },
    {
      "text": "Fine. Thank you.",
      "zh": "很好，謝謝。"
    },
    {
      "text": "So-so.",
      "zh": "普普通通。"
    }
  ],
  "quiz": [
    {
      "subject": "How are you?",
      "answer": "Fine",
      "full": "Fine. Thank you.",
      "prompt": "How are you? ___.",
      "zh": "很好，謝謝。"
    },
    {
      "subject": "How are you?",
      "answer": "Great",
      "full": "Great!",
      "prompt": "How are you? ___.",
      "zh": "太棒了！"
    },
    {
      "subject": "How are you?",
      "answer": "OK",
      "full": "OK.",
      "prompt": "How are you? ___.",
      "zh": "還可以。"
    },
    {
      "subject": "How are you?",
      "answer": "So-so",
      "full": "So-so.",
      "prompt": "How are you? ___.",
      "zh": "普普通通。"
    }
  ]
};

export const beOptions = [
  "Fine",
  "Great",
  "OK",
  "So-so"
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
