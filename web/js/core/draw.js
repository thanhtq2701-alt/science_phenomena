/** Thư viện vẽ dùng chung: cốc, ống nghiệm, mũi tên, nhãn, phân tử, lưới đồ thị... */
import { TAU, clamp } from './engine.js';

export const COLORS = {
  bg: '#0b1020', panel: '#121a2e', grid: '#1e2a45', text: '#e5e7eb', muted: '#94a3b8',
  chem: '#f97316', physics: '#38bdf8', bio: '#4ade80', warn: '#fbbf24', danger: '#ef4444',
  glass: 'rgba(148,163,184,0.45)', glassFill: 'rgba(148,163,184,0.08)'
};

export function text(g, str, x, y, { size = 13, color = COLORS.text, align = 'left', weight = '500', baseline = 'alphabetic', font = 'Inter, system-ui, sans-serif' } = {}) {
  g.font = `${weight} ${size}px ${font}`;
  g.fillStyle = color;
  g.textAlign = align;
  g.textBaseline = baseline;
  g.fillText(str, x, y);
}

export function label(g, str, x, y, opt = {}) {
  const size = opt.size || 12;
  g.font = `600 ${size}px Inter, system-ui, sans-serif`;
  const w = g.measureText(str).width + 14;
  const h = size + 10;
  const align = opt.align || 'center';
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  g.fillStyle = opt.bg || 'rgba(15,23,42,0.85)';
  roundRect(g, x0, y - h / 2, w, h, 6);
  g.fill();
  if (opt.border) { g.strokeStyle = opt.border; g.lineWidth = 1; g.stroke(); }
  text(g, str, x0 + w / 2, y, { size, color: opt.color || COLORS.text, align: 'center', baseline: 'middle', weight: '600' });
}

export function roundRect(g, x, y, w, h, r = 6) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function circle(g, x, y, r, fill, stroke, width = 1.5) {
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = width; g.stroke(); }
}

export function line(g, x1, y1, x2, y2, color = COLORS.text, width = 1.5, dash) {
  g.beginPath();
  if (dash) g.setLineDash(dash);
  g.moveTo(x1, y1); g.lineTo(x2, y2);
  g.strokeStyle = color; g.lineWidth = width; g.stroke();
  if (dash) g.setLineDash([]);
}

export function arrow(g, x1, y1, x2, y2, color = COLORS.text, width = 2, head = 9) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  line(g, x1, y1, x2, y2, color, width);
  g.beginPath();
  g.moveTo(x2, y2);
  g.lineTo(x2 - head * Math.cos(a - 0.4), y2 - head * Math.sin(a - 0.4));
  g.lineTo(x2 - head * Math.cos(a + 0.4), y2 - head * Math.sin(a + 0.4));
  g.closePath();
  g.fillStyle = color; g.fill();
}

/** Cốc thủy tinh có dung dịch. level ∈ [0,1] */
export function beaker(g, x, y, w, h, level, liquid, opt = {}) {
  const r = 8;
  const lh = clamp(level, 0, 1) * (h - 10);
  if (lh > 0) {
    g.save();
    g.beginPath();
    g.moveTo(x, y); g.lineTo(x, y + h - r); g.arcTo(x, y + h, x + r, y + h, r);
    g.lineTo(x + w - r, y + h); g.arcTo(x + w, y + h, x + w, y + h - r, r); g.lineTo(x + w, y); g.closePath();
    g.clip();
    g.fillStyle = liquid;
    g.fillRect(x, y + h - lh, w, lh);
    if (opt.precipitate) {
      g.fillStyle = opt.precipitate;
      g.fillRect(x, y + h - (opt.precipHeight || 8), w, opt.precipHeight || 8);
    }
    if (opt.surface !== false) {
      g.fillStyle = 'rgba(255,255,255,0.15)';
      g.fillRect(x, y + h - lh, w, 2);
    }
    g.restore();
  }
  g.beginPath();
  g.moveTo(x - 4, y); g.lineTo(x, y); g.lineTo(x, y + h - r); g.arcTo(x, y + h, x + r, y + h, r);
  g.lineTo(x + w - r, y + h); g.arcTo(x + w, y + h, x + w, y + h - r, r); g.lineTo(x + w, y); g.lineTo(x + w + 4, y);
  g.strokeStyle = opt.stroke || COLORS.glass; g.lineWidth = 2.5; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(x + 8, y + 12); g.lineTo(x + 8, y + h - 16); g.stroke();
  if (opt.title) text(g, opt.title, x + w / 2, y + h + 18, { align: 'center', color: COLORS.muted, size: 12 });
  return { x, y, w, h, top: y + h - lh, bottom: y + h };
}

