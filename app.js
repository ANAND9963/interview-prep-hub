import {lessons} from './data/lessons.js';
import {loadState,writeState,validateState,reviewDue} from './state.js';
import {mountPlayground} from './playground.js';
import {roadmaps,mlAlgorithms} from './data/resources.js';
import {createSync} from './sync.js';

const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tracks={
 dsa:{name:'DSA practice',symbol:'{ }',title:'Solve. Understand. Repeat.',description:'Work through your curriculum, compare approaches, and build a reliable revision habit.'},
 java:{name:'Java & Spring',symbol:'J',title:'Java, from foundations to services.',description:'Build clear mental models for collections, concurrency, APIs, and Spring Boot.'},
 ai:{name:'AI & machine learning',symbol:'AI',title:'Build your AI foundations.',description:'Follow the curriculum from data preparation and model evaluation to retrieval and agents.'},
 react:{name:'React',symbol:'Re',title:'Think in React.',description:'Practice state, hooks, rendering behavior, and frontend trade-offs.'},
 angular:{name:'Angular',symbol:'Ng',title:'Build with Angular.',description:'Learn component boundaries, signals, asynchronous streams, and forms.'},
 library:{name:'Learning library',symbol:'▤',title:'Beginner to advanced learning paths.',description:'Use original checkpoints here, then open verified external resources for deeper reading and practice.'},
 system:{name:'System design',symbol:'◇',title:'Design beyond the happy path.',description:'Practice architecture, estimate capacity, and explain what fails at scale.'},
 interview:{name:'Interview room',symbol:'↗',title:'Practice under interview conditions.',description:'Rehearse your reasoning, ask clarifying questions, and review your answers honestly.'},
 sync:{name:'Sync & account',symbol:'◎',title:'Keep progress across your devices.',description:'Your browser remains the local source while signed-in progress is backed up automatically.'}
};
let state,items=[],solutions={},timerCleanup=()=>{},filter={query:'',topic:'all',level:'all',status:'all',content:'all'},page=1,lastTrack='',toastTimer;
const loaded=loadState();state=loaded.state;
let syncStatus={state:'disabled',message:'Cloud sync needs one-time setup.',email:'',configured:false};
const sync=createSync({getState:()=>state,replaceState:next=>{state=next;writeState(state);route();},onStatus:value=>{syncStatus=value;renderSyncStatus();}});
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function save(){try{state.meta={...(state.meta||{}),updatedAt:Date.now()};writeState(state);sync.schedule();}catch{toast('Browser storage is unavailable or full. Export your progress now.');}}
function renderSyncStatus(){const el=$('#sync-indicator');if(!el)return;el.textContent={synced:'Synced',syncing:'Syncing…','signed-out':'Local',disabled:'Local',error:'Sync error'}[syncStatus.state]||'Local';el.className='sync-'+syncStatus.state;$('#storage-badge').textContent=syncStatus.state==='synced'?'AUTOMATIC SYNC ON':'LOCAL-FIRST PROGRESS';}
function itemState(id){return state.items[id]||{status:'todo',bookmarked:false,notes:'',code:'',reviewed:0};}
function updateItem(id,patch){state.items[id]={...itemState(id),...patch};save();}
function ready(i){return Boolean(i.lesson||i.solution);}
function tag(text,type=''){return '<span class="tag '+type+'">'+esc(text)+'</span>';}
function titleBlock(track,action=''){const t=tracks[track];return '<div class="page-heading"><div><div class="eyebrow">'+esc(t.name.toUpperCase())+'</div><h1>'+t.title+'</h1><p>'+t.description+'</p></div>'+action+'</div>';}
function nav(track){$('#navigation').innerHTML=Object.entries(tracks).map(([id,t])=>'<a class="nav-link '+(id===track?'active':'')+'" '+(id===track?'aria-current="page"':'')+' href="#/'+id+'"><span class="nav-symbol">'+t.symbol+'</span>'+t.name+'</a>').join('');}
function backup(){
 const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='prep-hub-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);toast('Progress backup exported.');
}
async function importBackup(file){
 if(!file)return;
 try{
  if(file.size>5*1024*1024)throw Error('Choose a progress backup smaller than 5 MB.');
  const incoming=validateState(JSON.parse(await file.text()));
  if(!confirm('Merge this backup? Imported entries replace matching progress, notes, and diagrams. Other entries stay unchanged.'))return;
  state={...state,items:{...state.items,...incoming.items},diagrams:{...state.diagrams,...incoming.diagrams},interview:{...state.interview,...incoming.interview}};
  save();route();toast('Backup imported.');
 }catch(e){toast(e.message||'Could not import this file.');}
 finally{$('#import').value='';}
}
$('#export').onclick=backup;
$('#import').onchange=e=>importBackup(e.target.files[0]);
let installPrompt;
const isInstalled=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
function updateInstallControls(){document.documentElement.classList.toggle('app-installed',isInstalled());if(isInstalled()&&$('#install-dialog')?.open)$('#install-dialog').close();}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;updateInstallControls();});
window.addEventListener('appinstalled',()=>{installPrompt=null;updateInstallControls();toast('App installed.');});
window.matchMedia('(display-mode: standalone)').addEventListener?.('change',updateInstallControls);
async function install(){if(isInstalled())return; if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;updateInstallControls();}else $('#install-dialog').showModal();}
$('#install').onclick=install;
function mobileTools(){return '<div class="mobile-tools"><button data-global="export">Export progress</button><button data-global="import">Import progress</button><button class="install-control" data-global="install">Install app</button></div>';}
document.addEventListener('click',e=>{const a=e.target.closest('[data-global]');if(!a)return;({export:backup,import:()=>$('#import').click(),install})[a.dataset.global]?.();});

