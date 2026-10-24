import { svgDocument, contentBounds } from './render.js';
export function downloadBlob(blob, name, ext) {
  const a=document.createElement('a'),url=URL.createObjectURL(blob);
  a.href=url;a.download=(name||'Diagramm').replace(/[<>:"/\\|?*\x00-\x1f]/g,'-')+'.'+ext;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
export async function rasterize(b,mode,scale,background) {
  const bounds=contentBounds(b),w=Math.ceil(bounds.w*scale),h=Math.ceil(bounds.h*scale);
  if(w>12000||h>12000||w*h>40000000)throw Error('Das Diagramm ist zu groß. Wähle eine kleinere Auflösung oder exportiere als SVG.');
  const url=URL.createObjectURL(new Blob([svgDocument(b,mode,background)],{type:'image/svg+xml'}));
  try {
    const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Das Bild konnte nicht erstellt werden.'));img.src=url;});
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);return canvas;
  } finally {URL.revokeObjectURL(url);}
}
export function canvasBlob(canvas,type='image/png') {return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Bildexport fehlgeschlagen.')),type,.95));}
export function pdfBlob(canvas,paper='diagram') {
  const jpg=Uint8Array.from(atob(canvas.toDataURL('image/jpeg',.95).split(',')[1]),c=>c.charCodeAt(0));
  const w=paper==='portrait'?595.28:paper==='landscape'?841.89:Math.min(14400,canvas.width*.5),h=paper==='portrait'?841.89:paper==='landscape'?595.28:Math.min(14400,canvas.height*.5);
  const margin=paper==='diagram'?0:24,ratio=Math.min((w-margin*2)/canvas.width,(h-margin*2)/canvas.height),iw=canvas.width*ratio,ih=canvas.height*ratio;
  const chunks=[],offsets=[0],encoder=new TextEncoder();let length=0;
  const add=value=>{const a=typeof value==='string'?encoder.encode(value):value;chunks.push(a);length+=a.length;};
  const obj=(id,s)=>{offsets[id]=length;add(`${id} 0 obj\n${s}\nendobj\n`);};
  add('%PDF-1.4\n');obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');obj(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4]=length;add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);add(jpg);add('\nendstream\nendobj\n');
  const content=`q ${iw} 0 0 ${ih} ${(w-iw)/2} ${(h-ih)/2} cm /Im0 Do Q`;obj(5,`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  const xref=length;add('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)add(String(offsets[i]).padStart(10,'0')+' 00000 n \n');add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks,{type:'application/pdf'});
}
