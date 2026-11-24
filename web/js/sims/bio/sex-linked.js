import { COLORS, text, label, circle, line, roundRect, bar } from '../../core/draw.js';

const MOTHERS = { 'XAXA': 'XᴬXᴬ (bình thường)', 'XAXa': 'XᴬXᵃ (mang gene)', 'XaXa': 'XᵃXᵃ (bệnh)' };
const FATHERS = { 'XAY': 'XᴬY (bình thường)', 'XaY': 'XᵃY (bệnh)' };

export default {
  id: 'bio-sex-linked',
  subject: 'bio',
  chapter: 'mendel',
  title: 'Di truyền liên kết giới tính (gene lặn trên X)',
  summary: 'Bệnh mù màu, máu khó đông do gene lặn trên NST X: con trai nhận X từ mẹ nên biểu hiện bệnh nhiều hơn con gái. Lập bảng lai và gieo ngẫu nhiên con.',
  equation: ['Nữ: XᴬXᴬ, XᴬXᵃ (mang gene, bình thường), XᵃXᵃ (bệnh)', 'Nam: XᴬY (bình thường), XᵃY (bệnh) – chỉ cần 1 allele lặn', 'XᴬXᵃ × XᴬY → 1 XᴬXᴬ : 1 XᴬXᵃ : 1 XᴬY : 1 XᵃY (50% con trai bị bệnh)'],
  keywords: ['liên kết giới tính', 'nhiễm sắc thể X', 'mù màu', 'máu khó đông', 'di truyền chéo', 'gene lặn', 'giới tính'],
  theory: [
    'Cặp NST giới tính ở người: nữ XX, nam XY. NST X mang nhiều gene không có allele tương ứng trên Y (vùng không tương đồng). **Gene lặn trên X** (mù màu, máu khó đông): nam chỉ cần **một allele lặn** đã biểu hiện bệnh, nữ cần **hai allele lặn**.',
    'Đặc điểm: **di truyền chéo** – bố truyền X cho con gái, mẹ truyền X cho cả con trai và con gái; bệnh biểu hiện **nhiều ở nam**; mẹ mang gene (XᴬXᵃ) truyền bệnh cho 50% con trai.',
    'Gene trên Y (vùng không tương đồng) di truyền thẳng: bố → con trai (tật dính ngón tay 2–3, túm lông tai).'
  ],
  observe: ['Mẹ XᴬXᵃ × bố XᴬY: con gái đều bình thường, 50% con trai bệnh.', 'Mẹ XᵃXᵃ × bố XᴬY: tất cả con trai bệnh, con gái đều mang gene.', 'Để có con gái bệnh phải có bố bệnh và mẹ ít nhất mang gene.'],
  exam: ['Xác định kiểu gene của bố mẹ từ phả hệ; tính xác suất sinh con trai/gái bị bệnh.', 'Phân biệt di truyền liên kết X với di truyền thường và di truyền Y.'],
  quiz: {
    question: 'Mẹ mang gene mù màu (XᴬXᵃ), bố bình thường (XᴬY). Dự đoán về con của họ?',
    options: ['Con trai và con gái đều có khoảng 25% bị bệnh', 'Tất cả con trai bị bệnh', 'Không con nào bị bệnh vì bố bình thường', 'Con gái đều không bị bệnh, khoảng 50% con trai bị bệnh'],
    answer: 3,
    explanation: 'Con gái luôn nhận Xᴬ từ bố nên không bị bệnh (một nửa mang gene). Con trai nhận Y từ bố và một trong hai X của mẹ, nên 50% nhận Xᵃ và bị bệnh.'
  },
  params: [
    { key: 'mom', label: 'Mẹ', type: 'select', value: 'XAXa', options: Object.entries(MOTHERS) },
    { key: 'dad', label: 'Bố', type: 'select', value: 'XAY', options: Object.entries(FATHERS) },
    { key: 'disease', label: 'Bệnh', type: 'select', value: 'colorblind', options: [['colorblind', 'Mù màu'], ['hemophilia', 'Máu khó đông']] }
  ],
  actions: [{ key: 'kids', label: '👶 Sinh 20 con' }],
  create() {
    const st = { kids: [] };
    const gam = (gt) => gt === 'XAY' ? ['XA', 'Y'] : gt === 'XaY' ? ['Xa', 'Y'] : [gt.slice(0, 2), gt.slice(2, 4)];
    const child = (a, b) => { const parts = [a, b]; const xs = parts.filter((x) => x !== 'Y').sort((p, q) => (p === 'XA' ? -1 : 1)); return parts.includes('Y') ? xs[0] + 'Y' : xs[0] + xs[1]; };
    const sick = (c) => c.includes('Y') ? c.startsWith('Xa') : c === 'XaXa';
    return {
      onParam() { st.kids = []; },
      action(key, p) { if (key === 'kids') { const M = gam(p.mom), D = gam(p.dad); for (let i = 0; i < 20; i++) st.kids.push(child(M[Math.floor(Math.random() * 2)], D[Math.floor(Math.random() * 2)])); if (st.kids.length > 200) st.kids = st.kids.slice(-200); } },
      update() {},
      draw(g, w, h, p) {
        const M = gam(p.mom), D = gam(p.dad);
        text(g, `P: ${MOTHERS[p.mom].split(' ')[0]} × ${FATHERS[p.dad].split(' ')[0]}   (${p.disease === 'colorblind' ? 'mù màu' : 'máu khó đông'}: gene lặn a trên X)`, 30, 36, { size: 13, weight: '700' });
        const cell = 90, x0 = 60, y0 = 70;
        const fmt = (s) => s.replace('XA', 'Xᴬ').replace('XA', 'Xᴬ').replace('Xa', 'Xᵃ').replace('Xa', 'Xᵃ');
        const counts = {};
        D.forEach((d, i) => { g.fillStyle = 'rgba(96,165,250,0.3)'; roundRect(g, x0 + (i + 1) * cell, y0, cell - 4, cell - 4, 8); g.fill(); text(g, fmt(d), x0 + (i + 1) * cell + cell / 2, y0 + cell / 2, { size: 14, align: 'center', baseline: 'middle', weight: '700' }); });
        M.forEach((m, j) => { g.fillStyle = 'rgba(244,114,182,0.3)'; roundRect(g, x0, y0 + (j + 1) * cell, cell - 4, cell - 4, 8); g.fill(); text(g, fmt(m), x0 + cell / 2, y0 + (j + 1) * cell + cell / 2, { size: 14, align: 'center', baseline: 'middle', weight: '700' }); });
        D.forEach((d, i) => M.forEach((m, j) => { const c = child(m, d); counts[c] = (counts[c] || 0) + 1; const isS = sick(c); const boy = c.includes('Y'); g.fillStyle = isS ? 'rgba(248,113,113,0.8)' : boy ? 'rgba(96,165,250,0.6)' : 'rgba(244,114,182,0.6)'; roundRect(g, x0 + (i + 1) * cell, y0 + (j + 1) * cell, cell - 4, cell - 4, 8); g.fill(); text(g, fmt(c), x0 + (i + 1) * cell + cell / 2, y0 + (j + 1) * cell + cell / 2 - 8, { size: 13, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' }); text(g, (boy ? '♂ ' : '♀ ') + (isS ? 'bệnh' : c === 'XAXa' ? 'mang gene' : 'bình thường'), x0 + (i + 1) * cell + cell / 2, y0 + (j + 1) * cell + cell / 2 + 12, { size: 9.5, align: 'center', baseline: 'middle', color: '#0b1020' }); }));
        text(g, 'giao tử bố →', x0 + cell, y0 - 8, { size: 10, color: '#93c5fd' }); text(g, 'giao tử mẹ ↓', x0, y0 - 8, { size: 10, color: '#f9a8d4' });
        // thống kê
        const rx = Math.max(x0 + 3 * cell + 40, w * 0.5), rw = w - rx - 30;
        text(g, 'Xác suất đời con', rx, 80, { size: 13, weight: '700' });
        const total = 4;
        const boys = Object.entries(counts).filter(([c]) => c.includes('Y')), girls = Object.entries(counts).filter(([c]) => !c.includes('Y'));
        const sickBoys = boys.filter(([c]) => sick(c)).reduce((a, [, v]) => a + v, 0), sickGirls = girls.filter(([c]) => sick(c)).reduce((a, [, v]) => a + v, 0), carrierGirls = counts['XAXa'] || 0;
        const rows = [['Con trai bị bệnh', sickBoys / 2, '#f87171'], ['Con gái bị bệnh', sickGirls / 2, '#f87171'], ['Con gái mang gene', carrierGirls / 2, '#fbbf24'], ['Bị bệnh (chung)', (sickBoys + sickGirls) / total, '#f87171']];
        rows.forEach((r, i) => { const y = 108 + i * 44; text(g, `${r[0]}: ${(r[1] * 100).toFixed(0)}%`, rx, y, { size: 11.5 }); bar(g, rx, y + 8, rw, 9, r[1], r[2]); });
        // con đã sinh
        if (st.kids.length) {
          const ky = h - 90; text(g, `Đã sinh ${st.kids.length} con:`, rx, ky - 10, { size: 11, color: COLORS.muted });
          st.kids.slice(-60).forEach((c, i) => { const x = rx + (i % 20) * 16, y = ky + Math.floor(i / 20) * 18; const isS = sick(c); circle(g, x, y, 6, isS ? '#f87171' : c.includes('Y') ? '#60a5fa' : '#f472b6'); if (!isS && c === 'XAXa') circle(g, x, y, 2.5, '#fbbf24'); });
          const sb = st.kids.filter((c) => c.includes('Y') && sick(c)).length, nb = st.kids.filter((c) => c.includes('Y')).length;
          text(g, `con trai bệnh thực tế: ${sb}/${nb}`, rx, h - 20, { size: 11, color: COLORS.muted });
        }
        text(g, '● đỏ: bệnh  ● xanh: trai  ● hồng: gái  · chấm vàng: mang gene', 30, h - 20, { size: 10.5, color: COLORS.muted });
      },
      metrics(p) { const M = gam(p.mom), D = gam(p.dad); let sb = 0, sg = 0; D.forEach((d) => M.forEach((m) => { const c = child(m, d); if (sick(c)) { if (c.includes('Y')) sb++; else sg++; } })); return [['P(con trai bệnh)', `${sb * 50} %`], ['P(con gái bệnh)', `${sg * 50} %`], ['Con đã sinh', st.kids.length]]; }
    };
  }
};
