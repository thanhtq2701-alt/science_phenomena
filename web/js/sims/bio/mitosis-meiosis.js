import { COLORS, text, label, circle, line, roundRect } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

const MITOSIS = [
  { name: 'Kì trung gian', desc: 'NST ở dạng sợi mảnh, nhân đôi thành NST kép (2 chromatid).' },
  { name: 'Kì đầu', desc: 'NST kép co xoắn, màng nhân tiêu biến, thoi phân bào hình thành.' },
  { name: 'Kì giữa', desc: 'NST kép co xoắn cực đại, xếp 1 hàng trên mặt phẳng xích đạo.' },
  { name: 'Kì sau', desc: 'Mỗi NST kép tách thành 2 NST đơn, đi về 2 cực.' },
  { name: 'Kì cuối', desc: 'NST dãn xoắn, màng nhân tái lập, tế bào chất phân chia → 2 tế bào 2n.' }
];
const MEIOSIS = [
  { name: 'Kì trung gian', desc: 'NST nhân đôi thành NST kép.' },
  { name: 'Kì đầu I', desc: 'NST kép tương đồng bắt cặp, có thể trao đổi chéo.' },
  { name: 'Kì giữa I', desc: 'Các cặp NST kép tương đồng xếp 2 hàng trên mặt phẳng xích đạo.' },
  { name: 'Kì sau I', desc: 'Mỗi NST kép trong cặp tương đồng đi về 1 cực (NST vẫn kép).' },
  { name: 'Kì cuối I', desc: '2 tế bào con, mỗi tế bào n NST kép.' },
  { name: 'Kì giữa II', desc: 'NST kép xếp 1 hàng ở mỗi tế bào.' },
  { name: 'Kì sau II', desc: 'Chromatid tách nhau đi về 2 cực.' },
  { name: 'Kì cuối II', desc: '4 tế bào con, mỗi tế bào n NST đơn (giao tử).' }
];

