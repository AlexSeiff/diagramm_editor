import { MODES, CARDS, uid, clone, emptyProject, makeNode, normalizeSize, validateProject, connectNodes, removeSelection, template, modelWarnings, Timeline } from './src/model.js';
import { shape, nodeText, escapeHTML, diagramMarkup, contentBounds, svgDocument } from './src/render.js';
import { icon, hydrateIcons } from './src/icons.js';
import { loadProject, saveProject, snapshots, snapshot } from './src/storage.js';
import { downloadBlob, rasterize, canvasBlob, pdfBlob } from './src/export.js';

const $=id=>document.getElementById(id), html=escapeHTML, canvas=$('canvas'), timeline=new Timeline();
let state=emptyProject(),mode='BPMN',selected=new Set(),source=null,tool='select',space=false,gesture=null;
let view={x:0,y:0,zoom:1},saveTimer,toastTimer,hasStored=false,loadFailed=false,saveError=false,resizeFit=false;
const board=()=>state.boards[mode];
const tableDrafts=new Map();
// Text edits save immediately but create one history entry when focus leaves the field.
function bindText(id,item,key){const input=$(id);let before;input.onfocus=()=>{before=clone(state);};input.oninput=()=>{before??=clone(state);const target=typeof item==='function'?item():item;target[key]=input.value;if(target.type==='table')normalizeSize(target);scheduleSave();render(false);};input.onblur=()=>{if(before){timeline.record(before,state);before=undefined;render(false);}};}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
function reportStorageError(){saveError=true;$('saveStatus').textContent='Nicht gespeichert · Projektdatei sichern';$('saveStatus').classList.add('storage-error');}
try {const stored=loadProject(localStorage);if(stored){state=stored;hasStored=true;try{snapshot(localStorage,state);}catch{reportStorageError();}}}catch{loadFailed=true;reportStorageError();}
function persist(){clearTimeout(saveTimer);if(loadFailed)return;try{saveProject(localStorage,state);saveError=false;$('saveStatus').classList.remove('storage-error');$('saveStatus').textContent='Lokal gespeichert · '+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});}catch{reportStorageError();}}
function scheduleSave(){if(!saveError)$('saveStatus').textContent='Änderungen werden gespeichert …';clearTimeout(saveTimer);saveTimer=setTimeout(persist,350);}
function preserve(){try{snapshot(localStorage,state);}catch{toast('Lokale Sicherung nicht möglich. Lade eine Projektdatei herunter.');}}
function commit(before,inspector=true){if(timeline.record(before,state))scheduleSave();render(inspector);}
function mutate(change,inspector=true){const before=clone(state);change();commit(before,inspector);}
function setInspector(open){$('inspector').hidden=!open;$('toggleInspector').setAttribute('aria-expanded',String(open));if(open&&matchMedia('(max-width:650px)').matches)setPalette(false);}
function setPalette(open){$('toolbox').hidden=!open;$('togglePalette').setAttribute('aria-expanded',String(open));if(open&&matchMedia('(max-width:650px)').matches)setInspector(false);}
function dimensions(){const r=canvas.getBoundingClientRect();return {w:Math.max(1,r.width),h:Math.max(1,r.height)};}
function updateView(){const {w,h}=dimensions();canvas.setAttribute('viewBox',`${view.x} ${view.y} ${w/view.zoom} ${h/view.zoom}`);$('zoom').textContent=Math.round(view.zoom*100)+' %';}
function fit(){const b=contentBounds(board()),{w,h}=dimensions();view.zoom=Math.min(1.5,Math.max(.05,Math.min(w/b.w,h/b.h)));view.x=b.x+b.w/2-w/view.zoom/2;view.y=b.y+b.h/2-h/view.zoom/2;updateView();}
function zoomAt(factor,client){const {w,h}=dimensions(),r=canvas.getBoundingClientRect(),px=client?client.x-r.left:w/2,py=client?client.y-r.top:h/2;const x=view.x+px/view.zoom,y=view.y+py/view.zoom;view.zoom=Math.max(.05,Math.min(4,view.zoom*factor));view.x=x-px/view.zoom;view.y=y-py/view.zoom;updateView();}
function point(e){const p=canvas.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(canvas.getScreenCTM().inverse());}
function render(inspector=true){
  const focus=document.activeElement?.closest?.('#canvas [data-id]')?.dataset.id;
  canvas.innerHTML=diagramMarkup(board(),mode,selected,source);updateView();
  if(focus){Array.from(canvas.querySelectorAll('[data-id]')).find(el=>el.dataset.id===focus)?.focus({preventScroll:true});}
  $('title').value=state.title;$('boardName').value=board().name;$('modeLabel').textContent=MODES[mode].name+' / '+MODES[mode].description;
  $('emptyState').hidden=!!board().nodes.length;$('counts').textContent=`${board().nodes.length} Elemente · ${board().edges.length} Verbindungen`;
  $('undo').disabled=!timeline.past.length;$('redo').disabled=!timeline.future.length;
  document.querySelectorAll('#tabs button').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-selected',String(b.dataset.mode===mode));b.tabIndex=b.dataset.mode===mode?0:-1;});
  $('editor').classList.toggle('connecting',tool==='connect');
  $('toolHint').textContent=tool==='connect'?(source?'Zielelement auswählen · Esc zum Abbrechen':'Startelement auswählen · Esc zum Abbrechen'):tool==='pan'?'Ziehen, um die Ansicht zu verschieben':'Element auswählen · Leertaste zum Verschieben';
  canvas.style.cursor=tool==='connect'?'crosshair':tool==='pan'||space?'grab':'default';
  if(inspector)inspect();
}
function setTool(value){tool=value;source=null;for(const t of ['select','connect','pan']){$(t).classList.toggle('chosen',t===tool);$(t).setAttribute('aria-pressed',String(t===tool));}render(false);}
function switchMode(value){mode=value;selected.clear();source=null;setInspector(false);setTool('select');palette();view={x:0,y:0,zoom:1};render();requestAnimationFrame(fit);}
$('tabs').innerHTML=Object.entries(MODES).map(([key,m])=>`<button role="tab" id="tab-${key}" data-mode="${key}" aria-controls="canvas" aria-selected="${key===mode}" title="${m.description}">${m.name}<small>${m.description}</small></button>`).join('');
$('startMode').innerHTML=Object.entries(MODES).map(([key,m])=>`<option value="${key}">${m.name} – ${m.description}</option>`).join('');
$('tabs').onclick=e=>{const button=e.target.closest('[data-mode]');if(button)switchMode(button.dataset.mode);};
$('tabs').onkeydown=e=>{const keys=Object.keys(MODES);let i=keys.indexOf(mode);if(e.key==='ArrowRight')i=(i+1)%keys.length;else if(e.key==='ArrowLeft')i=(i+keys.length-1)%keys.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=keys.length-1;else return;e.preventDefault();switchMode(keys[i]);$('tab-'+keys[i]).focus();};
function palette(){
  $('palette').innerHTML=MODES[mode].types.map(([type,label])=>{const n=makeNode(type),ratio=n.w/n.h;const symbol={...n,w:ratio>2?130:ratio<1.2?76:130,h:76};return `<button draggable="true" data-type="${type}" title="${label} hinzufügen"><svg viewBox="-8 -8 ${symbol.w+16} 110" aria-hidden="true">${shape(symbol)}${['gateway','parallel','xor','and','or'].includes(type)?nodeText({...symbol,label:''}):''}</svg><span>${label}</span></button>`;}).join('');
  $('palette').querySelectorAll('button').forEach(b=>{b.onclick=()=>addNode(b.dataset.type);b.ondragstart=e=>{e.dataTransfer.setData('application/model-studio',b.dataset.type);e.dataTransfer.effectAllowed='copy';};});
}
function addNode(type,position){
  const {w,h}=dimensions(),n=makeNode(type);const center=position||{x:view.x+w/view.zoom/2,y:view.y+h/view.zoom/2};n.x=Math.round((center.x-n.w/2)/10)*10;n.y=Math.round((center.y-n.h/2)/10)*10;
  if(!position){let attempts=0;while(board().nodes.some(a=>Math.abs(a.x-n.x)<25&&Math.abs(a.y-n.y)<25)&&attempts++<30){n.x+=30;n.y+=30;}}
  mutate(()=>{board().nodes.push(n);assignParent(n);selected=new Set([n.id]);});setInspector(true);inspect();if(matchMedia('(max-width:650px)').matches){setInspector(false);setPalette(false);}toast(MODES[mode].types.find(t=>t[0]===type)[1]+' hinzugefügt');
}
function assignParent(n){if(n.type==='pool')return;const pool=board().nodes.find(p=>p.type==='pool'&&n.x>=p.x+34&&n.y>=p.y&&n.x+n.w<=p.x+p.w&&n.y+n.h<=p.y+p.h);if(pool)n.parentId=pool.id;else delete n.parentId;}
canvas.ondragover=e=>{if(Array.from(e.dataTransfer.types).includes('application/model-studio')){e.preventDefault();e.dataTransfer.dropEffect='copy';}};
canvas.ondrop=e=>{e.preventDefault();const type=e.dataTransfer.getData('application/model-studio');if(MODES[mode].types.some(t=>t[0]===type))addNode(type,point(e));};

