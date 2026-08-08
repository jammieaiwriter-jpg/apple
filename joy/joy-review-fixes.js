(function(){
  'use strict';
  var VERSION = 'v5-review-fixes-20260808';
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
    st.textContent='.bpmf{font-size:18px;line-height:1.7;color:#145a51;font-weight:800;margin:4px 0 10px}.sound-target{font-size:clamp(30px,8vw,48px);font-weight:950;color:#145a51;margin:10px 0}.mini-note{font-size:14px;color:#667085;margin-top:4px}';
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
  window.scoreSpeech = function(expected, heard){
    var e=window.normalizeSpeech(expected).split(' ').filter(Boolean).map(canonWord);
    var h=window.normalizeSpeech(heard).split(' ').filter(Boolean).map(canonWord);
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

  function posLabel(i,len){
    if(len<=1) return '這個音';
    if(i===0) return '第一個音';
    if(i===len-1) return '最後一個音';
    return '第 '+(i+1)+' 個音';
  }
  function reviewGraph(ex){
    var graph=(typeof window.graphForReview==='function' ? window.graphForReview(ex) : []).filter(function(gp){ return gp.p; });
    if(graph.length) return graph;
    // Unit 1 predates seg/graph and stores pronounceable blend tokens instead.
    // Keep the visible choice as a letter while using those tokens only as the
    // internal sound marker.
    var letters=String(ex.w||'').replace(/[^A-Za-z]/g,'').split('');
    var blend=Array.isArray(ex.blend) ? ex.blend : [];
    return letters.map(function(letter,i){ return {g:letter, p:blend[i] || letter}; });
  }
  function uniqueTiles(){
    var pool=[], seen={};
    if(typeof window.phExamples!=='function') return pool;
    window.phExamples().forEach(function(x){
      reviewGraph(x.e).forEach(function(gp){
        if(!gp.p) return;
        var k=gp.g+'|'+gp.p;
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
    var opts=window.shuffle([answer].concat(window.shuffle(uniqueTiles().filter(function(gp){return gp.g!==answer.g || gp.p!==answer.p;})).slice(0,3))).slice(0,4);
    qEl.innerHTML='<div class="en">聽單字，選「'+posLabel(idx,graph.length)+'」</div>'
      +'<div class="sound-target">'+posLabel(idx,graph.length)+'</div>'
      +'<div class="mini-note">不先顯示拼法，請真的用耳朵聽。</div>'
      +'<div class="row" style="justify-content:center"><button class="act listen" id="ph-listen">🔊 再聽一次</button></div>'
      +'<div id="ph-opts" class="game-grid">'+opts.map(function(gp,i){ return '<button class="opt" data-i="'+i+'" data-g="'+gp.g+'" data-p="'+gp.p+'">'+gp.g+'</button>'; }).join('')+'</div>';
    document.getElementById('ph-listen').onclick=function(){ window.speak(target.e.w,'together'); };
    var box=document.getElementById('ph-opts');
    box.onclick=function(e){
      var btn=e.target.closest('button[data-i]'); if(!btn||btn.disabled) return;
      var ok=(btn.dataset.g===answer.g && btn.dataset.p===answer.p);
      if(ok){
        outEl.textContent='答對了！這個音是 '+answer.g+'。';
        window.disableAll(box); window.speak(target.e.w,'together'); settle(firstTry);
      }else{
        firstTry=false;
        outEl.textContent='再聽一次，這題問的是「'+posLabel(idx,graph.length)+'」。';
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
    document.getElementById('gr-listen').onclick=function(){ speakZh(zh, function(){ window.speak(p.replace(/___/g,'blank'),'abby'); }); };
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

  ready(function(){
    injectStyle();
    removeTalkGame();
    if(window.CH && typeof window.Challenge==='function'){
      if(typeof window.phExamples==='function') new window.Challenge('phonics','phonics-test', function(){ return window.phExamples().map(function(x){ return window.qPhonics(x); }); });
      if(window.grammar && window.grammar.quiz) new window.Challenge('grammar','grammar-test', function(){ return window.grammar.quiz.map(function(_,i){ return window.qGrammar(i); }); });
    }
    try{ if(typeof window.buildDialog==='function') window.buildDialog(); }catch(_){ }
    try{ if(typeof window.buildVocab==='function') window.buildVocab(); }catch(_){ }
    try{ if(typeof window.buildPhonics==='function') window.buildPhonics(); }catch(_){ }
    try{ if(typeof window.buildGrammar==='function') window.buildGrammar(); }catch(_){ }
    try{ if(typeof window.updateProgress==='function') window.updateProgress(); }catch(_){ }
  });
})();