export default {
  id: 'bio-mitosis-meiosis',
  subject: 'bio',
  chapter: 'chromosome',
  title: 'Nguyên phân và giảm phân',
  summary: 'Theo dõi NST qua từng kì: nguyên phân tạo 2 tế bào 2n giống mẹ; giảm phân tạo 4 giao tử n với tổ hợp NST khác nhau nhờ phân li độc lập và trao đổi chéo.',
  equation: ['Nguyên phân: 1 tế bào 2n → 2 tế bào 2n', 'Giảm phân: 1 tế bào 2n → 4 tế bào n', 'Số loại giao tử (không trao đổi chéo) = 2ⁿ với n cặp NST tương đồng'],
  keywords: ['nguyên phân', 'giảm phân', 'nhiễm sắc thể', 'chromatid', 'kì giữa', 'kì sau', 'giao tử', 'tương đồng', 'trao đổi chéo'],
  theory: [
    '**Nguyên phân** xảy ra ở tế bào sinh dưỡng và tế bào sinh dục sơ khai: NST nhân đôi một lần, phân chia một lần → 2 tế bào con có bộ NST **2n giống hệt** tế bào mẹ. Ý nghĩa: sinh trưởng, tái sinh, sinh sản vô tính.',
    '**Giảm phân** xảy ra ở tế bào sinh dục chín: NST nhân đôi một lần, phân chia **hai lần**. Giảm phân I: các cặp **NST tương đồng** phân li (số NST giảm một nửa); giảm phân II: **chromatid** tách nhau như nguyên phân. Kết quả: 4 tế bào **n**.',
    'Giảm phân tạo **biến dị tổ hợp** nhờ: NST tương đồng **phân li độc lập** (2ⁿ tổ hợp) và **trao đổi chéo** ở kì đầu I. Kết hợp với thụ tinh, bộ NST 2n được khôi phục ở hợp tử.'
  ],
  observe: ['So sánh kì giữa: nguyên phân xếp 1 hàng, giảm phân I xếp 2 hàng.', 'Kì sau I: NST kép (chữ X) đi về mỗi cực; kì sau II/nguyên phân: NST đơn.', 'Đổi số cặp NST n = 3 để thấy 8 loại giao tử có thể.'],
  exam: ['Tính số NST, chromatid, tâm động ở mỗi kì cho bộ 2n cho trước.', 'Số tế bào con, số giao tử, số loại giao tử; xác định kì phân bào qua hình.'],
  params: [
    { key: 'mode', label: 'Kiểu phân bào', type: 'select', value: 'mitosis', options: [['mitosis', 'Nguyên phân'], ['meiosis', 'Giảm phân']] },
    { key: 'n', label: 'Số cặp NST (n)', min: 1, max: 3, step: 1, value: 2 },
    { key: 'speed', label: 'Tốc độ', min: 0.2, max: 2, step: 0.1, value: 0.6, decimals: 1 }
  ],
  actions: [{ key: 'next', label: '⏭ Kì tiếp theo' }],
  create() {
    const st = { phase: 0, prog: 0 };
    return {
      onParam(k) { if (k === 'mode') { st.phase = 0; st.prog = 0; } },
      action(key, p) { if (key === 'next') { const ph = p.mode === 'mitosis' ? MITOSIS : MEIOSIS; st.phase = (st.phase + 1) % ph.length; st.prog = 0; } },
      update(dt, p) {
        const ph = p.mode === 'mitosis' ? MITOSIS : MEIOSIS;
        st.prog += dt * p.speed * 0.5;
        if (st.prog >= 1) { st.prog = 0; st.phase = (st.phase + 1) % ph.length; }
      },
      draw(g, w, h, p) {
        const phases = p.mode === 'mitosis' ? MITOSIS : MEIOSIS;
        const ph = phases[st.phase], u = st.prog;
        const cx = w * 0.36, cy = h / 2 - 20;
        const n = p.n;
        const colors = ['#f87171', '#60a5fa', '#4ade80'];
        const name = ph.name;
        // vẽ tế bào (có thể 1, 2 hoặc 4)
        const cells = p.mode === 'mitosis' ? (name === 'Kì cuối' ? 2 : 1) : (name.includes('II') ? (name === 'Kì cuối II' ? 4 : 2) : name === 'Kì cuối I' ? 2 : 1);
        const positions = cells === 1 ? [[cx, cy]] : cells === 2 ? [[cx - 110, cy], [cx + 110, cy]] : [[cx - 130, cy - 80], [cx + 130, cy - 80], [cx - 130, cy + 80], [cx + 130, cy + 80]];
        const R = cells === 1 ? 150 : cells === 2 ? 95 : 70;
        positions.forEach(([x, y], ci) => {
          circle(g, x, y, R, 'rgba(74,222,128,0.06)', 'rgba(74,222,128,0.5)', 2);
          const hasNucleus = name === 'Kì trung gian' || name.startsWith('Kì cuối');
          if (hasNucleus) circle(g, x, y, R * 0.6, 'rgba(148,163,184,0.08)', 'rgba(148,163,184,0.4)', 1);
          // thoi phân bào
          if (!hasNucleus) { for (let k = -2; k <= 2; k++) { line(g, x - R + 10, y, x + R - 10, y + k * 18, 'rgba(148,163,184,0.15)', 1); } circle(g, x - R + 10, y, 4, '#94a3b8'); circle(g, x + R - 10, y, 4, '#94a3b8'); }
          drawChromosomes(g, x, y, R, name, u, n, colors, p.mode, ci, cells);
        });
        label(g, `${ph.name} (${Math.round(u * 100)}%)`, cx, 36, { size: 13, color: '#4ade80' });
        // mô tả & thống kê phải
        const rx = Math.max(cx + 200, w * 0.64);
        if (w - rx > 150) {
          text(g, p.mode === 'mitosis' ? 'NGUYÊN PHÂN' : 'GIẢM PHÂN', rx, 60, { size: 14, weight: '700' });
          wrap(g, ph.desc, rx, 86, w - rx - 20, 12, COLORS.muted);
          const stats = countStats(name, n, p.mode);
          text(g, 'Trong mỗi tế bào:', rx, 170, { size: 12, weight: '700' });
          [['NST', stats.nst], ['Chromatid', stats.chr], ['Tâm động', stats.cen], ['Trạng thái NST', stats.state]].forEach((r, i) => { text(g, r[0], rx, 196 + i * 22, { size: 11.5, color: COLORS.muted }); text(g, String(r[1]), rx + 130, 196 + i * 22, { size: 11.5, weight: '700' }); });
          text(g, `Số tế bào: ${cells}`, rx, 300, { size: 12 });
          if (p.mode === 'meiosis') text(g, `Số loại giao tử tối đa: 2^${n} = ${Math.pow(2, n)}`, rx, 322, { size: 12, color: '#fbbf24' });
          // timeline
          const ty = h - 40; const tw = w - rx - 30; phases.forEach((q, i) => { const x = rx + i * tw / (phases.length - 1); circle(g, x, ty, i === st.phase ? 7 : 4, i === st.phase ? '#4ade80' : i < st.phase ? '#4ade80' : '#475569'); }); line(g, rx, ty, rx + tw, ty, '#475569', 1);
        }
      },
      metrics(p) { const phases = p.mode === 'mitosis' ? MITOSIS : MEIOSIS; const s = countStats(phases[st.phase].name, p.n, p.mode); return [['Kì', phases[st.phase].name], ['NST / tế bào', s.nst], ['Chromatid / tế bào', s.chr], ['Bộ NST', s.ploidy]]; }
    };
  }
};

