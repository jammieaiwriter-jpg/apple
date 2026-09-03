(function(){
  'use strict';
  var VERSION = 'v12-letter-spelling-slots-20260808';
  if (window.__joyReviewFixVersion === VERSION) return;
  window.__joyReviewFixVersion = VERSION;

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }
  function injectStyle(){
    if(document.getElementById('joy-review-fix-style')) return;
    var st=document.createElement('style');
    st.id='joy-review-fix-style';
    st.textContent='.bpmf{font-size:18px;line-height:1.7;color:#145a51;font-weight:800;margin:4px 0 10px}.sound-target{font-size:clamp(30px,8vw,48px);font-weight:950;color:#145a51;margin:10px 0}.mini-note{font-size:14px;color:#667085;margin-top:4px}.tabs{display:none!important}.joy-section-title{margin:32px 0 10px;padding-top:16px;border-top:2px solid #e7e0d2;color:#145a51;font-size:24px;font-weight:950}.joy-section-title:first-child{border-top:0;margin-top:8px}.joy-section-finish{margin:8px 0 24px;text-align:center}.joy-flow-note{color:#667085;font-size:14px;margin:-2px 0 12px}.joy-parent-card{border:2px solid #207f71;background:#f1fbf7;border-radius:12px;padding:18px;text-align:center;margin:30px 0 16px}.joy-parent-card .big{margin:0 0 8px}.joy-parent-card .next{width:100%;max-width:320px}.joy-report-status{min-height:24px;color:#145a51;font-weight:800;margin-top:10px}';
    document.head.appendChild(st);
  }

  var HOMO = {
    write:'write', right:'write',
    to:'to', too:'to', two:'to',
    i:'i', eye:'i',
    are:'are', r:'are',
    be:'be', bee:'be',
    see:'see', sea:'see',
    hear:'hear', here:'hear',
    no:'no', know:'no',
    one:'one', won:'one',
    for:'for', four:'for',
    hi:'hi', high:'hi',
    there:'there', their:'there', theyre:'there'
  };
  function canonWord(w){ return HOMO[w] || w; }
  function soundCode(word){
    var s=String(word||'').toUpperCase().replace(/[^A-Z]/g,'');
    if(!s) return '';
    var map={B:'1',F:'1',P:'1',V:'1',C:'2',G:'2',J:'2',K:'2',Q:'2',S:'2',X:'2',Z:'2',D:'3',T:'3',L:'4',M:'5',N:'5',R:'6'};
    var out=s.charAt(0), last=map[out]||'';
    for(var i=1;i<s.length && out.length<4;i++){
      var code=map[s.charAt(i)]||'';
      if(code && code!==last) out+=code;
      last=code;
    }
    return (out+'000').slice(0,4);
  }
  function editDistance(a,b){
    var row=[], i, j;
    for(i=0;i<=b.length;i++) row[i]=i;
    for(i=1;i<=a.length;i++){
      var prev=row[0]; row[0]=i;
      for(j=1;j<=b.length;j++){
        var old=row[j];
        row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a.charAt(i-1)===b.charAt(j-1)?0:1));
        prev=old;
      }
    }
    return row[b.length];
  }
  function isNearSingleWord(expected,heard){
    if(soundCode(expected)!==soundCode(heard)) return false;
    var distance=editDistance(expected,heard);
    if(distance<=Math.max(2,Math.floor(Math.max(expected.length,heard.length)/2))) return true;
    // ASR often hears a final /g/ as /k/ and also changes the vowel spelling:
    // wig -> week, big -> beak. Accept that narrow one-word failure mode.
    return /g$/.test(expected) && /k$/.test(heard) && distance<=3;
  }
  window.scoreSpeech = function(expected, heard){
    var rawE=window.normalizeSpeech(expected).split(' ').filter(Boolean);
    var rawH=window.normalizeSpeech(heard).split(' ').filter(Boolean);
    // A child is reading the displayed single word. When Apple/Google ASR picks
    // a near-homophone such as wig -> week, do not turn a good attempt into a
    // one-star result. Sentences keep the stricter word-by-word score below.
    if(rawE.length===1 && rawH.length===1 && isNearSingleWord(rawE[0],rawH[0])) return {stars:5};
    var e=rawE.map(canonWord);
    var h=rawH.map(canonWord);
    if(!h.length) return {stars:0};
    var cur=0, matched=0;
    for(var i=0;i<e.length;i++){ var at=h.indexOf(e[i],cur); if(at!==-1){matched++;cur=at+1;} }
    var coverage=matched/Math.max(e.length,1);
    var penalty=Math.max(h.length-e.length-2,0)*0.04;
    var pct=Math.max(0,Math.min(1,coverage-penalty));
    var stars=Math.ceil(pct*5+0.25);
    if(matched===e.length) stars=5;
    if(matched===0) stars=1;
    if(stars===0&&h.length) stars=1;
    return {stars:stars};
  };

  var isRecording=false;
  function setListeningLocked(lock){
    isRecording=!!lock;
    [].forEach.call(document.querySelectorAll('button.listen'), function(b){ b.disabled=isRecording; });
  }
  window.joySetListeningLocked=setListeningLocked;
  if(typeof window.speak === 'function' && !window.speak.__joyLocked){
    var oldSpeak=window.speak;
    var lockedSpeak=function(text, role, onEnd){
      if(isRecording){ if(onEnd) setTimeout(onEnd,0); return; }
      return oldSpeak.call(this,text,role,onEnd);
    };
    lockedSpeak.__joyLocked=true;
    window.speak=lockedSpeak;
  }
  if(typeof window.rec === 'function' && !window.rec.__joyLocked){
    var oldRec=window.rec;
    var lockedRec=function(id, cb){
      var C=(window.SpeechRecognition||window.webkitSpeechRecognition);
      if(!C) return oldRec.call(this,id,cb);
      setListeningLocked(true);
      var start=document.getElementById(id+'-start');
      var stop=document.getElementById(id+'-stop');
      var poll=setInterval(function(){
        if(start && !start.disabled && (!stop || stop.disabled)){
          clearInterval(poll);
          setListeningLocked(false);
        }
      },350);
      setTimeout(function(){ clearInterval(poll); if(start && !start.disabled) setListeningLocked(false); },15000);
      return oldRec.call(this,id,function(text){ clearInterval(poll); setListeningLocked(false); cb(text); });
    };
    lockedRec.__joyLocked=true;
    window.rec=lockedRec;
  }

  function removeTalkGame(){
    var tab=document.getElementById('tab-talkgame');
    var panel=document.getElementById('panel-talkgame');
    if(tab) tab.remove();
    if(panel) panel.remove();
    if(typeof window.switchTab === 'function' && !window.switchTab.__joyNoTalk){
      var fixed=function(t){
        var names=['dialog','vocab','phonics','grammar','wordgame'];
        if(t==='talkgame') t='dialog';
        names.forEach(function(name){
          var tb=document.getElementById('tab-'+name), pn=document.getElementById('panel-'+name);
          if(tb) tb.classList.toggle('active', t===name);
          if(pn) pn.classList.toggle('hide', t!==name);
        });
        if(t==='phonics' && window.CH && CH.phonics) CH.phonics.start();
        if(t==='grammar' && window.CH && CH.grammar) CH.grammar.start();
        if(t==='wordgame' && typeof window.wgStart==='function') window.wgStart();
      };
      fixed.__joyNoTalk=true;
      window.switchTab=fixed;
    }
  }

  function slotCue(graph,idx){
    // Show the actual spelling with one blank. A child can answer from the
    // visible word shape without needing to count positions or read a label.
    return graph.map(function(gp,i){ return i===idx ? '＿' : gp.g; }).join(' ');
  }
  function reviewGraph(ex){
    // This review activity is spelling practice: every visible slot must map
    // to one written letter, even when IPA groups several letters together.
    var letters=String(ex.w||'').replace(/[^A-Za-z]/g,'').split('');
    return letters.map(function(letter){ return {g:letter, p:letter}; });
  }
  function uniqueTiles(){
    var pool=[], seen={};
    if(typeof window.phExamples!=='function') return pool;
    window.phExamples().forEach(function(x){
      reviewGraph(x.e).forEach(function(gp){
        if(!gp.p) return;
        // The child sees only the grapheme, not its IPA metadata. Never turn
        // one visible letter into two contradictory answer buttons.
        var k=String(gp.g).toLowerCase();
        if(!seen[k]){ seen[k]=1; pool.push(gp); }
      });
    });
    return pool;
  }
  window.qPhonics=function(target){ return { mount:function(qEl,outEl,phase,settle){
    var firstTry=true;
    var graph=reviewGraph(target.e);
    if(!graph.length) graph=[{g:target.e.w,p:target.e.w}];
    var idx=Math.floor(Math.random()*graph.length);
    var answer=graph[idx];
    var answerKey=String(answer.g).toLowerCase();
    var opts=window.shuffle([answer].concat(window.shuffle(uniqueTiles().filter(function(gp){ return String(gp.g).toLowerCase()!==answerKey; })).slice(0,3))).slice(0,4);
    qEl.innerHTML='<div class="en">聽單字，選空格裡的字母</div>'
      +'<div class="sound-target">'+slotCue(graph,idx)+'</div>'
      +'<div class="mini-note">先聽清楚，再選空格裡的字母。</div>'
      +'<div class="row" style="justify-content:center"><button class="act listen" id="ph-listen">🔊 再聽一次</button></div>'
      +'<div id="ph-opts" class="game-grid">'+opts.map(function(gp,i){ return '<button class="opt" data-i="'+i+'" data-g="'+gp.g+'" data-p="'+gp.p+'">'+gp.g+'</button>'; }).join('')+'</div>';
    document.getElementById('ph-listen').onclick=function(){ window.speak(target.e.w,'together'); };
    var box=document.getElementById('ph-opts');
    box.onclick=function(e){
      var btn=e.target.closest('button[data-i]'); if(!btn||btn.disabled) return;
      var ok=(String(btn.dataset.g).toLowerCase()===answerKey);
      if(ok){
        outEl.textContent='答對了！這個音是 '+answer.g+'。';
        window.disableAll(box); window.speak(target.e.w,'together'); settle(firstTry);
      }else{
        firstTry=false;
        outEl.textContent='再聽一次，選空格裡的字母。';
        window.speak(target.e.w,'together');
      }
    };
    setTimeout(function(){ window.speak(target.e.w,'together'); },250);
  }}; };

  var BPMF={我:'ㄨㄛˇ',你:'ㄋㄧˇ',他:'ㄊㄚ',她:'ㄊㄚ',們:'ㄇㄣ˙',是:'ㄕˋ',很:'ㄏㄣˇ',好:'ㄏㄠˇ',還:'ㄏㄞˊ',可:'ㄎㄜˇ',以:'ㄧˇ',幫:'ㄅㄤ',忙:'ㄇㄤˊ',看:'ㄎㄢˋ',這:'ㄓㄜˋ',那:'ㄋㄚˋ',個:'ㄍㄜ˙',紅:'ㄏㄨㄥˊ',黃:'ㄏㄨㄤˊ',藍:'ㄌㄢˊ',綠:'ㄌㄩˋ',白:'ㄅㄞˊ',黑:'ㄏㄟ',大:'ㄉㄚˋ',小:'ㄒㄧㄠˇ',胖:'ㄆㄤˋ',瘦:'ㄕㄡˋ',開:'ㄎㄞ',心:'ㄒㄧㄣ',棒:'ㄅㄤˋ',名:'ㄇㄧㄥˊ',字:'ㄗˋ',叫:'ㄐㄧㄠˋ',什:'ㄕㄣˊ',麼:'ㄇㄜ˙',歐:'ㄡ',茲:'ㄗ',王:'ㄨㄤˊ',菲:'ㄈㄟ',尼:'ㄋㄧˊ',克:'ㄎㄜˋ',艾:'ㄞˋ',比:'ㄅㄧˇ'};
  function bopomofo(text){
    return String(text||'').split('').map(function(ch){ return BPMF[ch] || (/[,，。！？!?]/.test(ch)?' ':ch); }).join(' ').replace(/\s+/g,' ').trim();
  }
  function speakZh(text,onEnd){
    var done=false;
    function finish(){ if(done) return; done=true; if(onEnd) onEnd(); }
    try{
      window.speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(text);
      u.lang='zh-TW'; u.rate=0.9; u.volume=1;
      u.onend=finish; u.onerror=finish;
      window.speechSynthesis.speak(u);
    }catch(e){ finish(); }
  }
  window.qGrammar=function(i){ var q=window.grammar.quiz[i]; return { mount:function(qEl,outEl,phase,settle){
    var firstTry=true;
    var p=window.promptForGrammar(q);
    var zh=q.zh||'';
    qEl.innerHTML='<div class="en">'+p+'</div>'
      +'<div class="zh">'+zh+'</div>'
      +'<div class="bpmf">'+bopomofo(zh)+'</div>'
      +'<div class="row" style="justify-content:center;margin-bottom:10px"><button class="act listen" id="gr-listen">🔊 聽題目說明</button></div>'
      +'<div class="row" id="gr-opts" style="justify-content:center">'+window.beOptions.map(function(opt){ return '<button class="opt" data-opt="'+opt+'">'+opt+'</button>'; }).join('')+'</div>';
    document.getElementById('gr-listen').onclick=function(){ speakZh(zh); };
    var box=document.getElementById('gr-opts');
    box.onclick=function(e){
      var btn=e.target.closest('button[data-opt]'); if(!btn||btn.disabled) return;
      var opt=btn.dataset.opt;
      if(opt===q.answer){
        outEl.textContent='答對了！'+q.full;
        window.disableAll(box); window.speak(q.full,'abby'); settle(firstTry);
      }else{
        firstTry=false;
        outEl.textContent='再想想看，也可以按「聽題目說明」。';
      }
    };
  }}; };

  /* ===== 一頁式完成流程與家長通知 ===== */
  // The public page only knows the notification proxy URL. Keep the Telegram
  // bot token and chat id in the proxy's server-side secrets.
  var JOY_NOTIFY_ENDPOINT=window.JOY_NOTIFY_ENDPOINT||'https://bobo-math-notify.bobo-math-grader.workers.dev';
  var completed={dialog:false,vocab:false,phonics:false,grammar:false,wordgame:false};
  var speechAttempts={dialog:0,vocab:0};
  function unitLabel(){
    var h=document.querySelector('h1');
    return (h&&h.textContent.match(/Joy Unit\s+\d+/i)||['Joy Unit'])[0];
  }
  function addHeading(panelId,title,note){
    var panel=document.getElementById(panelId);
    if(!panel) return;
    panel.classList.remove('hide');
    if(document.getElementById('joy-heading-'+panelId)) return;
    var h=document.createElement('h2');
    h.id='joy-heading-'+panelId; h.className='joy-section-title'; h.textContent=title;
    panel.parentNode.insertBefore(h,panel);
    if(note){ var p=document.createElement('div'); p.className='joy-flow-note'; p.textContent=note; panel.parentNode.insertBefore(p,panel); }
  }
  function markComplete(key){
    completed[key]=true;
    var button=document.getElementById('joy-finish-'+key);
    if(button){ button.disabled=true; button.textContent='這一區已完成'; }
    renderParentCard();
  }
  /* 口說過關門檻（Emma 2026-09-03，比照小鑽石）：每句/每字要拿滿 5 顆星，
     或念滿 5 遍（只算真的有收到聲音、進到評分的那幾遍）。取代原本的「我已練習完這一區」自我申報按鈕。 */
  var joyBest={dialog:[],vocab:[]},joyAtt={dialog:[],vocab:[]},lastRec=null;
  function itemPassed(best,att){ return best===5||att>=5; }
  function speechList(key){ return key==='dialog'?(window.dialogueLines||[]):(window.vocab||[]); }
  function speechText(key,item){ return key==='dialog'?item.text:item.word; }
  function remainCount(key){
    var list=speechList(key),n=0;
    for(var i=0;i<list.length;i++){ if(!itemPassed(joyBest[key][i]||0,joyAtt[key][i]||0)) n++; }
    return n;
  }
  function addAutoStatus(key,panelId){
    var panel=document.getElementById(panelId);
    if(!panel || document.getElementById('joy-status-'+key)) return;
    var d=document.createElement('div'); d.className='joy-flow-note'; d.id='joy-status-'+key;
    panel.appendChild(d); refreshStatus(key);
  }
  function refreshStatus(key){
    var d=document.getElementById('joy-status-'+key); if(!d) return;
    var n=remainCount(key);
    if(n===0){ d.textContent='✅ 這一區達標，自動過關！'; if(!completed[key]) markComplete(key); }
    else d.textContent='還有 '+n+' 個沒達標（每個要拿 5 顆星，或念滿 5 遍）。';
  }
  function trackSpeechScores(){
    if(typeof window.scoreSpeech!=='function' || window.scoreSpeech.__joyThreshold) return;
    var old=window.scoreSpeech;
    window.scoreSpeech=function(expected,heard){
      var r=old(expected,heard);
      var key=null,idx=-1;
      if(lastRec && speechList(lastRec.key)[lastRec.idx] && speechText(lastRec.key,speechList(lastRec.key)[lastRec.idx])===expected){
        key=lastRec.key; idx=lastRec.idx;
      }else{
        ['dialog','vocab'].some(function(k){
          var list=speechList(k);
          for(var i=0;i<list.length;i++){ if(speechText(k,list[i])===expected){ key=k; idx=i; return true; } }
          return false;
        });
      }
      if(key!==null){
        joyAtt[key][idx]=(joyAtt[key][idx]||0)+1;
        joyBest[key][idx]=Math.max(joyBest[key][idx]||0,(r&&r.stars)||0);
        refreshStatus(key);
      }
      return r;
    };
    window.scoreSpeech.__joyThreshold=true;
  }  function reportText(){
    var sections=Object.keys(completed).filter(function(k){return completed[k];}).length;
    var dialogStars=(window.scores||[]).reduce(function(a,n){return a+(n||0);},0);
    var vocabStars=(window.vScores||[]).reduce(function(a,n){return a+(n||0);},0);
    return unitLabel()+' 複習完成，請家長確認。\n'
      +'已完成 '+sections+' / 5 區：對話、單字、發音、文法、單字遊戲。\n'
      +'口說嘗試：對話 '+speechAttempts.dialog+' 次、單字 '+speechAttempts.vocab+' 次。\n'
      +'星星紀錄：對話 '+dialogStars+' 顆、單字 '+vocabStars+' 顆。\n'
      +'孩子已主動按下「請家長確認」。';
  }
  function sendTelegram(button,status){
    if(!JOY_NOTIFY_ENDPOINT){ status.textContent='通知服務準備中，請家長稍後確認。'; return; }
    button.disabled=true; status.textContent='通知傳送中…';
    fetch(JOY_NOTIFY_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:reportText()})})
      .then(function(r){ if(!r.ok) throw new Error('send failed'); return r.json(); })
      .then(function(){ status.textContent='已傳送給家長。'; button.textContent='已傳送完成通知'; })
      .catch(function(){ status.textContent='暫時無法傳送，請再按一次。'; button.disabled=false; });
  }
  function renderParentCard(){
    var old=document.getElementById('joy-parent-card');
    var done=Object.keys(completed).filter(function(k){return completed[k];}).length;
    if(done<5){ if(old) old.remove(); return; }
    if(old) return;
    var card=document.createElement('section');
    card.id='joy-parent-card'; card.className='joy-parent-card';
    card.innerHTML='<div class="big">全部完成！</div><div class="zh">五區都達標了，按下按鈕請家長確認。</div><button class="next" type="button" id="joy-send-report">請家長確認，傳送完成通知</button><div class="joy-report-status" id="joy-report-status"></div>';
    document.querySelector('.wrap').appendChild(card);
    document.getElementById('joy-send-report').onclick=function(){ sendTelegram(this,document.getElementById('joy-report-status')); };
  }
  function wrapSpeechAttempts(){
    if(typeof window.recLine==='function' && !window.recLine.__joyTracked){
      var oldLine=window.recLine;
      window.recLine=function(i){ stopPlayAll(); speechAttempts.dialog++; lastRec={key:'dialog',idx:i}; return oldLine(i); };
      window.recLine.__joyTracked=true;
    }
    if(typeof window.recVocab==='function' && !window.recVocab.__joyTracked){
      var oldVocab=window.recVocab;
      window.recVocab=function(i){ stopPlayAll(); speechAttempts.vocab++; lastRec={key:'vocab',idx:i}; return oldVocab(i); };
      window.recVocab.__joyTracked=true;
    }
  }
  /* ===== 從預習頁搬過來的內容（2026-09-03）：整段連播、文法聽跟念、字母單音 ===== */
  /* Azure 真人聲只給「聽整段對話」這種純聽功能用；跟讀卡片旁邊就是麥克風，示範一律 speechSynthesis。
     開始收音前必須 azStop()，否則 iPad 上音訊通道會打架。載入失敗自動退回 window.speak。 */
  var TTS_BASE='https://apple-bedtime-story.onrender.com';
  var AZ_VOICE={nick:'en-US-GuyNeural',abby:'en-US-JennyNeural',fifi:'en-US-AnaNeural',sam:'en-US-GuyNeural',ann:'en-US-JennyNeural',together:'en-US-AriaNeural'};
  var azCache={},azActive=null;
  function azStop(){ if(azActive){ azActive.onended=null; try{azActive.pause();}catch(e){} azActive=null; } }
  function azWarm(){ try{ fetch(TTS_BASE+'/api/tts/status',{cache:'no-store'}).catch(function(){}); }catch(e){} }
  function azSpeak(text,role,onEnd){
    var voice=AZ_VOICE[role]||AZ_VOICE.together,key=voice+'|'+text;
    function run(url){
      var a=new Audio(url); azActive=a;
      a.onended=function(){ if(azActive===a)azActive=null; if(onEnd)onEnd(); };
      a.play().catch(function(){ if(azActive===a)azActive=null; window.speak(text,role,onEnd); });
    }
    if(azCache[key]){ run(azCache[key]); return; }
    fetch(TTS_BASE+'/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text,voice:voice})})
      .then(function(r){ if(!r.ok) throw new Error('tts'); return r.blob(); })
      .then(function(b){ var u=URL.createObjectURL(b); azCache[key]=u; run(u); })
      .catch(function(){ window.speak(text,role,onEnd); });
  }
  var playAllStop=false,stopPlayAll=function(){};
  function addPlayAll(){
    var panel=document.getElementById('panel-dialog');
    if(!panel || document.getElementById('joy-playall') || typeof window.speak!=='function') return;
    var bar=document.createElement('div'); bar.className='joy-section-finish';
    bar.innerHTML='<button class="next" type="button" id="joy-playall">▶️ 聽整段對話</button> <button class="next" type="button" id="joy-playall-stop" style="display:none">⏹ 停止</button>';
    panel.insertBefore(bar,panel.firstChild);
    var btn=document.getElementById('joy-playall'),stop=document.getElementById('joy-playall-stop');
    function done(){ playAllStop=true; btn.style.display=''; stop.style.display='none'; }
    stopPlayAll=function(){ done(); azStop(); try{window.speechSynthesis.cancel();}catch(e){} };
    function playFrom(i){
      var dl=window.dialogueLines||[];
      if(playAllStop || i>=dl.length){ done(); return; }
      var startBtn=document.getElementById('d'+i+'-start');
      var card=startBtn&&startBtn.closest?startBtn.closest('.card'):null;
      if(card&&card.scrollIntoView) card.scrollIntoView({behavior:'smooth',block:'center'});
      azSpeak(dl[i].text, dl[i].role, function(){ setTimeout(function(){ if(!playAllStop) playFrom(i+1); },450); });
    }
    btn.onclick=function(){ playAllStop=false; btn.style.display='none'; stop.style.display=''; playFrom(0); };
    stop.onclick=function(){ stopPlayAll(); };
    azWarm();
  }
  function addGrammarListen(){
    var panel=document.getElementById('panel-grammar');
    var g=window.grammar;
    if(!panel || !g || !g.quiz || document.getElementById('joy-gram-listen') || typeof window.speak!=='function') return;
    var box=document.createElement('div'); box.id='joy-gram-listen'; box.className='card';
    var html='<div class="zh">先聽、跟著念一遍，再做下面的測驗。</div>';
    g.quiz.forEach(function(q,i){
      html+='<div class="row" style="margin-top:8px"><button class="act listen" onclick="speak('+JSON.stringify(q.full).replace(/"/g,'&quot;')+',\'together\')">🔊 '+q.full+'</button><span class="zh">'+(q.zh||'')+'</span></div>';
    });
    box.innerHTML=html;
    var test=document.getElementById('grammar-test');
    if(test) panel.insertBefore(box,test); else panel.appendChild(box);
  }
  function addLetterSounds(){
    var panel=document.getElementById('panel-phonics');
    var ph=window.phonics;
    if(!panel || !ph || !ph.length || panel.querySelector('.joy-letter-sound') || typeof window.speak!=='function') return;
    var rows=panel.querySelectorAll('.card .row');
    ph.forEach(function(p,i){
      var row=rows[i]; if(!row || !p.phon) return;
      row.insertAdjacentHTML('afterbegin','<button class="act listen joy-letter-sound" onclick="speak('+JSON.stringify(p.phon).replace(/"/g,'&quot;')+',\'together\')">🔡 '+p.letter+' 的音 '+(p.sound||'')+'</button>');
    });
  }
  function enableSinglePageFlow(){
    var tabs=document.querySelector('.tabs'); if(tabs) tabs.remove();
    addHeading('panel-dialog','對話','先聽、再開口念；每句要拿 5 顆星，或念滿 5 遍才過關。');
    addHeading('panel-vocab','單字','每個單字要拿 5 顆星，或念滿 5 遍才過關。');
    addHeading('panel-phonics','發音','完成聽音挑戰。');
    addHeading('panel-grammar','文法','完成文法挑戰。');
    addHeading('panel-wordgame','單字遊戲','完成聽字挑戰。');
    addAutoStatus('dialog','panel-dialog');
    addAutoStatus('vocab','panel-vocab');
    addPlayAll();
    addGrammarListen();
    addLetterSounds();
    wrapSpeechAttempts();
    trackSpeechScores();
    if(window.CH && CH.phonics) CH.phonics.start();
    if(window.CH && CH.grammar) CH.grammar.start();
    if(typeof window.wgStart==='function') window.wgStart();
  }
  function trackChallengeCompletion(){
    if(!window.Challenge || window.Challenge.prototype.congrats.__joyTracked) return;
    var oldCongrats=window.Challenge.prototype.congrats;
    window.Challenge.prototype.congrats=function(){
      oldCongrats.call(this);
      if(completed.hasOwnProperty(this.key)) markComplete(this.key);
    };
    window.Challenge.prototype.congrats.__joyTracked=true;
  }

  ready(function(){
    injectStyle();
    removeTalkGame();
    if(window.CH && typeof window.Challenge==='function'){
      if(typeof window.phExamples==='function') new window.Challenge('phonics','phonics-test', function(){
        var examples=window.phExamples();
        return window.shuffle(examples).slice(0,Math.min(6,examples.length)).map(function(x){ return window.qPhonics(x); });
      });
      if(window.grammar && window.grammar.quiz) new window.Challenge('grammar','grammar-test', function(){ return window.grammar.quiz.map(function(_,i){ return window.qGrammar(i); }); });
    }
    try{ if(typeof window.buildDialog==='function') window.buildDialog(); }catch(_){ }
    try{ if(typeof window.buildVocab==='function') window.buildVocab(); }catch(_){ }
    try{ if(typeof window.buildPhonics==='function') window.buildPhonics(); }catch(_){ }
    try{ if(typeof window.buildGrammar==='function') window.buildGrammar(); }catch(_){ }
    try{ if(typeof window.updateProgress==='function') window.updateProgress(); }catch(_){ }
    trackChallengeCompletion();
    enableSinglePageFlow();
  });
})();