/** Ống nghiệm. */
export function testTube(g, x, y, w, h, level, liquid, opt = {}) {
  const r = w / 2;
  const lh = clamp(level, 0, 1) * (h - r);
  g.save();
  g.beginPath();
  g.moveTo(x, y); g.lineTo(x, y + h - r); g.arc(x + r, y + h - r, r, Math.PI, 0, true); g.lineTo(x + w, y); g.closePath();
  g.clip();
  if (lh > 0) { g.fillStyle = liquid; g.fillRect(x, y + h - r - lh, w, lh + r); }
  if (opt.precipitate) { g.fillStyle = opt.precipitate; g.fillRect(x, y + h - r - (opt.precipHeight || 6), w, r + (opt.precipHeight || 6) + 2); }
  g.restore();
  g.beginPath();
  g.moveTo(x - 3, y); g.lineTo(x, y); g.lineTo(x, y + h - r); g.arc(x + r, y + h - r, r, Math.PI, 0, true); g.lineTo(x + w, y); g.lineTo(x + w + 3, y);
  g.strokeStyle = COLORS.glass; g.lineWidth = 2; g.stroke();
  if (opt.title) text(g, opt.title, x + w / 2, y + h + 16, { align: 'center', color: COLORS.muted, size: 12 });
  return { x, y, w, h, top: y + h - r - lh };
}

/** Ngọn lửa */
export function flame(g, x, y, s = 1, color = '#fbbf24', t = 0) {
  const flick = 1 + 0.08 * Math.sin(t * 25) + 0.05 * Math.sin(t * 41);
  g.save();
  g.translate(x, y);
  g.scale(s, s * flick);
  const grd = g.createRadialGradient(0, -12, 2, 0, -14, 22);
  grd.addColorStop(0, '#fff7cc');
  grd.addColorStop(0.4, color);
  grd.addColorStop(1, 'rgba(239,68,68,0)');
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(0, 0);
  g.quadraticCurveTo(14, -10, 2, -34);
  g.quadraticCurveTo(-14, -10, 0, 0);
  g.fill();
  g.restore();
}

/** Lưới đồ thị. Trả về hàm map (x,y) → pixel */
export function plot(g, x, y, w, h, { xmin, xmax, ymin, ymax, xlabel = '', ylabel = '', grid = 5, title = '' }) {
  g.fillStyle = 'rgba(2,6,23,0.5)';
  roundRect(g, x, y, w, h, 8); g.fill();
  for (let i = 0; i <= grid; i++) {
    const gx = x + (w * i) / grid, gy = y + (h * i) / grid;
    line(g, gx, y, gx, y + h, COLORS.grid, 1);
    line(g, x, gy, x + w, gy, COLORS.grid, 1);
  }
  const X = (v) => x + ((v - xmin) / (xmax - xmin)) * w;
  const Y = (v) => y + h - ((v - ymin) / (ymax - ymin)) * h;
  if (xlabel) text(g, xlabel, x + w / 2, y + h + 26, { align: 'center', color: COLORS.muted, size: 11 });
  if (ylabel) { g.save(); g.translate(x - 30, y + h / 2); g.rotate(-Math.PI / 2); text(g, ylabel, 0, 0, { align: 'center', color: COLORS.muted, size: 11 }); g.restore(); }
  if (title) text(g, title, x + 8, y + 16, { size: 12, color: COLORS.muted, weight: '600' });
  text(g, fmt(xmin), x, y + h + 4, { size: 10, color: COLORS.muted, baseline: 'top' });
  text(g, fmt(xmax), x + w, y + h + 4, { size: 10, color: COLORS.muted, align: 'right', baseline: 'top' });
  text(g, fmt(ymax), x - 4, y + 4, { size: 10, color: COLORS.muted, align: 'right', baseline: 'top' });
  text(g, fmt(ymin), x - 4, y + h, { size: 10, color: COLORS.muted, align: 'right' });
  return { X, Y, x, y, w, h };
}

export function polyline(g, pts, color, width = 2) {
  if (pts.length < 2) return;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.strokeStyle = color; g.lineWidth = width; g.lineJoin = 'round'; g.stroke();
}

export function fmt(v, d = 2) {
  if (!Number.isFinite(v)) return '—';
  if (Math.abs(v) >= 1e5) return v.toExponential(1);
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(d).replace(/\.?0+$/, '');
}

/** Vẽ nguyên tử dạng quả cầu có bóng */
export function atom(g, x, y, r, color, sym) {
  const grd = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  grd.addColorStop(0, lighten(color, 0.5));
  grd.addColorStop(1, color);
  g.fillStyle = grd;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1; g.stroke();
  if (sym) text(g, sym, x, y, { size: Math.max(9, r * 0.9), align: 'center', baseline: 'middle', color: '#0b1020', weight: '700' });
}

export const ATOM = { H: '#f1f5f9', C: '#64748b', O: '#ef4444', N: '#3b82f6', Na: '#a78bfa', Cl: '#22c55e', S: '#eab308', Cu: '#d97706', Fe: '#a16207', Zn: '#94a3b8', Ag: '#e2e8f0', I: '#7c3aed', Br: '#b45309', P: '#f97316', Ca: '#86efac', Mg: '#bbf7d0', K: '#c4b5fd', Al: '#cbd5e1' };
export const ATOM_R = { H: 7, C: 11, O: 11, N: 11, Na: 13, Cl: 12, S: 12, Cu: 13, Fe: 13, Zn: 13, Ag: 14, I: 14, Br: 13, P: 12, Ca: 14, Mg: 12, K: 15, Al: 12 };