function countStats(name, n, mode) {
  const dbl = (nst) => ({ nst, chr: 2 * nst, cen: nst, state: 'kép', ploidy: nst === 2 * n ? '2n kép' : 'n kép' });
  const sgl = (nst) => ({ nst, chr: 0, cen: nst, state: 'đơn', ploidy: nst === 2 * n ? '2n đơn' : 'n đơn' });
  if (mode === 'mitosis') { if (name === 'Kì trung gian' || name === 'Kì đầu' || name === 'Kì giữa') return dbl(2 * n); if (name === 'Kì sau') return { nst: 4 * n, chr: 0, cen: 4 * n, state: 'đơn', ploidy: '4n đơn' }; return sgl(2 * n); }
  if (['Kì trung gian', 'Kì đầu I', 'Kì giữa I', 'Kì sau I'].includes(name)) return dbl(2 * n);
  if (name === 'Kì cuối I' || name === 'Kì giữa II') return dbl(n);
  if (name === 'Kì sau II') return { nst: 2 * n, chr: 0, cen: 2 * n, state: 'đơn', ploidy: '2n đơn (tạm)' };
  return sgl(n);
}

function chromo(g, x, y, color, dbl, len = 26, ang = 0) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.strokeStyle = color; g.lineWidth = 6; g.lineCap = 'round';
  if (dbl) { g.beginPath(); g.moveTo(-5, -len / 2); g.lineTo(5, len / 2); g.stroke(); g.beginPath(); g.moveTo(5, -len / 2); g.lineTo(-5, len / 2); g.stroke(); }
  else { g.beginPath(); g.moveTo(0, -len / 2); g.lineTo(0, len / 2); g.stroke(); }
  circle(g, 0, 0, 3.5, '#0b1020');
  g.restore();
}

