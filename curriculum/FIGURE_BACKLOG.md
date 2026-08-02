# 圖形元件缺口清單

整理日期：2026-08-01｜最後更新：2026-08-02（`life_scene` 已完成，G1 模板覆蓋 79/79）

這份文件是**唯一的缺口優先順序清單**。每個年級課綱檔的 `figureSource` 欄位只負責標記「這個技能要用哪個元件」，缺口的輕重緩急、跨年級是否共用同一個元件，一律以這份文件為準。新增缺口或元件建好之後都要回來更新這裡。

## 現況：22 個元件已上線

`clock_face` `digital_clock` `calendar` `ten_frame` `place_value_board` `column_arithmetic` `count_group` `unit_ruler` `pictogram` `segment_compare` `thickness_compare` `number_line` `space_relations` `array_model` `line_relation` `shape_dimension` `capacity_container` `balance_scale` `fraction_model` `grid_tiling` `solid_shape` `life_scene`

2026-08-02 新增：`grid_tiling`（G1 拼砌／分割格板）、`solid_shape`（正方體、圓柱、三角柱辨識）與 `life_scene`。`life_scene` 是純 SVG 的生活情境卡：物件中的平面圖形（房子、窗戶、披薩、時鐘）與日常時段（早餐、上學、午餐、睡覺），不需外部素材或連線。

規格見 [`figure-specs.json`](figure-specs.json)，實作見 [`../tools/figures/figures.js`](../tools/figures/figures.js)，預覽見 [`../tools/figures/preview.html`](../tools/figures/preview.html)。`node tools/validate_figures.mjs` 目前回報三邊一致，`node --test tools/scheduler.test.mjs` 21/21 通過，G1 模板生成器 206/206 通過 verify，未受這批新元件影響。

### 2026-08-01 新完成的五項（獨立驗證通過，不只是跑過測試腳本，連 SVG 內部結構都拆開檢查過）

| 元件 | 驗證重點 | 結果 |
|---|---|---|
| `fraction_model` | 假分數 5/4 正確畫「1 個全滿圓＋1 個恰好 1/4 塗色的圓」；整除 8/4 正確只畫 2 個全滿圓，不多畫空的第 3 個 | 通過 |
| `column_arithmetic`（小數點修復） | 小數點是用一個小圓點圖形畫的，不是文字字元「.」——數字「1」「2」跟圓點分開成三個 SVG 元素，視覺上組成「1.2」；整數輸入路徑獨立不受影響 | 通過 |
| `balance_scale` | 直接讀 SVG 座標確認：700 克那端的托盤 y 座標比 300 克那端大（畫面上更低），重的一邊真的往下沉 | 通過 |
| `line_relation`／`shape_dimension`／`capacity_container` | 16 組不同參數，純函式／viewBox／標籤閉合／寬度全過 | 通過 |

## 待建元件，依影響技能數排序

| 元件 | 技能數 | 涉及年級 | 說明 |
|---|---:|---|---|
| `polygon_construction` | 13 | G4 | 三角形（分類/繪製）+ 四邊形（認識/分類/繪製，含正方形長方形平行四邊形菱形梯形）。範圍大，可能要拆成「辨識」跟「繪製」兩個 mode。**現在是清單裡影響技能數最大的缺口。** |
| `composite_figure` | 6 | G4 | 複合圖形（分割法/填補法）求周長面積，是 `shape_dimension` 的進階版，建議直接擴充 `shape_dimension` 而非另開新元件（兩者都是「標邊長的圖形＋顯示計算式」，複合圖形只是多個矩形組合）。 |
| `column_multiply` | 5 | G4 | 直式乘法，含小數點對齊版本。可參考剛修好的 `column_arithmetic` 小數點處理手法（圓點畫小數點、整數路徑獨立）。 |
| `bar_chart` | 5 | G4 | 長條圖/複合長條圖。Bobo Python 版有 `bar`，可參考但不用照搬。 |
| `solid_shape` | 3 | G1, G2, G4 | 立體圖形。三個年級都指向同一個名字（Bobo Python 版已有 `solid_shape`），純粹是移植優先順序問題，不是設計問題。 |
| `area_compare` | 3 | G2, G3 | 面積直接/個別單位比較。兩個年級共用同名，無衝突。 |
| `protractor` | 3 | G4 | 量角器實測（角度量測工具）。 |
| `angle_diagram` | 3 | G4 | 角的辨識圖示（銳角/鈍角/直角，不含量角器）。跟 `protractor` 是同一章的一體兩面，建議一起設計：`angle_diagram` 負責視覺辨識，`protractor` 負責工具量測。 |
| ~~`life_scene`~~ | ~~3~~ | G1, G4 | ✅ 2026-08-02 已改以可參數化、純 SVG 情境卡完成。G1-05-03／G1-09-04 已接入；G4 的量度／面積單位情境可於寫模板時擴充 scene。 |
| `line_chart` | 3 | G4 | 折線圖。Bobo Python 版已有 `line_chart`，移植優先。 |
| `column_divide` | 2 | G4 | 直式除法。 |
| `volume_compare` | 2 | G4 | 體積比較/堆疊。可參考 Bobo `solid_shape`。 |

## 既有元件需要擴充（不是新元件，是加參數）

| 元件 | 擴充需求 | 影響 | 狀態 |
|---|---|---|---|
| ~~`column_arithmetic`~~ | ~~目前只定義整數，餵小數會靜默算錯~~ | G3 一位小數加減 4 技能、G4 兩位小數加減多技能 | ✅ 2026-08-01 已修復，見上方驗證結果 |
| `place_value_board` | 目前只支援 `hundreds`/`tens`/`ones`，沒有小數位、沒有萬位以上。 | G3-16-03（一位小數的數值）、G4 一億以內的數多個技能 | 待處理 |

## 建議施工順序（下一批）

1. **`polygon_construction`**——現在是影響技能數最大的缺口（13），但範圍複雜（辨識＋分類＋繪製），開工前建議先拆成兩個更小的子任務分開設計，不要一次囊括三角形、四邊形、辨識、繪製四件事。
2. **`place_value_board` 擴充小數位/萬位以上**——低成本，能解掉好幾個目前 `figure: "none"` 的技能。
3. **`bar_chart` + `line_chart`**——Bobo 都有 Python 前例，移植成本低，兩個一起做因為都是統計圖表章節。
4. `composite_figure` 建議直接併入 `shape_dimension` 擴充，不用當獨立元件開工。
5. 其餘依實際寫模板時的優先順序決定，不用現在就全部做完。

## 不在清單裡，但同樣待決的事

- `array_model` 的除法「分堆」模式（`mode: "grouping"`）目前只在 G2 除法啟蒙用過一次，G3 除法(一)(二)＋乘與除共 21 個技能也要用它——量放大很多，正式寫模板前應該先用這 21 個技能的實際數字範圍（含餘數的除法）跑一輪，確認 `unknownGroup` 那組參數撐不撐得住更複雜的分堆情境（比如有餘數時多畫一小堆）。
