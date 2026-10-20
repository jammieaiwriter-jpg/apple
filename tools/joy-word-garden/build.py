from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
visuals={'bug':'🐛','ant':'🐜','bee':'🐝','house':'🏠','window':'🪟','door':'🚪','chocolate':'🍫','star':'⭐','heart':'❤️','bat':'🦇','witch':'🧙‍♀️','ghost':'👻','candy':'🍬','hand':'✋','chair':'🪑','pencil':'✏️','book':'📕','desk':'🪑','TV':'📺','clock':'🕒','marker':'🖍️','ruler':'📏','cat':'🐈','dog':'🐕','mother':'👩','father':'👨','ball':'⚽','yo-yo':'🪀','kite':'🪁','bike':'🚲','card':'💌','cake':'🎂','gift':'🎁','flower':'🌷','soup':'🍲','milk':'🥛','apple':'🍎','banana':'🍌','monster':'👾','girl':'👧','bed':'🛏️','brain':'🧠','Lion':'🦁','van':'🚐','wig':'💇','fox':'🦊','yak':'🐂','hat':'👒','bag':'🎒','eraser':'🧽'}
# Only unambiguous, concrete pictures are eligible for a picture-choice test.
picture_words=set('bug ant bee house window door chocolate star heart bat ghost candy hand chair pencil book TV clock ruler cat dog ball yo-yo kite bike cake gift flower soup milk apple banana bed brain Lion van fox hat bag'.split())
colors={'red':'#ed5265','blue':'#4f8ee3','green':'#56ac78','yellow':'#f8d552','white':'#ffffff','black':'#343b46','orange':'#f39c42'}
books=[]
for b in [1,2]:
 lessons=json.loads((root/f'source_materials/joy/book{b}/lessons.json').read_text());units=[]
 for u in lessons:
  vs=[]
  for i,v in enumerate(u.get('vocab',[])):
   word=v['word'];zh=v.get('zh','');key=word.lower();color=key in colors and ('色' in zh or key!='orange')
   proper=word[:1].isupper() and word not in ['I']
   can_spell=bool(re.fullmatch('[A-Za-z]{2,10}',word)) and not proper
   emoji=visuals.get(word,visuals.get(key,''));picture=word in picture_words or key in picture_words
   if key in ['eraser','desk','wig','yak']:emoji=''
   if key=='orange' and '色' in zh:emoji='';picture=False
   if key in ['chair','desk']:picture=False # Same chair image would not distinguish desk from chair.
   vs.append({'id':f'b{b}u{u["unit"]}w{i}','key':key,'word':word,'say':v.get('say',word),'zh':zh,'emoji':emoji,'color':colors[key] if color else '', 'picture':picture or color,'spellable':can_spell,'book':b,'unit':u['unit']})
  units.append({'unit':u['unit'],'title':u.get('topic',f'第 {u["unit"]} 課'),'words':vs})
 books.append({'book':b,'units':units})
html=(Path(__file__).parent/'template.html').read_text().replace('__JOY_DATA__',json.dumps(books,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
(root/'joy/words').mkdir(parents=True,exist_ok=True)
(root/'joy/words/index.html').write_text(html)
print('Built 2 books, 40 units,',sum(len(u['words']) for b in books for u in b['units']),'source entries')
