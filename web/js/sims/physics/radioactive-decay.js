import { COLORS, text, label, circle, plot, polyline, roundRect, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const ISO = {
  'C-14': { T: 5730, unit: 'năm', mode: 'β⁻', daughter: 'N-14', eq: '¹⁴C → ¹⁴N + e⁻ + ν̄' },
  'I-131': { T: 8.02, unit: 'ngày', mode: 'β⁻', daughter: 'Xe-131', eq: '¹³¹I → ¹³¹Xe + e⁻ + ν̄' },
  'Ra-226': { T: 1600, unit: 'năm', mode: 'α', daughter: 'Rn-222', eq: '²²⁶Ra → ²²²Rn + ⁴He' },
  'U-238': { T: 4.47e9, unit: 'năm', mode: 'α', daughter: 'Th-234', eq: '²³⁸U → ²³⁴Th + ⁴He' },
  'Co-60': { T: 5.27, unit: 'năm', mode: 'β⁻, γ', daughter: 'Ni-60', eq: '⁶⁰Co → ⁶⁰Ni + e⁻ + ν̄ + γ' }
};

export default {
  id: 'physics-radioactive-decay',
  subject: 'physics',
  chapter: 'nuclear',
  title: 'Phóng xạ và chu kì bán rã',
  summary: 'Mỗi hạt nhân phân rã ngẫu nhiên nhưng cả tập hợp tuân theo quy luật: sau mỗi chu kì bán rã T, số hạt nhân còn lại giảm một nửa. Đếm hạt và so với đường N = N0·2^(−t/T).',
  equation: ['N = N0 · 2^(−t/T) = N0 · e^(−λt)', 'λ = ln2 / T', 'Độ phóng xạ H = λ·N'],
  keywords: ['phóng xạ', 'chu kì bán rã', 'hằng số phóng xạ', 'alpha', 'beta', 'gamma', 'carbon 14'],
  theory: [
    '**Phóng xạ** là quá trình hạt nhân không bền **tự phát** phân rã thành hạt nhân khác kèm theo tia α, β hoặc γ. Quá trình **ngẫu nhiên**: không thể biết hạt nhân nào sẽ phân rã lúc nào, nhưng **xác suất phân rã trong một đơn vị thời gian λ** là không đổi.',
    '**Chu kì bán rã T**: thời gian để một nửa số hạt nhân phân rã. Sau t = kT, còn lại N0/2ᵏ. T không phụ thuộc nhiệt độ, áp suất hay trạng thái hóa học.',
    'Ứng dụng: xác định tuổi cổ vật bằng C-14 (T = 5730 năm), điều trị ung thư (Co-60, I-131), đánh dấu phóng xạ trong y học.'
  ],
  observe: ['Với 100 hạt, đường thực tế răng cưa và lệch nhiều so với lí thuyết; với 2000 hạt thì gần khớp – quy luật thống kê.', 'Đổi đồng vị: hình dạng đường cong giống hệt nhau khi đo thời gian theo T.'],
  exam: ['Tính N, m, H còn lại sau t; tính tuổi mẫu vật; tính số hạt nhân con tạo thành.', 'Bài toán tỉ lệ hạt nhân mẹ/con.'],
  params: [
    { key: 'iso', label: 'Đồng vị', type: 'select', value: 'I-131', options: Object.keys(ISO).map((k) => [k, `${k} (T = ${ISO[k].T} ${ISO[k].unit})`]) },
    { key: 'N0', label: 'Số hạt nhân ban đầu', min: 100, max: 2000, step: 100, value: 400 },
    { key: 'rate', label: 'Tốc độ (chu kì / 10 s)', min: 0.2, max: 3, step: 0.1, value: 1, decimals: 1 }
  ],
  create(ctx) {
    const st = { nuclei: [], tT: 0, hist: [[0, 1]], rays: [] };
    const init = (N) => { st.nuclei = []; const cols = Math.ceil(Math.sqrt(N * 1.6)); for (let i = 0; i < N; i++) st.nuclei.push({ i, c: i % cols, r: Math.floor(i / cols), alive: true }); st.cols = cols; st.tT = 0; st.hist = [[0, 1]]; };
    init(ctx.params.N0);
    return {
      onParam(k, p) { init(p.N0); },
      update(dt, p) {
        const dT = dt * p.rate / 10; // thời gian tính theo đơn vị T
        st.tT += dT;
        const prob = 1 - Math.pow(0.5, dT);
        for (const n of st.nuclei) if (n.alive && Math.random() < prob) { n.alive = false; if (st.rays.length < 60) st.rays.push({ c: n.c, r: n.r, a: Math.random() * 6.28, d: 0 }); }
        for (const r of st.rays) r.d += dt * 120;
        st.rays = st.rays.filter((r) => r.d < 60);
        const alive = st.nuclei.filter((n) => n.alive).length;
        if (st.tT - st.hist[st.hist.length - 1][0] > 0.02) st.hist.push([st.tT, alive / p.N0]);
      },
      draw(g, w, h, p) {
        const iso = ISO[p.iso];
        const alive = st.nuclei.filter((n) => n.alive).length;
        // lưới hạt nhân
        const bx = 40, by = 60, bs = Math.min(w * 0.42, h - 110);
        g.fillStyle = 'rgba(30,41,59,0.5)'; roundRect(g, bx, by, bs, bs, 10); g.fill();
        const cell = bs / st.cols;
        const rr = Math.max(1.5, cell * 0.36);
        for (const n of st.nuclei) circle(g, bx + (n.c + 0.5) * cell, by + (n.r + 0.5) * cell, rr, n.alive ? '#f87171' : 'rgba(96,165,250,0.5)');
        for (const r of st.rays) { const x = bx + (r.c + 0.5) * cell + Math.cos(r.a) * r.d, y = by + (r.r + 0.5) * cell + Math.sin(r.a) * r.d; g.globalAlpha = 1 - r.d / 60; circle(g, x, y, 2, iso.mode.startsWith('α') ? '#fbbf24' : '#a3e635'); }
        g.globalAlpha = 1;
        label(g, `${p.iso}: đỏ = chưa phân rã (${alive}), xanh = ${iso.daughter} (${p.N0 - alive})`, bx + bs / 2, by - 14, { size: 10.5 });
        text(g, iso.eq, bx + bs / 2, by + bs + 22, { size: 12, align: 'center', color: COLORS.muted });
        // đồ thị
        const px = bx + bs + 60, py = 60, pw = w - px - 30, ph = h - py - 100;
        if (pw > 150) {
          const tmax = Math.max(4, Math.ceil(st.tT));
          const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: tmax, ymin: 0, ymax: 1, xlabel: 'thời gian (số chu kì T)', ylabel: 'N / N0', title: 'Số hạt nhân còn lại' });
          const th = []; for (let i = 0; i <= 100; i++) { const x = (i / 100) * tmax; th.push([P.X(x), P.Y(Math.pow(0.5, x))]); }
          polyline(g, th, 'rgba(148,163,184,0.5)', 1.5);
          for (let k = 1; k <= tmax; k++) { polyline(g, [[P.X(k), P.Y(0)], [P.X(k), P.Y(Math.pow(0.5, k))], [P.X(0), P.Y(Math.pow(0.5, k))]], 'rgba(251,191,36,0.3)', 1); text(g, `1/${Math.pow(2, k)}`, P.X(0) + 4, P.Y(Math.pow(0.5, k)) - 3, { size: 9, color: COLORS.warn }); }
          polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(r[1])]), '#f87171', 2.5);
          text(g, 'xám: lí thuyết N0·2^(−t/T)   đỏ: mô phỏng ngẫu nhiên', px, py + ph + 44, { size: 10.5, color: COLORS.muted });
          const realT = st.tT * iso.T;
          text(g, `t = ${st.tT.toFixed(2)} T = ${realT < 1000 ? realT.toFixed(1) : realT.toExponential(2)} ${iso.unit}`, px, py + ph + 64, { size: 12 });
        }
      },
      metrics(p) { const iso = ISO[p.iso]; const alive = st.nuclei.filter((n) => n.alive).length; return [['Còn lại N', `${alive} / ${p.N0}`], ['Lí thuyết', `${Math.round(p.N0 * Math.pow(0.5, st.tT))}`], ['t / T', st.tT, 2], ['λ = ln2/T', `${(Math.LN2 / iso.T).toExponential(2)} /${iso.unit}`], ['Loại phóng xạ', iso.mode]]; }
    };
  }
};
