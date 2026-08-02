#!/usr/bin/env node
/**
 * Build the standalone 小一學校線驗收頁。
 *
 * 這不是另一套題目系統：它把既有的課綱、progress、scheduler、figure
 * registry 與 matrix_gen 產出的 verified 題目嵌進一個可直接開啟的 HTML，
 * 讓媽媽先驗收「整條線接起來後」的實際樣子。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function inlineBrowserSource(relativePath, globalName, exports) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8")
    .replace(/^\s*export\s+/gm, "");
  return `${source}\nwindow.${globalName} = { ${exports.join(", ")} };`;
}

function safeJson(value) {
  return JSON.stringify(value, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function readAssetDataUrl(relativePath) {
  const file = path.join(root, relativePath);
  return `data:image/svg+xml;base64,${fs.readFileSync(file).toString("base64")}`;
}

const curriculumFile = readJson("curriculum/math-g1-school.json");
const progressFile = readJson("progress.json");
const templates = fs.readdirSync(path.join(root, "curriculum/templates"))
  .filter((name) => name.endsWith(".json"))
  .map((name) => readJson(`curriculum/templates/${name}`))
  .filter((template) => template.skillId.startsWith("G1-"));
const generatedItems = readJson("tools/matrix_gen/output/generated_items.json")
  .filter((item) => item.skillId.startsWith("G1-"));
const mistakeSources = ["game-mistakes.json", "game-mistakes-2.json"]
  .filter((file) => fs.existsSync(path.join(root, file)))
  .flatMap((file) => readJson(file));
const figureAssets = {
  "fluent-green-apple": readAssetDataUrl("assets/fluent-emoji/green-apple.svg"),
  "fluent-fish": readAssetDataUrl("assets/fluent-emoji/fish.svg"),
  "fluent-rabbit": readAssetDataUrl("assets/fluent-emoji/rabbit.svg"),
  "fluent-balloon": readAssetDataUrl("assets/fluent-emoji/balloon.svg"),
  "fluent-star": readAssetDataUrl("assets/fluent-emoji/star.svg"),
  "fluent-bird": readAssetDataUrl("assets/fluent-emoji/bird.svg"),
  "fluent-dog": readAssetDataUrl("assets/fluent-emoji/dog.svg"),
  "fluent-doughnut": readAssetDataUrl("assets/fluent-emoji/doughnut.svg"),
};

const skills = curriculumFile.chapters.flatMap((chapter) => chapter.skills.map((skill) => ({
  ...skill,
  grade: curriculumFile._meta.grade,
  chapterId: chapter.chapterId,
  chapterOrder: chapter.order,
  chapterName: chapter.name,
  semester: chapter.semester,
  hasTemplate: templates.some((template) => template.skillId === skill.skillId),
})));

const g1Progress = {
  ...progressFile,
  skills: progressFile.skills.filter((skill) => skill.grade === "G1"),
  mistakePool: (progressFile.mistakePool || []).filter((mistake) =>
    mistake.skillId.startsWith("G1-")
  ),
  _meta: {
    ...progressFile._meta,
    pointer: { ...(progressFile._meta?.pointer || {}), school: "G1-01-01" },
  },
};

const data = {
  curriculum: curriculumFile._meta,
  skills,
  progress: g1Progress,
  templates,
  generatedItems,
  mistakeSources,
  figureAssets,
  figureTypes: readJson("curriculum/figure-specs.json").specs,
  build: {
    builtAt: new Date().toISOString(),
    templateCount: templates.length,
    generatedItemCount: generatedItems.length,
  },
};

const schedulerSource = inlineBrowserSource(
  "tools/scheduler.js",
  "AppleScheduler",
  ["planDaily", "recordAnswer", "updateStreak", "importMistakes", "mapModeToSkillId"]
);
const figuresSource = inlineBrowserSource(
  "tools/figures/figures.js",
  "AppleFigures",
  ["renderFigure", "SUPPORTED"]
);

const html = `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>🍎 Apple 小一數學時間</title>
  <style>
    :root {
      --ink: #24323d;
      --muted: #71808b;
      --paper: #f5f7f8;
      --card: #ffffff;
      --line: #dfe7eb;
      --teal: #2ca6a4;
      --teal-dark: #167875;
      --yellow: #ffe58a;
      --orange: #f59e0b;
      --red: #e96b65;
      --green: #4caf6a;
      --purple: #8b72c9;
      font-family: "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;
    }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: radial-gradient(circle at 15% 0%, #fff9df 0 18%, transparent 42%), var(--paper); }
    button, input { font: inherit; }
    button { cursor: pointer; }
    .app { max-width: 860px; margin: 0 auto; padding: 24px 18px 60px; }
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 18px; margin-bottom: 14px; }
    .hero h1 { margin: 0 0 4px; font-size: clamp(25px, 4vw, 36px); letter-spacing: -.03em; }
    .hero p { margin: 0; color: var(--muted); line-height: 1.5; }
    .hero-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
    .study-scope { display: grid; gap: 10px; margin-bottom: 14px; padding: 15px 17px; border: 1px solid #d7e9e6; border-radius: 18px; background: linear-gradient(135deg, #f1fbf8, #fffdf2); box-shadow: 0 8px 22px rgba(38,55,65,.05); }
    .scope-top { display: flex; justify-content: space-between; gap: 14px; align-items: center; }
    .scope-kicker { color: var(--teal-dark); font-size: 12px; font-weight: 800; letter-spacing: .04em; }
    .scope-title { margin-top: 3px; font-size: 20px; font-weight: 850; }
    .scope-meta { color: var(--muted); font-size: 12px; margin-top: 4px; }
    .scope-progress { min-width: 116px; text-align: right; color: var(--teal-dark); font-size: 12px; font-weight: 800; }
    .scope-today { padding-top: 10px; border-top: 1px solid #d7e9e6; color: #49636a; font-size: 13px; line-height: 1.65; }
    .scope-today strong { color: var(--ink); }
    .scope-next { color: var(--muted); font-size: 12px; }
    .btn { border: 1px solid var(--line); border-radius: 12px; padding: 9px 13px; color: var(--ink); background: var(--card); }
    .btn.primary { color: #fff; background: var(--teal); border-color: var(--teal); }
    .btn.warn { color: #8a4e00; background: #fff6d5; border-color: #f4d372; }
    .notice { background: #fff9df; border: 1px solid #f1d681; border-radius: 14px; padding: 12px 14px; margin-bottom: 16px; line-height: 1.55; }
    .stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
    .stat { background: var(--card); border: 1px solid var(--line); border-radius: 15px; padding: 13px; }
    .stat .num { display: block; font-size: 25px; font-weight: 800; color: var(--teal-dark); }
    .stat .label { color: var(--muted); font-size: 12px; }
    .layout { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.45fr); gap: 16px; align-items: start; }
    .card { background: rgba(255,255,255,.94); border: 1px solid var(--line); border-radius: 22px; padding: 19px; box-shadow: 0 12px 30px rgba(38,55,65,.07); }
    .card + .card { margin-top: 16px; }
    .card h2 { margin: 0 0 12px; font-size: 19px; }
    .card h3 { margin: 16px 0 7px; font-size: 15px; }
    .subtle { color: var(--muted); font-size: 13px; line-height: 1.55; }
    .plan-list { display: grid; gap: 7px; }
    .plan-row { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; gap: 8px; align-items: center; border: 1px solid var(--line); border-radius: 12px; padding: 9px; background: #fbfcfc; }
    .plan-row.active { border-color: var(--teal); background: #effafa; }
    .plan-row.done { opacity: .62; }
    .plan-num { width: 25px; height: 25px; display: grid; place-items: center; border-radius: 50%; background: var(--yellow); font-size: 12px; font-weight: 800; }
    .plan-main { min-width: 0; }
    .plan-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; font-size: 14px; }
    .plan-meta { color: var(--muted); font-size: 11px; margin-top: 2px; }
    .pill { display: inline-block; padding: 3px 7px; border-radius: 999px; font-size: 11px; white-space: nowrap; }
    .pill.new { color: #176d68; background: #d9f5f1; }
    .pill.review { color: #765b19; background: #fff1b9; }
    .pill.mistake { color: #9a413d; background: #ffe0dc; }
    .pill.reinforcement { color: #7a4c11; background: #fff0be; }
    .pill.wait { color: #6c637e; background: #eeeaf7; }
    .progress-bar { height: 8px; border-radius: 99px; background: #e9eff1; overflow: hidden; }
    .progress-bar > span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--teal), #80d6c0); }
    .question-shell { min-height: 560px; border-top: 5px solid #f4b43c; }
    .child-progress { min-width: 150px; text-align: right; color: var(--muted); font-size: 13px; }
    .child-progress strong { display: block; color: var(--teal-dark); font-size: 17px; }
    .voice-btn { border-color: #b9dedd; color: var(--teal-dark); background: #effafa; }
    .zhuyin-line { display: inline; }
    .zhuyin-char { display: inline-flex; align-items: center; vertical-align: baseline; gap: 2px; margin-right: 2px; line-height: 1.1; }
    .zhuyin-right { color: #866bb1; font-size: .5em; font-weight: 700; white-space: nowrap; letter-spacing: -.03em; }
    .zhuyin-bottom { font-size: 1em; }
    .completion { text-align: center; padding: 38px 18px; }
    .completion .emoji { font-size: 58px; }
    .completion h2 { font-size: 28px; margin: 12px 0 8px; }
    .parent-panel { margin-top: 14px; }
    .parent-panel > summary { cursor: pointer; color: var(--muted); font-size: 13px; padding: 8px 2px; }
    .question-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
    .question-head h2 { margin-bottom: 4px; }
    .chapter-chip { display: inline-flex; align-items: center; margin-bottom: 5px; padding: 4px 8px; border-radius: 999px; color: #176d68; background: #d9f5f1; font-size: 12px; font-weight: 800; }
    .question-stem { font-size: 23px; line-height: 1.55; font-weight: 800; margin: 16px 0 10px; }
    .figure { min-height: 150px; display: grid; place-items: center; background: #fffdf6; border: 1px solid #f0e4bd; border-radius: 18px; padding: 14px 8px; margin: 12px 0 16px; }
    .figure svg { max-width: 100%; height: auto; }
    .options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .option { text-align: left; border: 2px solid #c9dfe0; color: var(--ink); background: #fff; border-radius: 16px; padding: 13px 14px; min-height: 60px; }
    .option:hover { border-color: var(--teal); background: #f2fbfa; }
    .option.correct { border-color: var(--green); background: #e7f7ea; }
    .option.wrong { border-color: var(--red); background: #fff0ee; }
    .feedback { border-radius: 13px; margin-top: 12px; padding: 11px 13px; line-height: 1.6; }
    .feedback.good { color: #216b37; background: #e7f7ea; }
    .feedback.bad { color: #8e3e39; background: #fff0ee; }
    .hint-row { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 12px; }
    .hint { border: 1px solid #e5c66e; border-radius: 10px; padding: 7px 10px; background: #fff8da; color: #765b19; font-size: 13px; }
    .hint-box { margin-top: 9px; padding: 10px 12px; border-left: 4px solid var(--orange); background: #fff9e5; line-height: 1.6; }
    .mission-badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 9px; border-radius: 999px; color: #8b5312; background: #fff0be; font-size: 12px; font-weight: 800; }
    .variant-link { border: 0; padding: 0; color: var(--teal-dark); background: transparent; text-decoration: underline; font-size: 13px; }
    .empty { padding: 22px 12px; text-align: center; border: 1px dashed #cbd9dd; border-radius: 12px; color: var(--muted); line-height: 1.65; }
    .chapter { border-top: 1px solid var(--line); padding: 10px 0 2px; }
    .chapter:first-child { border-top: 0; padding-top: 0; }
    .chapter-title { display: flex; justify-content: space-between; gap: 8px; font-weight: 750; font-size: 14px; }
    .skill-row { display: grid; grid-template-columns: 75px minmax(0, 1fr) auto; gap: 7px; align-items: center; padding: 5px 0; font-size: 12px; }
    .skill-id { color: var(--muted); font-variant-numeric: tabular-nums; }
    .skill-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .skill-name.waiting::after { content: "題型建置中"; margin-left: 6px; color: #8b72c9; font-size: 10px; }
    .mini-progress { height: 5px; background: #edf1f2; border-radius: 99px; overflow: hidden; }
    .mini-progress span { display: block; height: 100%; background: #80d6c0; }
    .diagnostics { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #52636b; background: #f2f5f6; border-radius: 11px; padding: 10px; font-size: 11px; line-height: 1.7; white-space: pre-wrap; }
    .footer { color: var(--muted); font-size: 12px; text-align: center; margin-top: 20px; line-height: 1.6; }
    @media (max-width: 800px) { .hero { align-items: flex-start; } .hero-actions { justify-content: flex-start; } .scope-top { align-items: flex-start; } .scope-progress { min-width: 90px; } .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .layout { grid-template-columns: 1fr; } .question-shell { min-height: 0; } .child-progress { text-align: left; } }
    @media (max-width: 460px) { .app { padding: 14px 10px 45px; } .card { padding: 13px; } .options { grid-template-columns: 1fr; } .question-stem { font-size: 20px; } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; } }
  </style>
</head>
<body>
  <main class="app">
    <section class="hero">
      <div>
        <h1>🍎 Apple 的數學探險</h1>
        <p>小一學校線｜看圖、聽題目、慢慢想</p>
      </div>
      <div class="hero-actions">
        <div class="child-progress" id="child-progress"></div>
        <button class="btn voice-btn" id="speak-btn">🔊 聽題目</button>
      </div>
    </section>

    <section class="study-scope" id="study-scope"></section>

    <section class="card question-shell" id="question-card">
      <div class="empty">正在準備今天的第一題……</div>
    </section>

    <details class="parent-panel">
      <summary>家長檢視：今日排課、課綱進度與架構資訊</summary>
      <div class="notice" id="notice"></div>
      <section class="stats" id="stats"></section>
      <div class="layout">
        <div>
          <section class="card">
            <h2>📅 今天的適性任務</h2>
            <div class="subtle" id="plan-summary"></div>
            <div class="plan-list" id="plan-list" style="margin-top:10px"></div>
          </section>
          <section class="card">
            <h2>🧭 小一課綱進度</h2>
            <div class="subtle" id="mastery-summary"></div>
            <div id="curriculum-list" style="margin-top:10px"></div>
          </section>
        </div>
      </div>
      <section class="card" style="margin-top:16px">
        <h2>🔧 架構驗收資訊</h2>
        <div class="diagnostics" id="diagnostics"></div>
        <div class="hero-actions" style="justify-content:flex-start;margin-top:10px">
          <button class="btn primary" id="today-btn">重新排今天 12 題</button>
          <button class="btn" id="report-btn">下載學習報表</button>
          <button class="btn warn" id="reset-btn">清除預覽紀錄</button>
        </div>
      </section>
    </details>
    <p class="footer">孩子只需要看題目、聽題目、按答案；課綱與工程資訊收在「家長檢視」裡。</p>
  </main>

  <script>
    window.APP_DATA = ${safeJson(data)};
  </script>
  <script>${schedulerSource}</script>
  <script>${figuresSource}</script>
  <script>
    (() => {
      const DATA = window.APP_DATA;
      const KEY = "apple_g1_school_preview_v4";
      const today = new Date().toISOString().slice(0, 10);
      const skillById = new Map(DATA.skills.map((skill) => [skill.skillId, skill]));
      const progressSeed = JSON.parse(JSON.stringify(DATA.progress));
      const itemsBySkill = new Map();
      for (const item of DATA.generatedItems) {
        if (!itemsBySkill.has(item.skillId)) itemsBySkill.set(item.skillId, []);
        itemsBySkill.get(item.skillId).push(item);
      }

      let progress = loadProgress();
      let plan = null;
      let planRows = [];
      let supplementRows = [];
      let supplementIndex = 0;
      let sessionPhase = "main";
      let activeIndex = 0;
      let activeQuestion = null;
      let answeredToday = 0;
      let answeredSupplement = 0;
      let streakMarked = false;
      let hintLevel = 0;
      let usedHint = false;
      let firstTry = true;
      let feedback = null;

      function esc(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
          "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
        }[char]));
      }

      // 小一題目先用常見詞組標注注音；沒有注音的字仍可按「聽題目」由瀏覽器朗讀。
      const BOPOMOFO_WORDS = {
        "數一數": "ㄕㄨˋ ㄧ ㄕㄨˋ", "下面": "ㄒㄧㄚˋ ㄇㄧㄢˋ", "一共有": "ㄧ ㄍㄨㄥˋ ㄧㄡˇ",
        "幾個": "ㄐㄧˇ ㄍㄜ˙", "蘋果": "ㄆㄧㄥˊ ㄍㄨㄛˇ", "甜甜圈": "ㄊㄧㄢˊ ㄊㄧㄢˊ ㄑㄩㄢ",
        "小魚": "ㄒㄧㄠˇ ㄩˊ", "小兔": "ㄒㄧㄠˇ ㄊㄨˋ", "小狗": "ㄒㄧㄠˇ ㄍㄡˇ", "圈圈": "ㄑㄩㄢ ㄑㄩㄢ", "氣球": "ㄑㄧˋ ㄑㄧㄡˊ", "下一個": "ㄒㄧㄚˋ ㄧ ㄍㄜ˙",
        "數字": "ㄕㄨˋ ㄗˋ", "下一個數字": "ㄒㄧㄚˋ ㄧ ㄍㄜ˙ ㄕㄨˋ ㄗˋ", "順數": "ㄕㄨㄣˋ ㄕㄨˇ", "比較": "ㄅㄧˇ ㄐㄧㄠˋ", "哪一條": "ㄋㄚˇ ㄧ ㄊㄧㄠˊ",
        "哪一個": "ㄋㄚˇ ㄧ ㄍㄜ˙", "線段": "ㄒㄧㄢˋ ㄉㄨㄢˋ", "曲線": "ㄑㄩ ㄒㄧㄢˋ",
        "最高": "ㄗㄨㄟˋ ㄍㄠ", "最矮": "ㄗㄨㄟˋ ㄞˇ", "最長": "ㄗㄨㄟˋ ㄔㄤˊ", "最短": "ㄗㄨㄟˋ ㄉㄨㄢˇ", "長針": "ㄔㄤˊ ㄓㄣ", "短針": "ㄉㄨㄢˇ ㄓㄣ", "幾點": "ㄐㄧˇ ㄉㄧㄢˇ", "現在": "ㄒㄧㄢˋ ㄗㄞˋ",
        "距離": "ㄐㄩˋ ㄌㄧˊ", "倒數": "ㄉㄠˋ ㄕㄨˇ", "一排": "ㄧ ㄆㄞˊ", "排隊": "ㄆㄞˊ ㄉㄨㄟˋ", "動物": "ㄉㄨㄥˋ ㄨˋ", "動物園": "ㄉㄨㄥˋ ㄨˋ ㄩㄢˊ",
        "小熊": "ㄒㄧㄠˇ ㄒㄩㄥˊ", "小明": "ㄒㄧㄠˇ ㄇㄧㄥˊ", "小華": "ㄒㄧㄠˇ ㄏㄨㄚˊ", "小動物": "ㄒㄧㄠˇ ㄉㄨㄥˋ ㄨˋ", "左邊": "ㄗㄨㄛˇ ㄅㄧㄢ", "右邊": "ㄧㄡˋ ㄅㄧㄢ",
        "前面": "ㄑㄧㄢˊ ㄇㄧㄢˋ", "後面": "ㄏㄡˋ ㄇㄧㄢˋ", "上面": "ㄕㄤˋ ㄇㄧㄢˋ",
        "小朋友": "ㄒㄧㄠˇ ㄆㄥˊ ㄧㄡˇ", "積木": "ㄐㄧ ㄇㄨˋ", "分成": "ㄈㄣ ㄔㄥˊ",
        "合起來": "ㄏㄜˊ ㄑㄧˇ ㄌㄞˊ", "糖果": "ㄊㄤˊ ㄍㄨㄛˇ", "剩下": "ㄕㄥˋ ㄒㄧㄚˋ",
        "彈珠": "ㄊㄢˊ ㄓㄨ", "貼紙": "ㄊㄧㄝ ㄓˇ", "餅乾": "ㄅㄧㄥˇ ㄍㄢ", "多少": "ㄉㄨㄛ ㄕㄠˇ", "兩本書": "ㄌㄧㄤˇ ㄅㄣˇ ㄕㄨ", "書頁": "ㄕㄨ ㄧㄝˋ", "層數": "ㄘㄥˊ ㄕㄨˋ",
      };
      const BOPOMOFO_CHAR = {
        "數": "ㄕㄨˋ", "看": "ㄎㄢˋ", "有": "ㄧㄡˇ", "幾": "ㄐㄧˇ", "個": "ㄍㄜ˙", "和": "ㄏㄜˊ", "哪": "ㄋㄚˇ", "本": "ㄅㄣˇ", "書": "ㄕㄨ", "頁": "ㄧㄝˋ", "層": "ㄘㄥˊ", "側": "ㄘㄜˋ", "面": "ㄇㄧㄢˋ", "站": "ㄓㄢˋ", "的": "ㄉㄜ˙", "是": "ㄕˋ", "兩": "ㄌㄧㄤˇ", "共": "ㄍㄨㄥˋ", "畫": "ㄏㄨㄚˋ", "了": "ㄌㄜ˙", "大": "ㄉㄚˋ", "堆": "ㄉㄨㄟ", "都": "ㄉㄡ", "沒": "ㄇㄟˊ",
        "甲": "ㄐㄧㄚˇ", "乙": "ㄧˇ", "丙": "ㄅㄧㄥˇ", "丁": "ㄉㄧㄥ", "條": "ㄊㄧㄠˊ", "長": "ㄔㄤˊ", "寬": "ㄎㄨㄢ",
        "高": "ㄍㄠ", "厚": "ㄏㄡˋ", "矮": "ㄞˇ", "短": "ㄉㄨㄢˇ", "遠": "ㄩㄢˇ", "近": "ㄐㄧㄣˋ", "一": "ㄧ",
        "二": "ㄦˋ", "三": "ㄙㄢ", "四": "ㄙˋ", "五": "ㄨˇ", "六": "ㄌㄧㄡˋ", "七": "ㄑㄧ", "八": "ㄅㄚ", "九": "ㄐㄧㄡˇ", "十": "ㄕˊ",
        "還": "ㄏㄞˊ", "幾": "ㄐㄧˇ", "隻": "ㄓ", "排": "ㄆㄞˊ", "隊": "ㄉㄨㄟˋ", "在": "ㄗㄞˋ", "第": "ㄉㄧˋ", "左": "ㄗㄨㄛˇ", "右": "ㄧㄡˋ", "之": "ㄓ", "小": "ㄒㄧㄠˇ", "特": "ㄊㄜˋ", "別": "ㄅㄧㄝˊ", "那": "ㄋㄚˋ", "妳": "ㄋㄧˇ", "伸": "ㄕㄣ", "出": "ㄔㄨ", "根": "ㄍㄣ", "頭": "ㄊㄡˊ",
        "上": "ㄕㄤˋ", "下": "ㄒㄧㄚˋ", "前": "ㄑㄧㄢˊ", "後": "ㄏㄡˋ", "邊": "ㄅㄧㄢ", "中": "ㄓㄨㄥ", "段": "ㄉㄨㄢˋ", "曲": "ㄑㄩ",
        "線": "ㄒㄧㄢˋ", "圖": "ㄊㄨˊ", "形": "ㄒㄧㄥˊ", "個": "ㄍㄜ˙", "東": "ㄉㄨㄥ", "西": "ㄒㄧ", "比": "ㄅㄧˇ", "較": "ㄐㄧㄠˋ", "物": "ㄨˋ", "中": "ㄓㄨㄥ", "目": "ㄇㄨˋ", "標": "ㄅㄧㄠ",
        "最": "ㄗㄨㄟˋ", "多": "ㄉㄨㄛ", "少": "ㄕㄠˇ", "遠": "ㄩㄢˇ", "從": "ㄘㄨㄥˊ", "開": "ㄎㄞ", "始": "ㄕˇ", "倒": "ㄉㄠˋ", "後": "ㄏㄡˋ",
        "數": "ㄕㄨˋ", "字": "ㄗˋ", "動": "ㄉㄨㄥˋ", "物": "ㄨˋ", "熊": "ㄒㄩㄥˊ", "朋": "ㄆㄥˊ", "友": "ㄧㄡˇ", "積": "ㄐㄧ", "木": "ㄇㄨˋ", "明": "ㄇㄧㄥˊ", "華": "ㄏㄨㄚˊ", "疊": "ㄉㄧㄝˊ", "園": "ㄩㄢˊ", "火": "ㄏㄨㄛˇ", "車": "ㄔㄜ", "玩": "ㄨㄢˊ", "具": "ㄐㄩˋ",
        "原": "ㄩㄢˊ", "本": "ㄅㄣˇ", "糖": "ㄊㄤˊ", "果": "ㄍㄨㄛˇ", "顆": "ㄎㄜ", "吃": "ㄔ", "剩": "ㄕㄥˋ", "分": "ㄈㄣ", "成": "ㄔㄥˊ", "紅": "ㄏㄨㄥˊ", "紫": "ㄗˇ", "綠": "ㄌㄩˋ", "藍": "ㄌㄢˊ", "黃": "ㄏㄨㄤˊ", "白": "ㄅㄞˊ", "樣": "ㄧㄤˋ", "畫": "ㄏㄨㄚˋ", "指": "ㄓˇ", "著": "ㄓㄜ˙", "點": "ㄉㄧㄢˇ",
        "和": "ㄏㄜˊ", "合": "ㄏㄜˊ", "起": "ㄑㄧˇ", "來": "ㄌㄞˊ", "多": "ㄉㄨㄛ", "少": "ㄕㄠˇ", "嗎": "ㄇㄚ˙", "什": "ㄕㄜˊ", "麼": "ㄇㄜ˙",
      };
      const ZHUYIN_TOKENS = Object.keys(BOPOMOFO_WORDS).concat(Object.keys(BOPOMOFO_CHAR)).sort((a, b) => b.length - a.length);

      function annotate(value) {
        const text = String(value ?? "");
        let html = "";
        for (let i = 0; i < text.length;) {
          const token = ZHUYIN_TOKENS.find((candidate) => text.startsWith(candidate, i));
          if (token) {
            const sound = BOPOMOFO_WORDS[token] || BOPOMOFO_CHAR[token];
            const characters = Array.from(token);
            const syllables = String(sound || "").trim().split(/\\s+/).filter(Boolean);
            html += characters.map((character, index) => {
              const reading = syllables[index] || BOPOMOFO_CHAR[character] || "";
              const soundHtml = reading ? \`<span class="zhuyin-right">\${esc(reading)}</span>\` : "";
              return \`<span class="zhuyin-char"><span class="zhuyin-bottom">\${esc(character)}</span>\${soundHtml}</span>\`;
            }).join("");
            i += token.length;
          } else {
            html += esc(text[i]);
            i += 1;
          }
        }
        return \`<span class="zhuyin-line">\${html}</span>\`;
      }

      function loadProgress() {
        try {
          const saved = JSON.parse(localStorage.getItem(KEY) || "null");
          if (saved?.skills?.length === DATA.skills.length) return saved;
        } catch (error) {
          console.warn("預覽紀錄讀取失敗，改用初始進度", error);
        }
        const seeded = JSON.parse(JSON.stringify(progressSeed));
        return AppleScheduler.importMistakes(seeded, DATA.mistakeSources || []);
      }

      function saveProgress() {
        try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch (error) { console.warn(error); }
      }

      function skillProgress(skillId) {
        return progress.skills.find((skill) => skill.skillId === skillId) || {};
      }

      function curriculumChapters() {
        const chapters = new Map();
        for (const skill of DATA.skills) {
          if (!chapters.has(skill.chapterId)) chapters.set(skill.chapterId, { order: skill.chapterOrder, chapterId: skill.chapterId, name: skill.chapterName, skills: [] });
          chapters.get(skill.chapterId).skills.push(skill);
        }
        return [...chapters.values()].sort((a, b) => a.order - b.order);
      }

      function chapterProgress(chapter) {
        const touched = chapter.skills.filter((skill) => skillProgress(skill.skillId).unlocked).length;
        const mastered = chapter.skills.filter((skill) => skillProgress(skill.skillId).mastered).length;
        const done = touched === chapter.skills.length;
        return { touched, mastered, done, status: done ? "已走過" : touched ? "進行中" : "未開始" };
      }

      function renderStudyScope() {
        const chapters = curriculumChapters();
        const current = chapters.find((chapter) => !chapterProgress(chapter).done) || chapters[chapters.length - 1];
        const completedChapters = chapters.filter((chapter) => chapterProgress(chapter).done).length;
        const todayGroups = new Map();
        for (const row of planRows) {
          if (!row.item || !row.skill?.chapterId) continue;
          const bucket = row.reason === "new" ? "主進度" : row.reason === "mistake" ? "錯題複習" : "到期複習";
          if (!todayGroups.has(bucket)) todayGroups.set(bucket, new Map());
          todayGroups.get(bucket).set(row.skill.chapterId, row.skill);
        }
        const formatGroups = (bucket) => {
          const entries = [...(todayGroups.get(bucket) || new Map()).values()].sort((a, b) => a.chapterOrder - b.chapterOrder);
          return entries.length ? entries.map((skill) => \`第\${skill.chapterOrder}章｜\${esc(skill.chapterName)}\`).join("、") : "無";
        };
        const next = chapters.find((chapter) => chapter.order > current.order && !chapterProgress(chapter).done);
        document.getElementById("study-scope").innerHTML = \`
          <div class="scope-top">
            <div><div class="scope-kicker">📚 小一學校線課程進度</div><div class="scope-title">目前第\${current.order}章｜\${esc(current.name)}</div><div class="scope-meta">按學校章節順序往前走；「已走過」代表該章每個技能至少做過一次。</div></div>
            <div class="scope-progress">已走過<br><strong>\${completedChapters} / \${chapters.length} 章</strong><br><span>還有 \${chapters.length - completedChapters} 章</span></div>
          </div>
          <div class="scope-today"><strong>今天對齊：</strong>主進度：\${formatGroups("主進度")}<br><strong>額外複習：</strong>錯題：\${formatGroups("錯題複習")}｜到期：\${formatGroups("到期複習")}</div>
          <div class="scope-next">下一章：\${next ? \`第\${next.order}章｜\${esc(next.name)}\` : "小一 17 章都已走過"}</div>\`;
      }

      function labelForReason(reason) {
        return reason === "new" ? "新技能" : reason === "review" ? "到期複習" : reason === "reinforcement" ? "錯題補強" : "錯題變式";
      }

      function buildPlan() {
        plan = AppleScheduler.planDaily(progress, today);
        planRows = plan.items.map((entry, index) => {
          const skill = skillById.get(entry.skillId);
          const candidates = itemsBySkill.get(entry.skillId) || [];
          const candidateIndex = entry.reason === "mistake" ? Math.max(0, (entry.variantIndex || 1) - 1) : index;
          const item = candidates.length ? candidates[candidateIndex % candidates.length] : null;
          return { ...entry, index, skill, item, candidateIndex, done: false, unavailable: !item };
        });
        supplementRows = [];
        supplementIndex = 0;
        sessionPhase = "main";
        activeIndex = 0;
        activeQuestion = null;
        answeredToday = 0;
        answeredSupplement = 0;
        streakMarked = false;
        hintLevel = 0;
        usedHint = false;
        firstTry = true;
        feedback = null;
        renderAll();
      }

      function mainPlayableRows() { return planRows.filter((row) => row.item); }

      function queueReinforcement(row) {
        if (!row || row.reinforcementQueued) return;
        const candidates = itemsBySkill.get(row.skillId) || [];
        if (!candidates.length) return;
        const baseIndex = Number.isFinite(row.candidateIndex) ? row.candidateIndex : 0;
        for (let offset = 1; offset <= 2; offset++) {
          const candidateIndex = (baseIndex + offset) % candidates.length;
          supplementRows.push({
            ...row,
            reason: "reinforcement",
            item: candidates[candidateIndex],
            candidateIndex,
            done: false,
            reinforcementSource: row.item.templateId,
          });
        }
        row.reinforcementQueued = true;
      }

      function startReinforcement() {
        if (sessionPhase === "supplement" || sessionPhase === "reinforcement-intro") return;
        if (!streakMarked) {
          progress = AppleScheduler.updateStreak(progress, today);
          streakMarked = true;
          saveProgress();
        }
        if (!supplementRows.length) {
          renderCompletion();
          return;
        }
        sessionPhase = "reinforcement-intro";
        resetQuestion();
        renderAll();
      }

      function beginReinforcement() {
        if (!supplementRows.length) { renderCompletion(); return; }
        sessionPhase = "supplement";
        supplementIndex = 0;
        resetQuestion();
        renderAll();
      }

      function renderAll() {
        renderStudyScope();
        renderChildProgress();
        renderNotice();
        renderStats();
        renderPlan();
        renderMastery();
        renderCurriculum();
        renderQuestion();
        renderDiagnostics();
      }

      function renderChildProgress() {
        const playableRows = mainPlayableRows();
        const el = document.getElementById("child-progress");
        if (sessionPhase === "reinforcement-intro") {
          el.innerHTML = \`<strong>12 題完成！</strong><span>準備開始錯題練習</span>\`;
          return;
        }
        if (sessionPhase === "supplement") {
          const total = supplementRows.length;
          const currentNumber = Math.min(supplementIndex + 1, total);
          el.innerHTML = \`<strong>錯題補強 \${currentNumber} / \${total}</strong><span>每一道錯題再練兩題</span>\`;
          return;
        }
        const total = playableRows.length || 12;
        const done = playableRows.filter((row) => row.done).length;
        const mistakeCount = supplementRows.length;
        const currentNumber = Math.max(1, playableRows.findIndex((row) => row.index === activeIndex) + 1);
        if (done >= total && total > 0) el.innerHTML = \`<strong>12 題完成！</strong><span>準備進入錯題補強</span>\`;
        else el.innerHTML = \`<strong>第 \${Math.min(currentNumber, total)} / \${total} 題</strong><span>慢慢來，不用急\${mistakeCount ? "｜待補強 " + mistakeCount + " 題" : ""}</span>\`;
      }

      function renderNotice() {
        const complete = new Set(DATA.templates.map((template) => template.skillId)).size;
        document.getElementById("notice").innerHTML =
          \`目前是<strong>小一完整課綱骨架驗收版</strong>：\${DATA.curriculum.totalChapters} 章 \${DATA.skills.length} 技能已接入；今天排課會依 \${today} 的 progress 決定順序。\` +
          \`題目模板已完成 <strong>\${complete}/\${DATA.skills.length}</strong> 個技能，未完成技能會顯示建置狀態，不會被當成已完成。\`;
      }

      function renderStats() {
        const mastered = progress.skills.filter((skill) => skill.mastered).length;
        const unlocked = progress.skills.filter((skill) => skill.unlocked).length;
        const mistakes = (progress.mistakePool || []).filter((mistake) => !mistake.resolved).length;
        const figures = Object.keys(DATA.figureTypes).length;
        document.getElementById("stats").innerHTML = [
          [String(DATA.curriculum.totalChapters), "課綱章節"], [String(DATA.skills.length), "小一技能"], [String(new Set(DATA.templates.map((template) => template.skillId)).size), "已接技能"],
          [String(unlocked), "已解鎖技能"], [String(mistakes), "待補錯題"],
        ].map(([num, label]) => \`<div class="stat"><span class="num">\${esc(num)}</span><span class="label">\${esc(label)}</span></div>\`).join("");
        document.getElementById("mastery-summary").innerHTML =
          \`已精熟 <strong>\${mastered}/\${DATA.skills.length}</strong>｜已解鎖 <strong>\${unlocked}/\${DATA.skills.length}</strong>｜今日完成 <strong>\${answeredToday}/\${planRows.length || 12}</strong>｜圖形元件 registry <strong>\${figures}</strong>\`;
      }

      function renderPlan() {
        const filled = plan?.meta?.planned || 0;
        document.getElementById("plan-summary").innerHTML =
          \`\${today}｜預計 \${filled} 題｜錯題 \${plan?.meta?.quotas?.mistake?.filled || 0}、複習 \${plan?.meta?.quotas?.review?.filled || 0}、新技能 \${plan?.meta?.quotas?.new?.filled || 0}\` +
          (plan?.meta?.shortfall ? \`｜尚缺 \${plan.meta.shortfall} 題\` : "");
        document.getElementById("plan-list").innerHTML = planRows.length ? planRows.map((row) => {
          const skill = row.skill || {};
          const status = row.unavailable ? "wait" : row.reason;
          return \`<button class="plan-row \${row.index === activeIndex ? "active" : ""} \${row.done ? "done" : ""}" data-plan-index="\${row.index}">
            <span class="plan-num">\${row.index + 1}</span>
            <span class="plan-main"><span class="plan-title">\${skill.chapterOrder ? "第" + skill.chapterOrder + "章｜" : ""}\${esc(skill.skillId || row.skillId)}｜\${esc(skill.name || "未知技能")}</span><span class="plan-meta">\${esc(skill.chapterName || "")} · 難度 \${esc(skill.difficulty ?? "-")}</span></span>
            <span class="pill \${status}">\${row.unavailable ? "題型建置中" : labelForReason(row.reason)}</span>
          </button>\`;
        }).join("") : \`<div class="empty">今天沒有排出題目，請檢查 progress 與排課設定。</div>\`;
        document.querySelectorAll("[data-plan-index]").forEach((button) => {
          button.addEventListener("click", () => { activeIndex = Number(button.dataset.planIndex); resetQuestion(); renderQuestion(); renderPlan(); });
        });
      }

      function renderMastery() {
        const mastered = progress.skills.filter((skill) => skill.mastered).length;
        const pct = Math.round((mastered / 79) * 100);
        const walkedChapters = curriculumChapters().filter((chapter) => chapterProgress(chapter).done).length;
        document.getElementById("mastery-summary").querySelector(".progress-bar")?.remove();
        document.getElementById("mastery-summary").insertAdjacentHTML("afterbegin", \`<div class="progress-bar" style="margin:9px 0 12px"><span style="width:\${pct}%"></span></div>\`);
        document.getElementById("mastery-summary").insertAdjacentHTML("beforeend", \`<div class="subtle" style="margin-top:6px">章節進度：已走過 \${walkedChapters}/\${DATA.curriculum.totalChapters} 章（每章技能至少做過一次）</div>\`);
      }

      function renderCurriculum() {
        const chapters = new Map();
        for (const skill of DATA.skills) {
          if (!chapters.has(skill.chapterId)) chapters.set(skill.chapterId, { ...skill, skills: [] });
          chapters.get(skill.chapterId).skills.push(skill);
        }
        document.getElementById("curriculum-list").innerHTML = [...chapters.values()].map((chapter) => {
          const chapterSkills = chapter.skills;
          const progressInfo = chapterProgress(chapter);
          return \`<div class="chapter"><div class="chapter-title"><span>第\${chapter.chapterOrder}章｜\${esc(chapter.chapterName)}</span><span class="subtle">\${progressInfo.status} · \${progressInfo.touched}/\${chapterSkills.length} 已走過</span></div>\${chapterSkills.map((skill) => {
            const current = skillProgress(skill.skillId);
            const streak = Math.min(10, current.currentStreak || 0);
            return \`<div class="skill-row"><span class="skill-id">\${esc(skill.skillId)}</span><span class="skill-name \${skill.hasTemplate ? "" : "waiting"}" title="\${esc(skill.name)}">\${esc(skill.name)}</span><span style="width:45px"><div class="mini-progress"><span style="width:\${streak * 10}%"></span></div></span></div>\`;
          }).join("")}</div>\`;
        }).join("");
      }

      function resetQuestion() {
        activeQuestion = null;
        hintLevel = 0;
        usedHint = false;
        firstTry = true;
        feedback = null;
      }

      function currentRow() { return sessionPhase === "supplement" ? supplementRows[supplementIndex] : planRows[activeIndex]; }

      function renderReinforcementIntro() {
        const card = document.getElementById("question-card");
        const wrongCount = Math.round(supplementRows.length / 2);
        card.innerHTML = \`<div class="completion">
          <div class="emoji">🧩</div>
          <h2>\${annotate("12 題完成！")}</h2>
          <p class="subtle">剛才有 \${wrongCount} 題需要再練，接下來開始錯題練習。</p>
          <p class="subtle">每一道錯題會補 2 題同類型變化題，一共 \${supplementRows.length} 題。</p>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:18px">
            <button class="btn primary" id="begin-reinforcement-btn">開始錯題練習</button>
            <button class="btn" id="parent-open-btn">先看家長檢視</button>
          </div>
        </div>\`;
        document.getElementById("begin-reinforcement-btn").addEventListener("click", beginReinforcement);
        document.getElementById("parent-open-btn").addEventListener("click", () => {
          document.querySelector(".parent-panel").open = true;
          document.querySelector(".parent-panel").scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }

      function resolveFigureSpec(value) {
        if (Array.isArray(value)) return value.map(resolveFigureSpec);
        if (!value || typeof value !== "object") return value;
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
          key,
          key === "asset" && DATA.figureAssets?.[entry] ? DATA.figureAssets[entry] : resolveFigureSpec(entry),
        ]));
      }

      function renderQuestion() {
        const card = document.getElementById("question-card");
        if (sessionPhase === "reinforcement-intro") {
          renderReinforcementIntro();
          return;
        }
        const row = currentRow();
        const mainComplete = mainPlayableRows().every((candidate) => candidate.done);
        if (sessionPhase === "main" && mainComplete && !row?.done) {
          startReinforcement();
          return;
        }
        if (sessionPhase === "supplement" && (!row || supplementIndex >= supplementRows.length)) {
          renderCompletion();
          return;
        }
        if (!row) { renderCompletion(); return; }
        const skill = row.skill || {};
        if (!row.item) {
          const next = sessionPhase === "main"
            ? planRows.findIndex((candidate, index) => index > activeIndex && candidate.item)
            : -1;
          if (next >= 0) { activeIndex = next; resetQuestion(); renderQuestion(); renderChildProgress(); return; }
          if (sessionPhase === "main" && supplementRows.length) { startReinforcement(); return; }
          card.innerHTML = \`<div class="completion"><div class="emoji">🧱</div><h2>這組題目準備中</h2><p class="subtle">這個技能已經排進課綱，但題目還在施工。先做下一組已完成的題目吧！</p><button class="btn primary" id="new-set-btn">開始下一組</button></div>\`;
          document.getElementById("new-set-btn").addEventListener("click", buildPlan);
          return;
        }
        const item = row.item;
        const playableRows = mainPlayableRows();
        const isSupplement = sessionPhase === "supplement";
        const questionNumber = isSupplement
          ? supplementIndex + 1
          : Math.max(1, playableRows.findIndex((candidate) => candidate.index === activeIndex) + 1);
        const questionTotal = isSupplement ? supplementRows.length : playableRows.length || 12;
        const figure = item.figureSpec ? AppleFigures.renderFigure(resolveFigureSpec(item.figureSpec)) : '<div class="subtle">這題沒有圖形元件</div>';
        const chapterHtml = skill.chapterOrder ? \`<span class="chapter-chip">第\${skill.chapterOrder}章｜\${esc(skill.chapterName || "小一數學")}</span>\` : "";
        const missionHtml = isSupplement
          ? \`<div class="mission-badge">🧩 \${annotate("錯題補強：同一個觀念再練兩題")}</div>\`
          : row.reason === "mistake" ? \`<div class="mission-badge">🔁 \${annotate("錯題再練：換一種方式試試看")}</div>\` : "";
        const optionHtml = item.options.map((option, index) => {
          const state = feedback && option.correct ? "correct" : feedback?.selected === index ? "wrong" : "";
          return \`<button class="option \${state}" data-option-index="\${index}" \${feedback?.done ? "disabled" : ""}><strong>(\${esc(option.letter)})</strong> \${annotate(option.text)}</button>\`;
        }).join("");
        const hintHtml = item.hints.map((hint, index) => \`<button class="hint" data-hint-level="\${index + 1}" \${index + 1 > hintLevel ? "" : "disabled"}>提示 \${index + 1}</button>\`).join("");
        const shownHint = hintLevel ? \`<div class="hint-box">💡 \${annotate(item.hints[hintLevel - 1])}</div>\` : "";
        let feedbackHtml = "";
        if (feedback?.kind === "bad") feedbackHtml = \`<div class="feedback bad">先別急，\${annotate(feedback.why || "再把題目慢慢看一次")}<br>這題會在12題後補兩題同類型練習。<br><button class="variant-link" id="variant-btn">現在先換一題同類型再練</button>，或按「看答案並繼續」。</div>\`;
        if (feedback?.kind === "good") feedbackHtml = \`<div class="feedback good">🎉 答對囉！\${feedback.usedHint ? "這次有用提示，沒關係，我們把觀念練穩。" : "這次是自己想出來的，很棒！"}</div>\`;
        if (feedback?.kind === "reveal") feedbackHtml = \`<div class="feedback bad">答案是 <strong>(\${esc(item.answerLetter)}) \${esc(item.answerValue)}</strong>。這題先記進錯題池，下一題會再繼續。</div>\`;
        const actionHtml = feedback?.done
          ? '<button class="btn primary" id="next-btn">下一題</button>'
          : '<button class="btn" id="reveal-btn">看答案並繼續</button><span class="subtle" style="align-self:center">先自己想，再按提示喔</span>';
        card.innerHTML = \`<div class="question-head"><div>\${chapterHtml}<h2>第 \${questionNumber} / \${questionTotal} 題</h2><div class="subtle">\${annotate(skill.name || skill.chapterName || "小一數學")}</div></div><span class="pill \${row.reason}">難度 \${esc(item.difficulty)}</span></div>\${missionHtml}<div class="question-stem">\${annotate(item.stem)}</div><div class="figure">\${figure}</div><div class="options">\${optionHtml}</div>\${feedbackHtml}<div class="hint-row">\${hintHtml}</div>\${shownHint}<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">\${actionHtml}</div>\`;
        document.querySelectorAll("[data-option-index]").forEach((button) => button.addEventListener("click", () => answer(Number(button.dataset.optionIndex))));
        document.querySelectorAll("[data-hint-level]").forEach((button) => button.addEventListener("click", () => showHint(Number(button.dataset.hintLevel))));
        document.getElementById("reveal-btn")?.addEventListener("click", revealAnswer);
        document.getElementById("next-btn")?.addEventListener("click", () => { advanceAfterDone(); renderAll(); });
        document.getElementById("variant-btn")?.addEventListener("click", showVariant);
      }

      function renderCompletion() {
        const card = document.getElementById("question-card");
        const total = mainPlayableRows().length || 12;
        const supplementTotal = supplementRows.length;
        card.innerHTML = \`<div class="completion">
          <div class="emoji">🎉</div>
          <h2>\${annotate("今天完成了！")}</h2>
          <p class="subtle">\${annotate(String(total) + " 題主課都做完了，Apple 今天很認真！")}</p>
          \${supplementTotal ? \`<p class="subtle">另外完成 \${supplementTotal} 題錯題補強（每一道錯題補兩題）。</p>\` : ""}
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:18px">
            <button class="btn primary" id="again-btn">再做一組 \${total} 題</button>
            <button class="btn" id="parent-open-btn">家長檢視</button>
          </div>
        </div>\`;
        document.getElementById("again-btn").addEventListener("click", buildPlan);
        document.getElementById("parent-open-btn").addEventListener("click", () => {
          document.querySelector(".parent-panel").open = true;
          document.querySelector(".parent-panel").scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }

      function showHint(level) {
        hintLevel = Math.max(hintLevel, level);
        usedHint = true;
        renderQuestion();
      }

      function showVariant() {
        const row = currentRow();
        const candidates = itemsBySkill.get(row?.skillId) || [];
        if (!row || !candidates.length) return;
        row.candidateIndex = ((row.candidateIndex || 0) + 1) % candidates.length;
        row.item = candidates[row.candidateIndex];
        row.reinforcementQueued = true;
        resetQuestion();
        renderAll();
      }

      function advanceAfterDone() {
        if (sessionPhase === "supplement") {
          const next = supplementRows.findIndex((candidate, index) => index > supplementIndex && !candidate.done && candidate.item);
          if (next >= 0) { supplementIndex = next; resetQuestion(); return; }
          supplementIndex = supplementRows.length;
          resetQuestion();
          return;
        }
        const next = planRows.findIndex((candidate, index) => index > activeIndex && !candidate.done && candidate.item);
        if (next >= 0) { activeIndex = next; resetQuestion(); return; }
        startReinforcement();
      }

      function answer(optionIndex) {
        if (feedback?.done) return;
        const row = currentRow();
        const option = row.item.options[optionIndex];
        if (option.correct) {
          progress = AppleScheduler.recordAnswer(progress, { skillId: row.skillId, correct: true, usedHint, firstTry }, today);
          feedback = { kind: "good", done: true, usedHint };
          row.done = true;
          if (sessionPhase === "supplement") answeredSupplement += 1;
          else answeredToday += 1;
          saveProgress();
        } else {
          progress = AppleScheduler.recordAnswer(progress, { skillId: row.skillId, correct: false, usedHint, firstTry }, today);
          if (sessionPhase === "main") queueReinforcement(row);
          feedback = { kind: "bad", selected: optionIndex, why: option.why, done: false };
          firstTry = false;
          saveProgress();
        }
        renderAll();
      }

      function revealAnswer() {
        if (feedback?.done) return;
        const row = currentRow();
        if (firstTry) {
          progress = AppleScheduler.recordAnswer(progress, { skillId: row.skillId, correct: false, usedHint: true, firstTry: false }, today);
          if (sessionPhase === "main") queueReinforcement(row);
        }
        feedback = { kind: "reveal", done: true };
        row.done = true;
        if (sessionPhase === "supplement") answeredSupplement += 1;
        else answeredToday += 1;
        saveProgress();
        renderAll();
      }

      function speakCurrentQuestion() {
        if (sessionPhase === "reinforcement-intro") return;
        const row = currentRow();
        if (!row?.item) return;
        if (!("speechSynthesis" in window)) {
          window.alert("這個瀏覽器目前不能朗讀，請請大人換 Safari 或 Chrome。 ");
          return;
        }
        const text = [row.item.stem, ...row.item.options.map((option, index) => String(index + 1) + ". " + option.text)].join("。 ");
        const button = document.getElementById("speak-btn");
        const speak = () => {
          const voices = window.speechSynthesis.getVoices();
          const preferred = voices.find((voice) => /^(zh-TW|zh-Hant-TW)$/i.test(voice.lang)) || voices.find((voice) => /^zh/i.test(voice.lang));
          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();
          const utterance = new window.SpeechSynthesisUtterance(text);
          utterance.lang = preferred?.lang || "zh-TW";
          if (preferred) utterance.voice = preferred;
          utterance.rate = 0.78;
          utterance.pitch = 1;
          utterance.volume = 1;
          utterance.onstart = () => { if (button) button.textContent = "🔊 播放中…"; };
          utterance.onend = () => { if (button) button.textContent = "🔊 聽題目"; };
          utterance.onerror = () => { if (button) button.textContent = "🔊 再聽一次"; };
          window.speechSynthesis.speak(utterance);
        };
        if (window.speechSynthesis.getVoices().length) {
          speak();
        } else {
          let tries = 0;
          const retry = window.setInterval(() => {
            tries += 1;
            if (window.speechSynthesis.getVoices().length || tries >= 10) {
              window.clearInterval(retry);
              if (window.speechSynthesis.getVoices().length) speak();
              else window.alert("找不到中文朗讀聲音，請到瀏覽器的語音設定安裝中文語音。 ");
            }
          }, 100);
        }
      }

      function goNextAvailable() {
        const next = planRows.findIndex((row, index) => index > activeIndex && row.item);
        if (next >= 0) { activeIndex = next; resetQuestion(); renderAll(); }
        else document.getElementById("question-card").innerHTML = \`<div class="empty">今天後面的排課技能也都在題型建置中。先驗收左側課綱與架構資訊即可。</div>\`;
      }

      function renderDiagnostics() {
        const templatesWithItems = new Set(DATA.generatedItems.map((item) => item.skillId));
        const unresolved = DATA.skills.filter((skill) => !templatesWithItems.has(skill.skillId)).length;
        document.getElementById("diagnostics").textContent = [
          \`curriculum: \${DATA.curriculum.grade}｜\${DATA.curriculum.totalChapters} chapters｜\${DATA.skills.length} skills\`,
          \`progress: \${progress.skills.length} skills｜mistakePool: \${(progress.mistakePool || []).length} entries\`,
          \`scheduler: planDaily → requested \${plan?.meta?.requested || 12}｜planned \${plan?.meta?.planned || 0}｜shortfall \${plan?.meta?.shortfall || 0}\`,
          \`matrix_gen: \${DATA.templates.length} templates｜\${DATA.generatedItems.length} verified items｜\${templatesWithItems.size} skills covered｜\${unresolved} skills waiting\`,
          \`figures: \${Object.keys(DATA.figureTypes).length} registry specs｜browser renderer: \${AppleFigures.SUPPORTED.length} supported\`,
          \`storage: \${KEY}｜date: \${today}｜build: \${DATA.build.builtAt}\`,
        ].join("\\n");
      }

      function downloadReport() {
        const mastered = progress.skills.filter((skill) => skill.mastered).length;
        const lines = [
          \`# Apple 小一數學學校線預覽報表\`, \`\`, \`日期：\${today}\`, \`今日完成：\${answeredToday}/\${planRows.length}\`,
          \`已精熟：\${mastered}/79\`, \`待補錯題：\${(progress.mistakePool || []).filter((mistake) => !mistake.resolved).length}\`, \`\`, \`## 錯題池\`,
          ...((progress.mistakePool || []).map((mistake) => \`- \${mistake.skillId}｜\${mistake.reason}｜\${mistake.occurrences} 次｜\${mistake.resolved ? "已解決" : "待補"}\`)),
        ];
        const blob = new Blob([lines.join("\\n")], { type: "text/markdown;charset=utf-8" });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = \`Apple-G1-學習報表-\${today}.md\`; link.click(); URL.revokeObjectURL(link.href);
      }

      document.getElementById("today-btn").addEventListener("click", buildPlan);
      document.getElementById("report-btn").addEventListener("click", downloadReport);
      document.getElementById("reset-btn").addEventListener("click", () => { localStorage.removeItem(KEY); progress = JSON.parse(JSON.stringify(progressSeed)); buildPlan(); });
      document.getElementById("speak-btn").addEventListener("click", speakCurrentQuestion);
      buildPlan();
    })();
  </script>
</body>
</html>`;

const output = path.join(root, "math-g1-school-preview.html");
fs.writeFileSync(output, html);
console.log(`Built ${path.relative(root, output)} (${Math.round(html.length / 1024)} KB)`);
console.log(`Templates: ${templates.length}; verified items: ${generatedItems.length}; skills: ${skills.length}`);
