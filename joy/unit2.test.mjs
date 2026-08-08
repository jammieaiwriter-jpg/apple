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
} from "./unit2.mjs";

test("vocab covers Unit 2 core words with KK", () => {
  const words = vocab.map((v) => v.word);
  assert.deepEqual(words, ["look", "he", "she", "Oz", "Fifi", "can", "help", "let's", "go"]);
  assert.ok(vocab.every((v) => v.kk.startsWith("[")));
});

test("phonics for Unit 2 is Dd–Ff with example words", () => {
  assert.equal(phonics.letters, "Dd–Ff");
  assert.deepEqual(phonics.items.map((i) => i.letter), ["Dd", "Ee", "Ff"]);
  assert.ok(phonics.items.every((i) => i.examples.length >= 1));
});

test("checkBeAnswer accepts only the matching Unit 2 sentence word", () => {
  const item = grammar.quiz[0];
  assert.equal(checkBeAnswer(item, "is"), true);
  assert.equal(checkBeAnswer(item, "can"), false);
  assert.ok(beOptions.includes(item.answer));
});

test("every grammar quiz answer is a valid Unit 2 option", () => {
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

test("Unit 2 keeps every classroom dialogue line in order", () => {
  assert.deepEqual(
    dialogueLines.map((line) => `${line.speaker}: ${line.text}`),
    [
      "Abby: Where are we?",
      "Nick: I don't know.",
      "Abby: Wow! It's pretty here.",
      "Abby: Look! Who's that?",
      "Fifi: I don't know.",
      "Nick: He's Oz. He can help.",
      "Abby: Yay! We can go home.",
      "Fifi: He's Oz. He can help.",
      "Nick + Abby: Let's go!",
    ],
  );
});

test("scoreSpeech gives five stars for an exact sentence", () => {
  assert.equal(scoreSpeech("He's Oz. He can help.", "he is oz he can help").stars, 5);
});

test("scoreSpeech is forgiving for punctuation and small contractions", () => {
  assert.equal(scoreSpeech("Who's that?", "who is that").stars, 5);
});

test("scoreSpeech lowers stars when important words are missing", () => {
  assert.equal(scoreSpeech("Yay! We can go home.", "home").stars, 2);
});

test("scoreSpeech gives gentle low feedback for unrelated speech", () => {
  assert.equal(scoreSpeech("Look, a door.", "good morning teacher").stars, 1);
});

test("getPracticeTurn follows the selected child role", () => {
  assert.equal(getPracticeTurn({ role: "nick" }, "nick"), "你的回合");
  assert.equal(getPracticeTurn({ role: "abby" }, "nick"), "先聽網頁說");
});

test("Unit 2 dialogue lines are all scored", () => {
  assert.ok(dialogueLines.every(isLineScored));
});

test("chooseRecorderMimeType prefers iPad-friendly audio/mp4", () => {
  const supported = new Set(["audio/webm", "audio/mp4"]);
  assert.equal(chooseRecorderMimeType((type) => supported.has(type)), "audio/mp4");
});

test("chooseRecorderMimeType returns an empty string when no candidate is supported", () => {
  assert.equal(chooseRecorderMimeType(() => false), "");
});

test("loadScores safely reads valid saved scores", () => {
  const store = new Map([["joy-unit2-scores", "[0,0,5,4]"]]);
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
  assert.deepEqual(getSortedLineIndexes(dialogueLines, [5, 0, 5, 2, 5, 0, 5, 5, 0]), [
    1,
    3,
    5,
    8,
    0,
    2,
    4,
    6,
    7,
  ]);
});
