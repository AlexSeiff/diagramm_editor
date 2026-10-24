import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../scripts/build.mjs';

test('build creates an offline standalone app with the exact source assets', async () => {
  const destination = await mkdtemp(join(tmpdir(), 'diagramm-editor-'));
  try {
    await build(destination);
    const html = await readFile(join(destination, 'Model Studio.html'), 'utf8');
    const js = await readFile(new URL('../app.js', import.meta.url), 'utf8');
    const css = await readFile(new URL('../style.css', import.meta.url), 'utf8');
    assert.ok(html.includes('function validateProject'));
    assert.ok(html.includes('function exportAction'));
    assert.ok(!/^import /m.test(html));
    assert.ok(!/^export /m.test(html));
    assert.ok(html.includes(css));
    assert.ok(!html.includes('src="app.js"'));
    assert.ok(!html.includes('<link rel="stylesheet" href="style.css">'));
    assert.equal(await readFile(join(destination, 'app.js'), 'utf8'), js);
    assert.equal(await readFile(join(destination, 'src/model.js'), 'utf8'), await readFile(new URL('../src/model.js', import.meta.url), 'utf8'));
  } finally {
    await rm(destination, { recursive: true, force: true });
  }
});
