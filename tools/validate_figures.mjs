#!/usr/bin/env node
/**
 * 檢查三邊是否一致：
 *   curriculum/figure-specs.json  ← 單一真相來源
 *   curriculum/templates/*.json   ← 模板端用的 figureSpec
 *   tools/figures/figures.js      ← 元件端實作的型別
 *
 * 用法：node tools/validate_figures.mjs
 * 全部一致回傳 0，有落差回傳 1（可掛進 pre-commit）。
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(
  readFileSync(join(ROOT, "curriculum/figure-specs.json"), "utf8")
).specs;

const { SUPPORTED } = await import(join(ROOT, "tools/figures/figures.js"));

const problems = [];
const note = (kind, msg) => problems.push({ kind, msg });

// ── 1. registry vs figures.js ──────────────────────────────
for (const [type, spec] of Object.entries(registry)) {
  const implemented = SUPPORTED.includes(type);
  if (!implemented && spec.status !== "TODO_JS") {
    note("未實作", `${type}：registry 有登記但 figures.js 沒實作，且沒標 TODO_JS`);
  }
  if (implemented && spec.status === "TODO_JS") {
    note("狀態過期", `${type}：figures.js 已實作，請把 registry 的 status: TODO_JS 移除`);
  }
}
for (const type of SUPPORTED) {
  if (!registry[type]) {
    note("未登記", `${type}：figures.js 有實作但 registry 沒登記`);
  }
}

// ── 2. templates vs registry ───────────────────────────────
const dir = join(ROOT, "curriculum/templates");
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
let withFigure = 0;

for (const file of files) {
  const tpl = JSON.parse(readFileSync(join(dir, file), "utf8"));
  const fs = tpl.figureSpec;
  if (!fs) continue;
  withFigure++;

  const spec = registry[fs.type];
  if (!spec) {
    note("型別不存在", `${file}：figureSpec.type = "${fs.type}" 不在 registry`);
    continue;
  }

  const keys = Object.keys(fs).filter((k) => k !== "type");
  const allowed = new Set([...spec.required, ...(spec.optional || [])]);

  for (const r of spec.required) {
    if (!keys.includes(r)) {
      note("缺必要參數", `${file}：${fs.type} 缺少 "${r}"（目前有 ${keys.join(", ") || "無"}）`);
    }
  }
  for (const k of keys) {
    if (!allowed.has(k)) {
      note("多餘參數", `${file}：${fs.type} 出現未定義的 "${k}"（允許 ${[...allowed].join(", ")}）`);
    }
  }
}

// ── 報告 ───────────────────────────────────────────────────
const byKind = {};
for (const p of problems) (byKind[p.kind] ||= []).push(p.msg);

console.log(`檢查 ${files.length} 個模板（${withFigure} 個帶圖）、`
  + `registry ${Object.keys(registry).length} 型、figures.js ${SUPPORTED.length} 型\n`);

if (!problems.length) {
  console.log("✅ 三邊一致");
  process.exit(0);
}
for (const [kind, msgs] of Object.entries(byKind)) {
  console.log(`【${kind}】${msgs.length} 筆`);
  for (const m of msgs) console.log("   " + m);
  console.log();
}
const todo = Object.entries(registry)
  .filter(([, s]) => s.status === "TODO_JS")
  .map(([t]) => t);
if (todo.length) console.log(`尚待實作 JS 版：${todo.join(", ")}`);
console.log(`\n❌ 共 ${problems.length} 筆落差`);
process.exit(1);
