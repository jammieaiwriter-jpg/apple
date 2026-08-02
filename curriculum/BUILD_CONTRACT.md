# Apple 數學系統 — 建置契約

給執行子任務的人／agent 看。**介面已定死，請照契約實作，不要自行更改檔名、函式簽章或欄位名稱。**

建立日期：2026-07-31｜最後更新：2026-08-01（G1–G4 課綱骨架全部建完，本次更新現況與模式清單，§2.3／§5 是 G1 初建當時的歷史紀錄，之後的圖形缺口一律看 [`FIGURE_BACKLOG.md`](FIGURE_BACKLOG.md)）

---

## 0. 系統定位（不可偏離）

核心是 **適性發展**，不是題庫平台：

1. **跟著孩子的進度調整** — 系統依 `progress.json` 自己決定今天出什麼，不是照課綱順序平鋪。
2. **錯題練習** — 答錯／看提示／看答案都進錯題池，接變式題。
3. **矩陣無限生題** — 題目由「模板 × 參數空間」即時生成，不是固定題庫。

三個支柱缺一不可。

---

## 1. 現況（2026-08-01）

已完成：

- `curriculum/math-g1-school.json` — 17 章 79 技能
- `curriculum/math-g2-school.json` — 17 章 79 技能
- `curriculum/math-g3-school.json` — 17 章 96 技能
- `curriculum/math-g4-school.json` — 18 章 148 技能
- 四個年級合計 69 章、**402 個技能**，每個技能有 `skillId` / `mode` / `difficulty` / `figure`（`figureSource` 可選，標記缺圖時要參考的元件）
- `progress.json` — 402 筆技能紀錄（跑 `tools/seed_progress.py` 產生，重跑不會蓋掉已有進度）
- `tools/scheduler.js` — 適性排課引擎，**跨年級規則**：新技能只從「還有技能沒精熟的最低年級」挑，該年級 79/79/96/148 個技能要**整批精熟**（不是解鎖過一次）才會換下一個年級。見 [`SCHEDULER.md`](../tools/SCHEDULER.md) §2。
- `tools/figures/figures.js` — 13 個圖形元件已上線，規格見 [`figure-specs.json`](figure-specs.json)
- `curriculum/templates/` — 只有 G1 前 4 章（20 技能）有模板，G2/G3/G4 還沒開始寫模板
- 圖形缺口清單：見 [`FIGURE_BACKLOG.md`](FIGURE_BACKLOG.md)，**不要在這份契約裡另外維護缺口清單**（§2.3 是歷史紀錄，只涵蓋 G1 初建當時，已過期）

模式代碼（9 種，`multiply`/`measure`/`fraction` 是 G2 之後陸續新增）：

| 代碼 | 涵蓋範圍 | 首次出現 |
|---|---|---|
| `jump` 🐸 | 數數、順逆數、位值、大小比較 | G1 |
| `reverse` 🧠 | 分合、加減計算 | G1 |
| `story` 🍬 | 生活情境應用題（跨領域，「應用題」標籤覆蓋其所屬領域 mode，除非該領域自己有例外，見下方） | G1 |
| `clock` ⏰ | 時間、日期、月曆 | G1 |
| `space` 📦 | 平面/立體圖形、方位、垂直線/平行線、形狀分類辨識 | G1 |
| `length` 📏 | 長度比較與測量 | G1 |
| `chart` 📊 | 分類整理、長條圖、折線圖 | G1（G4 擴充） |
| `multiply` ✖️ | 乘法概念、九九乘法表、除法（**除法一律併入 multiply，不獨立開 mode**） | G2 |
| `measure` 📐 | 容量／重量／面積／體積／角度的比較與量測（含公式化計算） | G2 |
| `fraction` 🍕 | 分數概念、同分母/異分母加減、真分數假分數帶分數、分數小數互換 | G3 |

**`story` 的已知例外**（不要因為看到「應用題」就無腦塞 story，這幾類明確留在原本領域 mode）：乘法/除法應用題 → `multiply`；分數應用題 → `fraction`；時間應用題（整個「時間的計算」章）→ `clock`。理由與判例見各年級課綱檔的技能 `note` 欄位。

