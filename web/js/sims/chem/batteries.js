import { COLORS, text, label, beaker, circle, line, roundRect, arrow, Bubbles, withAlpha, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'chem-batteries',
  subject: 'chem',
  chapter: 'electrochem',
  title: 'Acquy chì và pin nhiên liệu hydrogen',
  summary: 'Acquy chì phóng điện rồi được nạp lại (phản ứng thuận nghịch); pin nhiên liệu H2–O2 tạo điện liên tục khi được cấp khí, sản phẩm chỉ là nước.',
  equation: ['Acquy chì phóng: Pb + PbO2 + 2H2SO4 → 2PbSO4 + 2H2O (E ≈ 2 V/ngăn) ; nạp: ngược lại', 'Pin nhiên liệu: anode 2H2 → 4H+ + 4e ; cathode O2 + 4H+ + 4e → 2H2O ; tổng 2H2 + O2 → 2H2O (E° = 1,23 V)'],
  keywords: ['acquy', 'pin nhiên liệu', 'nạp điện', 'phóng điện', 'pin thứ cấp', 'pin sơ cấp', 'hydrogen', 'ô tô điện'],
  theory: [
    '**Pin sơ cấp** (pin Zn–C, pin kiềm) dùng một lần. **Pin thứ cấp (acquy)** nạp lại được vì phản ứng ở điện cực **thuận nghịch**: khi phóng điện là pin Galvani, khi nạp là bình điện phân (dòng ngoài ép phản ứng chạy ngược).',
    '**Acquy chì**: anode Pb, cathode PbO2 trong H2SO4 ~30%. Khi phóng, cả hai điện cực đều thành PbSO4 và nồng độ acid giảm (đo tỉ khối để biết mức sạc). Ghép 6 ngăn được 12 V.',
    '**Pin nhiên liệu** biến hóa năng của nhiên liệu (H2, CH3OH) thành điện liên tục, hiệu suất cao (~60%), không phát thải CO2 tại chỗ; dùng cho ô tô, tàu vũ trụ. Thách thức: sản xuất và lưu trữ H2.'
  ],
  observe: ['Phóng điện tới 0% rồi bật "Nạp": PbSO4 chuyển lại thành Pb và PbO2, nồng độ acid tăng.', 'Pin nhiên liệu: tắt cấp H2 → điện áp về 0 ngay.'],
  exam: ['Viết quá trình điện cực khi phóng/nạp acquy; tính điện lượng, khối lượng Pb tiêu thụ.', 'So sánh pin Galvani, acquy, pin nhiên liệu.'],
  params: [
    { key: 'type', label: 'Thiết bị', type: 'select', value: 'lead', options: [['lead', 'Acquy chì'], ['fuel', 'Pin nhiên liệu H2–O2']] },
    { key: 'mode', label: 'Chế độ (acquy)', type: 'select', value: 'discharge', options: [['discharge', 'Phóng điện (dùng)'], ['charge', 'Nạp điện']] },
    { key: 'load', label: 'Dòng điện', min: 0.5, max: 10, step: 0.5, value: 3, unit: 'A', decimals: 1 },
    { key: 'h2', label: 'Cấp H2 cho pin nhiên liệu', type: 'toggle', value: true }
  ],
  create() {
    const st = { soc: 0.9, q: 0, bub: new Bubbles(), water: 0 };
    return {
      update(dt, p) {
        if (p.type === 'lead') {
          const d = p.load * dt * 0.01;
          st.soc = clamp(st.soc + (p.mode === 'charge' ? d : -d), 0, 1);
          st.q += p.load * dt;
          if (p.mode === 'charge' && st.soc > 0.95 && st.geo && Math.random() < 0.5) st.bub.spawn(st.geo.x, st.geo.y, 1, { spread: 80 });
        } else if (p.h2) { st.q += p.load * dt; st.water = clamp(st.water + dt * 0.02 * p.load, 0, 1); }
        if (st.geo) st.bub.update(dt, st.geo.top);
      },
      draw(g, w, h, p, t) {
        if (p.type === 'lead') {
          const bx = 60, by = 100, bw = 260, bh = 220;
          const acid = 1.1 + 0.2 * st.soc;
          const r = beaker(g, bx, by, bw, bh, 0.8, withAlpha('#bfdbfe', 0.3), { title: `H2SO4, tỉ khối ≈ ${acid.toFixed(2)} g/mL` });
          st.geo = { x: bx + bw / 2, y: by + bh - 20, top: r.top };
          const sulf = 1 - st.soc;
          // Pb (anode) và PbO2 (cathode) với lớp PbSO4
          const ex = [bx + 70, bx + bw - 70];
          ex.forEach((x, i) => { g.fillStyle = i === 0 ? '#64748b' : '#7c2d12'; roundRect(g, x - 14, by - 20, 28, bh - 30, 3); g.fill(); g.fillStyle = `rgba(241,245,249,${sulf * 0.9})`; roundRect(g, x - 14, by + 40, 28, bh - 90, 3); g.fill(); text(g, i === 0 ? 'Pb' : 'PbO₂', x, by - 28, { size: 11, align: 'center', weight: '700' }); if (sulf > 0.3) text(g, 'PbSO₄', x, by + bh / 2, { size: 9, align: 'center', color: '#0b1020', weight: '800' }); });
          st.bub.draw(g);
          // mạch ngoài
          const wy = 50; line(g, ex[0], by - 20, ex[0], wy, '#e2e8f0', 2); line(g, ex[1], by - 20, ex[1], wy, '#e2e8f0', 2); line(g, ex[0], wy, ex[1], wy, '#e2e8f0', 2);
          const mid = (ex[0] + ex[1]) / 2;
          if (p.mode === 'discharge') { circle(g, mid, wy, 16, `rgba(251,191,36,${0.2 + st.soc * 0.8})`, '#e2e8f0', 2); text(g, 'đèn', mid, wy + 30, { size: 10, align: 'center', color: COLORS.muted }); arrow(g, mid - 60, wy - 12, mid - 30, wy - 12, '#fbbf24', 2); text(g, 'e⁻', mid - 45, wy - 18, { size: 9, align: 'center', color: '#fde68a' }); }
          else { g.fillStyle = '#0f172a'; roundRect(g, mid - 24, wy - 12, 48, 24, 5); g.fill(); g.strokeStyle = '#e2e8f0'; g.stroke(); text(g, 'bộ sạc', mid, wy + 4, { size: 9.5, align: 'center' }); arrow(g, mid + 30, wy - 12, mid + 60, wy - 12, '#60a5fa', 2); }
          label(g, p.mode === 'discharge' ? 'phóng: Pb + PbO₂ + 2H₂SO₄ → 2PbSO₄ + 2H₂O' : 'nạp: 2PbSO₄ + 2H₂O → Pb + PbO₂ + 2H₂SO₄', bx + bw / 2, by + bh + 40, { size: 10.5 });
          if (p.mode === 'charge' && st.soc > 0.95) label(g, 'đầy: điện phân nước → sủi bọt H₂, O₂', bx + bw / 2, by - 50, { size: 10.5, color: COLORS.warn });
          const rx = bx + bw + 60, rw = w - rx - 30;
          if (rw > 160) {
            text(g, 'Trạng thái acquy', rx, 90, { size: 13, weight: '700' });
            bar(g, rx, 120, rw, 14, st.soc, st.soc > 0.3 ? '#4ade80' : '#f87171', `Mức sạc: ${Math.round(st.soc * 100)}%`);
            text(g, `Điện áp ≈ ${(1.8 + 0.3 * st.soc).toFixed(2)} V / ngăn  (×6 = ${((1.8 + 0.3 * st.soc) * 6).toFixed(1)} V)`, rx, 165, { size: 11.5 });
            text(g, `Điện lượng đã qua: ${st.q.toFixed(0)} C = ${(st.q / 3600).toFixed(3)} Ah`, rx, 190, { size: 11.5, color: COLORS.muted });
            text(g, `Pb tiêu thụ (phóng): ${(st.q / (2 * 96485) * 207).toFixed(2)} g`, rx, 212, { size: 11.5, color: COLORS.muted });
            ['Phóng điện: pin Galvani (hóa → điện)', 'Nạp điện: bình điện phân (điện → hóa)', 'Thuận nghịch → pin thứ cấp'].forEach((s, i) => text(g, s, rx, 250 + i * 20, { size: 11, color: COLORS.muted }));
          }
        } else {
          // pin nhiên liệu
          const cx = w * 0.32, cy = h / 2 - 20;
          g.fillStyle = 'rgba(30,41,59,0.6)'; roundRect(g, cx - 140, cy - 100, 280, 200, 12); g.fill();
          g.fillStyle = '#334155'; g.fillRect(cx - 70, cy - 90, 14, 180); g.fillRect(cx + 56, cy - 90, 14, 180);
          g.fillStyle = 'rgba(167,139,250,0.3)'; g.fillRect(cx - 10, cy - 90, 20, 180); text(g, 'màng trao đổi H⁺', cx, cy + 110, { size: 9.5, align: 'center', color: '#c4b5fd' });
          text(g, 'anode (Pt)', cx - 63, cy - 100, { size: 9.5, align: 'center', color: '#f87171' }); text(g, 'cathode (Pt)', cx + 63, cy - 100, { size: 9.5, align: 'center', color: '#60a5fa' });
          if (p.h2) { for (let i = 0; i < 4; i++) { const u = (t * 0.5 + i / 4) % 1; circle(g, cx - 120 + u * 45, cy - 60 + i * 30, 5, '#e2e8f0'); text(g, 'H₂', cx - 120 + u * 45, cy - 68 + i * 30, { size: 8, align: 'center', color: COLORS.muted }); } for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; circle(g, cx - 56 + u * 46, cy - 40 + i * 35, 3.5, '#f472b6'); text(g, 'H⁺', cx - 56 + u * 46, cy - 48 + i * 35, { size: 8, align: 'center', color: '#f9a8d4' }); } }
          for (let i = 0; i < 4; i++) { const u = (t * 0.5 + i / 4) % 1; circle(g, cx + 125 - u * 45, cy - 60 + i * 30, 6, '#38bdf8'); text(g, 'O₂', cx + 125 - u * 45, cy - 69 + i * 30, { size: 8, align: 'center', color: COLORS.muted }); }
          if (p.h2) { for (let i = 0; i < 3; i++) { const u = (t * 0.4 + i / 3) % 1; circle(g, cx + 63, cy + 60 + u * 40, 5, '#60a5fa'); } text(g, 'H₂O ra', cx + 63, cy + 92, { size: 9, align: 'center', color: '#93c5fd' }); }
          // mạch
          const wy = cy - 130; line(g, cx - 63, cy - 90, cx - 63, wy, '#e2e8f0', 2); line(g, cx + 63, cy - 90, cx + 63, wy, '#e2e8f0', 2); line(g, cx - 63, wy, cx + 63, wy, '#e2e8f0', 2);
          circle(g, cx, wy, 14, `rgba(251,191,36,${p.h2 ? 1 : 0.15})`, '#e2e8f0', 2); if (p.h2) { arrow(g, cx - 50, wy - 12, cx - 20, wy - 12, '#fbbf24', 2); text(g, 'e⁻', cx - 35, wy - 18, { size: 9, align: 'center', color: '#fde68a' }); }
          label(g, p.h2 ? 'E ≈ 1,23 V – chạy liên tục khi còn H₂' : 'ngắt H₂ → E = 0', cx, cy + 130, { size: 11, color: p.h2 ? '#4ade80' : '#f87171' });
          const rx = cx + 170, rw = w - rx - 30;
          if (rw > 160) {
            text(g, 'Pin nhiên liệu H₂–O₂', rx, 80, { size: 13, weight: '700' });
            ['Anode: 2H₂ → 4H⁺ + 4e', 'Cathode: O₂ + 4H⁺ + 4e → 2H₂O', 'Tổng: 2H₂ + O₂ → 2H₂O, E° = 1,23 V', '', 'Nhiên liệu cấp liên tục → không "hết pin"', 'Sản phẩm: nước; hiệu suất ~60%', 'Khó khăn: sản xuất, lưu trữ H₂'].forEach((s, i) => text(g, s, rx, 108 + i * 22, { size: 11.5, color: i < 3 ? COLORS.text : COLORS.muted }));
            text(g, `Điện lượng: ${st.q.toFixed(0)} C → H₂ tiêu thụ ${(st.q / (2 * 96485) * 2).toFixed(3)} g, H₂O tạo ${(st.q / (2 * 96485) * 18).toFixed(2)} g`, rx, 280, { size: 11, color: COLORS.warn });
          }
        }
      },
      metrics(p) { return p.type === 'lead' ? [['Mức sạc', `${Math.round(st.soc * 100)} %`], ['Điện áp / ngăn', `${(1.8 + 0.3 * st.soc).toFixed(2)} V`], ['Chế độ', p.mode === 'charge' ? 'nạp (điện phân)' : 'phóng (pin)']] : [['Điện áp', p.h2 ? '1.23 V' : '0 V'], ['H2 tiêu thụ', `${(st.q / (2 * 96485) * 2).toFixed(3)} g`], ['Nước tạo thành', `${(st.q / (2 * 96485) * 18).toFixed(2)} g`]]; }
    };
  }
};
