import { COLORS, text, label, circle, line, roundRect } from '../../core/draw.js';

const LIMBS = [
  { name: 'Người (tay)', fn: 'cầm nắm', scale: [1, 1, 1, 1], color: '#f472b6' },
  { name: 'Mèo (chân trước)', fn: 'đi, chạy', scale: [0.8, 0.9, 0.7, 0.6], color: '#fbbf24' },
  { name: 'Cá voi (vây ngực)', fn: 'bơi', scale: [0.5, 0.45, 1.1, 1.6], color: '#38bdf8' },
  { name: 'Dơi (cánh)', fn: 'bay', scale: [0.7, 1.1, 1.4, 2.6], color: '#a78bfa' }
];
const PROTEIN = [['Người', 0], ['Tinh tinh', 0], ['Khỉ Rhesus', 1], ['Chó', 11], ['Gà', 13], ['Ếch', 18], ['Cá mập', 23]]; // số aa khác nhau ở cytochrome c / hemoglobin (minh họa)

export default {
  id: 'bio-evolution-evidence',
  subject: 'bio',
  chapter: 'evolution',
  title: 'Bằng chứng tiến hóa: giải phẫu so sánh và sinh học phân tử',
  summary: 'Xương chi trước của người, mèo, cá voi, dơi cùng một kế hoạch cấu tạo (cơ quan tương đồng) nhưng thích nghi với chức năng khác nhau; so sánh trình tự protein cho thấy loài càng gần nhau càng ít khác biệt.',
  equation: ['Cơ quan tương đồng: cùng nguồn gốc, khác chức năng → tiến hóa phân li', 'Cơ quan tương tự: khác nguồn gốc, cùng chức năng → tiến hóa đồng quy', 'Càng ít sai khác trình tự DNA/protein → quan hệ họ hàng càng gần'],
  keywords: ['bằng chứng tiến hóa', 'cơ quan tương đồng', 'cơ quan tương tự', 'cơ quan thoái hóa', 'giải phẫu so sánh', 'sinh học phân tử', 'hóa thạch', 'tế bào học'],
  theory: [
    '**Bằng chứng giải phẫu so sánh**: **cơ quan tương đồng** (chi trước của động vật có xương sống) có cùng nguồn gốc nên cấu tạo cùng kiểu (xương cánh tay – cẳng tay – cổ tay – ngón) dù chức năng khác → phản ánh **tiến hóa phân li**. **Cơ quan tương tự** (cánh chim và cánh côn trùng) khác nguồn gốc nhưng chức năng giống → **tiến hóa đồng quy**. **Cơ quan thoái hóa** (ruột thừa, xương cụt ở người) là dấu tích tổ tiên.',
    '**Bằng chứng tế bào học và sinh học phân tử**: mọi sinh vật đều cấu tạo từ tế bào, dùng chung mã di truyền, DNA, 20 loại amino acid. Các loài có quan hệ họ hàng càng gần thì trình tự DNA và protein **càng giống nhau**.',
    '**Hóa thạch** là bằng chứng trực tiếp cho thấy lịch sử phát sinh, phát triển sự sống.'
  ],
  observe: ['So sánh màu từng xương giữa 4 loài: cùng thứ tự nhưng tỉ lệ khác nhau.', 'Xem biểu đồ: tinh tinh khác người ít nhất, cá mập khác nhiều nhất.'],
  exam: ['Phân biệt cơ quan tương đồng, tương tự, thoái hóa; cho ví dụ.', 'Dùng dữ liệu trình tự để suy ra quan hệ họ hàng.'],
  params: [{ key: 'view', label: 'Bằng chứng', type: 'select', value: 'anat', options: [['anat', 'Giải phẫu: chi trước tương đồng'], ['mol', 'Phân tử: sai khác trình tự protein']] }],
  create() {
    return {
      update() {},
      draw(g, w, h, p) {
        if (p.view === 'anat') {
          const boneCols = ['#f87171', '#fbbf24', '#4ade80', '#60a5fa'];
          const boneNames = ['xương cánh tay', 'xương cẳng tay', 'xương cổ & bàn tay', 'xương ngón'];
          const colW = (w - 40) / 4;
          LIMBS.forEach((L, i) => {
            const x = 20 + colW * i + colW / 2; let y = 70;
            text(g, L.name, x, 46, { size: 12, align: 'center', weight: '700', color: L.color });
            const lens = [70, 60, 30, 40];
            lens.forEach((len, k) => {
              const l = len * L.scale[k]; const wd = k === 0 ? 12 : k === 1 ? 9 : 6;
              if (k < 2) { g.fillStyle = boneCols[k]; roundRect(g, x - wd / 2 - (k === 1 ? 5 : 0), y, wd, l, 4); g.fill(); if (k === 1) { roundRect(g, x + 1, y, wd - 2, l, 4); g.fill(); } }
              else { const n = 5; for (let f = 0; f < n; f++) { const spread = (f - 2) * (6 + L.scale[3] * 4); g.fillStyle = boneCols[k]; roundRect(g, x + spread - wd / 2, y, wd, l, 3); g.fill(); } }
              y += l + 4;
            });
            text(g, `chức năng: ${L.fn}`, x, Math.min(h - 70, y + 20), { size: 10.5, align: 'center', color: COLORS.muted });
          });
          boneNames.forEach((n, i) => { circle(g, 30 + i * 150, h - 40, 6, boneCols[i]); text(g, n, 42 + i * 150, h - 36, { size: 10.5, color: COLORS.muted }); });
          text(g, 'Cùng kế hoạch cấu tạo, khác hình dạng → cơ quan tương đồng (tiến hóa phân li từ tổ tiên chung)', 20, h - 12, { size: 11, color: COLORS.warn });
        } else {
          const px = 140, py = 60, pw = w - px - 60, ph = h - 120;
          text(g, 'Số amino acid khác so với người (chuỗi β-hemoglobin / cytochrome c, minh họa)', 20, 36, { size: 12, weight: '700' });
          const rowH = ph / PROTEIN.length;
          PROTEIN.forEach(([nm, d], i) => {
            const y = py + i * rowH; const bw = (d / 25) * pw;
            text(g, nm, px - 10, y + rowH / 2 + 4, { size: 12, align: 'right' });
            g.fillStyle = d === 0 ? '#4ade80' : d < 5 ? '#a3e635' : d < 15 ? '#fbbf24' : '#f87171'; roundRect(g, px, y + 6, Math.max(3, bw), rowH - 12, 4); g.fill();
            text(g, String(d), px + Math.max(3, bw) + 8, y + rowH / 2 + 4, { size: 11, color: COLORS.muted });
          });
          text(g, 'Càng ít sai khác → họ hàng càng gần: Người – Tinh tinh gần nhất; Người – Cá mập xa nhất', 20, h - 16, { size: 11, color: COLORS.warn });
        }
      },
      metrics(p) { return p.view === 'anat' ? [['Loại bằng chứng', 'giải phẫu so sánh'], ['Kiểu cơ quan', 'tương đồng']] : [['Loại bằng chứng', 'sinh học phân tử'], ['Gần người nhất', 'tinh tinh']]; }
    };
  }
};
