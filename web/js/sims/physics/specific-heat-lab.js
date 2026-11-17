import { COLORS, text, label, beaker, roundRect, line, plot, polyline, circle } from '../../core/draw.js';
import { clamp, gauss } from '../../core/engine.js';

const LIQ = { water: ['Nước', 4200], oil: ['Dầu ăn', 2000], alcohol: ['Ethanol', 2500] };

export default {
  id: 'physics-specific-heat-lab',
  subject: 'physics',
  chapter: 'thermal',
  title: 'Thí nghiệm đo nhiệt dung riêng bằng biến thế nguồn và joulemeter',
  summary: 'Đun chất lỏng bằng dây điện trở, đo điện năng cung cấp và nhiệt độ theo thời gian, vẽ đồ thị T–t rồi tính c = P/(m·hệ số góc). Có sai số ngẫu nhiên và hao phí nhiệt như phòng thí nghiệm thật.',
  equation: ['Q = U·I·t = m·c·ΔT', 'c = U·I / (m · ΔT/Δt)  (ΔT/Δt: hệ số góc đồ thị)', 'Sai số tương đối: δc/c = δP/P + δm/m + δk/k'],
  keywords: ['nhiệt dung riêng', 'thí nghiệm', 'joulemeter', 'điện trở đun', 'sai số', 'đồ thị nhiệt độ thời gian', 'thực hành'],
  theory: [
    'Bố trí SGK: nhiệt lượng kế chứa m kg chất lỏng, **dây điện trở** nhúng trong chất lỏng nối với **biến thế nguồn** qua **joulemeter** (đo điện năng), **nhiệt kế/cảm biến** đo nhiệt độ, que khuấy để nhiệt độ đều.',
    'Bỏ qua hao phí, điện năng chuyển hết thành nhiệt: U·I·t = m·c·ΔT. Vẽ đồ thị T theo t, phần tuyến tính có **hệ số góc k = ΔT/Δt** ⇒ **c = P/(m·k)**. Dùng đồ thị giúp giảm sai số ngẫu nhiên so với tính từ một cặp số đo.',
    'Nguồn sai số: nhiệt truyền ra môi trường (làm c đo được **lớn hơn** thật), nhiệt lượng kế và dây đun hấp thụ nhiệt, đọc nhiệt kế, khuấy không đều.'
  ],
  observe: ['Tắt "cách nhiệt tốt": đồ thị cong xuống, c tính được lớn hơn giá trị thật.', 'Đổi chất lỏng sang dầu: hệ số góc lớn gấp đôi nước vì c nhỏ hơn.', 'Bấm "Ghi số liệu" vài lần rồi so sánh c đo với c thật.'],
  exam: ['Trình bày phương án và bố trí thí nghiệm; xử lí số liệu bằng đồ thị.', 'Phân tích nguyên nhân sai số và cách khắc phục.'],
  params: [
    { key: 'liq', label: 'Chất lỏng', type: 'select', value: 'water', options: Object.entries(LIQ).map(([k, v]) => [k, `${v[0]} (c = ${v[1]})`]) },
    { key: 'm', label: 'Khối lượng', min: 0.1, max: 0.5, step: 0.05, value: 0.2, unit: 'kg', decimals: 2 },
    { key: 'U', label: 'Hiệu điện thế', min: 6, max: 12, step: 1, value: 10, unit: 'V' },
    { key: 'insul', label: 'Cách nhiệt tốt', type: 'toggle', value: true }
  ],
  actions: [{ key: 'rec', label: '📝 Ghi số liệu' }],
  create() {
    const R = 2; // Ω
    const st = { T: 25, time: 0, E: 0, data: [], trace: [] };
    const reset = () => { st.T = 25; st.time = 0; st.E = 0; st.data = []; st.trace = []; };
    return {
      onParam() { reset(); },
      action(key) { if (key === 'rec') st.data.push([st.time, st.T + gauss() * 0.15]); },
      update(dt, p) {
        const sim = dt * 20; // tăng tốc thời gian
        const P = p.U * p.U / R;
        const c = LIQ[p.liq][1];
        const loss = (p.insul ? 0.05 : 0.6) * (st.T - 25); // W
        st.T += (P - loss) * sim / (p.m * c + 80); // 80 J/K: nhiệt dung nhiệt lượng kế
        st.time += sim; st.E += P * sim;
        if (!st.trace.length || st.time - st.trace[st.trace.length - 1][0] > 5) st.trace.push([st.time, st.T]);
        if (st.time > 900) reset();
        if (st.data.length === 0 || st.time - st.data[st.data.length - 1][0] > 60) { if (Math.floor(st.time / 60) > st.data.length) st.data.push([st.time, st.T + gauss() * 0.15]); }
      },
      draw(g, w, h, p, t) {
        const P = p.U * p.U / R;
        const bx = 40, by = 90, bw = 170, bh = 210;
        g.fillStyle = p.insul ? 'rgba(148,163,184,0.25)' : 'rgba(148,163,184,0.06)'; roundRect(g, bx - 12, by - 6, bw + 24, bh + 18, 14); g.fill();
        beaker(g, bx, by, bw, bh, 0.75, p.liq === 'oil' ? 'rgba(250,204,21,0.45)' : p.liq === 'alcohol' ? 'rgba(226,232,240,0.3)' : 'rgba(96,165,250,0.35)', { title: `${LIQ[p.liq][0]} ${p.m} kg` });
        // dây đun
        g.strokeStyle = `rgb(${Math.round(150 + Math.min(105, P * 2))},80,60)`; g.lineWidth = 3; g.beginPath(); g.moveTo(bx + 50, by - 30); g.lineTo(bx + 50, by + bh - 40); for (let i = 0; i < 6; i++) g.lineTo(bx + 50 + (i % 2 ? 30 : 0), by + bh - 40 - i * 8); g.stroke();
        // nhiệt kế
        g.fillStyle = '#e2e8f0'; g.fillRect(bx + bw - 40, by - 40, 6, bh - 30); circle(g, bx + bw - 37, by + bh - 66, 6, '#ef4444');
        // joulemeter
        g.fillStyle = '#0f172a'; roundRect(g, bx, by - 80, 120, 36, 6); g.fill(); g.strokeStyle = '#475569'; g.stroke();
        text(g, `${(st.E / 1000).toFixed(2)} kJ`, bx + 60, by - 56, { size: 14, align: 'center', color: '#4ade80', weight: '700' });
        text(g, 'joulemeter', bx + 60, by - 86, { size: 9.5, align: 'center', color: COLORS.muted });
        label(g, `${st.T.toFixed(1)} °C`, bx + bw - 37, by - 52, { size: 11, color: '#f87171' });
        text(g, `P = U²/R = ${P.toFixed(0)} W   t = ${st.time.toFixed(0)} s`, bx, by + bh + 46, { size: 11, color: COLORS.muted });
        // đồ thị + hồi quy
        const px = bx + bw + 70, py = 60, pw = w - px - 30, ph = h - py - 110;
        if (pw > 160) {
          const P0 = plot(g, px, py, pw, ph, { xmin: 0, xmax: 900, ymin: 20, ymax: Math.max(60, st.T + 5), xlabel: 't (s)', ylabel: 'T (°C)', title: 'Đồ thị T – t và đường thẳng khớp số liệu' });
          polyline(g, st.trace.map(([a, b]) => [P0.X(a), P0.Y(b)]), 'rgba(148,163,184,0.5)', 1.5);
          for (const [a, b] of st.data) circle(g, P0.X(a), P0.Y(b), 4, '#fbbf24');
          let k = null;
          if (st.data.length >= 2) {
            const n = st.data.length, sx = st.data.reduce((s, d) => s + d[0], 0), sy = st.data.reduce((s, d) => s + d[1], 0), sxx = st.data.reduce((s, d) => s + d[0] * d[0], 0), sxy = st.data.reduce((s, d) => s + d[0] * d[1], 0);
            k = (n * sxy - sx * sy) / (n * sxx - sx * sx); const b0 = (sy - k * sx) / n;
            polyline(g, [[P0.X(0), P0.Y(b0)], [P0.X(900), P0.Y(b0 + k * 900)]], '#4ade80', 2);
          }
          const cTrue = LIQ[p.liq][1];
          const cEff = k && k > 0 ? (P / k - 80) / p.m : null;
          text(g, k ? `hệ số góc k = ${(k * 60).toFixed(2)} °C/phút` : 'cần ≥ 2 điểm số liệu', px, py + ph + 40, { size: 12 });
          if (cEff) { const err = (cEff - cTrue) / cTrue * 100; text(g, `c đo = (P/k − C_nlk)/m = ${cEff.toFixed(0)} J/kg·K   (thật ${cTrue}, sai số ${err >= 0 ? '+' : ''}${err.toFixed(1)}%)`, px, py + ph + 62, { size: 12, color: Math.abs(err) < 5 ? '#4ade80' : '#fbbf24', weight: '700' }); }
          text(g, 'C_nlk = 80 J/K: nhiệt dung của nhiệt lượng kế + dây đun (đã hiệu chỉnh)', px, py + ph + 84, { size: 10.5, color: COLORS.muted });
        }
      },
      metrics(p) { return [['Nhiệt độ', `${st.T.toFixed(1)} °C`], ['Điện năng', `${(st.E / 1000).toFixed(2)} kJ`], ['Điểm số liệu', st.data.length], ['c thật', `${LIQ[p.liq][1]} J/kg·K`]]; }
    };
  }
};