function board(track){
 const list=items.filter(i=>i.track===track);
 const solved=list.filter(i=>itemState(i.id).status==='solved').length,available=list.filter(ready).length,due=list.filter(i=>reviewDue(itemState(i.id))).length;
 const first=list.find(i=>ready(i)&&itemState(i.id).status!=='solved')||list.find(ready);
 $('#main').innerHTML=titleBlock(track,track==='system'?'<a class="button primary" href="#/playground">Open playground ↗</a>':roadmaps[track]?'<a class="button primary" href="#/library/'+track+'">Open '+esc(track.toUpperCase())+' roadmap →</a>':first?'<a class="button primary" href="#/item/'+first.id+'">Continue practice →</a>':'')+
 '<div class="stats"><div class="stat"><span class="label">Curriculum entries</span><strong class="value">'+list.length+'</strong><span class="tiny">Your learning path</span></div><div class="stat"><span class="label">Ready to study</span><strong class="value">'+available+'</strong><span class="tiny">With original explanations</span></div><div class="stat featured"><span class="label">Completed</span><strong class="value">'+solved+' <span class="muted" style="font-size:1rem">/ '+list.length+'</span></strong><div class="progress-line"><span style="width:'+(list.length?solved/list.length*100:0)+'%"></span></div></div><div class="stat"><span class="label">Revision queue</span><strong class="value">'+due+'</strong><span class="tiny">In practice or 7+ days old</span></div></div>'+
 (available<list.length?'<div class="notice"><strong>'+available+' complete '+(track==='dsa'?'solution articles':'lessons')+'</strong> are available in this release. Other entries preserve your curriculum and have space for practice notes; their full explanations are still to be written. Use “Ready to study” to focus on available content.</div>':'')+
 '<section class="panel"><div class="panel-header"><h2>'+esc(tracks[track].name)+' board</h2><span class="muted" style="font-size:.8125rem">Saved as you go</span></div><div class="filters"><input class="search" id="search" aria-label="Search curriculum" placeholder="Search a problem, topic, or concept…" value="'+esc(filter.query)+'"><select id="topic" aria-label="Filter by topic"><option value="all">All topics</option>'+[...new Set(list.map(i=>i.topic))].sort().map(t=>'<option value="'+esc(t)+'" '+(filter.topic===t?'selected':'')+'>'+esc(t)+'</option>').join('')+'</select><select id="content" aria-label="Filter by content"><option value="all">All content</option><option value="ready">Ready to study</option><option value="curriculum">Curriculum only</option></select><select id="status" aria-label="Filter by progress"><option value="all">All progress</option><option value="todo">Not started</option><option value="practicing">Practicing</option><option value="solved">Completed</option><option value="bookmarked">Bookmarked</option><option value="due">Due for revision</option></select>'+(track==='dsa'?'<select id="level" aria-label="Filter by difficulty"><option value="all">All difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option><option>Unrated</option></select>':'')+'</div><div id="rows"></div></section>'+mobileTools();
 ['content','status','level'].forEach(k=>{const el=$('#'+k);if(el)el.value=filter[k];});
 $('#search').oninput=e=>{filter.query=e.target.value;page=1;rows(list);};
 ['topic','content','status','level'].forEach(k=>{const el=$('#'+k);if(el)el.onchange=e=>{filter[k]=e.target.value;page=1;rows(list);};});
 rows(list);
}
function rows(list){
 const matches=list.filter(i=>{
  const s=itemState(i.id),q=filter.query.trim().toLowerCase();
  return (!q||(i.title+' '+i.topic+' '+i.description).toLowerCase().includes(q))&&
   (filter.topic==='all'||filter.topic===i.topic)&&(filter.level==='all'||filter.level===i.level)&&
   (filter.content==='all'||(filter.content==='ready')===ready(i))&&
   (filter.status==='all'||filter.status===s.status||(filter.status==='bookmarked'&&s.bookmarked)||(filter.status==='due'&&reviewDue(s)));
 });
 const pages=Math.max(1,Math.ceil(matches.length/20));page=Math.min(page,pages);
 const slice=matches.slice((page-1)*20,page*20);
 $('#rows').innerHTML='<div class="table-wrap"><table><thead><tr><th scope="col">Progress</th><th scope="col">Problem / lesson</th><th scope="col">Topic</th><th scope="col">Content</th><th scope="col">Save</th></tr></thead><tbody>'+slice.map(i=>{
  const s=itemState(i.id);
  return '<tr><td><button class="status-button '+(s.status==='solved'?'solved':'')+'" data-status="'+i.id+'" aria-label="'+esc(i.title)+': '+s.status+'. Change progress">'+(s.status==='solved'?'✓':s.status==='practicing'?'◐':'○')+'</button></td><td><a class="problem-title" href="#/item/'+i.id+'">'+esc(i.title)+'</a><span class="row-meta">'+esc(i.level)+(i.leetcode?' · LeetCode linked':'')+'</span></td><td>'+tag(i.topic)+'</td><td>'+tag(ready(i)?'Ready to study':'Curriculum only',ready(i)?'ready':'')+'</td><td><button class="bookmark '+(s.bookmarked?'selected':'')+'" data-bookmark="'+i.id+'" aria-label="'+(s.bookmarked?'Unbookmark ':'Bookmark ')+esc(i.title)+'" aria-pressed="'+s.bookmarked+'">'+(s.bookmarked?'★':'☆')+'</button></td></tr>';
 }).join('')+'</tbody></table></div>'+(!matches.length?'<div class="empty">No entries match these filters. Try a broader search.</div>':'')+'<div class="table-footer"><span>'+matches.length+' entries · Page '+page+' of '+pages+'</span><div><button id="prev" '+(page===1?'disabled':'')+'>Previous</button><button id="next" '+(page===pages?'disabled':'')+'>Next</button></div></div>';
 $('#prev').onclick=()=>{page--;rows(list);};$('#next').onclick=()=>{page++;rows(list);};
 $('#rows').querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>{const id=b.dataset.status,s=itemState(id),status={todo:'practicing',practicing:'solved',solved:'todo'}[s.status];updateItem(id,{status,reviewed:status==='solved'?Date.now():s.reviewed});board(items.find(i=>i.id===id).track);});
 $('#rows').querySelectorAll('[data-bookmark]').forEach(b=>b.onclick=()=>{const id=b.dataset.bookmark;updateItem(id,{bookmarked:!itemState(id).bookmarked});rows(list);});
}
function detail(id){
 const i=items.find(x=>x.id===id);if(!i)return notFound();
 nav(i.track);const s=itemState(id),sol=i.solution,l=i.lesson;
 $('#main').innerHTML='<a class="back" href="#/'+i.track+'">← '+esc(tracks[i.track].name)+' board</a><div class="page-heading"><div><div class="eyebrow">'+esc(i.topic)+'</div><h1>'+esc(i.title)+'</h1><div class="tabs">'+tag(i.level,i.level.toLowerCase())+tag(ready(i)?'Ready to study':'Curriculum only',ready(i)?'ready':'')+'</div></div></div><div class="detail-actions"><select id="detail-status" aria-label="Progress"><option value="todo">Not started</option><option value="practicing">Practicing</option><option value="solved">Completed</option></select><button id="detail-bookmark">'+(s.bookmarked?'★ Bookmarked':'☆ Bookmark')+'</button><button id="reviewed">Reviewed today</button>'+(i.leetcode?'<a class="button primary" href="'+esc(i.leetcode)+'" target="_blank" rel="noopener noreferrer">Solve on LeetCode ↗</a>':'')+(i.track==='system'?'<a class="button primary" href="#/playground/'+i.id+'">Design this system ↗</a>':'')+'</div><div class="workspace"><article class="panel article" id="article"></article><aside class="panel side-panel"><h3>Your practice notes</h3><textarea id="notes" maxlength="30000" rows="7" placeholder="What was the key idea? Where did you get stuck? What will you explain next time?">'+esc(s.notes)+'</textarea><p class="code-label">Saved locally as you type</p><h3>Scratchpad</h3><p class="muted" style="font-size:.875rem">Write and save your approach here. This editor does not execute code. Run Java in your IDE or on LeetCode.</p><textarea id="scratch" class="scratch" maxlength="50000" rows="13" spellcheck="false" aria-label="Code scratchpad">'+esc(s.code)+'</textarea><div class="tabs"><button id="copy-scratch">Copy scratchpad</button><button id="copy-question">Copy question for ChatGPT</button></div><p class="install-note">Ask questions in your own ChatGPT session. No AI API runs inside this app.</p></aside></div>';
 $('#detail-status').value=s.status;$('#detail-status').onchange=e=>updateItem(id,{status:e.target.value,reviewed:e.target.value==='solved'?Date.now():s.reviewed});
 $('#detail-bookmark').onclick=()=>{updateItem(id,{bookmarked:!itemState(id).bookmarked});$('#detail-bookmark').textContent=itemState(id).bookmarked?'★ Bookmarked':'☆ Bookmark';};
 $('#reviewed').onclick=()=>{updateItem(id,{reviewed:Date.now()});toast('Review date updated. Mark completed when you can explain the approach.');};
 $('#notes').oninput=e=>updateItem(id,{notes:e.target.value});$('#scratch').oninput=e=>updateItem(id,{code:e.target.value});
 $('#copy-scratch').onclick=()=>copy($('#scratch').value);
 $('#copy-question').onclick=()=>copy('Help me study '+i.title+'. '+(sol?.statement||i.description||'')+'\nAsk me for my approach before revealing a solution. Explain correctness, edge cases, complexity and trade-offs. Do not invent my experience.\nMy notes: '+itemState(id).notes);
 if(sol)solutionArticle(sol);
 else if(l)lessonArticle(l);
 else $('#article').innerHTML='<h2>Curriculum brief</h2><p>'+esc(i.description||'This entry is included in your learning curriculum. Its complete lesson or solution has not been authored in this release.')+'</p><div class="notice">Full internal explanation not yet available. Save your attempt and reasoning in the notes alongside this brief.'+(i.leetcode?' The linked LeetCode page contains the original problem and its constraints.':' No exact LeetCode link was supplied for this entry.')+'</div><h2>Practice checklist</h2><ol><li>Write the requirements and clarify unknowns.</li><li>Describe a simple approach before optimizing.</li><li>Identify edge cases and explain why the approach works.</li><li>Compare time, memory, and implementation trade-offs.</li></ol><p class="muted">Source: '+esc(i.source)+' · workbook row '+i.sourceRow+'</p>';
}
function solutionArticle(sol){
 $('#article').innerHTML='<h2>Understand the problem</h2><p>'+esc(sol.statement)+'</p><h3>Example</h3><pre>'+esc(sol.example)+'</pre><h2>Try before revealing</h2>'+sol.hints.map((h,k)=>'<details><summary>Hint '+(k+1)+'</summary><p>'+esc(h)+'</p></details>').join('')+'<h2>Compare approaches</h2><div class="table-wrap"><table><thead><tr><th>Approach</th><th>Time</th><th>Space</th></tr></thead><tbody>'+sol.approaches.map(a=>'<tr><td>'+esc(a.name)+'</td><td>'+esc(a.time)+'</td><td>'+esc(a.space)+'</td></tr>').join('')+'</tbody></table></div><div class="tabs" role="tablist" aria-label="Solution approaches">'+sol.approaches.map((a,k)=>'<button role="tab" aria-selected="'+(k===0)+'" class="'+(k===0?'active':'')+'" data-approach="'+k+'">'+esc(a.name)+'</button>').join('')+'</div><section id="approach-body"></section><h2>Interview follow-up</h2><p>'+esc(sol.followup)+'</p>';
 function select(k){
  const a=sol.approaches[k];
  $('#approach-body').innerHTML='<h3>Why it works</h3><p>'+esc(a.explanation)+'</p><h3>When to choose it</h3><p>'+esc(a.tradeoff)+'</p><details><summary>Reveal Java solution</summary><pre><code>'+esc(a.code)+'</code></pre><button id="copy-solution">Copy Java</button><p class="muted">ListNode and TreeNode, when used, are supplied by the coding platform. The source repository includes a Java fixture runner for the solution pack.</p></details>';
  $('#copy-solution').onclick=()=>copy(a.code);
  $('#article').querySelectorAll('[data-approach]').forEach(b=>{const active=Number(b.dataset.approach)===k;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.onclick=()=>select(Number(b.dataset.approach));});
 }
 select(0);
}
function lessonArticle(l){
 $('#article').innerHTML='<p>'+esc(l.description)+'</p>'+l.sections.map(([h,p])=>'<h2>'+esc(h)+'</h2><p>'+esc(p)+'</p>').join('')+'<h2>Try it yourself</h2><p>'+esc(l.exercise)+'</p><details><summary>Reveal explanation'+(l.code?' and example':'')+'</summary><p>'+esc(l.answer)+'</p>'+(l.code?'<pre><code>'+esc(l.code)+'</code></pre>':'')+'</details>'+(l.reference?'<p><a href="'+esc(l.reference)+'" target="_blank" rel="noopener noreferrer">Official documentation ↗</a></p>':'');
}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied.');}catch{toast('Clipboard unavailable. Select the text and copy it manually.');}}

