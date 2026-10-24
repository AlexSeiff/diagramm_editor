import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('development server serves the app and rejects non-public files', { timeout: 15000 }, async () => {
  const child = spawn(process.execPath, ['scripts/serve.mjs', '--port', '0'], {
    cwd: new URL('../', import.meta.url), stdio: ['ignore', 'pipe', 'pipe']
  });
  try {
    const origin = await new Promise((resolve, reject) => {
      let output = '';
      child.once('error', reject);
      child.once('exit', code => reject(Error(`Server exited with ${code}`)));
      child.stdout.on('data', chunk => {
        output += chunk;
        const match = output.match(/http:\/\/localhost:(\d+)/);
        if (match) resolve(`http://127.0.0.1:${match[1]}`);
      });
    });
    const page = await fetch(origin);
    assert.equal(page.status, 200);
    assert.ok((await page.text()).includes('Model Studio'));
    const js = await fetch(origin + '/app.js');
    assert.equal(js.status, 200);
    assert.match(js.headers.get('content-type'), /javascript/);
    assert.equal((await fetch(origin + '/package.json')).status, 404);
    assert.equal((await fetch(origin + '/.git/config')).status, 404);
    assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  } finally {
    if (child.exitCode === null) {
      const stopped = once(child, 'exit');
      child.kill();
      await stopped;
    }
  }
});
