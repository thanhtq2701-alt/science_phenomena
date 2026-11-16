import { COLORS, text, label, circle, line, arrow, roundRect, plot, polyline } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

export default {
  id: 'physics-ac-generator',
  subject: 'physics',
  chapter: 'magnetism',
  title: 'Máy phát điện xoay chiều',
  summary: 'Khung dây quay đều trong từ trường: từ thông biến thiên điều hòa, suất điện động e = E0·sin(ωt). Xem đồ thị Φ(t), e(t) và giá trị hiệu dụng.',
  equation: ['Φ = N·B·S·cos(ωt)', 'e = −dΦ/dt = N·B·S·ω·sin(ωt) = E0·sin(ωt)', 'E0 = N·B·S·ω ;  E = E0/√2 ;  f = ω/2π'],
  keywords: ['máy phát điện', 'dòng điện xoay chiều', 'suất điện động', 'giá trị hiệu dụng', 'tần số', 'khung dây quay'],
  theory: [
    'Máy phát điện xoay chiều gồm **khung dây (phần ứng)** quay đều trong từ trường của **nam châm (phần cảm)**. Góc giữa pháp tuyến khung và B thay đổi → **từ thông biến thiên điều hòa** → suất điện động cảm ứng **hình sin**.',
    '**E0 = N·B·S·ω**: tăng số vòng, từ trường, diện tích hay tốc độ quay đều tăng biên độ. Tần số dòng điện bằng tần số quay (với 1 cặp cực): f = n vòng/giây. Lưới điện Việt Nam: f = 50 Hz.',
    '**Giá trị hiệu dụng** E = E0/√2 là giá trị mà dòng một chiều tương đương sẽ tỏa cùng nhiệt lượng. Vôn kế xoay chiều chỉ giá trị hiệu dụng.',
    'Lưu ý: e cực đại khi **Φ = 0** (khung song song với B – từ thông biến thiên nhanh nhất) và e = 0 khi Φ cực đại.'
  ],
  observe: ['Tăng ω: cả biên độ E0 và tần số đều tăng.', 'Quan sát: khi khung vuông góc B (Φ max) thì e = 0.'],
  exam: ['Viết biểu thức e(t) từ N, B, S, ω; tính E0, E, f.', 'Đồ thị Φ và e lệch pha π/2.'],
  params: [
    { key: 'omega', label: 'Tốc độ góc ω', min: 1, max: 20, step: 0.5, value: 6, unit: 'rad/s', decimals: 1 },
    { key: 'N', label: 'Số vòng N', min: 1, max: 100, step: 1, value: 20 },
    { key: 'B', label: 'Cảm ứng từ B', min: 0.1, max: 1, step: 0.1, value: 0.5, unit: 'T', decimals: 1 },
    { key: 'S', label: 'Diện tích khung S', min: 0.01, max: 0.1, step: 0.01, value: 0.04, unit: 'm²', decimals: 2 }
  ],
  create() {
    const st = { th: 0 };
    return {
      update(dt, p) { st.th += p.omega * dt; },
      draw(g, w, h, p, t) {
        const E0 = p.N * p.B * p.S * p.omega;
        const th = st.th;
        const flux = p.N * p.B * p.S * Math.cos(th), e = E0 * Math.sin(th);
        // máy phát: nhìn từ trên xuống, B hướng sang phải
        const cx = w * 0.27, cy = h / 2 - 20;
        g.fillStyle = '#ef4444'; roundRect(g, cx - 160, cy - 60, 40, 120, 6); g.fill(); text(g, 'N', cx - 140, cy + 6, { size: 18, align: 'center', color: '#fff', weight: '800' });
        g.fillStyle = '#3b82f6'; roundRect(g, cx + 120, cy - 60, 40, 120, 6); g.fill(); text(g, 'S', cx + 140, cy + 6, { size: 18, align: 'center', color: '#fff', weight: '800' });
        for (let i = -2; i <= 2; i++) { const y = cy + i * 24; arrow(g, cx - 115, y, cx + 115, y, 'rgba(56,189,248,0.35)', 1.2, 6); }
        text(g, 'B →', cx, cy - 80, { size: 12, align: 'center', color: '#38bdf8' });
        // khung dây (mặt cắt: đoạn thẳng quay quanh trục giữa)
        const L = 90;
        const ex = Math.cos(th) * L, ey = Math.sin(th) * L * 0.55;
        line(g, cx - ex, cy - ey, cx + ex, cy + ey, '#d97706', 8);
        circle(g, cx - ex, cy - ey, 7, '#fbbf24', '#0b1020'); circle(g, cx + ex, cy + ey, 7, '#fbbf24', '#0b1020');
        // pháp tuyến
        const nx = Math.cos(th + Math.PI / 2), ny = Math.sin(th + Math.PI / 2) * 0.55;
        arrow(g, cx, cy, cx + nx * 50, cy + ny * 50, '#4ade80', 2, 7); text(g, 'n', cx + nx * 60, cy + ny * 60 + 4, { size: 11, align: 'center', color: '#4ade80' });
        circle(g, cx, cy, 5, '#94a3b8');
        // vòng quay chỉ dẫn
        g.strokeStyle = 'rgba(148,163,184,0.5)'; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, cy, L, L * 0.55, 0, 0, TAU); g.stroke();
        label(g, `góc α = ${((th % TAU) * 180 / Math.PI).toFixed(0)}°`, cx, cy + 90, { size: 11 });
        // bóng đèn / tải
        const bx = cx, by = cy + 150;
        line(g, cx - 40, by, cx + 40, by, '#e2e8f0', 2);
        const bright = clamp(Math.abs(e) / (E0 + 1e-9), 0, 1);
        circle(g, bx, by, 16, `rgba(251,191,36,${0.15 + bright * 0.85})`, '#e2e8f0', 2);
        text(g, 'đèn (sáng theo |e|)', bx, by + 34, { size: 10.5, align: 'center', color: COLORS.muted });
        // đồ thị
        const px = w * 0.52, py = 50, pw = w - px - 30, ph = (h - 110) / 2;
        const T = TAU / p.omega, tmax = 2 * T;
        const tt = th / p.omega;
        const t0 = Math.max(0, tt - tmax);
        const fl = [], el = [];
        for (let i = 0; i <= 200; i++) { const s = t0 + (i / 200) * tmax; fl.push([s, p.N * p.B * p.S * Math.cos(p.omega * s)]); el.push([s, E0 * Math.sin(p.omega * s)]); }
        const fmax = p.N * p.B * p.S * 1.1;
        const P1 = plot(g, px, py, pw, ph, { xmin: t0, xmax: t0 + tmax, ymin: -fmax, ymax: fmax, title: 'Từ thông Φ(t) = NBS·cos ωt' });
        polyline(g, [[P1.X(t0), P1.Y(0)], [P1.X(t0 + tmax), P1.Y(0)]], COLORS.grid, 1);
        polyline(g, fl.map((r) => [P1.X(r[0]), P1.Y(r[1])]), '#38bdf8', 2); circle(g, P1.X(tt), P1.Y(flux), 5, '#38bdf8', '#0b1020');
        const P2 = plot(g, px, py + ph + 40, pw, ph, { xmin: t0, xmax: t0 + tmax, ymin: -E0 * 1.1 - 1e-9, ymax: E0 * 1.1 + 1e-9, title: 'Suất điện động e(t) = E0·sin ωt', xlabel: 'thời gian (s)' });
        polyline(g, [[P2.X(t0), P2.Y(0)], [P2.X(t0 + tmax), P2.Y(0)]], COLORS.grid, 1);
        polyline(g, el.map((r) => [P2.X(r[0]), P2.Y(r[1])]), '#f87171', 2); circle(g, P2.X(tt), P2.Y(e), 5, '#f87171', '#0b1020');
      },
      metrics(p) { const E0 = p.N * p.B * p.S * p.omega; return [['E0 = NBSω', `${E0.toFixed(2)} V`], ['E hiệu dụng', `${(E0 / Math.SQRT2).toFixed(2)} V`], ['Tần số f', `${(p.omega / TAU).toFixed(2)} Hz`], ['Chu kì T', `${(TAU / p.omega).toFixed(2)} s`], ['e tức thời', `${(E0 * Math.sin(st.th)).toFixed(2)} V`]]; }
    };
  }
};
