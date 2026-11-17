import { COLORS, text, label, beaker, roundRect, circle, plot, polyline, flame } from '../../core/draw.js';
import { clamp, gauss } from '../../core/engine.js';

export default {
  id: 'physics-latent-heat-lab',
  subject: 'physics',
  chapter: 'thermal',
  title: 'Thực hành đo nhiệt hóa hơi riêng và nhiệt nóng chảy riêng',
  summary: 'Đun nước đang sôi trên cân điện tử bằng dây điện trở nối joulemeter: khối lượng nước giảm đều. Từ độ dốc đồ thị khối lượng theo năng lượng tính L = ΔQ/Δm. Chế độ thứ hai: đun nước đá ở 0 °C để đo λ.',
  equation: ['Hóa hơi: Q = L·m ⇒ L = ΔQ / Δm', 'Nóng chảy: Q = λ·m ⇒ λ = ΔQ / Δm', 'Giá trị chuẩn: L(nước) = 2,26·10⁶ J/kg ; λ(nước đá) = 3,34·10⁵ J/kg'],
  keywords: ['nhiệt hóa hơi riêng', 'nhiệt nóng chảy riêng', 'thực hành', 'joulemeter', 'cân điện tử', 'sôi', 'nóng chảy', 'sai số'],
  theory: [
    '**Nhiệt hóa hơi riêng L** là nhiệt lượng cần để 1 kg chất lỏng hóa hơi hoàn toàn **ở nhiệt độ sôi**. **Nhiệt nóng chảy riêng λ** là nhiệt lượng cần để 1 kg chất rắn nóng chảy hoàn toàn **ở nhiệt độ nóng chảy**.',
    'Bố trí SGK: bình nước đặt trên **cân điện tử**, dây đun nối **joulemeter** đo điện năng. Khi nước đã sôi, mọi nhiệt lượng cấp thêm dùng để hóa hơi: ghi khối lượng m và năng lượng Q theo thời gian, độ dốc |Δm/ΔQ| cho 1/L.',
    'Đo λ: cho nước đá vụn ở 0 °C vào phễu có dây đun, hứng nước chảy ra. Cần một **phễu đối chứng** không đun để trừ phần đá tan do nhiệt môi trường. Sai số chính: nhiệt thất thoát, hơi nước ngưng tụ lại, đọc cân.'
  ],
  observe: ['Chỉ bắt đầu ghi khi nước đã sôi (100 °C), trước đó khối lượng hầu như không đổi.', 'Tắt "trừ phần thất thoát": L đo được lớn hơn thật.', 'Chuyển sang đo λ để thấy phễu đối chứng quan trọng thế nào.'],
  exam: ['Trình bày phương án thí nghiệm, bảng số liệu, cách tính L, λ từ đồ thị.', 'Đánh giá nguyên nhân sai số và cách khắc phục.'],
  params: [
    { key: 'mode', label: 'Đại lượng cần đo', type: 'select', value: 'L', options: [['L', 'Nhiệt hóa hơi riêng L của nước'], ['lambda', 'Nhiệt nóng chảy riêng λ của nước đá']] },
    { key: 'P', label: 'Công suất dây đun', min: 50, max: 300, step: 10, value: 150, unit: 'W' },
    { key: 'correct', label: 'Trừ phần thất thoát / phễu đối chứng', type: 'toggle', value: true }
  ],
  create() {
    const st = { T: 80, m: 300, mCtrl: 0, E: 0, time: 0, data: [] };
    const reset = (p) => { st.T = p.mode === 'L' ? 80 : 0; st.m = p.mode === 'L' ? 300 : 0; st.mCtrl = 0; st.E = 0; st.time = 0; st.data = []; };
    return {
      onParam(k, p) { if (k === 'mode') reset(p); },
      update(dt, p) {
        const sim = dt * 10; st.time += sim;
        const Ein = p.P * sim; st.E += Ein;
        if (p.mode === 'L') {
          const loss = 15 * sim; // W thất thoát
          if (st.T < 100) st.T = Math.min(100, st.T + (Ein - loss) / (0.3 * 4200));
          else st.m = Math.max(0, st.m - (Ein - loss) / 2.26e6 * 1000);
        } else {
          const env = 0.02 * sim; // g/s đá tan do môi trường
          st.m += (Ein / 3.34e5) * 1000 + env; st.mCtrl += env;
        }
        if (Math.floor(st.time / 30) > st.data.length - 1) st.data.push([st.E, st.m + gauss() * 0.05, st.T, st.mCtrl]);
        if (st.time > 1800) reset(p);
      },
      draw(g, w, h, p, t) {
        const bx = 40, by = 80, bw = 160, bh = 170;
        if (p.mode === 'L') {
          beaker(g, bx, by, bw, bh, clamp(st.m / 400, 0, 1), 'rgba(96,165,250,0.4)', { title: `nước ${st.T.toFixed(0)} °C` });
          if (st.T >= 100) for (let i = 0; i < 6; i++) { const u = ((t * 0.6) + i / 6) % 1; circle(g, bx + 30 + i * 20 + Math.sin(u * 6 + i) * 6, by - u * 50, 5 + u * 8, `rgba(226,232,240,${0.4 * (1 - u)})`); }
          g.fillStyle = '#0f172a'; roundRect(g, bx - 10, by + bh + 4, bw + 20, 30, 6); g.fill(); text(g, `${st.m.toFixed(1)} g`, bx + bw / 2, by + bh + 25, { size: 14, align: 'center', color: '#4ade80', weight: '700' });
          text(g, 'cân điện tử', bx + bw / 2, by + bh + 48, { size: 10, align: 'center', color: COLORS.muted });
        } else {
          const fx = bx + 10;
          for (const [x, lbl, mm] of [[fx, 'phễu có dây đun', st.m], [fx + 110, 'phễu đối chứng', st.mCtrl]]) {
            g.fillStyle = 'rgba(224,242,254,0.8)'; g.beginPath(); g.moveTo(x, by); g.lineTo(x + 70, by); g.lineTo(x + 40, by + 80); g.lineTo(x + 30, by + 80); g.closePath(); g.fill();
            for (let i = 0; i < 8; i++) circle(g, x + 12 + (i % 4) * 14, by + 10 + Math.floor(i / 4) * 14, 6, '#f0f9ff', '#bae6fd');
            beaker(g, x + 10, by + 110, 50, 60, clamp(mm / 40, 0, 1), 'rgba(96,165,250,0.5)');
            text(g, `${mm.toFixed(1)} g`, x + 35, by + 196, { size: 11, align: 'center', color: '#4ade80' }); text(g, lbl, x + 35, by + 212, { size: 9.5, align: 'center', color: COLORS.muted });
          }
        }
        g.fillStyle = '#0f172a'; roundRect(g, bx, 20, 140, 32, 6); g.fill(); text(g, `${(st.E / 1000).toFixed(1)} kJ`, bx + 70, 42, { size: 14, align: 'center', color: '#fbbf24', weight: '700' }); text(g, 'joulemeter', bx + 160, 40, { size: 10, color: COLORS.muted });
        // đồ thị và kết quả
        const px = bx + 280, pw = w - px - 30, ph = h - 190;
        if (pw > 160) {
          const pts = p.mode === 'L' ? st.data.filter((d) => d[2] >= 100) : st.data;
          const ys = pts.map((d) => p.mode === 'L' ? d[1] : d[1] - (p.correct ? d[3] : 0));
          const Emax = Math.max(10000, st.E);
          const P = plot(g, px, 60, pw, ph, { xmin: 0, xmax: Emax / 1000, ymin: 0, ymax: p.mode === 'L' ? 320 : Math.max(60, ...ys, 0) * 1.1, xlabel: 'Q (kJ)', ylabel: p.mode === 'L' ? 'm nước (g)' : 'm nước tan (g)', title: p.mode === 'L' ? 'Khối lượng nước khi đang sôi' : 'Khối lượng đá tan (đã trừ đối chứng)' });
          pts.forEach((d, i) => circle(g, P.X(d[0] / 1000), P.Y(ys[i]), 3.5, '#fbbf24'));
          if (pts.length >= 3) {
            const n = pts.length, xs = pts.map((d) => d[0]);
            const sx = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0), sxx = xs.reduce((a, b) => a + b * b, 0), sxy = xs.reduce((a, b, i) => a + b * ys[i], 0);
            const k = (n * sxy - sx * sy) / (n * sxx - sx * sx); const b0 = (sy - k * sx) / n;
            polyline(g, [[P.X(xs[0] / 1000), P.Y(b0 + k * xs[0])], [P.X(xs[n - 1] / 1000), P.Y(b0 + k * xs[n - 1])]], '#4ade80', 2);
            let val = Math.abs(1 / (k / 1000)); // J/kg
            if (p.mode === 'L' && p.correct) val = val * (p.P - 15) / p.P;
            const ref = p.mode === 'L' ? 2.26e6 : 3.34e5; const err = (val - ref) / ref * 100;
            text(g, `${p.mode === 'L' ? 'L' : 'λ'} = ΔQ/Δm ≈ ${val.toExponential(3)} J/kg   (chuẩn ${ref.toExponential(2)}, sai số ${err >= 0 ? '+' : ''}${err.toFixed(1)}%)`, px, 60 + ph + 40, { size: 12, color: Math.abs(err) < 5 ? '#4ade80' : COLORS.warn, weight: '700' });
          } else text(g, p.mode === 'L' ? 'Chờ nước sôi rồi thu ≥ 3 điểm số liệu…' : 'Đang thu số liệu…', px, 60 + ph + 40, { size: 11.5, color: COLORS.muted });
        }
      },
      metrics(p) { return [['Năng lượng cấp', `${(st.E / 1000).toFixed(1)} kJ`], [p.mode === 'L' ? 'Khối lượng nước' : 'Đá đã tan', `${st.m.toFixed(1)} g`], ['Nhiệt độ', p.mode === 'L' ? `${st.T.toFixed(0)} °C` : '0 °C'], ['Điểm số liệu', st.data.length]]; }
    };
  }
};
