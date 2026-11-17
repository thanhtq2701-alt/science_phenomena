import { COLORS, text, label, beaker, circle, line, roundRect, mixColor, withAlpha, plot, polyline } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'chem-kmno4-titration',
  subject: 'chem',
  chapter: 'transition',
  title: 'Chuẩn độ xác định hàm lượng Fe2+ bằng dung dịch KMnO4',
  summary: 'Nhỏ từ từ KMnO4 tím vào bình Fe2+ trong H2SO4: màu tím mất ngay vì MnO4− bị khử thành Mn2+ gần như không màu. Điểm tương đương là khi xuất hiện màu hồng nhạt bền 20 giây; từ thể tích KMnO4 tính nồng độ Fe2+.',
  equation: ['MnO4− + 5Fe2+ + 8H+ → Mn2+ + 5Fe3+ + 4H2O', 'Tại điểm tương đương: n(Fe2+) = 5·n(MnO4−) ⇒ C(Fe2+)·V(Fe2+) = 5·C(KMnO4)·V(KMnO4)'],
  keywords: ['chuẩn độ', 'KMnO4', 'thuốc tím', 'Fe2+', 'oxi hóa khử', 'điểm tương đương', 'burette', 'thực hành', 'muối Mohr'],
  theory: [
    'Phương pháp **chuẩn độ oxi hóa – khử** dùng dung dịch KMnO4 đã biết nồng độ (chất oxi hóa mạnh trong môi trường acid) để xác định lượng chất khử Fe2+. KMnO4 **tự làm chỉ thị**: MnO4− màu tím, Mn2+ gần như không màu.',
    'Trước điểm tương đương, mỗi giọt KMnO4 bị Fe2+ khử ngay → mất màu. Ngay sau điểm tương đương, MnO4− dư làm dung dịch có **màu hồng nhạt bền khoảng 20 giây** → dừng chuẩn độ, đọc thể tích trên burette.',
    'Cần môi trường **H2SO4** (không dùng HCl vì Cl− bị MnO4− oxi hóa; không dùng HNO3 vì nó oxi hóa Fe2+). Lặp lại 3 lần, lấy trung bình để giảm sai số.'
  ],
  observe: ['Nhỏ từng 0,5 mL: màu tím biến mất khi còn Fe2+.', 'Gần điểm tương đương nhỏ từng giọt (0,05 mL) để không vượt quá.', 'Tắt H2SO4: xuất hiện kết tủa nâu MnO2 – sai phương pháp.'],
  exam: ['Tính nồng độ Fe2+ / hàm lượng muối Mohr, FeSO4 từ thể tích KMnO4.', 'Giải thích vai trò của H2SO4 và cách nhận biết điểm tương đương.'],
  params: [
    { key: 'cFe', label: 'Nồng độ Fe2+ (chưa biết – để chấm)', min: 0.02, max: 0.2, step: 0.01, value: 0.1, unit: 'M', decimals: 2 },
    { key: 'cMn', label: 'Nồng độ KMnO4', min: 0.01, max: 0.05, step: 0.005, value: 0.02, unit: 'M', decimals: 3 },
    { key: 'step', label: 'Mỗi lần nhỏ', type: 'select', value: 0.5, options: [[1, '1 mL'], [0.5, '0,5 mL'], [0.1, '0,1 mL'], [0.05, '1 giọt (0,05 mL)']] },
    { key: 'acid', label: 'Có H2SO4 loãng', type: 'toggle', value: true }
  ],
  actions: [{ key: 'drop', label: '💧 Nhỏ KMnO4' }, { key: 'reset', label: '🔄 Làm lại' }],
  create() {
    const VFe = 10; // mL Fe2+ lấy vào bình
    const st = { V: 0, flash: 0, hist: [[0, 0]] };
    return {
      onParam(k) { if (k !== 'step') { st.V = 0; st.hist = [[0, 0]]; } },
      action(key, p) { if (key === 'reset') { st.V = 0; st.hist = [[0, 0]]; return; } if (key === 'drop') { st.V = Math.round((st.V + Number(p.step)) * 100) / 100; st.flash = 1; const excess = Math.max(0, st.V * p.cMn - p.cFe * VFe / 5); st.hist.push([st.V, excess]); } },
      update(dt) { st.flash = Math.max(0, st.flash - dt * 1.5); },
      draw(g, w, h, p, t) {
        const Veq = p.cFe * VFe / (5 * p.cMn);
        const excessMol = Math.max(0, st.V * p.cMn - p.cFe * VFe / 5); // mmol MnO4- dư
        const conc = excessMol / (VFe + 20 + st.V); // M
        const pink = clamp(conc / 0.0006, 0, 1);
        // burette
        const bx = 160, by = 30, bh = 200;
        g.fillStyle = 'rgba(148,163,184,0.12)'; g.fillRect(bx - 8, by, 16, bh); g.strokeStyle = COLORS.glass; g.lineWidth = 2; g.strokeRect(bx - 8, by, 16, bh);
        const lvl = clamp(st.V / 50, 0, 1);
        g.fillStyle = '#7e22ce'; g.fillRect(bx - 6, by + lvl * bh, 12, bh * (1 - lvl));
        for (let i = 0; i <= 10; i++) { line(g, bx + 8, by + i * bh / 10, bx + 14, by + i * bh / 10, '#94a3b8', 1); text(g, String(i * 5), bx + 18, by + i * bh / 10 + 4, { size: 9, color: COLORS.muted }); }
        text(g, 'burette KMnO4', bx, by - 8, { size: 10.5, align: 'center', color: '#c084fc' });
        line(g, bx, by + bh, bx, by + bh + 30, '#94a3b8', 3);
        if (st.flash > 0) circle(g, bx, by + bh + 40 + (1 - st.flash) * 40, 4, '#7e22ce');
        // bình nón
        const fx = bx - 70, fy = by + bh + 70, fw = 140, fh = 140;
        const baseCol = p.acid ? mixColor('#ecfccb', '#fef9c3', clamp(st.V / Math.max(Veq, 0.01), 0, 1)) : '#ecfccb';
        const liquid = mixColor(baseCol, '#db2777', pink * 0.8);
        g.fillStyle = withAlpha(toHex(liquid), 0.75);
        g.beginPath(); g.moveTo(fx + fw / 2 - 18, fy); g.lineTo(fx + fw / 2 + 18, fy); g.lineTo(fx + fw, fy + fh); g.lineTo(fx, fy + fh); g.closePath(); g.fill();
        g.strokeStyle = COLORS.glass; g.lineWidth = 2.5; g.stroke();
        if (st.flash > 0.3 && st.V < Veq) circle(g, fx + fw / 2, fy + 50, 14 * st.flash, `rgba(126,34,206,${st.flash * 0.7})`);
        if (!p.acid && st.V > 0) { g.fillStyle = '#78350f'; g.fillRect(fx + 20, fy + fh - 10, fw - 40, 8); label(g, 'kết tủa nâu MnO2 – thiếu acid!', fx + fw / 2, fy + fh + 22, { size: 10.5, color: COLORS.danger }); }
        text(g, `10 mL Fe²⁺ + H₂SO₄`, fx + fw / 2, fy + fh + (p.acid ? 22 : 42), { size: 10.5, align: 'center', color: COLORS.muted });
        const status = st.V === 0 ? 'chưa nhỏ' : pink > 0.25 ? (st.V - Veq > 0.3 ? 'quá điểm tương đương – hồng/tím đậm' : 'HỒNG NHẠT BỀN → dừng!') : 'mất màu ngay – còn Fe²⁺';
        label(g, status, fx + fw / 2, fy - 18, { size: 11, color: pink > 0.25 ? '#f472b6' : COLORS.text });
        // tính toán & đồ thị
        const rx = 300, rw = w - rx - 30;
        if (rw > 200) {
          text(g, `V(KMnO4) đã nhỏ: ${st.V.toFixed(2)} mL`, rx, 50, { size: 14, weight: '700' });
          const P = plot(g, rx, 80, rw, 180, { xmin: 0, xmax: Math.max(Veq * 1.6, 5), ymin: 0, ymax: Math.max(0.05, p.cMn * Veq * 0.6), xlabel: 'V KMnO4 (mL)', ylabel: 'MnO4⁻ dư (mmol)', title: 'MnO₄⁻ dư theo thể tích' });
          polyline(g, st.hist.map(([v, e]) => [P.X(v), P.Y(e)]), '#c084fc', 2.5);
          for (const [v, e] of st.hist) circle(g, P.X(v), P.Y(e), 3, '#c084fc');
          if (pink > 0.25) {
            const cCalc = 5 * p.cMn * st.V / VFe;
            text(g, `C(Fe²⁺) = 5·C(KMnO₄)·V(KMnO₄)/V(Fe²⁺) = 5·${p.cMn}·${st.V.toFixed(2)}/10 = ${cCalc.toFixed(4)} M`, rx, 300, { size: 12, color: '#4ade80', weight: '700' });
            const err = (cCalc - p.cFe) / p.cFe * 100;
            text(g, `Giá trị thật ${p.cFe} M → sai số ${err >= 0 ? '+' : ''}${err.toFixed(1)}% (do vượt điểm tương đương ${(st.V - Veq).toFixed(2)} mL)`, rx, 324, { size: 11, color: Math.abs(err) < 2 ? '#4ade80' : COLORS.warn });
          } else text(g, 'Nhỏ tới khi dung dịch có màu hồng nhạt bền thì dừng và tính nồng độ.', rx, 300, { size: 11.5, color: COLORS.muted });
        }
      },
      metrics(p) { const Veq = p.cFe * 10 / (5 * p.cMn); return [['V KMnO4 đã dùng', `${st.V.toFixed(2)} mL`], ['Fe2+ còn lại', `${Math.max(0, p.cFe * 10 - 5 * p.cMn * st.V).toFixed(3)} mmol`], ['Đã qua điểm tương đương', st.V >= Veq ? 'có' : 'chưa']]; }
    };
  }
};
function toHex(c) { if (c.startsWith('#')) return c; const m = c.match(/\d+/g); return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join(''); }
