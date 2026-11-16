import { COLORS, text, label, beaker, flame, plot, polyline, circle, roundRect } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const C_ICE = 2100, C_WATER = 4200, C_STEAM = 2000, L_F = 334000, L_V = 2260000;

export default {
  id: 'physics-heating-curve',
  subject: 'physics',
  chapter: 'thermal',
  title: 'Đun nước đá: nhiệt nóng chảy, nhiệt hóa hơi',
  summary: 'Cấp nhiệt đều cho nước đá −20 °C: nhiệt độ tăng, dừng ở 0 °C khi tan, tăng tiếp, dừng ở 100 °C khi sôi. Đồ thị T–Q có hai đoạn nằm ngang.',
  equation: ['Q = m·c·ΔT  (làm nóng một thể)', 'Q = m·λ  (nóng chảy, λ nước đá = 334 kJ/kg)', 'Q = m·L  (hóa hơi, L nước = 2260 kJ/kg)'],
  keywords: ['nhiệt dung riêng', 'nhiệt nóng chảy riêng', 'nhiệt hóa hơi riêng', 'chuyển thể', 'đồ thị nhiệt độ'],
  theory: [
    'Khi đun, nhiệt lượng cấp vào làm **tăng động năng phân tử → tăng nhiệt độ** (Q = mcΔT). Khi đạt nhiệt độ **nóng chảy/sôi**, nhiệt lượng dùng để **phá vỡ liên kết** giữa các phân tử (tăng thế năng), **nhiệt độ không đổi** cho tới khi chuyển thể xong.',
    '**Nhiệt nóng chảy riêng λ**: nhiệt lượng để 1 kg chất rắn nóng chảy hoàn toàn ở nhiệt độ nóng chảy. **Nhiệt hóa hơi riêng L**: nhiệt lượng để 1 kg chất lỏng hóa hơi hoàn toàn ở nhiệt độ sôi. Với nước L ≈ 6,8 lần λ nên đoạn sôi dài hơn nhiều.',
    'Nhiệt dung riêng c của nước (4200 J/kg·K) lớn gấp đôi nước đá và hơi nước → đoạn dốc của nước thoải hơn.'
  ],
  observe: ['Tăng công suất bếp: mọi giai đoạn nhanh hơn nhưng hình dạng đồ thị không đổi.', 'Tăng khối lượng: thời gian mỗi giai đoạn tăng tỉ lệ.'],
  exam: ['Tính tổng nhiệt lượng để đưa m kg nước đá ở −t1 thành hơi ở 100 °C.', 'Đọc đồ thị T–t: xác định các giai đoạn, suy ra λ, L, c khi biết công suất.'],
  params: [
    { key: 'power', label: 'Công suất bếp', min: 200, max: 3000, step: 100, value: 1000, unit: 'W' },
    { key: 'mass', label: 'Khối lượng nước đá', min: 0.1, max: 1, step: 0.1, value: 0.2, unit: 'kg', decimals: 1 },
    { key: 'scale', label: 'Tốc độ thời gian', min: 1, max: 60, step: 1, value: 20, unit: '×' }
  ],
  create() {
    const st = { Q: 0, T: -20, phase: 'ice', melt: 0, vap: 0, hist: [[0, -20]], time: 0 };
    return {
      update(dt, p) {
        const dQ = p.power * dt * p.scale;
        st.time += dt * p.scale;
        let rem = dQ;
        const m = p.mass;
        while (rem > 1e-6) {
          if (st.phase === 'ice') { const need = m * C_ICE * (0 - st.T); if (rem < need) { st.T += rem / (m * C_ICE); rem = 0; } else { rem -= need; st.T = 0; st.phase = 'melting'; } }
          else if (st.phase === 'melting') { const need = m * L_F * (1 - st.melt); if (rem < need) { st.melt += rem / (m * L_F); rem = 0; } else { rem -= need; st.melt = 1; st.phase = 'water'; } }
          else if (st.phase === 'water') { const need = m * C_WATER * (100 - st.T); if (rem < need) { st.T += rem / (m * C_WATER); rem = 0; } else { rem -= need; st.T = 100; st.phase = 'boiling'; } }
          else if (st.phase === 'boiling') { const need = m * L_V * (1 - st.vap); if (rem < need) { st.vap += rem / (m * L_V); rem = 0; } else { rem -= need; st.vap = 1; st.phase = 'steam'; } }
          else { st.T = Math.min(150, st.T + rem / (m * C_STEAM)); rem = 0; }
        }
        st.Q += dQ;
        const last = st.hist[st.hist.length - 1];
        if (st.Q - last[0] > p.mass * 8000) { st.hist.push([st.Q, st.T]); }
      },
      draw(g, w, h, p, t) {
        const m = p.mass;
        const Qmax = m * (C_ICE * 20 + L_F + C_WATER * 100 + L_V + C_STEAM * 50);
        // cốc bên trái
        const bx = 40, by = 90, bw = 160, bh = 220;
        const waterLevel = st.phase === 'ice' ? 0 : st.phase === 'melting' ? st.melt : st.phase === 'water' || st.phase === 'boiling' ? 1 - st.vap : 0;
        beaker(g, bx, by, bw, bh, 0.7 * waterLevel, 'rgba(96,165,250,0.5)', { title: `${phaseName(st.phase)} – ${st.T.toFixed(0)} °C` });
        if (st.phase === 'ice' || st.phase === 'melting') { const iceH = 0.7 * (bh - 10) * (st.phase === 'ice' ? 1 : 1 - st.melt); g.fillStyle = 'rgba(224,242,254,0.85)'; roundRect(g, bx + 10, by + bh - 2 - iceH, bw - 20, iceH, 8); g.fill(); }
        if (st.phase === 'boiling') for (let i = 0; i < 8; i++) { const u = ((t * 0.8) + i / 8) % 1; circle(g, bx + 20 + (i * 37) % (bw - 40), by + bh - 10 - u * 0.7 * (bh - 10) * (1 - st.vap), 3 + u * 2, null, 'rgba(255,255,255,0.7)'); }
        if (st.phase === 'boiling' || st.phase === 'steam') for (let i = 0; i < 6; i++) { const u = ((t * 0.5) + i / 6) % 1; circle(g, bx + 30 + i * 20 + Math.sin(u * 6 + i) * 8, by - 10 - u * 60, 6 + u * 10, `rgba(226,232,240,${0.35 * (1 - u)})`); }
        flame(g, bx + bw / 2, by + bh + 40, 0.5 + p.power / 2500, '#fbbf24', t);
        label(g, `${p.power} W`, bx + bw / 2, by + bh + 56, { size: 11 });
        // đồ thị
        const px = 290, py = 60, pw = w - px - 30, ph = h - py - 70;
        const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: Qmax / 1000, ymin: -20, ymax: 150, xlabel: 'Nhiệt lượng Q (kJ)', ylabel: 'Nhiệt độ (°C)', title: 'Đồ thị nhiệt độ – nhiệt lượng' });
        // đường lí thuyết mờ
        const Q1 = m * C_ICE * 20, Q2 = Q1 + m * L_F, Q3 = Q2 + m * C_WATER * 100, Q4 = Q3 + m * L_V;
        polyline(g, [[P.X(0), P.Y(-20)], [P.X(Q1 / 1000), P.Y(0)], [P.X(Q2 / 1000), P.Y(0)], [P.X(Q3 / 1000), P.Y(100)], [P.X(Q4 / 1000), P.Y(100)], [P.X(Qmax / 1000), P.Y(150)]], 'rgba(148,163,184,0.3)', 1.5);
        const segs = [['nước đá nóng lên', 0, Q1, -20, 0], ['tan (0 °C)', Q1, Q2, 0, 0], ['nước nóng lên', Q2, Q3, 0, 100], ['sôi (100 °C)', Q3, Q4, 100, 100], ['hơi nóng lên', Q4, Qmax, 100, 150]];
        segs.forEach((s, i) => { const xm = P.X((s[1] + s[2]) / 2000); const ym = P.Y((s[3] + s[4]) / 2); text(g, s[0], xm, ym - 12, { size: 9.5, align: 'center', color: COLORS.muted }); });
        polyline(g, [...st.hist, [st.Q, st.T]].map(([q, T]) => [P.X(q / 1000), P.Y(T)]), COLORS.physics, 2.5);
        circle(g, P.X(st.Q / 1000), P.Y(st.T), 5, COLORS.physics);
        text(g, `Q(tan) = mλ = ${(m * L_F / 1000).toFixed(0)} kJ     Q(sôi) = mL = ${(m * L_V / 1000).toFixed(0)} kJ`, px, h - 20, { size: 11.5, color: COLORS.muted });
      },
      metrics(p) { return [['Nhiệt độ', `${st.T.toFixed(1)} °C`], ['Giai đoạn', phaseName(st.phase)], ['Q đã cấp', `${(st.Q / 1000).toFixed(1)} kJ`], ['Thời gian', `${(st.time / 60).toFixed(1)} phút`], ['Đã tan / đã hóa hơi', `${Math.round(st.melt * 100)}% / ${Math.round(st.vap * 100)}%`]]; }
    };
  }
};
function phaseName(p) { return { ice: 'nước đá', melting: 'đang tan', water: 'nước', boiling: 'đang sôi', steam: 'hơi nước' }[p]; }
