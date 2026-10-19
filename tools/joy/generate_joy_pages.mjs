// joy 複習頁產生器：資料檔 + review_template.html → 複習頁
// 評分引擎（canonSeq / normalizeSpeech / scoreSpeech / rec）只存在於樣板，
// 改一次全部課生效——這是加產生器的主要目的。
//   第 1 冊：node generate_joy_pages.mjs            → joy/unitN-review.html
//   第 2 冊：node generate_joy_pages.mjs --book 2   → joy/book2-unitN-review.html
// 各冊的 localStorage key 分開（joy-unitN / joy2-unitN），不會互蓋星星。
import fs from 'fs';
const DIR='/Users/emma/02_小孩教育/Apple/tools/joy';
const arg=(k,d)=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:d;
const OUT=arg('--out-dir','/Users/emma/02_小孩教育/Apple/joy');
const book=Number(arg('--book','1'));
const BOOKS={
  1:{data:'joy_lessons_data.json',file:n=>`unit${n}-review.html`,label:n=>`Joy Unit ${n}`,store:n=>`joy-unit${n}`,fixesV:'v16-lights-20260905'},
  2:{data:'joy2_lessons_data.json',file:n=>`book2-unit${n}-review.html`,label:n=>`Joy 2 Unit ${n}`,store:n=>`joy2-unit${n}`,fixesV:'v17-books-20261019'},
};
const cfg=BOOKS[book];
if(!cfg) throw new Error(`不認得的冊別：${book}`);
const tpl=fs.readFileSync(`${DIR}/review_template.html`,'utf8');
const units=JSON.parse(fs.readFileSync(`${DIR}/${cfg.data}`,'utf8'));
const j=v=>JSON.stringify(v,null,2);
let n=0;
for(const u of units){
  let s=tpl
    .replaceAll('{{label}}',cfg.label(u.unit))
    .replaceAll('{{store}}',cfg.store(u.unit))
    .replaceAll('{{fixesV}}',cfg.fixesV)
    .replaceAll('{{unit}}',String(u.unit))
    .replace('{{dialogueLines}}',j(u.dialogueLines))
    .replace('{{vocab}}',j(u.vocab))
    .replace('{{phonics}}',j(u.phonics))
    .replace('{{grammar}}',j(u.grammar))
    .replace('{{beOptions}}',j(u.beOptions))
    .replace('{{talkPairs}}',j(u.talkPairs))
    .replace('{{phonicsNote}}',u.phonicsNote||'');
  fs.writeFileSync(`${OUT}/${cfg.file(u.unit)}`,s); n++;
}
console.log(`第 ${book} 冊：產生 ${n} 課 → ${OUT}`);
