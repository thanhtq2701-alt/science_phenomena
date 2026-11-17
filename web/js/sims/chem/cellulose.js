import { COLORS, text, label, beaker, testTube, circle, line, roundRect, mixColor, withAlpha, flame } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const EXPS = {
  water: { title: 'Cellulose (bông) + nước / dung môi thường', liquid: '#bfdbfe', result: 'KHÔNG tan – cellulose có nhiều liên kết hydrogen giữa các mạch thẳng', dissolve: 0 },
  schweizer: { title: 'Cellulose + nước Schweizer [Cu(NH3)4](OH)2', liquid: '#1e40af', result: 'TAN tạo dung dịch nhớt → kéo sợi thành tơ đồng-ammoniac', dissolve: 1 },
  hno3: { title: 'Cellulose + HNO3 đặc / H2SO4 đặc (đun nhẹ)', liquid: '#fef3c7', result: 'Tạo cellulose trinitrate – chất rắn màu vàng, cháy rất mạnh (thuốc súng không khói)', dissolve: 0, product: true },
  acid: { title: 'Cellulose + H2SO4 loãng, đun sôi lâu', liquid: '#e2e8f0', result: 'Thủy phân chậm thành glucose (→ tráng bạc được)', dissolve: 0.8 }
};

export default {
  id: 'chem-cellulose',
  subject: 'chem',
  chapter: 'carbohydrate',
  title: 'Cellulose: tính chất và ứng dụng',
  summary: 'Bông cellulose không tan trong nước nhưng tan trong nước Schweizer, tạo ester với HNO3 (cellulose trinitrate), thủy phân thành glucose trong acid. Xem mạch thẳng [C6H7O2(OH)3]n và liên kết hydrogen.',
  equation: ['[C6H7O2(OH)3]n + 3nHNO3 →(H2SO4 đặc) [C6H7O2(ONO2)3]n + 3nH2O', '(C6H10O5)n + nH2O →(H+, t°) nC6H12O6', 'Mỗi mắt xích có 3 nhóm –OH tự do'],
  keywords: ['cellulose', 'nước Schweizer', 'cellulose trinitrate', 'tơ visco', 'thủy phân', 'bông', 'gỗ', 'giấy'],
  theory: [
    '**Cellulose** là polysaccharide gồm các gốc β-glucose nối bằng liên kết β-1,4-glycoside tạo **mạch thẳng không phân nhánh**, các mạch xếp song song nhờ **liên kết hydrogen** → sợi bền, **không tan trong nước** và dung môi thường, chỉ tan trong **nước Schweizer**.',
    'Mỗi mắt xích có **3 nhóm –OH** nên cellulose tham gia phản ứng **ester hóa**: với HNO3 đặc tạo **cellulose trinitrate** (thuốc súng không khói), với anhydride acetic tạo cellulose acetate (tơ acetate, phim ảnh).',
    'Cellulose **thủy phân** trong acid vô cơ hoặc enzyme cellulase (trâu bò tiêu hóa cỏ) tạo glucose. Người không có cellulase nên không tiêu hóa được cellulose. Ứng dụng: giấy, sợi dệt, tơ visco, bioethanol thế hệ 2.'
  ],
  observe: ['Thử nước: bông vẫn nguyên; nước Schweizer: bông tan tạo dung dịch xanh nhớt.', 'HNO3 đặc: bông chuyển vàng, bấm "Đốt" để thấy cháy bùng.'],
  exam: ['Tính khối lượng cellulose trinitrate từ cellulose và HNO3 với hiệu suất.', 'Phân biệt tinh bột và cellulose; giải thích tính không tan.'],
  params: [
    { key: 'exp', label: 'Thí nghiệm', type: 'select', value: 'water', options: Object.entries(EXPS).map(([k, v]) => [k, v.title]) },
    { key: 'temp', label: 'Nhiệt độ', min: 20, max: 100, step: 5, value: 25, unit: '°C' }
  ],
  actions: [{ key: 'burn', label: '🔥 Đốt sản phẩm' }],
  create() {
    const st = { prog: 0, burn: 0 };
    return {
      onParam(k) { if (k === 'exp') { st.prog = 0; st.burn = 0; } },
      action(key, p) { if (key === 'burn' && p.exp === 'hno3' && st.prog > 0.5) st.burn = 1; },
      update(dt, p) {
        const e = EXPS[p.exp];
        const tFactor = p.exp === 'acid' ? (p.temp > 80 ? 1 : 0.05) : p.exp === 'hno3' ? (p.temp > 40 ? 1 : 0.3) : 1;
        const target = p.exp === 'water' ? 0 : 1;
        st.prog = clamp(st.prog + dt * 0.12 * tFactor * (target - st.prog > 0 ? 1 : 0), 0, target);
        if (st.burn > 0) st.burn = clamp(st.burn + dt * 0.5, 0, 2);
      },
      draw(g, w, h, p, t) {
        const e = EXPS[p.exp];
        const bx = 60, by = 80, bw = 180, bh = 240;
        const liquid = p.exp === 'schweizer' ? e.liquid : p.exp === 'acid' ? mixColor('#e2e8f0', '#fef3c7', st.prog * 0.5) : e.liquid;
        beaker(g, bx, by, bw, bh, 0.7, withAlpha(liquid, p.exp === 'schweizer' ? 0.6 : 0.4), { title: e.title.split(' + ')[1] || e.title });
        // bông
        const size = p.exp === 'hno3' ? 1 : 1 - st.prog * (e.dissolve || 0);
        if (size > 0.03 && st.burn < 1.5) {
          const cx = bx + bw / 2, cy = by + bh - 60;
          const col = p.exp === 'hno3' ? mixColor('#f8fafc', '#facc15', st.prog) : '#f8fafc';
          for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; circle(g, cx + Math.cos(a) * 18 * size, cy + Math.sin(a) * 12 * size, 14 * size, withAlpha(toHex(col), 0.95)); }
          circle(g, cx, cy, 16 * size, col);
          if (st.burn > 0) flame(g, cx, cy - 10, 1.2 + st.burn, '#fb923c', t);
        }
        if (p.exp === 'schweizer' && st.prog > 0.5) { g.strokeStyle = 'rgba(30,64,175,0.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx + bw / 2, by + 40); g.quadraticCurveTo(bx + bw / 2 + 30, by + 100, bx + bw / 2, by + bh - 40); g.stroke(); label(g, 'dung dịch nhớt, kéo sợi được', bx + bw / 2, by - 14, { size: 10.5 }); }
        if (p.temp > 40) flame(g, bx + bw / 2, by + bh + 40, 0.5 + (p.temp - 40) / 120, '#fbbf24', t);
        label(g, st.burn > 1.5 ? 'cháy hết, gần như không khói' : st.prog > 0.6 ? e.result.split(' – ')[0].split(' →')[0] : 'đang quan sát…', bx + bw / 2, by + bh + 64, { size: 10.5 });
        // cấu trúc bên phải
        const rx = Math.max(300, w * 0.4);
        text(g, 'Cấu trúc cellulose', rx, 70, { size: 13, weight: '700' });
        for (let row = 0; row < 3; row++) { const y = 100 + row * 44; for (let i = 0; i < 6; i++) { const x = rx + 10 + i * 56; hexagon(g, x, y, 13, '#4ade80'); if (i < 5) line(g, x + 13, y, x + 43, y, '#a3e635', 2.5); text(g, 'OH OH OH', x, y + 24, { size: 7, align: 'center', color: COLORS.muted }); } if (row < 2) for (let i = 0; i < 6; i++) line(g, rx + 10 + i * 56, y + 14, rx + 10 + i * 56, y + 30, 'rgba(96,165,250,0.6)', 1, [2, 2]); }
        text(g, 'mạch thẳng β-glucose, các mạch nối nhau bằng liên kết hydrogen (nét đứt)', rx, 240, { size: 10.5, color: COLORS.muted });
        g.fillStyle = 'rgba(30,41,59,0.7)'; roundRect(g, rx, 270, w - rx - 30, 70, 10); g.fill();
        wrap(g, e.result, rx + 14, 294, w - rx - 58, 12, COLORS.text);
        if (p.exp === 'acid' && p.temp <= 80) text(g, 'cần đun sôi lâu mới thủy phân đáng kể', rx + 14, 330, { size: 10.5, color: COLORS.warn });
      },
      metrics(p) { return [['Tiến độ', `${Math.round(st.prog * 100)} %`], ['Kết quả', EXPS[p.exp].result.split(' – ')[0].split(' →')[0]]]; }
    };
  }
};
function hexagon(g, x, y, r, color) { g.fillStyle = color; g.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } g.closePath(); g.fill(); }
function toHex(c) { if (c.startsWith('#')) return c; const m = c.match(/\d+/g); return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join(''); }
function wrap(g, str, x, y, maxW, size, color) { g.font = `500 ${size}px Inter, system-ui, sans-serif`; const words = str.split(' '); let line = '', yy = y; for (const wd of words) { const tt = line + wd + ' '; if (g.measureText(tt).width > maxW && line) { text(g, line, x, yy, { size, color }); line = wd + ' '; yy += size + 6; } else line = tt; } text(g, line, x, yy, { size, color }); }
