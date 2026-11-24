import { COLORS, text, label, circle, roundRect, plot, polyline, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'bio-population-growth',
  subject: 'bio',
  chapter: 'ecology',
  title: 'Tăng trưởng quần thể: hình chữ J và chữ S',
  summary: 'Quần thể trong môi trường không giới hạn tăng theo hàm mũ (chữ J); khi có sức chứa K của môi trường, tăng trưởng chậm lại và ổn định quanh K (chữ S).',
  equation: ['Không giới hạn: dN/dt = r·N  →  N = N0·e^(rt)', 'Có giới hạn (logistic): dN/dt = r·N·(1 − N/K)', 'r = tỉ lệ sinh − tỉ lệ tử (+ nhập cư − xuất cư)'],
  keywords: ['tăng trưởng quần thể', 'kích thước quần thể', 'sức chứa môi trường', 'hàm mũ', 'logistic', 'chữ J', 'chữ S', 'mật độ'],
  theory: [
    'Kích thước quần thể thay đổi do **sinh sản, tử vong, nhập cư, xuất cư**. Trong điều kiện **môi trường không bị giới hạn** (thức ăn, nơi ở dồi dào, không kẻ thù), quần thể tăng theo **hàm mũ – đường cong chữ J**, chỉ xảy ra ngắn hạn (vi khuẩn, loài xâm lấn).',
    'Thực tế, môi trường có **sức chứa K**: khi N tăng, cạnh tranh, bệnh tật, kẻ thù tăng → tỉ lệ sinh giảm, tử tăng → tăng trưởng chậm dần và **ổn định quanh K** – đường cong **chữ S** (logistic). Tốc độ tăng lớn nhất khi N = K/2.',
    'Ý nghĩa: quản lí khai thác bền vững (giữ N ≈ K/2 để tái sinh nhanh nhất), kiểm soát dịch hại, dự báo dân số.'
  ],
  observe: ['Chọn "không giới hạn" để xem bùng nổ hàm mũ.', 'Tăng r: đạt K nhanh hơn; giảm K: đường cong "phẳng" sớm hơn.', 'Bắt đầu N0 > K: quần thể giảm về K.'],
  exam: ['Phân biệt hai kiểu tăng trưởng và điều kiện; đọc đồ thị, xác định K.', 'Tính kích thước quần thể sau t khi biết r (tăng trưởng mũ).'],
  quiz: {
    question: 'Quần thể bắt đầu với 20 cá thể trong môi trường có sức chứa K = 500. Theo thời gian, số lượng cá thể sẽ thế nào?',
    options: ['Tăng mãi theo hàm mũ (đường cong chữ J)', 'Tăng tới 500 rồi giảm về 0', 'Tăng nhanh rồi chậm dần, ổn định quanh 500 (đường cong chữ S)', 'Giữ nguyên khoảng 20'],
    answer: 2,
    explanation: 'Khi số lượng tăng, cạnh tranh về thức ăn và nơi ở tăng, tỉ lệ sinh giảm và tỉ lệ tử tăng, nên tăng trưởng chậm dần và ổn định quanh sức chứa K: đường cong chữ S (logistic).'
  },
  params: [
    { key: 'mode', label: 'Môi trường', type: 'select', value: 'logistic', options: [['logistic', 'Có giới hạn (sức chứa K)'], ['exp', 'Không giới hạn']] },
    { key: 'r', label: 'Tốc độ tăng trưởng r', min: 0.05, max: 1, step: 0.05, value: 0.3, decimals: 2 },
    { key: 'K', label: 'Sức chứa K', min: 100, max: 1000, step: 50, value: 500 },
    { key: 'N0', label: 'Kích thước ban đầu N0', min: 5, max: 800, step: 5, value: 20 }
  ],
  create(ctx) {
    const st = { N: ctx.params.N0, t: 0, hist: [[0, ctx.params.N0]] };
    return {
      onParam(k, p) { if (k === 'N0' || k === 'mode') { st.N = p.N0; st.t = 0; st.hist = [[0, p.N0]]; } },
      update(dt, p) {
        const h = dt * 2; // 1 s thực = 2 đơn vị thời gian
        const f = (N) => p.mode === 'exp' ? p.r * N : p.r * N * (1 - N / p.K);
        const k1 = f(st.N), k2 = f(st.N + h / 2 * k1), k3 = f(st.N + h / 2 * k2), k4 = f(st.N + h * k3);
        st.N = clamp(st.N + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4), 0, 5000);
        st.t += h;
        if (st.t - st.hist[st.hist.length - 1][0] > 0.2) st.hist.push([st.t, st.N]);
        if (st.t > 60) { st.N = p.N0; st.t = 0; st.hist = [[0, p.N0]]; }
      },
      draw(g, w, h, p) {
        // cảnh: cá thể trong ô
        const bx = 30, by = 60, bw = Math.min(300, w * 0.36), bh = 240;
        g.fillStyle = 'rgba(74,222,128,0.08)'; roundRect(g, bx, by, bw, bh, 10); g.fill(); g.strokeStyle = 'rgba(74,222,128,0.4)'; g.lineWidth = 2; g.stroke();
        const shown = Math.min(400, Math.round(st.N));
        for (let i = 0; i < shown; i++) { const sx = ((i * 7919) % 1000) / 1000, sy = ((i * 104729) % 1000) / 1000; circle(g, bx + 8 + sx * (bw - 16), by + 8 + sy * (bh - 16), 3, '#4ade80'); }
        label(g, `N = ${Math.round(st.N)} cá thể`, bx + bw / 2, by - 14, { size: 11.5 });
        if (p.mode === 'logistic') bar(g, bx, by + bh + 24, bw, 10, st.N / p.K, st.N > p.K ? '#f87171' : '#4ade80', `N/K = ${(st.N / p.K * 100).toFixed(0)}%`);
        const rate = p.mode === 'exp' ? p.r * st.N : p.r * st.N * (1 - st.N / p.K);
        text(g, `dN/dt = ${rate.toFixed(1)} cá thể / đơn vị thời gian`, bx, by + bh + 70, { size: 11.5, color: COLORS.muted });
        if (p.mode === 'logistic') text(g, `tăng nhanh nhất khi N = K/2 = ${p.K / 2}`, bx, by + bh + 92, { size: 11, color: COLORS.muted });
        // đồ thị
        const px = bx + bw + 60, py = 60, pw = w - px - 30, ph = h - py - 70;
        const ymax = p.mode === 'exp' ? Math.max(100, Math.min(5000, Math.ceil(Math.max(st.N * 1.3, p.N0 * 2) / 100) * 100)) : Math.max(p.K * 1.3, p.N0 * 1.2);
        const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: 60, ymin: 0, ymax, xlabel: 'thời gian', ylabel: 'N', title: p.mode === 'exp' ? 'Tăng trưởng không giới hạn (chữ J)' : 'Tăng trưởng có giới hạn (chữ S)' });
        if (p.mode === 'logistic') { polyline(g, [[P.X(0), P.Y(p.K)], [P.X(60), P.Y(p.K)]], 'rgba(251,191,36,0.6)', 1.5); text(g, `K = ${p.K}`, P.X(60) - 6, P.Y(p.K) - 6, { size: 11, align: 'right', color: '#fbbf24' }); polyline(g, [[P.X(0), P.Y(p.K / 2)], [P.X(60), P.Y(p.K / 2)]], 'rgba(148,163,184,0.3)', 1); }
        polyline(g, st.hist.map(([t, N]) => [P.X(t), P.Y(clamp(N, 0, ymax))]), '#4ade80', 2.5);
        circle(g, P.X(st.t), P.Y(clamp(st.N, 0, ymax)), 5, '#4ade80', '#0b1020');
      },
      metrics(p) { const rate = p.mode === 'exp' ? p.r * st.N : p.r * st.N * (1 - st.N / p.K); return [['N hiện tại', Math.round(st.N)], ['dN/dt', rate, 1], ['Thời gian', st.t, 1], p.mode === 'logistic' ? ['N/K', `${(st.N / p.K * 100).toFixed(0)} %`] : ['Thời gian tăng gấp đôi', `${(Math.LN2 / p.r).toFixed(1)}`]]; }
    };
  }
};
