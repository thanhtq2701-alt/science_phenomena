/**
 * Đóng gói bản tĩnh (không cần server) vào dist/: web/ + data/.
 * Dùng cho Render Static Site hoặc GitHub Pages. Form góp ý tự ẩn vì không có /api.
 * Chạy: npm run build
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'web'), DIST, { recursive: true });
fs.cpSync(path.join(ROOT, 'data'), path.join(DIST, 'data'), { recursive: true });
const count = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0);
console.log(`Đã tạo dist/ với ${count(DIST)} file.`);
