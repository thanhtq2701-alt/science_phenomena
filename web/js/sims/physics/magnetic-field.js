import { COLORS, text, label, circle, line, arrow, roundRect } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

const MU0 = 4e-7 * Math.PI;

export default {
  id: 'physics-magnetic-field',
  subject: 'physics',
  chapter: 'magnetism',
  title: 'Từ trường của dòng điện: dây thẳng, vòng dây, ống dây',
  summary: 'Vẽ đường sức từ và kim nam châm quanh dây dẫn thẳng, vòng dây tròn và ống dây. Đổi chiều dòng điện để thấy chiều đường sức đổi theo quy tắc nắm tay phải.',
  equation: ['Dây thẳng dài: B = 2·10⁻⁷ · I / r', 'Vòng dây tròn (tâm): B = 2π·10⁻⁷ · N·I / R', 'Ống dây: B = 4π·10⁻⁷ · n·I  (n = số vòng/mét)'],
  keywords: ['từ trường', 'đường sức từ', 'cảm ứng từ', 'nắm tay phải', 'ống dây', 'solenoid', 'nam châm'],
  theory: [
    '**Dòng điện sinh ra từ trường**. Đường sức từ của dây dẫn thẳng là các **đường tròn đồng tâm**; chiều xác định bằng **quy tắc nắm tay phải**: ngón cái theo chiều dòng điện, các ngón còn lại chỉ chiều đường sức.',
    'Với vòng dây / ống dây: nắm tay phải theo chiều dòng điện trong vòng, **ngón cái chỉ chiều đường sức bên trong** (cực Bắc). Bên trong ống dây dài, từ trường **đều**, đường sức song song.',
    'Độ lớn cảm ứng từ B tỉ lệ với **cường độ dòng điện I**, giảm khi xa dây. Đơn vị tesla (T).'
  ],
  observe: ['Đảo chiều dòng điện: kim nam châm quay 180°.', 'Tăng I: đường sức dày hơn (B lớn hơn).', 'Chọn ống dây để thấy từ trường đều bên trong.'],
  exam: ['Tính B của dây thẳng, vòng dây, ống dây; xác định chiều bằng quy tắc nắm tay phải.', 'Nguyên lí chồng chất từ trường của hai dây song song.'],
  params: [
    { key: 'src', label: 'Nguồn từ trường', type: 'select', value: 'wire', options: [['wire', 'Dây dẫn thẳng (nhìn dọc trục)'], ['loop', 'Vòng dây tròn (mặt cắt)'], ['solenoid', 'Ống dây (mặt cắt)']] },
    { key: 'I', label: 'Cường độ dòng điện', min: -10, max: 10, step: 0.5, value: 5, unit: 'A', decimals: 1 },
    { key: 'r', label: 'Khoảng cách đo B (dây thẳng)', min: 1, max: 20, step: 1, value: 5, unit: 'cm' }
  ],
  create() {
    return {
      update() {},
      draw(g, w, h, p, t) {
        const cx = w * 0.42, cy = h / 2 - 10;
        const sgn = Math.sign(p.I) || 1, mag = Math.abs(p.I);
        if (p.src === 'wire') {
          // đường sức tròn
          for (let i = 1; i <= 6; i++) {
            const r = i * 32;
            g.strokeStyle = `rgba(56,189,248,${clamp(0.9 - i * 0.12, 0.1, 1) * clamp(mag / 10 + 0.2, 0.2, 1)})`; g.lineWidth = 1.5;
            g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
            // mũi tên chỉ chiều (ngược chiều kim đồng hồ khi I ra khỏi màn hình)
            for (let k = 0; k < 2; k++) {
              const a = (t * 0.4 * sgn + k * Math.PI) % TAU; const ax = cx + Math.cos(a) * r, ay = cy + Math.sin(a) * r;
              const dir = -sgn; arrow(g, ax, ay, ax - Math.sin(a) * 10 * dir, ay + Math.cos(a) * 10 * dir, '#38bdf8', 1.5, 7);
            }
          }
          circle(g, cx, cy, 14, '#fbbf24', '#0b1020');
          if (sgn > 0) circle(g, cx, cy, 4, '#0b1020'); else { line(g, cx - 7, cy - 7, cx + 7, cy + 7, '#0b1020', 3); line(g, cx - 7, cy + 7, cx + 7, cy - 7, '#0b1020', 3); }
          label(g, sgn > 0 ? 'I hướng ra khỏi màn hình (•)' : 'I hướng vào màn hình (×)', cx, cy + 215, { size: 11 });
          // kim nam châm
          for (let i = 0; i < 8; i++) { const a = i * TAU / 8; const r = 130; const nx = cx + Math.cos(a) * r, ny = cy + Math.sin(a) * r; const ang = a + (sgn > 0 ? -Math.PI / 2 : Math.PI / 2); compass(g, nx, ny, ang); }
          // điểm đo
          const rr = p.r * 10; circle(g, cx + rr, cy, 4, '#4ade80'); text(g, `B(r=${p.r} cm) = ${(2e-7 * mag / (p.r / 100) * 1e6).toFixed(1)} μT`, cx + rr + 8, cy - 8, { size: 11, color: '#4ade80' });
        } else if (p.src === 'loop') {
          // mặt cắt vòng dây: 2 điểm dòng điện ngược nhau, đường sức hình số 8
          const R = 70;
          drawFieldLines(g, [[cx, cy - R, sgn], [cx, cy + R, -sgn]], cx, cy, t, mag);
          circle(g, cx, cy - R, 10, '#fbbf24', '#0b1020'); circle(g, cx, cy + R, 10, '#fbbf24', '#0b1020');
          if (sgn > 0) { circle(g, cx, cy - R, 3, '#0b1020'); crossMark(g, cx, cy + R); } else { crossMark(g, cx, cy - R); circle(g, cx, cy + R, 3, '#0b1020'); }
          arrow(g, cx + (sgn > 0 ? -40 : 40), cy, cx + (sgn > 0 ? -120 : 120), cy, '#f87171', 3); text(g, 'B tại tâm', cx + (sgn > 0 ? -80 : 80), cy - 14, { size: 11, align: 'center', color: '#f87171' });
          label(g, 'vòng dây nhìn từ cạnh (• ra, × vào)', cx, cy + 200, { size: 11 });
        } else {
          // ống dây: 2 hàng dòng điện
          const n = 7, L = 220, R = 60;
          const srcs = []; for (let i = 0; i < n; i++) { const x = cx - L / 2 + i * L / (n - 1); srcs.push([x, cy - R, sgn], [x, cy + R, -sgn]); }
          // đường sức bên trong: thẳng
          for (let k = -2; k <= 2; k++) { const y = cy + k * 20; const dir = sgn > 0 ? -1 : 1; line(g, cx - L / 2 - 10, y, cx + L / 2 + 10, y, 'rgba(56,189,248,0.8)', 1.5); const u = ((t * 0.5 * -dir) % 1 + 1) % 1; const ax = cx - L / 2 - 10 + u * (L + 20); arrow(g, ax, y, ax + 10 * -dir, y, '#38bdf8', 1.5, 7); }
          // đường sức ngoài: cung lớn
          for (let k = 1; k <= 3; k++) { g.strokeStyle = `rgba(56,189,248,${0.5 - k * 0.1})`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(cx, cy, L / 2 + 10 + k * 25, R + k * 35, 0, 0, TAU); g.stroke(); }
          for (const [x, y, s] of srcs) { circle(g, x, y, 8, '#fbbf24', '#0b1020'); if (s > 0) circle(g, x, y, 2.5, '#0b1020'); else crossMark(g, x, y, 4); }
          const dir = sgn > 0 ? -1 : 1;
          label(g, 'N', cx + (L / 2 + 30) * -dir, cy, { size: 14, color: '#f87171' }); label(g, 'S', cx + (L / 2 + 30) * dir, cy, { size: 14, color: '#60a5fa' });
          label(g, 'ống dây nhìn từ cạnh – từ trường đều bên trong', cx, cy + 190, { size: 11 });
        }
        // bảng phải
        const rx = Math.max(w * 0.72, cx + 240);
        if (w - rx > 150) {
          text(g, 'Độ lớn B', rx, 70, { size: 14, weight: '700' });
          const rows = p.src === 'wire' ? [['B = 2·10⁻⁷·I/r', ''], [`r = ${p.r} cm`, `${(2e-7 * mag / (p.r / 100) * 1e6).toFixed(1)} μT`]] : p.src === 'loop' ? [['B = 2π·10⁻⁷·NI/R', ''], ['N = 1, R = 5 cm', `${(2 * Math.PI * 1e-7 * mag / 0.05 * 1e6).toFixed(1)} μT`]] : [['B = 4π·10⁻⁷·nI', ''], ['n = 1000 vòng/m', `${(MU0 * 1000 * mag * 1e3).toFixed(2)} mT`]];
          rows.forEach((r, i) => { text(g, r[0], rx, 100 + i * 24, { size: 12, color: COLORS.muted }); text(g, r[1], rx, 118 + i * 24, { size: 13, weight: '700', color: COLORS.warn }); });
          text(g, 'Quy tắc nắm tay phải:', rx, 200, { size: 12, weight: '700' });
          (p.src === 'wire' ? ['ngón cái → chiều I', 'bốn ngón → chiều đường sức'] : ['bốn ngón → chiều I trong vòng', 'ngón cái → chiều B bên trong (cực N)']).forEach((s, i) => text(g, s, rx, 222 + i * 20, { size: 11.5, color: COLORS.muted }));
        }
      },
      metrics(p) { const mag = Math.abs(p.I); return [['I', `${p.I} A`], ['B (dây thẳng, r)', `${(2e-7 * mag / (p.r / 100) * 1e6).toFixed(1)} μT`], ['B (ống dây n=1000/m)', `${(MU0 * 1000 * mag * 1e3).toFixed(2)} mT`]]; }
    };
  }
};

