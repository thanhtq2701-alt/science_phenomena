import { COLORS, text, label, circle, line, roundRect, bar, arrow } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'bio-linkage',
  subject: 'bio',
  chapter: 'mendel',
  title: 'Liên kết gene và hoán vị gene',
  summary: 'Hai gene cùng nằm trên một NST di truyền cùng nhau (liên kết hoàn toàn); trao đổi chéo ở kì đầu I tạo giao tử hoán vị với tần số f phụ thuộc khoảng cách gene.',
  equation: ['Liên kết hoàn toàn: AB/ab → 2 loại giao tử AB = ab = 50%', 'Hoán vị với tần số f: AB = ab = (1 − f)/2 ; Ab = aB = f/2', 'f ≤ 50%;  1% hoán vị = 1 cM (centimorgan)'],
  keywords: ['liên kết gene', 'hoán vị gene', 'trao đổi chéo', 'tần số hoán vị', 'Morgan', 'ruồi giấm', 'bản đồ di truyền', 'centimorgan'],
  theory: [
    'Số gene nhiều hơn số NST nên **mỗi NST mang nhiều gene**; các gene trên cùng một NST tạo thành **nhóm gene liên kết** và có xu hướng **di truyền cùng nhau** (Morgan, ruồi giấm: thân xám cánh dài / thân đen cánh cụt).',
    '**Hoán vị gene** xảy ra khi hai chromatid khác nguồn trong cặp NST kép tương đồng **trao đổi chéo** ở kì đầu giảm phân I → xuất hiện giao tử mang tổ hợp mới (Ab, aB). **Tần số hoán vị f** = tổng tỉ lệ giao tử hoán vị, tỉ lệ với **khoảng cách** giữa hai gene, không vượt quá 50%.',
    'Ý nghĩa: liên kết hoàn toàn giúp duy trì nhóm tính trạng tốt; hoán vị tạo biến dị tổ hợp và cho phép lập **bản đồ di truyền** (1% f = 1 cM).'
  ],
  observe: ['Kéo khoảng cách gene về 0: không có giao tử hoán vị (liên kết hoàn toàn).', 'Tăng khoảng cách tới 50 cM: 4 loại giao tử bằng nhau như phân li độc lập.', 'Bấm "Giảm phân" nhiều lần để thống kê giao tử.'],
  exam: ['Tính tần số hoán vị từ kết quả lai phân tích; viết tỉ lệ giao tử của AB/ab với f cho trước.', 'Xác định khoảng cách gene và trật tự gene trên NST.'],
  params: [
    { key: 'dist', label: 'Khoảng cách giữa 2 gene', min: 0, max: 50, step: 1, value: 20, unit: 'cM' },
    { key: 'phase', label: 'Kiểu gene cá thể', type: 'select', value: 'cis', options: [['cis', 'AB/ab (dị hợp đều)'], ['trans', 'Ab/aB (dị hợp chéo)']] }
  ],
  actions: [{ key: 'meio', label: '🧬 Giảm phân (100 tế bào)' }],
  create() {
    const st = { counts: { AB: 0, ab: 0, Ab: 0, aB: 0 }, total: 0, t: 0, xo: 0 };
    return {
      onParam() { st.counts = { AB: 0, ab: 0, Ab: 0, aB: 0 }; st.total = 0; },
      action(key, p) {
        if (key !== 'meio') return;
        const f = p.dist / 100;
        const parental = p.phase === 'cis' ? ['AB', 'ab'] : ['Ab', 'aB'], rec = p.phase === 'cis' ? ['Ab', 'aB'] : ['AB', 'ab'];
        for (let i = 0; i < 100; i++) { for (let k = 0; k < 4; k++) { const isRec = Math.random() < f; const pool = isRec ? rec : parental; const gm = pool[k % 2]; st.counts[gm]++; st.total++; } }
      },
      update(dt, p) { st.t += dt; st.xo = (st.xo + dt * 0.25) % 1; },
      draw(g, w, h, p) {
        const f = p.dist / 100;
        const cis = p.phase === 'cis';
        const top = cis ? ['A', 'B'] : ['A', 'b'], bot = cis ? ['a', 'b'] : ['a', 'B'];
        // NST kép tương đồng & trao đổi chéo
        const cx = w * 0.27, cy = 200;
        text(g, 'Kì đầu I: cặp NST kép tương đồng', 30, 40, { size: 13, weight: '700' });
        const gap = 70 + p.dist * 2.2; // vị trí gene B tùy khoảng cách
        const u = st.xo;
        const swapped = u > 0.5 && f > 0;
        for (let k = 0; k < 2; k++) { // 2 chromatid của NST 1 (đỏ)
          const x = cx - 40 + k * 14; line(g, x, cy - 90, x, cy + 90, k === 1 && swapped ? '#60a5fa' : '#f87171', 7);
          if (k === 1 && swapped) line(g, x, cy - 90, x, cy + 10, '#f87171', 7);
        }
        for (let k = 0; k < 2; k++) { const x = cx + 26 + k * 14; line(g, x, cy - 90, x, cy + 90, k === 0 && swapped ? '#f87171' : '#60a5fa', 7); if (k === 0 && swapped) line(g, x, cy - 90, x, cy + 10, '#60a5fa', 7); }
        if (f > 0 && u > 0.3 && u < 0.5) { line(g, cx - 26, cy + 10, cx + 26, cy + 10, '#fbbf24', 3); text(g, 'trao đổi chéo', cx, cy + 30, { size: 10, align: 'center', color: '#fbbf24' }); }
        // nhãn gene
        const yA = cy - 60, yB = cy - 60 + Math.min(gap, 120);
        geneTag(g, cx - 40, yA, top[0]); geneTag(g, cx - 26, yA, top[0]); geneTag(g, cx + 26, yA, bot[0]); geneTag(g, cx + 40, yA, bot[0]);
        geneTag(g, cx - 40, yB, top[1]); geneTag(g, cx - 26, yB, swapped ? bot[1] : top[1]); geneTag(g, cx + 26, yB, swapped ? top[1] : bot[1]); geneTag(g, cx + 40, yB, bot[1]);
        text(g, `khoảng cách A–B: ${p.dist} cM`, cx, cy + 112, { size: 11, align: 'center', color: COLORS.muted });
        text(g, f === 0 ? 'liên kết hoàn toàn: không trao đổi chéo' : `xác suất tế bào có trao đổi chéo giữa A–B ≈ ${(2 * f * 100).toFixed(0)}%`, cx, cy + 130, { size: 10.5, align: 'center', color: COLORS.muted });
        // giao tử lí thuyết
        const rx = Math.max(cx + 150, w * 0.5), rw = w - rx - 30;
        text(g, 'Tỉ lệ giao tử', rx, 60, { size: 13, weight: '700' });
        const parental = cis ? ['AB', 'ab'] : ['Ab', 'aB'], rec = cis ? ['Ab', 'aB'] : ['AB', 'ab'];
        const rows = [[parental[0], (1 - f) / 2, 'liên kết', '#4ade80'], [parental[1], (1 - f) / 2, 'liên kết', '#4ade80'], [rec[0], f / 2, 'hoán vị', '#fbbf24'], [rec[1], f / 2, 'hoán vị', '#fbbf24']];
        rows.forEach((r, i) => { const y = 90 + i * 52; text(g, `${r[0]}  (${r[2]})  lí thuyết ${(r[1] * 100).toFixed(1)}%`, rx, y, { size: 11.5 }); bar(g, rx, y + 8, rw, 8, r[1] * 2, 'rgba(148,163,184,0.5)'); const ex = st.total ? st.counts[r[0]] / st.total : 0; bar(g, rx, y + 20, rw, 8, ex * 2, r[3]); text(g, st.total ? `thực nghiệm ${(ex * 100).toFixed(1)}%` : '', rx + rw, y, { size: 10.5, align: 'right', color: COLORS.muted }); });
        text(g, `f = ${(f * 100).toFixed(0)}% = tổng giao tử hoán vị;  giao tử liên kết = ${((1 - f) * 100).toFixed(0)}%`, rx, 310, { size: 12, color: '#fbbf24', weight: '700' });
        if (f >= 0.5) text(g, 'f = 50%: 4 loại giao tử bằng nhau – giống phân li độc lập', rx, 334, { size: 11, color: COLORS.muted });
        // thang bản đồ
        const my = h - 50; line(g, rx, my, rx + rw, my, '#94a3b8', 3); circle(g, rx, my, 6, '#f87171'); circle(g, rx + rw * p.dist / 50, my, 6, '#60a5fa'); text(g, 'A', rx, my - 12, { size: 11, align: 'center' }); text(g, 'B', rx + rw * p.dist / 50, my - 12, { size: 11, align: 'center' }); text(g, 'bản đồ di truyền (0–50 cM)', rx, my + 20, { size: 10.5, color: COLORS.muted });
      },
      metrics(p) { const f = p.dist / 100; return [['Tần số hoán vị f', `${(f * 100).toFixed(0)} %`], ['Giao tử liên kết (mỗi loại)', `${((1 - f) / 2 * 100).toFixed(1)} %`], ['Giao tử hoán vị (mỗi loại)', `${(f / 2 * 100).toFixed(1)} %`], ['Giao tử đã đếm', st.total]]; }
    };
  }
};
function geneTag(g, x, y, s) { circle(g, x, y, 7, '#0b1020'); text(g, s, x, y + 1, { size: 9, align: 'center', baseline: 'middle', color: '#fff', weight: '800' }); }
