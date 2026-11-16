import { COLORS, text, label, circle, roundRect, plot, polyline } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'bio-predator-prey',
  subject: 'bio',
  chapter: 'ecology',
  title: 'Quan hệ vật ăn thịt – con mồi (thỏ và cáo)',
  summary: 'Số lượng con mồi tăng → vật ăn thịt tăng theo → con mồi giảm → vật ăn thịt giảm: hai quần thể dao động lệch pha, khống chế sinh học lẫn nhau (mô hình Lotka–Volterra).',
  equation: ['Con mồi: dN/dt = a·N − b·N·P', 'Vật ăn thịt: dP/dt = c·N·P − d·P', 'Dao động theo chu kì, đỉnh của vật ăn thịt trễ hơn đỉnh con mồi'],
  keywords: ['vật ăn thịt', 'con mồi', 'Lotka Volterra', 'khống chế sinh học', 'biến động số lượng', 'chu kì', 'quan hệ khác loài', 'cân bằng sinh học'],
  theory: [
    'Trong quần xã, quan hệ **vật ăn thịt – con mồi** là động lực điều chỉnh số lượng cá thể của cả hai loài: con mồi dồi dào → vật ăn thịt sinh sản nhiều → con mồi bị ăn giảm → vật ăn thịt thiếu thức ăn giảm → con mồi phục hồi. Đây là ví dụ của **khống chế sinh học** và **cân bằng sinh học**.',
    'Mô hình Lotka–Volterra cho thấy số lượng hai loài **dao động theo chu kì**, đỉnh của vật ăn thịt **trễ pha** so với con mồi (ví dụ kinh điển: thỏ rừng và linh miêu ở Canada theo số liệu da thú của công ty Hudson Bay).',
    'Ứng dụng: dùng thiên địch trong nông nghiệp (ong mắt đỏ diệt sâu, mèo diệt chuột) thay cho thuốc hóa học.'
  ],
  observe: ['Tăng hiệu quả săn mồi b: biên độ dao động lớn hơn, con mồi có thể gần như cạn kiệt.', 'Nhìn đồ thị pha (N–P): quỹ đạo là vòng kín – dao động bền.', 'Giảm tỉ lệ tử của cáo d: cáo đông hơn, thỏ giảm.'],
  exam: ['Giải thích cơ chế điều chỉnh số lượng cá thể của quần thể; khống chế sinh học.', 'Đọc đồ thị biến động số lượng của hai loài và xác định mối quan hệ.'],
  params: [
    { key: 'a', label: 'Tỉ lệ sinh của thỏ (a)', min: 0.2, max: 1.5, step: 0.1, value: 0.8, decimals: 1 },
    { key: 'b', label: 'Hiệu quả săn mồi (b)', min: 0.005, max: 0.05, step: 0.005, value: 0.02, decimals: 3 },
    { key: 'c', label: 'Chuyển hóa thành cáo con (c)', min: 0.002, max: 0.02, step: 0.001, value: 0.008, decimals: 3 },
    { key: 'd', label: 'Tỉ lệ tử của cáo (d)', min: 0.1, max: 1, step: 0.05, value: 0.4, decimals: 2 }
  ],
  create() {
    const st = { N: 80, P: 20, t: 0, hist: [] };
    return {
      update(dt, p) {
        const h = dt * 1.5;
        const f = (N, P) => [p.a * N - p.b * N * P, p.c * N * P - p.d * P];
        const [k1n, k1p] = f(st.N, st.P), [k2n, k2p] = f(st.N + h / 2 * k1n, st.P + h / 2 * k1p), [k3n, k3p] = f(st.N + h / 2 * k2n, st.P + h / 2 * k2p), [k4n, k4p] = f(st.N + h * k3n, st.P + h * k3p);
        st.N = clamp(st.N + h / 6 * (k1n + 2 * k2n + 2 * k3n + k4n), 0.5, 2000); st.P = clamp(st.P + h / 6 * (k1p + 2 * k2p + 2 * k3p + k4p), 0.5, 1000);
        st.t += h;
        if (!st.hist.length || st.t - st.hist[st.hist.length - 1][0] > 0.1) { st.hist.push([st.t, st.N, st.P]); if (st.hist.length > 600) st.hist.shift(); }
      },
      draw(g, w, h, p) {
        // cảnh đồng cỏ
        const bx = 30, by = 60, bw = Math.min(300, w * 0.34), bh = 200;
        g.fillStyle = 'rgba(74,222,128,0.1)'; roundRect(g, bx, by, bw, bh, 10); g.fill();
        const nR = Math.min(150, Math.round(st.N / 2)), nF = Math.min(60, Math.round(st.P / 2));
        for (let i = 0; i < nR; i++) { const sx = ((i * 7919) % 1000) / 1000, sy = ((i * 104729) % 1000) / 1000; text(g, '🐇', bx + 6 + sx * (bw - 20), by + 14 + sy * (bh - 20), { size: 11 }); }
        for (let i = 0; i < nF; i++) { const sx = ((i * 3571 + 500) % 1000) / 1000, sy = ((i * 6007 + 300) % 1000) / 1000; text(g, '🦊', bx + 6 + sx * (bw - 20), by + 14 + sy * (bh - 20), { size: 13 }); }
        label(g, `thỏ: ${Math.round(st.N)}   cáo: ${Math.round(st.P)}`, bx + bw / 2, by - 14, { size: 11.5 });
        // đồ thị pha
        const ppx = bx, ppy = by + bh + 50, ppw = bw, pph = h - ppy - 40;
        if (pph > 80) {
          const Nmax = Math.max(200, ...st.hist.map((r) => r[1])) * 1.1, Pmax = Math.max(60, ...st.hist.map((r) => r[2])) * 1.1;
          const P = plot(g, ppx, ppy, ppw, pph, { xmin: 0, xmax: Nmax, ymin: 0, ymax: Pmax, xlabel: 'thỏ', ylabel: 'cáo', title: 'Đồ thị pha' });
          polyline(g, st.hist.map((r) => [P.X(r[1]), P.Y(r[2])]), 'rgba(251,191,36,0.8)', 1.5);
          circle(g, P.X(st.N), P.Y(st.P), 4, '#fbbf24');
          circle(g, P.X(p.d / p.c), P.Y(p.a / p.b), 4, null, '#fff');
        }
        // đồ thị thời gian
        const px = bx + bw + 50, py = 60, pw = w - px - 30, ph = h - py - 70;
        const t0 = st.hist.length ? st.hist[0][0] : 0, t1 = Math.max(t0 + 20, st.t);
        const ymax = Math.max(200, ...st.hist.map((r) => Math.max(r[1], r[2]))) * 1.1;
        const P = plot(g, px, py, pw, ph, { xmin: t0, xmax: t1, ymin: 0, ymax, xlabel: 'thời gian', ylabel: 'số lượng', title: 'Biến động số lượng theo thời gian' });
        polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(r[1])]), '#4ade80', 2.5);
        polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(r[2])]), '#f97316', 2.5);
        text(g, '— thỏ (con mồi)', px + pw - 8, py + 20, { size: 11, align: 'right', color: '#4ade80' }); text(g, '— cáo (vật ăn thịt)', px + pw - 8, py + 36, { size: 11, align: 'right', color: '#f97316' });
        text(g, `Điểm cân bằng: thỏ = d/c = ${(p.d / p.c).toFixed(0)}, cáo = a/b = ${(p.a / p.b).toFixed(0)}`, px, h - 22, { size: 11.5, color: COLORS.muted });
      },
      metrics(p) { return [['Thỏ', Math.round(st.N)], ['Cáo', Math.round(st.P)], ['Thỏ cân bằng (d/c)', p.d / p.c, 0], ['Cáo cân bằng (a/b)', p.a / p.b, 0]]; }
    };
  }
};