function compass(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  circle(g, 0, 0, 12, 'rgba(15,23,42,0.9)', '#94a3b8');
  g.fillStyle = '#f87171'; g.beginPath(); g.moveTo(0, -10); g.lineTo(-3, 0); g.lineTo(3, 0); g.closePath(); g.fill();
  g.fillStyle = '#e2e8f0'; g.beginPath(); g.moveTo(0, 10); g.lineTo(-3, 0); g.lineTo(3, 0); g.closePath(); g.fill();
  g.restore();
}
function crossMark(g, x, y, s = 5) { line(g, x - s, y - s, x + s, y + s, '#0b1020', 2.5); line(g, x - s, y + s, x + s, y - s, '#0b1020', 2.5); }
/** Vẽ đường sức xấp xỉ bằng tích phân trường của các dòng điện điểm (2D) */
function drawFieldLines(g, srcs, cx, cy, t, mag) {
  const field = (x, y) => { let bx = 0, by = 0; for (const [sx, sy, s] of srcs) { const dx = x - sx, dy = y - sy, r2 = dx * dx + dy * dy + 40; bx += -dy / r2 * s; by += dx / r2 * s; } return [bx, by]; };
  const starts = []; for (let k = -3; k <= 3; k++) starts.push([cx + 1, cy + k * 18]);
  for (const [x0, y0] of starts) {
    for (const dir of [1, -1]) {
      let x = x0, y = y0; g.beginPath(); g.moveTo(x, y);
      for (let i = 0; i < 400; i++) { const [bx, by] = field(x, y); const L = Math.hypot(bx, by) || 1e-9; x += bx / L * 3 * dir; y += by / L * 3 * dir; g.lineTo(x, y); if (x < 0 || x > 2000 || y < -200 || y > 2000) break; }
      g.strokeStyle = `rgba(56,189,248,${clamp(0.25 + mag / 12, 0.25, 0.9)})`; g.lineWidth = 1.3; g.stroke();
    }
  }
  // mũi tên chỉ chiều trên trục
  const [bx] = field(cx, cy); const d = Math.sign(bx) || 1; const u = (t * 0.5) % 1; const ax = cx - 60 + u * 120 * (d > 0 ? 1 : 1);
  void ax;
}