圖形等級：`none` `param` `grid` `asset`

---

## 2. 能力盤點結果

### 2.1 已有、可直接用

| 來源 | 內容 |
|---|---|
| `index.html` 內建 | `mkSVG(w,h,body)` / `cell(c,r,color)` / `gap(c,r)` — 方格積木、補合題、幾何干擾選項 |
| Bobo `tools/math_diagram_kit/`（48 型別，回傳 SVG 字串） | 小一用得到：`number_line` `segment_compare` `bar` `pie` `line_chart` `data_table` `polygon_shape` `basic_geometry` `solid_shape` `solid_net` `three_view` `block_views` `symmetry` `grid_symmetry` `space_relations` `sector` |
| Bobo `tools/matrix_gen/` | 模板生題引擎：參數空間、拒絕取樣、答案公式、**干擾選項含錯因 `why`**、獨立驗算 `verify`、`figureSpec` |

絕對路徑：`/Users/emma/02_小孩教育/Bobo/考前任務包系統/國中_Bobo/tools/`

### 2.2 康軒製圖高手 國小版全盤點（13 工具 / 51 子類）

`https://digitalmaster.knsh.com.tw/all/math-picture/?school=國小`

| 工具 | 子類 |
|---|---|
| 數數工具 | 花片、積木 |
| 錢幣 | 錢幣符號、新臺幣 |
| 時間 | 時鐘、電子鐘 |
| 線段 | 數線、分段式、分行式 |
| 定位板 | 位值、加減算式、乘法算式、除法算式、長度、面積、體積、容量、重量、時間 |
| 分數 | 圓形、長條型、矩陣型、離散型、個別板 |
| 容量 | 10毫升、100毫升、1公升、2公升 |
| 重量 | 1公斤秤面、3公斤秤面、100公斤秤面 |
| 統計圖 | 長條圖、折線圖、圓形圖 |
| 平面圖形 | 角、方格、三角形、四邊形、圓形、扇形、正多邊形 |
| 立體圖形 | 三角柱、四角柱、圓柱、正多角柱、正三角錐、正四角錐、圓錐 |
| 線對稱圖形 | 節點、填色 |
| 1立方公分立體堆疊 | （無子類）5×5 底面點格設高度，等角投影 |

共同介面：參數面板（數值輸入）＋清除／隨機／確定＋畫布工具（選取、畫筆、直線、文字方塊、可撕貼紙、橡皮擦）＋縮放＋下載。

**用途定位：樣式參考。** 它是康軒給老師備課出題用的免費工具，手動使用完全正當；**不要寫程式自動化擷取它的輸出**。我們自己畫。

### 2.3 蒸餾結果：目前還沒有的元件（本次要新建）— ⚠️ 歷史紀錄，只涵蓋 G1 初建當時

**這一節是 2026-07-31 建 G1 時的盤點快照，已經全部做完（13 個元件都上線了）。G2/G3/G4 陸續發現的新缺口不會寫在這裡，一律看 [`FIGURE_BACKLOG.md`](FIGURE_BACKLOG.md)。** 保留本節只是留個歷史紀錄，不要照這裡的清單判斷「還缺什麼」。

以下 11 個 `math_diagram_kit` 與 `index.html` 都沒有。標★者康軒也沒有，是雙方共同缺口。

