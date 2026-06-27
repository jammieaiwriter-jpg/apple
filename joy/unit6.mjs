export const dialogueLines = [
  {
    "speaker": "Abby",
    "text": "Listen!",
    "role": "abby",
    "scene": "Listen carefully",
    "zh": "聽啊！"
  },
  {
    "speaker": "Nick",
    "text": "Look!",
    "role": "nick",
    "scene": "Look over there",
    "zh": "看啊！"
  },
  {
    "speaker": "Nick",
    "text": "Hi, I'm Nick.",
    "role": "nick",
    "scene": "Meet Nick",
    "zh": "嗨，我是尼克。"
  },
  {
    "speaker": "Abby",
    "text": "Hello. I'm Abby. This is Scarecrow.",
    "role": "abby",
    "scene": "Introduce friends",
    "zh": "哈囉。我是艾比。這位是稻草人。"
  },
  {
    "speaker": "Scarecrow",
    "text": "Are you okay?",
    "role": "nick",
    "scene": "Check on Tin Man",
    "zh": "你還好嗎？"
  },
  {
    "speaker": "Tin Man",
    "text": "No, I'm not.",
    "role": "nick",
    "scene": "Tin Man answers",
    "zh": "不，我不好。"
  },
  {
    "speaker": "Abby",
    "text": "Let's help!",
    "role": "abby",
    "scene": "Go help",
    "zh": "我們來幫忙吧！"
  },
  {
    "speaker": "Nick",
    "text": "OK!",
    "role": "nick",
    "scene": "Nick agrees",
    "zh": "好的！"
  },
  {
    "speaker": "Tin Man",
    "text": "Thank you. I'm Tin Man. I can dance.",
    "role": "nick",
    "scene": "Meet Tin Man",
    "zh": "謝謝你們。我是錫人。我會跳舞。"
  },
  {
    "speaker": "Tin Man",
    "text": "Oops! I'm sorry!",
    "role": "nick",
    "scene": "An apology",
    "zh": "哎呀！對不起！"
  },
  {
    "speaker": "Scarecrow",
    "text": "It's OK.",
    "role": "nick",
    "scene": "It's OK",
    "zh": "沒關係。"
  },
  {
    "speaker": "Nick + Abby",
    "text": "Hahaha...",
    "role": "together",
    "scene": "Everyone laughs",
    "zh": "哈哈哈……",
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

export function loadScores(storage, length, key = "joy-unit6-scores") {
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

export function saveScores(storage, scores, key = "joy-unit6-scores") {
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

// ---- Unit 6 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "squeak",
    "kk": "[skwik]",
    "pos": "n.",
    "zh": "吱吱聲"
  },
  {
    "word": "thank",
    "kk": "[θæŋk]",
    "pos": "v.",
    "zh": "謝謝"
  },
  {
    "word": "Tin Man",
    "kk": "[ˈtɪn ˈmæn]",
    "pos": "n.",
    "zh": "錫人"
  },
  {
    "word": "oops",
    "kk": "[ups]",
    "pos": "int.",
    "zh": "哎呀"
  },
  {
    "word": "sorry",
    "kk": "[ˈsɑrɪ]",
    "pos": "adj.",
    "zh": "抱歉的"
  },
  {
    "word": "it",
    "kk": "[ɪt]",
    "pos": "pron.",
    "zh": "它"
  },
  {
    "word": "OK",
    "kk": "[ˌoˈke]",
    "pos": "adj.",
    "zh": "好的；可以的"
  }
];

export const phonics = {
  "letters": "Mm–Pp",
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
    }
  ]
};

export const grammar = {
  "title": "邀請一起做：Let's...",
  "rule": "Let's 後面接動作，表示「我們一起……吧」。",
  "examples": [
    {
      "text": "Let's help!",
      "zh": "我們來幫忙吧！"
    },
    {
      "text": "Let's go!",
      "zh": "我們走吧！"
    },
    {
      "text": "Let's play ball.",
      "zh": "我們去打球吧。"
    }
  ],
  "quiz": [
    {
      "subject": "Let's",
      "answer": "help",
      "full": "Let's help!",
      "prompt": "Let's ___.",
      "zh": "我們來幫忙吧！"
    },
    {
      "subject": "Let's",
      "answer": "go",
      "full": "Let's go!",
      "prompt": "Let's ___.",
      "zh": "我們走吧！"
    },
    {
      "subject": "Let's",
      "answer": "play ball",
      "full": "Let's play ball.",
      "prompt": "Let's ___.",
      "zh": "我們去打球吧。"
    },
    {
      "subject": "It's",
      "answer": "OK",
      "full": "It's OK.",
      "prompt": "It's ___.",
      "zh": "沒關係。"
    }
  ]
};

export const beOptions = [
  "help",
  "go",
  "play ball",
  "OK"
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
