import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {validateState,validateDiagram,capacity,reviewDue} from '../state.js';
import {lessons} from '../data/lessons.js';
const curriculum=JSON.parse(readFileSync(new URL('../data/curriculum.json',import.meta.url)));
const solutions=JSON.parse(readFileSync(new URL('../data/solutions.json',import.meta.url)));
test('curriculum identities and outbound practice destinations',()=>{
 assert.equal(new Set(curriculum.map(i=>i.id)).size,curriculum.length);
 for(const i of curriculum){assert.match(i.id,/^[a-z0-9-]+$/);if(i.leetcode){const url=new URL(i.leetcode);assert.equal(url.protocol,'https:');assert.ok(['leetcode.com','www.leetcode.com'].includes(url.hostname));assert.ok(url.pathname.startsWith('/problems/'));}}
 for(const slug of Object.keys(solutions))assert.ok(curriculum.some(i=>i.id==='dsa-'+slug),'Unmatched solution '+slug);
 assert.equal(new Set(lessons.map(i=>i.id)).size,lessons.length);
});
test('backup validation rejects foreign schemas and prototype keys',()=>{
 assert.throws(()=>validateState({version:2,items:{}}));
 const parsed=JSON.parse('{"version":1,"items":{"__proto__":{"status":"solved"},"dsa-test":{"status":"invented","notes":"<script>alert(1)</script>"}}}');
 const result=validateState(parsed);
 assert.equal(Object.hasOwn(result.items,'__proto__'),false);
 assert.equal(result.items['dsa-test'].status,'todo');
 assert.equal(result.items['dsa-test'].notes,'<script>alert(1)</script>'); // UI must escape text.
});
test('backup round trip retains notes, diagram connections and interview answers',()=>{
 const s={version:1,items:{'dsa-test':{status:'solved',bookmarked:true,notes:'reasoning',code:'return 1;',reviewed:99}},diagrams:{default:{nodes:[{id:'a',label:'API',x:1,y:2},{id:'b',label:'DB',x:200,y:200}],edges:[{from:'a',to:'b'}],notes:'atomic'}},interview:{intro:'My own experience'}};
 const clean=validateState(JSON.parse(JSON.stringify(s)));
 assert.equal(clean.items['dsa-test'].notes,'reasoning');
 assert.equal(clean.diagrams.default.edges[0].to,'b');
 assert.equal(clean.interview.intro,'My own experience');
});
test('malformed diagrams cannot introduce dangling references or nonfinite positions',()=>{
 assert.throws(()=>validateDiagram({nodes:[],edges:[{from:'x',to:'y'}]}));
 assert.throws(()=>validateDiagram({nodes:[{id:'a',label:'x',x:Infinity,y:1}],edges:[]}));
});
test('capacity estimates and invalid values',()=>{
 const c=capacity(86400,10,1000,30);
 assert.equal(c.average,1);assert.equal(c.peak,10);assert.equal(c.storage,2.592);
 assert.throws(()=>capacity(-1,10,100,30));assert.throws(()=>capacity(1,NaN,1,1));
});
test('revision is driven by progress and review date',()=>{
 const now=10*86400000;
 assert.equal(reviewDue({status:'solved',reviewed:now},now),false);
 assert.equal(reviewDue({status:'solved',reviewed:0},now),true);
 assert.equal(reviewDue({status:'practicing'},now),true);
 assert.equal(reviewDue({status:'todo'},now),false);
});
test('manifest assets exist and stay within the repository scope',()=>{
 const m=JSON.parse(readFileSync(new URL('../manifest.webmanifest',import.meta.url)));
 assert.equal(m.start_url,'./');assert.equal(m.scope,'./');
 for(const icon of m.icons)assert.ok(existsSync(new URL('../'+icon.src,import.meta.url)));
});
