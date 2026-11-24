import { COLORS, text, label, testTube, beaker, molecule, mixColor, Falling, circle, roundRect } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

const ANILINE = [{ s: 'C', x: 0, y: -22 }, { s: 'C', x: 19, y: -11 }, { s: 'C', x: 19, y: 11 }, { s: 'C', x: 0, y: 22 }, { s: 'C', x: -19, y: 11 }, { s: 'C', x: -19, y: -11 }, { s: 'N', x: 0, y: -46 }, { s: 'H', x: -12, y: -58 }, { s: 'H', x: 12, y: -58 }];
const ANILINE_B = [[0, 1, 2], [1, 2], [2, 3, 2], [3, 4], [4, 5, 2], [5, 0], [0, 6], [6, 7], [6, 8]];
const TRIBROMO = [...ANILINE, { s: 'Br', x: 36, y: -22 }, { s: 'Br', x: 0, y: 46 }, { s: 'Br', x: -36, y: -22 }];
const TRIBROMO_B = [...ANILINE_B, [1, 9], [3, 10], [5, 11]];
const METHYLAMINE = [{ s: 'C', x: -14, y: 0 }, { s: 'N', x: 14, y: 0 }, { s: 'H', x: 28, y: -14 }, { s: 'H', x: 28, y: 14 }];
const METHYLAMINE_B = [[0, 1], [1, 2], [1, 3]];