| # | 元件 | 服務的技能 | 備註 |
|---|---|---|---|
| 1 | `clock_face` 指針鐘面 | G1-09 全章 6 個技能 | 最高優先，kit 完全沒有時鐘 |
| 2 | `digital_clock` 電子鐘 | G1-09-05、G1-09-06 | |
| 3 | ★`calendar` 月曆 | G1-15-02、G1-15-03 | 康軒也沒有 |
| 4 | `ten_frame` 十格框 | G1-10-02 湊十、G1-12-01/02 分合 | 小一湊十的標準表徵 |
| 5 | `place_value_board` 定位板位值 | G1-13-06、G1-13-07 | |
| 6 | `column_arithmetic` 直式加減板 | G1-16-01、G1-16-02 | |
| 7 | `count_group` 數數群組（花片／積木，可分色） | G1-01-01、G1-03-06、G1-13-05 | |
| 8 | ★`unit_ruler` 個別單位重複排列測量 | G1-11 全章 5 個技能 | 康軒的線段是數線，不是個別單位 |
| 9 | ★`pictogram` 圖畫記錄（象形圖） | G1-17-01、G1-17-02 | 康軒統計圖只有長條/折線/圓形 |
| 10 | `coin_tw` 新臺幣錢幣 | 軌 B 奧數 `coin` 模式 | 小一課綱無，但奧數會考 |
| 11 | ★`life_scene` 生活情境圖 | G1-05-03、G1-09-04 | `asset` 等級，需素材，可最後做 |

---

## 3. 目標架構

```
                    ┌─────────────────────────┐
   學校進度 ────────▶│  progress.json          │
   錯題（截圖/遊戲）─▶│  79 技能 × 統計 × 精熟   │
   中華奧數（按需）──▶│  ＋ mistakePool         │
                    └──────────┬──────────────┘
                               │ 適性排課（每日 12 題 = 6 新 / 3 複習 / 3 錯題變式）
                               ▼
                    ┌─────────────────────────┐
                    │  矩陣生題引擎            │
                    │  模板 × 參數空間 → 無限題 │
                    │  ＋ 干擾選項含錯因        │
                    │  ＋ 獨立驗算              │
                    └──────────┬──────────────┘
                               │ figureSpec
                               ▼
                    ┌─────────────────────────┐
                    │  圖形元件庫 figures.js   │
                    │  既有 16 型 ＋ 新建 11 型 │
                    └──────────┬──────────────┘
                               ▼
                          index.html 出題
```

---

## 4. 介面契約（不可更改）

### 4.1 圖形元件庫 `tools/figures/figures.js`

純瀏覽器 ES module，**無外部相依**，回傳 SVG 字串。

```js
export function renderFigure(spec) // → SVG 字串
export const SUPPORTED = [...]     // 型別名稱陣列
```

`spec` 一律是 `{ type: "<型別名>", ...參數 }`。

> ### ⚠️ figureSpec 的參數簽章以 `curriculum/figure-specs.json` 為唯一準則
>
> 2026-07-31 第一次平行開發時，模板端與元件端各自發明參數名，結果 `count_group` 出現 4 種簽章、`segment_compare` 出現 6 種，189 個帶圖題目只有 30 個畫得出來。
>
> 因此：
> - **不可自行發明參數名。** 要新增參數先改 `figure-specs.json`，再改兩邊。
> - **動過模板或 figures.js 之後一定要跑 `node tools/validate_figures.mjs`**，它會檢查 registry / 模板 / 元件三邊一致，有落差就 exit 1。
> - registry 裡標 `"status": "TODO_JS"` 的型別目前只剩 `line_relation`（2026-08-01 為 G2/G4 的垂直線/平行線技能新增，規格已定案但 JS 尚未實作）。`segment_compare`／`number_line`／`space_relations`／`array_model` 原本也標過 TODO_JS，都已經做完拿掉標記了——**看到 TODO_JS 要信，看不到不代表已經做完，永遠以 `figures.js` 的 `SUPPORTED` 陣列為準。**

所有元件必須：

- 回傳自足的 `<svg>` 字串（含 `viewBox`，不依賴外部 CSS）
- 尺寸適合 iPad 直式閱讀，最大寬度 320
- 不使用外部字型、圖片、網路資源
- 相同 `spec` 必須產生相同輸出（純函式，不可內部亂數；要亂數請由呼叫端傳 `seed`）

### 4.2 題目模板 `curriculum/templates/*.json`

沿用 Bobo `matrix_gen` 的結構，欄位精簡為：

