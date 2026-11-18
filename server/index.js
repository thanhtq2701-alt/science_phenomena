import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createStorage } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WEB = path.join(ROOT, 'web');
const DATA = path.join(ROOT, 'data');

const MAX_FEEDBACK = 500;

/** Tạo app Express. options.storage cho phép test truyền kho giả. */
export function createApp(options = {}) {
  const storage = options.storage || createStorage(process.env, path.join(ROOT, 'var'));
  const log = options.log || ((m) => console.log(m));
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '200kb' }));

  // Bộ nhớ đệm: thống kê lượt xem gom lại, ghi xuống kho mỗi 30 s để tiết kiệm lệnh Upstash
  let stats = null, statsDirty = false;
  const loadStats = async () => { if (stats) return stats; stats = (await storage.get('stats').catch(() => null)) || { views: {}, total: 0 }; return stats; };
  const flushStats = async () => { if (!statsDirty || !stats) return; statsDirty = false; await storage.set('stats', stats).catch((e) => { statsDirty = true; log('Không lưu được stats: ' + e.message); }); };
  const timer = setInterval(flushStats, 30000);
  if (timer.unref) timer.unref();

  app.use('/data', express.static(DATA, { maxAge: '1h' }));
  app.use(express.static(WEB, { maxAge: '1h', extensions: ['html'] }));

  app.get('/api/catalog', (_req, res) => {
    const file = path.join(DATA, 'catalog.json');
    if (fs.existsSync(file)) return res.sendFile(file);
    res.status(404).json({ error: 'catalog.json chưa được tạo. Chạy: npm run catalog' });
  });

  const health = (_req, res) => res.json({ ok: true, storage: storage.kind, uptime: process.uptime(), ts: Date.now() });
  app.get('/api/health', health);
  app.get('/healthz', health); // Render health check

  // Ghi nhận lượt mở một bài (ẩn danh)
  app.post('/api/view', async (req, res) => {
    const { sim } = req.body || {};
    if (typeof sim !== 'string' || !/^[a-z0-9-]{3,64}$/.test(sim)) return res.status(400).json({ error: 'sim không hợp lệ' });
    const s = await loadStats();
    s.views[sim] = (s.views[sim] || 0) + 1; s.total++; statsDirty = true;
    res.json({ ok: true, views: s.views[sim] });
  });

  app.get('/api/stats', async (_req, res) => { res.json(await loadStats()); });

  app.post('/api/feedback', async (req, res) => {
    const { sim, rating, message } = req.body || {};
    if (typeof sim !== 'string' || typeof message !== 'string' || !message.trim() || message.length > 2000) {
      return res.status(400).json({ error: 'Thiếu dữ liệu hoặc nội dung quá dài' });
    }
    try {
      const list = (await storage.get('feedback')) || [];
      list.push({ ts: new Date().toISOString(), sim: sim.slice(0, 64), rating: Number(rating) || null, message: message.trim() });
      while (list.length > MAX_FEEDBACK) list.shift();
      await storage.set('feedback', list);
      res.json({ ok: true, count: list.length });
    } catch (e) {
      log('Không ghi được phản hồi: ' + e.message);
      res.status(500).json({ error: 'Không ghi được phản hồi' });
    }
  });

  // Xem phản hồi: cần ADMIN_KEY (đặt trên Render) → /api/feedback?key=...
  app.get('/api/feedback', async (req, res) => {
    const key = process.env.ADMIN_KEY;
    if (!key || req.query.key !== key) return res.status(403).json({ error: 'Cần ADMIN_KEY' });
    res.json((await storage.get('feedback')) || []);
  });

  app.get('*', (_req, res) => res.sendFile(path.join(WEB, 'index.html')));

  app.flush = flushStats;
  app.storageKind = storage.kind;
  return app;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const PORT = process.env.PORT || 3000;
  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`Science Phenomena 12 đang chạy tại http://localhost:${PORT} (kho dữ liệu: ${app.storageKind})`);
  });
  const shutdown = async () => { await app.flush(); server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 3000).unref(); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
