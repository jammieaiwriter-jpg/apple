# 睡前故事

這是一個讓六歲孩子自行操作、閉眼聆聽的床邊故事頁面。孩子點一次「開始今晚的故事」後，系統會使用 `speechSynthesis` 依序播放完整故事與收心晚安段落。

## 內容節奏：一週一主題、每晚換故事

每一週是一個核心詞主題（例如 W01「友情」），主題底下放多篇平行獨立的故事。夜間頁不再整週重播同一篇，而是在「本週主題」內每晚自動換下一篇**已審閱**（`adult_verified`）的故事，跨日才換片；同一晚重開會沿用當晚那篇並從上次的段落續播。輪播只收 `adult_verified` 的故事，草稿（`pending_adult_review`）只能在 Podcast 選單裡試聽，不會進入夜間輪播，成人審閱 gate 因此自然守住。輪播狀態存在 `localStorage` 的 `apple-bedtime-rotation-v1`（記 `date`／`week`／`index`）。

## 夜間體驗

- 開場顯示「本週主題 · W0X 核心詞」儀式列、今晚故事標題與核心詞，每個國字右側以 flex 容器顯示直式注音。
- 首頁下方提供 Podcast 式第一季故事選單，依週分組逐篇列出；今晚故事、草稿試聽與規劃中集數有清楚狀態。每週第一列右側顯示核心詞與注音，點可播放故事會立即開始朗讀。
- 播放約 20 秒後畫面逐漸變暗；點暗幕可短暫顯示控制。
- 控制只包含開始、暫停、繼續與重新播放。
- 朗讀優先選擇 `zh-TW` 系統語音，故事段落後留白 1.8 秒、進入收心前留白 2.5 秒、收心段之間留白 3 秒。
- 暫停或語音錯誤時會取消當前朗讀；繼續後從該段開頭重播。
- `localStorage` 保存最後完成段落，重新開頁可從下一段繼續。
- 夜間不顯示故事全文，也沒有問題、選項、提示、跟讀或評量。

## 故事資料

`stories/week01.json` 使用根層 `theme_word`、`intro`、`sections` 與 `wind_down`。故事本文是供 TTS 使用的純文字；僅核心詞保存字符級注音。六段正文合計至少 2,000 字，目標為 2,100–2,400 字。每篇故事發布前須由成人完整試聽並標記 `adult_verified`。

`stories/catalog.json` 保存十二週 Podcast 選單、核心詞注音與完成狀態；每週以 `stories[]` 列出該週多篇故事（id／標題／狀態／available）。`stories/current.json` 指向今晚正式故事，並用來決定「本週」是哪一週——夜間輪播會在該週的 `adult_verified` 故事之間每晚換片。

使用已安裝的 `$bedtime-story-publisher` Skill，可依同一流程完成故事創作、字數檢查、試聽、成人審閱、今晚切換與上線。

分工寫稿時：Codex 用 skill 寫 `pending_adult_review` 草稿 → 跑自動檢查 → 依 [docs/story-scoring-rubric.md](docs/story-scoring-rubric.md) 評分（達標／待修／退回）→ 成人試聽後才設 `adult_verified`。評分達標不等於發布，成人試聽仍是最後關卡。

## 首版限制

- iPhone Safari 僅支援前景播放；切到背景或鎖屏時會暫停，不承諾背景連續朗讀。
- 週末親子回顧會另做獨立頁面；首版只在故事資料保留不評分的對話提示。

執行 `node tests/check-bedtime.js` 驗證資料契約與夜間頁面禁用舊互動。

執行 `node tests/check-bedtime-season.js` 驗證 W08 壓力測試與第一季計畫：六段結構、單一核心詞、嵌入式人物故事、行動式週末問題及 12 週六欄完整性。角色是否以行動呈現核心詞仍須成人人工驗收。

執行 `node tests/check-bedtime-podcast-catalog.js` 驗證十二週 Podcast 選單、可播放故事檔與狀態。

執行 `node tests/check-bedtime-week-rotation.js` 驗證「主題 → 切點 → 故事」模型：W01 友情多篇結構與字數、每週 `facets` 與每篇 `focus` 合法（focus 必屬宣告切點、切點不重複）、輪播只收 `adult_verified`、`current.json` 對應週有可輪播故事，以及夜間頁的輪播邏輯（`pickTonight`／`weekRotationPool`／本週主題儀式）。

執行 `node tests/check-bedtime-sensory.js` 跑五感畫面助言檢查：逐篇列出觸及的感官、提醒哪一段缺畫面或缺聲音／觸感。此檢查只提醒、不阻擋發布，是寫作輔助而非 gate。
