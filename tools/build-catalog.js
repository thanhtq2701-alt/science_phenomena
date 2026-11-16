/**
 * Sinh data/catalog.json từ các module mô phỏng (chạy bằng Node, không cần trình duyệt).
 * Dùng: npm run catalog
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SIM_PATHS } from '../web/js/core/registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SIMS = path.join(ROOT, 'web', 'js', 'sims');

export async function loadSims() {
  const sims = [];
  for (const rel of SIM_PATHS) {
    const mod = await import(pathToFileURL(path.join(SIMS, rel)).href);
    const sim = mod.default;
    sims.push({ ...sim, path: rel });
  }
  return sims;
}

export function toCatalog(sims, curriculum) {
  return {
    generatedAt: new Date().toISOString(),
    count: sims.length,
    subjects: curriculum.subjects.map((s) => ({
      id: s.id, name: s.name, icon: s.icon, color: s.color,
      chapters: s.chapters.map((c) => ({
        id: c.id, title: c.title, order: c.order,
        sims: sims.filter((x) => x.subject === s.id && x.chapter === c.id).map((x) => ({
          id: x.id, title: x.title, summary: x.summary || '', equation: x.equation || null, keywords: x.keywords || [], path: x.path, params: (x.params || []).map((p) => p.key)
        }))
      }))
    }))
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const curriculum = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'curriculum.json'), 'utf8'));
  const sims = await loadSims();
  const catalog = toCatalog(sims, curriculum);
  fs.writeFileSync(path.join(ROOT, 'data', 'catalog.json'), JSON.stringify(catalog, null, 2));
  console.log(`Đã ghi data/catalog.json với ${sims.length} mô phỏng.`);
  for (const s of catalog.subjects) console.log(`  ${s.icon} ${s.name}: ${s.chapters.reduce((a, c) => a + c.sims.length, 0)} bài`);
}
