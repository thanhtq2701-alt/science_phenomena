import { COLORS, text, label, circle, line, roundRect, arrow, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'physics-transformer',
  subject: 'physics',
  chapter: 'magnetism',
  title: 'Máy biến áp và truyền tải điện năng đi xa',
  summary: 'Đổi số vòng cuộn sơ cấp/thứ cấp để tăng hoặc hạ áp; truyền tải 1 MW qua đường dây dài với điện áp khác nhau để thấy hao phí giảm theo bình phương điện áp.',
  equation: ['U2 / U1 = N2 / N1  (máy biến áp lí tưởng)', 'I2 / I1 = N1 / N2 ;  P1 ≈ P2', 'Hao phí trên dây: ΔP = P²·R / U²  → tăng U lên n lần, hao phí giảm n² lần'],
  keywords: ['máy biến áp', 'sơ cấp', 'thứ cấp', 'tăng áp', 'hạ áp', 'truyền tải điện', 'hao phí', 'cảm ứng điện từ', 'dòng điện xoay chiều'],
  theory: [
    '**Máy biến áp** gồm lõi thép kĩ thuật điện ghép từ các lá mỏng, hai cuộn dây **sơ cấp N1** (nối nguồn xoay chiều) và **thứ cấp N2** (nối tải). Dòng xoay chiều trong cuộn sơ cấp tạo **từ thông biến thiên** trong lõi; từ thông này qua cuộn thứ cấp sinh suất điện động cảm ứng. Máy **không hoạt động với dòng một chiều**.',
    'Với máy lí tưởng: U2/U1 = N2/N1 và công suất hai cuộn bằng nhau nên I2/I1 = N1/N2. N2 > N1: **máy tăng áp**; N2 < N1: **máy hạ áp**.',
    'Truyền tải điện năng đi xa, hao phí do tỏa nhiệt trên dây ΔP = P²R/U². Vì vậy nhà máy dùng máy **tăng áp** lên 110–500 kV trước khi truyền, đến nơi tiêu thụ dùng máy **hạ áp** xuống 220 V.'
  ],
  observe: ['N2 > N1: đèn tải sáng hơn, dòng thứ cấp nhỏ hơn sơ cấp.', 'Chuyển nguồn sang một chiều: không có điện áp ra.', 'Tăng điện áp truyền tải từ 22 kV lên 220 kV: hao phí giảm 100 lần.'],
  exam: ['Tính U2, I2, N2 của máy biến áp; xác định máy tăng hay hạ áp.', 'Tính hao phí, hiệu suất truyền tải; điện áp cần thiết để giảm hao phí.'],
  quiz: {
    question: 'Máy biến áp lí tưởng có N1 = 200 vòng, N2 = 400 vòng, cuộn sơ cấp nối nguồn xoay chiều 12 V. Điện áp ở cuộn thứ cấp bằng bao nhiêu?',
    options: ['6 V', '12 V', '24 V', '48 V'],
    answer: 2,
    explanation: 'Với máy biến áp lí tưởng U2/U1 = N2/N1 = 400/200 = 2, nên U2 = 24 V. Đây là máy tăng áp; dòng điện ở cuộn thứ cấp giảm còn một nửa.'
  },
  params: [
    { key: 'N1', label: 'Số vòng sơ cấp N1', min: 50, max: 1000, step: 50, value: 200 },
    { key: 'N2', label: 'Số vòng thứ cấp N2', min: 50, max: 2000, step: 50, value: 400 },
    { key: 'U1', label: 'Điện áp nguồn U1 (hiệu dụng)', min: 6, max: 240, step: 6, value: 12, unit: 'V' },
    { key: 'ac', label: 'Nguồn xoay chiều', type: 'toggle', value: true },
    { key: 'Uline', label: 'Điện áp truyền tải', min: 10, max: 500, step: 10, value: 110, unit: 'kV' }
  ],
  create() {
    const st = { ph: 0 };
    return {
      update(dt) { st.ph += dt * 6; },
      draw(g, w, h, p, t) {
        const ratio = p.N2 / p.N1;
        const U2 = p.ac ? p.U1 * ratio : 0;
        const Rload = 20;
        const I2 = U2 / Rload, I1 = p.ac ? I2 * ratio : 0;
        // lõi thép
        const cx = 60, cy = 60, cw = 300, chh = 220;
        g.fillStyle = '#475569'; roundRect(g, cx, cy, cw, chh, 6); g.fill(); g.fillStyle = '#0b1020'; roundRect(g, cx + 50, cy + 50, cw - 100, chh - 100, 4); g.fill();
        // từ thông chạy trong lõi
        if (p.ac) { const a = Math.sin(st.ph); for (let i = 0; i < 6; i++) { const u = ((st.ph * 0.15 + i / 6) % 1); const path = loopPos(cx + 25, cy + 25, cw - 50, chh - 50, a >= 0 ? u : 1 - u); circle(g, path[0], path[1], 3.5, `rgba(56,189,248,${Math.abs(a)})`); } }
        // cuộn dây
        const coil = (x, n, color) => { const turns = clamp(Math.round(n / 50), 2, 30); for (let i = 0; i < turns; i++) { const y = cy + 55 + i * ((chh - 110) / turns); g.strokeStyle = color; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x, y, 32, 4, 0, 0, Math.PI * 2); g.stroke(); } };
        coil(cx + 25, p.N1, '#f97316'); coil(cx + cw - 25, p.N2, '#4ade80');
        text(g, `N1 = ${p.N1}`, cx + 25, cy + chh + 22, { size: 11.5, align: 'center', color: '#f97316' }); text(g, `N2 = ${p.N2}`, cx + cw - 25, cy + chh + 22, { size: 11.5, align: 'center', color: '#4ade80' });
        // nguồn và tải
        text(g, p.ac ? `~ ${p.U1} V` : `— ${p.U1} V (một chiều)`, cx - 10, cy - 20, { size: 12, color: '#f97316', weight: '700' });
        const bright = clamp(U2 / 60, 0, 1);
        circle(g, cx + cw + 60, cy + chh / 2, 22, `rgba(251,191,36,${0.1 + bright * 0.9})`, '#e2e8f0', 2);
        line(g, cx + cw - 25, cy + 40, cx + cw + 60, cy + 40, '#e2e8f0', 2); line(g, cx + cw + 60, cy + 40, cx + cw + 60, cy + chh / 2 - 22, '#e2e8f0', 2);
        line(g, cx + cw - 25, cy + chh - 40, cx + cw + 60, cy + chh - 40, '#e2e8f0', 2); line(g, cx + cw + 60, cy + chh - 40, cx + cw + 60, cy + chh / 2 + 22, '#e2e8f0', 2);
        label(g, p.ac ? (ratio > 1 ? 'MÁY TĂNG ÁP' : ratio < 1 ? 'MÁY HẠ ÁP' : 'N1 = N2') : 'dòng một chiều: Φ không đổi → U2 = 0', cx + cw / 2, cy - 22, { size: 11.5, color: p.ac ? '#4ade80' : COLORS.danger });
        text(g, `U2 = U1·N2/N1 = ${U2.toFixed(1)} V   I1 = ${I1.toFixed(2)} A   I2 = ${I2.toFixed(2)} A (tải 20 Ω)`, cx, cy + chh + 48, { size: 11.5 });
        // truyền tải
        const ty = cy + chh + 90, tw = w - 100;
        if (h - ty > 110) {
          text(g, 'Truyền tải P = 1 MW qua đường dây có R = 10 Ω', 40, ty, { size: 13, weight: '700' });
          const Pw = 1e6, Rl = 10, U = p.Uline * 1000;
          const loss = Pw * Pw * Rl / (U * U);
          const eff = clamp(1 - loss / Pw, 0, 1);
          // sơ đồ
          const y = ty + 40;
          const nodes = [['Nhà máy', 40], ['Tăng áp', 40 + tw * 0.2], ['Đường dây ' + p.Uline + ' kV', 40 + tw * 0.5], ['Hạ áp', 40 + tw * 0.8], ['Nhà dân 220 V', 40 + tw]];
          for (let i = 0; i < nodes.length - 1; i++) line(g, nodes[i][1], y, nodes[i + 1][1], y, i === 2 || i === 1 ? '#fbbf24' : '#94a3b8', i === 2 || i === 1 ? 3 : 2);
          nodes.forEach(([nm, x]) => { circle(g, x, y, 7, '#334155', '#e2e8f0'); text(g, nm, x, y + 22, { size: 10, align: 'center', color: COLORS.muted }); });
          const heat = clamp(loss / Pw, 0, 1); for (let i = 0; i < 8; i++) { const x = nodes[1][1] + (nodes[3][1] - nodes[1][1]) * (i + 0.5) / 8; text(g, '〰', x, y - 10 - ((t * 20 + i * 7) % 12), { size: 10, align: 'center', color: `rgba(248,113,113,${heat * 4})` }); }
          bar(g, 40, y + 46, Math.min(400, tw * 0.6), 10, Math.min(1, loss / Pw * 5), '#f87171', `Hao phí ΔP = P²R/U² = ${loss >= 1000 ? (loss / 1000).toFixed(1) + ' kW' : loss.toFixed(0) + ' W'} (${(loss / Pw * 100).toFixed(2)}%)`);
          text(g, `Hiệu suất truyền tải: ${(eff * 100).toFixed(2)}%`, 40 + Math.min(400, tw * 0.6) + 20, y + 56, { size: 12, color: eff > 0.95 ? '#4ade80' : '#fbbf24', weight: '700' });
        }
      },
      metrics(p) { const U2 = p.ac ? p.U1 * p.N2 / p.N1 : 0; const loss = 1e12 * 10 / Math.pow(p.Uline * 1000, 2); return [['U2', `${U2.toFixed(1)} V`], ['Tỉ số N2/N1', (p.N2 / p.N1).toFixed(2)], ['Loại', !p.ac ? 'không hoạt động' : p.N2 > p.N1 ? 'tăng áp' : p.N2 < p.N1 ? 'hạ áp' : '—'], ['Hao phí truyền tải', `${(loss / 1000).toFixed(2)} kW`]]; }
    };
  }
};
function loopPos(x, y, w, h, u) { const per = 2 * (w + h); let d = u * per; if (d < w) return [x + d, y]; d -= w; if (d < h) return [x + w, y + d]; d -= h; if (d < w) return [x + w - d, y + h]; d -= w; return [x, y + h - d]; }
