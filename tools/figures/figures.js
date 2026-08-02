/**
 * figures.js — Apple 小一數學系統 圖形元件庫
 *
 * 純瀏覽器 ES module，零外部相依。回傳自足的 SVG 字串。
 * 見 curriculum/BUILD_CONTRACT.md §2.3（元件清單）與 §4.1（介面契約）。
 *
 * 設計原則：
 *   - 對象是 7 歲小孩：粗線條、高對比、大字。
 *   - 純函式：同一個 spec 一定產生同一個字串。禁止 Math.random()；
 *     需要隨機擺放的元件（目前只有 count_group 的 scatter 版面）一律吃
 *     呼叫端傳入的 seed，內部用可重現的偽亂數（mulberry32）。
 *   - 每個 renderer 都輸出含 viewBox 的 <svg>，寬度 <= 320（iPad 直式閱讀）。
 *
 * 用法：
 *   import { renderFigure, SUPPORTED } from "./figures.js";
 *   const svg = renderFigure({ type: "clock_face", hour: 3, minute: 30 });
 */

// ---------------------------------------------------------------------------
// 共用樣式常數
// ---------------------------------------------------------------------------

const FONT = "'PingFang TC','Microsoft JhengHei','Helvetica Neue',sans-serif";
const MONO = "'Menlo','Consolas','SF Mono',monospace";
const INK = "#2d2a26"; // 主要線條／文字色，深灰近黑，對比夠
const PALETTE = ["#f97316", "#3b82f6", "#22c55e", "#e11d48", "#a855f7", "#0891b2"];

// ---------------------------------------------------------------------------
// 共用小工具
// ---------------------------------------------------------------------------

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function round(n) {
  return Math.round(n * 10) / 10;
}

/** 把值轉成整數並夾在 [min, max] 之間；轉不出數字就用 def。 */
function clampInt(v, min, max, def) {
  let n = Math.round(Number(v));
  if (!Number.isFinite(n)) n = def;
  if (n < min) n = min;
  if (n > max) n = max;
  return n;
}

function numOr(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function svgOpen(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(w)} ${round(
    h
  )}" width="${round(w)}" height="${round(h)}" font-family="${FONT}">`;
}
const svgClose = () => "</svg>";

function bgRect(w, h, fill = "#ffffff") {
  return `<rect x="0" y="0" width="${round(w)}" height="${round(h)}" fill="${fill}"/>`;
}

function text(x, y, body, opts = {}) {
  const { size = 16, color = INK, anchor = "middle", weight = "700", family } = opts;
  const fam = family ? ` font-family="${family}"` : "";
  return `<text x="${round(x)}" y="${round(
    y
  )}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}"${fam}>${esc(
    body
  )}</text>`;
}

function rectEl(x, y, w, h, opts = {}) {
  const { fill = "none", stroke = "none", strokeWidth = 0, rx = 0, dash } = opts;
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  return `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(
    h
  )}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" rx="${rx}"${dashAttr}/>`;
}

function circleEl(cx, cy, r, opts = {}) {
  const { fill = "none", stroke = "none", strokeWidth = 0 } = opts;
  return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(
    r
  )}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

function lineEl(x1, y1, x2, y2, opts = {}) {
  const { stroke = INK, width = 2, cap = "round", dash } = opts;
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  return `<line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(
    y2
  )}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="${cap}"${dashAttr}/>`;
}

function starPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${round(cx + rad * Math.cos(ang))},${round(cy + rad * Math.sin(ang))}`);
  }
  return pts.join(" ");
}

/** 圓形計數籌碼（花片）：實心圓 + 左上小反光點，兒童友善的立體感。 */
function chip(cx, cy, r, color) {
  return (
    circleEl(cx, cy, r, { fill: color, stroke: "#00000030", strokeWidth: 2 }) +
    circleEl(cx - r * 0.32, cy - r * 0.32, r * 0.28, { fill: "#ffffffaa" })
  );
}

/** 畫一個指向 angleRad 方向的實心箭頭（三角形），供 line_relation 的平行方向記號使用。 */
function arrowHead(cx, cy, angleRad, size, color) {
  const tipX = cx + size * Math.cos(angleRad);
  const tipY = cy + size * Math.sin(angleRad);
  const backAngle1 = angleRad + (150 * Math.PI) / 180;
  const backAngle2 = angleRad - (150 * Math.PI) / 180;
  const bx1 = cx + size * 0.75 * Math.cos(backAngle1);
  const by1 = cy + size * 0.75 * Math.sin(backAngle1);
  const bx2 = cx + size * 0.75 * Math.cos(backAngle2);
  const by2 = cy + size * 0.75 * Math.sin(backAngle2);
  return `<polygon points="${round(tipX)},${round(tipY)} ${round(bx1)},${round(by1)} ${round(bx2)},${round(
    by2
  )}" fill="${color}"/>`;
}

function icon(type, cx, cy, r, color) {
  if (type === "star") {
    return `<polygon points="${starPoints(cx, cy, r)}" fill="${color}" stroke="#00000030" stroke-width="1.5"/>`;
  }
  if (type === "square") {
    return rectEl(cx - r, cy - r, r * 2, r * 2, {
      fill: color,
      stroke: "#00000030",
      strokeWidth: 1.5,
      rx: 3,
    });
  }
  return chip(cx, cy, r, color);
}

/** 內嵌素材圖示：題目頁會把 Fluent Emoji SVG 轉成 data URI 後傳進來。 */
function imageEl(href, cx, cy, size) {
  return `<image href="${esc(href)}" x="${round(cx - size / 2)}" y="${round(cy - size / 2)}" width="${round(size)}" height="${round(size)}" preserveAspectRatio="xMidYMid meet"/>`;
}

/**
 * mulberry32 — 可重現的偽亂數產生器。
 * 只有 count_group 的 scatter 版面需要「看起來隨機但仍然可重現」的擺放，
 * 因此吃呼叫端傳入的 seed；不傳就用固定預設值 42（仍然是純函式）。
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// 1. clock_face 指針鐘面
//    spec: { type:"clock_face", hour, minute, size? }
//    hour: 0-23（內部對 12 取餘數畫時針角度）, minute: 0-59
// ---------------------------------------------------------------------------

function renderClockFace(spec) {
  const hour = clampInt(spec.hour, 0, 23, 0);
  const minute = clampInt(spec.minute, 0, 59, 0);
  const size = numOr(spec.size, 240);
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.4;

  const hour12 = hour % 12;
  const minuteAngle = (minute / 60) * 360;
  const hourAngle = ((hour12 + minute / 60) / 12) * 360;

  const toXY = (angleDeg, r) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };

  const parts = [svgOpen(size, size), bgRect(size, size)];

  // 錶殼
  parts.push(circleEl(cx, cy, R + 16, { fill: "#fffdf5", stroke: INK, strokeWidth: 6 }));

  // 60 個分鐘刻度，每 5 分（= 每個數字位置）畫粗刻度
  for (let m = 0; m < 60; m++) {
    const ang = m * 6;
    const major = m % 5 === 0;
    const [x1, y1] = toXY(ang, R + (major ? 0 : 6));
    const [x2, y2] = toXY(ang, R + 13);
    parts.push(lineEl(x1, y1, x2, y2, { stroke: major ? INK : "#cbc3b6", width: major ? 4 : 2 }));
  }

  // 1-12 數字
  for (let n = 1; n <= 12; n++) {
    const ang = n * 30;
    const [x, y] = toXY(ang, R - 24);
    parts.push(text(x, y + size * 0.02, String(n), { size: size * 0.09, weight: "800" }));
  }

  // 時針（短、粗、深藍）
  const [hx, hy] = toXY(hourAngle, R * 0.5);
  parts.push(lineEl(cx, cy, hx, hy, { stroke: "#1e3a8a", width: size * 0.036, cap: "round" }));

  // 分針（長、細一點、紅色）
  const [mx, my] = toXY(minuteAngle, R * 0.82);
  parts.push(lineEl(cx, cy, mx, my, { stroke: "#dc2626", width: size * 0.022, cap: "round" }));

  // 錶心
  parts.push(circleEl(cx, cy, size * 0.032, { fill: INK }));

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 2. digital_clock 電子鐘
//    spec: { type:"digital_clock", hour, minute, period? }
//    period: "上午" | "下午"（選填，顯示在數字上方）
// ---------------------------------------------------------------------------

function renderDigitalClock(spec) {
  const hour = clampInt(spec.hour, 0, 23, 0);
  const minute = clampInt(spec.minute, 0, 59, 0);
  const period = spec.period === "上午" || spec.period === "下午" ? spec.period : null;

  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  const w = 220;
  const h = 130;

  const parts = [svgOpen(w, h), bgRect(w, h)];
  parts.push(
    rectEl(10, 10, w - 20, h - 20, {
      fill: "#0f2f2a",
      stroke: "#0a1f1c",
      strokeWidth: 4,
      rx: 18,
    })
  );

  if (period) {
    parts.push(text(w / 2, 34, period, { size: 17, color: "#7fffd4", weight: "800" }));
  }

  const digitY = period ? h / 2 + 22 : h / 2 + 14;
  parts.push(
    text(w / 2, digitY, `${hh}:${mm}`, {
      size: 44,
      color: "#39ff9c",
      weight: "800",
      family: MONO,
    })
  );

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 3. calendar 月曆
//    spec: { type:"calendar", year, month, highlight? }
//    highlight: 要標記的日期陣列，如 [5, 12, 25]
// ---------------------------------------------------------------------------

function renderCalendar(spec) {
  const year = clampInt(spec.year, 1900, 2200, 2026);
  const month = clampInt(spec.month, 1, 12, 1);
  const highlight = new Set((Array.isArray(spec.highlight) ? spec.highlight : []).map(Number));

  const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0=日
  const daysInMonth = new Date(year, month, 0).getDate();

  const cell = 40;
  const padTop = 56;
  const padLeft = 10;
  const rows = Math.ceil((firstWeekday + daysInMonth) / 7);
  const w = 7 * cell + padLeft * 2;
  const h = padTop + rows * cell + 12;

  const weekNames = ["日", "一", "二", "三", "四", "五", "六"];

  const parts = [svgOpen(w, h), bgRect(w, h)];
  parts.push(text(w / 2, 26, `${year} 年 ${month} 月`, { size: 20, weight: "800" }));

  weekNames.forEach((wd, i) => {
    const x = padLeft + i * cell + cell / 2;
    const isWeekend = i === 0 || i === 6;
    parts.push(
      text(x, padTop - 10, wd, {
        size: 15,
        color: isWeekend ? "#dc2626" : "#374151",
        weight: "800",
      })
    );
  });
  parts.push(lineEl(padLeft, padTop, w - padLeft, padTop, { stroke: "#d1d5db", width: 2 }));

  for (let d = 1; d <= daysInMonth; d++) {
    const idx = firstWeekday + d - 1;
    const col = idx % 7;
    const row = Math.floor(idx / 7);
    const cx = padLeft + col * cell + cell / 2;
    const cy = padTop + row * cell + cell / 2 + 4;
    const isHi = highlight.has(d);
    const isWeekend = col === 0 || col === 6;

    if (isHi) {
      parts.push(circleEl(cx, cy - 5, 17, { fill: "#fde047", stroke: "#f59e0b", strokeWidth: 3 }));
    }
    parts.push(
      text(cx, cy, String(d), {
        size: 16,
        color: isHi ? "#7c2d12" : isWeekend ? "#dc2626" : INK,
        weight: isHi ? "800" : "700",
      })
    );
  }

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 4. ten_frame 十格框
//    spec: { type:"ten_frame", filled, extra? }
//    2x5 標準十格框，先填第一色 filled 個，再填第二色 extra 個。
// ---------------------------------------------------------------------------

function renderTenFrame(spec) {
  const filled = clampInt(spec.filled, 0, 10, 0);
  const extraMax = 10 - filled;
  const extra = clampInt(spec.extra, 0, extraMax, 0);

  const cellSize = 50;
  const gap = 8;
  const cols = 5;
  const rowsN = 2;
  const w = cols * cellSize + (cols + 1) * gap;
  const h = rowsN * cellSize + (rowsN + 1) * gap + 6;

  const parts = [svgOpen(w, h), bgRect(w, h)];

  for (let i = 0; i < 10; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = gap + c * (cellSize + gap);
    const y = gap + r * (cellSize + gap) + 4;
    parts.push(rectEl(x, y, cellSize, cellSize, { fill: "#ffffff", stroke: "#9ca3af", strokeWidth: 3, rx: 8 }));
    if (i < filled) {
      parts.push(chip(x + cellSize / 2, y + cellSize / 2, cellSize * 0.34, "#f43f5e"));
    } else if (i < filled + extra) {
      parts.push(chip(x + cellSize / 2, y + cellSize / 2, cellSize * 0.34, "#3b82f6"));
    }
  }

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 5. place_value_board 定位板（位值）
//    spec: { type:"place_value_board", tens, ones, hundreds? }
// ---------------------------------------------------------------------------

function renderPlaceValueBoard(spec) {
  const cols = [];
  if (spec.hundreds !== undefined && spec.hundreds !== null) {
    cols.push({ label: "百", value: clampInt(spec.hundreds, 0, 9, 0), color: "#fbbf24" });
  }
  cols.push({ label: "十", value: clampInt(spec.tens, 0, 9, 0), color: "#34d399" });
  cols.push({ label: "個", value: clampInt(spec.ones, 0, 9, 0), color: "#60a5fa" });

  const colW = 88;
  const gap = 8;
  const h = 168;
  const w = cols.length * colW + (cols.length + 1) * gap;

  const parts = [svgOpen(w, h), bgRect(w, h)];

  cols.forEach((col, i) => {
    const x = gap + i * (colW + gap);
    parts.push(rectEl(x, 12, colW, 36, { fill: col.color, stroke: INK, strokeWidth: 3, rx: 10 }));
    parts.push(text(x + colW / 2, 36, col.label, { size: 20, color: "#ffffff", weight: "800" }));
    parts.push(rectEl(x, 56, colW, h - 68, { fill: "#ffffff", stroke: INK, strokeWidth: 3, rx: 10 }));
    parts.push(
      text(x + colW / 2, 56 + (h - 68) / 2 + 16, String(col.value), {
        size: 46,
        weight: "800",
      })
    );
  });

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 6. column_arithmetic 直式加減板
//    spec: { type:"column_arithmetic", a, b, op, showAnswer? }
//    op: "+" | "-"
//    2026-08-01 修復：a/b 允許浮點數，元件內部偵測有沒有小數點，自動切換到
//    小數版面（多一欄窄的小數點欄位並對齊十分位/百分位）。
//    ⚠️ 相容性鐵律：a、b 皆為整數時，一律走 renderColumnArithmeticInt——
//    這段程式碼跟修復前逐字元相同，不可更動，是既有 G1 模板呼叫方式的相容性基準。
// ---------------------------------------------------------------------------

/** 純整數版直式加減板（修復前的原版演算法，逐字元保留，不可更動）。 */
function renderColumnArithmeticInt(rawA, rawB, op, showAnswer) {
  const a = Math.round(rawA);
  const b = Math.round(rawB);
  const answer = op === "+" ? a + b : a - b;

  const digitsOf = (n) => String(Math.abs(Math.round(n)));
  const maxDigits = Math.max(
    digitsOf(a).length,
    digitsOf(b).length,
    showAnswer ? digitsOf(answer).length : digitsOf(a).length
  );

  const cellW = 46;
  const cellH = 56;
  const signW = 44;
  const padX = 10;
  const row1Y = 14;
  const row2Y = row1Y + cellH;
  const lineY = row2Y + cellH + 8;
  const row3Y = lineY + 12;

  const w = signW + maxDigits * cellW + padX * 2;
  const h = row3Y + cellH + 14;

  const parts = [svgOpen(w, h), bgRect(w, h)];

  const drawRow = (y, numStr, sign, color) => {
    if (sign) {
      parts.push(text(padX + signW / 2, y + cellH / 2 + 12, sign, { size: 32, color: "#dc2626", weight: "800" }));
    }
    const padded = numStr.padStart(maxDigits, " ");
    for (let i = 0; i < maxDigits; i++) {
      const ch = padded[i];
      if (ch === " ") continue;
      const x = padX + signW + i * cellW;
      parts.push(text(x + cellW / 2, y + cellH / 2 + 12, ch, { size: 34, color, weight: "800" }));
    }
  };

  drawRow(row1Y, digitsOf(a), null, INK);
  drawRow(row2Y, digitsOf(b), op, INK);
  parts.push(lineEl(padX, lineY, w - padX, lineY, { stroke: INK, width: 5 }));

  if (showAnswer) {
    drawRow(row3Y, digitsOf(answer), null, "#16a34a");
  } else {
    for (let i = 0; i < maxDigits; i++) {
      const x = padX + signW + i * cellW;
      parts.push(
        rectEl(x + 4, row3Y + 8, cellW - 8, cellH - 16, {
          fill: "#fef9c3",
          stroke: "#f59e0b",
          strokeWidth: 3,
          rx: 8,
          dash: "6,5",
        })
      );
    }
  }

  parts.push(svgClose());
  return parts.join("");
}

