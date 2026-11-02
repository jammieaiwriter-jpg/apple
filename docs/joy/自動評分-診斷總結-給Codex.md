# 診斷總結：Joy 複習頁「語音自動評分」在 iPad 上失效

## 問題
課後複習頁（`apple/joy/unit1-review.html`、`unit2-review.html`）的「🎤 開始念 → ⏹ 念好了 → 自動打分」，在女兒的 **iPad Safari** 上**收不到辨識結果**，一直顯示「沒聽清楚」，最後只能手動點星。
**對照組：哥哥的 OiKID 頁面（`oikid-reading-coach/lv7-*.html`）在「同一台 iPad」及 iPhone 上語音辨識正常。** 兩者同網域（`jammieaiwriter-jpg.github.io`）、同 `webkitSpeechRecognition`。所以是 **Joy 的寫法**跟 OiKID 有差，不是裝置/權限不支援。

## 已確認 / 已排除
- ✅ `srSupported` = true（按鈕顯示「開始念」）→ 這台 iPad **有** SpeechRecognition。
- ✅ 沒有出現「辨識問題：not-allowed/service-not-allowed」→ 不是被權限直接擋（recognition 有 start、有 end，但 `recText` 是空的）。
- ✅ 已試 `interimResults` = true 和 false，都不行。
- ✅ 已移除 Azure 的 HTML5 `Audio`（`azureOK=false`、拿掉 `unlockAudio` 的 Audio 播放），改回瀏覽器 speechSynthesis（比照 OiKID）→ 仍不行。
- ✅ 辨識邏輯（continuous + onend 自動重啟 + 按停才結算）已比照 OiKID。
- ✅ JS 語法檢查通過、線上版本確認是最新（目前 v9）。

## 最可能的原因（依優先序，請 Codex 逐一處理）

### 1.（先做這個，零程式）確認是不是「加入主畫面」的 standalone 模式
iOS 有個已知雷：**加到主畫面的網頁 App（standalone PWA）裡，`webkitSpeechRecognition` / 麥克風常常不作用；但在正常 Safari 分頁裡就正常。**
→ 請先讓女兒**直接用 Safari 分頁**開複習頁（不要用主畫面圖示）測一次。哥哥很可能就是用 Safari 分頁開 OiKID 的。**若分頁可、圖示不可，就是這個原因**，那 standalone 下要改用別的方案或提示用 Safari 開。

### 2.（最可能的程式差異）`r.start()` 沒有「在使用者手勢的同步流程裡第一時間呼叫」
OiKID 的 `rec()` 是**按鈕 onclick 直接呼叫**，函式內幾乎沒做別的事就 `r.start()`。
Joy 的 `startSpeaking()` 在 `beginSpeech()`（→`r.start()`）之前先做了 `stopSpeaking()`、`window.speechSynthesis.cancel()`、`state.listening=true`、**`render()`（重建整個句子清單等大量 DOM）**、再設文字，才 start。iOS 對「啟動麥克風必須緊接在使用者手勢」很敏感，前面這些（尤其 `speechSynthesis.cancel()` 與 `render()`）可能讓 start 失去手勢脈絡 → 麥克風不啟動 → 收到空結果。
→ **改法：點下「開始念」後，第一件事就是 `recognition.start()`，把 render()/文字更新等都移到 start 之後或拿掉。**

### 3.（建議）改成 OiKID 的「兩顆獨立按鈕」，不要用單鈕切換
目前 Joy 用同一顆 `recordButton` 靠 `state.listening` 切換「開始/念好了」，可能有狀態時序問題。OiKID 是 **Start 鈕 + Stop 鈕**兩顆，Stop 的 onclick 在 `rec()` 內即時綁定。
→ 直接照 OiKID 的兩鈕結構做（見下方原始碼），最穩。

### 4.（診斷手段）用 Mac + 傳輸線連 Safari 網頁檢查器看 Console
iPad Safari 設定→進階→開啟「網頁檢查器」，Mac 用 Safari→開發→[iPad]→該頁，看 `onerror`/`onresult`/`onend` 實際觸發與錯誤。這是唯一能看到「為什麼空」的方法，比繼續猜有效。建議在 `onresult/onerror/onend` 暫時加 `console.log`。

