import { COLORS, text, label, circle, line, roundRect, bar, plot, polyline, mixColor } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'bio-natural-selection',
  subject: 'bio',
  chapter: 'evolution',
  title: 'Chọn lọc tự nhiên: bướm đêm và màu nền',
  summary: 'Quần thể bướm có màu sáng/tối trên thân cây; chim săn mồi dễ bắt con nổi bật. Đổi màu nền (ô nhiễm công nghiệp) và xem tần số allele thay đổi qua các thế hệ.',
  equation: ['Chọn lọc tự nhiên tác động lên kiểu hình → làm thay đổi tần số allele theo hướng xác định', 'Giá trị thích nghi w = tỉ lệ sống sót & sinh sản tương đối'],
  keywords: ['chọn lọc tự nhiên', 'Darwin', 'thích nghi', 'bướm đêm', 'Biston betularia', 'tần số allele', 'tiến hóa', 'kiểu hình'],
  theory: [
    'Theo Darwin, các cá thể trong quần thể **biến dị**, biến dị **di truyền** được; trong môi trường, cá thể mang biến dị **thích nghi hơn** sống sót và sinh sản nhiều hơn → **chọn lọc tự nhiên** giữ lại kiểu hình có lợi, đào thải kiểu hình bất lợi.',
    'Thuyết tiến hóa tổng hợp hiện đại: chọn lọc tự nhiên tác động **trực tiếp lên kiểu hình**, gián tiếp làm **thay đổi tần số allele** của quần thể theo một hướng xác định; là nhân tố tiến hóa **có hướng**. Chọn lọc chống allele trội diễn ra nhanh; chống allele lặn chậm vì allele lặn "ẩn" trong dị hợp.',
    'Ví dụ kinh điển: bướm đêm *Biston betularia* ở Anh thời công nghiệp hóa – thân cây đen vì bồ hóng → dạng tối (allele trội) chiếm ưu thế; khi không khí sạch lại, dạng sáng phục hồi.'
  ],
  observe: ['Nền sáng → bướm tối bị bắt nhiều; nền tối → ngược lại.', 'Tăng áp lực săn mồi: tần số allele thay đổi nhanh hơn.', 'Đổi nền giữa chừng để thấy quần thể "quay đầu" sau vài thế hệ.'],
  exam: ['Giải thích vai trò của chọn lọc tự nhiên đối với tần số allele; phân biệt chọn lọc chống allele trội/lặn.', 'Nêu ví dụ thích nghi và cơ chế hình thành đặc điểm thích nghi.'],
  params: [
    { key: 'bg', label: 'Màu nền (thân cây)', min: 0, max: 1, step: 0.05, value: 0.2, decimals: 2, help: '0 = sáng (rừng sạch), 1 = tối (ô nhiễm)' },
    { key: 'pred', label: 'Áp lực săn mồi', min: 0, max: 0.8, step: 0.05, value: 0.4, decimals: 2 },
    { key: 'auto', label: 'Tự động qua thế hệ', type: 'toggle', value: true }
  ],
  actions: [{ key: 'gen', label: '⏭ Thế hệ tiếp' }],
  create() {
    const st = { pop: [], gen: 0, hist: [], timer: 0, eaten: [] };
    const N = 120;
    const spawn = (pD) => { st.pop = []; for (let i = 0; i < N; i++) { const a1 = Math.random() < pD, a2 = Math.random() < pD; st.pop.push({ a: [a1, a2], x: Math.random(), y: Math.random(), alive: true }); } };
    spawn(0.5); st.hist.push(0.5);
    const pDark = () => st.pop.reduce((s, b) => s + (b.a[0] ? 1 : 0) + (b.a[1] ? 1 : 0), 0) / (2 * st.pop.length);
    const nextGen = (p) => {
      // săn mồi: xác suất bị bắt tỉ lệ với độ tương phản
      st.eaten = [];
      for (const b of st.pop) { const dark = b.a[0] || b.a[1]; const contrast = dark ? 1 - p.bg : p.bg; const pr = p.pred * contrast * 2; if (Math.random() < pr) { b.alive = false; st.eaten.push({ x: b.x, y: b.y, t: 1 }); } }
      const survivors = st.pop.filter((b) => b.alive);
      if (survivors.length < 2) { spawn(pDark()); st.gen++; st.hist.push(pDark()); return; }
      const next = [];
      for (let i = 0; i < N; i++) { const m = survivors[Math.floor(Math.random() * survivors.length)], f = survivors[Math.floor(Math.random() * survivors.length)]; next.push({ a: [m.a[Math.floor(Math.random() * 2)], f.a[Math.floor(Math.random() * 2)]], x: Math.random(), y: Math.random(), alive: true }); }
      st.pop = next; st.gen++; st.hist.push(pDark()); if (st.hist.length > 80) st.hist.shift();
    };
    return {
      action(key, p) { if (key === 'gen') nextGen(p); },
      update(dt, p) { if (p.auto) { st.timer += dt; if (st.timer > 1.2) { st.timer = 0; nextGen(p); } } for (const e of st.eaten) e.t -= dt; st.eaten = st.eaten.filter((e) => e.t > 0); },
      draw(g, w, h, p) {
        const bx = 30, by = 60, bw = Math.min(420, w * 0.48), bh = h - 110;
        const bgCol = mixColor('#d6d3d1', '#292524', p.bg);
        g.fillStyle = bgCol; roundRect(g, bx, by, bw, bh, 10); g.fill();
        // vân cây
        g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(bx + 10 + i * bw / 12, by); g.lineTo(bx + 10 + i * bw / 12 + 15, by + bh); g.stroke(); }
        for (const b of st.pop) { const dark = b.a[0] || b.a[1]; moth(g, bx + 15 + b.x * (bw - 30), by + 15 + b.y * (bh - 30), dark ? '#1c1917' : '#e7e5e4'); }
        for (const e of st.eaten) { g.globalAlpha = e.t; text(g, '🐦', bx + 15 + e.x * (bw - 30), by + 15 + e.y * (bh - 30) + 6, { size: 16, align: 'center' }); } g.globalAlpha = 1;
        label(g, `Thế hệ ${st.gen} – nền ${p.bg < 0.4 ? 'sáng' : p.bg > 0.6 ? 'tối' : 'trung gian'}`, bx + bw / 2, by - 14, { size: 11.5 });
        // thống kê
        const pD = pDark(); const nDark = st.pop.filter((b) => b.a[0] || b.a[1]).length;
        const rx = bx + bw + 40, rw = w - rx - 30;
        if (rw > 150) {
          text(g, 'Tần số allele tối (D, trội)', rx, 80, { size: 13, weight: '700' });
          bar(g, rx, 96, rw, 12, pD, '#1c1917', `p(D) = ${pD.toFixed(3)}`); bar(g, rx, 130, rw, 12, 1 - pD, '#e7e5e4', `q(d) = ${(1 - pD).toFixed(3)}`);
          text(g, `Kiểu hình: ${nDark} tối / ${st.pop.length - nDark} sáng`, rx, 170, { size: 11.5, color: COLORS.muted });
          const px = rx, py = 200, pw = rw, ph = h - py - 60;
          const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: Math.max(10, st.hist.length - 1), ymin: 0, ymax: 1, xlabel: 'thế hệ', ylabel: 'p(D)', title: 'Tần số allele qua các thế hệ' });
          polyline(g, st.hist.map((v, i) => [P.X(i), P.Y(v)]), '#4ade80', 2.5);
          text(g, `Độ thích nghi: dạng tối w = ${(1 - p.pred * (1 - p.bg) * 2).toFixed(2)}, dạng sáng w = ${(1 - p.pred * p.bg * 2).toFixed(2)}`, rx, h - 20, { size: 10.5, color: COLORS.muted });
        }
      },
      metrics() { const pD = pDark(); return [['Thế hệ', st.gen], ['p (allele tối D)', pD, 3], ['q (allele sáng d)', 1 - pD, 3], ['Số bướm tối', st.pop.filter((b) => b.a[0] || b.a[1]).length]]; }
    };
  }
};
function moth(g, x, y, color) { g.fillStyle = color; g.beginPath(); g.ellipse(x - 6, y, 7, 4.5, -0.3, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(x + 6, y, 7, 4.5, 0.3, 0, Math.PI * 2); g.fill(); g.fillRect(x - 1.5, y - 5, 3, 10); }