function selectId(id,add=false){if(add){if(selected.has(id))selected.delete(id);else selected.add(id);}else selected=new Set(id?[id]:[]);render();if(selected.size)setInspector(true);}
function finishConnection(id){if(!source){source=id;render(false);return;}const from=source;if(from===id){toast('Wähle ein anderes Zielelement.');return;}let added=false;mutate(()=>{added=connectNodes(board(),from,id);if(added)selected=new Set([board().edges.at(-1).id]);});if(added){source=null;setTool('select');inspect();setInspector(true);toast('Verbindung erstellt');}else toast('Diese Verbindung besteht bereits oder ist nicht zulässig.');}
canvas.onpointerdown=e=>{
  if(e.button!==0&&e.button!==1)return;const p=point(e),g=e.target.closest('[data-id]'),id=g?.dataset.id,n=board().nodes.find(n=>n.id===id);
  if(e.button===1||space||tool==='pan'){e.preventDefault();gesture={kind:'pan',cx:e.clientX,cy:e.clientY,x:view.x,y:view.y};canvas.setPointerCapture(e.pointerId);return;}
  if(e.target.dataset.port&&n){setTool('connect');source=id;selected=new Set([id]);render(false);return;}
  if(tool==='connect'&&n){finishConnection(id);return;}
  if(!g){selected.clear();source=null;setInspector(false);render();return;}
  if(e.shiftKey){selectId(id,true);return;}
  if(!selected.has(id))selectId(id);else render(false);
  if(n){const ids=new Set(selected);for(const item of board().nodes)if(ids.has(item.parentId))ids.add(item.id);gesture={kind:'move',start:p,before:clone(state),positions:board().nodes.filter(a=>ids.has(a.id)).map(a=>({id:a.id,x:a.x,y:a.y})),moved:false};canvas.setPointerCapture(e.pointerId);}
};
canvas.onpointermove=e=>{
  if(!gesture)return;if(gesture.kind==='pan'){view.x=gesture.x-(e.clientX-gesture.cx)/view.zoom;view.y=gesture.y-(e.clientY-gesture.cy)/view.zoom;updateView();return;}
  const p=point(e),dx=Math.round((p.x-gesture.start.x)/10)*10,dy=Math.round((p.y-gesture.start.y)/10)*10;
  if(!dx&&!dy&&!gesture.moved)return;gesture.moved=true;
  for(const pos of gesture.positions){const n=board().nodes.find(n=>n.id===pos.id);n.x=pos.x+dx;n.y=pos.y+dy;}render(false);
};
function finishGesture(cancel=false){if(!gesture)return;const current=gesture;gesture=null;if(current.kind==='move'&&current.moved){if(cancel){state=current.before;render();}else{for(const pos of current.positions)assignParent(board().nodes.find(n=>n.id===pos.id));commit(current.before,false);}}}
canvas.onpointerup=()=>finishGesture();canvas.onpointercancel=()=>finishGesture(true);
canvas.onwheel=e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){zoomAt(Math.exp(-e.deltaY*.005),{x:e.clientX,y:e.clientY});}else{view.x+=e.deltaX/view.zoom;view.y+=e.deltaY/view.zoom;updateView();}};
canvas.ondblclick=e=>{const id=e.target.closest('[data-id]')?.dataset.id;if(id){selected=new Set([id]);render();setInspector(true);$('label')?.focus();$('label')?.select();}};
canvas.onfocusin=e=>{const id=e.target.closest('[data-id]')?.dataset.id;if(id&&!selected.has(id)){selected=new Set([id]);canvas.querySelectorAll('.node').forEach(n=>n.classList.toggle('selected',n.dataset.id===id));inspect();}};

