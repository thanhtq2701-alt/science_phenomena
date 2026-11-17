import { COLORS, text, label, circle, roundRect, bar } from '../../core/draw.js';

const MODES = {
  comp: { name: 'Bổ sung 9 : 7 (hoa đậu thơm)', ratio: '9 : 7', pheno: (A, B) => (A && B ? 'Hoa đỏ' : 'Hoa trắng'), colors: { 'Hoa đỏ': '#ef4444', 'Hoa trắng': '#f1f5f9' }, note: 'Cần cả A và B mới tạo được sắc tố đỏ (hai enzyme trong cùng một chuỗi chuyển hóa).' },
  comp961: { name: 'Bổ sung 9 : 6 : 1 (hình dạng quả bí)', ratio: '9 : 6 : 1', pheno: (A, B) => (A && B ? 'Quả dẹt' : A || B ? 'Quả tròn' : 'Quả dài'), colors: { 'Quả dẹt': '#f97316', 'Quả tròn': '#fbbf24', 'Quả dài': '#a3e635' }, note: 'A_B_ dẹt; chỉ có A hoặc B cho quả tròn; aabb dài.' },
  epi: { name: 'Át chế trội 12 : 3 : 1 (màu lông ngựa)', ratio: '12 : 3 : 1', pheno: (A, B) => (A ? 'Lông xám' : B ? 'Lông đen' : 'Lông hung'), colors: { 'Lông xám': '#94a3b8', 'Lông đen': '#1f2937', 'Lông hung': '#b45309' }, note: 'Gene A át chế biểu hiện của B: có A thì luôn xám.' },
  add: { name: 'Cộng gộp 15 : 1 (màu hạt lúa mì)', ratio: '15 : 1', pheno: (A, B) => (A || B ? 'Hạt đỏ' : 'Hạt trắng'), colors: { 'Hạt đỏ': '#dc2626', 'Hạt trắng': '#f1f5f9' }, note: 'Mỗi allele trội góp phần như nhau; chỉ aabb mới trắng. Nhiều gene cộng gộp → tính trạng số lượng (chiều cao, năng suất).' }
};