---

## OiKID 原始可用程式碼（請 1:1 照抄這個結構）

### HTML（每個練習項目三個元素）
```html
<button class="btn ok"   id="line-0-start" onclick="rec('line-0', t=>scoreLine(0,t))">開始念</button>
<button class="btn warn" id="line-0-stop"  disabled>念好了</button>
<div class="result" id="line-0-out"></div>
```

### JS（speak 用瀏覽器語音；rec 是辨識核心）
```js
function speak(t,r=.82){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=r;window.speechSynthesis.speak(u)}

function SR(){return window.SpeechRecognition||window.webkitSpeechRecognition}

function rec(id,cb){
  const C=SR(),out=document.getElementById(id+'-out'),start=document.getElementById(id+'-start'),stop=document.getElementById(id+'-stop');
  if(!C){out.textContent='此瀏覽器不支援語音辨識。';return}
  let text='',stopped=false;
  const r=new C();
  r.lang='en-US';r.continuous=true;r.interimResults=false;
  r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)text+=e.results[i][0].transcript+' '};
  r.onend=()=>{
    if(!stopped){setTimeout(()=>{try{r.start()}catch(e){}},120);return}
    if(start)start.disabled=false;if(stop)stop.disabled=true;
    cb(text.trim())
  };
  if(start)start.disabled=true;
  if(stop){stop.disabled=false;stop.onclick=()=>{stopped=true;try{r.stop()}catch(e){}setTimeout(()=>{try{r.abort()}catch(e){}},1200)}}
  out.textContent='Listening...';
  try{r.start()}catch(e){out.textContent='請再按一次。'}
}

// 文字正規化與評分（OiKID）
function expandSpokenDigits(s){const n=['zero','one','two','three','four','five','six','seven','eight','nine'];return String(s||'').replace(/\d+/g,m=>' '+m.split('').map(d=>n[Number(d)]).join(' ')+' ')}
function norm(s,expandDigits=false){const raw=expandDigits?expandSpokenDigits(s):String(s||'');return raw.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function sim(a,b){if(a===b)return true;if(Math.abs(a.length-b.length)>2)return false;let d=Math.abs(a.length-b.length);for(let i=0;i<Math.min(a.length,b.length);i++)if(a[i]!==b[i])d++;return d<=1}
```

> Joy 已有 `scoreSpeech()` 可直接拿來當 cb 內的評分（`scoreSpeech(expected, heard).stars`），不必照搬 OiKID 的 scoring。重點是把**辨識擷取（rec）**換成 OiKID 這套、並用兩鈕結構、start 第一時間呼叫。

## 建議 Codex 的最小可行改法
1. 先做「原因 1」的 Safari 分頁測試（可能直接解掉，零程式）。
2. 若程式要改：把複習頁「對話」面板的辨識，**整段換成上面 OiKID 的兩鈕 `rec()` 寫法**：start 鈕 onclick → `rec('line-N', t => { const s = scoreSpeech(line.text, t).stars; setScore(s); })`；start 內**第一時間 `r.start()`**，前面不要 `render()`。
3. 單字面板同理（OiKID 也是 `rec('vocab-N', ...)`）。
4. TTS 維持瀏覽器 speechSynthesis（已改），複習頁**不要用 HTML5 Audio**（會佔麥克風）。
5. 用網頁檢查器確認 `onresult` 有收到文字後再收工。

## 現況檔案
- 複習頁：`/Users/emma/02_小孩教育/Apple/joy/unit1-review.html`、`unit2-review.html`（目前 v9，已是瀏覽器語音、無 HTML5 Audio）
- OiKID 參考頁：`oikid-reading-coach` repo 的 `lv7-10.html` 等
- 部署：`gh` API 推到 `jammieaiwriter-jpg/apple` 的 `joy/`，**需可連網環境**（沙箱會讓 gh/base64 變 command not found）；用絕對路徑 `/opt/homebrew/bin/gh`、`/usr/bin/base64`。
