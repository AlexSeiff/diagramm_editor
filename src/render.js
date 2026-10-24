export const NS = 'http://www.w3.org/2000/svg';
export const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function shape(n) {
  const {w,h,type:t} = n, s = `fill="${escapeHTML(n.color)}" stroke="#52627b" stroke-width="1.6"`;
  if (['start','end','intermediate','xor','and','or'].includes(t)) return `<ellipse cx="${w/2}" cy="${h/2}" rx="${w/2-3}" ry="${h/2-3}" ${s} ${t==='end'?'style="stroke-width:4"':''}/>${t==='intermediate'?`<ellipse cx="${w/2}" cy="${h/2}" rx="${w/2-8}" ry="${h/2-8}" fill="none" stroke="#52627b"/>`:''}`;
  if (['gateway','parallel','relationship'].includes(t)) return `<path d="M${w/2} 0 ${w} ${h/2} ${w/2} ${h} 0 ${h/2}Z" ${s}/>`;
  if(t==='event') return `<path d="M20 0H${w-20}L${w} ${h/2} ${w-20} ${h}H20L0 ${h/2}Z" ${s}/>`;
  if(['attribute','key'].includes(t)) return `<ellipse cx="${w/2}" cy="${h/2}" rx="${w/2}" ry="${h/2}" ${s}/>`;
  if(t==='table') return `<rect width="${w}" height="${h}" rx="8" fill="white" stroke="#52627b" stroke-width="1.6"/><path d="M8 0H${w-8}Q${w} 0 ${w} 8V40H0V8Q0 0 8 0" fill="${escapeHTML(n.color)}"/><path d="M0 40H${w}" stroke="#c9d3e3"/>`+n.columns.map((c,i)=>`<path d="M0 ${76+i*32}H${w}" stroke="#e5eaf2"/>`).join('');
  return `<rect width="${w}" height="${h}" rx="${['task','function'].includes(t)?10:3}" ${s} ${t==='pool'?'fill-opacity=".22"':''}/>${t==='weak'?`<rect x="5" y="5" width="${w-10}" height="${h-10}" fill="none" stroke="#52627b"/>`:''}${t==='pool'?`<path d="M34 0V${h}" stroke="#52627b"/>`:''}${t==='data'?`<path d="M${w-22} 0V22H${w}" fill="none" stroke="#52627b"/>`:''}${t==='org'?`<path d="M12 0V${h}" stroke="#52627b"/>`:''}`;
}
function linesFor(text, limit) { const lines = []; for(const line of text.split('\n')) { if(!line.length)lines.push(''); for(let i=0;i<line.length;i+=limit)lines.push(line.slice(i,i+limit)); } return lines; }
export function nodeText(n) {
  if(n.type==='table') return `<g font-size="12" fill="#263650"><text x="14" y="25" font-size="14" font-weight="650">${escapeHTML(n.label)}</text>${n.columns.map((c,i)=>`<text x="12" y="${62+i*32}" font-size="9" font-weight="700" fill="#315acb">${escapeHTML(c.key)}</text><text x="54" y="${62+i*32}">${escapeHTML(c.name)}</text><text x="${n.w-12}" y="${62+i*32}" text-anchor="end" font-size="10" fill="#52627b">${escapeHTML(c.type)}</text>`).join('')}</g>`;
  const symbols={gateway:'×',parallel:'+',xor:'XOR',and:'∧',or:'∨'}, outside=['start','end','intermediate','gateway','parallel'].includes(n.type);
  if(n.type==='pool')return `<text transform="translate(23 ${n.h/2}) rotate(-90)" text-anchor="middle" font-size="13">${escapeHTML(n.label)}</text>`;
  const label = symbols[n.type] || (outside?'':n.label), lines=linesFor(label,Math.max(6,Math.floor(n.w/8)));
  return `<text x="${n.w/2}" y="${n.h/2-(lines.length-1)*8}" text-anchor="middle" dominant-baseline="middle" font-size="${symbols[n.type]?22:13}" ${n.type==='key'?'text-decoration="underline"':''}>${lines.map((l,i)=>`<tspan x="${n.w/2}" dy="${i?17:0}">${escapeHTML(l)}</tspan>`).join('')}</text>${outside?`<text x="${n.w/2}" y="${n.h+22}" font-size="12" text-anchor="middle">${linesFor(n.label,26).map((l,i)=>`<tspan x="${n.w/2}" dy="${i?16:0}">${escapeHTML(l)}</tspan>`).join('')}</text>`:''}`;
}
function anchor(n,t,column) {
  if(n.type==='table') {const i=n.columns.findIndex(c=>c.name===column); return {x:n.x+(t.x+t.w/2>=n.x+n.w/2?n.w:0),y:n.y+(i>=0?56+i*32:20),horizontal:true};}
  const dx=t.x+t.w/2-n.x-n.w/2,dy=t.y+t.h/2-n.y-n.h/2;
  return Math.abs(dx)/n.w>Math.abs(dy)/n.h ? {x:n.x+(dx>0?n.w:0),y:n.y+n.h/2,horizontal:true} : {x:n.x+n.w/2,y:n.y+(dy>0?n.h:0),horizontal:false};
}
export function diagramMarkup(b, mode, selected = new Set(), source = null, clean = false) {
  const defs='<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1L9 5 1 9" fill="none" stroke="#64748b" stroke-width="1.5"/></marker></defs>';
  const nodes=[...b.nodes].sort((a,c)=>(a.type==='pool'?-1:0)-(c.type==='pool'?-1:0));
  const nodeSVG=n=>`<g class="node${selected.has(n.id)?' selected':''}" data-id="${escapeHTML(n.id)}" transform="translate(${n.x},${n.y})" ${clean?'':`tabindex="0" role="button" aria-label="${escapeHTML(n.label)}, Element"`}><title>${escapeHTML(n.label)}${n.columns?'\n'+n.columns.map(c=>`${c.key} ${c.name}: ${c.type}`).join('\n'):''}</title>${shape(n)}${nodeText(n)}${!clean&&(selected.has(n.id)||source===n.id)?`<rect class="selection-frame" x="-6" y="-6" width="${n.w+12}" height="${n.h+12}" rx="10" fill="none" stroke="#315acb" stroke-width="2" stroke-dasharray="5 3"/>`:''}${!clean&&n.type!=='pool'?`<circle class="port" data-port="true" cx="${n.w}" cy="${n.h/2}" r="6" fill="white" stroke="#315acb" stroke-width="2"/>`:''}</g>`;
  const edges=b.edges.map(e=>{const a=b.nodes.find(n=>n.id===e.from),c=b.nodes.find(n=>n.id===e.to);if(!a||!c)return '';const p=anchor(a,c,e.fromColumn),q=anchor(c,a,e.toColumn);let d;
    if(Math.abs(p.y-q.y)<2)d=`M${p.x} ${p.y}H${q.x}`;
    else if(Math.abs(p.x-q.x)<2)d=`M${p.x} ${p.y}V${q.y}`;
    else if(p.horizontal&&!q.horizontal)d=`M${p.x} ${p.y}H${q.x}V${q.y}`;
    else if(!p.horizontal&&q.horizontal)d=`M${p.x} ${p.y}V${q.y}H${q.x}`;
    else if(!p.horizontal&&!q.horizontal){const mid=(p.y+q.y)/2;d=`M${p.x} ${p.y}V${mid}H${q.x}V${q.y}`;}
    else if(mode==='ERD'&&(p.x===a.x)===(q.x===c.x)){const bend=p.x===a.x?Math.min(a.x,c.x)-45:Math.max(a.x+a.w,c.x+c.w)+45;d=`M${p.x} ${p.y}H${bend}V${q.y}H${q.x}`;}
    else {const mid=(p.x+q.x)/2;d=`M${p.x} ${p.y}H${mid}V${q.y}H${q.x}`;}
    const mid=(p.x+q.x)/2,labelX=p.horizontal&&!q.horizontal?q.x+8:mid+8,labelY=!p.horizontal&&q.horizontal?q.y-10:(p.y+q.y)/2-10;return `<g class="edge" data-id="${escapeHTML(e.id)}" ${clean?'':`tabindex="0" role="button" aria-label="Verbindung ${escapeHTML(a.label)} nach ${escapeHTML(c.label)}"`}><path d="${d}" fill="none" stroke="${selected.has(e.id)&&!clean?'#315acb':'#64748b'}" stroke-width="${selected.has(e.id)&&!clean?2.5:1.6}" ${['BPMN','EPK'].includes(mode)?'marker-end="url(#arrow)"':''}/>${clean?'':`<path d="${d}" fill="none" stroke="transparent" stroke-width="18"/>`}<g font-size="12" paint-order="stroke" stroke="white" stroke-width="4"><text x="${labelX}" y="${labelY}">${escapeHTML(e.label)}</text>${mode==='ERD'?`<text x="${p.x+(p.x===a.x?-12:12)}" y="${p.y-10}" text-anchor="${p.x===a.x?'end':'start'}">${escapeHTML(e.fromCard||'1')}</text><text x="${q.x+(q.x===c.x?-12:12)}" y="${q.y-10}" text-anchor="${q.x===c.x?'end':'start'}">${escapeHTML(e.toCard||'0..N')}</text>`:''}</g></g>`;
  }).join('');
  return defs+`<g font-family="Segoe UI,Arial,sans-serif" fill="#263650">`+nodes.filter(n=>n.type==='pool').map(nodeSVG).join('')+edges+nodes.filter(n=>n.type!=='pool').map(nodeSVG).join('')+'</g>';
}
export function contentBounds(b) {
  if(!b.nodes.length)return {x:0,y:0,w:900,h:600};
  const extents=b.nodes.map(n=>{const outside=['start','end','intermediate','gateway','parallel'].includes(n.type),lines=linesFor(n.label,outside?26:Math.max(6,Math.floor(n.w/8))),labelWidth=outside?Math.max(...lines.map(l=>l.length))*7:n.w;const textHeight=lines.length*17,top=outside||n.type==='table'||n.type==='pool'?0:Math.min(0,(n.h-textHeight)/2-8),bottom=outside?n.h+25+textHeight:Math.max(n.h,n.h/2+textHeight/2+8);return {x:Math.min(n.x,n.x+n.w/2-labelWidth/2),y:n.y+top,w:Math.max(n.w,labelWidth),h:bottom-top};});
  const x=Math.min(...extents.map(n=>n.x))-50,y=Math.min(...extents.map(n=>n.y))-50;
  // Reserve extra room for long connection labels and routed table edges.
  const labelPad=Math.max(0,...b.edges.map(e=>e.label.length*7));
  return {x:x-labelPad/2,y,w:Math.max(...extents.map(n=>n.x+n.w))-x+100+labelPad,h:Math.max(...extents.map(n=>n.y+n.h))-y+60};
}
export function svgDocument(b,mode,background='#ffffff') {
  const box=contentBounds(b);return `<svg xmlns="${NS}" width="${box.w}" height="${box.h}" viewBox="${box.x} ${box.y} ${box.w} ${box.h}">${background==='transparent'?'':`<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="${background}"/>`}${diagramMarkup(b,mode,new Set(),null,true)}</svg>`;
}
