import { COLORS, text, label, circle, line, roundRect, molecule } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

const ETHYLENE = [{ s: 'C', x: -12, y: 0 }, { s: 'C', x: 12, y: 0 }, { s: 'H', x: -24, y: -14 }, { s: 'H', x: -24, y: 14 }, { s: 'H', x: 24, y: -14 }, { s: 'H', x: 24, y: 14 }];
const ETHYLENE_B = [[0, 1, 2], [0, 2], [0, 3], [1, 4], [1, 5]];

export default {
  id: 'chem-polymerization',
  subject: 'chem',
  chapter: 'polymer',
  title: 'Trùng hợp và trùng ngưng',
  summary: 'Nhìn các monomer nối lại: trùng hợp ethylene (mở liên kết đôi, không tách phân tử nhỏ) và trùng ngưng tạo nylon-6,6 (mỗi liên kết giải phóng một H2O).',
  equation: ['nCH2=CH2 → (–CH2–CH2–)n   (polyethylene, PE; t°, p, xúc tác)', 'nH2N–(CH2)6–NH2 + nHOOC–(CH2)4–COOH → (–NH–(CH2)6–NH–CO–(CH2)4–CO–)n + 2nH2O  (nylon-6,6)'],
  keywords: ['polymer', 'trùng hợp', 'trùng ngưng', 'PE', 'nylon', 'monomer', 'hệ số polymer hóa'],
  theory: [
    '**Trùng hợp**: nhiều monomer có **liên kết đôi C=C** (hoặc vòng kém bền) kết hợp thành polymer, **không** giải phóng phân tử nhỏ. Ví dụ: PE, PVC, PP, polystyrene, cao su buna.',
    '**Trùng ngưng**: monomer có **ít nhất hai nhóm chức** có khả năng phản ứng (–OH, –COOH, –NH2…) kết hợp, đồng thời **giải phóng phân tử nhỏ** (thường là H2O). Ví dụ: nylon-6,6, tơ lapsan (PET), nhựa phenol-formaldehyde.',
    '**Hệ số polymer hóa n** = số mắt xích; **M polymer = n × M mắt xích**. Với PE: M mắt xích = 28.'
  ],
  observe: ['Tăng nhiệt độ/áp suất để tốc độ nối nhanh hơn.', 'Chuyển sang trùng ngưng: đếm số phân tử nước thoát ra bằng số liên kết tạo thành.'],
  exam: ['Tính hệ số polymer hóa từ khối lượng mol polymer.', 'Phân loại monomer có thể trùng hợp/trùng ngưng; viết PTHH tổng quát.'],
  params: [
    { key: 'mode', label: 'Kiểu phản ứng', type: 'select', value: 'add', options: [['add', 'Trùng hợp (ethylene → PE)'], ['cond', 'Trùng ngưng (nylon-6,6)']] },
    { key: 'rate', label: 'Điều kiện (t°, p, xúc tác)', min: 0.2, max: 3, step: 0.1, value: 1, decimals: 1 },
    { key: 'count', label: 'Số monomer', min: 6, max: 30, step: 2, value: 16 }
  ],
  create(ctx) {
    const st = { mono: [], chain: [], water: [], t: 0 };
    const spawn = (p) => {
      st.mono = []; st.chain = []; st.water = [];
      for (let i = 0; i < p.count; i++) st.mono.push({ x: 80 + Math.random() * 500, y: 80 + Math.random() * 300, vx: (Math.random() - .5) * 40, vy: (Math.random() - .5) * 40, kind: p.mode === 'cond' ? (i % 2 ? 'acid' : 'amine') : 'ene', rot: Math.random() * TAU });
    };
    spawn(ctx.params);
    return {
      onParam(k, p) { if (k === 'mode' || k === 'count') spawn(p); },
      update(dt, p, t) {
        st.t = t;
        const W = 600, H = 420;
        for (const m of st.mono) { m.x += m.vx * dt * p.rate; m.y += m.vy * dt * p.rate; m.rot += dt; if (m.x < 40 || m.x > W) m.vx *= -1; if (m.y < 60 || m.y > H) m.vy *= -1; }
        // chuỗi: tìm monomer gần đầu chuỗi
        const headX = 60 + st.chain.length * 30, headY = 460;
        const prob = 0.6 * p.rate * dt;
        if (st.mono.length && Math.random() < prob) {
          // trùng ngưng phải xen kẽ amine/acid
          let idx = -1;
          if (p.mode === 'cond') { const need = st.chain.length % 2 === 0 ? 'amine' : 'acid'; idx = st.mono.findIndex((m) => m.kind === need); }
          else idx = 0;
          if (idx >= 0) {
            const m = st.mono.splice(idx, 1)[0];
            st.chain.push({ kind: m.kind, fx: m.x, fy: m.y, prog: 0 });
            if (p.mode === 'cond' && st.chain.length > 1) st.water.push({ x: headX, y: headY - 20, vy: -30 - Math.random() * 20, vx: (Math.random() - .5) * 20, life: 1 });
          }
        }
        for (const c of st.chain) c.prog = clamp(c.prog + dt * 2, 0, 1);
        for (const wtr of st.water) { wtr.x += wtr.vx * dt; wtr.y += wtr.vy * dt; wtr.life -= dt * 0.25; }
        st.water = st.water.filter((x) => x.life > 0);
      },
      draw(g, w, h, p, t) {
        const sx = w / 640, sy = h / 520;
        text(g, p.mode === 'add' ? 'Monomer: ethylene CH2=CH2' : 'Monomer: hexamethylenediamine (xanh) + adipic acid (đỏ)', 20, 30, { size: 14, weight: '700' });
        // monomer bay
        for (const m of st.mono) {
          const x = m.x * sx, y = m.y * sy;
          if (m.kind === 'ene') molecule(g, x, y, ETHYLENE, ETHYLENE_B, 0.7, m.rot);
          else drawCondMono(g, x, y, m.kind, m.rot);
        }
        // chuỗi polymer dưới đáy
        const baseY = h - 50, x0 = 40;
        const unit = Math.min(30, (w - 80) / Math.max(1, p.count));
        st.chain.forEach((c, i) => {
          const tx = x0 + i * unit, ty = baseY + Math.sin(i * 0.8) * 6;
          const x = c.fx * sx + (tx - c.fx * sx) * ease(c.prog), y = c.fy * sy + (ty - c.fy * sy) * ease(c.prog);
          if (p.mode === 'add') {
            g.fillStyle = '#94a3b8'; roundRect(g, x - unit / 2 + 2, y - 8, unit - 4, 16, 4); g.fill();
            text(g, 'CH₂CH₂', x, y + 1, { size: 8.5, align: 'center', baseline: 'middle', color: '#0b1020', weight: '700' });
          } else {
            g.fillStyle = c.kind === 'amine' ? '#60a5fa' : '#f87171'; roundRect(g, x - unit / 2 + 2, y - 8, unit - 4, 16, 4); g.fill();
            text(g, c.kind === 'amine' ? 'NH(CH₂)₆NH' : 'CO(CH₂)₄CO', x, y + 1, { size: 7, align: 'center', baseline: 'middle', color: '#0b1020', weight: '700' });
          }
          if (i > 0 && c.prog > 0.95) line(g, tx - unit / 2 + 2, ty, tx - unit / 2 - 2, baseY + Math.sin((i - 1) * 0.8) * 6, p.mode === 'cond' ? '#f472b6' : '#e2e8f0', 3);
        });
        for (const wtr of st.water) { g.globalAlpha = wtr.life; circle(g, wtr.x * sx, wtr.y * sy, 6, '#38bdf8'); text(g, 'H₂O', wtr.x * sx, wtr.y * sy - 10, { size: 9, align: 'center', color: '#7dd3fc' }); }
        g.globalAlpha = 1;
        label(g, `polymer: n = ${st.chain.length}${p.mode === 'cond' ? `, đã tách ${Math.max(0, st.chain.length - 1)} H2O` : ''}`, w / 2, baseY - 28, { size: 12 });
        text(g, p.mode === 'add' ? 'Liên kết đôi C=C mở ra → nối thành mạch, không tách phân tử nhỏ' : 'Nhóm –NH2 + –COOH → liên kết amide –CO–NH– và tách H2O', w / 2, h - 12, { size: 11, align: 'center', color: COLORS.muted });
      },
      metrics(p) {
        const n = st.chain.length;
        const M = p.mode === 'add' ? n * 28 : Math.floor(n / 2) * 226 + (n % 2 ? 116 : 0);
        return [['Hệ số polymer hóa n', p.mode === 'add' ? n : Math.floor(n / 2)], ['M polymer (g/mol)', M], ['Phân tử nhỏ tách ra', p.mode === 'add' ? 'không' : `${Math.max(0, n - 1)} H2O`], ['Monomer còn lại', st.mono.length]];
      }
    };
  }
};

function ease(x) { return 1 - Math.pow(1 - x, 3); }
function drawCondMono(g, x, y, kind, rot) {
  g.save(); g.translate(x, y); g.rotate(rot * 0.3);
  g.fillStyle = kind === 'amine' ? '#60a5fa' : '#f87171'; roundRect(g, -28, -8, 56, 16, 5); g.fill();
  text(g, kind === 'amine' ? 'H₂N–(CH₂)₆–NH₂' : 'HOOC–(CH₂)₄–COOH', 0, 1, { size: 7.5, align: 'center', baseline: 'middle', color: '#0b1020', weight: '700' });
  g.restore();
}
