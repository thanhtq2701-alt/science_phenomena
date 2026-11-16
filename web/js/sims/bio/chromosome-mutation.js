import { COLORS, text, label, circle, line, roundRect, arrow } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const STRUCT = {
  deletion: { name: 'Mất đoạn', wt: 'ABCDEFG', mut: 'ABCFG', note: 'Mất đoạn D–E → mất gene, thường gây chết hoặc giảm sức sống (hội chứng tiếng mèo kêu: mất đoạn NST 5). Ứng dụng: loại bỏ gene không mong muốn.' },
  duplication: { name: 'Lặp đoạn', wt: 'ABCDEFG', mut: 'ABCDEDEFG', note: 'Đoạn D–E lặp lại → tăng/giảm biểu hiện tính trạng (lặp đoạn ở lúa mạch làm tăng hoạt tính amylase).' },
  inversion: { name: 'Đảo đoạn', wt: 'ABCDEFG', mut: 'ABEDCFG', note: 'Đoạn C–D–E đứt ra, quay 180° rồi nối lại → trật tự gene thay đổi, ít ảnh hưởng sức sống nhưng giảm khả năng sinh sản.' },
  translocation: { name: 'Chuyển đoạn', wt: 'ABCDEFG', mut: 'ABCDMN', note: 'Đoạn E–F–G chuyển sang NST khác (nhận M–N). Chuyển đoạn lớn thường gây chết; chuyển đoạn nhỏ có thể có lợi (chuyển gene).' }
};
const NUM = {
  trisomy: { name: 'Thể ba (2n + 1)', desc: 'Một cặp NST có 3 chiếc. Hội chứng Down: 3 NST số 21.', extra: 1, all: false },
  monosomy: { name: 'Thể một (2n − 1)', desc: 'Một cặp NST chỉ còn 1 chiếc. Hội chứng Turner: XO.', extra: -1, all: false },
  triploid: { name: 'Thể tam bội (3n)', desc: 'Toàn bộ bộ NST tăng 1,5 lần. Dưa hấu không hạt, chuối 3n bất thụ.', extra: 1, all: true },
  tetraploid: { name: 'Thể tứ bội (4n)', desc: 'Bộ NST tăng gấp đôi, tế bào to, cơ quan lớn, hữu thụ. Nhiều cây trồng đa bội.', extra: 2, all: true }
};