const interviewQuestions=[
 {id:'intro',type:'Behavioral',q:'Introduce yourself in 90 seconds.',answer:'State your current focus, summarize only verifiable experience, explain one relevant project and your own contribution, then connect it to the role. Use a specific outcome only if you can substantiate it. Avoid listing every technology.',follow:'What did you personally own? Which design decision would you change?'},
 {id:'conflict',type:'Behavioral',q:'Tell me about a technical disagreement.',answer:'Use situation, responsibility, actions, and result. Explain both options fairly, the evidence you gathered, how you reached a decision, and what you learned. Distinguish your work from the team’s work.',follow:'What was the strongest argument against your proposal?'},
 {id:'failure',type:'Behavioral',q:'Describe a production issue you helped resolve.',answer:'Use a real example: customer impact, your responsibility, evidence, mitigation, root cause, and prevention. If you have not handled production incidents, say so and use a clearly labeled project example.',follow:'How did you know the mitigation worked? What alert would have caught it earlier?'},
 {id:'kafka',type:'Backend',q:'How do you make a Kafka consumer safe under redelivery?',answer:'Assume duplicate processing is possible. Choose a stable event ID and make the business effect idempotent, preferably with a unique constraint or transactional deduplication record. Commit progress only after the durable effect succeeds. Discuss ordering per partition and poison-message handling.',follow:'What happens if the database commits but the offset commit fails?'},
 {id:'cache',type:'Backend',q:'When does a cache create a correctness problem?',answer:'When stale or missing entries violate business rules. Identify the consistency requirement, source of truth, invalidation path and fallback. Explain TTL as a staleness bound rather than a universal correctness guarantee. For stock reservation, enforce the invariant in the durable store.',follow:'What happens during a cache outage or a hot-key stampede?'},
 {id:'sql',type:'Backend',q:'How would you investigate a slow SQL query?',answer:'Capture the query, parameters, representative data volume and execution plan. Check scans, row estimates, joins, sorts, lock waits and returned columns. Match indexes to predicates and ordering, then measure both read benefits and write costs.',follow:'Why might an index not be selected? How do skew and stale statistics matter?'},
 {id:'react',type:'Frontend',q:'When would you choose useReducer over useState?',answer:'Choose a reducer when related transitions affect several fields or the transition logic needs isolated tests. Keep it pure. useState remains clearer for simple independent values. Neither automatically solves server cache synchronization.',follow:'How would you prevent stale network results from overwriting a newer search?'},
 {id:'angular',type:'Frontend',q:'How do you choose switchMap, concatMap, and mergeMap?',answer:'Use switchMap for replaceable work such as search, concatMap when order and sequencing matter, and mergeMap for allowed concurrency. Explain that unsubscribing cannot undo a mutation already committed on the server.',follow:'Which operator fits saving ordered edits? Which fits an autocomplete search?'},
 {id:'rag',type:'AI',q:'How would you evaluate a RAG system?',answer:'Measure retrieval recall at k against supporting evidence, answer correctness, citation support, abstention behavior, latency and cost. Test permissions and adversarial retrieved content. Separate retrieval failures from generation failures.',follow:'What does increasing the chunk size improve and worsen?'},
 {id:'design',type:'System design',q:'Design a URL shortener with editable links.',answer:'Clarify traffic, expiry, ownership, abuse handling and edit semantics. Define create and resolve APIs, code uniqueness, a durable mapping, cache invalidation, redirect behavior and asynchronous analytics. Explain how stale browser and CDN redirects affect edits.',follow:'How does your design behave when the cache is unavailable?'},
 {id:'leadership',type:'Managerial',q:'How do you handle a deadline that exceeds team capacity?',answer:'Make scope, dependencies and risks explicit. Identify the smallest useful delivery, discuss trade-offs with stakeholders, assign ownership and communicate changes early. Use a real example without inventing team size or savings.',follow:'What did you cut, and how did you preserve the quality bar?'},
 {id:'mentoring',type:'Managerial',q:'How do you help a teammate who is struggling?',answer:'Understand the obstacle privately, agree on a small achievable goal, provide specific feedback and support, and follow up. Separate skill gaps from unclear requirements or workload. Ground the answer in a real situation.',follow:'How did you measure improvement without micromanaging?'}
];
function interview(){
 $('#main').innerHTML=titleBlock('interview')+'<div class="notice">These are general practice prompts for large technology-company interviews. They are not verified company question lists or predictions. Ground every experience answer in your actual work.</div><div class="workspace"><section class="panel article"><div class="filters" style="padding:0 0 18px"><select id="interview-type" aria-label="Question category"><option value="all">All categories</option>'+[...new Set(interviewQuestions.map(q=>q.type))].map(t=>'<option>'+t+'</option>').join('')+'</select><button id="next-question">Next question →</button></div><div id="interview-question"></div></section><aside class="panel side-panel"><h2>Practice timer</h2><label class="field">Session length<select id="timer-minutes"><option value="2">2 minutes · introduction</option><option value="5">5 minutes · explanation</option><option value="25">25 minutes · coding</option><option value="45">45 minutes · system design</option></select></label><div class="timer" id="timer">02:00</div><div class="tabs"><button id="timer-start" class="primary">Start</button><button id="timer-reset">Reset</button></div><h3>Self-review rubric</h3><div class="rubric">'+['Clarified the requirements','Explained a baseline approach','Justified the trade-offs','Covered failure modes or edge cases','Summarized clearly and stayed within time'].map((t,k)=>'<label><input type="checkbox" data-rubric="'+k+'">'+t+'</label>').join('')+'</div><p class="muted score" id="rubric-score">0 of 5 review points checked</p><p class="install-note">This is your self-assessment, not an AI score.</p></aside></div>';
 let index=0,seconds=120,deadline=0,interval=null;
 function tick(){if(deadline){seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));if(seconds===0){clearInterval(interval);deadline=0;$('#timer-start').textContent='Start';toast('Time is up. Review your reasoning.');}}$('#timer').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
 function reset(){clearInterval(interval);deadline=0;seconds=Number($('#timer-minutes').value)*60;$('#timer-start').textContent='Start';tick();}
 $('#timer-start').onclick=()=>{if(deadline){tick();deadline=0;clearInterval(interval);$('#timer-start').textContent='Resume';}else {if(seconds===0)reset();deadline=Date.now()+seconds*1000;interval=setInterval(tick,250);$('#timer-start').textContent='Pause';}};
 $('#timer-reset').onclick=reset;$('#timer-minutes').onchange=reset;timerCleanup=()=>clearInterval(interval);
 document.querySelectorAll('[data-rubric]').forEach(c=>c.onchange=()=>$('#rubric-score').textContent=document.querySelectorAll('[data-rubric]:checked').length+' of 5 review points checked');
 function show(){
  const options=interviewQuestions.filter(q=>$('#interview-type').value==='all'||q.type===$('#interview-type').value),q=options[index%options.length];
  $('#interview-question').innerHTML='<div class="eyebrow">'+esc(q.type)+'</div><h2>'+esc(q.q)+'</h2><label class="field">Your answer<textarea id="interview-answer" maxlength="30000" rows="9" placeholder="Record your reasoning or outline a real example…">'+esc(state.interview[q.id]||'')+'</textarea></label><details><summary>Reveal answer framework</summary><p>'+esc(q.answer)+'</p><h3>Deeper follow-up</h3><p>'+esc(q.follow)+'</p></details>';
  $('#interview-answer').oninput=e=>{state.interview[q.id]=e.target.value;save();};
 }
 $('#next-question').onclick=()=>{index++;show();};$('#interview-type').onchange=()=>{index=0;show();};show();
}
function library(selected='java'){
 const keys=Object.keys(roadmaps),current=roadmaps[selected]||roadmaps.java;
 $('#main').innerHTML=titleBlock('library')+
 '<div class="tabs library-tabs" role="navigation" aria-label="Learning roadmaps">'+keys.map(k=>'<a class="button '+(k===selected?'active':'')+'" href="#/library/'+k+'">'+esc(k==='ai'?'AI / ML':k[0].toUpperCase()+k.slice(1))+'</a>').join('')+'</div>'+
 '<section class="panel article library"><div class="eyebrow">'+esc(selected==='ai'?'AI / ML':selected.toUpperCase())+' ROADMAP</div><h2>'+esc(current.title)+'</h2><p class="muted">Complete the stages in order. Mark the detailed lessons from their track board as you practice. Videos can be added later as another resource type without changing this structure.</p>'+
 '<div class="roadmap">'+current.stages.map(([stage,topics])=>'<section class="roadmap-stage"><h3>'+esc(stage)+'</h3><ol>'+topics.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol></section>').join('')+'</div>'+
 '<h2>Learning resources</h2><div class="resource-grid">'+current.resources.map(([name,desc,url,type])=>'<article class="resource-card"><div>'+tag(type,type==='Official'?'ready':'')+'<h3>'+esc(name)+'</h3><p>'+esc(desc)+'</p></div>'+(url?'<a class="button" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Open resource ↗</a>':'<span class="muted">Used as a roadmap reference</span>')+'</article>').join('')+'</div>'+
 (selected==='ai'?'<h2>Machine-learning algorithm guide</h2><p class="muted">Start with a baseline and choose algorithms from the data shape, constraints and error costs—not popularity.</p><div class="table-wrap"><table><thead><tr><th>Algorithm</th><th>Use it for</th><th>Trade-off</th><th>Watch for</th><th>Evaluate with</th></tr></thead><tbody>'+mlAlgorithms.map(row=>'<tr>'+row.map(cell=>'<td>'+esc(cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'')+
 (selected==='java'?'<div class="notice"><strong>Spring note guidance:</strong> Your uploaded PDFs were used to identify study topics. They were not copied into this public website. The Spring Framework notes date from 2018, and both references may show older configuration patterns. Prefer current Spring documentation for production code.</div>':'')+
 '</section>'+mobileTools();
}
function syncPage(){
 $('#main').innerHTML=titleBlock('sync')+
 '<div class="workspace"><section class="panel article"><h2>Synchronization status</h2><p class="sync-card sync-'+esc(syncStatus.state)+'"><strong>'+esc({synced:'Synchronized',syncing:'Synchronizing','signed-out':'Not signed in',disabled:'Setup required',error:'Synchronization error'}[syncStatus.state]||'Local only')+'</strong><br>'+esc(syncStatus.message)+(syncStatus.email?'<br><span class="muted">'+esc(syncStatus.email)+'</span>':'')+'</p>'+
 (syncStatus.configured&&syncStatus.state!=='synced'&&syncStatus.state!=='syncing'?'<form id="auth-form"><label class="field">Email<input id="auth-email" type="email" autocomplete="email" required maxlength="254"></label><label class="field">Password<input id="auth-password" type="password" autocomplete="current-password" required minlength="8" maxlength="128"></label><div class="tabs"><button class="primary" name="mode" value="signin">Sign in</button><button name="mode" value="signup">Create account</button></div></form>':'')+
 (syncStatus.state==='synced'?'<div class="tabs"><button id="sync-now" class="primary">Sync now</button><button id="sign-out">Sign out</button></div>':'')+
 '<h2>How it works</h2><ol><li>Every edit is saved immediately in this browser.</li><li>When signed in, changes upload automatically after a short delay.</li><li>When the app opens on another signed-in device, the newer complete backup is used.</li><li>Exported JSON backups remain available as an independent recovery option.</li></ol><div class="notice">Concurrent offline edits on two devices use last-write-wins for the complete progress backup. Synchronize one device before continuing on another to avoid overwriting newer work.</div></section>'+
 '<aside class="panel side-panel"><h2>One-time administrator setup</h2><ol class="muted"><li>Create a free Supabase project.</li><li>Run <code>supabase-schema.sql</code> in its SQL Editor.</li><li>Copy <code>sync-config.example.js</code> to <code>sync-config.js</code>.</li><li>Add the project URL and browser-safe publishable or anon key.</li><li>Commit and push. Netlify redeploys automatically.</li></ol><p class="notice">Never put a Supabase service-role key in this website. Row-level security in the provided SQL restricts each user to their own record.</p><button data-global="export">Export local backup</button></aside></div>';
 const form=$('#auth-form');
 if(form)form.addEventListener('submit',async e=>{e.preventDefault();const mode=e.submitter?.value||'signin',button=e.submitter;button.disabled=true;try{await sync.signIn($('#auth-email').value.trim(),$('#auth-password').value,mode);syncPage();}catch(error){toast(error.message);button.disabled=false;}});
 if($('#sync-now'))$('#sync-now').onclick=()=>sync.push().catch(e=>toast(e.message));
 if($('#sign-out'))$('#sign-out').onclick=async()=>{await sync.signOut();syncPage();};
}
function playground(session='default'){
 const i=items.find(x=>x.id===session);
 if(session!=='default'&&(!i||i.track!=='system'))return notFound();
 $('#main').innerHTML='<a class="back" href="'+(i?'#/item/'+i.id:'#/system')+'">← '+(i?esc(i.title):'System design board')+'</a>'+titleBlock('system')+'<div id="playground"></div>';
 mountPlayground($('#playground'),state,save,toast,session);
}
function notFound(){$('#main').innerHTML='<h1>Page not found</h1><p>This learning entry is unavailable.</p><a class="button primary" href="#/dsa">Return to the practice board</a>';}
function route(){
 timerCleanup();timerCleanup=()=>{};
 let parts;try{parts=decodeURIComponent(location.hash.slice(1)||'/dsa').split('/').filter(Boolean);}catch{return notFound();}
 const [kind,id]=parts,track=kind==='item'?(items.find(i=>i.id===id)?.track||'dsa'):kind==='playground'?'system':kind;
 if(track!==lastTrack){filter={query:'',topic:'all',level:'all',status:'all',content:'all'};page=1;lastTrack=track;}
 nav(track);
 if(kind==='item')detail(id);else if(kind==='playground')playground(id);else if(kind==='interview')interview();else if(kind==='library')library(id);else if(kind==='sync')syncPage();else if(tracks[kind])board(kind);else notFound();
 window.scrollTo(0,0);
}
async function start(){
 updateInstallControls();
 try{
  const responses=await Promise.all([fetch('./data/curriculum.json'),fetch('./data/solutions.json')]);
  if(responses.some(r=>!r.ok))throw Error('Could not load the curriculum.');
  const [curriculum,pack]=await Promise.all(responses.map(r=>r.json()));solutions=pack;
  const lessonMap=new Map(lessons.map(l=>[l.id,l]));
  items=curriculum.map(i=>{const solution=i.track==='dsa'?solutions[i.id.slice(4)]:undefined,lesson=lessonMap.get(i.id);return {...i,solution,lesson,level:solution?.level||lesson?.level||i.level};});
  const ids=new Set(items.map(i=>i.id));
  for(const lesson of lessons)if(!ids.has(lesson.id))items.push({...lesson,lesson,leetcode:'',source:'Original lesson'});
  window.addEventListener('hashchange',route);route();
  if(loaded.error)toast(loaded.error);
  const offline=()=>$('#offline').hidden=navigator.onLine;window.addEventListener('online',offline);window.addEventListener('offline',offline);offline();
  setupTheme();sync.start().catch(e=>toast(e.message));
  if('serviceWorker' in navigator){
   navigator.serviceWorker.register('./sw.js').then(reg=>{
    reg.addEventListener('updatefound',()=>{const w=reg.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)toast('An update is ready. Close all app tabs and reopen to load it.');});});
   }).catch(()=>toast('Offline caching is unavailable. The app can still be used online.'));
  }
 }catch(e){$('#main').innerHTML='<h1>Unable to load your workspace</h1><p>'+esc(e.message)+'</p><p>Connect to the internet and reload. When running locally, serve this folder over HTTP rather than opening index.html directly.</p><button id="reload">Reload</button>';$('#reload').onclick=()=>location.reload();}
}
function setupTheme(){
 const stored=localStorage.getItem('interview-prep-hub:theme');
 const dark=stored?stored==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
 document.documentElement.dataset.theme=dark?'dark':'light';
 const render=()=>{const isDark=document.documentElement.dataset.theme==='dark';$('#theme-toggle').textContent=isDark?'Light':'Dark';$('#theme-toggle').setAttribute('aria-label',isDark?'Use light theme':'Use dark theme');};
 $('#theme-toggle').onclick=()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('interview-prep-hub:theme',next);render();};
 render();renderSyncStatus();
}
start();