/** Vẽ phân tử: atoms=[{s:'C',x,y}], bonds=[[i,j,order]] (tọa độ tương đối) */
export function molecule(g, cx, cy, atoms, bonds, scale = 1, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const P = atoms.map((a) => ({ ...a, px: cx + (a.x * c - a.y * s) * scale, py: cy + (a.x * s + a.y * c) * scale }));
  for (const [i, j, order = 1] of bonds) {
    const a = P[i], b = P[j];
    const dx = b.px - a.px, dy = b.py - a.py, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L * 3, ny = dx / L * 3;
    for (let k = 0; k < order; k++) {
      const off = (k - (order - 1) / 2);
      line(g, a.px + nx * off, a.py + ny * off, b.px + nx * off, b.py + ny * off, '#cbd5e1', 2.2 * scale);
    }
  }
  for (const a of P) atom(g, a.px, a.py, (ATOM_R[a.s] || 11) * scale, ATOM[a.s] || '#94a3b8', a.s);
  return P;
}

export function lighten(hex, amt) {
  if (!hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
  r = Math.round(r + (255 - r) * amt); gg = Math.round(gg + (255 - gg) * amt); b = Math.round(b + (255 - b) * amt);
  return `rgb(${r},${gg},${b})`;
}

export function mixColor(c1, c2, t) {
  t = clamp(t, 0, 1);
  const p = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const a = p(c1), b = p(c2);
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
}

export function withAlpha(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Bọt khí */
export class Bubbles {
  constructor() { this.list = []; }
  spawn(x, y, n = 1, opt = {}) {
    for (let i = 0; i < n; i++) this.list.push({ x: x + (Math.random() - 0.5) * (opt.spread || 10), y, r: 1.5 + Math.random() * (opt.r || 3), vy: -(20 + Math.random() * 30), life: 1, color: opt.color || 'rgba(255,255,255,0.7)' });
  }
  update(dt, topY) {
    for (const b of this.list) { b.y += b.vy * dt; b.x += Math.sin(b.y * 0.1) * 0.3; if (b.y < topY) b.life -= dt * 6; }
    this.list = this.list.filter((b) => b.life > 0);
  }
  draw(g) {
    for (const b of this.list) { g.globalAlpha = Math.max(0, b.life); circle(g, b.x, b.y, b.r, null, b.color); }
    g.globalAlpha = 1;
  }
}

/** Hạt rơi (kết tủa) */
export class Falling {
  constructor() { this.list = []; }
  spawn(x, y, n = 1, color = '#fff', r = 2) {
    for (let i = 0; i < n; i++) this.list.push({ x: x + (Math.random() - 0.5) * 30, y: y + Math.random() * 10, r: r * (0.6 + Math.random() * 0.8), vy: 8 + Math.random() * 14, color });
  }
  update(dt, bottomY) {
    for (const b of this.list) { b.y += b.vy * dt; b.x += (Math.random() - 0.5) * 0.5; }
    this.list = this.list.filter((b) => b.y < bottomY);
  }
  draw(g) { for (const b of this.list) circle(g, b.x, b.y, b.r, b.color); }
}

export function sparkle(g, x, y, r, t, color = '#fde68a') {
  g.save();
  g.translate(x, y); g.rotate(t * 2);
  g.strokeStyle = color; g.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 4); line(g, -r, 0, r, 0, color, 1.5); }
  g.restore();
}

/** Thanh tiến trình nhỏ trong canvas */
export function bar(g, x, y, w, h, frac, color, labelText) {
  g.fillStyle = 'rgba(148,163,184,0.15)'; roundRect(g, x, y, w, h, h / 2); g.fill();
  if (frac > 0) { g.fillStyle = color; roundRect(g, x, y, Math.max(h, w * clamp(frac, 0, 1)), h, h / 2); g.fill(); }
  if (labelText) text(g, labelText, x, y - 5, { size: 11, color: COLORS.muted });
}

/** Mũi tên cong (vòng) */
export function curvedArrow(g, cx, cy, r, a0, a1, color, width = 2) {
  g.beginPath(); g.arc(cx, cy, r, a0, a1); g.strokeStyle = color; g.lineWidth = width; g.stroke();
  const ex = cx + r * Math.cos(a1), ey = cy + r * Math.sin(a1);
  const tx = -Math.sin(a1), ty = Math.cos(a1);
  g.beginPath();
  g.moveTo(ex + tx * 8, ey + ty * 8);
  g.lineTo(ex - tx * 2 + ty * 5, ey - ty * 2 - tx * 5);
  g.lineTo(ex - tx * 2 - ty * 5, ey - ty * 2 + tx * 5);
  g.closePath(); g.fillStyle = color; g.fill();
}
