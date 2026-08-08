import test from "node:test";
import assert from "node:assert/strict";
import {
  beOptions,
  checkBeAnswer,
  chooseRecorderMimeType,
  dialogueLines,
  getPracticeTurn,
  getSortedLineIndexes,
  grammar,
  isLineScored,
  loadFlags,
  loadScores,
  phonics,
  resolveVoiceProfile,
  saveFlags,
  saveScores,
  scoreSpeech,
  vocab,
  azureVoiceForRole,
} from "./unit1.mjs";

test("vocab covers the be-verb trio with KK", () => {
  const be = vocab.filter((v) => ["am", "is", "are"].includes(v.word));
  assert.equal(be.length, 3);
  assert.ok(be.every((v) => v.kk.startsWith("[")));
});

test("phonics for Unit 1 is Aa–Cc with example words", () => {
  assert.equal(phonics.letters, "Aa–Cc");
  assert.deepEqual(phonics.items.map((i) => i.letter), ["Aa", "Bb", "Cc"]);
  assert.ok(phonics.items.every((i) => i.examples.length >= 1));
});

test("checkBeAnswer accepts only the matching be verb", () => {
  const item = grammar.quiz[0];
  assert.equal(checkBeAnswer(item, "am"), true);
  assert.equal(checkBeAnswer(item, "is"), false);
  assert.ok(beOptions.includes(item.answer));
});

test("every grammar quiz answer is a valid be option", () => {
  assert.ok(grammar.quiz.every((q) => beOptions.includes(q.answer)));
});

test("loadFlags/saveFlags round-trip and tolerate failure", () => {
  const store = new Map();
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  saveFlags(storage, [true, false, true], "k");
  assert.deepEqual(loadFlags(storage, 3, "k"), [true, false, true]);
  assert.doesNotThrow(() => saveFlags({ setItem() { throw new Error("private"); } }, [true], "k"));
});

test("resolveVoiceProfile gives each character a distinct pitch", () => {
  const voices = [{ name: "Samantha", lang: "en-US" }];
  const nick = resolveVoiceProfile(voices, "nick");
  const abby = resolveVoiceProfile(voices, "abby");
  const fifi = resolveVoiceProfile(voices, "fifi");
  assert.ok(nick.pitch < abby.pitch && abby.pitch < fifi.pitch);
});

test("resolveVoiceProfile slows the rate for a first grader", () => {
  const profile = resolveVoiceProfile([{ name: "Samantha", lang: "en-US" }], "abby");
  assert.ok(profile.rate <= 0.72);
});

test("resolveVoiceProfile prefers a male voice for Nick when available", () => {
  const voices = [{ name: "Samantha", lang: "en-US" }, { name: "Aaron", lang: "en-US" }];
  assert.equal(resolveVoiceProfile(voices, "nick").voiceName, "Aaron");
});

test("resolveVoiceProfile falls back to any English voice", () => {
  assert.equal(resolveVoiceProfile([{ name: "Daniel", lang: "en-GB" }], "abby").voiceName, "Daniel");
});

test("azureVoiceForRole maps Joy roles to Azure neural voices", () => {
  assert.equal(azureVoiceForRole("nick"), "en-US-GuyNeural");
  assert.equal(azureVoiceForRole("abby"), "en-US-JennyNeural");
  assert.equal(azureVoiceForRole("fifi"), "en-US-AnaNeural");
  assert.equal(azureVoiceForRole("together"), "en-US-AriaNeural");
  assert.equal(azureVoiceForRole("unknown"), "en-US-AriaNeural");
});

test("Unit 1 keeps every classroom dialogue line in order", () => {
  assert.deepEqual(
    dialogueLines.map((line) => `${line.speaker}: ${line.text}`),
    [
      "Nick: Ahh...",
      "Abby: Ouch!",
      "Nick: Are you okay?",
      "Abby: Yes, I am. Thank you.",
      "Nick: Hi, I'm Nick. What's your name?",
      "Abby: Hello, Nick. I'm Abby.",
      "Fifi: Hello, Nick. Hello, Abby. I'm Fifi.",
      "Nick + Abby: Hi, Fifi!",
      "Nick: Where are we?",
      "Abby: I don't know.",
      "Nick: Look, a door.",
      "Abby: Let's go!",
    ],
  );
});

test("scoreSpeech gives five stars for an exact sentence", () => {
  assert.equal(scoreSpeech("Yes, I am. Thank you.", "yes i am thank you").stars, 5);
});

test("scoreSpeech is forgiving for punctuation and small contractions", () => {
  assert.equal(scoreSpeech("Hi, I'm Nick. What's your name?", "hi i am nick what is your name").stars, 5);
});

test("scoreSpeech lowers stars when important words are missing", () => {
  assert.equal(scoreSpeech("Hello, Nick. I'm Abby.", "hello abby").stars, 3);
});

test("scoreSpeech gives gentle low feedback for unrelated speech", () => {
  assert.equal(scoreSpeech("Look, a door.", "good morning teacher").stars, 1);
});

test("getPracticeTurn follows the selected child role", () => {
  assert.equal(getPracticeTurn({ role: "nick" }, "nick"), "你的回合");
  assert.equal(getPracticeTurn({ role: "abby" }, "nick"), "先聽網頁說");
});

test("Ahh and Ouch are listen-and-copy lines without star scoring", () => {
  assert.equal(isLineScored(dialogueLines[0]), false);
  assert.equal(isLineScored(dialogueLines[1]), false);
  assert.equal(isLineScored(dialogueLines[2]), true);
});

test("chooseRecorderMimeType prefers iPad-friendly audio/mp4", () => {
  const supported = new Set(["audio/webm", "audio/mp4"]);
  assert.equal(chooseRecorderMimeType((type) => supported.has(type)), "audio/mp4");
});

test("chooseRecorderMimeType returns an empty string when no candidate is supported", () => {
  assert.equal(chooseRecorderMimeType(() => false), "");
});

test("loadScores safely reads valid saved scores", () => {
  const store = new Map([["joy-unit1-scores", "[0,0,5,4]"]]);
  const storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
  };
  assert.deepEqual(loadScores(storage, 4), [0, 0, 5, 4]);
});

test("loadScores falls back when storage throws or has invalid data", () => {
  const storage = {
    getItem: () => {
      throw new Error("private mode");
    },
  };
  assert.deepEqual(loadScores(storage, 3), [0, 0, 0]);
  assert.deepEqual(loadScores({ getItem: () => "not json" }, 2), [0, 0]);
});

test("saveScores ignores storage write failures", () => {
  assert.doesNotThrow(() => {
    saveScores(
      {
        setItem: () => {
          throw new Error("quota");
        },
      },
      [0, 5, 4],
    );
  });
});

test("getSortedLineIndexes moves unfinished scored lines before finished lines", () => {
  assert.deepEqual(getSortedLineIndexes(dialogueLines, [0, 0, 5, 2, 5, 0, 5, 0, 5, 5, 0, 5]), [
    3,
    5,
    7,
    10,
    0,
    1,
    2,
    4,
    6,
    8,
    9,
    11,
  ]);
});