function inspect(){
  const n=board().nodes.find(n=>selected.has(n.id)),edge=board().edges.find(e=>selected.has(e.id)),body=$('inspectorBody');
  if(!selected.size){$('inspectorTitle').textContent='Deine Auswahl';body.innerHTML='<p>Wähle ein Element oder eine Verbindung auf der Zeichenfläche, um die Eigenschaften zu bearbeiten.</p>';return;}
  if(selected.size>1){$('inspectorTitle').textContent=selected.size+' ausgewählt';body.innerHTML='<p>Ordne die ausgewählten Elemente gemeinsam an.</p><div class="multi-actions"><button data-align="left">Linksbündig</button><button data-align="top">Oben ausrichten</button><button data-align="horizontal">Horizontal verteilen</button><button data-align="vertical">Vertikal verteilen</button></div><div class="inspector-actions"><button id="duplicate" data-icon="copy">Duplizieren</button><button id="delete" class="danger" data-icon="trash">Löschen</button></div>';body.querySelectorAll('[data-align]').forEach(b=>b.onclick=()=>align(b.dataset.align));bindActions();hydrateIcons(body);return;}
  const item=n||edge;if(!item)return;
  $('inspectorTitle').textContent=n?(MODES[mode].types.find(t=>t[0]===n.type)?.[1]||'Element'):'Verbindung';
  body.innerHTML=`<label for="label">${n?.type==='table'?'Tabellenname':'Beschriftung'}</label><textarea id="label" rows="3" maxlength="2000">${html(item.label)}</textarea>${n?`<label for="color">Füllfarbe</label><input type="color" id="color" value="${n.color}"><div class="form-grid"><label>Breite<input type="number" id="width" min="${n.type==='table'?280:40}" max="3000" value="${n.w}"></label>${n.type==='table'?'<p class="fine">Die Höhe passt sich den Spalten an.</p>':`<label>Höhe<input type="number" id="height" min="30" max="3000" value="${n.h}"></label>`}</div>`:''}${n?.type==='table'?'<div class="columns-title"><h3>Spalten</h3><button id="addColumn" data-icon="plus">Hinzufügen</button></div><div id="columnRows"></div><p id="columnError" class="error" role="alert" hidden></p><details><summary>Expertenmodus · Text bearbeiten</summary><textarea id="columns" class="expert" aria-label="Spalten als Text" spellcheck="false"></textarea><p class="fine">Eine Spalte pro Zeile: Schlüssel | Name | Typ. Schlüssel: PK, FK, PK FK oder leer.</p><button id="applyColumns" class="apply-columns">Text übernehmen</button></details>':''}${edge&&mode==='ERD'?'<p>Ordne die verbundenen Tabellen über ihre Spalten zu. „1“ steht für genau einen Datensatz, „0..N“ für beliebig viele.</p>'+['from','to'].map((side,i)=>{const table=board().nodes.find(n=>n.id===edge[side]);return `<label for="${side}Column">${i?'Ziel':'Quelle'}: ${html(table.label)} · Spalte</label><select id="${side}Column"><option value="">Ganze Tabelle</option>${table.columns.map(c=>`<option value="${html(c.name)}">${html(c.name)}</option>`).join('')}</select><label for="${side}Card">${i?'Ziel':'Quelle'}: Anzahl</label><select id="${side}Card">${CARDS.map(c=>`<option>${c}</option>`).join('')}</select>`;}).join(''):''}<div class="inspector-actions">${n?'<button id="duplicate" data-icon="copy">Duplizieren</button>':''}<button id="delete" class="danger" data-icon="trash">Löschen</button></div>`;
  bindText('label',item,'label');
  if(n){$('color').oninput=()=>mutate(()=>{n.color=$('color').value;},false);for(const [id,key,min]of [['width','w',n.type==='table'?280:40],['height','h',30]])if($(id))$(id).onchange=()=>{const value=Number($(id).value);if(!Number.isFinite(value)||value<min||value>3000){$(id).setCustomValidity(`Wähle einen Wert zwischen ${min} und 3000.`);$(id).reportValidity();return;}$(id).setCustomValidity('');mutate(()=>{n[key]=value;});};}
  if(n?.type==='table'){
    let draft=clone(tableDrafts.get(n.id)||n.columns);
    const error=message=>{$('columnError').textContent=message;$('columnError').hidden=!message;};
    const apply=(rerender=false)=>{
      tableDrafts.set(n.id,clone(draft));
      if(draft.length>40){error('Höchstens 40 Spalten pro Tabelle.');if(rerender)rows();return false;}
      if(draft.some(c=>!c.name.trim()||!c.type.trim())){error('Jede Spalte braucht einen Namen und einen Datentyp.');if(rerender)rows();return false;}
      if(new Set(draft.map(c=>c.name.trim())).size!==draft.length){error('Spaltennamen müssen innerhalb der Tabelle eindeutig sein.');if(rerender)rows();return false;}
      error('');tableDrafts.delete(n.id);const old=clone(n.columns);mutate(()=>{n.columns=clone(draft);normalizeSize(n);for(const e of board().edges)for(const side of ['from','to'])if(e[side]===n.id&&e[side+'Column']&&!n.columns.some(c=>c.name===e[side+'Column'])){const index=old.findIndex(c=>c.name===e[side+'Column']);e[side+'Column']=index>=0&&old.length===draft.length?draft[index].name:'';}},false);$('columns').value=draft.map(c=>`${c.key} | ${c.name} | ${c.type}`).join('\n');if(rerender)rows();return true;
    };
    const rows=()=>{
      $('columnRows').innerHTML=draft.map((c,i)=>`<div class="column-row" data-index="${i}"><input class="field-input" data-col="name" aria-label="Spalte ${i+1}: Name" value="${html(c.name)}" maxlength="100"><input class="field-input" data-col="type" aria-label="Spalte ${i+1}: Datentyp" value="${html(c.type)}" list="dataTypes" maxlength="100"><div class="column-flags"><label><input type="checkbox" data-flag="PK" ${c.key.includes('PK')?'checked':''}> PK</label><label><input type="checkbox" data-flag="FK" ${c.key.includes('FK')?'checked':''}> FK</label><span class="spacer"></span><button data-move="-1" aria-label="Spalte ${i+1} nach oben" ${i===0?'disabled':''}>${icon('up')}</button><button data-move="1" aria-label="Spalte ${i+1} nach unten" ${i===draft.length-1?'disabled':''}>${icon('down')}</button><button data-remove aria-label="Spalte ${i+1} entfernen">${icon('trash')}</button></div></div>`).join('')+'<datalist id="dataTypes">'+['INT','BIGINT','VARCHAR(255)','TEXT','DATE','TIMESTAMP','BOOLEAN','DECIMAL(10,2)','UUID'].map(t=>`<option value="${t}">`).join('')+'</datalist>';
      $('columnRows').querySelectorAll('.column-row').forEach(row=>{const i=Number(row.dataset.index);row.querySelectorAll('[data-col]').forEach(input=>input.oninput=()=>{draft[i][input.dataset.col]=input.value;apply();});row.querySelectorAll('[data-flag]').forEach(input=>input.onchange=()=>{draft[i].key=Array.from(row.querySelectorAll('[data-flag]:checked')).map(c=>c.dataset.flag).join(' ');apply();});row.querySelectorAll('[data-move]').forEach(button=>button.onclick=()=>{const j=i+Number(button.dataset.move);[draft[i],draft[j]]=[draft[j],draft[i]];apply(true);});row.querySelector('[data-remove]').onclick=()=>{draft.splice(i,1);apply(true);};});
    };
    rows();$('columns').value=draft.map(c=>`${c.key} | ${c.name} | ${c.type}`).join('\n');if(tableDrafts.has(n.id))error('Dieser Entwurf enthält ungültige oder doppelte Spalten. Korrigiere ihn, damit er gespeichert wird.');
    $('addColumn').onclick=()=>{if(draft.length>=40){error('Höchstens 40 Spalten pro Tabelle.');return;}let name='spalte_'+(draft.length+1);while(draft.some(c=>c.name===name))name+='_neu';draft.push({key:'',name,type:'VARCHAR(255)'});apply(true);};
    $('applyColumns').onclick=()=>{const parsed=[];for(const line of $('columns').value.split('\n').filter(s=>s.trim())){const parts=line.split('|').map(p=>p.trim());if(parts.length!==3||!['','PK','FK','PK FK'].includes(parts[0].toUpperCase())){error('Nutze pro Zeile: Schlüssel | Name | Typ.');return;}parsed.push({key:parts[0].toUpperCase(),name:parts[1],type:parts[2]});}draft=parsed;apply(true);};
  }
  if(edge&&mode==='ERD')for(const side of ['from','to'])for(const suffix of ['Column','Card']){const key=side+suffix;$(key).value=edge[key]??(suffix==='Column'?'':side==='from'?'1':'0..N');$(key).onchange=()=>mutate(()=>{edge[key]=$(key).value;},false);}
  bindActions();hydrateIcons(body);
}
function bindActions(){if($('delete'))$('delete').onclick=remove;if($('duplicate'))$('duplicate').onclick=duplicate;}
function remove(){if(!selected.size)return;mutate(()=>{removeSelection(board(),selected);selected.clear();});setInspector(false);toast('Auswahl gelöscht · mit Strg+Z wiederherstellen');}
function duplicate(){const originals=board().nodes.filter(n=>selected.has(n.id));if(!originals.length)return;mutate(()=>{const mapping=new Map(originals.map(n=>[n.id,uid()]));const copies=originals.map(n=>({...clone(n),id:mapping.get(n.id),x:n.x+40,y:n.y+40,...(n.parentId?{parentId:mapping.get(n.parentId)||n.parentId}:{})}));board().nodes.push(...copies);board().edges.push(...board().edges.filter(e=>mapping.has(e.from)&&mapping.has(e.to)).map(e=>({...clone(e),id:uid(),from:mapping.get(e.from),to:mapping.get(e.to)})));selected=new Set(copies.map(n=>n.id));});}
function align(kind){const nodes=board().nodes.filter(n=>selected.has(n.id));if(nodes.length<2)return;mutate(()=>{if(kind==='left')nodes.forEach(n=>n.x=Math.min(...nodes.map(n=>n.x)));else if(kind==='top')nodes.forEach(n=>n.y=Math.min(...nodes.map(n=>n.y)));else{const axis=kind==='horizontal'?'x':'y',size=axis==='x'?'w':'h';nodes.sort((a,b)=>a[axis]-b[axis]);const first=nodes[0][axis],last=nodes.at(-1)[axis]+nodes.at(-1)[size],gap=(last-first-nodes.reduce((sum,n)=>sum+n[size],0))/(nodes.length-1);let pos=first;nodes.forEach(n=>{n[axis]=pos;pos+=n[size]+gap;});}nodes.forEach(assignParent);});}
function undo(redo=false){if(gesture)finishGesture();state=redo?timeline.redo(state):timeline.undo(state);selected.clear();source=null;render();scheduleSave();}
for(const toolName of ['select','connect','pan'])$(toolName).onclick=()=>setTool(toolName);
$('undo').onclick=()=>undo();$('redo').onclick=()=>undo(true);
bindText('title',()=>state,'title');bindText('boardName',board,'name');
$('togglePalette').onclick=()=>setPalette($('toolbox').hidden);$('closePalette').onclick=()=>{setPalette(false);$('togglePalette').focus();};
$('toggleInspector').onclick=()=>{inspect();setInspector($('inspector').hidden);};$('closeInspector').onclick=()=>{setInspector(false);$('toggleInspector').focus();};
$('plus').onclick=()=>zoomAt(1.2);$('minus').onclick=()=>zoomAt(1/1.2);$('zoom').onclick=()=>zoomAt(1/view.zoom);$('fit').onclick=fit;
new ResizeObserver(()=>{updateView();if(resizeFit){fit();resizeFit=false;}}).observe(canvas);

