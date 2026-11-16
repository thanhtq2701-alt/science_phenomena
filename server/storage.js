/**
 * Kho key-value: Upstash Redis (REST, không cần package) khi có 2 biến môi trường
 * UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN; ngược lại ghi file JSON trong DATA_DIR (mặc định var/).
 * Cùng cách làm với repo Hackathon (server/storage.js) để deploy Render + Upstash giống nhau.
 */
import fs from 'node:fs';
import path from 'node:path';

export function fileStorage(dir) {
  const fileFor = (key) => path.join(dir, key.replace(/[^a-z0-9_-]/gi, '_') + '.json');
  return {
    kind: 'file',
    async get(key) {
      try { return JSON.parse(await fs.promises.readFile(fileFor(key), 'utf8')); }
      catch (e) { if (e.code === 'ENOENT') return null; throw e; }
    },
    async set(key, value) {
      await fs.promises.mkdir(dir, { recursive: true });
      const file = fileFor(key);
      await fs.promises.writeFile(file + '.tmp', JSON.stringify(value));
      await fs.promises.rename(file + '.tmp', file);
    },
    async del(key) {
      try { await fs.promises.unlink(fileFor(key)); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    }
  };
}

export function upstashStorage(url, token, fetchImpl) {
  const doFetch = fetchImpl || fetch;
  const prefix = 'sp12:';
  async function call(command) {
    const res = await doFetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command) });
    let data = {};
    try { data = await res.json(); } catch { /* body rỗng */ }
    if (!res.ok || data.error) throw new Error(`Upstash ${command[0]} failed: ${data.error || res.status}`);
    return data.result;
  }
  return {
    kind: 'upstash',
    async get(key) { const raw = await call(['GET', prefix + key]); return raw == null ? null : JSON.parse(raw); },
    async set(key, value) { await call(['SET', prefix + key, JSON.stringify(value)]); },
    async del(key) { await call(['DEL', prefix + key]); }
  };
}

export function createStorage(env, defaultDir, fetchImpl) {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return upstashStorage(env.UPSTASH_REDIS_REST_URL.replace(/\/+$/, ''), env.UPSTASH_REDIS_REST_TOKEN, fetchImpl);
  }
  return fileStorage(env.DATA_DIR || defaultDir);
}
