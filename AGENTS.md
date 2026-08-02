# Apple

本資料夾是 Apple 的本尊位置，同時也是一個 **git repo**（GitHub: `jammieaiwriter-jpg/apple`）。修改一律在這裡進行並記得 commit + push，不要在其他地方另存複本。

## 目前內容

- `tutor-skill/apple-math-tutor/` — 數學助教 skill，分析錯題截圖（`錯題/`）與遊戲錯題（`game-mistakes.json`），對照幼兒園大班數學課綱出題
- `questions.json`、`apple-mistakes.md` — 錯題記錄與弱點追蹤
- `英文/` — 佳音美語教材，搭配 `.claude/skills/joy-unit-builder`（全域 skill，不在本資料夾內，見下方）使用
- `piano/` — 鋼琴練習
- `bedtime/` — 晚安故事（跟光哥、阿築共用同一套生成邏輯，見 `.codex/skills/bedtime-story-publisher`）
- `joy/`、`docs/`、`tests/` — 佳音教材建置相關
- `.claude/skills/bedtime-audio/` — 專案內建 skill（已經是正確的 SSOT 模式，Claude 在此資料夾工作時會自動發現）

## 不在這裡的相關內容

- `joy-unit-builder` skill 本體是 Claude 全域 plugin skill（`~/.claude/skills/joy-unit-builder`），不會搬進來，用 `/joy-unit-builder` 呼叫即可。
- `bedtime-story-publisher` skill 目前在 `~/.codex/skills/`，服務 Apple/光哥/阿築三個小孩，屬於共用工具，不搬進單一小孩資料夾。

## 給 AI 工具的提醒

- 這裡是 Apple 的單一本尊，Codex/Claude 指到這個資料夾工作時，看到的就是完整、最新的內容（含未 push 的本機修改）。
- 光哥/小鑽石的 TEAMMS 專案部署時會 clone 這個 repo，把建置好的檔案放進 `diamond/` 資料夾再 push——所以不要隨意更動 repo 結構或刪除看起來「用不到」的資料夾。
