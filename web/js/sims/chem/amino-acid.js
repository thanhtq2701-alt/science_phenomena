import { COLORS, text, label, beaker, roundRect, line, circle, arrow, mixColor } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'chem-amino-acid',
  subject: 'chem',
  chapter: 'nitrogen',
  title: 'Amino acid lưỡng tính, điện di và phản ứng màu biuret của peptide',
  summary: 'Thay đổi pH để thấy glycine chuyển giữa dạng cation – ion lưỡng cực – anion và di chuyển trong điện trường; peptide từ 2 liên kết peptide trở lên cho màu tím với Cu(OH)2.',
  equation: ['H3N+–CH2–COOH ⇌ H3N+–CH2–COO− ⇌ H2N–CH2–COO−  (pH tăng)', 'H2N–CH2–COOH + HCl → ClH3N–CH2–COOH', 'H2N–CH2–COOH + NaOH → H2N–CH2–COONa + H2O', 'Peptide (≥ 2 liên kết peptide) + Cu(OH)2 → phức màu tím (biuret)'],
  keywords: ['amino acid', 'glycine', 'lưỡng tính', 'điện di', 'peptide', 'biuret', 'pH đẳng điện'],
  theory: [
    'Amino acid chứa cả nhóm **–NH2 (base)** và **–COOH (acid)** nên là chất **lưỡng tính**. Trong tinh thể và dung dịch chúng tồn tại chủ yếu ở dạng **ion lưỡng cực** (zwitterion) H3N+–CH2–COO−.',
    'Ở pH thấp amino acid mang điện dương (di chuyển về cực âm); ở pH cao mang điện âm (di chuyển về cực dương); tại **pH đẳng điện (pI)** tổng điện tích bằng 0, không di chuyển. Với glycine pI ≈ 6,0.',
    'Peptide có từ **2 liên kết peptide trở lên** (tripeptide trở lên) tác dụng với Cu(OH)2 cho **phức màu tím** – phản ứng biuret. Dipeptide **không** có phản ứng này.'
  ],
  observe: ['Kéo pH xuống 2 rồi lên 11: xem điện tích và chiều di chuyển trong điện trường.', 'Đổi số amino acid trong peptide: 2 (dipeptide) → không màu; ≥ 3 → tím.'],
  exam: ['Viết PTHH của amino acid với HCl, NaOH; xác định chiều điện di ở pH cho trước.', 'Nhận biết peptide/protein bằng phản ứng biuret; đếm số liên kết peptide.'],
  params: [
    { key: 'ph', label: 'pH dung dịch', min: 1, max: 13, step: 0.5, value: 6, decimals: 1 },
    { key: 'n', label: 'Số amino acid trong peptide', min: 1, max: 6, step: 1, value: 3 },
    { key: 'field', label: 'Bật điện trường (điện di)', type: 'toggle', value: true }
  ],
  create() {
    const st = { pos: 0, color: 0 };
    const pKa1 = 2.3, pKa2 = 9.6;
    const charge = (ph) => 1 / (1 + Math.pow(10, ph - pKa1)) - 1 / (1 + Math.pow(10, pKa2 - ph));
    return {
      update(dt, p) {
        const q = charge(p.ph);
        if (p.field) st.pos = clamp(st.pos + q * 60 * dt, -150, 150); else st.pos += (0 - st.pos) * dt;
        const target = p.n >= 3 ? 1 : 0;
        st.color += (target - st.color) * (1 - Math.exp(-dt * 1.5));
      },
      draw(g, w, h, p, t) {
        const q = charge(p.ph);
        // ---- Khu điện di ----
        const ex = 40, ey = 60, ew = Math.min(500, w * 0.55), eh = 170;
        text(g, 'Điện di glycine', ex, ey - 14, { size: 14, weight: '700' });
        g.fillStyle = 'rgba(30,41,59,0.6)'; roundRect(g, ex, ey, ew, eh, 10); g.fill();
        // điện cực
        g.fillStyle = '#ef4444'; roundRect(g, ex + 10, ey + 20, 14, eh - 40, 4); g.fill(); text(g, '+', ex + 17, ey + eh / 2 + 5, { size: 16, align: 'center', color: '#fff', weight: '800' });
        g.fillStyle = '#3b82f6'; roundRect(g, ex + ew - 24, ey + 20, 14, eh - 40, 4); g.fill(); text(g, '−', ex + ew - 17, ey + eh / 2 + 5, { size: 16, align: 'center', color: '#fff', weight: '800' });
        text(g, 'anode (+)', ex + 17, ey + eh - 6, { size: 10, align: 'center', color: COLORS.muted });
        text(g, 'cathode (−)', ex + ew - 17, ey + eh - 6, { size: 10, align: 'center', color: COLORS.muted });
        line(g, ex + ew / 2, ey + 10, ex + ew / 2, ey + eh - 10, COLORS.grid, 1, [4, 4]);
        // phân tử glycine
        const mx = ex + ew / 2 - st.pos * (ew / 400), my = ey + eh / 2;
        const form = q > 0.5 ? 'cation' : q < -0.5 ? 'anion' : 'zwitterion';
        const col = form === 'cation' ? '#f87171' : form === 'anion' ? '#60a5fa' : '#a3e635';
        g.fillStyle = col; roundRect(g, mx - 70, my - 22, 140, 44, 10); g.fill();
        const formula = form === 'cation' ? 'H3N⁺–CH2–COOH' : form === 'anion' ? 'H2N–CH2–COO⁻' : 'H3N⁺–CH2–COO⁻';
        text(g, formula, mx, my + 5, { size: 13, align: 'center', color: '#0b1020', weight: '700' });
        label(g, `điện tích trung bình: ${q >= 0 ? '+' : ''}${q.toFixed(2)}`, mx, my - 36, { size: 11, color: col });
        if (p.field && Math.abs(q) > 0.1) arrow(g, mx + (q > 0 ? 80 : -80), my, mx + (q > 0 ? 125 : -125), my, col, 2.5);
        // thang pH
        const sx = ex, sy = ey + eh + 40, sw = ew;
        for (let i = 0; i < 60; i++) { g.fillStyle = mixColor('#ef4444', '#3b82f6', i / 59); g.fillRect(sx + (i / 60) * sw, sy, sw / 60 + 1, 10); }
        const pxh = sx + ((p.ph - 1) / 12) * sw;
        g.fillStyle = '#fff'; g.beginPath(); g.moveTo(pxh, sy - 3); g.lineTo(pxh - 6, sy - 12); g.lineTo(pxh + 6, sy - 12); g.closePath(); g.fill();
        text(g, `pH = ${p.ph}`, pxh, sy - 16, { size: 11, align: 'center' });
        text(g, 'pH 1', sx, sy + 24, { size: 10, color: COLORS.muted }); text(g, 'pH 13', sx + sw, sy + 24, { size: 10, color: COLORS.muted, align: 'right' });
        const pI = (pKa1 + pKa2) / 2; const pix = sx + ((pI - 1) / 12) * sw; line(g, pix, sy - 4, pix, sy + 14, '#a3e635', 2); text(g, `pI ≈ ${pI.toFixed(1)}`, pix, sy + 24, { size: 10, align: 'center', color: '#a3e635' });
        // phần trăm dạng
        const fc = 1 / (1 + Math.pow(10, p.ph - pKa1)), fa = 1 / (1 + Math.pow(10, pKa2 - p.ph)), fz = 1 - fc - fa;
        const rows = [['cation', fc, '#f87171'], ['ion lưỡng cực', fz, '#a3e635'], ['anion', fa, '#60a5fa']];
        rows.forEach((r, i) => { const y = sy + 50 + i * 20; text(g, r[0], sx, y + 9, { size: 11, color: COLORS.muted }); g.fillStyle = r[2]; g.fillRect(sx + 100, y, (sw - 150) * r[1], 12); text(g, `${Math.round(r[1] * 100)}%`, sx + 108 + (sw - 150) * r[1], y + 10, { size: 10.5 }); });

        // ---- Biuret ----
        const bx = ex + ew + 40, bw = w - bx - 20;
        if (bw > 180) {
          text(g, 'Phản ứng biuret', bx, ey - 14, { size: 14, weight: '700' });
          const tubeW = 120;
          const liquid = mixColor('#93c5fd', '#7c3aed', st.color);
          beaker(g, bx + bw / 2 - tubeW / 2, ey, tubeW, 150, 0.7, liquid, { precipitate: p.n >= 3 ? null : '#60a5fa', precipHeight: 6 });
          text(g, `peptide ${p.n} aa + Cu(OH)2`, bx + bw / 2, ey + 170, { size: 11, align: 'center', color: COLORS.muted });
          label(g, p.n >= 3 ? 'MÀU TÍM (≥ 2 liên kết peptide)' : p.n === 2 ? 'không tím (dipeptide, 1 liên kết)' : 'không tím (amino acid)', bx + bw / 2, ey + 190, { size: 11, color: p.n >= 3 ? '#c4b5fd' : COLORS.muted });
          // chuỗi peptide
          const cy = ey + 240, cw = Math.min(bw - 20, 26 * p.n + 40), x0 = bx + bw / 2 - cw / 2;
          for (let i = 0; i < p.n; i++) {
            const x = x0 + 20 + i * ((cw - 40) / Math.max(1, p.n - 1));
            circle(g, x, cy, 11, '#fbbf24'); text(g, 'aa', x, cy + 1, { size: 9, align: 'center', baseline: 'middle', color: '#0b1020', weight: '700' });
            if (i < p.n - 1) { const nx = x0 + 20 + (i + 1) * ((cw - 40) / Math.max(1, p.n - 1)); line(g, x + 11, cy, nx - 11, cy, '#f472b6', 3); text(g, 'CO–NH', (x + nx) / 2, cy - 14, { size: 8.5, align: 'center', color: '#f472b6' }); }
          }
          text(g, `${Math.max(0, p.n - 1)} liên kết peptide`, bx + bw / 2, cy + 32, { size: 11, align: 'center', color: COLORS.muted });
        }
      },
      metrics(p) {
        const q = charge(p.ph);
        return [['Điện tích trung bình', q, 2], ['Dạng chính', q > 0.5 ? 'cation' : q < -0.5 ? 'anion' : 'ion lưỡng cực'], ['Di chuyển về', !p.field ? '—' : Math.abs(q) < 0.1 ? 'đứng yên' : q > 0 ? 'cực âm' : 'cực dương'], ['Liên kết peptide', Math.max(0, p.n - 1)], ['Biuret', p.n >= 3 ? 'tím' : 'không']];
      }
    };
  }
};