```json
{
  "templateId": "G1-06-02-a",
  "skillId": "G1-06-02",
  "mode": "reverse",
  "difficulty": 2,
  "stem": "{a} 和 {b} 合起來是多少？",
  "params": {
    "a": { "type": "int_range", "min": 1, "max": 9 },
    "b": { "type": "int_range", "min": 1, "max": 9 }
  },
  "reject": ["a + b > 10"],
  "answer": { "formula": "a + b" },
  "distractors": [
    { "formula": "a + b + 1", "why": "多數一個" },
    { "formula": "a + b - 1", "why": "少數一個" },
    { "formula": "abs(a - b)", "why": "把合起來看成相差" }
  ],
  "hints": [
    "先看看第一個數字是多少？",
    "從 {a} 開始，往後數 {b} 個。",
    "{a} 往後數 {b} 個就是 {answer}。"
  ],
  "figureSpec": { "type": "ten_frame", "filled": "a", "extra": "b" },
  "verify": "a + b == answer"
}
```

規則：

- **`distractors` 的 `why` 是必填**。這是錯題診斷的來源 —— 她選了哪個干擾選項，系統就知道她犯了哪種錯。
- **`hints` 必須三層**：第一層只提醒觀察、第二層給第一步、第三層給完整解法。語氣照 `LEARNING_DNA.md`（「偷偷告訴妳」式，答案要她自己講出來）。
- **`verify` 必填**，用獨立算式重新驗證答案，跟 `answer.formula` 不可以是同一條路徑。
- `figureSpec` 的參數值可以是參數名字串（如 `"a"`），生成時代入實際值。

### 4.3 進度檔 `progress.json`

欄位已定，見現檔。**不要新增或改名欄位**，需要擴充先問。

精熟規則（已寫在 `_meta.masteryRule`）：
連續 10 題「首次作答正確且全程無提示」＝ 1 次完美通關；累積 10 次 → `mastered: true`，永久撤出題池。
答錯、看提示、看答案三者都讓 `currentStreak` 歸零。

---

## 5. 執行順序與分工 — ⚠️ 歷史紀錄，只涵蓋 G1 初建當時（已全部完成）

| # | 任務 | 相依 |
|---|---|---|
| A | 圖形元件庫：新建 §2.3 的 1–9 號元件 | 無 |
| B | 矩陣生題引擎移植 ＋ 前 4 章（20 技能）模板 | 需要 A 的型別名稱（已列在 §2.3，可平行開工） |
| C | 適性排課引擎：每日 12 題、錯題池、精熟判定、streak | 只依賴 `progress.json`，可完全平行 |
| D | 接進 `index.html` | A + B + C 完成後 |
| E | `life_scene` 素材（第 11 號元件） | 最後做，可用康軒手動產圖 |

前 4 章 = G1-01 10以內的數(3)、G1-02 比長短(6)、G1-03 順序與多少(8)、G1-04 分與合(3)，共 20 個技能，圖形全部是 `param` 等級。

## 6. 現在實際待做的事（2026-08-01 起，取代上面 §5 的歷史清單）

| # | 任務 | 相依 | 優先度 |
|---|---|---|---|
| F | `line_relation` 元件（規格已定案，見 `figure-specs.json`） | 無，可直接開工 | 高——是 `FIGURE_BACKLOG.md` 裡唯一設計完成、能立刻動工的項目 |
| G | `fraction_model` 元件 | 需先決定塗色表徵形式（圓形/長條/方格） | 高——影響 23 個技能，是最大槓桿，但先設計再動工 |
| H | `column_arithmetic` 加小數點支援 | 無 | 中——修好能同時解掉 G3/G4 多個「靜默算錯」風險技能 |
| I | G2/G3/G4 題目模板（比照 G1 前 4 章的模式） | 需要對應章節的圖形元件先就位 | 依實際教學進度決定，不用照課綱順序 |
| J | 英文（Vocabulary/Grammar）小三小四架構盤點 | 無 | 尚未開始，只做過 G1/G2 |

詳細缺口清單與施工建議順序見 [`FIGURE_BACKLOG.md`](FIGURE_BACKLOG.md)。
