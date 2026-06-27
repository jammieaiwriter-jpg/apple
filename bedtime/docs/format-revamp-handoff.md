# 交接單：睡前故事全面改版（架構矩陣 + 點題前言 + 多聲線童聲）

對象：**Codex（寫稿）**。日期：2026-06-16。狀態：規格已定、樣板已上線並經 Emma 試聽通過。

## 一句話

把**現有已上線的故事全部重做**成新模式，並從 W03 起新寫的故事直接套用。分工：**Codex 全改、Claude 審**（沿用「Codex 寫稿 → Claude 依 rubric 評分、合成、上線」）。

## 為什麼改

早期友情第一、二篇六段逐拍同骨架，孩子聽到第二晚就嫌膩。三項改版：① 用**架構矩陣**讓每篇形狀不同；② 開頭加**故事入口**，先介紹角色與場景，再明講小道理；③ 改**多聲線對白**、角色用童聲自己說話。

## 三個規格（細節見 `stories/season01-plan.md`、`docs/tts-audio-writing-guide.md`、`docs/story-scoring-rubric.md`）

1. **架構矩陣（`shape`）**：八種形狀——旅程／相遇／等待／製作／尋找／來訪／變化（角色慢慢轉變）／守護（照顧更小更弱的對象）型。每篇宣告一個 `shape`；**同週五篇不重複、且不與夜間輪播前一晚同形**。
2. **故事入口（`prologue`）**：`intro` 之後、第一段之前，4–6 句介紹今晚的角色、場景、起始狀況，再**明講**核心道理（被授權講道理的主要位置）；正文本體照舊「演出不說教」。尾端可做故事結果回望，但不可訓話。
3. **多聲線童聲（`voices` + `sections[].turns`）**：
   - `narrator` → `zh-TW-HsiaoChenNeural`（台灣女聲旁白）
   - `mimi` → `zh-CN-XiaoshuangNeural`（女童・主角女）
   - `dodo` → `zh-CN-YunxiaNeural`（男童）
   - `girl2` → `zh-CN-XiaoyiNeural`（第二女童；**只在同篇有兩個會說話的女生時加**，用來和 `mimi` 區分）
   - 角色自己說話，**旁白只接場景與轉場**；角色口吻分得開；一輪講一兩句就換人。主角女→`mimi`、第二個說話的女生→`girl2`、男角→`dodo`；同性別的次要配角若不與主角同場對話可共用聲線，避免再加第五個聲線。

**命名規則（跳出森林的新世界故事一律遵守）**：角色用全新名字，**不要重用森林班底**（米米／阿栗／豆豆／圓圓／跳跳／莉莉／老山羊／老青蛙…）；一篇內不可兩角同名；新名避免和最近兩篇主角撞名；同一名字的性別／物種要前後一致。想保留跨篇熟悉錨點時只能用「米米」（小兔），且非必要。

## 參考樣板

`stories/week01-2b.json`〈一人一半的月亮〉（相遇型）— 直接照它的欄位結構與對白密度寫。

## JSON 結構（新增/變動欄位）

```jsonc
{
  "schema_version": 2,
  "id": "weekNN[-x]",
  "title": "...",
  "focus": "（該週 facets 之一）",
  "shape": "相遇型",                       // 新增：八形狀之一
  "theme_word": [{ "char": "友", "zhuyin": "ㄧㄡˇ" }, ...],
  "intro": "...",
  "prologue": "今晚的故事，會來到……。這裡有……。一開始，……。等一下，我們會聽見／看見……。今晚的小道理是……。", // 新增：角色＋場景＋起始狀況＋核心道理
  "voices": {                               // 新增
    "narrator": "zh-TW-HsiaoChenNeural",
    "mimi": "zh-CN-XiaoshuangNeural",
    "dodo": "zh-CN-YunxiaNeural"
  },
  "review_status": "pending_adult_review",
  "review_note": "...",
  "sections": [
    {
      "id": "...",
      "turns": [                            // 新增：對白輪，role 必為 voices 宣告者
        { "role": "narrator", "text": "……" },
        { "role": "mimi", "text": "……" },
        { "role": "dodo", "text": "……" }
      ],
      "text": "……（= 本段所有 turn 的 text 依序相接，不含 role 標記）"
    }
    // 共 6 段
  ],
  "wind_down": { "scene": "...", "breath": "...", "goodnight": "..." },
  "weekend_prompts": ["……", "……"]          // 兩則行動式
}
```

**`text` 必須完全等於該段 turns 的 text 串接**（瀏覽器後備與閱讀用）。請用程式產生 `text`，不要手抄，避免不同步。

## 重做範圍與建議形狀（硬規則：相鄰不同形）

夜間輪播順序依 `catalog.json` 的 `stories[]`。建議形狀僅供起手，Codex 可換，只要**同週不重複、相鄰不同形、形狀契合切點**：

**W01 友情**（輪播序）

| 序 | id | 切點 | 建議形狀 |
|---|---|---|---|
| 1 | `week01` | 主動靠近與接納陌生 | 旅程型 |
| 2 | `week01-2` | 分享與互相付出 | 相遇型（可採 `week01-2b` 內容定案） |
| 3 | `week01-3` | 守約與陪伴等待 | 等待型 |
| 4 | `week01-5` | 分辨善意與不友善 | 來訪型 |
| 5 | `week01-4` | 不必討好，選擇適合自己的朋友 | 製作型（折小船：折→被打斷／壓壞→和對的朋友一起折好） |

