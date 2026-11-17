import { COLORS, text, label, circle, roundRect, arrow, bar, plot, polyline } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'bio-carbon-cycle',
  subject: 'bio',
  chapter: 'ecology',
  title: 'Chu trình carbon và hiệu ứng nhà kính',
  summary: 'Carbon đi vòng giữa khí quyển, sinh vật, đại dương và nhiên liệu hóa thạch qua quang hợp, hô hấp, phân giải và đốt cháy. Tăng đốt nhiên liệu hay phá rừng để thấy CO2 khí quyển tăng.',
  equation: ['Quang hợp: 6CO2 + 6H2O →(ánh sáng) C6H12O6 + 6O2', 'Hô hấp / phân giải: C6H12O6 + 6O2 → 6CO2 + 6H2O', 'Đốt cháy nhiên liệu hóa thạch: C + O2 → CO2'],
  keywords: ['chu trình carbon', 'chu trình sinh địa hóa', 'quang hợp', 'hô hấp', 'CO2', 'hiệu ứng nhà kính', 'nhiên liệu hóa thạch', 'biến đổi khí hậu', 'phá rừng'],
  theory: [
    '**Chu trình sinh địa hóa** là sự trao đổi liên tục các nguyên tố giữa môi trường và quần xã. Trong **chu trình carbon**, thực vật lấy CO2 qua **quang hợp** tạo chất hữu cơ; carbon đi qua chuỗi thức ăn; trở lại khí quyển qua **hô hấp** của mọi sinh vật và **phân giải** của vi sinh vật. Một phần lắng đọng thành **than, dầu, đá vôi** và tách khỏi chu trình lâu dài.',
    'Đại dương hòa tan lượng lớn CO2 (tạo HCO3−, CaCO3 vỏ sinh vật). Con người **đốt nhiên liệu hóa thạch** và **phá rừng** làm CO2 khí quyển tăng nhanh hơn khả năng hấp thụ → tăng **hiệu ứng nhà kính**, Trái Đất nóng lên.',
    'Giải pháp: trồng và bảo vệ rừng, năng lượng tái tạo, tiết kiệm năng lượng, thu giữ carbon.'
  ],
  observe: ['Tăng đốt nhiên liệu: CO2 khí quyển và nhiệt độ tăng dần.', 'Tăng diện tích rừng: quang hợp hấp thụ nhiều hơn, CO2 tăng chậm lại.', 'Đặt đốt nhiên liệu = 0: hệ dần cân bằng.'],
  exam: ['Mô tả chu trình carbon; vai trò của sinh vật sản xuất và phân giải.', 'Nguyên nhân, hậu quả và giải pháp cho hiệu ứng nhà kính.'],
  params: [
    { key: 'fossil', label: 'Đốt nhiên liệu hóa thạch', min: 0, max: 10, step: 0.5, value: 4, unit: 'Gt C/năm', decimals: 1 },
    { key: 'forest', label: 'Diện tích rừng', min: 20, max: 150, step: 5, value: 100, unit: '%' },
    { key: 'speed', label: 'Năm / giây', min: 1, max: 20, step: 1, value: 5 }
  ],
  create() {
    const st = { atm: 850, year: 2000, hist: [], ph: 0 };
    return {
      update(dt, p) {
        const yrs = dt * p.speed; st.ph += dt;
        // Đơn vị Gt C/năm. Khi fossil = 0, rừng 100% và atm = 850 Gt C thì hệ cân bằng (dC = 0).
        const forestF = p.forest / 100;
        const photo = 120 * forestF * Math.pow(st.atm / 850, 0.15);
        const resp = 60 * forestF + 60; // hô hấp thực vật + phân giải đất
        const ocean = 0.01 * (st.atm - 850); // đại dương hấp thụ phần dư
        const deforest = Math.max(0, 1 - forestF) * 2; // phá rừng giải phóng carbon sinh khối
        const dC = (p.fossil + resp - photo - ocean + deforest) * yrs;
        st.atm = clamp(st.atm + dC, 500, 3000); st.year += yrs;
        if (!st.hist.length || st.year - st.hist[st.hist.length - 1][0] >= 1) { st.hist.push([st.year, st.atm]); if (st.hist.length > 400) st.hist.shift(); }
      },
      draw(g, w, h, p, t) {
        const ppm = st.atm / 2.13; const dT = 3 * Math.log2(ppm / 280);
        const boxes = { atm: [w * 0.32, 60, 'Khí quyển CO₂', '#38bdf8'], plant: [w * 0.1, 220, 'Thực vật', '#4ade80'], animal: [w * 0.32, 300, 'Động vật', '#fbbf24'], decomp: [w * 0.1, 380, 'Phân giải / đất', '#a16207'], ocean: [w * 0.54, 220, 'Đại dương', '#3b82f6'], fossil: [w * 0.54, 380, 'Than, dầu, khí', '#64748b'] };
        const W0 = Math.min(150, w * 0.18);
        const flows = [['atm', 'plant', 'quang hợp', 1 * p.forest / 100], ['plant', 'atm', 'hô hấp', 0.5], ['plant', 'animal', 'ăn', 0.4], ['animal', 'atm', 'hô hấp', 0.3], ['plant', 'decomp', 'xác', 0.4], ['decomp', 'atm', 'phân giải', 0.5], ['atm', 'ocean', 'hòa tan', 0.4], ['fossil', 'atm', 'đốt cháy', p.fossil / 6]];
        for (const [a, b, nm, s] of flows) {
          const A = boxes[a], B = boxes[b]; const x1 = A[0] + W0 / 2, y1 = A[1] + 22, x2 = B[0] + W0 / 2, y2 = B[1] + 22; const off = a < b ? 8 : -8;
          if (s <= 0) continue;
          arrow(g, x1 + off, y1 + (y2 > y1 ? 22 : -22), x2 + off, y2 + (y2 > y1 ? -22 : 22), a === 'fossil' ? '#f87171' : 'rgba(148,163,184,0.7)', 1 + s * 3, 8);
          const u = (st.ph * 0.4 + flows.indexOf(flows.find((f) => f[0] === a && f[1] === b)) * 0.13) % 1; circle(g, x1 + off + (x2 - x1) * u, y1 + (y2 - y1) * u, 3 + s * 2, '#e2e8f0');
          text(g, nm, (x1 + x2) / 2 + off * 3, (y1 + y2) / 2, { size: 9.5, align: 'center', color: a === 'fossil' ? '#fca5a5' : COLORS.muted });
        }
        for (const [k, [x, y, nm, c]] of Object.entries(boxes)) { g.fillStyle = c; g.globalAlpha = 0.85; roundRect(g, x, y, W0, 44, 8); g.fill(); g.globalAlpha = 1; text(g, nm, x + W0 / 2, y + 26, { size: 11.5, align: 'center', color: '#0b1020', weight: '800' }); }
        // đồ thị
        const px = w * 0.76, pw = w - px - 20, ph = h - 160;
        if (pw > 120) {
          const y0 = st.hist.length ? st.hist[0][0] : 2000;
          const P = plot(g, px, 60, pw, ph, { xmin: y0, xmax: Math.max(y0 + 50, st.year), ymin: 250, ymax: 1000, xlabel: 'năm', ylabel: 'ppm', title: 'CO₂ khí quyển' });
          polyline(g, st.hist.map(([y, c]) => [P.X(y), P.Y(c / 2.13)]), '#f87171', 2.5);
          text(g, `${ppm.toFixed(0)} ppm`, px, h - 70, { size: 13, weight: '700', color: ppm > 450 ? '#f87171' : COLORS.text });
          bar(g, px, h - 50, pw, 9, clamp(dT / 5, 0, 1), '#f97316', `Nóng lên ≈ +${dT.toFixed(1)} °C so với tiền công nghiệp`);
        }
      },
      metrics() { const ppm = st.atm / 2.13; return [['Năm', Math.floor(st.year)], ['CO₂ khí quyển', `${ppm.toFixed(0)} ppm`], ['Nhiệt độ tăng', `${(3 * Math.log2(ppm / 280)).toFixed(2)} °C`]]; }
    };
  }
};
