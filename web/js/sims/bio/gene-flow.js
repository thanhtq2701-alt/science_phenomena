import { COLORS, text, label, circle, roundRect, arrow, plot, polyline } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'bio-gene-flow',
  subject: 'bio',
  chapter: 'population-genetics',
  title: 'Các nhân tố làm thay đổi vốn gene: di – nhập gene, đột biến, giao phối không ngẫu nhiên',
  summary: 'Hai quần thể đất liền và đảo có tần số allele khác nhau. Bật dòng di cư để thấy tần số đảo tiến dần về đất liền; thêm đột biến hoặc giao phối gần để so sánh tác động lên tần số allele và tỉ lệ dị hợp.',
  equation: ['Di – nhập gene: p\' = (1 − m)·p + m·P  (m: tỉ lệ cá thể nhập cư mỗi thế hệ)', 'Đột biến A → a với tốc độ u: p\' = p·(1 − u)', 'Giao phối gần: tần số allele không đổi, dị hợp giảm, đồng hợp tăng'],
  keywords: ['di nhập gene', 'dòng gene', 'đột biến', 'giao phối không ngẫu nhiên', 'giao phối gần', 'nhân tố tiến hóa', 'vốn gene', 'tần số allele'],
  theory: [
    '**Di – nhập gene** (dòng gene) là sự trao đổi cá thể hoặc giao tử giữa các quần thể. Nó có thể **mang allele mới** vào quần thể hoặc làm tần số allele thay đổi; về lâu dài làm **giảm sự khác biệt** vốn gene giữa các quần thể.',
    '**Đột biến** tạo nguồn biến dị sơ cấp nhưng tần số rất thấp (10⁻⁶ – 10⁻⁴) nên làm tần số allele thay đổi **rất chậm**.',
    '**Giao phối không ngẫu nhiên** (tự phối, giao phối gần, giao phối có chọn lọc) **không làm đổi tần số allele** nhưng làm thay đổi **thành phần kiểu gene**: tăng đồng hợp, giảm dị hợp, có thể làm lộ allele lặn có hại (thoái hóa giống).'
  ],
  observe: ['m = 0,1: chỉ sau ~30 thế hệ tần số đảo gần bằng đất liền.', 'Chỉ bật đột biến (u = 10⁻⁴): đường gần như nằm ngang.', 'Giao phối gần: đường p không đổi nhưng thanh dị hợp tụt xuống.'],
  exam: ['So sánh vai trò của các nhân tố tiến hóa; nhân tố nào thay đổi tần số allele, nhân tố nào chỉ đổi thành phần kiểu gene.', 'Tính tần số allele sau di nhập gene.'],
  params: [
    { key: 'm', label: 'Tỉ lệ nhập cư m', min: 0, max: 0.3, step: 0.01, value: 0.05, decimals: 2 },
    { key: 'u', label: 'Tốc độ đột biến A → a', type: 'select', value: 0, options: [[0, 'không'], [0.0001, '10⁻⁴ (thực tế)'], [0.01, '10⁻² (phóng đại)']] },
    { key: 'F', label: 'Hệ số giao phối gần F', min: 0, max: 1, step: 0.1, value: 0, decimals: 1 },
    { key: 'speed', label: 'Thế hệ / giây', min: 1, max: 20, step: 1, value: 5 }
  ],
  actions: [{ key: 'reset', label: '🔄 Đặt lại' }],
  create() {
    const P_MAIN = 0.8;
    const st = { p: 0.2, gen: 0, hist: [[0, 0.2]], timer: 0 };
    return {
      action(key) { if (key === 'reset') { st.p = 0.2; st.gen = 0; st.hist = [[0, 0.2]]; } },
      update(dt, p) {
        st.timer += dt * p.speed;
        while (st.timer >= 1) { st.timer -= 1; st.p = (1 - p.m) * st.p + p.m * P_MAIN; st.p = st.p * (1 - Number(p.u)); st.gen++; st.hist.push([st.gen, st.p]); if (st.hist.length > 200) st.hist.shift(); }
      },
      draw(g, w, h, p, t) {
        const q = 1 - st.p;
        const het = 2 * st.p * q * (1 - p.F), AA = st.p * st.p + p.F * st.p * q, aa = q * q + p.F * st.p * q;
        // bản đồ
        const mx = 30, my = 50;
        g.fillStyle = 'rgba(74,222,128,0.18)'; roundRect(g, mx, my, 180, 160, 14); g.fill(); text(g, 'Đất liền: p = 0,8', mx + 90, my + 176, { size: 11, align: 'center', color: COLORS.muted });
        g.fillStyle = 'rgba(56,189,248,0.15)'; g.fillRect(mx + 180, my, 80, 160);
        g.fillStyle = 'rgba(74,222,128,0.18)'; roundRect(g, mx + 260, my + 30, 120, 100, 30); g.fill(); text(g, `Đảo: p = ${st.p.toFixed(3)}`, mx + 320, my + 150, { size: 11, align: 'center', color: COLORS.text });
        for (let i = 0; i < 24; i++) { const x = mx + 20 + (i % 6) * 26, y = my + 20 + Math.floor(i / 6) * 32; circle(g, x, y, 6, i < 19 ? '#f87171' : '#60a5fa'); }
        const nA = Math.round(st.p * 15); for (let i = 0; i < 15; i++) { const x = mx + 280 + (i % 5) * 20, y = my + 52 + Math.floor(i / 5) * 24; circle(g, x, y, 6, i < nA ? '#f87171' : '#60a5fa'); }
        if (p.m > 0) { const u = (t * 0.5) % 1; circle(g, mx + 170 + u * 110, my + 80, 6, '#f87171'); arrow(g, mx + 175, my + 64, mx + 265, my + 64, 'rgba(251,191,36,0.7)', 2); text(g, `di cư m = ${p.m}`, mx + 220, my + 56, { size: 10, align: 'center', color: '#fbbf24' }); }
        text(g, '● allele A   ● allele a', mx, my + 200, { size: 10.5, color: COLORS.muted });
        // thành phần kiểu gene
        const bx = mx, by = my + 230, bw = 380;
        [['AA', AA, '#f87171'], ['Aa', het, '#fb923c'], ['aa', aa, '#60a5fa']].reduce((x0, [nm, v, c]) => { g.fillStyle = c; g.fillRect(x0, by, bw * v, 26); if (v > 0.06) text(g, `${nm} ${v.toFixed(2)}`, x0 + bw * v / 2, by + 17, { size: 10, align: 'center', color: '#0b1020', weight: '800' }); return x0 + bw * v; }, bx);
        text(g, `Thành phần kiểu gene ở đảo (F = ${p.F}: dị hợp giảm ${Math.round(p.F * 100)}% so với H–W)`, bx, by + 46, { size: 10.5, color: COLORS.muted });
        // đồ thị
        const px = mx + 420, pw = w - px - 30, ph = h - 130;
        if (pw > 160) {
          const g0 = st.hist[0][0];
          const P = plot(g, px, 50, pw, ph, { xmin: g0, xmax: Math.max(g0 + 40, st.gen), ymin: 0, ymax: 1, xlabel: 'thế hệ', ylabel: 'p (A) ở đảo', title: 'Tần số allele A ở đảo' });
          polyline(g, [[P.X(g0), P.Y(P_MAIN)], [P.X(Math.max(g0 + 40, st.gen)), P.Y(P_MAIN)]], 'rgba(74,222,128,0.4)', 1.5);
          polyline(g, st.hist.map(([x, y]) => [P.X(x), P.Y(y)]), '#f87171', 2.5);
          text(g, p.m > 0 ? 'Dòng gene kéo p về giá trị của đất liền' : Number(p.u) > 0 ? 'Đột biến làm p giảm rất chậm' : 'Không có nhân tố làm đổi tần số allele', px, h - 22, { size: 11, color: COLORS.muted });
        }
      },
      metrics(p) { const q = 1 - st.p; return [['Thế hệ', st.gen], ['p (A) ở đảo', st.p, 3], ['Dị hợp Aa', 2 * st.p * q * (1 - p.F), 3]]; }
    };
  }
};
