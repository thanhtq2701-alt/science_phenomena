import { COLORS, text, label, circle, line, roundRect, arrow, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'chem-metallic-bond',
  subject: 'chem',
  chapter: 'metals',
  title: 'Liên kết kim loại, tính chất vật lí và hợp kim',
  summary: 'Mạng tinh thể ion dương chìm trong "biển electron" tự do: nối nguồn điện thì electron chạy có hướng (dẫn điện), đập búa thì các lớp ion trượt mà không vỡ (dẻo). Thêm nguyên tử lạ tạo hợp kim cứng hơn, dẫn điện kém hơn.',
  equation: ['Liên kết kim loại: lực hút tĩnh điện giữa ion dương ở nút mạng và electron hóa trị tự do', 'Dẫn điện: Ag > Cu > Au > Al > Fe', 'Hợp kim: thép (Fe–C), inox (Fe–Cr–Ni), đồng thau (Cu–Zn), duralumin (Al–Cu–Mg)'],
  keywords: ['liên kết kim loại', 'electron tự do', 'mạng tinh thể', 'dẫn điện', 'dẫn nhiệt', 'ánh kim', 'tính dẻo', 'hợp kim', 'thép', 'inox'],
  theory: [
    'Trong tinh thể kim loại, nguyên tử nhường electron hóa trị thành **ion dương** nằm ở nút mạng; các electron hóa trị chuyển động **tự do** trong toàn mạng. **Liên kết kim loại** là lực hút tĩnh điện giữa các ion dương và electron tự do này.',
    'Electron tự do gây ra các **tính chất vật lí chung**: **dẻo** (các lớp ion trượt lên nhau mà vẫn được electron "dán" lại), **dẫn điện** (electron chuyển động có hướng; nhiệt độ tăng → ion dao động mạnh cản electron → dẫn điện giảm), **dẫn nhiệt**, **ánh kim** (electron phản xạ ánh sáng).',
    '**Hợp kim** là vật liệu kim loại có thêm nguyên tố khác. Nguyên tử lạ làm **lệch mạng**, cản sự trượt của các lớp → hợp kim thường **cứng hơn, giòn hơn, dẫn điện kém hơn** kim loại nguyên chất, nhưng bền, chống ăn mòn tốt (inox).'
  ],
  observe: ['Bật nguồn: electron trôi có hướng; tăng nhiệt độ: ion dao động mạnh, dòng giảm.', 'Bấm "Đập búa": kim loại nguyên chất bị dát mỏng; hợp kim cứng hơn, khó biến dạng.', 'Tăng % nguyên tố hợp kim: độ cứng tăng, độ dẫn điện giảm.'],
  exam: ['Giải thích tính chất vật lí chung của kim loại bằng electron tự do.', 'So sánh tính chất của hợp kim với kim loại thành phần; ứng dụng các hợp kim.'],
  params: [
    { key: 'field', label: 'Nối nguồn điện', type: 'toggle', value: true },
    { key: 'temp', label: 'Nhiệt độ', min: 0, max: 800, step: 20, value: 25, unit: '°C' },
    { key: 'alloy', label: 'Nguyên tố hợp kim thêm vào', min: 0, max: 30, step: 2, value: 0, unit: '%' }
  ],
  actions: [{ key: 'hammer', label: '🔨 Đập búa' }],
  create() {
    const cols = 12, rows = 6;
    const st = { e: [], shift: 0, hammer: 0, flatten: 0 };
    for (let i = 0; i < 70; i++) st.e.push({ x: Math.random(), y: Math.random(), vx: Math.random() - 0.5, vy: Math.random() - 0.5 });
    return {
      onParam(k) { if (k === 'alloy') st.flatten = 0; },
      action(key, p) { if (key === 'hammer') { st.hammer = 1; const hard = 1 + p.alloy / 8; st.flatten = clamp(st.flatten + 0.25 / hard, 0, 0.6); } },
      update(dt, p) {
        const vib = 0.3 + p.temp / 800;
        const scatter = vib * 2 + p.alloy / 10;
        for (const e of st.e) {
          if (Math.random() < scatter * dt) { e.vx = Math.random() - 0.5; e.vy = Math.random() - 0.5; }
          e.x += (e.vx * 0.3 + (p.field ? 0.25 : 0)) * dt; e.y += e.vy * 0.3 * dt;
          if (e.x > 1) e.x -= 1; if (e.x < 0) e.x += 1; if (e.y < 0 || e.y > 1) { e.vy *= -1; e.y = clamp(e.y, 0, 1); }
        }
        st.hammer = Math.max(0, st.hammer - dt * 2);
      },
      draw(g, w, h, p, t) {
        const bx = 40, by = 60, bw = Math.min(w * 0.58, 540);
        const bh = 220 * (1 - st.flatten), bwEff = bw * (1 + st.flatten * 0.6);
        g.fillStyle = 'rgba(148,163,184,0.12)'; roundRect(g, bx, by + (220 - bh), Math.min(bwEff, w - 60), bh, 8); g.fill();
        const vib = 1 + p.temp / 150;
        const nAlloy = Math.round(cols * rows * p.alloy / 100);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const isAlloy = ((idx * 37) % (cols * rows)) < nAlloy;
          const x = bx + 20 + c * (Math.min(bwEff, w - 60) - 40) / (cols - 1) + Math.sin(t * 20 + idx) * vib, y = by + (220 - bh) + 18 + r * (bh - 36) / (rows - 1) + Math.cos(t * 17 + idx) * vib;
          circle(g, x, y, isAlloy ? 13 : 10, isAlloy ? '#a3e635' : '#94a3b8', 'rgba(0,0,0,0.3)');
          text(g, isAlloy ? 'X' : '+', x, y + 1, { size: 10, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' });
        }
        for (const e of st.e) circle(g, bx + e.x * Math.min(bwEff, w - 60), by + (220 - bh) + e.y * bh, 2.6, '#fbbf24');
        if (p.field) { arrow(g, bx, by - 20, bx + 120, by - 20, '#fbbf24', 2); text(g, 'electron trôi về cực + (dòng điện ngược chiều)', bx + 130, by - 16, { size: 10.5, color: '#fde68a' }); }
        if (st.hammer > 0) text(g, '🔨', bx + bw / 2, by - 4 - st.hammer * 30, { size: 30, align: 'center' });
        if (st.flatten > 0) label(g, `bị dát mỏng ${Math.round(st.flatten * 100)}% – các lớp ion trượt nhưng không vỡ`, bx + bw / 2, by + 245, { size: 10.5 });
        // chỉ số
        const cond = clamp(1 / (1 + p.temp / 250 + p.alloy / 8), 0, 1);
        const hardness = clamp(0.25 + p.alloy / 25, 0, 1);
        const rx = Math.min(bx + bw + 30, w - 230), rw = w - rx - 20;
        if (rw > 160) {
          text(g, 'Tính chất', rx, 70, { size: 13, weight: '700' });
          bar(g, rx, 100, rw, 10, cond, '#fbbf24', `Độ dẫn điện: ${Math.round(cond * 100)}%`);
          bar(g, rx, 140, rw, 10, hardness, '#a3e635', `Độ cứng: ${Math.round(hardness * 100)}%`);
          bar(g, rx, 180, rw, 10, 1 - hardness * 0.8, '#60a5fa', `Độ dẻo: ${Math.round((1 - hardness * 0.8) * 100)}%`);
          const name = p.alloy === 0 ? 'Kim loại nguyên chất' : p.alloy <= 2 ? 'Thép (Fe + ≤2% C)' : p.alloy <= 20 ? 'Hợp kim (vd inox 18% Cr)' : 'Hợp kim nhiều thành phần';
          text(g, name, rx, 220, { size: 12, color: COLORS.warn, weight: '700' });
          ['+ : ion dương ở nút mạng', '• : electron tự do', 'X : nguyên tử lạ (hợp kim) – làm lệch mạng'].forEach((s, i) => text(g, s, rx, 250 + i * 20, { size: 11, color: COLORS.muted }));
        }
      },
      metrics(p) { return [['Độ dẫn điện tương đối', `${Math.round(100 / (1 + p.temp / 250 + p.alloy / 8))} %`], ['Nguyên tố hợp kim', `${p.alloy} %`], ['Biến dạng', `${Math.round(st.flatten * 100)} %`]]; }
    };
  }
};
