import { COLORS, text, label, circle, line, roundRect, plot, polyline } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'physics-damped-oscillator',
  subject: 'physics',
  chapter: 'legacy',
  title: 'Dao động tắt dần: hệ lò xo – vật – giảm chấn',
  summary: 'Kế thừa mô phỏng dao động của bản gốc, viết lại bằng JavaScript và bổ sung tần số riêng ωn, tỉ số tắt dần ζ, phân loại tắt dần dưới / tới hạn / trên.',
  equation: ['m·x″ + c·x′ + k·x = 0', 'ωn = √(k/m) ;  ζ = c / (2√(k·m))', 'ζ < 1: tắt dần dưới (dao động) ; ζ = 1: tới hạn ; ζ > 1: tắt dần trên (không dao động)'],
  keywords: ['dao động tắt dần', 'lò xo', 'giảm chấn', 'tần số riêng', 'tỉ số tắt dần', 'con lắc'],
  theory: [
    'Vật gắn lò xo (độ cứng k) chịu thêm **lực cản tỉ lệ vận tốc** (hệ số c). Phương trình m·x″ + c·x′ + k·x = 0 được giải số bằng phương pháp Runge–Kutta bậc 4.',
    '**Tần số góc riêng ωn = √(k/m)** quyết định tốc độ dao động; **tỉ số tắt dần ζ** quyết định cách biên độ giảm: ζ < 1 dao động với biên độ giảm dần theo hàm mũ; ζ = 1 trở về vị trí cân bằng nhanh nhất không vượt quá; ζ > 1 trở về chậm, không dao động.',
    'Ứng dụng: giảm xóc xe máy (thiết kế ζ ≈ 0,3–0,7), cửa tự đóng (ζ ≈ 1), đồng hồ cân.'
  ],
  observe: ['Đặt c = 0: dao động điều hòa, biên độ không đổi.', 'Tăng c cho đến khi ζ = 1 (c = 2√(km)): vật về cân bằng không vượt qua.', 'Tăng m: chu kì dài hơn.'],
  exam: ['Tính chu kì T = 2π√(m/k); nhận dạng dao động tắt dần, cưỡng bức, cộng hưởng.'],
  params: [
    { key: 'm', label: 'Khối lượng m', min: 0.1, max: 20, step: 0.1, value: 5, unit: 'kg', decimals: 1 },
    { key: 'k', label: 'Độ cứng k', min: 1, max: 200, step: 1, value: 100, unit: 'N/m' },
    { key: 'c', label: 'Hệ số cản c', min: 0, max: 50, step: 0.5, value: 2, unit: 'N·s/m', decimals: 1 },
    { key: 'x0', label: 'Li độ ban đầu x0', min: -1, max: 1, step: 0.05, value: 0.6, unit: 'm', decimals: 2 }
  ],
  create(ctx) {
    const st = { x: ctx.params.x0, v: 0, t: 0, hist: [] };
    const deriv = (x, v, p) => [v, (-p.c * v - p.k * x) / p.m];
    return {
      onParam(k, p) { if (k === 'x0') { st.x = p.x0; st.v = 0; st.t = 0; st.hist = []; } },
      action() {},
      update(dt, p) {
        // RK4 với bước con để ổn định
        const n = 4, hh = dt / n;
        for (let i = 0; i < n; i++) {
          const [k1x, k1v] = deriv(st.x, st.v, p);
          const [k2x, k2v] = deriv(st.x + hh / 2 * k1x, st.v + hh / 2 * k1v, p);
          const [k3x, k3v] = deriv(st.x + hh / 2 * k2x, st.v + hh / 2 * k2v, p);
          const [k4x, k4v] = deriv(st.x + hh * k3x, st.v + hh * k3v, p);
          st.x += hh / 6 * (k1x + 2 * k2x + 2 * k3x + k4x);
          st.v += hh / 6 * (k1v + 2 * k2v + 2 * k3v + k4v);
        }
        st.t += dt;
        st.hist.push([st.t, st.x]); if (st.hist.length > 900) st.hist.shift();
      },
      draw(g, w, h, p) {
        const wn = Math.sqrt(p.k / p.m), zeta = p.c / (2 * Math.sqrt(p.k * p.m));
        // hệ cơ: tường trái, lò xo, vật, giảm chấn
        const cy = 120, x0 = 60, eq = 260;
        const px = eq + st.x * 120;
        g.fillStyle = '#334155'; g.fillRect(x0 - 14, cy - 60, 14, 120);
        // lò xo
        const coils = 12, sx = x0, ex = px - 30;
        g.strokeStyle = '#94a3b8'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(sx, cy - 20);
        for (let i = 0; i <= coils; i++) { const xx = sx + (i / coils) * (ex - sx); g.lineTo(xx, cy - 20 + (i % 2 ? -12 : 12) * (i === 0 || i === coils ? 0 : 1)); }
        g.lineTo(ex, cy - 20); g.stroke();
        // giảm chấn
        line(g, sx, cy + 24, sx + 60, cy + 24, '#64748b', 3); g.strokeStyle = '#64748b'; g.lineWidth = 3; g.strokeRect(sx + 60, cy + 12, 50, 24);
        line(g, sx + 60 + clamp((ex - sx - 60) * 0.45, 5, 48), cy + 14, sx + 60 + clamp((ex - sx - 60) * 0.45, 5, 48), cy + 34, '#cbd5e1', 4);
        line(g, sx + 60 + clamp((ex - sx - 60) * 0.45, 5, 48), cy + 24, ex, cy + 24, '#64748b', 3);
        // vật
        g.fillStyle = '#38bdf8'; roundRect(g, px - 30, cy - 30, 60, 60, 8); g.fill();
        text(g, 'm', px, cy + 5, { size: 14, align: 'center', color: '#0b1020', weight: '800' });
        line(g, eq, cy + 45, eq, cy + 60, '#4ade80', 1.5); text(g, 'x = 0', eq, cy + 74, { size: 10, align: 'center', color: '#4ade80' });
        label(g, `x = ${st.x.toFixed(2)} m`, px, cy - 46, { size: 11 });
        // chỉ số
        const rx = Math.max(480, w * 0.55);
        const kind = zeta < 1 ? 'tắt dần dưới (dao động)' : Math.abs(zeta - 1) < 0.01 ? 'tắt dần tới hạn' : 'tắt dần trên';
        if (w - rx > 150) {
          text(g, `ωn = √(k/m) = ${wn.toFixed(2)} rad/s`, rx, 80, { size: 12 });
          text(g, `T = 2π/ωn = ${(2 * Math.PI / wn).toFixed(2)} s`, rx, 102, { size: 12 });
          text(g, `ζ = c/(2√km) = ${zeta.toFixed(3)}`, rx, 124, { size: 12 });
          label(g, kind, rx + 90, 152, { size: 12, color: zeta < 1 ? '#38bdf8' : zeta > 1.01 ? '#f87171' : '#4ade80', align: 'center' });
        }
        // đồ thị
        const gx = 40, gy = 220, gw = w - 70, gh = h - gy - 50;
        const t0 = st.hist.length ? st.hist[0][0] : 0, t1 = Math.max(t0 + 10, st.t);
        const P = plot(g, gx, gy, gw, gh, { xmin: t0, xmax: t1, ymin: -1, ymax: 1, xlabel: 'thời gian (s)', ylabel: 'x (m)', title: 'Li độ theo thời gian' });
        polyline(g, [[P.X(t0), P.Y(0)], [P.X(t1), P.Y(0)]], COLORS.grid, 1);
        if (zeta < 1 && p.c > 0) { const env = [], env2 = []; for (let i = 0; i <= 100; i++) { const tt = t0 + (i / 100) * (t1 - t0); const a = Math.abs(p.x0) * Math.exp(-zeta * wn * tt); env.push([P.X(tt), P.Y(clamp(a, -1, 1))]); env2.push([P.X(tt), P.Y(clamp(-a, -1, 1))]); } polyline(g, env, 'rgba(251,191,36,0.4)', 1); polyline(g, env2, 'rgba(251,191,36,0.4)', 1); }
        polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(clamp(r[1], -1, 1))]), COLORS.physics, 2);
      },
      metrics(p) { const wn = Math.sqrt(p.k / p.m), zeta = p.c / (2 * Math.sqrt(p.k * p.m)); return [['ωn', `${wn.toFixed(2)} rad/s`], ['Chu kì T', `${(2 * Math.PI / wn).toFixed(2)} s`], ['ζ', zeta, 3], ['Trạng thái', zeta < 1 ? 'tắt dần dưới' : zeta > 1.01 ? 'tắt dần trên' : 'tới hạn'], ['x hiện tại', `${st.x.toFixed(3)} m`], ['Cơ năng', `${(0.5 * p.k * st.x * st.x + 0.5 * p.m * st.v * st.v).toFixed(2)} J`]]; }
    };
  }
};
