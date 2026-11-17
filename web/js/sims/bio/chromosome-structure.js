import { COLORS, text, label, circle, line, roundRect, arrow } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

const LEVELS = [
  { name: 'Phân tử DNA (chuỗi xoắn kép)', d: '2 nm', note: 'DNA dài hàng cm, phải đóng gói để vừa trong nhân ~5 μm.' },
  { name: 'Nucleosome (DNA quấn quanh 8 histone)', d: '11 nm (sợi cơ bản)', note: 'Đoạn DNA ~146 cặp nucleotide quấn 1¾ vòng quanh khối 8 phân tử histone; các nucleosome nối nhau bởi DNA nối.' },
  { name: 'Sợi chất nhiễm sắc', d: '30 nm', note: 'Sợi cơ bản xoắn tiếp tạo sợi chất nhiễm sắc.' },
  { name: 'Vùng xếp cuộn (siêu xoắn)', d: '300 nm', note: 'Sợi 30 nm gấp nếp thành các vòng (domain) gắn vào khung protein.' },
  { name: 'Chromatid (NST ở kì giữa)', d: '700 nm', note: 'Xoắn cực đại ở kì giữa: mỗi NST kép gồm 2 chromatid dính nhau ở tâm động.' }
];

export default {
  id: 'bio-chromosome-structure',
  subject: 'bio',
  chapter: 'chromosome',
  title: 'Cấu trúc siêu hiển vi của nhiễm sắc thể',
  summary: 'Phóng to từng mức đóng gói: DNA 2 nm quấn quanh histone tạo nucleosome, xoắn thành sợi 11 nm, 30 nm, 300 nm rồi chromatid 700 nm. Xem thêm tâm động, đầu mút và vùng khởi đầu nhân đôi.',
  equation: ['DNA (2 nm) → sợi cơ bản (11 nm) → sợi nhiễm sắc (30 nm) → vùng xếp cuộn (300 nm) → chromatid (700 nm)', 'Nucleosome = 8 histone + ~146 cặp nucleotide quấn 1¾ vòng'],
  keywords: ['cấu trúc NST', 'nucleosome', 'histone', 'sợi cơ bản', 'sợi chất nhiễm sắc', 'chromatid', 'tâm động', 'đầu mút', 'telomere'],
  theory: [
    'Ở sinh vật nhân thực, NST được cấu tạo từ **DNA và protein histone**. Đơn vị cơ bản là **nucleosome**: khối cầu gồm 8 phân tử histone được một đoạn DNA ~146 cặp nucleotide quấn quanh 1¾ vòng.',
    'Chuỗi nucleosome tạo **sợi cơ bản 11 nm**, xoắn tiếp tạo **sợi chất nhiễm sắc 30 nm**, gấp nếp thành **vùng xếp cuộn 300 nm**, và cuối cùng là **chromatid 700 nm** ở kì giữa. Nhờ đóng gói nhiều mức, DNA dài vài cm vừa trong nhân tế bào và dễ phân li khi phân bào.',
    'Mỗi NST có **tâm động** (nơi gắn thoi phân bào), **vùng đầu mút** (telomere, bảo vệ NST không dính vào nhau) và các **trình tự khởi đầu nhân đôi**.'
  ],
  observe: ['Kéo mức phóng to từ 0 lên 4 để xem các bậc đóng gói.', 'Để ý đường kính tăng từ 2 nm lên 700 nm.'],
  exam: ['Trình bày các mức cấu trúc siêu hiển vi của NST; thành phần của nucleosome.', 'Chức năng của tâm động, đầu mút; ý nghĩa của sự đóng xoắn.'],
  params: [{ key: 'level', label: 'Mức cấu trúc', min: 0, max: 4, step: 1, value: 1 }],
  create() {
    return {
      update() {},
      draw(g, w, h, p, t) {
        const L = LEVELS[p.level];
        const cx = w * 0.4, cy = h / 2 - 10;
        if (p.level === 0) {
          for (let i = 0; i <= 120; i++) { const x = 60 + i * (w * 0.65) / 120; const a = i * 0.25 + t; circle(g, x, cy + Math.sin(a) * 24, 3, '#60a5fa'); circle(g, x, cy - Math.sin(a) * 24, 3, '#f472b6'); if (i % 4 === 0) line(g, x, cy + Math.sin(a) * 24, x, cy - Math.sin(a) * 24, 'rgba(226,232,240,0.3)', 1); }
        } else if (p.level === 1) {
          for (let k = 0; k < 5; k++) {
            const x = 90 + k * (w * 0.6) / 4, y = cy + (k % 2 ? 18 : -18);
            circle(g, x, y, 26, '#fbbf24', 'rgba(0,0,0,0.3)'); text(g, '8 histone', x, y + 3, { size: 8.5, align: 'center', color: '#0b1020', weight: '700' });
            g.strokeStyle = '#60a5fa'; g.lineWidth = 3.5; g.beginPath(); g.arc(x, y, 31, -Math.PI * 0.9 + t * 0.2, Math.PI * 1.6 + t * 0.2); g.stroke();
            if (k < 4) { const nx = 90 + (k + 1) * (w * 0.6) / 4, ny = cy + ((k + 1) % 2 ? 18 : -18); line(g, x + 30, y, nx - 30, ny, '#60a5fa', 3); text(g, 'DNA nối', (x + nx) / 2, (y + ny) / 2 - 10, { size: 9, align: 'center', color: COLORS.muted }); }
          }
        } else if (p.level === 2) {
          for (let i = 0; i < 40; i++) { const u = i / 40; const a = u * TAU * 5 + t * 0.3; const x = 80 + u * w * 0.6, y = cy + Math.sin(a) * 30; circle(g, x, y, 10, `rgba(251,191,36,${0.5 + 0.5 * Math.cos(a)})`); }
        } else if (p.level === 3) {
          g.fillStyle = 'rgba(148,163,184,0.3)'; g.fillRect(70, cy - 4, w * 0.62, 8); text(g, 'khung protein', 70, cy + 22, { size: 9.5, color: COLORS.muted });
          for (let k = 0; k < 10; k++) { const x = 90 + k * w * 0.06; g.strokeStyle = '#fbbf24'; g.lineWidth = 6; g.beginPath(); g.ellipse(x, cy - 40, 14, 40, 0, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(x + 20, cy + 40, 14, 40, 0, 0, TAU); g.stroke(); }
        } else {
          const H = Math.min(h - 120, 300);
          for (const s of [-1, 1]) { g.fillStyle = '#f472b6'; roundRect(g, cx + s * 22 - 16, cy - H / 2, 32, H / 2 - 10, 14); g.fill(); roundRect(g, cx + s * 22 - 16, cy + 10, 32, H / 2 - 10, 14); g.fill(); for (let i = 0; i < 10; i++) line(g, cx + s * 22 - 14, cy - H / 2 + 14 + i * (H - 30) / 10, cx + s * 22 + 14, cy - H / 2 + 20 + i * (H - 30) / 10, 'rgba(255,255,255,0.25)', 2); }
          circle(g, cx, cy, 14, '#fbbf24'); arrow(g, cx + 110, cy, cx + 20, cy, '#fbbf24', 2); text(g, 'tâm động', cx + 116, cy + 4, { size: 11, color: '#fbbf24' });
          arrow(g, cx + 110, cy - H / 2 + 8, cx + 40, cy - H / 2 + 8, '#a3e635', 2); text(g, 'đầu mút (telomere)', cx + 116, cy - H / 2 + 12, { size: 11, color: '#a3e635' });
          text(g, 'chromatid', cx - 90, cy - H / 4, { size: 11, color: '#f9a8d4' }); text(g, 'chromatid', cx + 46, cy + H / 4, { size: 11, color: '#f9a8d4' });
        }
        label(g, `Mức ${p.level}: ${L.name}`, w / 2, 30, { size: 13, color: '#4ade80' });
        label(g, `đường kính ≈ ${L.d}`, w / 2, 58, { size: 11, color: '#fbbf24' });
        // thang mức
        const sy = h - 70;
        LEVELS.forEach((lv, i) => { const x = 60 + i * (w - 120) / 4; circle(g, x, sy, i === p.level ? 9 : 5, i <= p.level ? '#4ade80' : '#475569'); text(g, lv.d.split(' ')[0] + ' nm'.replace(/^ nm$/, ''), x, sy + 22, { size: 10, align: 'center', color: i === p.level ? COLORS.text : COLORS.muted }); });
        text(g, L.note, w / 2, h - 18, { size: 11.5, align: 'center', color: COLORS.muted });
      },
      metrics(p) { return [['Mức', LEVELS[p.level].name], ['Đường kính', LEVELS[p.level].d]]; }
    };
  }
};
