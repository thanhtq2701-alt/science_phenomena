import { COLORS, text, label, circle, roundRect, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const AGE = {
  growing: { name: 'Quần thể đang phát triển', ratio: [0.45, 0.4, 0.15], note: 'Đáy tháp rộng: nhóm trước sinh sản đông → kích thước sẽ tăng.' },
  stable: { name: 'Quần thể ổn định', ratio: [0.33, 0.42, 0.25], note: 'Nhóm trước sinh sản ≈ nhóm đang sinh sản → kích thước ổn định.' },
  declining: { name: 'Quần thể suy thoái', ratio: [0.18, 0.42, 0.4], note: 'Đáy tháp hẹp: ít con non → kích thước sẽ giảm (khai thác quá mức, già hóa).' }
};

export default {
  id: 'bio-population-traits',
  subject: 'bio',
  chapter: 'ecology',
  title: 'Đặc trưng cơ bản của quần thể: mật độ, phân bố, cấu trúc tuổi, tỉ lệ giới tính',
  summary: 'Đặt cá thể vào ô quan sát để xem ba kiểu phân bố (theo nhóm, đồng đều, ngẫu nhiên), tính mật độ, và đọc tháp tuổi của quần thể đang phát triển, ổn định hay suy thoái.',
  equation: ['Mật độ = số cá thể / diện tích (hoặc thể tích)', 'Tháp tuổi: trước sinh sản – đang sinh sản – sau sinh sản', 'Phân bố: theo nhóm (phổ biến nhất), đồng đều (cạnh tranh gay gắt), ngẫu nhiên (môi trường đồng nhất)'],
  keywords: ['đặc trưng quần thể', 'mật độ', 'kiểu phân bố', 'tháp tuổi', 'cấu trúc tuổi', 'tỉ lệ giới tính', 'kích thước quần thể'],
  theory: [
    '**Mật độ cá thể** là số cá thể trên một đơn vị diện tích/thể tích; là đặc trưng quan trọng nhất vì ảnh hưởng tới mức sử dụng nguồn sống, tần số gặp nhau giữa đực và cái, sinh sản và tử vong.',
    '**Kiểu phân bố**: **theo nhóm** (phổ biến nhất, nguồn sống tập trung, hỗ trợ nhau – đàn trâu, bụi tre); **đồng đều** (nguồn sống phân bố đều, cạnh tranh gay gắt – chim cánh cụt làm tổ, cây thông); **ngẫu nhiên** (nguồn sống đều, không cạnh tranh gay gắt – sâu trên tán cây).',
    '**Cấu trúc tuổi** biểu diễn bằng **tháp tuổi**, cho biết xu hướng phát triển của quần thể. **Tỉ lệ giới tính** thay đổi theo loài, mùa, điều kiện sống (vd muỗi đực/cái, rùa phụ thuộc nhiệt độ ấp trứng).'
  ],
  observe: ['Đổi kiểu phân bố và đếm số cá thể trong ô quan sát ở vị trí khác nhau: phân bố nhóm cho số đếm dao động lớn nhất.', 'So sánh ba dạng tháp tuổi.'],
  exam: ['Nêu ý nghĩa sinh thái của các kiểu phân bố; tính mật độ.', 'Đọc tháp tuổi và dự đoán xu hướng biến động kích thước quần thể.'],
  params: [
    { key: 'dist', label: 'Kiểu phân bố', type: 'select', value: 'clumped', options: [['clumped', 'Theo nhóm'], ['uniform', 'Đồng đều'], ['random', 'Ngẫu nhiên']] },
    { key: 'N', label: 'Số cá thể', min: 20, max: 200, step: 10, value: 100 },
    { key: 'age', label: 'Cấu trúc tuổi', type: 'select', value: 'growing', options: Object.entries(AGE).map(([k, v]) => [k, v.name]) },
    { key: 'sex', label: 'Tỉ lệ đực', min: 0.2, max: 0.8, step: 0.05, value: 0.5, decimals: 2 }
  ],
  create(ctx) {
    const st = { pts: [], qx: 0.3, qy: 0.3 };
    const gen = (p) => {
      st.pts = [];
      const rnd = mulberry(42 + p.N + p.dist.length);
      if (p.dist === 'uniform') { const n = Math.ceil(Math.sqrt(p.N)); for (let i = 0; i < p.N; i++) st.pts.push([(i % n + 0.5) / n + (rnd() - 0.5) * 0.02, (Math.floor(i / n) + 0.5) / n + (rnd() - 0.5) * 0.02, rnd() < p.sex]); }
      else if (p.dist === 'random') for (let i = 0; i < p.N; i++) st.pts.push([rnd(), rnd(), rnd() < p.sex]);
      else { const centers = Array.from({ length: 5 }, () => [0.15 + rnd() * 0.7, 0.15 + rnd() * 0.7]); for (let i = 0; i < p.N; i++) { const c = centers[i % 5]; st.pts.push([clamp(c[0] + (rnd() - 0.5) * 0.18, 0, 1), clamp(c[1] + (rnd() - 0.5) * 0.18, 0, 1), rnd() < p.sex]); } }
    };
    gen(ctx.params);
    return {
      onParam(k, p) { if (k !== 'age') gen(p); },
      update(dt, p, t) { st.qx = 0.5 + 0.35 * Math.sin(t * 0.3); st.qy = 0.5 + 0.35 * Math.cos(t * 0.23); },
      draw(g, w, h, p) {
        const bx = 30, by = 50, bs = Math.min(h - 110, w * 0.42);
        g.fillStyle = 'rgba(74,222,128,0.08)'; roundRect(g, bx, by, bs, bs, 8); g.fill();
        const q = 0.2; const qx = bx + (st.qx - q / 2) * bs, qy = by + (st.qy - q / 2) * bs;
        let inQ = 0;
        for (const [x, y, male] of st.pts) { const X = bx + x * bs, Y = by + y * bs; const inside = X >= qx && X <= qx + q * bs && Y >= qy && Y <= qy + q * bs; if (inside) inQ++; circle(g, X, Y, 4, male ? '#60a5fa' : '#f472b6'); }
        g.strokeStyle = '#fbbf24'; g.lineWidth = 2; g.strokeRect(qx, qy, q * bs, q * bs);
        label(g, `ô quan sát 20×20 m: ${inQ} cá thể → mật độ ${(inQ / 400 * 10000).toFixed(0)} cá thể/ha`, bx + bs / 2, by + bs + 18, { size: 10.5 });
        text(g, `Diện tích 100×100 m – mật độ trung bình ${p.N} cá thể/ha`, bx, by - 12, { size: 11, color: COLORS.muted });
        // tháp tuổi
        const A = AGE[p.age];
        const rx = bx + bs + 50, rw = w - rx - 30;
        if (rw > 200) {
          text(g, `Tháp tuổi: ${A.name}`, rx, 60, { size: 13, weight: '700' });
          const labels = ['Trước sinh sản', 'Đang sinh sản', 'Sau sinh sản'];
          const maxW = rw * 0.9, cxp = rx + rw / 2;
          [0, 1, 2].forEach((i) => { const r = A.ratio[i]; const y = 200 - i * 50; const wd = maxW * r / 0.5; g.fillStyle = ['#4ade80', '#fbbf24', '#94a3b8'][i]; g.fillRect(cxp - wd / 2, y, wd, 42); text(g, `${labels[i]} ${Math.round(r * 100)}%`, cxp, y + 26, { size: 11, align: 'center', color: '#0b1020', weight: '800' }); });
          wrap(g, A.note, rx, 270, rw, 11.5, COLORS.muted);
          bar(g, rx, 330, rw, 10, p.sex, '#60a5fa', `Tỉ lệ giới tính: đực ${Math.round(p.sex * 100)}% : cái ${Math.round((1 - p.sex) * 100)}%`);
          const distNote = { clumped: 'Theo nhóm: nguồn sống tập trung, cá thể hỗ trợ nhau.', uniform: 'Đồng đều: cạnh tranh gay gắt, giảm cạnh tranh.', random: 'Ngẫu nhiên: tận dụng nguồn sống tiềm tàng.' }[p.dist];
          text(g, distNote, rx, 372, { size: 11.5, color: COLORS.warn });
        }
      },
      metrics(p) { return [['Mật độ', `${p.N} cá thể/ha`], ['Kiểu phân bố', { clumped: 'theo nhóm', uniform: 'đồng đều', random: 'ngẫu nhiên' }[p.dist]], ['Xu hướng', { growing: 'tăng', stable: 'ổn định', declining: 'giảm' }[p.age]]]; }
    };
  }
};
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function wrap(g, str, x, y, maxW, size, color) { g.font = `500 ${size}px Inter, system-ui, sans-serif`; const words = str.split(' '); let line = '', yy = y; for (const wd of words) { const tt = line + wd + ' '; if (g.measureText(tt).width > maxW && line) { text(g, line, x, yy, { size, color }); line = wd + ' '; yy += size + 6; } else line = tt; } text(g, line, x, yy, { size, color }); }
