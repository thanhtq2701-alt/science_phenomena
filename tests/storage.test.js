import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileStorage, upstashStorage, createStorage } from '../server/storage.js';
import { createApp } from '../server/index.js';

test('fileStorage: set/get/del', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sp12-'));
  const s = fileStorage(dir);
  assert.equal(await s.get('x'), null);
  await s.set('x', { a: 1 });
  assert.deepEqual(await s.get('x'), { a: 1 });
  await s.del('x');
  assert.equal(await s.get('x'), null);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('upstashStorage: gửi lệnh Redis qua REST với prefix', async () => {
  const calls = [];
  const fakeFetch = async (url, init) => {
    const cmd = JSON.parse(init.body);
    calls.push(cmd);
    assert.equal(init.headers.Authorization, 'Bearer tok');
    if (cmd[0] === 'GET') return { ok: true, json: async () => ({ result: cmd[1] === 'sp12:k' ? JSON.stringify([1, 2]) : null }) };
    return { ok: true, json: async () => ({ result: 'OK' }) };
  };
  const s = upstashStorage('https://x.upstash.io', 'tok', fakeFetch);
  await s.set('k', [1, 2]);
  assert.deepEqual(await s.get('k'), [1, 2]);
  assert.equal(await s.get('missing'), null);
  assert.deepEqual(calls[0], ['SET', 'sp12:k', '[1,2]']);
});

test('createStorage chọn Upstash khi có biến môi trường', () => {
  assert.equal(createStorage({ UPSTASH_REDIS_REST_URL: 'https://a/', UPSTASH_REDIS_REST_TOKEN: 't' }, '/tmp').kind, 'upstash');
  assert.equal(createStorage({}, '/tmp').kind, 'file');
});

test('API feedback & view dùng kho được truyền vào', async () => {
  const mem = new Map();
  const storage = { kind: 'mem', get: async (k) => mem.get(k) ?? null, set: async (k, v) => { mem.set(k, v); }, del: async (k) => { mem.delete(k); } };
  const app = createApp({ storage, log: () => {} });
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const base = `http://127.0.0.1:${port}`;
    const r1 = await fetch(base + '/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sim: 'chem-na-water', rating: 5, message: 'Hay' }) });
    assert.equal(r1.status, 200);
    assert.equal(mem.get('feedback').length, 1);
    const r2 = await fetch(base + '/api/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sim: 'chem-na-water' }) });
    assert.equal((await r2.json()).views, 1);
    await app.flush();
    assert.equal(mem.get('stats').total, 1);
    const r3 = await fetch(base + '/api/feedback');
    assert.equal(r3.status, 403);
    const h = await (await fetch(base + '/healthz')).json();
    assert.equal(h.storage, 'mem');
  } finally { server.close(); }
});
