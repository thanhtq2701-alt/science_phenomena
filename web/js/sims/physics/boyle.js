import { COLORS, text, label, plot, polyline, roundRect, circle, arrow } from '../../core/draw.js';
import { clamp, gauss } from '../../core/engine.js';

export default {
  id: 'physics-boyle',
  subject: 'physics',
  chapter: 'ideal-gas',
  title: 'Định luật Boyle: quá trình đẳng nhiệt',
  summary: 'Nén pit-tông ở nhiệt độ không đổi: thể tích giảm thì áp suất tăng, tích p·V không đổi. Đường đẳng nhiệt là hypebol.',
  equation: ['p·V = hằng số  (T không đổi)', 'p1·V1 = p2·V2'],
  keywords: ['Boyle', 'đẳng nhiệt', 'áp suất', 'thể tích', 'khí lí tưởng', 'hypebol'],
  theory: [
    'Ở **nhiệt độ không đổi**, áp suất của một lượng khí xác định **tỉ lệ nghịch với thể tích**. Giải thích: nén khí → phân tử ở gần nhau hơn → **số va chạm lên thành bình trong một giây tăng** → áp suất tăng (tốc độ phân tử không đổi vì T không đổi).',
    'Đồ thị p–V là **đường hypebol** (đường đẳng nhiệt); đường đẳng nhiệt ở nhiệt độ cao nằm phía trên.',
    'Ứng dụng: bơm xe đạp, hô hấp (cơ hoành thay đổi thể tích lồng ngực → áp suất).'
  ],
  observe: ['Kéo thể tích từ 5 L xuống 1 L: áp suất tăng 5 lần, điểm chạy trên hypebol.', 'Đổi nhiệt độ để thấy họ đường đẳng nhiệt khác nhau.'],
  exam: ['Bài toán p1V1 = p2V2; nhận dạng đồ thị đẳng nhiệt trong các hệ trục p–V, p–T, V–T.'],
  params: [
    { key: 'V', label: 'Thể tích', min: 1, max: 5, step: 0.1, value: 3, unit: 'L', decimals: 1 },
    { key: 'T', label: 'Nhiệt độ (giữ không đổi)', min: 200, max: 500, step: 10, value: 300, unit: 'K' }
  ],
  create() {
    const n = 0.1; // mol
    const st = { mols: [], hits: 0, hitRate: 0, acc: 0 };
    for (let i = 0; i < 40; i++) st.mols.push({ x: Math.random(), y: Math.random(), vx: gauss(), vy: gauss() });
    return {
      update(dt, p) {
        const sp = 0.4 * Math.sqrt(p.T / 300);
        let hits = 0;
        for (const m of st.mols) {
          m.x += m.vx * sp * dt; m.y += m.vy * sp * dt;
          if (m.x < 0) { m.x = 0; m.vx *= -1; hits++; } if (m.x > 1) { m.x = 1; m.vx *= -1; hits++; }
          if (m.y < 0) { m.y = 0; m.vy *= -1; hits++; } if (m.y > 1) { m.y = 1; m.vy *= -1; hits++; }
        }
        st.hits += hits; st.acc += dt;
        if (st.acc > 0.5) { st.hitRate = st.hits / st.acc; st.hits = 0; st.acc = 0; }
      },
      draw(g, w, h, p) {
        const pressure = n * 8.314 * p.T / (p.V / 1000) / 1000; // kPa
        // xi lanh
        const cx = 60, cy = 70, cw = 150, chMax = 330;
        const gasH = chMax * (p.V / 5);
        g.fillStyle = 'rgba(148,163,184,0.1)'; g.fillRect(cx, cy, cw, chMax);
        g.strokeStyle = COLORS.glass; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + chMax); g.lineTo(cx + cw, cy + chMax); g.lineTo(cx + cw, cy); g.stroke();
        const pistonY = cy + chMax - gasH;
        g.fillStyle = 'rgba(56,189,248,0.12)'; g.fillRect(cx, pistonY, cw, gasH);
        for (const m of st.mols) circle(g, cx + 6 + m.x * (cw - 12), pistonY + 6 + m.y * (gasH - 12), 4, '#38bdf8');
        g.fillStyle = '#64748b'; roundRect(g, cx - 2, pistonY - 16, cw + 4, 16, 3); g.fill();
        g.fillStyle = '#94a3b8'; g.fillRect(cx + cw / 2 - 6, cy - 40, 12, pistonY - cy - 16 + 40);
        arrow(g, cx + cw / 2, pistonY - 60, cx + cw / 2, pistonY - 30, '#fbbf24', 3);
        label(g, `V = ${p.V.toFixed(1)} L`, cx + cw / 2, pistonY + gasH / 2, { size: 12 });
        label(g, `p = ${pressure.toFixed(0)} kPa`, cx + cw / 2, cy + chMax + 22, { size: 12, color: COLORS.warn });
        // đồ thị p-V
        const px = 290, py = 60, pw = w - px - 30, ph = h - py - 70;
        const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: 5.5, ymin: 0, ymax: 500, xlabel: 'V (L)', ylabel: 'p (kPa)', title: 'Đường đẳng nhiệt p–V' });
        for (const T of [200, 300, 400, 500]) {
          const pts = []; for (let V = 0.45; V <= 5.5; V += 0.1) pts.push([P.X(V), P.Y(clamp(n * 8.314 * T / (V / 1000) / 1000, 0, 500))]);
          polyline(g, pts, T === p.T ? COLORS.physics : 'rgba(148,163,184,0.25)', T === p.T ? 2.5 : 1.2);
          text(g, `${T} K`, P.X(5.3), P.Y(clamp(n * 8.314 * T / 5.3 * 1000 / 1000, 0, 500)) - 4, { size: 9.5, align: 'right', color: T === p.T ? COLORS.physics : COLORS.muted });
        }
        if (p.T !== 200 && p.T !== 300 && p.T !== 400 && p.T !== 500) { const pts = []; for (let V = 0.45; V <= 5.5; V += 0.1) pts.push([P.X(V), P.Y(clamp(n * 8.314 * p.T / (V / 1000) / 1000, 0, 500))]); polyline(g, pts, COLORS.physics, 2.5); }
        circle(g, P.X(p.V), P.Y(clamp(pressure, 0, 500)), 6, '#fbbf24', '#0b1020');
        polyline(g, [[P.X(p.V), P.Y(0)], [P.X(p.V), P.Y(clamp(pressure, 0, 500))], [P.X(0), P.Y(clamp(pressure, 0, 500))]], 'rgba(251,191,36,0.4)', 1);
        text(g, `p·V = ${(pressure * p.V).toFixed(0)} kPa·L = nRT = hằng số`, px, h - 20, { size: 12, color: COLORS.muted });
      },
      metrics(p) { const pressure = n * 8.314 * p.T / (p.V / 1000) / 1000; return [['Áp suất p', `${pressure.toFixed(1)} kPa`], ['p·V', `${(pressure * p.V).toFixed(0)} kPa·L`], ['Va chạm thành/giây (mô hình)', st.hitRate, 0], ['Số mol', n]]; }
    };
  }
};
