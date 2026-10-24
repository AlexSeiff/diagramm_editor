// Optional real-browser regression suite. Install Playwright separately or set PLAYWRIGHT_MODULE.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const base=process.env.TEST_URL||'http://127.0.0.1:5173';
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
  const errors=[];
  const context=await browser.newContext({viewport:{width:1366,height:768},acceptDownloads:true});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const readState=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('model-studio-v2')));
  const saveState=async()=>{await page.waitForTimeout(450);return readState();};
  const download=async action=>{const wait=page.waitForEvent('download');await action();const d=await wait;const stream=await d.createReadStream();const chunks=[];for await(const c of stream)chunks.push(c);return {name:d.suggestedFilename(),bytes:Buffer.concat(chunks)};};
  try{
    await page.goto(base);await page.locator('#startDialog').waitFor({state:'visible'});
    await page.locator('#startTemplate').click();assert.equal(await page.locator('#canvas .node').count(),7);
    await page.locator('#check').click();assert.match(await page.locator('#issues').innerText(),/Keine grundlegenden/);await page.locator('#issuesDialog [data-close]').click();
    await page.locator('#canvas .node').nth(1).click();
    await page.locator('#label').fill('Geprüfte Bestellung');await page.locator('#label').blur();
    let p=await saveState();assert.equal(p.boards.BPMN.nodes[1].label,'Geprüfte Bestellung');
    // Selecting an element must not create a new undo entry.
    await page.locator('#canvas .node').nth(2).click();await page.locator('#undo').click();
    assert.equal((await saveState()).boards.BPMN.nodes[1].label,'Bestellung prüfen');await page.locator('#redo').click();
    // Pointer movement must make one reversible model change.
    await page.locator('#closeInspector').click();await page.locator('#fit').click();
    const before=await saveState(),node=page.locator('#canvas .node').nth(1),box=await node.boundingBox();
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+60,box.y+box.height/2+30,{steps:5});await page.mouse.up();
    assert.notEqual((await saveState()).boards.BPMN.nodes[1].x,before.boards.BPMN.nodes[1].x);await page.locator('#undo').click();assert.equal((await saveState()).boards.BPMN.nodes[1].x,before.boards.BPMN.nodes[1].x);
    // Table row editing, persistent validation, relationships, independent duplication.
    await page.locator('[data-mode="ERD"]').click();await page.locator('#emptyTemplate').click();await page.locator('#canvas .node').first().click();
    await page.getByLabel('Spalte 1: Name',{exact:true}).fill('kunden_id');await saveState();assert.equal((await readState()).boards.ERD.edges[0].fromColumn,'kunden_id');
    await page.getByLabel('Spalte 2: Name',{exact:true}).fill('kunden_id');assert.equal(await page.locator('#columnError').isVisible(),true);assert.equal((await readState()).boards.ERD.nodes[0].columns[1].name,'name');await page.locator('#closeInspector').click();await page.locator('#toggleInspector').click();assert.equal(await page.getByLabel('Spalte 2: Name',{exact:true}).inputValue(),'kunden_id');assert.equal(await page.locator('#columnError').isVisible(),true);
    await page.getByLabel('Spalte 2: Name',{exact:true}).fill('voller_name');assert.equal(await page.locator('#columnError').isVisible(),false);
    await page.locator('#addColumn').click();assert.equal(await page.locator('.column-row').count(),3);
    await page.locator('#duplicate').click();await page.getByLabel('Spalte 1: Name',{exact:true}).fill('kopie_id');p=await saveState();assert.equal(p.boards.ERD.nodes[0].columns[0].name,'kunden_id');assert.equal(p.boards.ERD.nodes[2].columns[0].name,'kopie_id');
    await page.locator('#closeInspector').click();await page.locator('#fit').click();
    // Keyboard selection, movement, and editing.
    const keyboardNode=page.locator('#canvas .node').first();await keyboardNode.focus();const x=(await saveState()).boards.ERD.nodes[0].x;await page.keyboard.press('ArrowRight');assert.equal((await saveState()).boards.ERD.nodes[0].x,x+10);await page.keyboard.press('Enter');assert.equal(await page.locator('#label').evaluate(el=>el===document.activeElement),true);
    await page.locator('#closeInspector').click();
    // Center anchored zoom and fit.
    const center=()=>page.locator('#canvas').evaluate(el=>{const b=el.viewBox.baseVal;return {x:b.x+b.width/2,y:b.y+b.height/2};});
    await page.waitForTimeout(100);const c1=await center();await page.locator('#plus').click();const c2=await center();assert.ok(Math.abs(c1.x-c2.x)<.01&&Math.abs(c1.y-c2.y)<.01,JSON.stringify({c1,c2}));await page.locator('#fit').click();
    // Real SVG, PNG, JPEG, PDF downloads, and editable project backup.
    const json=await download(()=>page.locator('#save').click());assert.equal(JSON.parse(json.bytes).version,2);
    await page.locator('#export').click();
    for(const format of ['svg','png','jpeg','pdf']){await page.locator('#format').selectOption(format);if(format==='pdf')await page.locator('#paper').selectOption('landscape');const d=await download(()=>page.locator('#download').click());assert.ok(d.bytes.length>200);assert.ok(d.name.endsWith('.'+format));if(format==='pdf'){assert.match(d.bytes.toString('latin1'),/^%PDF-1.4/);assert.match(d.bytes.toString('latin1'),/MediaBox \[0 0 841.89 595.28\]/);}if(format==='png')assert.equal(d.bytes.subarray(1,4).toString(),'PNG');if(format==='svg')assert.match(d.bytes.toString(),/kunden_id/);}
    await page.locator('#exportDialog [data-close]').click();
    // Bad import leaves the model intact; valid import requires an explicit replace decision.
    const stable=await saveState();await page.locator('#file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"title":"broken"}')});assert.deepEqual(await readState(),stable);
    const imported=structuredClone(stable);imported.title='Importierter Stand';await page.locator('#file').setInputFiles({name:'project.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});await page.locator('#confirmCancel').click();assert.equal((await readState()).title,stable.title);
    await page.locator('#file').setInputFiles({name:'project.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});await page.locator('#confirmProceed').click();assert.equal((await saveState()).title,'Importierter Stand');await page.reload();assert.equal(await page.locator('#title').inputValue(),'Importierter Stand');
    // Recovery UI is populated by previous sessions and exchanges.
    await page.locator('#history').click();assert.ok(await page.locator('.snapshot').count()>0);await page.locator('.snapshot').last().click();await page.locator('#confirmProceed').click();assert.notEqual((await saveState()).title,'Importierter Stand');await page.locator('#undo').click();assert.equal((await saveState()).title,'Importierter Stand');
    await page.locator('[data-mode="BPMN"]').click();await page.locator('#closePalette').click();await page.locator('#fit').click();
    if(process.env.SCREENSHOT_DIR){await fs.mkdir(process.env.SCREENSHOT_DIR,{recursive:true});await page.locator('#togglePalette').click();await page.locator('#fit').click();await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'desktop.png')});}
    for(const width of [1024,768,683]){await page.setViewportSize({width,height:600});await page.waitForTimeout(60);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow at '+width);}
    await page.setViewportSize({width:390,height:844});await page.reload();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.locator('#togglePalette').click();await page.locator('[data-type="task"]').click();assert.equal(await page.locator('#toolbox').isVisible(),false);
    await page.locator('#toggleInspector').click();assert.equal(await page.locator('#inspector').isVisible(),true);await page.locator('#closeInspector').click();assert.equal(await page.locator('#inspector').isVisible(),false);
    if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'mobile.png')});
    // New projects: real drag/drop, two-click connections, multiselect, keyboard connection.
    const fresh=await browser.newContext({viewport:{width:1366,height:768}}),drawing=await fresh.newPage();drawing.on('pageerror',e=>errors.push(e.message));await drawing.goto(base);await drawing.locator('#startBlank').click();
    const transfer=await drawing.evaluateHandle(()=>{const d=new DataTransfer();d.setData('application/model-studio','task');return d;});await drawing.locator('#canvas').dispatchEvent('drop',{dataTransfer:transfer,clientX:600,clientY:400});await drawing.locator('[data-type="task"]').click();await drawing.locator('#closeInspector').click();await drawing.locator('#fit').click();
    await drawing.locator('#connect').click();await drawing.locator('#canvas .node').nth(0).click();await drawing.locator('#canvas .node').nth(1).click();assert.equal(await drawing.locator('#canvas .edge').count(),1);await drawing.locator('#closeInspector').click();
    await drawing.locator('#canvas .node').nth(0).focus();await drawing.keyboard.press('c');await drawing.keyboard.press('Enter');await drawing.locator('#canvas .node').nth(1).focus();await drawing.keyboard.press('Enter');assert.equal(await drawing.locator('#canvas .edge').count(),1);await drawing.keyboard.press('Escape');
    await drawing.locator('#canvas .node').first().click();await drawing.locator('#canvas .node').nth(1).click({modifiers:['Shift']});assert.match(await drawing.locator('#inspectorTitle').innerText(),/2 ausgewählt/);await drawing.getByRole('button',{name:'Oben ausrichten',exact:true}).click();await drawing.waitForTimeout(400);const aligned=await drawing.evaluate(()=>JSON.parse(localStorage.getItem('model-studio-v2')).boards.BPMN.nodes);assert.equal(aligned[0].y,aligned[1].y);await fresh.close();
    // Storage failure is visible and JSON backup remains available.
    const failed=await browser.newContext(),failure=await failed.newPage();await failure.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError');};});await failure.goto(base);await failure.locator('#startTemplate').click();await failure.waitForTimeout(450);assert.match(await failure.locator('#saveStatus').innerText(),/Nicht gespeichert/);await failed.close();
    // The portable file must work without a server or external module requests.
    const offline=await context.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto(pathToFileURL(path.resolve('dist/Model Studio.html')).href);await offline.locator('#startBlank').click();await offline.locator('[data-type="task"]').click();assert.equal(await offline.locator('#canvas .node').count(),1);await offline.close();
    assert.deepEqual(errors,[]);console.log('Browser checks passed: creation, selection/undo, dragging, table editing, validation, duplication, keyboard, zoom, four exports, import/cancel/reload, recovery, mobile, offline build.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
