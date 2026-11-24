import { COLORS, text, label, plot, polyline, roundRect, circle, flame, arrow } from '../../core/draw.js';
import { clamp, gauss } from '../../core/engine.js';

export default {
  id: 'physics-charles',
  subject: 'physics',
  chapter: 'ideal-gas',
  title: 'Định luật Charles (đẳng áp) và đẳng tích – độ không tuyệt đối',
  summary: 'Nung khí: ở áp suất không đổi thể tích tăng tỉ lệ với T(K); ở thể tích không đổi áp suất tăng tỉ lệ với T(K). Kéo dài đồ thị cắt trục tại −273 °C.',
  equation: ['Đẳng áp: V/T = hằng số  ⇒  V1/T1 = V2/T2', 'Đẳng tích: p/T = hằng số  ⇒  p1/T1 = p2/T2', 'T(K) = t(°C) + 273'],
  keywords: ['Charles', 'đẳng áp', 'đẳng tích', 'độ không tuyệt đối', 'Kelvin', 'khí lí tưởng'],
  theory: [
    '**Quá trình đẳng áp** (pit-tông tự do): tăng nhiệt độ → phân tử chuyển động nhanh hơn, đẩy pit-tông lên để giữ áp suất không đổi → **V tỉ lệ thuận với T (K)**.',
    '**Quá trình đẳng tích** (bình kín): tăng nhiệt độ → va chạm mạnh và nhiều hơn → **p tỉ lệ thuận với T (K)**.',
    'Kéo dài đường thẳng V–t hoặc p–t về phía nhiệt độ thấp, chúng **cắt trục hoành tại −273,15 °C** = **độ không tuyệt đối** (0 K): nhiệt độ thấp nhất về lí thuyết, khi đó động năng phân tử cực tiểu.'
  ],
  observe: ['Chọn đẳng áp, kéo nhiệt độ: pit-tông lên xuống, điểm chạy trên đường thẳng qua −273 °C.', 'Chọn đẳng tích: áp kế tăng, thể tích giữ nguyên.'],
  exam: ['Bài toán V1/T1 = V2/T2, p1/T1 = p2/T2 (chú ý đổi sang Kelvin).', 'Vẽ và nhận dạng đồ thị các đẳng quá trình trong hệ trục khác nhau.'],
  quiz: {
    question: 'Khí trong xi-lanh có pit-tông tự do (áp suất không đổi) đang ở 27 °C. Nung nóng lên 327 °C thì thể tích khí thay đổi thế nào?',
    options: ['Tăng khoảng 12 lần (327 : 27)', 'Tăng gấp đôi', 'Không đổi', 'Giảm một nửa'],
    answer: 1,
    explanation: 'Ở áp suất không đổi, V tỉ lệ thuận với nhiệt độ tuyệt đối T (K), không phải với °C: 27 °C = 300 K, 327 °C = 600 K, nên thể tích tăng gấp đôi.'
  },
  params: [
    { key: 'mode', label: 'Quá trình', type: 'select', value: 'isobaric', options: [['isobaric', 'Đẳng áp (pit-tông tự do)'], ['isochoric', 'Đẳng tích (bình kín)']] },
    { key: 't', label: 'Nhiệt độ', min: -100, max: 400, step: 5, value: 27, unit: '°C' }
  ],
  create() {
    const st = { mols: [] };
    for (let i = 0; i < 30; i++) st.mols.push({ x: Math.random(), y: Math.random(), vx: gauss(), vy: gauss() });
    return {
      update(dt, p) {
        const T = p.t + 273;
        const sp = 0.4 * Math.sqrt(Math.max(T, 1) / 300);
        for (const m of st.mols) { m.x += m.vx * sp * dt; m.y += m.vy * sp * dt; if (m.x < 0 || m.x > 1) { m.vx *= -1; m.x = clamp(m.x, 0, 1); } if (m.y < 0 || m.y > 1) { m.vy *= -1; m.y = clamp(m.y, 0, 1); } }
      },
      draw(g, w, h, p, t) {
        const T = p.t + 273, T0 = 300;
        const isoP = p.mode === 'isobaric';
        const V = isoP ? 3 * T / T0 : 3; // L
        const pr = isoP ? 100 : 100 * T / T0; // kPa
        const cx = 60, cy = 70, cw = 150, chMax = 330;
        const gasH = clamp(chMax * V / 6.5, 20, chMax);
        g.fillStyle = 'rgba(148,163,184,0.1)'; g.fillRect(cx, cy, cw, chMax);
        g.strokeStyle = COLORS.glass; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + chMax); g.lineTo(cx + cw, cy + chMax); g.lineTo(cx + cw, cy); if (!isoP) g.lineTo(cx, cy); g.stroke();
        const pistonY = cy + chMax - gasH;
        g.fillStyle = `rgba(${Math.round(56 + clamp(p.t, 0, 400) / 400 * 180)},${Math.round(189 - clamp(p.t, 0, 400) / 400 * 120)},248,0.15)`; g.fillRect(cx, pistonY, cw, gasH);
        for (const m of st.mols) circle(g, cx + 6 + m.x * (cw - 12), pistonY + 6 + m.y * (gasH - 12), 4, '#38bdf8');
        if (isoP) { g.fillStyle = '#64748b'; roundRect(g, cx - 2, pistonY - 16, cw + 4, 16, 3); g.fill(); g.fillStyle = '#94a3b8'; g.fillRect(cx + cw / 2 - 6, cy - 40, 12, pistonY - cy - 16 + 40); g.fillStyle = '#475569'; roundRect(g, cx + cw / 2 - 30, cy - 60, 60, 22, 4); g.fill(); text(g, 'quả cân', cx + cw / 2, cy - 45, { size: 10, align: 'center' }); }
        else { // áp kế
          circle(g, cx + cw + 40, cy + 40, 26, '#0f172a', '#e2e8f0', 2); const ang = -Math.PI * 0.75 + clamp(pr / 250, 0, 1) * Math.PI * 1.5; arrow(g, cx + cw + 40, cy + 40, cx + cw + 40 + Math.cos(ang) * 20, cy + 40 + Math.sin(ang) * 20, '#f87171', 2, 6); text(g, 'áp kế', cx + cw + 40, cy + 80, { size: 10, align: 'center', color: COLORS.muted });
        }
        if (p.t > 40) flame(g, cx + cw / 2, cy + chMax + 40, 0.5 + p.t / 400, '#fbbf24', t);
        else if (p.t < 0) label(g, '❄ làm lạnh', cx + cw / 2, cy + chMax + 30, { size: 11, color: '#93c5fd' });
        label(g, `${p.t} °C = ${T} K`, cx + cw / 2, cy + chMax + 60, { size: 11 });
        label(g, isoP ? `V = ${V.toFixed(2)} L, p = ${pr} kPa` : `V = ${V} L, p = ${pr.toFixed(0)} kPa`, cx + cw / 2, pistonY + gasH / 2, { size: 11 });
        // đồ thị
        const px = 300, py = 60, pw = w - px - 30, ph = h - py - 70;
        const ymax = isoP ? 7 : 250;
        const P = plot(g, px, py, pw, ph, { xmin: -300, xmax: 420, ymin: 0, ymax, xlabel: 't (°C)', ylabel: isoP ? 'V (L)' : 'p (kPa)', title: isoP ? 'Đẳng áp: V tỉ lệ với T(K)' : 'Đẳng tích: p tỉ lệ với T(K)' });
        const f = (tt) => isoP ? 3 * (tt + 273) / T0 : 100 * (tt + 273) / T0;
        polyline(g, [[P.X(-273), P.Y(0)], [P.X(-100), P.Y(f(-100))]], 'rgba(148,163,184,0.5)', 1.5, [6, 4]);
        g.setLineDash([6, 4]); polyline(g, [[P.X(-273), P.Y(0)], [P.X(-100), P.Y(f(-100))]], 'rgba(148,163,184,0.5)', 1.5); g.setLineDash([]);
        polyline(g, [[P.X(-100), P.Y(f(-100))], [P.X(400), P.Y(f(400))]], COLORS.physics, 2.5);
        circle(g, P.X(-273), P.Y(0), 5, '#f87171'); text(g, '−273 °C = 0 K', P.X(-273) + 6, P.Y(0) - 10, { size: 10.5, color: '#f87171' });
        circle(g, P.X(p.t), P.Y(f(p.t)), 6, '#fbbf24', '#0b1020');
        text(g, isoP ? `V/T = ${(V / T).toFixed(4)} L/K = hằng số` : `p/T = ${(pr / T).toFixed(3)} kPa/K = hằng số`, px, h - 20, { size: 12, color: COLORS.muted });
      },
      metrics(p) { const T = p.t + 273; const isoP = p.mode === 'isobaric'; return [['T (K)', T], [isoP ? 'V' : 'p', isoP ? `${(3 * T / 300).toFixed(2)} L` : `${(100 * T / 300).toFixed(1)} kPa`], [isoP ? 'V/T' : 'p/T', isoP ? (3 / 300).toFixed(4) : (100 / 300).toFixed(3)]]; }
    };
  }
};
