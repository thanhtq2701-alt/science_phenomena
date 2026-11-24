import { COLORS, text, label, circle, line, roundRect, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

function gametes(geno) { // 'AaBb' → ['AB','Ab','aB','ab']
  const pairs = []; for (let i = 0; i < geno.length; i += 2) pairs.push([geno[i], geno[i + 1]]);
  let out = [''];
  for (const [a, b] of pairs) { const next = []; for (const o of out) { next.push(o + a); next.push(o + b); } out = next; }
  return out;
}
function combine(g1, g2) { let s = ''; for (let i = 0; i < g1.length; i++) { const a = g1[i], b = g2[i]; s += (a === a.toUpperCase() ? a + b : b + a); } return s; }
function phenotype(geno, traits) { let s = []; for (let i = 0; i < geno.length; i += 2) { const dom = geno[i] === geno[i].toUpperCase() || geno[i + 1] === geno[i + 1].toUpperCase(); s.push(dom ? traits[i / 2][0] : traits[i / 2][1]); } return s.join(', '); }

const TRAITS = [['hạt vàng', 'hạt xanh'], ['hạt trơn', 'hạt nhăn']];
const COLOR_P = { 'hạt vàng, hạt trơn': '#fbbf24', 'hạt vàng, hạt nhăn': '#f59e0b', 'hạt xanh, hạt trơn': '#4ade80', 'hạt xanh, hạt nhăn': '#16a34a', 'hạt vàng': '#fbbf24', 'hạt xanh': '#4ade80' };

export default {
  id: 'bio-punnett',
  subject: 'bio',
  chapter: 'mendel',
  title: 'Phép lai Mendel: bảng Punnett và tỉ lệ kiểu hình',
  summary: 'Chọn kiểu gene bố mẹ, xem bảng Punnett cho lai một hoặc hai cặp tính trạng, rồi gieo ngẫu nhiên hàng trăm hạt để so sánh tỉ lệ thực nghiệm với lí thuyết 3:1 hay 9:3:3:1.',
  equation: ['Quy luật phân li: Aa × Aa → 1AA : 2Aa : 1aa (3 trội : 1 lặn)', 'Phân li độc lập: AaBb × AaBb → 9 : 3 : 3 : 1', 'Lai phân tích: Aa × aa → 1 : 1'],
  keywords: ['Mendel', 'Punnett', 'phân li', 'phân li độc lập', 'trội lặn', 'kiểu gene', 'kiểu hình', 'lai phân tích', 'đậu Hà Lan'],
  theory: [
    '**Quy luật phân li**: mỗi tính trạng do một cặp allele quy định; khi giảm phân hai allele **phân li đồng đều** về giao tử, mỗi giao tử chỉ chứa một allele. Thụ tinh kết hợp ngẫu nhiên → đời con có tỉ lệ kiểu gene 1 : 2 : 1 và kiểu hình 3 : 1 (nếu trội hoàn toàn).',
    '**Quy luật phân li độc lập**: các cặp allele nằm trên các cặp NST tương đồng **khác nhau** phân li độc lập nhau → tỉ lệ kiểu hình đời F2 của lai hai tính là tích các tỉ lệ (3:1)(3:1) = 9 : 3 : 3 : 1.',
    'Tỉ lệ Mendel là **tỉ lệ xác suất**: số cá thể càng lớn, tỉ lệ thực nghiệm càng gần lí thuyết. Dùng **lai phân tích** (lai với cá thể lặn) để xác định kiểu gene của cá thể trội.'
  ],
  observe: ['Gieo 20 hạt rồi 500 hạt: xem tỉ lệ thực nghiệm tiến về 3:1.', 'Thử Aa × aa (lai phân tích): tỉ lệ 1:1.', 'Chuyển sang 2 tính trạng, AaBb × AaBb: 16 ô Punnett, 9:3:3:1.'],
  exam: ['Viết sơ đồ lai, xác định tỉ lệ kiểu gene/kiểu hình; tính xác suất xuất hiện kiểu hình ở đời con.', 'Xác định kiểu gene của P từ tỉ lệ đời con.'],
  quiz: {
    question: 'Lai hai cây đậu hạt vàng dị hợp Aa × Aa (hạt vàng trội hoàn toàn so với hạt xanh). Tỉ lệ kiểu hình ở đời con xấp xỉ bao nhiêu?',
    options: ['3 vàng : 1 xanh', '1 vàng : 1 xanh', 'Toàn hạt vàng', '1 vàng : 2 vàng nhạt : 1 xanh'],
    answer: 0,
    explanation: 'Aa × Aa cho 1 AA : 2 Aa : 1 aa. Do trội hoàn toàn, AA và Aa đều hạt vàng nên kiểu hình 3 vàng : 1 xanh. Gieo càng nhiều hạt, tỉ lệ thực nghiệm càng gần 3 : 1.'
  },
  params: [
    { key: 'mode', label: 'Số cặp tính trạng', type: 'select', value: 1, options: [[1, 'Một cặp (màu hạt)'], [2, 'Hai cặp (màu & hình dạng)']] },
    { key: 'p1', label: 'Kiểu gene bố/mẹ 1', type: 'select', value: 'Aa', options: [['AA', 'AA'], ['Aa', 'Aa'], ['aa', 'aa'], ['AABB', 'AABB'], ['AaBb', 'AaBb'], ['AaBB', 'AaBB'], ['Aabb', 'Aabb'], ['aabb', 'aabb']] },
    { key: 'p2', label: 'Kiểu gene bố/mẹ 2', type: 'select', value: 'Aa', options: [['AA', 'AA'], ['Aa', 'Aa'], ['aa', 'aa'], ['AABB', 'AABB'], ['AaBb', 'AaBb'], ['AaBB', 'AaBB'], ['Aabb', 'Aabb'], ['aabb', 'aabb']] },
    { key: 'nSow', label: 'Số hạt gieo mỗi lần', min: 10, max: 500, step: 10, value: 100 }
  ],
  actions: [{ key: 'sow', label: '🌱 Gieo hạt' }, { key: 'clear', label: '🧹 Xóa kết quả' }],
  create() {
    const st = { counts: {}, total: 0, seeds: [] };
    const normalize = (p) => { const n = Number(p.mode); const fix = (gg) => { let s = gg.replace(/[^Aa]/g, ''); if (n === 2) { const b = gg.replace(/[^Bb]/g, '') || 'Bb'; s = s + b; } return s; }; return [fix(p.p1), fix(p.p2)]; };
    return {
      onParam() { st.counts = {}; st.total = 0; st.seeds = []; },
      action(key, p) {
        if (key === 'clear') { st.counts = {}; st.total = 0; st.seeds = []; return; }
        const [g1, g2] = normalize(p); const G1 = gametes(g1), G2 = gametes(g2); const n = Number(p.mode);
        for (let i = 0; i < p.nSow; i++) { const geno = combine(G1[Math.floor(Math.random() * G1.length)], G2[Math.floor(Math.random() * G2.length)]); const ph = phenotype(geno, TRAITS.slice(0, n)); st.counts[ph] = (st.counts[ph] || 0) + 1; st.total++; if (st.seeds.length < 400) st.seeds.push(ph); }
      },
      update() {},
      draw(g, w, h, p) {
        const [g1, g2] = normalize(p); const n = Number(p.mode);
        const G1 = [...new Set(gametes(g1))], G2 = [...new Set(gametes(g2))];
        text(g, `P: ${g1} × ${g2}`, 30, 36, { size: 14, weight: '700' });
        // Punnett
        const cell = Math.min(70, (h - 120) / (G2.length + 1), (w * 0.5 - 40) / (G1.length + 1));
        const x0 = 60, y0 = 70;
        const theo = {};
        for (let i = 0; i < G1.length; i++) { g.fillStyle = 'rgba(96,165,250,0.3)'; roundRect(g, x0 + (i + 1) * cell, y0, cell - 3, cell - 3, 6); g.fill(); text(g, G1[i], x0 + (i + 1) * cell + cell / 2, y0 + cell / 2, { size: 13, align: 'center', baseline: 'middle', weight: '700' }); }
        for (let j = 0; j < G2.length; j++) { g.fillStyle = 'rgba(244,114,182,0.3)'; roundRect(g, x0, y0 + (j + 1) * cell, cell - 3, cell - 3, 6); g.fill(); text(g, G2[j], x0 + cell / 2, y0 + (j + 1) * cell + cell / 2, { size: 13, align: 'center', baseline: 'middle', weight: '700' }); }
        for (let i = 0; i < G1.length; i++) for (let j = 0; j < G2.length; j++) {
          const geno = combine(G1[i], G2[j]); const ph = phenotype(geno, TRAITS.slice(0, n)); theo[ph] = (theo[ph] || 0) + 1;
          g.fillStyle = COLOR_P[ph] || '#94a3b8'; g.globalAlpha = 0.85; roundRect(g, x0 + (i + 1) * cell, y0 + (j + 1) * cell, cell - 3, cell - 3, 6); g.fill(); g.globalAlpha = 1;
          text(g, geno, x0 + (i + 1) * cell + cell / 2, y0 + (j + 1) * cell + cell / 2, { size: n === 2 ? 11 : 13, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' });
        }
        text(g, 'giao tử ♂ →', x0 + cell, y0 - 8, { size: 10, color: '#93c5fd' }); text(g, 'giao tử ♀ ↓', x0, y0 - 8, { size: 10, color: '#f9a8d4' });
        // tỉ lệ
        const rx = Math.max(x0 + (G1.length + 1) * cell + 40, w * 0.52), rw = w - rx - 30;
        const totalCells = G1.length * G2.length;
        text(g, 'Tỉ lệ kiểu hình', rx, 80, { size: 13, weight: '700' });
        const keys = Object.keys(theo).sort((a, b) => theo[b] - theo[a]);
        keys.forEach((k, i) => {
          const y = 104 + i * 58; const th = theo[k] / totalCells; const ex = st.total ? (st.counts[k] || 0) / st.total : 0;
          circle(g, rx + 8, y + 2, 7, COLOR_P[k] || '#94a3b8'); text(g, `${k}  –  lí thuyết ${theo[k]}/${totalCells} = ${(th * 100).toFixed(1)}%`, rx + 22, y + 6, { size: 11.5 });
          bar(g, rx, y + 14, rw, 8, th, 'rgba(148,163,184,0.5)');
          bar(g, rx, y + 26, rw, 8, ex, COLOR_P[k] || '#94a3b8');
          text(g, st.total ? `thực nghiệm ${st.counts[k] || 0}/${st.total} = ${(ex * 100).toFixed(1)}%` : 'bấm "Gieo hạt"', rx + rw - 2, y + 6, { size: 10.5, align: 'right', color: COLORS.muted });
        });
        const ratio = keys.map((k) => theo[k]).join(' : ');
        text(g, `Tỉ lệ lí thuyết: ${ratio}`, rx, 104 + keys.length * 58 + 8, { size: 12, color: '#fbbf24', weight: '700' });
        // hạt đã gieo
        const sy = h - 60; st.seeds.slice(-120).forEach((ph, i) => circle(g, 40 + (i % 40) * 14, sy + Math.floor(i / 40) * 14, 5, COLOR_P[ph] || '#94a3b8'));
        if (st.total) text(g, `Đã gieo ${st.total} hạt`, 40, sy - 14, { size: 10.5, color: COLORS.muted });
      },
      metrics(p) { return [['Tổng hạt đã gieo', st.total], ...Object.entries(st.counts).map(([k, v]) => [k, `${v} (${(v / st.total * 100).toFixed(1)}%)`])]; }
    };
  }
};
