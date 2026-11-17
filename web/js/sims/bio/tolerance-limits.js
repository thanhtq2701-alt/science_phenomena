import { COLORS, text, label, circle, roundRect, plot, polyline } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const SPECIES = {
  tilapia: { name: 'Cá rô phi', min: 5.6, opt: [20, 35], max: 42, unit: '°C' },
  carp: { name: 'Cá chép', min: 2, opt: [20, 28], max: 44, unit: '°C' },
  coral: { name: 'San hô', min: 18, opt: [23, 29], max: 32, unit: '°C' },
  cactus: { name: 'Xương rồng (độ ẩm đất)', min: 2, opt: [5, 20], max: 40, unit: '%' }
};

export default {
  id: 'bio-tolerance-limits',
  subject: 'bio',
  chapter: 'ecology',
  title: 'Giới hạn sinh thái và ổ sinh thái',
  summary: 'Mỗi loài chỉ tồn tại trong một khoảng giá trị của nhân tố sinh thái: khoảng thuận lợi ở giữa, khoảng chống chịu hai bên, ngoài giới hạn thì chết. Kéo nhiệt độ để xem đàn cá rô phi phản ứng.',
  equation: ['Giới hạn sinh thái: khoảng từ điểm gây chết dưới đến điểm gây chết trên', 'Cá rô phi: 5,6 °C – 42 °C ; khoảng thuận lợi 20 – 35 °C', 'Ổ sinh thái: tổ hợp các giới hạn sinh thái của mọi nhân tố'],
  keywords: ['giới hạn sinh thái', 'khoảng thuận lợi', 'khoảng chống chịu', 'điểm gây chết', 'ổ sinh thái', 'nhân tố sinh thái', 'cá rô phi', 'nhiệt độ'],
  theory: [
    '**Nhân tố sinh thái** gồm nhân tố vô sinh (nhiệt độ, ánh sáng, độ ẩm…) và hữu sinh. **Giới hạn sinh thái** là khoảng giá trị xác định của một nhân tố mà trong đó sinh vật có thể tồn tại và phát triển ổn định.',
    'Trong giới hạn có **khoảng thuận lợi** (sinh vật sống tốt nhất) và **khoảng chống chịu** (hoạt động bị ức chế). Ngoài **điểm gây chết dưới/trên** sinh vật chết. Loài có giới hạn rộng phân bố rộng (cá chép), giới hạn hẹp phân bố hẹp (san hô).',
    '**Ổ sinh thái** là "không gian sinh thái" mà mọi nhân tố đều nằm trong giới hạn cho phép loài tồn tại; các loài có ổ sinh thái trùng nhau sẽ cạnh tranh. Ứng dụng: chọn vùng nuôi trồng, nhập nội giống phù hợp.'
  ],
  observe: ['Kéo nhiệt độ ra ngoài khoảng 20–35 °C: cá bơi chậm (chống chịu).', 'Dưới 5,6 °C hoặc trên 42 °C: cá chết.', 'Đổi sang san hô: giới hạn rất hẹp, dễ bị tẩy trắng khi nước ấm lên.'],
  exam: ['Đọc đồ thị giới hạn sinh thái; xác định khoảng thuận lợi, chống chịu.', 'So sánh khả năng phân bố của các loài theo giới hạn sinh thái.'],
  params: [
    { key: 'sp', label: 'Loài', type: 'select', value: 'tilapia', options: Object.entries(SPECIES).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'Giá trị nhân tố', min: 0, max: 50, step: 0.5, value: 28, decimals: 1 }
  ],
  create() {
    const st = { fish: [] };
    for (let i = 0; i < 12; i++) st.fish.push({ x: Math.random(), y: Math.random(), vx: Math.random() - 0.5, vy: (Math.random() - 0.5) * 0.4 });
    const perf = (s, x) => x <= s.min || x >= s.max ? 0 : x < s.opt[0] ? (x - s.min) / (s.opt[0] - s.min) : x > s.opt[1] ? (s.max - x) / (s.max - s.opt[1]) : 1;
    return {
      update(dt, p) {
        const s = SPECIES[p.sp]; const a = perf(s, p.x);
        for (const f of st.fish) { if (a <= 0) { f.y = Math.max(0, f.y - dt * 0.05); continue; } f.x += f.vx * a * dt * 0.4; f.y += f.vy * a * dt * 0.4; if (f.x < 0 || f.x > 1) f.vx *= -1; if (f.y < 0 || f.y > 1) f.vy *= -1; f.x = clamp(f.x, 0, 1); f.y = clamp(f.y, 0, 1); }
      },
      draw(g, w, h, p) {
        const s = SPECIES[p.sp]; const a = perf(s, p.x);
        const zone = a <= 0 ? 'NGOÀI GIỚI HẠN – chết' : a < 1 ? 'khoảng chống chịu' : 'khoảng thuận lợi';
        // bể
        const bx = 30, by = 50, bw = Math.min(320, w * 0.38), bh = 200;
        const warm = clamp(p.x / 45, 0, 1);
        g.fillStyle = `rgba(${Math.round(56 + warm * 180)},${Math.round(150 - warm * 60)},${Math.round(248 - warm * 180)},0.25)`; roundRect(g, bx, by, bw, bh, 10); g.fill();
        for (const f of st.fish) { const x = bx + 20 + f.x * (bw - 40), y = by + 20 + (a <= 0 ? 0.02 : f.y) * (bh - 40); g.save(); g.translate(x, y); if (f.vx < 0) g.scale(-1, 1); if (a <= 0) g.rotate(Math.PI); g.fillStyle = a <= 0 ? '#94a3b8' : '#fbbf24'; g.beginPath(); g.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(-10, 0); g.lineTo(-18, -6); g.lineTo(-18, 6); g.closePath(); g.fill(); g.restore(); }
        label(g, `${p.x} ${s.unit}: ${zone}`, bx + bw / 2, by + bh + 20, { size: 11.5, color: a <= 0 ? COLORS.danger : a < 1 ? COLORS.warn : '#4ade80' });
        // đồ thị giới hạn
        const px = bx + bw + 60, pw = w - px - 30, ph = h - 120;
        if (pw > 160) {
          const P = plot(g, px, 50, pw, ph, { xmin: 0, xmax: 50, ymin: 0, ymax: 1.2, xlabel: `${s.name.includes('ẩm') ? 'độ ẩm' : 'nhiệt độ'} (${s.unit})`, ylabel: 'mức sống', title: `Giới hạn sinh thái của ${s.name}` });
          g.fillStyle = 'rgba(74,222,128,0.12)'; g.fillRect(P.X(s.opt[0]), P.Y(1.2), P.X(s.opt[1]) - P.X(s.opt[0]), P.Y(0) - P.Y(1.2));
          g.fillStyle = 'rgba(251,191,36,0.08)'; g.fillRect(P.X(s.min), P.Y(1.2), P.X(s.opt[0]) - P.X(s.min), P.Y(0) - P.Y(1.2)); g.fillRect(P.X(s.opt[1]), P.Y(1.2), P.X(s.max) - P.X(s.opt[1]), P.Y(0) - P.Y(1.2));
          const pts = []; for (let x = 0; x <= 50; x += 0.25) pts.push([P.X(x), P.Y(perf(s, x))]); polyline(g, pts, '#4ade80', 2.5);
          circle(g, P.X(p.x), P.Y(a), 6, '#fbbf24', '#0b1020');
          text(g, `${s.min}`, P.X(s.min), P.Y(0) - 6, { size: 10, align: 'center', color: COLORS.danger }); text(g, `${s.max}`, P.X(s.max), P.Y(0) - 6, { size: 10, align: 'center', color: COLORS.danger });
          text(g, 'thuận lợi', (P.X(s.opt[0]) + P.X(s.opt[1])) / 2, P.Y(1.1), { size: 10, align: 'center', color: '#4ade80' });
          text(g, 'chống chịu', (P.X(s.min) + P.X(s.opt[0])) / 2, P.Y(1.1), { size: 9, align: 'center', color: COLORS.warn });
          text(g, `Giới hạn: ${s.min} – ${s.max} ${s.unit}; thuận lợi ${s.opt[0]} – ${s.opt[1]} ${s.unit}`, px, h - 22, { size: 11, color: COLORS.muted });
        }
      },
      metrics(p) { const s = SPECIES[p.sp]; return [['Giới hạn', `${s.min} – ${s.max} ${s.unit}`], ['Khoảng thuận lợi', `${s.opt[0]} – ${s.opt[1]} ${s.unit}`], ['Mức sống', `${Math.round(perf(s, p.x) * 100)} %`]]; }
    };
  }
};