function drawChromosomes(g, x, y, R, name, u, n, colors, mode, ci, cells) {
  const pairGap = 50;
  if (name === 'Kì trung gian') { for (let i = 0; i < n; i++) for (let k = 0; k < 2; k++) { const a = (i * 2 + k) / (2 * n) * TAU; chromo(g, x + Math.cos(a) * R * 0.35, y + Math.sin(a) * R * 0.35, k ? colors[i] : lighten(colors[i]), u > 0.5, 22, a); } return; }
  if (mode === 'mitosis') {
    if (name === 'Kì đầu') { for (let i = 0; i < n; i++) for (let k = 0; k < 2; k++) { const a = (i * 2 + k) / (2 * n) * TAU + u; chromo(g, x + Math.cos(a) * R * 0.3 * (1 - u * 0.5), y + Math.sin(a) * R * 0.3, k ? colors[i] : lighten(colors[i]), true); } return; }
    if (name === 'Kì giữa') { for (let i = 0; i < n; i++) for (let k = 0; k < 2; k++) chromo(g, x, y + ((i * 2 + k) - (2 * n - 1) / 2) * 30, k ? colors[i] : lighten(colors[i]), true); return; }
    if (name === 'Kì sau') { for (let i = 0; i < n; i++) for (let k = 0; k < 2; k++) { const yy = y + ((i * 2 + k) - (2 * n - 1) / 2) * 30; const d = u * R * 0.6; chromo(g, x - d, yy, k ? colors[i] : lighten(colors[i]), false, 22); chromo(g, x + d, yy, k ? colors[i] : lighten(colors[i]), false, 22); } return; }
    for (let i = 0; i < n; i++) for (let k = 0; k < 2; k++) { const a = (i * 2 + k) / (2 * n) * TAU; chromo(g, x + Math.cos(a) * R * 0.3, y + Math.sin(a) * R * 0.3, k ? colors[i] : lighten(colors[i]), false, 20, a); }
    return;
  }
  // giảm phân
  if (name === 'Kì đầu I') { for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.5; const px = x + Math.cos(a) * R * 0.3, py = y + Math.sin(a) * R * 0.3; chromo(g, px - 8 * (1 - u * 0.5), py, lighten(colors[i]), true, 26); chromo(g, px + 8 * (1 - u * 0.5), py, colors[i], true, 26); if (u > 0.5) circle(g, px, py + 8, 3, '#fbbf24'); } return; }
  if (name === 'Kì giữa I') { for (let i = 0; i < n; i++) { const yy = y + (i - (n - 1) / 2) * 44; chromo(g, x - 12, yy, lighten(colors[i]), true); chromo(g, x + 12, yy, colors[i], true); } return; }
  if (name === 'Kì sau I') { for (let i = 0; i < n; i++) { const yy = y + (i - (n - 1) / 2) * 44; const d = 12 + u * R * 0.55; const swap = i % 2 === 1; chromo(g, x - d, yy, swap ? colors[i] : lighten(colors[i]), true); chromo(g, x + d, yy, swap ? lighten(colors[i]) : colors[i], true); } return; }
  if (name === 'Kì cuối I') { for (let i = 0; i < n; i++) { const a = i / n * TAU; const swap = i % 2 === 1; const c = (ci === 0) !== swap ? lighten(colors[i]) : colors[i]; chromo(g, x + Math.cos(a) * R * 0.3, y + Math.sin(a) * R * 0.3, c, true, 22, a); } return; }
  if (name === 'Kì giữa II') { for (let i = 0; i < n; i++) { const swap = i % 2 === 1; const c = (ci === 0) !== swap ? lighten(colors[i]) : colors[i]; chromo(g, x, y + (i - (n - 1) / 2) * 30, c, true); } return; }
  if (name === 'Kì sau II') { for (let i = 0; i < n; i++) { const swap = i % 2 === 1; const c = (ci === 0) !== swap ? lighten(colors[i]) : colors[i]; const yy = y + (i - (n - 1) / 2) * 30; const d = u * R * 0.6; chromo(g, x - d, yy, c, false, 20); chromo(g, x + d, yy, c, false, 20); } return; }
  for (let i = 0; i < n; i++) { const swap = i % 2 === 1; const c = (ci < 2) !== swap ? lighten(colors[i]) : colors[i]; const a = i / n * TAU; chromo(g, x + Math.cos(a) * R * 0.35, y + Math.sin(a) * R * 0.35, c, false, 18, a); }
}
function lighten(hex) { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return `rgb(${Math.round(r + (255 - r) * 0.45)},${Math.round(g + (255 - g) * 0.45)},${Math.round(b + (255 - b) * 0.45)})`; }
function wrap(g, str, x, y, maxW, size, color) { g.font = `500 ${size}px Inter, system-ui, sans-serif`; const words = str.split(' '); let line = '', yy = y; for (const wd of words) { const t = line + wd + ' '; if (g.measureText(t).width > maxW && line) { text(g, line, x, yy, { size, color }); line = wd + ' '; yy += size + 6; } else line = t; } text(g, line, x, yy, { size, color }); }