export default {
  id: 'bio-chromosome-mutation',
  subject: 'bio',
  chapter: 'chromosome',
  title: 'Đột biến nhiễm sắc thể: cấu trúc và số lượng',
  summary: 'Xem NST bị mất đoạn, lặp đoạn, đảo đoạn, chuyển đoạn; và bộ NST bị lệch bội (2n ± 1) hay đa bội (3n, 4n) với cơ chế do rối loạn phân li.',
  equation: ['Cấu trúc: mất đoạn, lặp đoạn, đảo đoạn, chuyển đoạn', 'Số lượng: lệch bội (2n ± 1, 2n ± 2…), đa bội (3n, 4n…)', 'Cơ chế lệch bội: giao tử (n + 1) × (n) → 2n + 1 ;  đa bội: giao tử 2n × n → 3n'],
  keywords: ['đột biến NST', 'mất đoạn', 'lặp đoạn', 'đảo đoạn', 'chuyển đoạn', 'lệch bội', 'đa bội', 'thể ba', 'Down', 'Turner', 'Klinefelter'],
  theory: [
    '**Đột biến cấu trúc NST** là biến đổi trong cấu trúc một NST, làm thay đổi số lượng/trật tự gene trên NST: **mất đoạn** (thường có hại), **lặp đoạn** (tăng số bản sao gene), **đảo đoạn** (đổi trật tự), **chuyển đoạn** (trao đổi đoạn giữa các NST không tương đồng).',
    '**Đột biến số lượng NST**: **lệch bội** – thay đổi số lượng ở một hoặc vài cặp (thể một 2n−1, thể ba 2n+1…), do một cặp NST không phân li trong giảm phân tạo giao tử n+1 và n−1. **Đa bội** – tăng số nguyên lần bộ đơn bội (3n, 4n…), do toàn bộ NST không phân li (tác nhân: colchicine).',
    'Thể đa bội lẻ (3n) thường **bất thụ** vì NST không bắt cặp được khi giảm phân → tạo quả không hạt. Thể đa bội chẵn (4n) hữu thụ, cơ quan to, năng suất cao, phổ biến ở thực vật.'
  ],
  observe: ['So sánh NST gốc A–G với NST sau từng loại đột biến cấu trúc.', 'Ở thể ba, chỉ 1 cặp có 3 chiếc; ở 3n mọi cặp đều có 3 chiếc.', 'Xem sơ đồ giao tử tạo ra thể lệch bội.'],
  exam: ['Nhận dạng loại đột biến cấu trúc từ trật tự gene.', 'Tính số NST của thể lệch bội/đa bội; viết sơ đồ cơ chế hình thành; số loại thể ba có thể có = n.'],
  params: [
    { key: 'group', label: 'Nhóm đột biến', type: 'select', value: 'struct', options: [['struct', 'Cấu trúc NST'], ['num', 'Số lượng NST']] },
    { key: 'stype', label: 'Đột biến cấu trúc', type: 'select', value: 'deletion', options: Object.entries(STRUCT).map(([k, v]) => [k, v.name]) },
    { key: 'ntype', label: 'Đột biến số lượng', type: 'select', value: 'trisomy', options: Object.entries(NUM).map(([k, v]) => [k, v.name]) },
    { key: 'n', label: 'Số cặp NST (n)', min: 2, max: 4, step: 1, value: 3 }
  ],
  create() {
    const st = { anim: 0 };
    return {
      update(dt) { st.anim = (st.anim + dt * 0.4) % 1; },
      draw(g, w, h, p) {
        if (p.group === 'struct') {
          const s = STRUCT[p.stype];
          text(g, `Đột biến cấu trúc: ${s.name}`, 30, 40, { size: 14, weight: '700' });
          drawChromosome(g, 60, 110, s.wt, 'NST bình thường', null);
          arrow(g, w / 2, 150, w / 2, 190, '#fbbf24', 3);
          const hi = diff(s.wt, s.mut);
          drawChromosome(g, 60, 240, s.mut, 'NST đột biến', hi, p.stype);
          if (p.stype === 'translocation') { drawChromosome(g, 60, 320, 'MN', 'NST khác (trước)', null); drawChromosome(g, 360, 320, 'MNEFG', 'NST khác (sau)', [2, 3, 4]); }
          g.fillStyle = 'rgba(30,41,59,0.7)'; roundRect(g, 30, h - 120, w - 60, 90, 10); g.fill();
          wrap(g, s.note, 46, h - 92, w - 92, 12, COLORS.muted);
          text(g, `Số gene: ${s.wt.length} → ${s.mut.length}`, 46, h - 42, { size: 11.5, color: COLORS.text });
        } else {
          const m = NUM[p.ntype];
          text(g, `Đột biến số lượng: ${m.name}`, 30, 40, { size: 14, weight: '700' });
          const n = p.n, colors = ['#f87171', '#60a5fa', '#4ade80', '#fbbf24'];
          // bộ bình thường
          text(g, `Bộ NST bình thường 2n = ${2 * n}`, 40, 80, { size: 12, color: COLORS.muted });
          for (let i = 0; i < n; i++) for (let k = 0; k < 2; k++) rod(g, 60 + i * 80 + k * 22, 130, colors[i], 18 + i * 4);
          // bộ đột biến
          const total = m.all ? (2 + m.extra) * n : 2 * n + m.extra;
          text(g, `${m.name}: tổng ${total} NST`, 40, 200, { size: 12, color: '#fbbf24' });
          for (let i = 0; i < n; i++) { const cnt = m.all ? 2 + m.extra : (i === 0 ? 2 + m.extra : 2); for (let k = 0; k < cnt; k++) rod(g, 60 + i * 80 + k * 22, 250, colors[i], 18 + i * 4, !m.all && i === 0 && (k >= 2 || cnt < 2)); if (!m.all && i === 0) label(g, cnt === 3 ? '3 chiếc' : '1 chiếc', 60 + i * 80 + 22, 300, { size: 10, color: '#fbbf24' }); }
          // cơ chế
          const rx = Math.max(380, w * 0.5);
          text(g, 'Cơ chế hình thành', rx, 80, { size: 13, weight: '700' });
          const lines = m.all ? (m.extra === 1 ? ['Giảm phân rối loạn ở 1 bên bố/mẹ: toàn bộ NST', 'không phân li → giao tử 2n.', `Giao tử 2n (${2 * n}) × giao tử n (${n}) → hợp tử 3n (${3 * n}).`] : ['Cả hai bên tạo giao tử 2n, hoặc hợp tử 2n', 'nguyên phân lần đầu không phân li NST.', `2n (${2 * n}) × 2n (${2 * n}) → 4n (${4 * n}); colchicine gây 4n.`]) : (m.extra === 1 ? ['Một cặp NST không phân li trong giảm phân', `→ giao tử (n+1) = ${n + 1} và (n−1) = ${n - 1}.`, `Giao tử (n+1) × giao tử n → hợp tử 2n+1 = ${2 * n + 1}.`] : ['Một cặp NST không phân li trong giảm phân', `→ giao tử (n−1) = ${n - 1}.`, `Giao tử (n−1) × giao tử n → hợp tử 2n−1 = ${2 * n - 1}.`]);
          lines.forEach((s, i) => text(g, s, rx, 108 + i * 22, { size: 11.5, color: COLORS.muted }));
          // sơ đồ giao tử
          const gy = 200;
          const left = m.all ? (m.extra === 1 ? 2 * n : 2 * n) : (m.extra === 1 ? n + 1 : n - 1), right = m.all && m.extra === 2 ? 2 * n : n;
          gamete(g, rx + 40, gy + 40, left, m.all ? (m.extra === 1 ? '2n' : '2n') : (m.extra === 1 ? 'n+1' : 'n−1'), '#f472b6');
          text(g, '×', rx + 110, gy + 46, { size: 18, align: 'center' });
          gamete(g, rx + 180, gy + 40, right, m.all && m.extra === 2 ? '2n' : 'n', '#60a5fa');
          arrow(g, rx + 110, gy + 80, rx + 110, gy + 110, '#fbbf24', 2.5);
          label(g, `hợp tử ${total} NST – ${m.name}`, rx + 110, gy + 128, { size: 11.5, color: '#fbbf24' });
          g.fillStyle = 'rgba(30,41,59,0.7)'; roundRect(g, 30, h - 100, w - 60, 70, 10); g.fill();
          wrap(g, m.desc, 46, h - 72, w - 92, 12, COLORS.muted);
          if (!m.all) text(g, `Số dạng thể ${m.extra > 0 ? 'ba' : 'một'} có thể có ở loài này: n = ${n}`, 46, h - 42, { size: 11.5, color: COLORS.text });
          else text(g, m.extra === 1 ? 'Thể tam bội thường bất thụ (NST không bắt cặp đều khi giảm phân).' : 'Thể tứ bội hữu thụ, tế bào to, năng suất cao.', 46, h - 42, { size: 11.5, color: COLORS.text });
        }
      },
      metrics(p) { if (p.group === 'struct') { const s = STRUCT[p.stype]; return [['Loại', s.name], ['Số gene', `${s.wt.length} → ${s.mut.length}`]]; } const m = NUM[p.ntype]; const total = m.all ? (2 + m.extra) * p.n : 2 * p.n + m.extra; return [['Loại', m.name], ['Tổng NST', total], ['2n bình thường', 2 * p.n]]; }
    };
  }
};
function rod(g, x, y, color, len, hi = false) { g.strokeStyle = color; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y - len); g.lineTo(x, y + len); g.stroke(); circle(g, x, y - len * 0.2, 3, '#0b1020'); if (hi) { g.strokeStyle = '#fbbf24'; g.lineWidth = 1.5; g.strokeRect(x - 8, y - len - 6, 16, 2 * len + 12); } g.lineCap = 'butt'; }
function drawChromosome(g, x, y, genes, title, hi, type) {
  const unit = 40; text(g, title, x, y - 26, { size: 11.5, color: COLORS.muted });
  line(g, x - 10, y, x + genes.length * unit + 10, y, '#94a3b8', 10);
  const cols = { A: '#f87171', B: '#fb923c', C: '#fbbf24', D: '#4ade80', E: '#38bdf8', F: '#818cf8', G: '#c084fc', M: '#f472b6', N: '#2dd4bf' };
  for (let i = 0; i < genes.length; i++) { const gx = x + i * unit; g.fillStyle = cols[genes[i]] || '#94a3b8'; roundRect(g, gx + 4, y - 12, unit - 8, 24, 5); g.fill(); text(g, genes[i], gx + unit / 2, y + 1, { size: 12, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' }); if (hi && hi.includes(i)) { g.strokeStyle = '#fff'; g.lineWidth = 2; roundRect(g, gx + 2, y - 14, unit - 4, 28, 6); g.stroke(); } }
  circle(g, x + 1.5 * unit, y, 5, '#0b1020', '#e2e8f0');
}
function diff(a, b) { const out = []; let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; for (let k = i; k < b.length; k++) out.push(k); return out; }
function gamete(g, x, y, n, lbl, color) { circle(g, x, y, 30, 'rgba(148,163,184,0.08)', color, 2); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; rod(g, x + Math.cos(a) * 14, y + Math.sin(a) * 14, color, 7); } text(g, `giao tử ${lbl} (${n})`, x, y + 48, { size: 10.5, align: 'center', color }); }
function wrap(g, str, x, y, maxW, size, color) { g.font = `500 ${size}px Inter, system-ui, sans-serif`; const words = str.split(' '); let line = '', yy = y; for (const wd of words) { const t = line + wd + ' '; if (g.measureText(t).width > maxW && line) { text(g, line, x, yy, { size, color }); line = wd + ' '; yy += size + 6; } else line = t; } text(g, line, x, yy, { size, color }); }
