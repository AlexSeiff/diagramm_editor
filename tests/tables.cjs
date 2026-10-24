const fs=require('fs'),vm=require('vm');
const elements=new Map();function el(){return{value:'',hidden:false,style:{},dataset:{},classList:{toggle(){}},querySelectorAll(){return[]},append(){},insertBefore(){},closest(){return{hidden:false}},setAttribute(){}}}
const sandbox={console,crypto:require('crypto').webcrypto,structuredClone,setTimeout,clearTimeout,Blob,File,TextEncoder,Uint8Array,URL,atob,localStorage:{getItem(){return JSON.stringify({title:'Existing project',boards:{BPMN:{nodes:[],edges:[]},EPK:{nodes:[],edges:[]},ERM:{nodes:[],edges:[]}}})},setItem(){}},document:{getElementById(id){if(!elements.has(id))elements.set(id,el());return elements.get(id)},createElement:el},navigator:{},window:{}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('app.js','utf8'),sandbox);
vm.runInContext(`
if(!state.boards.ERD)throw Error('Legacy migration failed');
mode='ERD';let a=node('table','',100,100),b=node('table','',600,100);a.label='Customers';b.label='Orders';board().nodes.push(a,b);selected=a.id;render();
$('columns').value='PK | customer_id | INT\\n | name | VARCHAR(255)';$('columns').onchange();
if(a.columns.length!==2||a.h!==106)throw Error('Column editing / auto height failed');
board().edges.push({id:'test-edge',from:a.id,to:b.id,label:'places',fromColumn:'customer_id',toColumn:'parent_id',fromCard:'1',toCard:'0..N'});selected='test-edge';render();
if($('fromColumn').value!=='customer_id')throw Error('Column inspector failed');
let svg=markup(true);if(!svg.includes('Customers')||!svg.includes('customer_id')||!svg.includes('0..N')||svg.includes('marker-end'))throw Error('Export markup failed');
selected=a.id;$('duplicate').click=()=>{};$('duplicate').onclick();let copy=board().nodes.find(n=>n.id===selected);copy.columns[0].name='copy_only';if(a.columns[0].name==='copy_only')throw Error('Duplicate shares columns');
$('undo').onclick();if(board().nodes.length!==2)throw Error('Undo failed');$('redo').onclick();if(board().nodes.length!==3)throw Error('Redo failed');
`,sandbox);
vm.runInContext(`
const roundTrip=validateProject(JSON.parse(JSON.stringify(state)));
if(roundTrip.boards.ERD.nodes.length!==3)throw Error('Project round trip failed');
function rejects(edit){let s=structuredClone(roundTrip);edit(s);let rejected=false;try{validateProject(s)}catch{rejected=true}if(!rejected)throw Error('Invalid project was accepted')}
rejects(s=>s.boards.ERD.nodes[0].x=Infinity);
rejects(s=>s.boards.ERD.nodes[0].w=-20);
rejects(s=>s.boards.ERD.nodes[0].columns=[null]);
rejects(s=>s.boards.ERD.nodes[1].id=s.boards.ERD.nodes[0].id);
rejects(s=>s.boards.ERD.edges[0].from='missing');
rejects(s=>s.boards.ERD.edges[0].toCard='invalid');
rejects(s=>s.boards.ERD.edges[0].fromColumn='missing');
let malicious=structuredClone(roundTrip);malicious.boards.ERD.nodes[2].id='injected" onload="alert(1)';state=validateProject(malicious);
if(markup(true).includes('data-id="injected" onload='))throw Error('Attribute escaping failed');
`,sandbox);
(async()=>{
  const blob=vm.runInContext("pdf({width:800,height:600,toDataURL(){return 'data:image/jpeg;base64,/9j/2Q=='}})",sandbox);
  const bytes=Buffer.from(await blob.arrayBuffer());
  const document=bytes.toString('latin1');
  const xref=Number(document.match(/startxref\n(\d+)/)[1]);
  if(bytes.subarray(xref,xref+4).toString()!=='xref')throw Error('PDF cross-reference offset failed');
  for(let i=1;i<=5;i++){
    const line=document.slice(xref).split('\n')[2+i];
    const offset=Number(line.slice(0,10));
    if(!bytes.subarray(offset).toString('latin1').startsWith(i+' 0 obj'))throw Error('PDF object offset failed');
  }
  console.log('Passed: legacy migration, table editing, relationships, SVG export, duplication, undo/redo, project validation, attribute escaping, and PDF structure.');
})().catch(error=>{console.error(error);process.exitCode=1});
