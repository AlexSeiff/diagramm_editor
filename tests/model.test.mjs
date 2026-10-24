import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyProject, makeNode, template, validateProject, connectNodes, removeSelection, Timeline, clone, modelWarnings } from '../src/model.js';
import { svgDocument, contentBounds } from '../src/render.js';
import { loadProject, saveProject, snapshot, snapshots } from '../src/storage.js';

test('legacy projects migrate without discarding boards or labels',()=>{
  const p=emptyProject();delete p.version;delete p.boards.ERD;delete p.boards.BPMN.name;p.boards.BPMN.nodes.push(makeNode('task'));const migrated=validateProject(p);assert.equal(migrated.version,2);assert.equal(migrated.boards.BPMN.nodes[0].label,'Aufgabe');assert.deepEqual(migrated.boards.ERD.nodes,[]);
});
test('all templates round trip and the BPMN template has no open process paths',()=>{
  const p=emptyProject();for(const m of Object.keys(p.boards))p.boards[m]=template(m);assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);assert.equal(modelWarnings(p.boards.BPMN,'BPMN').length,0);
});
test('invalid imports are rejected without mutating input',()=>{
  const original=emptyProject();original.boards.ERD=template('ERD');
  for(const corrupt of [p=>p.version=99,p=>p.boards.ERD.nodes[0].w=-3,p=>p.boards.ERD.nodes[1].id=p.boards.ERD.nodes[0].id,p=>p.boards.ERD.edges[0].to='missing',p=>p.boards.ERD.edges[0].fromColumn='missing',p=>p.boards.ERD.nodes[0].columns.push({...p.boards.ERD.nodes[0].columns[0]})]){const p=clone(original);corrupt(p);const before=clone(p);assert.throws(()=>validateProject(p));assert.deepEqual(p,before);}
});
test('selection is not history, changes undo/redo atomically, branching clears redo',()=>{
  const t=new Timeline(),a=emptyProject(),b=clone(a);assert.equal(t.record(a,b),false);b.boards.BPMN.nodes.push(makeNode('task'));assert.equal(t.record(a,b),true);const undone=t.undo(b);assert.deepEqual(undone,a);assert.deepEqual(t.redo(undone),b);t.undo(b);const c=clone(a);c.title='Andere Änderung';t.record(a,c);assert.equal(t.future.length,0);
});
test('connections reject duplicates and dangling endpoints, deleting a node cleans relations',()=>{
  const b=template('ERD');assert.equal(connectNodes(b,b.nodes[0].id,b.nodes[1].id),false);assert.equal(connectNodes(b,b.nodes[0].id,b.nodes[0].id),false);assert.equal(connectNodes(b,b.nodes[0].id,'missing'),false);removeSelection(b,new Set([b.nodes[0].id]));assert.equal(b.edges.length,0);assert.equal(b.nodes.length,1);
});
test('pool membership survives file validation and pool deletion detaches children',()=>{
  const p=emptyProject(),pool=makeNode('pool'),task=makeNode('task');task.parentId=pool.id;p.boards.BPMN.nodes.push(pool,task);assert.equal(validateProject(p).boards.BPMN.nodes[1].parentId,pool.id);removeSelection(p.boards.BPMN,new Set([pool.id]));assert.equal(p.boards.BPMN.nodes[0].parentId,undefined);
});
test('SVG export escapes imported labels and excludes interactive affordances',()=>{
  const b=template('ERD');b.nodes[0].label='<script>alert("test")</script>';const svg=svgDocument(b,'ERD','transparent');assert.ok(svg.includes('&lt;script&gt;'));assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('kunden_id'));assert.ok(svg.includes('0..N'));assert.ok(!svg.includes('tabindex'));assert.ok(!svg.includes('data-port'));assert.ok(!svg.includes('marker-end'));assert.ok(contentBounds(b).w>0);
});
test('storage preserves v1 data and keeps five validated recovery points',()=>{
  const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};const p=emptyProject();delete p.version;data.set('model-studio-v1',JSON.stringify(p));const loaded=loadProject(storage);assert.equal(loaded.version,2);saveProject(storage,loaded);assert.ok(data.has('model-studio-v1'));for(let i=0;i<8;i++){loaded.title='Stand '+i;snapshot(storage,loaded);}assert.equal(snapshots(storage).length,5);assert.equal(snapshots(storage)[0].state.title,'Stand 7');snapshot(storage,loaded);assert.equal(snapshots(storage).length,5);
});