export default {
  id: 'bio-gene-interaction',
  subject: 'bio',
  chapter: 'mendel',
  title: 'Tương tác gene: bổ sung, át chế, cộng gộp',
  summary: 'Hai cặp gene phân li độc lập cùng quy định một tính trạng: F2 không còn 9 : 3 : 3 : 1 mà biến thành 9 : 7, 9 : 6 : 1, 12 : 3 : 1 hay 15 : 1. Xem bảng 16 ô được tô theo kiểu hình.',
  equation: ['P: AABB × aabb → F1: AaBb → F2: 9 A_B_ : 3 A_bb : 3 aaB_ : 1 aabb', 'Bổ sung: 9:7, 9:6:1, 9:3:3:1 ; Át chế: 12:3:1, 13:3 ; Cộng gộp: 15:1, 1:4:6:4:1'],
  keywords: ['tương tác gene', 'bổ sung', 'át chế', 'cộng gộp', '9:7', '15:1', '12:3:1', 'tính trạng số lượng', 'gene đa hiệu'],
  theory: [
    '**Tương tác gene** là sự tác động qua lại giữa các gene **không allele** trong quá trình hình thành một kiểu hình. Thực chất là tương tác giữa các **sản phẩm** của gene (enzyme, protein) trong chuỗi chuyển hóa.',
    'Vì hai gene vẫn **phân li độc lập**, F2 vẫn có 16 tổ hợp với 9 : 3 : 3 : 1 nhóm kiểu gene, nhưng các nhóm **gộp lại** thành tỉ lệ kiểu hình mới: bổ sung (9:7, 9:6:1), át chế (12:3:1, 13:3), cộng gộp (15:1).',
    'Tính trạng **số lượng** (chiều cao, sản lượng sữa, màu da người) do nhiều gene cộng gộp quy định, chịu ảnh hưởng nhiều của môi trường, phân bố liên tục.'
  ],
  observe: ['Chuyển giữa các kiểu tương tác: bảng 16 ô giữ nguyên kiểu gene, chỉ đổi cách tô màu.', 'Gieo nhiều cây F2 để thấy tỉ lệ thực nghiệm tiến về lí thuyết.'],
  exam: ['Nhận dạng kiểu tương tác từ tỉ lệ F2 (tổng 16 tổ hợp → 2 cặp gene).', 'Xác định kiểu gene P, F1; tính xác suất kiểu hình ở đời con.'],
  params: [{ key: 'mode', label: 'Kiểu tương tác', type: 'select', value: 'comp', options: Object.entries(MODES).map(([k, v]) => [k, v.name]) }],
  actions: [{ key: 'sow', label: '🌱 Gieo 160 cây F2' }],
  create() {
    const st = { counts: {}, total: 0 };
    return {
      onParam() { st.counts = {}; st.total = 0; },
      action(key, p) { if (key !== 'sow') return; const m = MODES[p.mode]; for (let i = 0; i < 160; i++) { const A = Math.random() < 0.75, B = Math.random() < 0.75; const ph = m.pheno(A, B); st.counts[ph] = (st.counts[ph] || 0) + 1; st.total++; } },
      update() {},
      draw(g, w, h, p) {
        const m = MODES[p.mode];
        const gam = ['AB', 'Ab', 'aB', 'ab'];
        const cell = Math.min(62, (h - 110) / 5, (w * 0.5) / 5);
        const x0 = 40, y0 = 60;
        text(g, 'F1: AaBb × AaBb', x0, 36, { size: 13, weight: '700' });
        gam.forEach((gm, i) => { g.fillStyle = 'rgba(96,165,250,0.3)'; roundRect(g, x0 + (i + 1) * cell, y0, cell - 3, cell - 3, 6); g.fill(); text(g, gm, x0 + (i + 1.5) * cell, y0 + cell / 2 + 4, { size: 12, align: 'center', weight: '700' }); g.fillStyle = 'rgba(244,114,182,0.3)'; roundRect(g, x0, y0 + (i + 1) * cell, cell - 3, cell - 3, 6); g.fill(); text(g, gm, x0 + cell / 2, y0 + (i + 1.5) * cell + 4, { size: 12, align: 'center', weight: '700' }); });
        const theo = {};
        gam.forEach((g1, i) => gam.forEach((g2, j) => {
          const geno = [g1[0], g2[0]].sort().join('') + [g1[1], g2[1]].sort().join('');
          const A = geno.includes('A'), B = geno.includes('B');
          const ph = m.pheno(A, B); theo[ph] = (theo[ph] || 0) + 1;
          g.fillStyle = m.colors[ph]; roundRect(g, x0 + (i + 1) * cell, y0 + (j + 1) * cell, cell - 3, cell - 3, 6); g.fill();
          text(g, geno, x0 + (i + 1.5) * cell, y0 + (j + 1.5) * cell + 4, { size: 11, align: 'center', color: ph.includes('đen') ? '#fff' : '#0b1020', weight: '800' });
        }));
        const rx = x0 + 5 * cell + 40, rw = w - rx - 30;
        if (rw > 160) {
          text(g, m.name, rx, 70, { size: 13, weight: '700' });
          Object.entries(theo).forEach(([ph, n], i) => { const y = 100 + i * 52; circle(g, rx + 8, y - 4, 7, m.colors[ph]); text(g, `${ph}: ${n}/16`, rx + 22, y, { size: 12 }); bar(g, rx, y + 8, rw, 8, n / 16, 'rgba(148,163,184,0.5)'); const ex = st.total ? (st.counts[ph] || 0) / st.total : 0; bar(g, rx, y + 20, rw, 8, ex, m.colors[ph]); if (st.total) text(g, `thực nghiệm ${(ex * 16).toFixed(1)}/16`, rx + rw, y, { size: 10.5, align: 'right', color: COLORS.muted }); });
          const y2 = 100 + Object.keys(theo).length * 52 + 10;
          label(g, `Tỉ lệ F2: ${m.ratio}`, rx + rw / 2, y2, { size: 13, color: '#fbbf24' });
          wrap(g, m.note, rx, y2 + 32, rw, 11.5, COLORS.muted);
        }
      },
      metrics(p) { return [['Tỉ lệ lí thuyết', MODES[p.mode].ratio], ['Cây F2 đã gieo', st.total]]; }
    };
  }
};
function wrap(g, str, x, y, maxW, size, color) { g.font = `500 ${size}px Inter, system-ui, sans-serif`; const words = str.split(' '); let line = '', yy = y; for (const wd of words) { const tt = line + wd + ' '; if (g.measureText(tt).width > maxW && line) { text(g, line, x, yy, { size, color }); line = wd + ' '; yy += size + 6; } else line = tt; } text(g, line, x, yy, { size, color }); }
