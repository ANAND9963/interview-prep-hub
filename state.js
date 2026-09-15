export const STORAGE_KEY='interview-prep-hub:v1';
export const blankState=()=>({version:1,items:{},diagrams:{},interview:{},activeDiagram:'default'});
const plain=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const safeKey=k=>typeof k==='string'&&/^[a-zA-Z0-9_-]{1,180}$/.test(k)&&!['__proto__','prototype','constructor'].includes(k);
export function validateDiagram(d){
 if(!plain(d)||!Array.isArray(d.nodes)||!Array.isArray(d.edges)||d.nodes.length>80||d.edges.length>160)throw Error('Invalid diagram');
 const nodes=d.nodes.map(n=>{
  if(!plain(n)||!safeKey(n.id)||typeof n.label!=='string'||n.label.length>60||!Number.isFinite(n.x)||!Number.isFinite(n.y))throw Error('Invalid diagram node');
  return {id:n.id,label:n.label,x:Math.max(5,Math.min(825,n.x)),y:Math.max(5,Math.min(365,n.y))};
 });
 const ids=new Set(nodes.map(n=>n.id));
 if(ids.size!==nodes.length)throw Error('Duplicate diagram node');
 const edges=d.edges.map(e=>{if(!plain(e)||!ids.has(e.from)||!ids.has(e.to)||e.from===e.to)throw Error('Invalid diagram connection');return {from:e.from,to:e.to};});
 return {nodes,edges,notes:typeof d.notes==='string'?d.notes.slice(0,30000):''};
}
export function validateState(value){
 if(!plain(value)||value.version!==1||!plain(value.items))throw Error('This is not a supported Prep Hub backup.');
 if(Object.keys(value.items).length>5000)throw Error('Backup contains too many entries.');
 const clean=blankState();
 for(const [id,item] of Object.entries(value.items)){
  if(!safeKey(id)||!plain(item))continue;
  clean.items[id]={status:['todo','practicing','solved'].includes(item.status)?item.status:'todo',bookmarked:item.bookmarked===true,
   notes:typeof item.notes==='string'?item.notes.slice(0,30000):'',code:typeof item.code==='string'?item.code.slice(0,50000):'',
   reviewed:Number.isFinite(item.reviewed)?item.reviewed:0};
 }
 if(plain(value.diagrams)){
  if(Object.keys(value.diagrams).length>100)throw Error('Backup contains too many diagrams.');
  for(const [id,d] of Object.entries(value.diagrams))if(safeKey(id))clean.diagrams[id]=validateDiagram(d);
 }
 if(safeKey(value.activeDiagram))clean.activeDiagram=value.activeDiagram;
 if(plain(value.interview)){
  for(const [id,v] of Object.entries(value.interview))if(safeKey(id)&&typeof v==='string')clean.interview[id]=v.slice(0,30000);
 }
 return clean;
}
export function loadState(){
 try {const saved=localStorage.getItem(STORAGE_KEY);return saved?{state:validateState(JSON.parse(saved))}: {state:blankState()};}
 catch {return {state:blankState(),error:'Saved progress could not be read. Export or recover an existing backup before continuing.'};}
}
export const writeState=state=>localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
export function reviewDue(item,now=Date.now()){return item?.status==='practicing'||(item?.status==='solved'&&now-(item.reviewed||0)>7*86400000);}
export function capacity(daily,peak,bytes,days){
 if(![daily,peak,bytes,days].every(Number.isFinite)||daily<0||peak<1||bytes<0||days<0)throw Error('Use nonnegative values and a peak multiplier of at least 1.');
 return {average:daily/86400,peak:daily/86400*peak,storage:daily*bytes*days/1e9};
}
