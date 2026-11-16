import { COLORS, text, label, circle, line, roundRect, bar, plot, polyline } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'bio-hardy-weinberg',
  subject: 'bio',
  chapter: 'population-genetics',
  title: 'Cân bằng Hardy – Weinberg',
  summary: 'Quần thể ngẫu phối lớn, không chọn lọc, không đột biến, không di nhập: tần số allele p, q và kiểu gene p², 2pq, q² không đổi qua các thế hệ. Bật chọn lọc để thấy cân bằng bị phá vỡ.',
  equation: ['p + q = 1', 'p² (AA) + 2pq (Aa) + q² (aa) = 1', 'Quần thể cân bằng khi tần số kiểu gene đúng bằng p², 2pq, q²'],
  keywords: ['Hardy Weinberg', 'tần số allele', 'tần số kiểu gene', 'ngẫu phối', 'cân bằng di truyền', 'quần thể', 'chọn lọc'],
  theory: [
    '**Quần thể** là tập hợp cá thể cùng loài, cùng sống trong một không gian, có khả năng giao phối sinh ra con hữu thụ. Vốn gene được mô tả bằng **tần số allele** (p, q) và **tần số kiểu gene**.',
    '**Định luật Hardy – Weinberg**: trong quần thể **ngẫu phối**, kích thước lớn, **không** có chọn lọc, đột biến, di – nhập gene, tần số allele và kiểu gene **không đổi** qua các thế hệ, thỏa p² + 2pq + q² = 1. Chỉ sau **một thế hệ ngẫu phối** quần thể đã đạt cân bằng.',
    'Ý nghĩa: từ tỉ lệ kiểu hình lặn (q²) tính được q, p và tỉ lệ dị hợp (người mang gene bệnh). Quần thể tự phối thì tỉ lệ dị hợp giảm dần một nửa mỗi thế hệ.'
  ],
  observe: ['Đặt tần số AA = 0,5, aa = 0,5, Aa = 0: ngay thế hệ sau đạt p² : 2pq : q² = 0,25 : 0,5 : 0,25.', 'Bật chọn lọc chống aa: q giảm dần qua các thế hệ (nhưng allele lặn tồn tại lâu trong dị hợp).', 'Chọn tự phối: dị hợp giảm một nửa mỗi thế hệ.'],
  exam: ['Tính p, q từ tỉ lệ kiểu hình; kiểm tra quần thể có cân bằng không; xác suất sinh con bệnh.', 'Tần số kiểu gene sau n thế hệ tự phối.'],
  params: [
    { key: 'AA', label: 'Tần số AA ban đầu', min: 0, max: 1, step: 0.05, value: 0.5, decimals: 2 },
    { key: 'aa', label: 'Tần số aa ban đầu', min: 0, max: 1, step: 0.05, value: 0.5, decimals: 2, help: 'Aa = 1 − AA − aa (tự tính)' },
    { key: 'mating', label: 'Kiểu giao phối', type: 'select', value: 'random', options: [['random', 'Ngẫu phối'], ['self', 'Tự phối']] },
    { key: 'sel', label: 'Chọn lọc chống aa (hệ số s)', min: 0, max: 1, step: 0.1, value: 0, decimals: 1 }
  ],
  actions: [{ key: 'gen', label: '⏭ Thế hệ tiếp theo' }, { key: 'reset10', label: '⏩ 10 thế hệ' }],
  create(ctx) {
    const st = { gen: 0, hist: [] };
    const init = (p) => { const AA = clamp(p.AA, 0, 1), aa = clamp(p.aa, 0, 1 - AA); st.f = { AA, Aa: 1 - AA - aa, aa }; st.gen = 0; st.hist = [{ ...st.f }]; };
    init(ctx.params);
    const step = (p) => {
      let { AA, Aa, aa } = st.f;
      // chọn lọc trước sinh sản
      const wAA = 1, wAa = 1, waa = 1 - p.sel; const W = AA * wAA + Aa * wAa + aa * waa; AA = AA * wAA / W; Aa = Aa * wAa / W; aa = aa * waa / W;
      if (p.mating === 'random') { const pA = AA + Aa / 2, q = 1 - pA; st.f = { AA: pA * pA, Aa: 2 * pA * q, aa: q * q }; }
      else st.f = { AA: AA + Aa / 4, Aa: Aa / 2, aa: aa + Aa / 4 };
      st.gen++; st.hist.push({ ...st.f }); if (st.hist.length > 60) st.hist.shift();
    };
    return {
      onParam(k, p) { if (k === 'AA' || k === 'aa') init(p); },
      action(key, p) { if (key === 'gen') step(p); if (key === 'reset10') for (let i = 0; i < 10; i++) step(p); },
      update() {},
      draw(g, w, h, p) {
        const f = st.f; const pA = f.AA + f.Aa / 2, q = 1 - pA;
        const eq = Math.abs(f.AA - pA * pA) < 0.005 && Math.abs(f.aa - q * q) < 0.005;
        text(g, `Thế hệ ${st.gen}`, 30, 36, { size: 14, weight: '700' });
        // quần thể: 200 cá thể
        const bx = 30, by = 60, bw = Math.min(360, w * 0.42), bh = 200;
        g.fillStyle = 'rgba(30,41,59,0.5)'; roundRect(g, bx, by, bw, bh, 10); g.fill();
        const N = 200, cols = 20; const nAA = Math.round(f.AA * N), nAa = Math.round(f.Aa * N);
        for (let i = 0; i < N; i++) { const x = bx + 12 + (i % cols) * (bw - 24) / (cols - 1), y = by + 12 + Math.floor(i / cols) * (bh - 24) / 9; const col = i < nAA ? '#f87171' : i < nAA + nAa ? '#fb923c' : '#60a5fa'; circle(g, x, y, 5, col); }
        text(g, '● AA   ● Aa   ● aa', bx, by + bh + 18, { size: 11, color: COLORS.muted });
        // thanh tần số
        const rx = bx, ry = by + bh + 40, rw = bw;
        [['AA', f.AA, '#f87171', pA * pA], ['Aa', f.Aa, '#fb923c', 2 * pA * q], ['aa', f.aa, '#60a5fa', q * q]].forEach((r, i) => { const y = ry + i * 34; bar(g, rx, y + 8, rw, 10, r[1], r[2], `${r[0]} = ${r[1].toFixed(3)}  (H–W kì vọng ${r[3].toFixed(3)})`); });
        label(g, eq ? 'Quần thể CÂN BẰNG Hardy–Weinberg' : 'Chưa cân bằng', rx + rw / 2, ry + 110, { size: 11.5, color: eq ? '#4ade80' : '#fbbf24' });
        // đồ thị tần số allele theo thế hệ
        const px = bx + bw + 60, py = 60, pw = w - px - 30, ph = h - py - 70;
        if (pw > 150) {
          const n = Math.max(10, st.hist.length);
          const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: n - 1, ymin: 0, ymax: 1, xlabel: 'thế hệ', ylabel: 'tần số', title: 'Tần số allele và kiểu gene theo thế hệ' });
          const g0 = Math.max(0, st.gen - st.hist.length + 1);
          const series = [['p (A)', (r) => r.AA + r.Aa / 2, '#4ade80'], ['q (a)', (r) => r.aa + r.Aa / 2, '#a78bfa'], ['AA', (r) => r.AA, '#f87171'], ['Aa', (r) => r.Aa, '#fb923c'], ['aa', (r) => r.aa, '#60a5fa']];
          series.forEach(([nm, fn, col], i) => { polyline(g, st.hist.map((r, k) => [P.X(k), P.Y(fn(r))]), col, nm.startsWith('p') || nm.startsWith('q') ? 2.5 : 1.5); text(g, nm, px + pw - 8, py + 20 + i * 14, { size: 10, align: 'right', color: col }); });
          void g0;
          text(g, `p = ${pA.toFixed(3)}, q = ${q.toFixed(3)}  →  p² = ${(pA * pA).toFixed(3)}, 2pq = ${(2 * pA * q).toFixed(3)}, q² = ${(q * q).toFixed(3)}`, px, h - 22, { size: 11.5, color: COLORS.muted });
        }
      },
      metrics(p) { const f = st.f; const pA = f.AA + f.Aa / 2; return [['Thế hệ', st.gen], ['p (A)', pA, 3], ['q (a)', 1 - pA, 3], ['AA / Aa / aa', `${f.AA.toFixed(3)} / ${f.Aa.toFixed(3)} / ${f.aa.toFixed(3)}`]]; }
    };
  }
};
