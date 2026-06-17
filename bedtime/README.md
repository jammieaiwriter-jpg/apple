# 睡前故事

這是一個讓六歲孩子自行操作、閉眼聆聽的床邊故事頁面。孩子點一次「開始今晚的故事」後，系統會優先使用 Azure Speech 的 `zh-TW-HsiaoChenNeural` 音色，失敗時自動退回瀏覽器 `speechSynthesis`，依序播放完整故事與收心晚安段落。

## Azure 語音試聽

Azure Speech 金鑰只放在伺服器環境變數，不可寫進 HTML 或提交到版本庫。設定完成後以內建代理伺服器啟動：

```bash
AZURE_SPEECH_KEY='你的金鑰' AZURE_SPEECH_REGION='eastasia' python3 server.py --port 8123
```

也可將設定放在已被 Git 忽略的本機 `.env`，此時直接執行 `python3 server.py --port 8123`。開啟 `http://localhost:8123` 即可試聽。若未設定 Azure、額度不足或呼叫失敗，頁面仍會自動改用原本的瀏覽器語音。

網頁版使用 Render Web Service 部署，設定檔為 `render.yaml`。部署平台的秘密環境變數需設定 `AZURE_SPEECH_KEY`；區域與音色已固定為 `eastasia` 與 `zh-TW-HsiaoChenNeural`。免費服務閒置後可能休眠，首次開啟需等待喚醒。

## 內容節奏：一週一主題、每晚換故事

每一週是一個核心詞主題（例如 W01「友情」），主題固定拆成五個依序切點，一切點一篇獨立故事。夜間頁在「本週主題」內依切點順序每晚自動換下一篇**已審閱**（`adult_verified`）的故事，跨日才換片；同一晚重開會沿用當晚那篇並從上次的段落續播。輪播只收 `adult_verified` 的故事，草稿（`pending_adult_review`）只能在 Podcast 選單裡試聽，不會進入夜間輪播，成人審閱 gate 因此自然守住。輪播狀態存在 `localStorage` 的 `apple-bedtime-rotation-v1`（記 `date`／`week`／`index`）。

## 生產流水線（固定流程・低 token）

故事量產走**固定五步**。只有第 1、3 步用到 LLM（會花 token）；其餘都是 repo 裡的**普通腳本**，誰都能直接跑、零 token。所有腳本都在 `bedtime/tools/`（產物）或 repo 根的 `tests/`（資料契約），**不藏在任何 `.claude/` skill 裡**；`bedtime-audio` skill 只是 Claude 的方便包裝，本體就是下面的 `tools/generate-bedtime-audio.py`。

規格與交接：[docs/format-revamp-handoff.md](docs/format-revamp-handoff.md)（給 Codex 的交接單）、[stories/season01-plan.md](stories/season01-plan.md)（架構矩陣／前言／聲線）、[docs/story-scoring-rubric.md](docs/story-scoring-rubric.md)（評分）、[docs/tts-audio-writing-guide.md](docs/tts-audio-writing-guide.md)（對白寫法）。

| 步 | 做什麼 | 指令 | Token |
|---|---|---|---|
| 0 | **先抽配方卡**：依切點抽一組配方（形狀／主角／場景／情緒／解法／感官／結尾＋自動禁用元素），Codex 照配方寫 | `python3 tools/draw-recipe.py --facet "<切點>" --theme <核心詞> --id <id>` | 零 |
| 1 | **Codex 寫稿**：照配方卡改成 `pending_adult_review` 草稿（含 `shape`/`protagonist`/`scene`/`emotion_arc`/`resolution`/`dominant_sense`/`ending_style`/`prologue`/`voices`/`turns`/`text`） | `$bedtime-story-publisher` skill | 用（LLM） |
| 2 | **格式自檢**（硬性全自動）：欄位／6 段／`text`==turns 串接／focus／形狀輪替／時長 | `python3 tools/check-bedtime-story.py <id>` | 零 |
| 3 | **Claude 審稿**：只評寫作品質（rubric 八維度），格式錯誤已被第 2 步擋掉 | Claude 依 rubric | 用（LLM） |
| 4 | **Codex 合成童聲（兩套）**：每句逐輪換聲音、拼成 `audio/<id>.mp3`；再產兄妹版 `.gz` | `generate-bedtime-audio.py <id>`＋`… --name "光哥、阿築" --suffix gz` | 零 |
| 5 | **Codex 上線**：設 `adult_verified`、補 `catalog.json` → 跑資料契約測試 → commit/push | `node tests/check-bedtime-week-rotation.js` 等 + git | 零 |

**分工（2026-06 起）**：Claude 只做「動腦」——抽配方（步 0）與審稿（步 3）；**寫稿、合成音檔、補 catalog、部署（步 1、4、5）都由 Codex 做**。省 token 的關鍵：所有機械性步驟都是腳本，Claude 的 LLM 額度只花在「評品質」。Codex 交稿前先自跑 `check-bedtime-story.py` 清乾淨，Claude 審稿不必花 token 抓格式。

W04–W12 的配方卡已預抽好（`stories/recipes/`），每週交辦單見 `docs/handoff-W04.md`…`handoff-W12.md`。

一次最多兩篇，Emma 陪聽無誤再進下一批。

## 夜間體驗