document.addEventListener('keydown',e=>{
  if(document.querySelector('dialog[open]')||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
  const focused=e.target.closest?.('#canvas [data-id]');if(focused&&!selected.has(focused.dataset.id))selected=new Set([focused.dataset.id]);
  if(e.code==='Space'){e.preventDefault();space=true;canvas.style.cursor='grab';}
  if(e.key==='Escape'){finishGesture(true);selected.clear();setTool('select');setInspector(false);render();canvas.focus();}
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove();canvas.focus();}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo(e.shiftKey);}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a'){e.preventDefault();selected=new Set(board().nodes.map(n=>n.id));render();}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){e.preventDefault();duplicate();}
  if(e.key.toLowerCase()==='c'&&!e.ctrlKey&&!e.metaKey)setTool('connect');
  if((e.key==='Enter'||e.key==='F2')&&focused){e.preventDefault();if(tool==='connect'&&board().nodes.some(n=>n.id===focused.dataset.id))finishConnection(focused.dataset.id);else{render();setInspector(true);$('label')?.focus();}}
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&selected.size&&canvas.contains(e.target)){e.preventDefault();const step=e.shiftKey?1:10;mutate(()=>{const ids=new Set(selected);board().nodes.forEach(n=>{if(ids.has(n.parentId))ids.add(n.id);});board().nodes.filter(n=>ids.has(n.id)).forEach(n=>{n.x+=(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0);n.y+=(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0);assignParent(n);});},false);}
});
document.addEventListener('keyup',e=>{if(e.code==='Space'){space=false;canvas.style.cursor=tool==='pan'?'grab':'default';}});
window.addEventListener('blur',()=>{space=false;finishGesture();});
window.addEventListener('pagehide',persist);document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();});