/** n 的小數位數，用 JS 的最短往返字串表示判斷（1.2 一定印成 "1.2"，不會有浮點雜訊）。 */
function decimalPlacesOf(n) {
  const s = String(n);
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

/**
 * 小數版直式加減板：跟整數版共用視覺語言（同樣的 cellW/cellH/字級/顏色），
 * 差別只在整數欄和小數欄中間多插一欄窄的小數點欄位，並且所有欄位一律用
 * 「乘以 10^decPlaces 轉整數再做加減」的方式算數字，避免浮點誤差；
 * 小數位數不足的運算元用 0 補齊（例如 5 + 3.4 的 5 會畫成 5.0），呼應
 * G4-09-03「加法直式計算前補 0」這個技能本身要教的對齊技巧。
 */
function renderColumnArithmeticDecimal(rawA, rawB, op, showAnswer) {
  const decPlaces = Math.max(decimalPlacesOf(rawA), decimalPlacesOf(rawB), 1);
  const scale = Math.pow(10, decPlaces);

  const aScaled = Math.round(rawA * scale);
  const bScaled = Math.round(rawB * scale);
  const answerScaled = op === "+" ? aScaled + bScaled : aScaled - bScaled;

  const splitDigits = (scaledInt) => {
    const abs = Math.abs(scaledInt);
    const intPart = Math.floor(abs / scale);
    const fracPart = abs % scale;
    return {
      intDigits: String(intPart),
      fracDigits: String(fracPart).padStart(decPlaces, "0"),
    };
  };

  const da = splitDigits(aScaled);
  const db = splitDigits(bScaled);
  const dAns = splitDigits(answerScaled);

  const maxIntLen = Math.max(
    da.intDigits.length,
    db.intDigits.length,
    showAnswer ? dAns.intDigits.length : da.intDigits.length
  );

  const cellW = 46;
  const dotW = 18;
  const cellH = 56;
  const signW = 44;
  const padX = 10;
  const row1Y = 14;
  const row2Y = row1Y + cellH;
  const lineY = row2Y + cellH + 8;
  const row3Y = lineY + 12;

  const colWidths = [...Array(maxIntLen).fill(cellW), dotW, ...Array(decPlaces).fill(cellW)];
  const colX = [];
  {
    let x = padX + signW;
    for (const cw of colWidths) {
      colX.push(x);
      x += cw;
    }
  }

  const w = signW + maxIntLen * cellW + dotW + decPlaces * cellW + padX * 2;
  const h = row3Y + cellH + 14;

  const parts = [svgOpen(w, h), bgRect(w, h)];

  const tokensOf = (d) => [...d.intDigits.padStart(maxIntLen, " ").split(""), ".", ...d.fracDigits.split("")];

  const drawRow = (y, tokens, sign, color) => {
    if (sign) {
      parts.push(text(padX + signW / 2, y + cellH / 2 + 12, sign, { size: 32, color: "#dc2626", weight: "800" }));
    }
    tokens.forEach((ch, i) => {
      if (ch === " ") return;
      const cx = colX[i] + colWidths[i] / 2;
      if (ch === ".") {
        parts.push(circleEl(cx, y + cellH / 2 + 9, 4.4, { fill: color }));
        return;
      }
      parts.push(text(cx, y + cellH / 2 + 12, ch, { size: 34, color, weight: "800" }));
    });
  };

  drawRow(row1Y, tokensOf(da), null, INK);
  drawRow(row2Y, tokensOf(db), op, INK);
  parts.push(lineEl(padX, lineY, w - padX, lineY, { stroke: INK, width: 5 }));

  if (showAnswer) {
    drawRow(row3Y, tokensOf(dAns), null, "#16a34a");
  } else {
    colWidths.forEach((cw, i) => {
      const x = colX[i];
      const isDot = cw === dotW;
      parts.push(
        rectEl(x + (isDot ? 2 : 4), row3Y + 8, cw - (isDot ? 4 : 8), cellH - 16, {
          fill: "#fef9c3",
          stroke: "#f59e0b",
          strokeWidth: isDot ? 2 : 3,
          rx: isDot ? 5 : 8,
          dash: "6,5",
        })
      );
    });
  }

  parts.push(svgClose());
  return parts.join("");
}

function renderColumnArithmetic(spec) {
  const rawA = numOr(spec.a, 0);
  const rawB = numOr(spec.b, 0);
  const op = spec.op === "-" ? "-" : "+";
  const showAnswer = !!spec.showAnswer;

  const isDecimal = decimalPlacesOf(rawA) > 0 || decimalPlacesOf(rawB) > 0;
  if (!isDecimal) {
    // 整數輸入：完全沿用原版演算法，跟修復前逐字元相同輸出。
    return renderColumnArithmeticInt(rawA, rawB, op, showAnswer);
  }
  return renderColumnArithmeticDecimal(rawA, rawB, op, showAnswer);
}

// ---------------------------------------------------------------------------
// 7. count_group 數數群組（花片）
//    spec: { type:"count_group", groups:[{color,count,label?}], layout?, seed? }
//    layout: "rows"（預設，整齊排列，適合比較多少）| "scatter"（散佈，適合估計／點數）
// ---------------------------------------------------------------------------

function renderCountGroup(spec) {
  const groups = Array.isArray(spec.groups) ? spec.groups : [];
  const layout = spec.layout === "scatter" ? "scatter" : spec.layout === "sequence" ? "sequence" : "rows";
  const seed = Number.isFinite(spec.seed) ? spec.seed : 42;

  if (layout === "rows") {
    const r = 13;
    const stepX = 32;
    const stepY = 32;
    const perRowMax = 8;
    const groupGap = 22;
    // 有標籤時預留左側欄位，避免「蘋果」等文字壓到第一顆圓形。
    const labelW = groups.some((g) => g.label) ? 62 : 22;
    const padX = labelW;

    let y = 20;
    const body = [];
    let maxW = 0;

    const countVisual = (g, color, cx, cy, size) => {
      if (g.asset && g.asset !== "circle") return imageEl(g.asset, cx, cy, size);
      return chip(cx, cy, size / 2, color);
    };

    groups.forEach((g) => {
      const count = clampInt(g.count, 0, 999, 0);
      const color = g.color || "#f97316";
      const rowsN = Math.max(1, Math.ceil(count / perRowMax));
      for (let i = 0; i < count; i++) {
        const c = i % perRowMax;
        const rr = Math.floor(i / perRowMax);
        const cx = padX + c * stepX;
        const cy = y + rr * stepY;
        body.push(countVisual(g, color, cx, cy, r * 2));
        maxW = Math.max(maxW, cx + r + 14);
      }
      if (g.label) {
        body.push(text(8, y + 5, g.label, { size: 13, color: "#374151", weight: "700", anchor: "start" }));
      }
      y += rowsN * stepY + groupGap;
    });

    const w = Math.max(maxW, 140);
    const h = y - groupGap + 16;
    return svgOpen(w, h) + bgRect(w, h) + body.join("") + svgClose();
  }

  if (layout === "sequence") {
    const items = [];
    groups.forEach((g) => {
      const count = clampInt(g.count, 0, 20, 0);
      const color = g.color || "#f97316";
      for (let i = 0; i < count; i++) items.push({ color, asset: g.asset, label: i === 0 ? g.label : null });
    });
    const step = Math.min(30, Math.max(24, 246 / Math.max(items.length, 1)));
    const w = Math.max(190, items.length * step + 34);
    const y = 61;
    const parts = [svgOpen(w, 112), bgRect(w, 112)];
    parts.push(text(16, 20, "左邊", { size: 12, anchor: "start", color: "#6b7280", weight: "800" }));
    parts.push(text(46, 20, "→", { size: 18, anchor: "middle", color: "#7c3aed", weight: "800" }));
    items.forEach((item, index) => {
      const cx = 20 + index * step + step / 2;
      if (item.asset && item.asset !== "circle") parts.push(imageEl(item.asset, cx, y, 24));
      else parts.push(chip(cx, y, 11, item.color));
      if (item.label) parts.push(text(cx, y - 21, item.label, { size: 12, color: item.color, weight: "800" }));
    });
    return parts.join("") + svgClose();
  }

  // scatter layout — 用種子固定亂數把所有籌碼撒在共用畫布上（用於估計／點數練習）
  const rng = mulberry32(seed);
  const w = 280;
  const h = 180;

  const items = [];
  groups.forEach((g) => {
    const count = clampInt(g.count, 0, 999, 0);
    const color = g.color || "#f97316";
    for (let i = 0; i < count; i++) items.push({ color, asset: g.asset });
  });

  const total = Math.max(items.length, 1);
  const cols = Math.max(1, Math.ceil(Math.sqrt(total * 1.4)));
  const rowsN = Math.max(1, Math.ceil(total / cols));
  const cellW = (w - 20) / cols;
  const cellH = (h - 20) / rowsN;
  const rad = Math.min(cellW, cellH) * 0.32;

  const body = items.map((item, idx) => {
    const c = idx % cols;
    const rr = Math.floor(idx / cols);
    const jx = (rng() - 0.5) * cellW * 0.5;
    const jy = (rng() - 0.5) * cellH * 0.5;
    const cx = 10 + c * cellW + cellW / 2 + jx;
    const cy = 10 + rr * cellH + cellH / 2 + jy;
    if (item.asset && item.asset !== "circle") return imageEl(item.asset, cx, cy, rad * 2);
    return chip(cx, cy, rad, item.color);
  });

  return svgOpen(w, h) + bgRect(w, h) + body.join("") + svgClose();
}

// ---------------------------------------------------------------------------
// 8. unit_ruler 個別單位重複排列測量
//    spec: { type:"unit_ruler", objectLength, unitLength, unitLabel?, objectLabel? }
//    在上方畫一個物件長條，下方畫重複排列的個別單位方塊，數「幾個單位長」。
// ---------------------------------------------------------------------------

function renderUnitRuler(spec) {
  const objectLength = Math.max(numOr(spec.objectLength, 1), 0.1);
  const unitLength = Math.max(numOr(spec.unitLength, 1), 0.1);
  const unitLabel = spec.unitLabel || "單位";
  const objectLabel = spec.objectLabel || "";

  const n = Math.max(1, Math.round(objectLength / unitLength));
  const trackW = 260;
  const scale = trackW / objectLength;
  const unitW = unitLength * scale;

  const w = trackW + 40;
  const objY = 20;
  const objH = 34;
  const unitY = 76;
  const unitH = 30;
  const numY = unitY + unitH + 18;
  const sumY = numY + 22;
  const h = sumY + 14;

  const parts = [svgOpen(w, h), bgRect(w, h)];

  // 物件長條
  parts.push(rectEl(20, objY, trackW, objH, { fill: "#fbbf24", stroke: INK, strokeWidth: 3, rx: 10 }));
  if (objectLabel) {
    parts.push(text(20 + trackW / 2, objY + objH / 2 + 6, objectLabel, { size: 15, color: "#7c2d12", weight: "800" }));
  }

  // 個別單位方塊，緊接著排在下方
  let x = 20;
  for (let i = 0; i < n; i++) {
    const fill = i % 2 === 0 ? "#93c5fd" : "#60a5fa";
    parts.push(rectEl(x + 1.5, unitY, unitW - 3, unitH, { fill, stroke: INK, strokeWidth: 2, rx: 5 }));
    parts.push(text(x + unitW / 2, numY, String(i + 1), { size: 13, color: INK, weight: "700" }));
    x += unitW;
  }

  parts.push(text(20 + trackW / 2, sumY, `共 ${n} 個「${unitLabel}」長`, { size: 14, color: "#374151", weight: "700" }));

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 9. pictogram 圖畫記錄（象形圖）
//    spec: { type:"pictogram", categories:[{label,count}], orientation, icon? }
//    orientation: "vertical" | "horizontal"
//    icon: "circle"（預設）| "star" | "square"
// ---------------------------------------------------------------------------

function renderPictogram(spec) {
  const categories = Array.isArray(spec.categories) ? spec.categories : [];
  const orientation = spec.orientation === "horizontal" ? "horizontal" : "vertical";
  const iconType = spec.icon || "circle";
  const maxCount = Math.max(1, ...categories.map((c) => clampInt(c.count, 0, 999, 0)));

  if (orientation === "vertical") {
    const iconSize = 18;
    const gap = 6;
    const colW = 58;
    const w = Math.max(categories.length * colW + 20, 100);
    const chartH = maxCount * (iconSize + gap) + 10;
    const baseY = chartH + 20;
    const h = baseY + 46;

    const parts = [svgOpen(w, h), bgRect(w, h)];
    parts.push(lineEl(10, baseY, w - 10, baseY, { stroke: INK, width: 3 }));

    categories.forEach((cat, ci) => {
      const count = clampInt(cat.count, 0, 999, 0);
      const cx = 10 + ci * colW + colW / 2;
      const color = PALETTE[ci % PALETTE.length];
      for (let k = 0; k < count; k++) {
        const cy = baseY - 14 - k * (iconSize + gap);
        parts.push(icon(iconType, cx, cy, iconSize / 2, color));
      }
      parts.push(text(cx, baseY + 20, cat.label ?? "", { size: 14, weight: "700" }));
      parts.push(text(cx, baseY + 38, String(count), { size: 13, color: "#6b7280", weight: "700" }));
    });

    parts.push(svgClose());
    return parts.join("");
  }

  // horizontal — 動態縮放圖示大小，確保寬度不超過契約上限 (320)
  const labelW = 68;
  const maxTrackW = 300 - labelW - 20;
  const step = Math.max(12, Math.min(24, Math.floor(maxTrackW / Math.max(maxCount, 1))));
  const iconSize = step * 0.72;
  const rowH = 34;
  const h = categories.length * rowH + 20;
  const chartW = maxCount * step + 10;
  const w = labelW + chartW + 20;

  const parts = [svgOpen(w, h), bgRect(w, h)];
  parts.push(lineEl(labelW, 10, labelW, h - 10, { stroke: INK, width: 3 }));

  categories.forEach((cat, ci) => {
    const count = clampInt(cat.count, 0, 999, 0);
    const cy = 10 + ci * rowH + rowH / 2;
    const color = PALETTE[ci % PALETTE.length];
    parts.push(text(labelW - 10, cy + 5, cat.label ?? "", { size: 14, weight: "700", anchor: "end" }));
    for (let k = 0; k < count; k++) {
      const cx = labelW + 14 + k * step;
      parts.push(icon(iconType, cx, cy, iconSize / 2, color));
    }
  });

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 10. segment_compare 線段比一比
//     spec: { type:"segment_compare", rows:[{label,length,shape?}], orientation?, ask?, unit? }
//     rows 是要比較的線段列表，length 依比例縮放。orientation 預設 "horizontal"
//     （由上往下疊，每條水平畫）；"vertical" 則並排、由共同底線往上長高。
//     shape（每列可選，預設 "line"）："line" 直條 | "curve" 彎曲的曲線
//     （服務「辨認曲線」題型）| "point"（畫一個點，忽略 length，服務「辨認點」題型）。
//     ask 是要比較的面向文字（如「長」「寬」），畫在圖上方當提示。
// ---------------------------------------------------------------------------

function renderSegmentCompare(spec) {
  const rows = Array.isArray(spec.rows) ? spec.rows : [];
  const orientation = spec.orientation === "vertical" ? "vertical" : spec.orientation === "distance" ? "distance" : "horizontal";
  const ask = spec.ask;
  const unit = spec.unit;

  const lens = rows.map((r) => Math.max(numOr(r.length, 1), 0.1));
  const maxLen = Math.max(...lens, 1);
  const padTop = ask ? 32 : 14;

  const labelOf = (row, len) => {
    if (!unit) return null;
    return `${round(len)}${unit}`;
  };

  if (orientation === "horizontal" || orientation === "distance") {
    const isDistance = orientation === "distance";
    const trackW = isDistance ? 220 : 200;
    const scale = trackW / maxLen;
    const rowH = 42;
    const labelW = isDistance ? 34 : 40;
    const startX = isDistance ? labelW + 18 : labelW + 8;
    const w = labelW + trackW + (isDistance ? 62 : 46);
    const h = padTop + rows.length * rowH + 12;

    const parts = [svgOpen(w, h), bgRect(w, h)];
    if (ask) parts.push(text(w / 2, 20, `比一比：${esc(ask)}`, { size: 14, color: "#7c3aed" }));
    if (isDistance) {
      parts.push(text(startX, padTop - 8, "起點", { size: 12, color: "#6b7280", anchor: "middle", weight: "800" }));
      parts.push(lineEl(startX, padTop + 4, startX, padTop + rows.length * rowH - 5, { stroke: "#9ca3af", width: 2, dash: "4,4" }));
    }

    rows.forEach((row, i) => {
      const y = padTop + i * rowH + rowH / 2;
      const color = PALETTE[i % PALETTE.length];
      const len = Math.max(numOr(row.length, 1), 0.1);
      const shape = row.shape || "line";
      parts.push(text(labelW - 10, y + 5, row.label ?? "", { size: 15, anchor: "end" }));

      if (shape === "point") {
        parts.push(circleEl(labelW + 18, y, 9, { fill: color, stroke: INK, strokeWidth: 2 }));
      } else if (shape === "curve") {
        const segW = Math.max(36, len * scale);
        const x1 = labelW + 8;
        const x2 = x1 + segW;
        const style = row.style || "arc";
        if (style === "oval") {
          parts.push(`<ellipse cx="${round((x1 + x2) / 2)}" cy="${round(y)}" rx="${round(segW / 2)}" ry="${round(Math.max(12, segW * 0.18))}" fill="none" stroke="${color}" stroke-width="5"/>`);
        } else if (style === "wave") {
          const q = (x2 - x1) / 4;
          parts.push(`<path d="M ${round(x1)} ${round(y)} C ${round(x1 + q)} ${round(y - segW * 0.28)}, ${round(x1 + q)} ${round(y + segW * 0.28)}, ${round(x1 + 2 * q)} ${round(y)} S ${round(x1 + 3 * q)} ${round(y - segW * 0.28)}, ${round(x2)} ${round(y)}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`);
        } else if (style === "loop") {
          parts.push(`<path d="M ${round(x1)} ${round(y)} C ${round(x1 + segW * 0.18)} ${round(y - segW * 0.4)}, ${round(x1 + segW * 0.48)} ${round(y - segW * 0.4)}, ${round(x1 + segW * 0.5)} ${round(y)} C ${round(x1 + segW * 0.52)} ${round(y + segW * 0.4)}, ${round(x1 + segW * 0.82)} ${round(y + segW * 0.4)}, ${round(x2)} ${round(y)}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`);
        } else {
          parts.push(`<path d="M ${round(x1)} ${round(y)} Q ${round((x1 + x2) / 2)} ${round(y - segW * 0.32)}, ${round(x2)} ${round(y)}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`);
        }
      } else if (isDistance) {
        const endX = startX + len * scale;
        parts.push(lineEl(startX, y, endX, y, { stroke: color, width: 7, cap: "round" }));
        parts.push(circleEl(startX, y, 6, { fill: "#ffffff", stroke: INK, strokeWidth: 2 }));
        parts.push(circleEl(endX, y, 7, { fill: color, stroke: INK, strokeWidth: 2 }));
      } else {
        const segW = Math.max(24, len * scale);
        parts.push(rectEl(labelW + 8, y - 7, segW, 14, { fill: color, stroke: INK, strokeWidth: 2, rx: 7 }));
        const lab = labelOf(row, len);
        if (lab) parts.push(text(labelW + 8 + segW / 2, y - 14, lab, { size: 11, color: "#6b7280" }));
      }
    });

    parts.push(svgClose());
    return parts.join("");
  }

  // vertical — 並排的直條，底部對齊，往上長高
  const trackH = 150;
  const scale = trackH / maxLen;
  const colW = Math.min(74, Math.max(48, 260 / Math.max(rows.length, 1)));
  const w = Math.min(300, rows.length * colW + 24);
  const baseY = padTop + trackH + 8;
  const h = baseY + 32;

  const parts = [svgOpen(w, h), bgRect(w, h)];
  if (ask) parts.push(text(w / 2, 20, `比一比：${esc(ask)}`, { size: 14, color: "#7c3aed" }));
  parts.push(lineEl(12, baseY, w - 12, baseY, { stroke: "#9ca3af", width: 2 }));

  rows.forEach((row, i) => {
    const cx = 12 + i * colW + colW / 2;
    const color = PALETTE[i % PALETTE.length];
    const len = Math.max(numOr(row.length, 1), 0.1);
    const barH = Math.max(20, len * scale);
    parts.push(rectEl(cx - colW * 0.28, baseY - barH, colW * 0.56, barH, { fill: color, stroke: INK, strokeWidth: 2, rx: 6 }));
    parts.push(text(cx, baseY + 20, row.label ?? "", { size: 14, weight: "700" }));
  });

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 11. thickness_compare 厚薄比較
//     把物件畫成橫放的書本堆疊，厚度由「書頁層數」表示，不拿垂直高度冒充厚度。
// ---------------------------------------------------------------------------

function renderThicknessCompare(spec) {
  const rows = Array.isArray(spec.rows) ? spec.rows : [];
  const rowH = 82;
  const w = 280;
  const h = Math.max(100, rows.length * rowH + 18);
  const parts = [svgOpen(w, h), bgRect(w, h)];

  rows.forEach((row, i) => {
    const thickness = clampInt(row.length, 2, 9, 3);
    const color = PALETTE[i % PALETTE.length];
    const x = 62;
    const y = 24 + i * rowH;
    const bookW = 150;
    const bookH = 28;
    const layerOffset = 2.4;
    parts.push(text(45, y + 17, row.label ?? "", { size: 16, anchor: "end", weight: "800" }));
    for (let k = thickness - 1; k >= 0; k--) {
      const dx = k * layerOffset;
      const dy = -k * layerOffset;
      parts.push(rectEl(x + dx, y + dy, bookW, bookH, { fill: color, stroke: INK, strokeWidth: 2, rx: 5 }));
    }
    parts.push(lineEl(x + 18, y + 9, x + bookW - 18, y + 9, { stroke: "#ffffffaa", width: 2 }));
    parts.push(lineEl(x + 18, y + 18, x + bookW - 18, y + 18, { stroke: "#ffffffaa", width: 2 }));
  });

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 11. number_line 數線
//     spec: { type:"number_line", min, max, highlight?, step?, marks? }
//     整數刻度從 min 到 max。highlight 是要醒目標出的單一數值（大紅點＋數字）。
//     marks 是要額外標記的數值陣列（小藍點，不特別強調）。
// ---------------------------------------------------------------------------

function renderNumberLine(spec) {
  let min = Math.round(numOr(spec.min, 0));
  let max = Math.round(numOr(spec.max, min + 10));
  if (max <= min) max = min + 1;
  const step = Math.max(1, Math.round(numOr(spec.step, 1)));
  const marks = Array.isArray(spec.marks) ? spec.marks.map((v) => Math.round(numOr(v, min))) : [];
  const hasHighlight = spec.highlight !== undefined && spec.highlight !== null;
  const highlight = hasHighlight ? Math.round(numOr(spec.highlight, min)) : null;

  const n = Math.max(1, Math.round((max - min) / step));
  const trackW = Math.min(264, Math.max(150, n * 24));
  const padX = 24;
  const w = trackW + padX * 2;
  const y = 62;
  const h = 96;

  const X = (v) => padX + ((v - min) / (max - min)) * trackW;

  const parts = [svgOpen(w, h), bgRect(w, h)];
  parts.push(lineEl(padX - 6, y, padX + trackW + 6, y, { stroke: INK, width: 3 }));
  parts.push(
    `<polygon points="${round(padX + trackW + 14)},${round(y)} ${round(padX + trackW + 2)},${round(
      y - 5
    )} ${round(padX + trackW + 2)},${round(y + 5)}" fill="${INK}"/>`
  );
  parts.push(
    `<polygon points="${round(padX - 14)},${round(y)} ${round(padX - 2)},${round(y - 5)} ${round(
      padX - 2
    )},${round(y + 5)}" fill="${INK}"/>`
  );

  for (let v = min; v <= max; v += step) {
    const x = X(v);
    parts.push(lineEl(x, y - 9, x, y + 9, { stroke: INK, width: 2 }));
    parts.push(text(x, y + 26, String(v), { size: 13, color: "#4b5563", weight: "700" }));
  }

  marks.forEach((m) => {
    if (m < min || m > max) return;
    parts.push(circleEl(X(m), y, 5, { fill: "#3b82f6" }));
  });

  if (highlight !== null && highlight >= min && highlight <= max) {
    const x = X(highlight);
    parts.push(circleEl(x, y, 9, { fill: "#f43f5e", stroke: INK, strokeWidth: 2 }));
    parts.push(text(x, y - 18, String(highlight), { size: 16, color: "#f43f5e", weight: "800" }));
  }

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 12. space_relations 空間位置關係（一排位置的順序／相對關係）
//     spec: { type:"space_relations", mode, total, targetPos?, ask?, labels?, marks? }
//     mode "row_count"：畫一排 total 個位置，標出第 targetPos 個；labels（長度需等於
//       total）可用實際內容取代格內數字；ask（"左"/"右"）在目標旁畫箭頭提示方向。
//     mode "row_order"：畫一排 total 個位置，用 marks（位置陣列，1 起算）標出兩個
//       對象，並用 labels（對應 marks 順序的名字）標籤，服務前後／上下相對關係題。
// ---------------------------------------------------------------------------

function renderSpaceRelations(spec) {
  const mode = spec.mode === "row_order" ? "row_order" : "row_count";
  const total = clampInt(spec.total, 1, 20, 5);
  const maxW = 296;
  const gap = 6;

  if (mode === "row_count") {
    const hasTarget = spec.targetPos !== undefined && spec.targetPos !== null;
    const targetPos = hasTarget ? clampInt(spec.targetPos, 1, total, 1) : null;
    const ask = spec.ask === "左" || spec.ask === "右" ? spec.ask : null;
    const labels = Array.isArray(spec.labels) && spec.labels.length === total ? spec.labels : null;
    const marks = Array.isArray(spec.marks) ? spec.marks.map(Number) : [];

    let cellSize = Math.floor((maxW - gap) / total) - gap;
    cellSize = Math.max(20, Math.min(44, cellSize));
    const w = total * (cellSize + gap) + gap;
    const y = 54;
    const h = y + cellSize / 2 + 40;

    const parts = [svgOpen(w, h), bgRect(w, h)];

    for (let i = 1; i <= total; i++) {
      const x = gap + (i - 1) * (cellSize + gap);
      const isTarget = i === targetPos;
      const isMark = marks.includes(i);
      const fill = isTarget ? "#f43f5e" : isMark ? "#3b82f6" : "#e5e7eb";
      parts.push(rectEl(x, y - cellSize / 2, cellSize, cellSize, { fill, stroke: INK, strokeWidth: 2, rx: 7 }));
      const label = labels ? labels[i - 1] : String(i);
      const size = labels ? Math.min(13, cellSize * 0.34) : 13;
      parts.push(
        text(x + cellSize / 2, y + 5, label, { size, color: isTarget ? "#ffffff" : INK, weight: "800" })
      );
    }

    if (targetPos && ask) {
      const cx = gap + (targetPos - 1) * (cellSize + gap) + cellSize / 2;
      const dir = ask === "左" ? -1 : 1;
      const arrowX = cx + dir * (cellSize * 0.9);
      parts.push(text(arrowX, y - cellSize / 2 - 12, ask === "左" ? "←" : "→", { size: 22, color: "#7c3aed" }));
    }

    parts.push(svgClose());
    return parts.join("");
  }

  // row_order — 一排位置，標出兩個對象的前後／上下相對關係
  const marks = Array.isArray(spec.marks) ? spec.marks.map(Number) : [];
  const labels = Array.isArray(spec.labels) ? spec.labels : [];
  const markColors = ["#f43f5e", "#3b82f6"];

  let cellSize = Math.floor((maxW - gap) / total) - gap;
  cellSize = Math.max(18, Math.min(34, cellSize));
  const w = total * (cellSize + gap) + gap;
  const y = 58;
  const h = y + cellSize / 2 + 42;

  const parts = [svgOpen(w, h), bgRect(w, h)];

  for (let i = 1; i <= total; i++) {
    const x = gap + (i - 1) * (cellSize + gap);
    const markIdx = marks.indexOf(i);
    const isMark = markIdx >= 0;
    const fill = isMark ? markColors[markIdx % markColors.length] : "#e5e7eb";
    parts.push(rectEl(x, y - cellSize / 2, cellSize, cellSize, { fill, stroke: INK, strokeWidth: 2, rx: 6 }));
    parts.push(
      text(x + cellSize / 2, y + 4, String(i), { size: 11, color: isMark ? "#ffffff" : "#6b7280", weight: "700" })
    );
    if (isMark && labels[markIdx]) {
      parts.push(
        text(x + cellSize / 2, y - cellSize / 2 - 10, labels[markIdx], {
          size: 13,
          color: markColors[markIdx % markColors.length],
          weight: "800",
        })
      );
    }
  }

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 13. array_model 乘法陣列圖
//     spec: { type:"array_model", rows, cols, mode?, icon?, color?, groupLabels?, unknownGroup? }
//     rows=幾組/幾列，cols=每組/每列幾個。
//     mode "grid"（預設）：純 rows×cols 圖示網格，乘法表用。
//     mode "addition"：陣列下方加一行 cols+cols+…=總數，服務「用加法算乘法」。
//     mode "commutative"：並排畫 rows×cols 與 cols×rows 兩個陣列，服務交換律。
//     mode "grouping"：改成一堆一堆、每堆有邊框區隔，服務除法啟蒙的分堆視覺；
//       給 unknownGroup（0-起算組別索引）可把該組畫成大大的「?」。
//     icon: "dot"（預設，同 pictogram 的預設圓形）| "star" | "square"。
//     groupLabels 長度需等於 rows，畫在每組上方（應用題情境標籤，不給就不顯示）。
// ---------------------------------------------------------------------------

/** 畫一個 rows×cols 的整齊圖示網格，回傳 { body, w, h }（相對於呼叫端指定的原點 0,0）。 */
function drawGridBlock({ rows, cols, iconType, color, cell = 30, r = 10 }) {
  const body = [];
  for (let rr = 0; rr < rows; rr++) {
    for (let cc = 0; cc < cols; cc++) {
      const cx = cell / 2 + cc * cell;
      const cy = cell / 2 + rr * cell;
      body.push(icon(iconType, cx, cy, r, color));
    }
  }
  return { body: body.join(""), w: cols * cell, h: rows * cell };
}

/** 畫一堆（一組）圖示，排成不超過 maxPerRow 欄的小網格，回傳 { body, w, h }。 */
function drawGroupBlock({ count, iconType, color, cell = 28, r = 9.5, maxPerRow = 5 }) {
  const perRow = Math.max(1, Math.min(maxPerRow, count || 1));
  const rowsN = Math.max(1, Math.ceil(count / perRow));
  const body = [];
  for (let i = 0; i < count; i++) {
    const cc = i % perRow;
    const rr = Math.floor(i / perRow);
    const cx = cell / 2 + cc * cell;
    const cy = cell / 2 + rr * cell;
    body.push(icon(iconType, cx, cy, r, color));
  }
  return { body: body.join(""), w: perRow * cell, h: rowsN * cell };
}

function renderArrayModel(spec) {
  const rows = clampInt(spec.rows, 1, 10, 1);
  const cols = clampInt(spec.cols, 1, 10, 1);
  const mode = ["grid", "addition", "commutative", "grouping"].includes(spec.mode)
    ? spec.mode
    : "grid";
  const iconType = ["dot", "star", "square"].includes(spec.icon) ? spec.icon : "dot";
  const color = typeof spec.color === "string" && spec.color ? spec.color : PALETTE[1];
  const groupLabels =
    Array.isArray(spec.groupLabels) && spec.groupLabels.length === rows ? spec.groupLabels : null;
  const hasUnknown = spec.unknownGroup !== undefined && spec.unknownGroup !== null;
  const unknownGroup =
    mode === "grouping" && hasUnknown ? clampInt(spec.unknownGroup, 0, rows - 1, -1) : -1;

  // ---- grid：純陣列 ----
  if (mode === "grid") {
    const cell = cols <= 6 && rows <= 6 ? 32 : 26;
    const r = cell * 0.32;
    const padX = 18;
    const padTop = 18;
    const { body, w: gridW, h: gridH } = drawGridBlock({ rows, cols, iconType, color, cell, r });
    const w = gridW + padX * 2;
    const h = gridH + padTop * 2;
    const parts = [svgOpen(w, h), bgRect(w, h)];
    parts.push(rectEl(padX - 6, padTop - 6, gridW + 12, gridH + 12, { fill: "#fafaf9", stroke: "#e5e7eb", strokeWidth: 2, rx: 10 }));
    parts.push(`<g transform="translate(${round(padX)},${round(padTop)})">${body}</g>`);
    parts.push(svgClose());
    return parts.join("");
  }

  // ---- addition：陣列 + 底下加法算式 ----
  if (mode === "addition") {
    const cell = cols <= 6 && rows <= 6 ? 30 : 24;
    const r = cell * 0.32;
    const padX = 18;
    const padTop = 18;
    const { body, w: gridW, h: gridH } = drawGridBlock({ rows, cols, iconType, color, cell, r });
    const total = rows * cols;
    const formula = `${Array(rows).fill(String(cols)).join(" + ")} = ${total}`;

    // 加法算式可能很長（rows 多），寬度先儘量長到 320 上限去容納，
    // 容納不下再縮小字級——確保算式不會被畫布裁掉。
    const MONO_CHAR_W = 0.62; // 等寬字型單字元寬度約為字級的比例
    const maxW = 320;
    let w = Math.min(maxW, Math.max(gridW + padX * 2, 200));
    let fontSize = 16;
    const estFormulaW = (str, size) => str.length * size * MONO_CHAR_W;
    if (estFormulaW(formula, fontSize) + 24 > w) {
      w = Math.min(maxW, Math.max(w, estFormulaW(formula, fontSize) + 24));
    }
    if (estFormulaW(formula, fontSize) + 24 > w) {
      fontSize = Math.max(9, Math.floor(((w - 24) / formula.length) / MONO_CHAR_W));
    }

    const formulaY = padTop + gridH + 30;
    const h = formulaY + 14;

    const parts = [svgOpen(w, h), bgRect(w, h)];
    parts.push(rectEl(padX - 6, padTop - 6, gridW + 12, gridH + 12, { fill: "#fafaf9", stroke: "#e5e7eb", strokeWidth: 2, rx: 10 }));
    const gridX = (w - gridW) / 2;
    parts.push(`<g transform="translate(${round(gridX)},${round(padTop)})">${body}</g>`);
    parts.push(text(w / 2, formulaY, formula, { size: fontSize, color: "#7c2d12", weight: "800", family: MONO }));
    parts.push(svgClose());
    return parts.join("");
  }

  // ---- commutative：rows×cols 與 cols×rows 並排對照 ----
  if (mode === "commutative") {
    const padX = 16;
    const padTop = 40;
    const gap = 40;
    // 兩個陣列並排、寬度合計必須 <= 320：先算出每邊可用的預算，
    // 反推 cell 大小（較大的一邊 = max(rows, cols) 個 icon 寬）。
    const sideBudget = (320 - padX * 2 - gap) / 2;
    const maxDim = Math.max(rows, cols);
    const cell = Math.max(10, Math.min(26, Math.floor(sideBudget / maxDim)));
    const r = cell * 0.32;
    const colorA = color;
    const colorB = PALETTE[4];
    const left = drawGridBlock({ rows, cols, iconType, color: colorA, cell, r });
    const right = drawGridBlock({ rows: cols, cols: rows, iconType, color: colorB, cell, r });

    const blockH = Math.max(left.h, right.h);
    const w = padX * 2 + left.w + gap + right.w;
    const h = padTop + blockH + 34;

    const leftY = padTop + (blockH - left.h) / 2;
    const rightX = padX + left.w + gap;
    const rightY = padTop + (blockH - right.h) / 2;

    const parts = [svgOpen(w, h), bgRect(w, h)];
    parts.push(rectEl(padX - 6, leftY - 6, left.w + 12, left.h + 12, { fill: "#fafaf9", stroke: colorA, strokeWidth: 2, rx: 10 }));
    parts.push(rectEl(rightX - 6, rightY - 6, right.w + 12, right.h + 12, { fill: "#fafaf9", stroke: colorB, strokeWidth: 2, rx: 10 }));
    parts.push(`<g transform="translate(${round(padX)},${round(leftY)})">${left.body}</g>`);
    parts.push(`<g transform="translate(${round(rightX)},${round(rightY)})">${right.body}</g>`);

    parts.push(text(padX + left.w / 2, padTop - 14, `${rows} × ${cols}`, { size: 15, color: colorA, weight: "800" }));
    parts.push(text(rightX + right.w / 2, padTop - 14, `${cols} × ${rows}`, { size: 15, color: colorB, weight: "800" }));
    parts.push(text((padX + left.w + rightX) / 2, padTop + blockH / 2 + 5, "=", { size: 26, color: INK, weight: "800" }));

    const total = rows * cols;
    parts.push(
      text(w / 2, h - 10, `總數都是 ${total} 個`, { size: 13, color: "#374151", weight: "700" })
    );

    parts.push(svgClose());
    return parts.join("");
  }

  // ---- grouping：分堆呈現（除法啟蒙），每組有邊框；unknownGroup 畫成「?」 ----
  {
    const cell = cols <= 5 ? 28 : 22;
    const r = cell * 0.34;
    const pad = 10;
    const groupGap = 18;
    const labelH = groupLabels ? 20 : 0;
    const qMarkBoxSize = Math.max(cell * Math.min(cols, 5), cell) + pad * 2;

    // 先算每組區塊尺寸，佈局成一列（若太寬則自動換行）
    const blocks = [];
    for (let g = 0; g < rows; g++) {
      if (g === unknownGroup) {
        blocks.push({ isUnknown: true, w: qMarkBoxSize, h: qMarkBoxSize });
      } else {
        const { body, w: gw, h: gh } = drawGroupBlock({ count: cols, iconType, color, cell, r, maxPerRow: 5 });
        blocks.push({ isUnknown: false, body, w: gw + pad * 2, h: gh + pad * 2 });
      }
    }

    const maxColsPerRow = 4;
    const blockGap = 16;
    const rowsOfBlocks = [];
    for (let i = 0; i < blocks.length; i += maxColsPerRow) {
      rowsOfBlocks.push(blocks.slice(i, i + maxColsPerRow));
    }

    const rowHeights = rowsOfBlocks.map((rowBlocks) => Math.max(...rowBlocks.map((b) => b.h)) + labelH);
    const rowWidths = rowsOfBlocks.map(
      (rowBlocks) => rowBlocks.reduce((s, b) => s + b.w, 0) + blockGap * (rowBlocks.length - 1)
    );
    const w = Math.min(320, Math.max(...rowWidths) + groupGap * 2);
    const h = rowHeights.reduce((s, rh) => s + rh, 0) + groupGap * (rowsOfBlocks.length + 1);

    const parts = [svgOpen(w, h), bgRect(w, h)];

    let y = groupGap;
    let gIdx = 0;
    rowsOfBlocks.forEach((rowBlocks, rIdx) => {
      const rowW = rowWidths[rIdx];
      let x = (w - rowW) / 2;
      const rowH = rowHeights[rIdx];
      rowBlocks.forEach((b) => {
        const label = groupLabels ? groupLabels[gIdx] : null;
        if (label) {
          parts.push(text(x + b.w / 2, y + 13, label, { size: 12, color: "#7c2d12", weight: "800" }));
        }
        const boxY = y + labelH;
        if (b.isUnknown) {
          parts.push(
            rectEl(x, boxY, b.w, b.h, {
              fill: "#fef3c7",
              stroke: "#f59e0b",
              strokeWidth: 3,
              rx: 12,
              dash: "7,5",
            })
          );
          parts.push(
            text(x + b.w / 2, boxY + b.h / 2 + 12, "?", { size: 34, color: "#b45309", weight: "800" })
          );
        } else {
          parts.push(rectEl(x, boxY, b.w, b.h, { fill: "#ffffff", stroke: "#9ca3af", strokeWidth: 2.5, rx: 12 }));
          parts.push(`<g transform="translate(${round(x + pad)},${round(boxY + pad)})">${b.body}</g>`);
        }
        x += b.w + blockGap;
        gIdx++;
      });
      y += rowH + groupGap;
    });

    parts.push(svgClose());
    return parts.join("");
  }
}

// ---------------------------------------------------------------------------
// 14. line_relation 兩線關係（垂直／平行）
//     spec: { type:"line_relation", relation, showMark?, labels? }
//     relation: "perpendicular"（垂直相交＋直角記號）| "parallel"（平行＋方向箭頭對）
//     服務 G2-17-02／G4-12-01（垂直線）與 G4-12-02（平行線），只需要小二/小四
//     程度「兩線相交／平行」的視覺辨識，不做點到直線距離的進階構圖。
//     showMark 預設 true。labels 是可選的兩個線段名稱（如 ["甲","乙"]）。
// ---------------------------------------------------------------------------

function renderLineRelation(spec) {
  const relation = spec.relation === "parallel" ? "parallel" : "perpendicular";
  const showMark = spec.showMark === false ? false : true;
  const labels = Array.isArray(spec.labels) && spec.labels.length === 2 ? spec.labels : null;

  if (relation === "perpendicular") {
    const w = 240;
    const h = 200;
    const cx = 120;
    const cy = 105;
    const half = 85;

    const parts = [svgOpen(w, h), bgRect(w, h)];

    // 兩條線段垂直相交
    parts.push(lineEl(cx - half, cy, cx + half, cy, { stroke: "#2563eb", width: 5 }));
    parts.push(lineEl(cx, cy - half, cx, cy + half, { stroke: "#dc2626", width: 5 }));

    if (showMark) {
      const s = 16;
      parts.push(
        `<path d="M ${round(cx)} ${round(cy - s)} L ${round(cx + s)} ${round(cy - s)} L ${round(
          cx + s
        )} ${round(cy)}" fill="none" stroke="${INK}" stroke-width="2.5"/>`
      );
    }

    if (labels) {
      parts.push(text(cx + half + 12, cy + 5, labels[0], { size: 15, color: "#2563eb", weight: "800" }));
      parts.push(text(cx + 18, cy - half - 6, labels[1], { size: 15, color: "#dc2626", weight: "800" }));
    }

    parts.push(svgClose());
    return parts.join("");
  }

  // parallel — 兩條同方向、不相交的線段，用同向箭頭記號提示「平行＝同方向」
  const w = 250;
  const h = 185;
  const line1 = { x1: 20, y1: 145, x2: 170, y2: 55 };
  const line2 = { x1: 50, y1: 165, x2: 200, y2: 75 }; // 與 line1 同方向向量，整體平移

  const parts = [svgOpen(w, h), bgRect(w, h)];
  parts.push(lineEl(line1.x1, line1.y1, line1.x2, line1.y2, { stroke: "#2563eb", width: 5 }));
  parts.push(lineEl(line2.x1, line2.y1, line2.x2, line2.y2, { stroke: "#dc2626", width: 5 }));

  if (showMark) {
    const angle = Math.atan2(line1.y2 - line1.y1, line1.x2 - line1.x1);
    const arrowAt = (ln, color) => {
      const mx = ln.x1 + (ln.x2 - ln.x1) * 0.55;
      const my = ln.y1 + (ln.y2 - ln.y1) * 0.55;
      return arrowHead(mx, my, angle, 13, color);
    };
    parts.push(arrowAt(line1, "#2563eb"));
    parts.push(arrowAt(line2, "#dc2626"));
  }

  if (labels) {
    parts.push(
      text(line1.x2 + 10, line1.y2 + 4, labels[0], { size: 15, color: "#2563eb", weight: "800", anchor: "start" })
    );
    parts.push(
      text(line2.x2 + 10, line2.y2 + 4, labels[1], { size: 15, color: "#dc2626", weight: "800", anchor: "start" })
    );
  }

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 15. shape_dimension 標邊長的矩形
//     spec: { type:"shape_dimension", width, height, unit?, showArea?, showPerimeter? }
//     沒有 shape 參數分正方形/矩形——正方形時呼叫端自己傳 width=height。
//     showArea/showPerimeter 開啟時顯示「計算式本身」（如「面積 = 6 × 4」），
//     不直接顯示答案數字，讓孩子看到怎麼算。unit 預設「公分」。
//     服務 G4 周長與面積章公式化計算約 11 個技能。
// ---------------------------------------------------------------------------

function renderShapeDimension(spec) {
  const width = Math.max(numOr(spec.width, 1), 0.1);
  const height = Math.max(numOr(spec.height, 1), 0.1);
  const unit = spec.unit || "公分";
  const showArea = !!spec.showArea;
  const showPerimeter = !!spec.showPerimeter;

  // 矩形不必嚴格照數值等比例縮放（否則極端長寬比會畫得很怪），
  // 用固定的「每單位像素」並各自夾在可讀範圍內即可，重點是數字看得清楚。
  const rectW = Math.min(200, Math.max(50, width * 16));
  const rectH = Math.min(130, Math.max(50, height * 16));

  const padLeft = 56;
  const padTop = 42;
  const w = padLeft + rectW + 26;

  const formulas = [];
  if (showPerimeter) formulas.push(`周長 = (${round(width)} + ${round(height)}) × 2`);
  if (showArea) formulas.push(`面積 = ${round(width)} × ${round(height)}`);

  const formulaBlockH = formulas.length ? formulas.length * 22 + 16 : 8;
  const h = padTop + rectH + formulaBlockH + 20;

  const parts = [svgOpen(w, h), bgRect(w, h)];

  parts.push(rectEl(padLeft, padTop, rectW, rectH, { fill: "#bfdbfe", stroke: INK, strokeWidth: 4, rx: 4 }));

  // 上緣：寬度標註（含端點小刻度）
  parts.push(lineEl(padLeft, padTop - 12, padLeft + rectW, padTop - 12, { stroke: "#374151", width: 2 }));
  parts.push(lineEl(padLeft, padTop - 18, padLeft, padTop - 6, { stroke: "#374151", width: 2 }));
  parts.push(lineEl(padLeft + rectW, padTop - 18, padLeft + rectW, padTop - 6, { stroke: "#374151", width: 2 }));
  parts.push(
    text(padLeft + rectW / 2, padTop - 22, `${round(width)} ${unit}`, { size: 15, weight: "800", color: "#1d4ed8" })
  );

  // 左緣：高度標註（旋轉文字）
  parts.push(lineEl(padLeft - 12, padTop, padLeft - 12, padTop + rectH, { stroke: "#374151", width: 2 }));
  parts.push(lineEl(padLeft - 18, padTop, padLeft - 6, padTop, { stroke: "#374151", width: 2 }));
  parts.push(lineEl(padLeft - 18, padTop + rectH, padLeft - 6, padTop + rectH, { stroke: "#374151", width: 2 }));
  const hLabelX = padLeft - 24;
  const hLabelY = padTop + rectH / 2;
  parts.push(
    `<text x="${round(hLabelX)}" y="${round(hLabelY)}" font-size="15" font-weight="800" fill="#b91c1c" text-anchor="middle" transform="rotate(-90 ${round(
      hLabelX
    )} ${round(hLabelY)})">${esc(`${round(height)} ${unit}`)}</text>`
  );

  // 計算式（不直接給答案）
  let fy = padTop + rectH + 32;
  formulas.forEach((f) => {
    parts.push(text(w / 2, fy, f, { size: 15, color: "#166534", weight: "800", family: MONO }));
    fy += 22;
  });

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 16. capacity_container 量杯/容器刻度圖
//     spec: { type:"capacity_container", capacity, filled, unit?, maxScale? }
//     滿刻度＝maxScale；不給就自動取 capacity 往上取整的下一個整數刻度
//     （capacity<100 取到十位、capacity>=100 取到百位，例：350→400）。
//     液面畫在 filled 對應的刻度高度。**不顯示 filled 的數字**——這是刻度
//     讀數題的答案，孩子要靠數刻度線自己讀出來，跟 balance_scale 直接顯示
//     重量數字的設計刻意不同。unit 預設「毫升」。
//     服務 G3 公升和毫升章刻度讀數共 4 個技能。
// ---------------------------------------------------------------------------

function renderCapacityContainer(spec) {
  const capacity = Math.max(numOr(spec.capacity, 1), 0.1);
  const filled = Math.max(numOr(spec.filled, 0), 0);
  const unit = spec.unit || "毫升";

  let maxScale = numOr(spec.maxScale, NaN);
  if (!Number.isFinite(maxScale) || maxScale <= 0) {
    maxScale = capacity < 100 ? Math.ceil(capacity / 10) * 10 : Math.ceil(capacity / 100) * 100;
  }
  if (maxScale < capacity) maxScale = capacity; // 保底：滿刻度不能低於容量本身

  const w = 220;
  const contH = 150;
  const padTop = 18;
  const yTop = padTop;
  const yBot = padTop + contH;
  const cx = 75;
  const topHalf = 55;
  const botHalf = 40;
  const xTopL = cx - topHalf;
  const xTopR = cx + topHalf;
  const xBotL = cx - botHalf;
  const xBotR = cx + botHalf;

  const wallX = (y, side) => {
    const t = (y - yTop) / contH;
    const l = xTopL + t * (xBotL - xTopL);
    const r = xTopR + t * (xBotR - xTopR);
    return side === "left" ? l : r;
  };

  const h = yBot + 30;
  const parts = [svgOpen(w, h), bgRect(w, h)];

  // 液面（先畫，容器外框線再蓋上去，邊緣比較乾淨）
  const frac = Math.min(1, Math.max(0, filled / maxScale));
  const yFill = yBot - frac * contH;
  if (frac > 0) {
    const lft = wallX(yFill, "left");
    const rgt = wallX(yFill, "right");
    parts.push(
      `<path d="M ${round(lft)} ${round(yFill)} L ${round(rgt)} ${round(yFill)} L ${round(xBotR)} ${round(
        yBot
      )} L ${round(xBotL)} ${round(yBot)} Z" fill="#7dd3fc" fill-opacity="0.75" stroke="none"/>`
    );
    parts.push(lineEl(lft, yFill, rgt, yFill, { stroke: "#0284c7", width: 3 }));
  }

  // 容器外框（上寬下窄的梯形，開口朝上）
  parts.push(
    `<path d="M ${round(xTopL)} ${round(yTop)} L ${round(xTopR)} ${round(yTop)} L ${round(xBotR)} ${round(
      yBot
    )} L ${round(xBotL)} ${round(yBot)} Z" fill="none" stroke="${INK}" stroke-width="4"/>`
  );
  parts.push(lineEl(xBotL, yBot, xBotR, yBot, { stroke: INK, width: 5 }));

  // 刻度：4 等分（5 條刻度線＋數字），視覺上刻度要好讀
  const tickCount = 4;
  for (let i = 0; i <= tickCount; i++) {
    const f = i / tickCount;
    const y = yBot - f * contH;
    const rightX = wallX(y, "right");
    const value = round(maxScale * f);
    parts.push(lineEl(rightX, y, rightX + 12, y, { stroke: "#374151", width: 2 }));
    parts.push(text(rightX + 30, y + 4, String(value), { size: 12, color: "#374151", weight: "700" }));
  }

  parts.push(text(cx, h - 8, unit, { size: 12, color: "#6b7280", weight: "700" }));

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 17. balance_scale 天平
//     spec: { type:"balance_scale", leftWeight, rightWeight, leftLabel?, rightLabel?, unit? }
//     元件自己依 leftWeight/rightWeight 大小判斷畫平衡／左傾／右傾（呼叫端
//     不用算好角度）。leftLabel/rightLabel 是可選文字，標在對應那端的托盤
//     上；不給就只顯示重量數字。unit 預設「克」。
//     服務 G3 公斤和公克章重量比較共 4 個技能。
// ---------------------------------------------------------------------------

function renderBalanceScale(spec) {
  const leftWeight = Math.max(numOr(spec.leftWeight, 0), 0);
  const rightWeight = Math.max(numOr(spec.rightWeight, 0), 0);
  const unit = spec.unit || "克";
  const leftLabel = typeof spec.leftLabel === "string" && spec.leftLabel ? spec.leftLabel : null;
  const rightLabel = typeof spec.rightLabel === "string" && spec.rightLabel ? spec.rightLabel : null;

  const w = 260;
  const h = 196;
  const fulcrumX = 130;
  const fulcrumY = 70;
  const beamHalfLen = 85;
  const dropDistance = 34;
  const panTopHalf = 24;
  const panBotHalf = 16;
  const panH = 20;

  // 只判斷方向（左傾／右傾／平衡），傾斜幅度固定，不必跟重量差成正比
  const tiltRad = (11 * Math.PI) / 180;
  let theta = 0;
  if (leftWeight > rightWeight) theta = -tiltRad;
  else if (rightWeight > leftWeight) theta = tiltRad;

  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const leftEnd = { x: fulcrumX - beamHalfLen * cosT, y: fulcrumY - beamHalfLen * sinT };
  const rightEnd = { x: fulcrumX + beamHalfLen * cosT, y: fulcrumY + beamHalfLen * sinT };

  const parts = [svgOpen(w, h), bgRect(w, h)];

  // 底座（三角柱＋底板）
  const standBaseY = fulcrumY + 92;
  parts.push(
    `<polygon points="${round(fulcrumX)},${round(fulcrumY + 6)} ${round(fulcrumX - 34)},${round(
      standBaseY
    )} ${round(fulcrumX + 34)},${round(standBaseY)}" fill="#a8a29e" stroke="${INK}" stroke-width="3"/>`
  );
  parts.push(rectEl(fulcrumX - 44, standBaseY, 88, 10, { fill: "#78716c", stroke: INK, strokeWidth: 3, rx: 4 }));

  // 橫樑
  parts.push(lineEl(leftEnd.x, leftEnd.y, rightEnd.x, rightEnd.y, { stroke: INK, width: 6 }));
  // 支點
  parts.push(circleEl(fulcrumX, fulcrumY, 7, { fill: "#f59e0b", stroke: INK, strokeWidth: 2 }));

  const drawPan = (end, weight, label, color) => {
    const px = end.x;
    const py = end.y + dropDistance;
    parts.push(lineEl(end.x, end.y, px - panTopHalf, py, { stroke: "#78716c", width: 2 }));
    parts.push(lineEl(end.x, end.y, px + panTopHalf, py, { stroke: "#78716c", width: 2 }));
    parts.push(
      `<path d="M ${round(px - panTopHalf)} ${round(py)} L ${round(px + panTopHalf)} ${round(py)} L ${round(
        px + panBotHalf
      )} ${round(py + panH)} L ${round(px - panBotHalf)} ${round(py + panH)} Z" fill="${color}" stroke="${INK}" stroke-width="3"/>`
    );
    let ty = py + panH + 15;
    if (label) {
      parts.push(text(px, ty, label, { size: 12, color: "#374151", weight: "700" }));
      ty += 15;
    }
    parts.push(text(px, ty, `${round(weight)}${unit}`, { size: 13, color: INK, weight: "800" }));
  };

  drawPan(leftEnd, leftWeight, leftLabel, "#93c5fd");
  drawPan(rightEnd, rightWeight, rightLabel, "#fca5a5");

  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 18. fraction_model 分數／小數部分-全體表徵
//     spec: { type:"fraction_model", numerator, denominator, shape?, color?, compare?, showLabel? }
//     shape: "circle"（預設，圓形切片）| "bar"（長條分割）| "grid"（10 或 10×10 方格著色，
//       只用於分母是 10 或 100 的小數對應情境）。
//     numerator 可以大於 denominator（假分數/帶分數）：內部自動拆成
//       floor(numerator/denominator) 個全滿圖形 ＋（餘數 > 0 時再加）1 個部分圖形
//       （畫 numerator%denominator/denominator），並排顯示，呼叫端不用自己算。
//     compare 是可選的額外分數陣列 [{numerator,denominator}]，接在本體那組後面
//       並排比較（本體算第一組，不用重複放進 compare）。同一種 shape 下，「一個
//       完整圖形」的大小（圓的半徑／長條的長度／方格的格子大小）對所有組別都一樣，
//       才能讓孩子從面積/長度直接感覺出分數大小，不會因為分母不同而誤判。
//     showLabel 預設 true，圖形下方用堆疊分子/分母＋橫線畫出分數記號（不用斜線
//       文字），標的是呼叫端傳入的原始 numerator/denominator（不做約分、不轉帶分數）。
//     服務 G3/G4 分數與部分小數表徵共 24 個技能，見 figure-specs.json。
// ---------------------------------------------------------------------------

const FRACTION_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7"];

/**
 * 把一組 numerator/denominator 拆成要畫的「圖形單位」清單：
 * [{ filled, denom }...]，每個單位是一個完整的表徵圖形（圓/長條/方格）。
 * numerator<=denominator 時只有一個單位（含 numerator===denominator 剛好一個全滿
 * 圖形的情況）；大於時是若干個全滿單位 + 最多一個部分單位（餘數為 0 就不畫，
 * 例如 8/4 只畫 2 個全滿圖形，不會多畫一個空的）。
 * wholes 安全上限 6 個，避免離譜輸入（如 numerator=9999）把版面撐爆。
 */
function splitFractionUnits(numerator, denominator) {
  const n = Math.max(0, Math.round(numOr(numerator, 0)));
  const d = Math.max(1, Math.round(numOr(denominator, 1)));
  if (n <= d) return { units: [{ filled: n, denom: d }] };
  const wholes = Math.min(6, Math.floor(n / d));
  const remainder = n - wholes * d;
  const units = Array(wholes)
    .fill(null)
    .map(() => ({ filled: d, denom: d }));
  if (remainder > 0) units.push({ filled: remainder, denom: d });
  return { units };
}

/** 單一「完整圖形」在未縮放前的基準尺寸（bounding box 左上角原點）。 */
function fractionUnitSize(shape, denom) {
  if (shape === "bar") return { w: 108, h: 32 };
  if (shape === "grid") {
    const cell = 14;
    if (denom <= 10) return { w: denom * cell, h: cell, cols: denom, rows: 1, cell };
    const cols = 10;
    const rows = Math.ceil(denom / cols);
    return { w: cols * cell, h: rows * cell, cols, rows, cell };
  }
  return { w: 84, h: 84, r: 42 }; // circle
}

/** 圓形切片：denom 等分，前 filled 片塗色，一律畫出全部分割線（即使全滿也要看得出幾等分）。 */
function drawFractionCircle(cx, cy, r, filled, denom, color) {
  const parts = [];
  if (denom <= 1) {
    parts.push(circleEl(cx, cy, r, { fill: filled > 0 ? color : "#ffffff", stroke: INK, strokeWidth: 2.5 }));
    return parts.join("");
  }
  for (let i = 0; i < denom; i++) {
    const a0 = ((-90 + (i * 360) / denom) * Math.PI) / 180;
    const a1 = ((-90 + ((i + 1) * 360) / denom) * Math.PI) / 180;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = 360 / denom > 180 ? 1 : 0;
    const fill = i < filled ? color : "#ffffff";
    parts.push(
      `<path d="M ${round(cx)} ${round(cy)} L ${round(x0)} ${round(y0)} A ${round(r)} ${round(
        r
      )} 0 ${large} 1 ${round(x1)} ${round(y1)} Z" fill="${fill}" stroke="${INK}" stroke-width="2"/>`
    );
  }
  parts.push(circleEl(cx, cy, r, { stroke: INK, strokeWidth: 2.5 }));
  return parts.join("");
}

/** 長條分割：denom 等分直條，前 filled 段塗色。 */
function drawFractionBar(x, y, w, h, filled, denom, color) {
  const parts = [];
  const segW = w / denom;
  for (let i = 0; i < denom; i++) {
    const fill = i < filled ? color : "#ffffff";
    parts.push(rectEl(x + i * segW, y, segW, h, { fill, stroke: INK, strokeWidth: 1.6 }));
  }
  parts.push(rectEl(x, y, w, h, { stroke: INK, strokeWidth: 2.5, rx: 4 }));
  return parts.join("");
}

/** 方格著色：cols×rows 個小格，row-major 順序前 filled 格塗色。 */
function drawFractionGrid(x, y, cell, cols, rows, filled, color) {
  const parts = [];
  for (let i = 0; i < cols * rows; i++) {
    const cc = i % cols;
    const rr = Math.floor(i / cols);
    const fill = i < filled ? color : "#ffffff";
    parts.push(rectEl(x + cc * cell, y + rr * cell, cell, cell, { fill, stroke: INK, strokeWidth: 1 }));
  }
  parts.push(rectEl(x, y, cols * cell, rows * cell, { stroke: INK, strokeWidth: 2.2 }));
  return parts.join("");
}

function drawFractionUnit(shape, x, y, unit, filled, denom, color) {
  if (shape === "bar") return drawFractionBar(x, y, unit.w, unit.h, filled, denom, color);
  if (shape === "grid") return drawFractionGrid(x, y, unit.cell, unit.cols, unit.rows, filled, color);
  const r = unit.r;
  return drawFractionCircle(x + r, y + r, r, filled, denom, color);
}

/** 堆疊分數記號：分子在上、一條橫線、分母在下（不用斜線 3/4 文字寫法）。 */
function fractionStackedLabel(cx, topY, numerator, denominator, opts = {}) {
  const { size = 16, color = INK } = opts;
  const digits = Math.max(String(numerator).length, String(denominator).length);
  const lineHalf = Math.max(10, digits * size * 0.32);
  const numY = topY + size;
  const lineY = numY + 5;
  const denY = lineY + size + 3;
  return (
    text(cx, numY, String(numerator), { size, color, weight: "800" }) +
    lineEl(cx - lineHalf, lineY, cx + lineHalf, lineY, { stroke: color, width: 2.4 }) +
    text(cx, denY, String(denominator), { size, color, weight: "800" })
  );
}

function renderFractionModel(spec) {
  const shape = ["circle", "bar", "grid"].includes(spec.shape) ? spec.shape : "circle";
  const showLabel = spec.showLabel !== false;
  const compareList = Array.isArray(spec.compare) ? spec.compare : [];
  const groupsInput = [{ numerator: spec.numerator, denominator: spec.denominator }, ...compareList];

  const groups = groupsInput.map((g, gi) => {
    const denom = clampInt(g.denominator, 1, 200, 1);
    const numerator = clampInt(g.numerator, 0, 2000, 0);
    const { units } = splitFractionUnits(numerator, denom);
    const unitSize = fractionUnitSize(shape, denom);
    const color =
      typeof spec.color === "string" && spec.color ? spec.color : FRACTION_COLORS[gi % FRACTION_COLORS.length];
    return { numerator, denom, units, unitSize, color };
  });

  const innerGap = shape === "grid" ? 4 : 10;
  const groupGap = 26;
  const budget = 296;

  const naturalGroupWidths = groups.map(
    (g) => g.unitSize.w * g.units.length + innerGap * Math.max(0, g.units.length - 1)
  );
  const naturalContentW =
    naturalGroupWidths.reduce((s, gw) => s + gw, 0) + groupGap * Math.max(0, groups.length - 1);
  const scale = naturalContentW > budget ? Math.max(0.4, budget / naturalContentW) : 1;

  const sInnerGap = innerGap * scale;
  const sGroupGap = groupGap * scale;
  const labelFontSize = Math.max(11, 16 * scale);
  const labelH = showLabel ? Math.round(labelFontSize * 2 + 18) : 10;

  const maxUnitH = Math.max(...groups.map((g) => g.unitSize.h)) * scale;
  const padTop = 14;
  const padX = 14;

  const bodyParts = [];
  let x = padX;

  groups.forEach((g) => {
    const uw = g.unitSize.w * scale;
    const uh = g.unitSize.h * scale;
    const groupW = uw * g.units.length + sInnerGap * Math.max(0, g.units.length - 1);
    const groupTop = padTop + (maxUnitH - uh) / 2;

    let ux = x;
    g.units.forEach((unit) => {
      const scaledUnit =
        shape === "grid"
          ? { ...g.unitSize, w: uw, h: uh, cell: g.unitSize.cell * scale }
          : shape === "bar"
          ? { w: uw, h: uh }
          : { r: g.unitSize.r * scale };
      bodyParts.push(drawFractionUnit(shape, ux, groupTop, scaledUnit, unit.filled, unit.denom, g.color));
      ux += uw + sInnerGap;
    });

    if (showLabel) {
      const labelCx = x + groupW / 2;
      bodyParts.push(
        fractionStackedLabel(labelCx, padTop + maxUnitH + 8, g.numerator, g.denom, {
          size: labelFontSize,
          color: g.color,
        })
      );
    }

    x += groupW + sGroupGap;
  });

  const w = Math.min(320, Math.round(x - sGroupGap + padX));
  const h = Math.round(padTop + maxUnitH + labelH);

  const parts = [svgOpen(w, h), bgRect(w, h), ...bodyParts, svgClose()];
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 20. grid_tiling 拼砌／分割格板
// ---------------------------------------------------------------------------
function renderGridTiling(spec) {
  const cols = clampInt(spec.cols, 2, 8, 4);
  const rows = clampInt(spec.rows, 2, 8, 3);
  const filled = clampInt(spec.filled, 0, cols * rows, 0);
  const color = typeof spec.color === "string" ? spec.color : "#60a5fa";
  const cell = Math.min(52, Math.floor(280 / Math.max(cols, rows)));
  const w = cols * cell + 24;
  const h = rows * cell + 24;
  const parts = [svgOpen(w, h), bgRect(w, h)];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c;
    parts.push(rectEl(12 + c * cell, 12 + r * cell, cell, cell, { fill: i < filled ? color : "#fff", stroke: INK, strokeWidth: 3, rx: 3 }));
  }
  parts.push(svgClose());
  return parts.join("");
}

// ---------------------------------------------------------------------------
// 21. solid_shape 立體圖形（等角投影三面／圓柱）
// ---------------------------------------------------------------------------
function renderSolidShape(spec) {
  const shape = ["cube", "cylinder", "triangular_prism"].includes(spec.shape) ? spec.shape : "cube";
  const color = typeof spec.color === "string" ? spec.color : "#60a5fa";
  const w = 260, h = 190, p = [svgOpen(w, h), bgRect(w, h)];
  if (shape === "cylinder") {
    p.push(`<ellipse cx="130" cy="45" rx="58" ry="20" fill="#bfdbfe" stroke="${INK}" stroke-width="3"/>`);
    p.push(rectEl(72,45,116,92,{fill:color,stroke:INK,strokeWidth:3}));
    p.push(`<ellipse cx="130" cy="137" rx="58" ry="20" fill="${color}" stroke="${INK}" stroke-width="3"/>`);
  } else if (shape === "triangular_prism") {
    p.push(`<polygon points="60,140 118,45 118,140" fill="#bfdbfe" stroke="${INK}" stroke-width="3"/>`);
    p.push(`<polygon points="118,45 196,75 196,140 118,140" fill="${color}" stroke="${INK}" stroke-width="3"/>`);
    p.push(`<polygon points="60,140 118,140 196,140 138,170" fill="#93c5fd" stroke="${INK}" stroke-width="3"/>`);
  } else {
    p.push(`<polygon points="72,68 136,32 202,68 138,105" fill="#dbeafe" stroke="${INK}" stroke-width="3"/>`);
    p.push(`<polygon points="72,68 138,105 138,172 72,135" fill="#93c5fd" stroke="${INK}" stroke-width="3"/>`);
    p.push(`<polygon points="138,105 202,68 202,135 138,172" fill="${color}" stroke="${INK}" stroke-width="3"/>`);
  }
  p.push(svgClose()); return p.join("");
}

// ---------------------------------------------------------------------------
// 22. life_scene 生活情境卡（純 SVG；不依賴外部圖片或網路）
// ---------------------------------------------------------------------------
function renderLifeScene(spec) {
  const scene = ["house", "window", "pizza", "clock", "breakfast", "school", "lunch", "sleep"].includes(spec.scene)
    ? spec.scene : "house";
  const focus = ["triangle", "circle", "square", "rectangle"].includes(spec.focusShape) ? spec.focusShape : null;
  const hi = typeof spec.highlight === "string" ? spec.highlight : "#e11d48";
  const w = 300, h = 190, p = [svgOpen(w, h), bgRect(w, h, "#fffdf5")];
  const mark = (x, y, rw, rh, rx = 10) => p.push(rectEl(x, y, rw, rh, { fill: "none", stroke: hi, strokeWidth: 5, rx }));
  const sun = (cx, cy) => {
    p.push(circleEl(cx, cy, 18, { fill: "#fde047", stroke: "#f59e0b", strokeWidth: 3 }));
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; p.push(lineEl(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26, cx + Math.cos(a) * 35, cy + Math.sin(a) * 35, { stroke: "#f59e0b", width: 3 })); }
  };
  const moon = (cx, cy) => { p.push(circleEl(cx, cy, 22, { fill: "#c4b5fd" })); p.push(circleEl(cx + 10, cy - 7, 22, { fill: "#1e293b" })); };
  const person = (cx, cy, color = "#60a5fa") => {
    p.push(circleEl(cx, cy - 22, 11, { fill: "#fed7aa", stroke: INK, strokeWidth: 2 }));
    p.push(rectEl(cx - 13, cy - 9, 26, 35, { fill: color, stroke: INK, strokeWidth: 2, rx: 8 }));
    p.push(lineEl(cx - 8, cy + 26, cx - 13, cy + 43, { width: 4 })); p.push(lineEl(cx + 8, cy + 26, cx + 13, cy + 43, { width: 4 }));
  };
  if (scene === "house") {
    p.push(`<polygon points="65,105 150,35 235,105" fill="#fb7185" stroke="${INK}" stroke-width="3"/>`);
    p.push(rectEl(70, 105, 160, 60, { fill: "#bfdbfe", stroke: INK, strokeWidth: 3 }));
    p.push(rectEl(135, 120, 32, 45, { fill: "#a16207", stroke: INK, strokeWidth: 3 }));
    p.push(rectEl(88, 120, 35, 30, { fill: "#fef08a", stroke: INK, strokeWidth: 3 }));
    if (focus === "triangle") mark(58, 27, 184, 87); else if (focus === "rectangle") mark(129, 114, 44, 57); else if (focus === "square") mark(82, 114, 47, 42);
  } else if (scene === "window") {
    p.push(rectEl(85, 30, 130, 130, { fill: "#93c5fd", stroke: "#92400e", strokeWidth: 12, rx: 3 }));
    p.push(lineEl(150, 35, 150, 155, { stroke: "#fef3c7", width: 7 })); p.push(lineEl(90, 95, 210, 95, { stroke: "#fef3c7", width: 7 }));
    if (focus === "square") mark(87, 32, 61, 61, 2); else if (focus === "rectangle") mark(152, 98, 61, 61, 2);
  } else if (scene === "pizza") {
    p.push(circleEl(150, 97, 67, { fill: "#fbbf24", stroke: "#b45309", strokeWidth: 5 }));
    [[123,75],[174,73],[141,119],[184,119]].forEach(([x,y]) => p.push(circleEl(x,y,8,{fill:"#ef4444",stroke:"#991b1b",strokeWidth:2})));
    p.push(`<polygon points="150,97 205,68 184,135" fill="#fcd34d" stroke="${INK}" stroke-width="3"/>`);
    if (focus === "circle") mark(76, 23, 148, 148, 74); else if (focus === "triangle") p.push(`<polygon points="150,97 205,68 184,135" fill="none" stroke="${hi}" stroke-width="5"/>`);
  } else if (scene === "clock") {
    p.push(circleEl(150, 95, 68, { fill: "#e0f2fe", stroke: INK, strokeWidth: 5 }));
    p.push(lineEl(150, 95, 150, 55, { stroke: "#1e3a8a", width: 6 })); p.push(lineEl(150, 95, 190, 112, { stroke: "#dc2626", width: 4 }));
    p.push(circleEl(150, 95, 5, { fill: INK }));
    if (focus === "circle") mark(76, 21, 148, 148, 74);
  } else if (scene === "breakfast") {
    sun(55, 45); p.push(lineEl(32, 155, 268, 155, { stroke: "#92400e", width: 7 }));
    p.push(circleEl(150, 128, 36, { fill: "#fef3c7", stroke: "#92400e", strokeWidth: 3 })); p.push(circleEl(150, 128, 19, { fill: "#f59e0b", stroke: "#b45309", strokeWidth: 3 }));
    p.push(text(150, 181, "早餐時間", { size: 18, color: "#92400e" }));
  } else if (scene === "school") {
    sun(55,45); p.push(rectEl(92, 75, 120, 77, { fill: "#bfdbfe", stroke: INK, strokeWidth: 3, rx: 4 }));
    p.push(`<polygon points="78,78 152,38 226,78" fill="#f87171" stroke="${INK}" stroke-width="3"/>`); p.push(rectEl(137, 112, 30, 40, { fill: "#a16207", stroke: INK, strokeWidth: 2 })); person(55, 125, "#34d399");
    p.push(text(150,181,"上學時間",{size:18,color:"#1e3a8a"}));
  } else if (scene === "lunch") {
    sun(55,45); p.push(lineEl(30,155,270,155,{stroke:"#92400e",width:7})); p.push(circleEl(145,125,39,{fill:"#fff",stroke:"#92400e",strokeWidth:3}));
    p.push(circleEl(145,125,25,{fill:"#86efac"})); p.push(lineEl(205,86,205,150,{stroke:INK,width:4})); p.push(lineEl(220,86,220,150,{stroke:INK,width:4}));
    p.push(text(150,181,"午餐時間",{size:18,color:"#166534"}));
  } else {
    p.push(rectEl(0,0,w,h,{fill:"#1e293b"})); moon(52,43); p.push(circleEl(102,48,3,{fill:"#fff"})); p.push(circleEl(222,35,3,{fill:"#fff"}));
    p.push(rectEl(54, 105, 188, 48, { fill: "#60a5fa", stroke: "#0f172a", strokeWidth: 4, rx: 14 })); p.push(rectEl(54, 81, 62, 31, { fill: "#f8fafc", stroke: "#0f172a", strokeWidth: 3, rx: 12 }));
    person(160, 106, "#f9a8d4"); p.push(text(150,181,"睡覺時間",{size:18,color:"#e0e7ff"}));
  }
  p.push(svgClose()); return p.join("");
}

// ---------------------------------------------------------------------------
// 匯出
// ---------------------------------------------------------------------------

const RENDERERS = {
  clock_face: renderClockFace,
  digital_clock: renderDigitalClock,
  calendar: renderCalendar,
  ten_frame: renderTenFrame,
  place_value_board: renderPlaceValueBoard,
  column_arithmetic: renderColumnArithmetic,
  count_group: renderCountGroup,
  unit_ruler: renderUnitRuler,
  pictogram: renderPictogram,
  segment_compare: renderSegmentCompare,
  thickness_compare: renderThicknessCompare,
  number_line: renderNumberLine,
  space_relations: renderSpaceRelations,
  array_model: renderArrayModel,
  line_relation: renderLineRelation,
  shape_dimension: renderShapeDimension,
  capacity_container: renderCapacityContainer,
  balance_scale: renderBalanceScale,
  fraction_model: renderFractionModel,
  grid_tiling: renderGridTiling,
  solid_shape: renderSolidShape,
  life_scene: renderLifeScene,
};

export const SUPPORTED = Object.keys(RENDERERS);

/**
 * renderFigure(spec) → SVG 字串
 * spec 一律是 { type: "<型別名>", ...參數 }，型別名見 SUPPORTED。
 * 純函式：相同 spec 保證輸出相同字串。
 */
export function renderFigure(spec) {
  if (!spec || typeof spec !== "object") {
    throw new Error("renderFigure: spec 必須是物件，例如 { type: 'clock_face', hour: 3, minute: 0 }");
  }
  const fn = RENDERERS[spec.type];
  if (!fn) {
    throw new Error(`renderFigure: 不支援的型別 "${spec.type}"。支援的型別：${SUPPORTED.join(", ")}`);
  }
  return fn(spec);
}
