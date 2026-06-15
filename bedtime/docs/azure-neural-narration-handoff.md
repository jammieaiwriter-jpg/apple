# Azure Neural 睡前故事朗讀定案

本文件是後續由 Claude 撰寫、修稿或審核故事時的朗讀定案。除非 Emma 明確要求重新調音，請沿用以下設定，不要改回瀏覽器語音，也不要自行更換音色或節奏。

## 已確認的聲音

- 正式音色：Microsoft Azure Speech `zh-TW-HsiaoChenNeural`
- Azure 區域：`eastasia`
- 音訊格式：`audio-24khz-48kbitrate-mono-mp3`
- SSML：`<prosody rate="-15%" pitch="-2%">`
- 成人實際試聽結論：音質很棒，適合作為後續故事的正式朗讀聲音。
- 公開試聽網址：<https://apple-bedtime-story.onrender.com>

## 不可改動的播放規則

- 前端把整篇故事當成**單一連續音檔** `audio/<storyId>.mp3` 播放（段落停頓已燒成靜音）。
- 單一連續音檔才能在 iOS 鎖屏／背景持續播放；故**不再**逐段以 JS 計時器接續，也移除了「切到背景就暫停」。
- 音檔載入或播放失敗時，才退回瀏覽器 `speechSynthesis`（固定 `zh-TW`、`rate = 0.78`、`pitch = 1`，一次讀完整篇）。
- 進度以 `audio.currentTime`（秒）保存於 `localStorage`，續播從上次秒數接續；不再以段落索引記錄。
- 燒進音檔的停頓：段落之間 `0.9` 秒、進入 `wind_down.scene` 前 `1.9` 秒、`wind_down` 各段之間 `2.3` 秒。
- 以上停頓已配合 `rate="-15%"` 的較慢語速縮短；如要再調停頓或語速，改 `tools/generate-bedtime-audio.py` 的常數後重跑產生音檔。
- 設定 `MediaSession` 中繼資料（標題／核心詞），讓鎖屏控制列顯示並可暫停／繼續。
- 不為了改善聲音而破壞暫停、續播、重新播放、進度保存或每晚輪播。

## 靜態音檔（GitHub Pages 正式站）

- 正式對外站是 GitHub Pages：<https://jammieaiwriter-jpg.github.io/apple/bedtime/>。它是純靜態托管，**無法執行 `server.py`**，所以 `/api/tts` 在那裡不存在。
- 因此整篇朗讀要事先用 Azure 產生、合併成**一篇一個** `audio/<storyId>.mp3`、提交進版本庫，靜態站才能播出真正的 `zh-TW-HsiaoChenNeural` 並支援鎖屏／背景播放；否則只會退回瀏覽器語音。
- 產生流程（需 `ffmpeg`；金鑰由 `bedtime/.env` 讀取，不會寫入檔案或輸出）：

```bash
cd bedtime
python3 tools/generate-bedtime-audio.py            # 重建所有可播放故事
python3 tools/generate-bedtime-audio.py week01     # 只重建指定故事
python3 tools/generate-bedtime-audio.py --force    # 文字改過時強制重合成
```

- 腳本兩階段：① 用 `server.synthesize` 逐段合成（SSML、音色、`rate="-15%" pitch="-2%"`、音訊格式與 Render 代理完全相同），段落暫存於 `audio/<storyId>/`；② 用 ffmpeg 把各段與「燒成靜音的停頓」串成單一 `audio/<storyId>.mp3`。
- **只提交 `audio/<storyId>.mp3`**；`audio/<storyId>/`（逐段）與 `audio/.silence/`（靜音）是可重建的中介檔，已在 `.gitignore` 排除。
- **改寫或新增故事後，務必 `--force` 重跑此腳本並提交對應的合併 mp3**，否則該篇在 GitHub Pages 會退回瀏覽器語音。

## 破音字（多音字）發音修正

- 神經語音偶爾把多音字念錯調。修正集中在 `server.py` 的 `PRONUNCIATIONS`，用 SSML `<phoneme>` 指定讀音；因為 `build_ssml` 同時供 Render 代理與產生腳本使用，改一處即可同步生效。
- **zh-TW 的 `sapi` 音標吃注音（Bopomofo），不是拼音**：格式為 `<phoneme alphabet="sapi" ph="ㄕㄨˇ">數</phoneme>`（拼音 `shu3` 會回 HTTP 400）。
- 已修：`數`（動詞「數數」）→ `ㄕㄨˇ`（三聲）；以負向斷言略過名詞讀音 `數量`／`數學`／`字數`（四聲 `ㄕㄨˋ`）。
- 新增修正後，受影響的故事要 `--force` 重新產生音檔，成人再實際試聽確認調值正確（程式只能確認 Azure 接受 SSML，不能保證聽感）。

## Claude 寫稿與修稿規則

- 所有新故事必須以 `zh-TW-HsiaoChenNeural` 實際聽感為準，不再以瀏覽器系統語音作主要判斷。
- 使用台灣六歲孩子能理解的自然口語，避免課本腔、抽象說明與生硬成語。
- 以短句、逗號與適量「……」形成呼吸；不要在正文寫出「（空格）」。
- `~` 僅能極少量使用，且必須實際試聽確認不會被怪異朗讀。
- 語助詞、疊字、聲音詞與氣音要自然，不可為達數量硬塞。
- 越接近故事結尾，句型、情緒與聲音刺激應逐漸放慢、放輕。
- 每篇修稿後仍需成人從公開網址完整試聽；自動評分或 Claude 審核不能取代成人試聽。

## 技術與秘密規則

- Azure Key 只能放在本機 `.env` 或 Render 的秘密環境變數 `AZURE_SPEECH_KEY`。
- 絕對不可將 Key 寫進 HTML、JSON、Markdown、程式碼、測試輸出或 Git commit。
- `AZURE_SPEECH_REGION=eastasia`
- `AZURE_SPEECH_VOICE=zh-TW-HsiaoChenNeural`
- 本機代理：`server.py`
- Render 部署設定：`render.yaml`
- 公開服務為 Render 免費方案；閒置後首次開啟可能需等待約 50 秒喚醒。

## 每篇故事完成檢查

1. 從公開網址選擇該篇故事並完整試聽。
2. 確認實際使用 `zh-TW-HsiaoChenNeural`，不是瀏覽器備援。
3. 確認標點沒有造成怪異停頓或把符號念出來。
4. 確認角色對話自然，沒有刻意裝可愛或過度高亢。
5. 確認中後段逐漸安靜，能順暢進入 `wind_down`。
6. 成人明確通過後，才可標記 `adult_verified`。

## 驗證指令

```bash
curl https://apple-bedtime-story.onrender.com/api/tts/status
node bedtime/tests/check-bedtime-azure-tts.js
```

狀態端點應回傳：

```json
{
  "enabled": true,
  "voice": "zh-TW-HsiaoChenNeural",
  "region": "eastasia"
}
```