export default {
  id: 'chem-amine-reactions',
  subject: 'chem',
  chapter: 'nitrogen',
  title: 'Amine: tính base và phản ứng của aniline với nước bromine',
  summary: 'Methylamine làm xanh quỳ tím và tạo khói trắng với HCl; aniline không đổi màu quỳ nhưng tạo kết tủa trắng 2,4,6-tribromoaniline với nước bromine.',
  equation: ['CH3NH2 + H2O ⇌ CH3NH3+ + OH−  (quỳ tím hóa xanh)', 'CH3NH2 + HCl → CH3NH3Cl  (khói trắng)', 'C6H5NH2 + 3Br2 → C6H2Br3NH2↓ (trắng) + 3HBr'],
  keywords: ['amine', 'aniline', 'methylamine', 'bromine', 'kết tủa trắng', 'quỳ tím', 'base'],
  theory: [
    'Amine có cặp electron tự do trên N nên có **tính base**. Amine béo (methylamine, ethylamine…) base **mạnh hơn NH3**, làm **quỳ tím hóa xanh**. **Aniline** có vòng benzene hút electron nên base **rất yếu**, **không** đổi màu quỳ tím.',
    'Amine tác dụng với acid tạo muối: khi đưa hai đũa thủy tinh nhúng HCl đặc và methylamine lại gần nhau thấy **khói trắng** (tinh thể CH3NH3Cl).',
    'Nhóm –NH2 **hoạt hóa vòng benzene** ở vị trí ortho/para, nên aniline phản ứng dễ với nước bromine ngay nhiệt độ thường tạo **kết tủa trắng** 2,4,6-tribromoaniline. Dùng để nhận biết aniline.'
  ],
  observe: ['Chọn "Quỳ tím" và đổi giữa methylamine / aniline để thấy khác biệt tính base.', 'Chọn "Nước bromine" và nhỏ dần Br2: màu vàng của Br2 mất đi, kết tủa trắng xuất hiện.'],
  exam: ['So sánh tính base: NH3, CH3NH2, (CH3)2NH, C6H5NH2.', 'Nhận biết aniline bằng nước bromine; tính khối lượng kết tủa.'],
  quiz: {
    question: 'Nhúng quỳ tím vào dung dịch methylamine và vào aniline. Quỳ tím đổi màu thế nào?',
    options: ['Cả hai làm quỳ hóa xanh', 'Aniline làm quỳ hóa xanh, methylamine thì không', 'Cả hai làm quỳ hóa đỏ', 'Methylamine làm quỳ hóa xanh, aniline không đổi màu quỳ'],
    answer: 3,
    explanation: 'Methylamine là amine béo, có tính base mạnh hơn NH3 nên làm quỳ hóa xanh. Vòng benzene hút electron làm aniline có tính base rất yếu, không đổi màu quỳ tím.'
  },
  params: [
    { key: 'amine', label: 'Amine', type: 'select', value: 'methyl', options: [['methyl', 'Methylamine CH3NH2'], ['aniline', 'Aniline C6H5NH2']] },
    { key: 'test', label: 'Thuốc thử', type: 'select', value: 'litmus', options: [['litmus', 'Quỳ tím'], ['hcl', 'HCl đặc (hơi)'], ['br2', 'Nước bromine']] },
    { key: 'drops', label: 'Lượng thuốc thử', min: 0, max: 10, step: 1, value: 5, unit: 'giọt' }
  ],
  create() {
    const st = { reacted: 0, fall: new Falling(), smoke: [] };
    return {
      onParam(k) { if (k !== 'drops') { st.reacted = 0; st.fall.list = []; } },
      update(dt, p) {
        if (p.test === 'br2') {
          const target = p.amine === 'aniline' ? clamp(p.drops / 6, 0, 1) : 0;
          st.reacted += (target - st.reacted) * (1 - Math.exp(-dt));
          if (p.amine === 'aniline' && st.reacted < target - 0.02 && Math.random() < 0.6) st.fall.spawn(220, 220, 1, '#f8fafc', 2);
          st.fall.update(dt, 330);
        }
        if (p.test === 'hcl') {
          const rate = p.amine === 'methyl' ? 0.5 * p.drops / 5 : 0.05;
          if (Math.random() < rate) st.smoke.push({ x: 255 + (Math.random() - .5) * 30, y: 180, r: 3, life: 1 });
          for (const s of st.smoke) { s.y -= 25 * dt; s.r += 8 * dt; s.life -= dt * 0.5; s.x += (Math.random() - .5); }
          st.smoke = st.smoke.filter((s) => s.life > 0);
        }
      },
      draw(g, w, h, p, t) {
        const isAn = p.amine === 'aniline';
        const tx = 180, ty = 80, tw = 80, th = 260;
        if (p.test === 'litmus') {
          const base = isAn ? '#a78bfa' : mixColor('#a78bfa', '#2563eb', clamp(p.drops / 3, 0, 1));
          testTube(g, tx, ty, tw, th, 0.6, 'rgba(226,232,240,0.25)', { title: nameOf(p) + ' + quỳ tím' });
          // mẩu quỳ
          g.fillStyle = base; roundRect(g, tx + tw / 2 - 10, ty + 90, 20, 70, 3); g.fill();
          label(g, isAn ? 'quỳ tím KHÔNG đổi màu' : 'quỳ tím hóa XANH', tx + tw / 2, ty - 16, { size: 11, color: isAn ? COLORS.muted : '#60a5fa' });
        } else if (p.test === 'hcl') {
          // hai đũa thủy tinh
          text(g, 'Đũa nhúng ' + nameOf(p), 120, 120, { size: 12, color: COLORS.muted });
          text(g, 'Đũa nhúng HCl đặc', 300, 120, { size: 12, color: COLORS.muted });
          g.strokeStyle = '#cbd5e1'; g.lineWidth = 6; g.lineCap = 'round';
          g.beginPath(); g.moveTo(140, 300); g.lineTo(230, 190); g.stroke();
          g.beginPath(); g.moveTo(370, 300); g.lineTo(280, 190); g.stroke();
          g.lineCap = 'butt';
          for (const s of st.smoke) { g.globalAlpha = s.life * 0.8; circle(g, s.x, s.y, s.r, '#f1f5f9'); }
          g.globalAlpha = 1;
          label(g, isAn ? 'rất ít khói (aniline base yếu, ít bay hơi)' : 'KHÓI TRẮNG CH3NH3Cl', 255, 330, { size: 11, color: isAn ? COLORS.muted : COLORS.text });
        } else {
          const br = clamp(p.drops / 6, 0, 1);
          const liquid = isAn ? mixColor('#fef9c3', '#fde68a', Math.max(0, br - st.reacted) * 2) : mixColor('#fef9c3', '#f59e0b', br);
          testTube(g, tx, ty, tw, th, 0.6, liquid, { precipitate: st.reacted > 0.05 ? '#f8fafc' : null, precipHeight: 4 + 24 * st.reacted, title: nameOf(p) + ' + nước Br2' });
          st.fall.draw(g);
          label(g, isAn ? (st.reacted > 0.1 ? 'KẾT TỦA TRẮNG, Br2 mất màu' : 'nhỏ Br2 vào…') : 'không có kết tủa (vẫn màu vàng Br2)', tx + tw / 2, ty - 16, { size: 11, color: isAn && st.reacted > 0.1 ? COLORS.text : COLORS.muted });
        }
        // Mô hình phân tử bên phải
        const cx = Math.max(560, w * 0.68), cy = 200;
        text(g, 'Phân tử', cx, 60, { size: 14, weight: '700', align: 'center' });
        if (isAn) {
          if (p.test === 'br2' && st.reacted > 0.3) { molecule(g, cx, cy, TRIBROMO, TRIBROMO_B, 0.9, t * 0.2); text(g, '2,4,6-tribromoaniline (kết tủa trắng)', cx, cy + 80, { size: 11.5, align: 'center', color: COLORS.muted }); }
          else { molecule(g, cx, cy, ANILINE, ANILINE_B, 0.9, t * 0.2); text(g, 'aniline: –NH2 gắn vòng benzene → base yếu,', cx, cy + 80, { size: 11.5, align: 'center', color: COLORS.muted }); text(g, 'vòng được hoạt hóa ở o-, p-', cx, cy + 96, { size: 11.5, align: 'center', color: COLORS.muted }); }
        } else {
          molecule(g, cx, cy, METHYLAMINE, METHYLAMINE_B, 1.1, t * 0.2);
          text(g, 'methylamine: cặp e trên N dễ nhận H+ → base mạnh hơn NH3', cx, cy + 70, { size: 11.5, align: 'center', color: COLORS.muted });
        }
        // thang tính base
        const bx = cx - 150, by = h - 70, bw = 300;
        text(g, 'Tính base tăng dần →', bx, by - 12, { size: 11, color: COLORS.muted });
        const items = ['C6H5NH2', 'NH3', 'CH3NH2', '(CH3)2NH'];
        items.forEach((s, i) => { const x = bx + (i / (items.length - 1)) * bw; circle(g, x, by + 8, 5, i === 0 && isAn || i === 2 && !isAn ? COLORS.chem : '#475569'); text(g, s, x, by + 30, { size: 10.5, align: 'center', color: COLORS.muted }); });
        g.strokeStyle = '#475569'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, by + 8); g.lineTo(bx + bw, by + 8); g.stroke();
      },
      metrics(p) {
        const isAn = p.amine === 'aniline';
        return [['Kb (gần đúng)', isAn ? '4·10⁻¹⁰' : '4·10⁻⁴'], ['Quỳ tím', isAn ? 'không đổi' : 'xanh'], ['Với Br2', isAn ? 'kết tủa trắng' : 'không'], ['Tiến độ', `${Math.round(st.reacted * 100)} %`]];
      }
    };
  }
};
function nameOf(p) { return p.amine === 'aniline' ? 'aniline' : 'methylamine'; }
