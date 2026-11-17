import { COLORS, text, label, circle, roundRect, arrow, flame, bar } from '../../core/draw.js';
import { clamp, gauss } from '../../core/engine.js';

export default {
  id: 'physics-first-law',
  subject: 'physics',
  chapter: 'thermal',
  title: 'Nội năng và định luật I nhiệt động lực học',
  summary: 'Nội năng của khí thay đổi khi nhận nhiệt Q hoặc nhận công A: ΔU = A + Q. Nén pit-tông nhanh thì khí nóng lên, đun nóng thì khí giãn ra đẩy pit-tông và sinh công.',
  equation: ['ΔU = A + Q', 'Quy ước: Q > 0 vật nhận nhiệt ; A > 0 vật nhận công ; Q < 0, A < 0: vật truyền nhiệt, sinh công', 'Khí lí tưởng: U chỉ phụ thuộc T ; công khi áp suất không đổi |A| = p·|ΔV|'],
  keywords: ['nội năng', 'định luật I', 'nhiệt động lực học', 'công', 'nhiệt lượng', 'ΔU = A + Q', 'nén khí', 'động cơ nhiệt'],
  theory: [
    '**Nội năng U** là tổng động năng và thế năng của các phân tử cấu tạo nên vật. Với khí lí tưởng, thế năng tương tác không đáng kể nên U chỉ phụ thuộc **nhiệt độ**.',
    'Có hai cách làm thay đổi nội năng: **thực hiện công** (nén, ma sát) và **truyền nhiệt**. **Định luật I**: độ biến thiên nội năng bằng tổng công và nhiệt lượng vật nhận được, ΔU = A + Q. Đây là định luật bảo toàn năng lượng áp dụng cho hiện tượng nhiệt.',
    'Ví dụ: bơm xe đạp nóng lên (nhận công, A > 0); xoa hai tay (ma sát); trong động cơ nhiệt khí nhận nhiệt Q > 0 và sinh công A < 0.'
  ],
  observe: ['Chọn "Nén nhanh" (đoạn nhiệt): Q = 0, toàn bộ công làm tăng U, nhiệt độ tăng.', 'Chọn "Đun nóng đẳng áp": khí nhận Q, một phần thành công đẩy pit-tông, phần còn lại tăng U.', 'Chọn "Đun nóng đẳng tích": A = 0, toàn bộ Q làm tăng U.'],
  exam: ['Áp dụng ΔU = A + Q với đúng quy ước dấu; tính công của khí khi giãn đẳng áp.', 'Giải thích các hiện tượng: bơm xe nóng, khí giãn nở lạnh đi.'],
  params: [
    { key: 'proc', label: 'Quá trình', type: 'select', value: 'compress', options: [['compress', 'Nén nhanh (đoạn nhiệt, Q = 0)'], ['heatP', 'Đun nóng, pit-tông tự do (đẳng áp)'], ['heatV', 'Đun nóng, pit-tông cố định (đẳng tích)'], ['expand', 'Giãn nhanh (đoạn nhiệt)']] },
    { key: 'rate', label: 'Cường độ (công / nhiệt)', min: 0.2, max: 2, step: 0.1, value: 1, decimals: 1 }
  ],
  create() {
    const n = 0.05, R = 8.314, Cv = 1.5 * R;
    const st = { T: 300, V: 2, A: 0, Q: 0, mols: [] };
    for (let i = 0; i < 40; i++) st.mols.push({ x: Math.random(), y: Math.random(), vx: gauss(), vy: gauss() });
    const reset = () => { st.T = 300; st.V = 2; st.A = 0; st.Q = 0; };
    return {
      onParam(k) { if (k === 'proc') reset(); },
      update(dt, p) {
        const pr = n * R * st.T / (st.V / 1000); // Pa
        if (p.proc === 'compress' && st.V > 0.6) { const dV = -0.25 * p.rate * dt; const work = -pr * dV / 1000; st.A += work; st.V += dV; st.T += work / (n * Cv); }
        else if (p.proc === 'expand' && st.V < 4) { const dV = 0.25 * p.rate * dt; const work = -pr * dV / 1000; st.A += work; st.V += dV; st.T += work / (n * Cv); }
        else if (p.proc === 'heatV' && st.T < 900) { const q = 30 * p.rate * dt; st.Q += q; st.T += q / (n * Cv); }
        else if (p.proc === 'heatP' && st.T < 900) { const q = 30 * p.rate * dt; const p0 = n * R * 300 / (2 / 1000); const Cp = Cv + R; const dT = q / (n * Cp); st.Q += q; st.T += dT; const Vn = n * R * st.T / p0 * 1000; st.A += -p0 * (Vn - st.V) / 1000; st.V = Vn; }
        const sp = 0.4 * Math.sqrt(st.T / 300);
        for (const m of st.mols) { m.x += m.vx * sp * dt; m.y += m.vy * sp * dt; if (m.x < 0 || m.x > 1) { m.vx *= -1; m.x = clamp(m.x, 0, 1); } if (m.y < 0 || m.y > 1) { m.vy *= -1; m.y = clamp(m.y, 0, 1); } }
      },
      draw(g, w, h, p, t) {
        const dU = n * Cv * (st.T - 300);
        const cx = 60, cy = 60, cw = 160, chMax = 330;
        const gasH = clamp(chMax * st.V / 4.2, 30, chMax);
        const pistonY = cy + chMax - gasH;
        g.strokeStyle = COLORS.glass; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + chMax); g.lineTo(cx + cw, cy + chMax); g.lineTo(cx + cw, cy); g.stroke();
        const heat = clamp((st.T - 250) / 500, 0, 1);
        g.fillStyle = `rgba(${Math.round(56 + heat * 190)},${Math.round(189 - heat * 120)},${Math.round(248 - heat * 200)},0.2)`; g.fillRect(cx, pistonY, cw, gasH);
        for (const m of st.mols) circle(g, cx + 6 + m.x * (cw - 12), pistonY + 6 + m.y * (gasH - 12), 3.5, heat > 0.5 ? '#f97316' : '#38bdf8');
        g.fillStyle = '#64748b'; roundRect(g, cx - 2, pistonY - 16, cw + 4, 16, 3); g.fill();
        g.fillStyle = '#94a3b8'; g.fillRect(cx + cw / 2 - 6, cy - 40, 12, pistonY - cy - 16 + 40);
        if (p.proc === 'heatV') { g.fillStyle = '#f87171'; g.fillRect(cx - 12, pistonY - 20, 10, 10); g.fillRect(cx + cw + 2, pistonY - 20, 10, 10); text(g, 'chốt giữ', cx + cw + 14, pistonY - 12, { size: 9.5, color: '#f87171' }); }
        if (p.proc === 'compress') arrow(g, cx + cw / 2, pistonY - 70, cx + cw / 2, pistonY - 30, '#fbbf24', 3);
        if (p.proc === 'expand' || p.proc === 'heatP') arrow(g, cx + cw / 2 + 30, pistonY - 30, cx + cw / 2 + 30, pistonY - 70, '#4ade80', 3);
        if (p.proc === 'heatP' || p.proc === 'heatV') flame(g, cx + cw / 2, cy + chMax + 42, 0.6 + p.rate * 0.3, '#fbbf24', t);
        label(g, `T = ${st.T.toFixed(0)} K`, cx + cw / 2, pistonY + gasH / 2, { size: 12 });
        // cân bằng năng lượng
        const rx = cx + cw + 80, rw = w - rx - 30;
        if (rw > 200) {
          text(g, 'Bảng cân bằng năng lượng', rx, 70, { size: 13, weight: '700' });
          const maxE = Math.max(50, Math.abs(st.A), Math.abs(st.Q), Math.abs(dU));
          const rows = [['A (công khí nhận)', st.A, '#fbbf24'], ['Q (nhiệt khí nhận)', st.Q, '#f87171'], ['ΔU = A + Q', dU, '#4ade80']];
          rows.forEach((r, i) => {
            const y = 100 + i * 60; const mid = rx + rw / 2; const len = (r[1] / maxE) * (rw / 2 - 10);
            text(g, `${r[0]} = ${r[1].toFixed(1)} J`, rx, y, { size: 12, color: r[2] });
            g.fillStyle = r[2]; g.fillRect(Math.min(mid, mid + len), y + 10, Math.abs(len), 16);
            g.fillStyle = '#475569'; g.fillRect(mid - 1, y + 6, 2, 24);
          });
          text(g, '← âm (vật cho đi)            dương (vật nhận) →', rx + rw / 2, 290, { size: 10, align: 'center', color: COLORS.muted });
          const check = Math.abs(dU - (st.A + st.Q)) < 0.5;
          label(g, check ? 'ΔU = A + Q ✔ (bảo toàn năng lượng)' : 'đang tính…', rx + rw / 2, 320, { size: 11.5, color: '#4ade80' });
          const notes = { compress: 'Q = 0 → ΔU = A > 0: khí nóng lên (bơm xe đạp).', expand: 'Q = 0 → ΔU = A < 0: khí sinh công, lạnh đi (bình xịt lạnh tay).', heatV: 'A = 0 → ΔU = Q: toàn bộ nhiệt làm tăng nội năng.', heatP: 'Q > 0, A < 0: một phần nhiệt biến thành công đẩy pit-tông.' };
          text(g, notes[p.proc], rx, 360, { size: 11.5, color: COLORS.muted });
        }
      },
      metrics() { const dU = n * Cv * (st.T - 300); return [['Nhiệt độ', `${st.T.toFixed(0)} K`], ['Thể tích', `${st.V.toFixed(2)} L`], ['A', `${st.A.toFixed(1)} J`], ['Q', `${st.Q.toFixed(1)} J`], ['ΔU', `${dU.toFixed(1)} J`]]; }
    };
  }
};
