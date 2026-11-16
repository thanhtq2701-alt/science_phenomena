import { COLORS, text, label, plot, polyline, roundRect, mixColor, arrow, circle } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const MATS = { water: ['Nước', 4200], al: ['Nhôm', 900], fe: ['Sắt', 460], cu: ['Đồng', 380] };

export default {
  id: 'physics-thermal-equilibrium',
  subject: 'physics',
  chapter: 'thermal',
  title: 'Cân bằng nhiệt và nhiệt dung riêng',
  summary: 'Thả vật nóng vào nước lạnh: nhiệt truyền từ vật nóng sang vật lạnh cho đến khi cùng nhiệt độ. Phương trình cân bằng nhiệt Q tỏa = Q thu.',
  equation: ['Q = m·c·ΔT', 'Q tỏa = Q thu  ⇒  m1·c1·(T1 − T) = m2·c2·(T − T2)', 'T = (m1c1T1 + m2c2T2) / (m1c1 + m2c2)'],
  keywords: ['cân bằng nhiệt', 'nhiệt dung riêng', 'truyền nhiệt', 'nhiệt lượng kế'],
  theory: [
    'Nhiệt lượng **tự truyền từ vật có nhiệt độ cao sang vật có nhiệt độ thấp** cho đến khi hai vật **cùng nhiệt độ** (cân bằng nhiệt). Bỏ qua mất mát: nhiệt lượng vật nóng tỏa ra bằng nhiệt lượng vật lạnh thu vào.',
    '**Nhiệt dung riêng c** là nhiệt lượng cần để 1 kg chất tăng 1 K. Nước có c lớn (4200 J/kg·K) nên nhiệt độ nước thay đổi ít → dùng làm chất làm mát, điều hòa khí hậu.',
    'Phương pháp đo c của kim loại bằng nhiệt lượng kế: cân m, đo T1, T2, T rồi áp dụng phương trình cân bằng nhiệt.'
  ],
  observe: ['Đổi vật nóng từ đồng sang nhôm cùng khối lượng: nhiệt độ cân bằng cao hơn vì c nhôm lớn hơn.', 'Tăng khối lượng nước: nhiệt độ cân bằng gần nhiệt độ nước hơn.'],
  exam: ['Tính nhiệt độ cân bằng; tính nhiệt dung riêng của kim loại từ thí nghiệm.'],
  params: [
    { key: 'mat', label: 'Vật nóng', type: 'select', value: 'cu', options: Object.entries(MATS).map(([k, v]) => [k, v[0]]) },
    { key: 'm1', label: 'Khối lượng vật nóng', min: 0.1, max: 2, step: 0.1, value: 0.5, unit: 'kg', decimals: 1 },
    { key: 'T1', label: 'Nhiệt độ vật nóng', min: 30, max: 300, step: 5, value: 150, unit: '°C' },
    { key: 'm2', label: 'Khối lượng nước', min: 0.1, max: 2, step: 0.1, value: 0.5, unit: 'kg', decimals: 1 },
    { key: 'T2', label: 'Nhiệt độ nước', min: 0, max: 60, step: 1, value: 20, unit: '°C' }
  ],
  create(ctx) {
    const st = { Ta: ctx.params.T1, Tb: ctx.params.T2, hist: [], time: 0, started: false };
    const eq = (p) => { const c1 = MATS[p.mat][1]; return (p.m1 * c1 * p.T1 + p.m2 * 4200 * p.T2) / (p.m1 * c1 + p.m2 * 4200); };
    return {
      onParam(k, p) { st.Ta = p.T1; st.Tb = p.T2; st.hist = []; st.time = 0; },
      update(dt, p) {
        st.time += dt;
        const c1 = MATS[p.mat][1];
        const k = 60; // W/K – hệ số truyền nhiệt minh họa
        const q = k * (st.Ta - st.Tb) * dt * 8;
        st.Ta -= q / (p.m1 * c1); st.Tb += q / (p.m2 * 4200);
        if (Math.floor(st.time * 5) !== Math.floor((st.time - dt) * 5)) { st.hist.push([st.time, st.Ta, st.Tb]); if (st.hist.length > 500) st.hist.shift(); }
      },
      draw(g, w, h, p) {
        const T = eq(p);
        const toColor = (temp) => mixColor('#3b82f6', '#ef4444', clamp((temp - 0) / 200, 0, 1));
        // nhiệt lượng kế
        const bx = 50, by = 90, bw = 200, bh = 220;
        g.fillStyle = 'rgba(148,163,184,0.15)'; roundRect(g, bx, by, bw, bh, 12); g.fill(); g.strokeStyle = COLORS.glass; g.lineWidth = 3; g.stroke();
        g.fillStyle = toColor(st.Tb); g.globalAlpha = 0.6; g.fillRect(bx + 6, by + 50, bw - 12, bh - 56); g.globalAlpha = 1;
        g.fillStyle = toColor(st.Ta); roundRect(g, bx + bw / 2 - 35, by + 110, 70, 70, 8); g.fill();
        text(g, MATS[p.mat][0], bx + bw / 2, by + 140, { size: 12, align: 'center', color: '#fff', weight: '700' });
        text(g, `${st.Ta.toFixed(1)} °C`, bx + bw / 2, by + 158, { size: 11, align: 'center', color: '#fff' });
        label(g, `nước ${st.Tb.toFixed(1)} °C`, bx + bw / 2, by + 75, { size: 11 });
        text(g, 'nhiệt lượng kế (cách nhiệt)', bx + bw / 2, by + bh + 18, { size: 11, align: 'center', color: COLORS.muted });
        if (st.Ta - st.Tb > 0.5) for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; arrow(g, bx + bw / 2 + Math.cos(a) * 45, by + 145 + Math.sin(a) * 45, bx + bw / 2 + Math.cos(a) * 70, by + 145 + Math.sin(a) * 70, '#fbbf24', 2); }
        // đồ thị
        const px = 320, py = 60, pw = w - px - 30, ph = h - py - 70;
        const tmax = Math.max(10, st.time);
        const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: tmax, ymin: 0, ymax: Math.max(p.T1, 100), xlabel: 'thời gian (s)', ylabel: 'nhiệt độ (°C)', title: 'Nhiệt độ hai vật theo thời gian' });
        polyline(g, [[P.X(0), P.Y(T)], [P.X(tmax), P.Y(T)]], 'rgba(74,222,128,0.5)', 1.5);
        text(g, `T cân bằng = ${T.toFixed(1)} °C`, P.X(tmax) - 6, P.Y(T) - 6, { size: 11, align: 'right', color: '#4ade80' });
        polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(r[1])]), '#f87171', 2.5);
        polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(r[2])]), '#60a5fa', 2.5);
        text(g, `Q tỏa = ${(p.m1 * MATS[p.mat][1] * (p.T1 - T) / 1000).toFixed(2)} kJ = Q thu = ${(p.m2 * 4200 * (T - p.T2) / 1000).toFixed(2)} kJ`, px, h - 20, { size: 11.5, color: COLORS.muted });
      },
      metrics(p) { const T = eq(p); return [['T cân bằng (lí thuyết)', `${T.toFixed(1)} °C`], ['T vật nóng hiện tại', `${st.Ta.toFixed(1)} °C`], ['T nước hiện tại', `${st.Tb.toFixed(1)} °C`], ['c vật nóng', `${MATS[p.mat][1]} J/kg·K`], ['Q trao đổi', `${(p.m1 * MATS[p.mat][1] * (p.T1 - T) / 1000).toFixed(2)} kJ`]]; }
    };
  }
};
