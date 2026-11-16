import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function startServer(port) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [path.join(ROOT, 'server', 'index.js')], { env: { ...process.env, PORT: String(port) } });
    let out = '';
    proc.stdout.on('data', (d) => { out += d; if (out.includes('đang chạy')) resolve(proc); });
    proc.stderr.on('data', (d) => { out += d; });
    proc.on('exit', (code) => reject(new Error('server thoát sớm: ' + code + '\n' + out)));
    setTimeout(() => reject(new Error('server không khởi động: ' + out)), 8000);
  });
}

test('server phục vụ trang chủ, dữ liệu, API', async () => {
  const port = 3900 + Math.floor(Math.random() * 100);
  const proc = await startServer(port);
  try {
    const base = `http://127.0.0.1:${port}`;
    const home = await fetch(base + '/');
    assert.equal(home.status, 200);
    assert.match(await home.text(), /Khoa học 12/);
    const cur = await fetch(base + '/data/curriculum.json');
    assert.equal(cur.status, 200);
    const j = await cur.json();
    assert.equal(j.subjects.length, 3);
    const health = await (await fetch(base + '/api/health')).json();
    assert.equal(health.ok, true);
    const js = await fetch(base + '/js/core/engine.js');
    assert.equal(js.status, 200);
    assert.match(js.headers.get('content-type'), /javascript/);
    const bad = await fetch(base + '/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(bad.status, 400);
  } finally {
    proc.kill();
  }
});
