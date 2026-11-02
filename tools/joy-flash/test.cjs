// Logic tests for joy/flash (run after build.py): node tools/joy-flash/test.cjs
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../../joy/flash/index.html'),'utf8');
const script=html.split('<script>')[1].split('</script>')[0];
const logic=script.slice(0,script.indexOf('// ---- leave-early dialog ----'));
const el=()=>({innerHTML:'',textContent:'',hidden:false,onclick:null,select(){}, value:''});
const store={};
const context=vm.createContext({console,document:{querySelector:()=>el(),querySelectorAll:()=>[]},window:{},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}},setTimeout,clearTimeout,fetch:()=>Promise.reject(Error('no network in tests'))});
vm.runInContext(logic+';this.__api={WORDS,BY,POS,planFor,applyResults,lookAlikes,meaningOptions,sortStatus,familiarCount,streak,get profile(){return profile},set profile(v){profile=v},addDays,rec,reportText:()=>reportText(),sameSound};',context);
const A=context.__api,run=s=>vm.runInContext(s,context);
const fresh=()=>run('profile={version:1,name:"Apple",records:{},plans:{},days:{},flags:{},sort:{games:0,right:0,total:0}}');

// data
assert.equal(A.WORDS.length,123);
assert(A.WORDS.every(w=>A.POS[w.pos]),'every card has a known part of speech');
assert(A.WORDS.every(w=>w.zh&&!/[（(]/.test(w.zh)),'kid meanings have no notes in brackets');
assert(!A.WORDS.some(w=>['nick','abby','oz','fifi','boohoo'].includes(w.key)),'names and sound words are not drilled');
for(const k of ['are','good','it','can','is','am','a'])assert(A.BY[k],`sight word ${k} is a card`);
assert.deepEqual(A.WORDS.slice(0,3).map(w=>w.key),['i','you','am'],'sight words come first');

// daily plan: 20 words, stable within a day, reviews capped, new words fill the rest
fresh();let p=A.planFor('2026-11-02');assert.equal(p.length,20);assert.deepEqual(A.planFor('2026-11-02').map(w=>w.key),p.map(w=>w.key));
const res=Object.fromEntries(p.map(w=>[w.key,{s2:true,s3:true}]));A.applyResults(res,'2026-11-02');
assert(p.every(w=>A.rec(w.key).box===1&&A.rec(w.key).due==='2026-11-03'));
let p2=A.planFor('2026-11-03');assert.equal(p2.length,20);assert.equal(p2.filter(w=>A.rec(w.key).seen>0).length,12,'12 reviews due, 8 new');
assert.equal(p2.filter(w=>A.rec(w.key).seen===0).length,8);

// Leitner: pass moves up, fail drops back to box 1 and is due tomorrow, three passes on three days is familiar
fresh();const w0=A.WORDS[0].key;let day='2026-11-02';
for(const d of [0,1,4]){day=A.addDays('2026-11-02',d);A.applyResults({[w0]:{s2:true,s3:true}},day);}
assert.equal(A.rec(w0).box,3);assert(A.familiarCount()===1);
A.applyResults({[w0]:{s2:true,s3:false}},'2026-11-12');assert.equal(A.rec(w0).box,1);assert.equal(A.rec(w0).due,'2026-11-13');assert.equal(A.familiarCount(),0);

// listening options never contain a word that sounds like the answer, and never repeat
for(const w of A.WORDS.filter(w=>!/[\s-]/.test(w.word)))for(let i=0;i<20;i++){
  const o=A.lookAlikes(w);assert.equal(o.length,3);assert.equal(new Set(o.map(x=>x.toLowerCase())).size,3);
  assert(o.every(x=>!A.sameSound(w.word.toLowerCase(),x.toLowerCase())),`${w.word} vs ${o}`);
}
// meaning options: no near duplicates of the answer's meaning
for(const w of A.WORDS)for(let i=0;i<10;i++){const o=A.meaningOptions(w);assert.equal(o.length,3);assert(o.every(x=>x.zh!==w.zh&&!x.zh.includes(w.zh)&&!w.zh.includes(x.zh)),`${w.zh} vs ${o.map(x=>x.zh)}`);}

// sorting game unlock: needs at least 3 seen words of each noun/verb/adjective
fresh();assert.equal(A.sortStatus().ok,false);
const seen=pos=>A.WORDS.filter(w=>w.sort&&w.pos===pos).slice(0,3).forEach(w=>{A.rec(w.key).seen=1;});
seen('n');seen('v');assert.equal(A.sortStatus().ok,false);seen('adj');assert.equal(A.sortStatus().ok,true);
assert(A.sortStatus().pool.every(w=>['n','v','adj'].includes(w.pos)&&!w.alt));

// page rules shared with the other Joy pages: speechSynthesis only, no Audio / network TTS
assert(!html.includes('new Audio')&&!html.includes('<audio')&&!html.includes('/api/tts'));
assert(html.includes('speechSynthesis'));
console.log('PASS: card data, daily 20-word plan, spaced review, look-alike/homophone-safe options, sorting unlock.');
