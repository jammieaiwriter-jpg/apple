export const dialogueLines = [
  {
    "speaker": "Scarecrow",
    "text": "I want a brain!",
    "role": "nick",
    "scene": "Scarecrow's wish",
    "zh": "我想要一個頭腦！"
  },
  {
    "speaker": "Tin Man",
    "text": "I want a heart!",
    "role": "nick",
    "scene": "Tin Man's wish",
    "zh": "我想要一顆心！"
  },
  {
    "speaker": "Lion",
    "text": "I'm... scared. I... I... want... courage.",
    "role": "nick",
    "scene": "Lion's wish",
    "zh": "我好……害怕。我……我……想要……勇氣。"
  },
  {
    "speaker": "Nick + Abby",
    "text": "He's Oz. He can help!",
    "role": "together",
    "scene": "Oz can help",
    "zh": "他是歐茲王。他可以幫忙！"
  },
  {
    "speaker": "Lion",
    "text": "Great!",
    "role": "nick",
    "scene": "Lion feels better",
    "zh": "太棒了！"
  },
  {
    "speaker": "Nick",
    "text": "Let's go to Oz.",
    "role": "nick",
    "scene": "Go to Oz",
    "zh": "我們一起去找歐茲王吧。"
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

const HOMO = new Map(Object.entries({
  to:'two',too:'two',two:'two',for:'four',fore:'four',four:'four',ate:'eight',eight:'eight',
  won:'one',one:'one',our:'our',hour:'our',no:'no',know:'no',new:'new',knew:'new',
  there:'there',their:'there',theyre:'there',here:'here',hear:'here',your:'your',youre:'your',
  by:'by',buy:'by',bye:'by',see:'see',sea:'see',be:'be',bee:'be',right:'right',write:'right',
  son:'son',sun:'son',meat:'meat',meet:'meat',week:'week',weak:'weak',wait:'wait',weight:'wait',
  pair:'pair',pear:'pair',plane:'plane',plain:'plain',road:'road',rode:'road',sale:'sale',sail:'sale',
  tail:'tail',tale:'tale',threw:'threw',through:'threw',wood:'wood',would:'wood',
  flour:'flour',flower:'flour',blue:'blue',blew:'blue',night:'night',knight:'night',
  hi:'hi',high:'hi',mail:'mail',male:'mail',eye:'i',i:'i',red:'red',read:'red',
}));
const CN1 = { zero:0,oh:0,o:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9 };
const CN2 = { ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19 };
const CN3 = { twenty:20,thirty:30,forty:40,fourty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90 };

// 同音字 + 數字收斂。兩者都是「孩子沒唸錯卻被扣分」的來源：
//   ① to / two / too 在語音上是同一個音，辨識器選哪個是它的猜測（實際遇過只給 1 星）
//   ② 「Taipei 101」會被聽成「taipei one o one」，o / oh 也要當 zero
// 連續個位數只在 3 位以上才合併，否則 "two to" 會被誤併成 22。
export function canonSeq(str) {
  let words = String(str || "").toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  words = words.map((w) => (HOMO.has(w) ? HOMO.get(w) : w));
  const out = [];
  let i = 0;
  while (i < words.length) {
    const w = words[i];
    let v = null;
    if (/^\d+$/.test(w)) { out.push(w); i += 1; continue; }
    if (CN3[w] !== undefined) { v = CN3[w]; if (CN1[words[i + 1]] > 0) { v += CN1[words[i + 1]]; i += 1; } }
    else if (CN2[w] !== undefined) v = CN2[w];
    else if (CN1[w] !== undefined) v = CN1[w];
    if (v === null) { out.push(w); i += 1; continue; }
    while (words[i + 1] === "hundred" || words[i + 1] === "thousand") {
      v *= words[i + 1] === "hundred" ? 100 : 1000;
      i += 1;
      if (words[i + 1] === "and") i += 1;
      const nx = words[i + 1];
      let add = null;
      if (nx !== undefined) {
        if (CN3[nx] !== undefined) { add = CN3[nx]; if (CN1[words[i + 2]] > 0) { add += CN1[words[i + 2]]; i += 1; } }
        else if (CN2[nx] !== undefined) add = CN2[nx];
        else if (CN1[nx] > 0) add = CN1[nx];
        if (add !== null) { v += add; i += 1; }
      }
    }
    out.push(String(v));
    i += 1;
  }
  const merged = [];
  let run = [];
  const flush = () => {
    if (run.length >= 3) merged.push(run.join(""));
    else run.forEach((x) => merged.push(x));
    run = [];
  };
  out.forEach((t) => { if (/^\d$/.test(t)) run.push(t); else { flush(); merged.push(t); } });
  flush();
  return merged;
}

export function normalizeSpeech(value) {
  let normalized = String(value || "").toLowerCase();
  for (const [from, to] of contractionMap.entries()) {
    normalized = normalized.replaceAll(from, to);
  }
  return canonSeq(normalized).join(" ");
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

export function loadScores(storage, length, key = "joy-unit9-scores") {
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

export function saveScores(storage, scores, key = "joy-unit9-scores") {
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

// ---- Unit 9 content: vocab, phonics, grammar ----

export const vocab = [
  {
    "word": "scared",
    "kk": "[skɛrd]",
    "pos": "adj.",
    "zh": "害怕的"
  },
  {
    "word": "courage",
    "kk": "[ˈkɝɪdʒ]",
    "pos": "n.",
    "zh": "勇氣"
  },
  {
    "word": "stop",
    "kk": "[stɑp]",
    "pos": "v.",
    "zh": "停止"
  },
  {
    "word": "sing",
    "kk": "[sɪŋ]",
    "pos": "v.",
    "zh": "唱歌"
  },
  {
    "word": "dance",
    "kk": "[dæns]",
    "pos": "v.",
    "zh": "跳舞"
  },
  {
    "word": "fox",
    "kk": "[fɑks]",
    "pos": "n.",
    "zh": "狐狸"
  },
  {
    "word": "fax",
    "kk": "[fæks]",
    "pos": "v.",
    "zh": "傳真"
  },
  {
    "word": "to",
    "kk": "[tu]",
    "pos": "prep.",
    "zh": "到；向"
  },
  {
    "word": "yak",
    "kk": "[jæk]",
    "pos": "n.",
    "zh": "犛牛"
  },
  {
    "word": "yell",
    "kk": "[jɛl]",
    "pos": "v.",
    "zh": "喊叫"
  },
  {
    "word": "at",
    "kk": "[æt]",
    "pos": "prep.",
    "zh": "在；對著"
  },
  {
    "word": "zip",
    "kk": "[zɪp]",
    "pos": "v.",
    "zh": "拉上"
  },
  {
    "word": "zipper",
    "kk": "[ˈzɪpɚ]",
    "pos": "n.",
    "zh": "拉鍊"
  }
];

export const phonics = {
  "letters": "Xx–Zz",
  "items": [
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
  "title": "能力：He can...",
  "rule": "說某人會做某事，可以用 He can 加動作。",
  "examples": [
    {
      "text": "He can help.",
      "zh": "他可以幫忙。"
    },
    {
      "text": "He can sing.",
      "zh": "他會唱歌。"
    },
    {
      "text": "He can dance.",
      "zh": "他會跳舞。"
    }
  ],
  "quiz": [
    {
      "subject": "He can",
      "answer": "help",
      "full": "He can help.",
      "prompt": "He can ___.",
      "zh": "他可以幫忙。"
    },
    {
      "subject": "He can",
      "answer": "sing",
      "full": "He can sing.",
      "prompt": "He can ___.",
      "zh": "他會唱歌。"
    },
    {
      "subject": "He can",
      "answer": "dance",
      "full": "He can dance.",
      "prompt": "He can ___.",
      "zh": "他會跳舞。"
    },
    {
      "subject": "Let's go",
      "answer": "to Oz",
      "full": "Let's go to Oz.",
      "prompt": "Let's go ___.",
      "zh": "我們一起去找歐茲王吧。"
    }
  ]
};

export const beOptions = [
  "help",
  "sing",
  "dance",
  "to Oz"
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