**W02 誠實**（輪播序）

| 序 | id | 切點 | 建議形狀 |
|---|---|---|---|
| 1 | `week02-2` | 分清楚自己真正看見的事 | 尋找型 |
| 2 | `week02` | 犯錯後勇敢說出真相 | 製作型（一起做果醬→打翻→坦白後一起修補） |
| 3 | `week02-3` | 把事情完整說清楚，不只說一半 | 來訪型 |
| 4 | `week02-4` | 發現說錯時主動更正 | 旅程型 |
| 5 | `week02-5` | 沒有人看見時，也做真實的選擇 | 等待型 |

註：`week01-2b` 是樣板。facet 2 重做時可把它的內容定案進 `week01-2`，再決定 `week01-2b` 是否退場（交給 Claude 上線時處理）。W08 等尚未上線者，輪到撰寫時直接用新模式即可。

## 每篇流程

0. **先抽配方卡（最重要）**：`python3 tools/draw-recipe.py --facet "<切點>" --theme <核心詞> --id <id>`，得到一張含「形狀／主角／場景／情緒曲線／解決方式／陪伴角色／主導感官／睡前收束／結尾句式／**自動禁用元素**」的配方卡。**照配方寫**，不要自己另想一套。主角／場景已全放開（不再鎖森林）；禁用元素會逼這篇和最近兩晚岔開。
1. **Codex 寫**：照配方卡改寫成 `pending_adult_review` 草稿（JSON 需含 `shape`/`protagonist`/`scene`/`emotion_arc`/`resolution`/`dominant_sense`/`ending_style`/`prologue`/`voices`/`turns`/`text`）。`prologue` 必須是故事入口，不只是短道理；第 6 段需完整收束後再接 `wind_down`。**不要**自設 `adult_verified`、不要動 `current.json`、不要產音檔。
2. **Codex 自檢**：跑 `check-bedtime-week-rotation.js`、`check-bedtime-sensory.js`，並核對 `text` == turns 串接、`shape` 不與相鄰同形。
3. **Claude 審**：依更新後的 `docs/story-scoring-rubric.md` 逐篇評分。
4. **Claude 合成上線**：達標 → 跑 `bedtime-audio` 產童聲 MP3（時長落 8–10 分）→ 設 `adult_verified` → commit/push（GitHub Pages）。可試聽待修／退回則回給 Codex 修。

## 驗收重點（rubric 已更新對應條目）

- **硬性**：新欄位齊全；6 段；對白格式 `text`==turns 串接；**時長 8–10 分（取代舊「≥2,000 字」硬門檻——對白＋停頓使同時長字數更少，字數只剩軟參考）**；`focus` 合法；`shape` 不與相鄰同形。
- **品質**：`prologue` 先介紹角色／場景／起始狀況，再明講核心道理；正文不說教（維度 5）；第 6 段有角色變化小總結與安靜畫面，能順接 `wind_down`；對白像孩子說話、旁白只接場景、各角口吻有別（維度 7）；形狀與解法/收尾跨篇不重複（維度 8）。
- **語感**：五感以比喻、擬人、具體動作、光影/觸感/氣味為主；狀聲詞只作點綴，每篇保留一組主要聲音意象即可，不逐段堆「沙沙、刷刷、嗒嗒、喀」等效果音。
- **安全閥不變**：價值與安全 ≤2 一律退回；不強迫原諒/和好、孩子可離開找可信大人。

## 2026-06-27 完整改版上線記憶

- W01–W05 共 26 篇已完成 Emma 2026-06 語感重寫、Claude 審核通過、Codex 合成並上線。範圍含 `week01-2b` 試聽樣板；它不在 catalog 輪播，但已有雨芯版與光哥阿築版音檔。
- 寫作成品已落地：每篇 `prologue` 是 4–6 句故事入口；正文降低狀聲詞，改以比喻、擬人、具體動作、光影、觸感、氣味寫五感；第 6 段先落角色改變，再接各篇獨特 `wind_down.scene`。
- 曾發生的錯誤：批量改寫時一度把 26 篇 `wind_down.scene` 都收成同一句「現在，讓這個畫面留在心裡，像一盞放低的小燈。」這違反維度 8，已修正。後續不可用公式句收尾；收束畫面必須貼合該篇物件、場景與角色變化。
- 音檔上線：兩套音檔均以 `tools/generate-bedtime-audio.py` 加 `--force` 重合成，避免舊 per-turn segment 快取拼入舊句子；52 個 MP3 已驗證落在 8–10 分鐘。
- 測試權威來源：睡前故事的資料契約測試以 repo 根層 `tests/` 為權威；不要在 `bedtime/tests/` 新增同名 `check-bedtime-week-rotation.js` 或 `check-bedtime-sensory.js`，避免兩套測試各自 PASS、造成假綠燈。
- 工具行為：`generate-bedtime-audio.py` 現在允許命令列明確指定「story JSON 存在但不在 catalog available」的 id 合成，供 pending 草稿與 `week01-2b` 這類樣板試聽使用。`check-bedtime-story.py` 無參數預設只檢查 `adult_verified + available` 輪播故事；草稿、pending 或樣板請明確帶 id。

## 一次處理量

每批最多兩篇，Claude 審完、Emma 陪聽無誤再進下一批（沿用 `season01-progress.md` 節奏）。