document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
function confirmAction(title,text,action){$('confirmTitle').textContent=title;$('confirmText').textContent=text;$('confirmCancel').onclick=()=>$('confirmDialog').close();const proceed=backup=>{if(backup)saveFile();preserve();$('confirmDialog').close();action();};$('confirmProceed').onclick=()=>proceed(false);$('confirmBackup').onclick=()=>proceed(true);$('confirmDialog').showModal();$('confirmCancel').focus();}
function replaceBoard(withTemplate){const action=()=>{mutate(()=>{state.boards[mode]=withTemplate?template(mode):{name:board().name,nodes:[],edges:[]};selected.clear();source=null;});setInspector(false);requestAnimationFrame(fit);};if(board().nodes.length)confirmAction(withTemplate?'Vorlage einsetzen?':'Diagramm leeren?',`Das aktuelle Diagramm „${board().name}“ wird ${withTemplate?'durch eine Vorlage ersetzt':'geleert'}. Die anderen Modellarten bleiben erhalten. Du kannst die Aktion rückgängig machen.`,action);else action();}
$('clear').onclick=()=>replaceBoard(false);$('template').onclick=() =>replaceBoard(true);$('emptyTemplate').onclick=()=>replaceBoard(true);
$('startBlank').onclick=()=>{switchMode($('startMode').value);$('startDialog').close();canvas.focus();};
$('startTemplate').onclick=()=>{switchMode($('startMode').value);$('startDialog').close();replaceBoard(true);};
function openFile(){$('file').click();}
for(const id of ['open','emptyOpen','startOpen'])$(id).onclick=openFile;
function saveFile(){downloadBlob(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),state.title,'json');}
$('save').onclick=saveFile;
$('file').onchange=async e=>{
  const f=e.target.files[0];if(!f)return;try{if(f.size>10000000)throw Error('Die Projektdatei darf höchstens 10 MB groß sein.');const incoming=validateProject(JSON.parse(await f.text()));$('startDialog').close();const action=()=>{loadFailed=false;mutate(()=>{state=incoming;selected.clear();source=null;});setInspector(false);requestAnimationFrame(fit);toast('Projekt geöffnet');};if(Object.values(state.boards).some(b=>b.nodes.length))confirmAction('Projekt ersetzen?','Die Datei ersetzt alle Diagramme des aktuellen Projekts. Lade bei Bedarf zuerst eine Sicherung herunter.',action);else action();}catch(error){toast('Öffnen fehlgeschlagen: '+(error instanceof SyntaxError?'Die Datei enthält kein gültiges JSON.':error.message));}e.target.value='';
};
$('help').onclick=()=>$('helpDialog').showModal();
$('check').onclick=()=>{const issues=modelWarnings(board(),mode);$('issues').innerHTML=issues.length?issues.map((i,index)=>`<button class="issue" data-issue="${index}" ${i.id?'':'disabled'}>${html(i.message)}</button>`).join(''):'<p>Keine grundlegenden Strukturprobleme gefunden.</p>';$('issues').querySelectorAll('[data-issue]').forEach(b=>b.onclick=()=>{const issue=issues[Number(b.dataset.issue)];$('issuesDialog').close();selectId(issue.id);const n=board().nodes.find(n=>n.id===issue.id),{w,h}=dimensions();view.x=n.x+n.w/2-w/view.zoom/2;view.y=n.y+n.h/2-h/view.zoom/2;updateView();});$('issuesDialog').showModal();};
$('history').onclick=()=>{try{const list=snapshots(localStorage);$('snapshots').innerHTML=list.length?list.map((s,i)=>`<button class="snapshot" data-snapshot="${i}"><strong>${html(s.state.title)}</strong><small>${html(new Date(s.at).toLocaleString('de-DE'))} · ${Object.values(s.state.boards).reduce((sum,b)=>sum+b.nodes.length,0)} Elemente</small></button>`).join(''):'<p>Noch keine Sicherungen. Ein Stand wird beim nächsten Sitzungsstart oder vor dem Ersetzen angelegt.</p>';$('snapshots').querySelectorAll('[data-snapshot]').forEach(b=>b.onclick=()=>{const incoming=clone(list[Number(b.dataset.snapshot)].state);$('historyDialog').close();confirmAction('Sicherung wiederherstellen?','Alle Diagramme werden durch diesen Stand ersetzt. Der aktuelle Stand bleibt über Rückgängig erreichbar.',()=>{loadFailed=false;mutate(()=>{state=incoming;selected.clear();source=null;});setInspector(false);requestAnimationFrame(fit);});});$('historyDialog').showModal();}catch{toast('Die lokalen Sicherungen sind nicht lesbar.');}};
function previewExport(){const format=$('format').value,bg=['jpeg','pdf'].includes(format)?'#ffffff':$('background').value;$('exportPreview').innerHTML=svgDocument(board(),mode,bg);$('paper').disabled=format!=='pdf';$('scale').disabled=format==='svg';$('background').disabled=['jpeg','pdf'].includes(format);}
$('export').onclick=()=>{previewExport();$('exportError').hidden=true;$('exportDialog').showModal();};for(const id of ['format','background'])$(id).onchange=previewExport;
async function exportAction(copy=false){
  $('download').disabled=true;$('copy').disabled=true;$('download').textContent='Wird erstellt …';$('exportError').hidden=true;
  try{const format=$('format').value,bg=['jpeg','pdf'].includes(format)?'#ffffff':$('background').value;
    if(copy){if(!navigator.clipboard?.write||!globalThis.ClipboardItem)throw Error('Die Zwischenablage ist nicht verfügbar. Lade stattdessen PNG herunter.');const promise=rasterize(board(),mode,Number($('scale').value),bg).then(c=>canvasBlob(c));await navigator.clipboard.write([new ClipboardItem({'image/png':promise})]);toast('Diagramm als PNG kopiert');}
    else{let blob;if(format==='svg')blob=new Blob([svgDocument(board(),mode,bg)],{type:'image/svg+xml'});else{const c=await rasterize(board(),mode,Number($('scale').value),bg);blob=format==='pdf'?pdfBlob(c,$('paper').value):await canvasBlob(c,'image/'+format);}downloadBlob(blob,board().name,format);toast('Export heruntergeladen');}
  }catch(error){$('exportError').textContent=error.message||'Export fehlgeschlagen. Versuche eine kleinere Auflösung.';$('exportError').hidden=false;}finally{$('download').disabled=false;$('copy').disabled=false;$('download').innerHTML=icon('export')+'Herunterladen';}
}
$('download').onclick=()=>exportAction();$('copy').onclick=()=>exportAction(true);
hydrateIcons();palette();render();if(matchMedia('(max-width:650px)').matches)setPalette(false);requestAnimationFrame(()=>{fit();if(!hasStored&&!loadFailed)$('startDialog').showModal();});
if(loadFailed)toast('Gespeicherte Daten konnten nicht geladen werden. Sie werden nicht überschrieben; öffne eine gültige Projektdatei zur Wiederherstellung.');