- 開場顯示「本週主題 · W0X 核心詞」儀式列、今晚故事標題與核心詞，每個國字右側以 flex 容器顯示直式注音。
- 首頁下方提供 Podcast 式第一季故事選單，依週分組逐篇列出；今晚故事、草稿試聽與規劃中集數有清楚狀態。每週第一列右側顯示核心詞與注音，點可播放故事會立即開始朗讀。
- 播放約 20 秒後畫面逐漸變暗；點暗幕可短暫顯示控制。
- 控制只包含開始、暫停、繼續與重新播放。
- 朗讀使用 Azure `zh-TW-HsiaoChenNeural`，事先合成為**整篇一個** `audio/<storyId>.mp3`，段落停頓（0.9／1.9／2.3 秒）燒成靜音播放；載入或播放失敗才退回 `zh-TW` 系統語音。
- 整篇是單一連續音檔，iOS 鎖屏／切到背景仍會繼續播放，並透過 `MediaSession` 顯示鎖屏控制；不再逐段以計時器接續，也不再「切到背景就暫停」。
- 暫停或語音錯誤時暫停當前音檔；繼續後從上次秒數接續。
- `localStorage` 保存播放秒數（`audio.currentTime`），重新開頁可從上次的地方繼續。
- 夜間不顯示故事全文，也沒有問題、選項、提示、跟讀或評量。

## 故事資料

故事檔（如 `stories/week01-2b.json`）使用根層 `theme_word`、`intro`、`prologue`、`voices`、`sections` 與 `wind_down`。**新模式（2026-06 起）**：每篇宣告 `shape`（六形狀之一）、`prologue`（點題前言）、`voices`（旁白＋兩童聲），`sections[].turns` 是帶 `role` 的對白輪、`sections[].text` 為 turns 串接（供瀏覽器後備與閱讀）。長度以**合成後 MP3 落 8–10 分鐘**為硬性判定（取代舊「≥2,000 字」；對白＋停頓使同時長字數更少），字數只剩軟性參考。發布由 Claude 依 rubric 達標後設 `adult_verified`（家長 Emma 已授權事後陪聽把關）。欄位完整規格見 [docs/format-revamp-handoff.md](docs/format-revamp-handoff.md)。

故事正文須遵循 [TTS 聽覺優化寫作準則](docs/tts-audio-writing-guide.md)：以短句、自然標點、適量口語助詞、疊字與聲音詞增加真人說故事的呼吸感；文字評分不能取代實際 TTS 試聽。

後續由 Claude 寫稿、修稿或審核時，須同時遵循 [Azure Neural 睡前故事朗讀定案](docs/azure-neural-narration-handoff.md)，沿用已通過成人試聽的音色、SSML、部署與秘密金鑰規則。

`stories/catalog.json` 保存十二週 Podcast 選單、核心詞注音與完成狀態；每週以 `stories[]` 列出該週多篇故事（id／標題／狀態／available）。`stories/current.json` 指向今晚正式故事，並用來決定「本週」是哪一週——夜間輪播會在該週的 `adult_verified` 故事之間每晚換片。

分工（2026-06-16 定）：**Codex 全改／全寫、Claude 審**。Codex 用 `$bedtime-story-publisher` skill 寫 `pending_adult_review` 草稿 → 自跑 `python3 tools/check-bedtime-story.py <id>`（格式硬性自檢）→ Claude 依 [docs/story-scoring-rubric.md](docs/story-scoring-rubric.md) 評分（達標／待修／退回）→ 達標由 Claude 跑 `tools/generate-bedtime-audio.py` 產童聲音檔並設 `adult_verified` 上線。完整步驟見上方「生產流水線」。

## 首版限制

- 改用單一連續音檔後，iPhone Safari 鎖屏／切到背景可繼續播放（靠 `MediaSession`）；但低耗電模式或關閉分頁仍可能中止，且需由使用者手勢開始播放。
- 週末親子回顧會另做獨立頁面；首版只在故事資料保留不評分的對話提示。

## 驗證腳本

從 **repo 根**執行。新格式的逐篇硬性閘門是 `check-bedtime-story.py`；其餘 `tests/*.js` 驗資料契約與夜間頁邏輯。

`python3 bedtime/tools/check-bedtime-story.py [id...]`（**新格式主閘門**）：欄位齊全（含 `shape`/`prologue`/`voices`）、正好 6 段、對白格式 `text`==turns 串接且 role 合法、`focus` 屬本週切點、`shape` 不與輪播前一晚同形、（已合成則）時長 8–10 分。無參數＝檢查全部有檔故事。退出碼非 0 即有篇需修。

執行 `node tests/check-bedtime.js` 驗證資料契約與夜間頁面禁用舊互動。**（注意：此檔與 `check-bedtime-podcast-catalog.js` 目前在 main 上即失敗，因仍檢查已移除的舊播放架構 token，如 `completedSection`／`begin(0)`；待修，與本次改版無關。）**

執行 `node tests/check-bedtime-season.js` 驗證 W08 壓力測試與第一季計畫：六段結構、單一核心詞、嵌入式人物故事、行動式週末問題及 12 週六欄完整性。角色是否以行動呈現核心詞仍須成人人工驗收。

執行 `node tests/check-bedtime-podcast-catalog.js` 驗證十二週 Podcast 選單、可播放故事檔與狀態。

執行 `node tests/check-bedtime-week-rotation.js` 驗證「主題 → 切點 → 故事」模型：W01 友情多篇結構與字數、每週 `facets` 與每篇 `focus` 合法（focus 必屬宣告切點、切點不重複）、輪播只收 `adult_verified`、`current.json` 對應週有可輪播故事，以及夜間頁的輪播邏輯（`pickTonight`／`weekRotationPool`／本週主題儀式）。

執行 `node tests/check-bedtime-sensory.js` 跑五感畫面助言檢查：逐篇列出觸及的感官、提醒哪一段缺畫面或缺聲音／觸感。此檢查只提醒、不阻擋發布，是寫作輔助而非 gate。
