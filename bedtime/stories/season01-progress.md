# 第一季完成進度

## 執行原則

- 每批最多完成兩篇故事，避免一次消耗過多生成額度。
- 每篇六段正文至少 2,000 字，目標 2,100–2,400 字。
- 每批依序完成：故事草稿、資料檢查、Podcast 試聽、成人回饋、修訂、成人確認。
- 未完成成人確認前維持 `pending_adult_review`，不得切換為今晚正式故事。

## 內容節奏（改版）

- 一週一主題 × 五個依序切點 × 五篇獨立故事；夜間頁在本週主題內依切點順序每晚換一篇 `adult_verified`，跨日換片、同晚續播。
- `catalog.json` 每週以 `stories[]` 列出該週故事；輪播只收 `adult_verified`，草稿僅供 Podcast 試聽。
- 新測試 `tests/check-bedtime-week-rotation.js` 驗證此模型。

## 進度

| 批次 | 週次 | 目前狀態 | 下一步 |
|---|---|---|---|
| 朗讀與選單基礎 | W01、全站 | 已完成 | 持續用實際睡前聆聽回饋校準 |
| W01 五切點 | W01〈星光小船〉至〈剛剛好的朋友〉 | 五篇 rubric 達標、全數 `adult_verified` 並上線（2026-06-15）；〈星光小船〉已微調收斂並補嗅覺 | 家長每日陪聽回饋 |
| W02 五切點 | W02〈霧裡的月亮熊〉至〈多出來的金色種子〉 | 五篇皆於 2026-06-15 完成成人閱讀與試聽，rubric 96–100 分，全數 `adult_verified` | 保留非必要小修備註；整週連聽問題改由 W03 起的變化守門處理 |
| 2026-06 語感全面改版 | W01–W05 共 26 篇（含 `week01-2b` 試聽樣板） | 已於 2026-06-27 依 Emma 語感規則全面重寫並上線：`prologue` 升級為角色＋場景＋起始狀況＋核心道理；正文降低狀聲詞，改以比喻、擬人、具體動作、光影、觸感、氣味寫五感；第 6 段與 `wind_down.scene` 改為各篇專屬收束。Claude 審核通過後，Codex 以 `--force` 重合成雨芯版與光哥阿築版兩套音檔，52 個 MP3 全部落在 8–10 分鐘；W01–W05 catalog 與 26 篇 story JSON 均為 `adult_verified`。 | 家長每日陪聽回饋；後續改稿不得再使用公式化 `wind_down.scene` 或重建 `bedtime/tests/` 重複測試腳本 |
| W08 壓力測試 | W08〈補好的風鈴〉 | 正文未達 2,000 字 | W02 當前批次完成後再處理 |
| 第 2 批 | W03、W04 | 已完成故事企劃 | 下一創作單位為 W03；從第一篇起套用跨篇變化守門 |
| 第 3 批 | W05、W06 | 已完成故事企劃 | 完成第 2 批後開始 |
| 第 4 批 | W07、W08 連續性 | 已完成故事企劃 | 完成第 3 批後開始 |
| 第 5 批 | W09、W10 | 已完成故事企劃 | 完成第 4 批後開始 |
| 第 6 批 | W11、W12 | 已完成故事企劃 | 完成第 5 批後開始 |
| 最終批 | W01–W12 | 尚未開始 | 全季連續性、文字與試聽總驗收 |

## 下一個工作單位

架構定案：主題 → 5 切點 → 一切點一故事（見 `season01-plan.md`）。

下一個創作單位：W03「友善」第一切點「主動邀請還沒加入的人」。依額度規則每批最多兩篇，先完成第一篇全流程並取得成人回饋，再開始第二篇。

完成條件（2026-06 起的委派關卡）：Codex 用 skill 寫稿與跑自動檢查 → Claude 依 `docs/story-scoring-rubric.md` 評分，**達標即由 Claude 設 `adult_verified` 並上線**；家長 Emma 改為每日陪孩子聽、發現問題再回報。家長可隨時收回授權、恢復前置試聽。

W01 現況：五篇全部 `adult_verified` 並上線，每晚輪播。

W02 五篇成人審閱結果：

1. 〈霧裡的月亮熊〉：分清楚自己真正看見的事。
2. W02〈月光果醬〉：犯錯後勇敢說出真相。
3. 〈只說一半的紙條〉：把事情完整說清楚，不只說一半。
4. 〈飛錯方向的銀紙鳥〉：發現說錯時主動更正。
5. 〈多出來的金色種子〉：沒有人看見時，也做真實的選擇。

五篇全數達標並設為 `adult_verified`：〈月光果醬〉100、〈霧裡的月亮熊〉97、〈只說一半的紙條〉98、〈飛錯方向的銀紙鳥〉96、〈多出來的金色種子〉99。非必要小修暫不改正文。

W03 起套用跨篇變化守門：解法動作與收尾畫面不可同構；優先使用尚未領銜的新角色；長者道理最多一句且不可成為固定收束方式。

## 2026-06-27 完整改版記錄

- 範圍：`week01`、`week01-2`、`week01-2b`、`week01-3`、`week01-4`、`week01-5`；`week02`、`week02-2`、`week02-3`、`week02-4`、`week02-5`；`week03`、`week03-2`、`week03-3`、`week03-4`、`week03-5`；`week04`、`week04-2`、`week04-3`、`week04-4`、`week04-5`；`week05`、`week05-2`、`week05-3`、`week05-4`、`week05-5`。
- 內容：26 篇依 Emma 2026-06 語感規則重寫；`sections[].text == turns text 串接` 已由腳本檢查；所有 `wind_down.scene` 必須保留各篇獨特意象，避免「現在，讓這個畫面留在心裡，像一盞放低的小燈」這類公式句。
- 音檔：已用 `tools/generate-bedtime-audio.py ... --force` 產雨芯版與 `--name "光哥、阿築" --suffix gz --force` 產兄妹版；`week01-2b` 雖不在 catalog/index 輪播，也已產生兩套試聽音檔。
- 狀態：W01–W05 episode 與其 catalog stories 均為 `adult_verified`；26 篇 story JSON 均為 `review_status: adult_verified`；`current.json` 未改。
- 檢查：使用 repo 根層權威測試 `node tests/check-bedtime-week-rotation.js`、`node tests/check-bedtime-sensory.js`，以及 bedtime 內 `python3 tools/check-bedtime-story.py`。不要在 `bedtime/tests/` 另建同名重複測試，避免假綠燈遮蔽根層權威測試。
- 工具注意：`generate-bedtime-audio.py` 已允許「命令列明確指定且 story JSON 存在」的 id 直接合成，解決 pending/樣板故事合成前尚未 catalog verified 的雞生蛋問題。`check-bedtime-story.py` 無參數預設檢查 `adult_verified + available` 輪播故事；草稿或 pending 篇必須明確帶 id 檢查。
