// Pure model operations: no DOM or browser storage dependencies.
export const MODES = {
  BPMN: { name: 'BPMN', description: 'Geschäftsprozesse', types: [['start','Startereignis'],['task','Aufgabe'],['gateway','Exklusive Entscheidung'],['parallel','Parallele Verzweigung'],['intermediate','Zwischenereignis'],['end','Endereignis'],['pool','Pool / Bereich']] },
  EPK: { name: 'EPK', description: 'Ereignisgesteuerte Prozesse', types: [['event','Ereignis'],['function','Funktion'],['xor','XOR-Verknüpfung'],['and','UND-Verknüpfung'],['or','ODER-Verknüpfung'],['org','Organisation'],['data','Informationsobjekt']] },
  ERM: { name: 'ER-Modell', description: 'Entitäten und Beziehungen', types: [['entity','Entität'],['relationship','Beziehung'],['attribute','Attribut'],['key','Schlüsselattribut'],['weak','Schwache Entität']] },
  ERD: { name: 'Tabellen', description: 'Datenbankdiagramm', types: [['table','Tabelle']] }
};
export const CARDS = ['1','0..1','1..N','0..N'];
export const uid = () => crypto.randomUUID();
export const clone = value => structuredClone(value);
export function emptyProject() {
  return { version: 2, title: 'Mein Projekt', boards: Object.fromEntries(Object.keys(MODES).map(m => [m, { name: MODES[m].description, nodes: [], edges: [] }])) };
}
export function makeNode(type, x = 100, y = 100) {
  const label = Object.values(MODES).flatMap(m => m.types).find(t => t[0] === type)?.[1] || 'Element';
  const round = ['start','end','intermediate','xor','and','or'].includes(type);
  const diamond = ['gateway','parallel'].includes(type);
  const n = { id: uid(), type, label, x, y, w: round ? 56 : diamond ? 76 : type === 'pool' ? 600 : 170, h: round ? 56 : diamond ? 76 : type === 'pool' ? 280 : 80, color: ['start','end','event'].includes(type) ? '#e6f4ec' : '#eef2ff' };
  if (type === 'table') Object.assign(n, { label: 'Neue Tabelle', w: 290, columns: [{ key: 'PK', name: 'id', type: 'INT' }, { key: '', name: 'name', type: 'VARCHAR(255)' }] });
  normalizeSize(n);
  return n;
}
export function normalizeSize(n) { if (n.type === 'table') { n.h = 44 + n.columns.length * 32; n.w = Math.max(280,n.w,Math.min(3000,n.label.length*8+32),...n.columns.map(c=>80+c.name.length*7+c.type.length*6)); } }
export function validateProject(input) {
  if (!input || typeof input !== 'object' || typeof input.title !== 'string' || input.title.length > 200 || !input.boards || (input.version !== undefined && ![1,2].includes(input.version))) throw Error('Unbekanntes Projektformat.');
  const out = emptyProject(); out.title = input.title;
  for (const [mode, config] of Object.entries(MODES)) {
    const b = input.boards[mode] ?? (mode === 'ERD' ? { nodes: [], edges: [] } : null);
    if (!b || !Array.isArray(b.nodes) || !Array.isArray(b.edges) || b.nodes.length > 2000 || b.edges.length > 5000) throw Error('Ungültige Diagrammdaten.');
    const ids = new Set();
    const id = value => { if (typeof value !== 'string' || !value || value.length > 150 || ids.has(value)) throw Error('Element-IDs fehlen oder sind doppelt.'); ids.add(value); return value; };
    const text = (value, max = 2000) => { if (typeof value !== 'string' || value.length > max) throw Error('Ungültiger Text.'); return value; };
    const nodes = b.nodes.map(n => {
      if (!n || !config.types.some(t => t[0] === n.type) || !['x','y','w','h'].every(k => Number.isFinite(n[k]) && Math.abs(n[k]) <= 100000) || n.w < 30 || n.h < 30 || n.w > 3000 || n.h > 3000 || !/^#[a-f0-9]{6}$/i.test(n.color)) throw Error('Ungültige Form oder Größe.');
      const result = { id: id(n.id), type: n.type, label: text(n.label), x: n.x, y: n.y, w: n.w, h: n.h, color: n.color };
      if (n.type === 'table') {
        if (!Array.isArray(n.columns) || n.columns.length > 40) throw Error('Eine Tabelle darf höchstens 40 Spalten enthalten.');
        const names = new Set();
        result.columns = n.columns.map(c => {
          if (!c || !['','PK','FK','PK FK'].includes(c.key) || typeof c.name !== 'string' || !c.name.trim() || names.has(c.name) || typeof c.type !== 'string' || !c.type.trim()) throw Error('Tabellenspalten sind ungültig oder doppelt.');
          names.add(c.name); return { key: c.key, name: text(c.name, 100), type: text(c.type, 100) };
        });
        normalizeSize(result);
      }
      return result;
    });
    for (const n of nodes) { const original=b.nodes.find(p=>p.id===n.id); if(n.type!=='pool'&&nodes.some(p=>p.id===original.parentId&&p.type==='pool'))n.parentId=original.parentId; }
    const edges = b.edges.map(e => {
      if (!e || !nodes.some(n => n.id === e.from) || !nodes.some(n => n.id === e.to) || e.from === e.to) throw Error('Eine Verbindung verweist auf ungültige Elemente.');
      const result = { id: id(e.id), from: e.from, to: e.to, label: text(e.label) };
      if (mode === 'ERD') for (const side of ['from','to']) {
        const column = e[side + 'Column'] ?? '', card = e[side + 'Card'] ?? (side === 'from' ? '1' : '0..N');
        if (typeof column !== 'string' || (column && !nodes.find(n => n.id === e[side]).columns.some(c => c.name === column)) || !CARDS.includes(card)) throw Error('Ungültige Tabellenbeziehung.');
        result[side + 'Column'] = column; result[side + 'Card'] = card;
      }
      return result;
    });
    out.boards[mode] = { name: typeof b.name === 'string' ? text(b.name, 200) : config.description, nodes, edges };
  }
  return out;
}
export function connectNodes(b, from, to) {
  if (from === to || b.edges.some(e => e.from === from && e.to === to)) return false;
  if (![from,to].every(id => b.nodes.some(n => n.id === id && n.type !== 'pool'))) return false;
  b.edges.push({ id: uid(), from, to, label: '' }); return true;
}
export function removeSelection(b, ids) {
  b.nodes = b.nodes.filter(n => !ids.has(n.id));
  b.nodes.forEach(n => { if (ids.has(n.parentId)) delete n.parentId; });
  b.edges = b.edges.filter(e => !ids.has(e.id) && !ids.has(e.from) && !ids.has(e.to));
}
export function template(mode) {
  const b = { name: MODES[mode].description, nodes: [], edges: [] };
  const data = mode === 'BPMN' ? [['start','Bestellung erhalten',80,220],['task','Bestellung prüfen',210,208],['gateway','Verfügbar?',450,210],['task','Versand vorbereiten',620,100],['task','Kunden informieren',620,330],['end','Versendet',900,112],['end','Abgeschlossen',900,342]] : mode === 'EPK' ? [['event','Bestellung eingegangen',80,180],['function','Bestand prüfen',310,180],['xor','XOR',550,190],['event','Ware verfügbar',720,80],['event','Ware nicht verfügbar',720,310]] : mode === 'ERM' ? [['entity','Kunde',80,240],['relationship','bestellt',350,240],['entity','Bestellung',650,240],['key','kunden_id',80,70],['attribute','Name',80,430],['key','bestell_id',650,70]] : [['table','Kunden',120,150],['table','Bestellungen',620,150]];
  b.nodes = data.map(([type,label,x,y]) => ({ ...makeNode(type,x,y), label }));
  if (mode === 'ERD') b.nodes[1].columns = [{ key:'PK', name:'id', type:'INT' },{ key:'FK', name:'kunden_id', type:'INT' },{ key:'', name:'datum', type:'DATE' }];
  b.nodes.forEach(normalizeSize);
  const pairs = mode === 'BPMN' ? [[0,1],[1,2],[2,3,'Ja'],[2,4,'Nein'],[3,5],[4,6]] : mode === 'EPK' ? [[0,1],[1,2],[2,3],[2,4]] : mode === 'ERM' ? [[0,1,'1'],[1,2,'N'],[0,3],[0,4],[2,5]] : [[0,1,'hat']];
  b.edges = pairs.map(([a,c,label = '']) => ({ id:uid(), from:b.nodes[a].id, to:b.nodes[c].id, label, ...(mode === 'ERD' ? {fromColumn:'id',toColumn:'kunden_id',fromCard:'1',toCard:'0..N'} : {}) }));
  return b;
}
export function modelWarnings(b, mode) {
  const issues = [];
  for (const n of b.nodes.filter(n => n.type !== 'pool')) {
    const incoming = b.edges.filter(e => e.to === n.id), outgoing = b.edges.filter(e => e.from === n.id);
    const add = message => issues.push({ id:n.id, message:`${n.label || 'Ohne Namen'}: ${message}` });
    if (!incoming.length && !outgoing.length) add('noch nicht verbunden.');
    if (mode === 'BPMN') {
      if (n.type === 'start' && incoming.length) add('Startereignisse sollten keine eingehende Sequenz haben.');
      if (n.type === 'end' && outgoing.length) add('Endereignisse sollten keine ausgehende Sequenz haben.');
      if (n.type !== 'start' && !incoming.length) add('eingehender Prozesspfad fehlt.');
      if (n.type !== 'end' && !outgoing.length) add('ausgehender Prozesspfad fehlt.');
      if (['gateway','parallel'].includes(n.type) && incoming.length < 2 && outgoing.length < 2) add('eine Verzweigung oder Zusammenführung benötigt mehrere Pfade.');
    }
    if (mode === 'ERD' && !n.columns.some(c => c.key.includes('PK'))) add('Primärschlüssel fehlt.');
    if (mode === 'EPK' && n.type === 'event' && outgoing.some(e => b.nodes.find(t => t.id === e.to)?.type === 'event')) add('auf ein Ereignis sollte eine Funktion oder Verknüpfung folgen.');
  }
  if (mode === 'BPMN' && b.nodes.length && !b.nodes.some(n => n.type === 'start')) issues.push({message:'Ein Startereignis fehlt.'});
  if (mode === 'BPMN' && b.nodes.length && !b.nodes.some(n => n.type === 'end')) issues.push({message:'Ein Endereignis fehlt.'});
  return issues;
}
export class Timeline {
  past = []; future = [];
  record(before, after) { if (JSON.stringify(before) === JSON.stringify(after)) return false; this.past.push(clone(before)); if(this.past.length > 80)this.past.shift(); this.future = []; return true; }
  undo(current) { if (!this.past.length) return current; this.future.push(clone(current)); return this.past.pop(); }
  redo(current) { if (!this.future.length) return current; this.past.push(clone(current)); return this.future.pop(); }
}
