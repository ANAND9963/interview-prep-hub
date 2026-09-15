import {validateDiagram,capacity} from './state.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const node=(id,label,x,y)=>({id,label,x,y});
const presets={
 blank:{nodes:[],edges:[],notes:''},
 redirect:{nodes:[node('client','Client',30,165),node('api','Redirect API',240,165),node('cache','Cache',460,70),node('db','Link database',690,165),node('queue','Analytics queue',460,295)],edges:[{from:'client',to:'api'},{from:'api',to:'cache'},{from:'api',to:'db'},{from:'api',to:'queue'}],notes:'Assumptions: read-heavy workload; click analytics may lag. Failure: cache miss falls back to durable storage.'},
 rag:{nodes:[node('client','Question',30,165),node('retrieve','Retriever',240,165),node('vector','Vector index',460,55),node('model','LLM',460,265),node('answer','Cited answer',690,265)],edges:[{from:'client',to:'retrieve'},{from:'retrieve',to:'vector'},{from:'retrieve',to:'model'},{from:'model',to:'answer'}],notes:'Filter retrieval by user permissions. Measure evidence recall separately from answer correctness.'}
};
export function mountPlayground(root,state,save,toast,session='default'){
 let d=structuredClone(state.diagrams[session]||((session==='default'||session.includes('url-shortening'))?presets.redirect:presets.blank)),selected=null,selectedEdge=-1,connect=false,from=null,history=[],drag=null;
 state.activeDiagram=session;
 const persist=()=>{state.diagrams[session]=structuredClone(d);save();};
 const checkpoint=()=>{history.push(structuredClone(d));if(history.length>25)history.shift();};
 root.innerHTML='<div class="design-grid"><section class="panel"><div class="canvas-toolbar"><select id="node-type" aria-label="Component type">'+['Client','Load balancer','API service','Cache','SQL database','NoSQL database','Queue','Worker','Object storage','CDN','Vector index','LLM'].map(n=>'<option>'+n+'</option>').join('')+'</select><button id="add-node">+ Add</button><button id="connect-node" aria-pressed="false">Connect</button><button id="rename-node">Rename</button><button id="delete-node">Delete selected</button><button id="undo-node">Undo</button><select id="diagram-preset" aria-label="Template"><option value="">Load template…</option><option value="blank">Empty canvas</option><option value="redirect">URL shortener</option><option value="rag">RAG system</option></select></div><div class="canvas-wrap"><svg id="diagram" class="diagram" viewBox="0 0 1000 430" role="group" aria-label="Architecture diagram. Select a node and use arrow keys to move. Connect selects source then destination."></svg></div><div class="side-panel"><p class="muted" id="diagram-help">Drag components or focus one and use arrow keys. Select Connect, then choose source and destination.</p><label class="field">Design notes<textarea id="design-notes" rows="4" maxlength="30000" placeholder="Requirements, data model, bottlenecks, and failure behavior…"></textarea></label><p class="install-note">Changes save automatically on this device. Export progress includes diagrams.</p></div></section><aside class="panel side-panel"><h2>Capacity worksheet</h2><p class="muted">Rough workload estimates. Storage assumes every operation persists the stated bytes.</p><label class="field">Operations per day<input id="daily" type="number" min="0" value="10000000"></label><label class="field">Peak multiplier<input id="peak" type="number" min="1" value="10"></label><label class="field">Bytes stored per operation<input id="bytes" type="number" min="0" value="200"></label><label class="field">Retention days<input id="days" type="number" min="0" value="30"></label><div class="capacity" id="capacity" aria-live="polite"></div><h3>Challenge your design</h3><ul class="muted"><li>What is the first bottleneck?</li><li>What happens when the cache fails?</li><li>Which writes must be atomic?</li><li>How do retries avoid duplicates?</li><li>What changes at 10× traffic?</li></ul></aside></div>';
 const svg=root.querySelector('#diagram'),help=root.querySelector('#diagram-help');
 function render(){
  svg.innerHTML='<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#758cae"/></marker></defs>'+d.edges.map((e,i)=>{
   const a=d.nodes.find(n=>n.id===e.from),b=d.nodes.find(n=>n.id===e.to);
   if(!a||!b)return '';
   const x1=a.x+80,y1=a.y+27,x2=b.x+80,y2=b.y+27,dx=x2-x1,dy=y2-y1;
   const scale=Math.max(Math.abs(dx)/80,Math.abs(dy)/27)||1;
   const endX=x2-dx/scale,endY=y2-dy/scale;
   const path='M '+x1+' '+y1+' L '+endX+' '+endY;
   return '<path class="edge '+(selectedEdge===i?'selected':'')+'" d="'+path+'" marker-end="url(#arrow)"/><path class="edge-hit" data-edge="'+i+'" d="'+path+'" tabindex="0" role="button" aria-label="Connection from '+esc(a.label)+' to '+esc(b.label)+'"/>';
  }).join('')+d.nodes.map(n=>'<g class="node '+(selected===n.id?'selected':'')+'" transform="translate('+n.x+','+n.y+')" data-node="'+n.id+'" tabindex="0" role="button" aria-label="'+esc(n.label)+'"><rect width="160" height="54" rx="9"/><text x="80" y="32" text-anchor="middle">'+esc(n.label.length>22?n.label.slice(0,21)+'…':n.label)+'</text></g>').join('');
  root.querySelector('#undo-node').disabled=!history.length;
 }
 function choose(id){
  selected=id;selectedEdge=-1;
  if(connect){
   if(!from){from=id;help.textContent='Now select the destination component.';}
   else if(from!==id){if(!d.edges.some(e=>e.from===from&&e.to===id)){if(d.edges.length>=160){toast('This diagram supports up to 160 connections.');return;}checkpoint();d.edges.push({from,to:id});persist();}connect=false;from=null;root.querySelector('#connect-node').setAttribute('aria-pressed','false');help.textContent='Connection added. Select Connect to add another.';}
  }
 }
 svg.addEventListener('pointerdown',e=>{
  const g=e.target.closest('[data-node]'),edge=e.target.closest('[data-edge]');
  if(edge){selected=null;selectedEdge=Number(edge.dataset.edge);render();return;}
  if(!g){selected=null;selectedEdge=-1;render();return;}
  const connecting=connect;choose(g.dataset.node);
  if(!connecting){checkpoint();const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const pos=p.matrixTransform(svg.getScreenCTM().inverse());const n=d.nodes.find(n=>n.id===selected);drag={id:n.id,dx:pos.x-n.x,dy:pos.y-n.y};svg.setPointerCapture(e.pointerId);}
  render();
 });
 svg.addEventListener('pointermove',e=>{
  if(!drag)return;const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const pos=p.matrixTransform(svg.getScreenCTM().inverse());const n=d.nodes.find(n=>n.id===drag.id);
  n.x=Math.max(5,Math.min(825,pos.x-drag.dx));n.y=Math.max(5,Math.min(365,pos.y-drag.dy));render();
 });
 const stop=()=>{if(drag){drag=null;persist();}};
 svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);
 svg.addEventListener('keydown',e=>{
  const id=e.target.closest('[data-node]')?.dataset.node,edge=e.target.closest('[data-edge]');
  if(edge&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selected=null;selectedEdge=Number(edge.dataset.edge);render();return;}
  if(!id)return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(id);render();svg.querySelector('[data-node="'+id+'"]')?.focus();return;}
  const delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];
  if(delta){e.preventDefault();checkpoint();selected=id;const n=d.nodes.find(n=>n.id===id);n.x=Math.max(5,Math.min(825,n.x+delta[0]));n.y=Math.max(5,Math.min(365,n.y+delta[1]));render();svg.querySelector('[data-node="'+id+'"]')?.focus();persist();}
 });
 root.querySelector('#add-node').onclick=()=>{if(d.nodes.length>=80)return toast('This diagram supports up to 80 components.');checkpoint();const id='n-'+crypto.randomUUID();d.nodes.push(node(id,root.querySelector('#node-type').value,50+(d.nodes.length%5)*170,40+(Math.floor(d.nodes.length/5)%4)*85));selected=id;render();persist();};
 root.querySelector('#connect-node').onclick=e=>{connect=!connect;from=null;e.currentTarget.setAttribute('aria-pressed',String(connect));help.textContent=connect?'Select the source component.':'Drag components or use arrow keys to move them.';};
 root.querySelector('#delete-node').onclick=()=>{if(!selected&&selectedEdge<0)return toast('Select a component or connection first.');checkpoint();if(selected){d.nodes=d.nodes.filter(n=>n.id!==selected);d.edges=d.edges.filter(e=>e.from!==selected&&e.to!==selected);}else d.edges.splice(selectedEdge,1);selected=null;selectedEdge=-1;from=null;render();persist();};
 root.querySelector('#rename-node').onclick=()=>{const n=d.nodes.find(n=>n.id===selected);if(!n)return toast('Select a component first.');const label=prompt('Component name (up to 60 characters)',n.label);if(label?.trim()){checkpoint();n.label=label.trim().slice(0,60);render();persist();}};
 root.querySelector('#undo-node').onclick=()=>{if(history.length){d=validateDiagram(history.pop());selected=null;selectedEdge=-1;root.querySelector('#design-notes').value=d.notes;render();persist();}};
 root.querySelector('#diagram-preset').onchange=e=>{const key=e.target.value;if(!key)return;if(confirm('Replace this canvas with the selected template? Undo restores the previous canvas.')){checkpoint();d=structuredClone(presets[key]);selected=null;selectedEdge=-1;root.querySelector('#design-notes').value=d.notes;render();persist();}e.target.value='';};
 root.querySelector('#design-notes').value=d.notes||'';
 root.querySelector('#design-notes').oninput=e=>{d.notes=e.target.value;persist();};
 function calculate(){try{const values=['daily','peak','bytes','days'].map(id=>{const v=root.querySelector('#'+id).value;return v===''?NaN:Number(v);});const x=capacity(...values);root.querySelector('#capacity').innerHTML='Average requests/s<strong>'+x.average.toLocaleString(undefined,{maximumFractionDigits:1})+'</strong>Peak requests/s<strong>'+x.peak.toLocaleString(undefined,{maximumFractionDigits:1})+'</strong>Raw retained storage<strong>'+x.storage.toLocaleString(undefined,{maximumFractionDigits:2})+' GB</strong><small>Decimal GB. Excludes indexes, replicas, backups, and protocol overhead.</small>';}catch(e){root.querySelector('#capacity').textContent=e.message;}}
 ['daily','peak','bytes','days'].forEach(id=>root.querySelector('#'+id).oninput=calculate);
 render();calculate();
}
