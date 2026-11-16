import { COLORS, text, label, roundRect, circle, arrow, bar } from '../../core/draw.js';
import { clamp, gauss } from '../../core/engine.js';

const R = 8.314;

export default {
  id: 'physics-gas-pressure',
  subject: 'physics',
  chapter: 'ideal-gas',
  title: 'Áp suất chất khí từ va chạm phân tử – phương trình trạng thái',
  summary: 'Đếm va chạm của phân tử lên thành bình để thấy áp suất tăng khi tăng số phân tử, tăng nhiệt độ hoặc giảm thể tích. Kiểm chứng pV = nRT.',
  equation: ['p = (1/3)·n·m·v̄²  (n = mật độ phân tử)', 'p·V = n·R·T  (phương trình Clapeyron)', 'W̄đ = (3/2)·k·T'],
  keywords: ['áp suất', 'va chạm', 'phương trình trạng thái', 'Clapeyron', 'khí lí tưởng', 'mật độ phân tử'],
  theory: [
    'Áp suất chất khí là **kết quả của vô số va chạm** của phân tử lên thành bình. Mỗi va chạm truyền một xung lực; áp suất tỉ lệ với **số va chạm mỗi giây trên một đơn vị diện tích** và **động lượng mỗi va chạm**.',
    'Ba cách tăng áp suất: **tăng số phân tử** (bơm thêm), **tăng nhiệt độ** (va chạm mạnh và thường xuyên hơn), **giảm thể tích** (phân tử gặp thành bình thường xuyên hơn).',
    'Tổng hợp lại: **pV = nRT** – phương trình trạng thái khí lí tưởng, gộp cả ba định luật Boyle, Charles và Gay-Lussac.'
  ],
  observe: ['Giữ V, T; tăng N gấp đôi → áp suất gấp đôi.', 'Quan sát đồng hồ "va chạm/giây" so với giá trị p tính theo pV = nRT.'],
  exam: ['Áp dụng pV = nRT cho bài toán bình khí, bơm khí, trộn khí.', 'Giải thích vi mô vì sao áp suất tăng khi nén/nung.'],
  params: [
    { key: 'N', label: 'Số phân tử (mô hình)', min: 10, max: 150, step: 10, value: 60 },
    { key: 'T', label: 'Nhiệt độ', min: 100, max: 600, step: 10, value: 300, unit: 'K' },
    { key: 'V', label: 'Thể tích bình', min: 1, max: 4, step: 0.1, value: 2, unit: 'L', decimals: 1 }
  ],
  create(ctx) {
    const st = { mols: [], hits: 0, acc: 0, rate: 0, impulse: 0, imp: 0, wallFlash: 0 };
    const fill = (N) => { while (st.mols.length < N) st.mols.push({ x: Math.random(), y: Math.random(), vx: gauss(), vy: gauss() }); st.mols.length = N; };
    fill(ctx.params.N);
    return {
      onParam(k, p) { if (k === 'N') fill(p.N); },
      update(dt, p) {
        const sp = 0.5 * Math.sqrt(p.T / 300);
        const side = Math.sqrt(p.V / 2);
        let hits = 0, imp = 0;
        for (const m of st.mols) {
          m.x += m.vx * sp * dt / side; m.y += m.vy * sp * dt / side;
          if (m.x < 0) { m.x = 0; m.vx *= -1; hits++; imp += Math.abs(m.vx) * sp; } if (m.x > 1) { m.x = 1; m.vx *= -1; hits++; imp += Math.abs(m.vx) * sp; }
          if (m.y < 0) { m.y = 0; m.vy *= -1; hits++; imp += Math.abs(m.vy) * sp; } if (m.y > 1) { m.y = 1; m.vy *= -1; hits++; imp += Math.abs(m.vy) * sp; }
        }
        st.hits += hits; st.imp += imp; st.acc += dt;
        if (st.acc >= 0.5) { st.rate = st.hits / st.acc; st.impulse = st.imp / st.acc; st.hits = 0; st.imp = 0; st.acc = 0; }
        st.wallFlash = Math.max(0, st.wallFlash - dt * 3) + hits * 0.05;
      },
      draw(g, w, h, p) {
        const side = Math.sqrt(p.V / 4);
        const maxS = Math.min(h - 100, w * 0.45);
        const bs = maxS * clamp(side, 0.45, 1);
        const bx = 60 + (maxS - bs) / 2, by = 60 + (maxS - bs) / 2;
        g.fillStyle = 'rgba(56,189,248,0.07)'; g.fillRect(bx, by, bs, bs);
        g.strokeStyle = `rgba(251,191,36,${clamp(0.3 + st.wallFlash, 0, 1)})`; g.lineWidth = 3; g.strokeRect(bx, by, bs, bs);
        const col = `rgb(${Math.round(56 + clamp((p.T - 100) / 500, 0, 1) * 190)},${Math.round(189 - clamp((p.T - 100) / 500, 0, 1) * 100)},${Math.round(248 - clamp((p.T - 100) / 500, 0, 1) * 180)})`;
        for (const m of st.mols) circle(g, bx + 4 + m.x * (bs - 8), by + 4 + m.y * (bs - 8), 3.5, col);
        label(g, `V = ${p.V.toFixed(1)} L`, bx + bs / 2, by + bs + 18, { size: 11 });
        // áp kế
        const n = p.N / 60 * 0.08; // mol tương ứng
        const pr = n * R * p.T / (p.V / 1000) / 1000;
        const gx = Math.max(bx + bs + 90, w * 0.62), gy = 150;
        circle(g, gx, gy, 60, '#0f172a', '#e2e8f0', 3);
        for (let i = 0; i <= 10; i++) { const a = -Math.PI * 0.75 + i / 10 * Math.PI * 1.5; const x1 = gx + Math.cos(a) * 50, y1 = gy + Math.sin(a) * 50; circle(g, x1, y1, 1.5, '#94a3b8'); if (i % 5 === 0) text(g, `${i * 60}`, gx + Math.cos(a) * 38, gy + Math.sin(a) * 38 + 4, { size: 9, align: 'center', color: COLORS.muted }); }
        const ang = -Math.PI * 0.75 + clamp(pr / 600, 0, 1) * Math.PI * 1.5;
        arrow(g, gx, gy, gx + Math.cos(ang) * 46, gy + Math.sin(ang) * 46, '#f87171', 2.5, 8);
        circle(g, gx, gy, 5, '#e2e8f0');
        text(g, `p = ${pr.toFixed(0)} kPa`, gx, gy + 85, { size: 14, align: 'center', weight: '700', color: COLORS.warn });
        text(g, 'áp kế (pV = nRT)', gx, gy + 104, { size: 10.5, align: 'center', color: COLORS.muted });
        // thanh so sánh
        const rx = gx - 100, rw = 200;
        bar(g, rx, gy + 150, rw, 10, clamp(st.rate / 800, 0, 1), '#38bdf8', `Va chạm lên thành / giây: ${st.rate.toFixed(0)}`);
        bar(g, rx, gy + 195, rw, 10, clamp(st.impulse / 600, 0, 1), '#fbbf24', `Tổng xung lực / giây (mô hình): ${st.impulse.toFixed(0)}`);
        bar(g, rx, gy + 240, rw, 10, clamp(pr / 600, 0, 1), '#f87171', `Áp suất theo pV = nRT: ${pr.toFixed(0)} kPa`);
        text(g, 'Ba thanh tăng/giảm cùng nhau: áp suất chính là va chạm!', rx, gy + 280, { size: 11, color: COLORS.muted });
      },
      metrics(p) { const n = p.N / 60 * 0.08; const pr = n * R * p.T / (p.V / 1000) / 1000; return [['n (mol tương ứng)', n, 3], ['p = nRT/V', `${pr.toFixed(1)} kPa`], ['Va chạm/giây (mô hình)', st.rate, 0], ['v_rms tương đối', Math.sqrt(p.T / 300), 2]]; }
    };
  }
};
