import { COLORS, text, label, beaker, circle, line, plot, polyline, Bubbles, mixColor, withAlpha } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'chem-fermentation',
  subject: 'chem',
  chapter: 'carbohydrate',
  title: 'Lên men glucose thành ethanol',
  summary: 'Nấm men chuyển glucose thành ethanol và CO2; khí CO2 dẫn vào nước vôi trong làm vẩn đục. Nhiệt độ và nồng độ ethanol ảnh hưởng tới tốc độ lên men.',
  equation: ['C6H12O6 →(enzyme, 30–35 °C) 2C2H5OH + 2CO2↑', 'CO2 + Ca(OH)2 → CaCO3↓ (vẩn đục) + H2O', 'Tinh bột →(H+/enzyme) glucose → ethanol (sản xuất rượu, cồn sinh học)'],
  keywords: ['lên men', 'ethanol', 'nấm men', 'CO2', 'nước vôi trong', 'glucose', 'enzyme', 'cồn sinh học'],
  theory: [
    '**Lên men rượu**: dưới tác dụng của enzyme zymase trong nấm men, glucose bị phân giải (không cần O2) thành **ethanol** và **CO2**. Nhiệt độ thích hợp 30–35 °C; trên 45 °C enzyme bị biến tính; dưới 15 °C quá chậm.',
    'Khi nồng độ ethanol lên tới ~12–15%, nấm men **bị ức chế** nên rượu lên men tự nhiên không vượt quá mức này; muốn cồn cao hơn phải chưng cất.',
    'Ứng dụng: sản xuất rượu, bia; **cồn sinh học (bioethanol)** từ tinh bột/cellulose; CO2 làm bánh nở (men nở).'
  ],
  observe: ['Đặt 30–35 °C: bọt khí nhiều nhất, nước vôi đục nhanh.', 'Đặt 60 °C: gần như không lên men (enzyme chết).', 'Quan sát tốc độ chậm dần khi ethanol tích lũy.'],
  exam: ['Tính khối lượng ethanol/ thể tích CO2 từ m gam glucose với hiệu suất H%.', 'Bài toán tinh bột → glucose → ethanol hai giai đoạn.'],
  params: [
    { key: 'temp', label: 'Nhiệt độ', min: 10, max: 70, step: 1, value: 32, unit: '°C' },
    { key: 'glucose', label: 'Glucose ban đầu', min: 50, max: 300, step: 10, value: 180, unit: 'g/L' },
    { key: 'yeast', label: 'Lượng nấm men', min: 0.2, max: 3, step: 0.1, value: 1, decimals: 1 }
  ],
  create(ctx) {
    const st = { G: ctx.params.glucose, E: 0, cloud: 0, bub: new Bubbles(), hist: [], time: 0 };
    return {
      onParam(k, p) { if (k === 'glucose') { st.G = p.glucose; st.E = 0; st.cloud = 0; st.hist = []; st.time = 0; } },
      update(dt, p) {
        const T = p.temp;
        const fT = T > 48 ? 0 : Math.exp(-Math.pow((T - 33) / 9, 2));
        const inhibit = clamp(1 - st.E / 120, 0, 1); // ức chế khi ethanol > ~120 g/L (≈15%)
        const rate = 12 * p.yeast * fT * inhibit * (st.G / p.glucose);
        const dG = Math.min(st.G, rate * dt);
        st.G -= dG; st.E += dG * (92 / 180);
        st.time += dt;
        if (rate > 0.5 && st.geo && Math.random() < rate * dt * 2) st.bub.spawn(st.geo.x, st.geo.y, 1, { spread: 60 });
        if (st.geo) st.bub.update(dt, st.geo.top);
        st.cloud = clamp(st.cloud + dG * 0.004, 0, 1);
        if (Math.floor(st.time * 2) !== Math.floor((st.time - dt) * 2)) { st.hist.push([st.time, st.G, st.E]); if (st.hist.length > 400) st.hist.shift(); }
      },
      draw(g, w, h, p, t) {
        const bx = 40, by = 80, bw = 200, bh = 240;
        const r = beaker(g, bx, by, bw, bh, 0.75, withAlpha('#fde68a', 0.45), { title: `dịch glucose + nấm men, ${p.temp} °C` });
        st.geo = { x: bx + bw / 2, y: by + bh - 20, top: r.top };
        st.bub.draw(g);
        // ống dẫn khí sang bình nước vôi
        const lx = bx + bw + 80, ly = by + 60, lw = 110, lh = 180;
        line(g, bx + bw - 20, by, bx + bw - 20, by - 30, '#94a3b8', 3); line(g, bx + bw - 20, by - 30, lx + lw / 2, by - 30, '#94a3b8', 3); line(g, lx + lw / 2, by - 30, lx + lw / 2, ly + lh - 40, '#94a3b8', 3);
        beaker(g, lx, ly, lw, lh, 0.7, mixColor('#e0f2fe', '#e2e8f0', st.cloud), { title: 'nước vôi trong', surface: false });
        if (st.cloud > 0.05) { g.fillStyle = `rgba(241,245,249,${st.cloud * 0.9})`; g.fillRect(lx + 2, ly + lh - 0.7 * (lh - 10), lw - 4, 0.7 * (lh - 10) - 2); }
        label(g, st.cloud > 0.3 ? 'vẩn đục CaCO3' : st.cloud > 0.05 ? 'bắt đầu đục' : 'trong suốt', lx + lw / 2, ly - 14, { size: 11, color: st.cloud > 0.3 ? COLORS.text : COLORS.muted });
        if (st.bub.list.length > 3) { const u = (t * 1.5) % 1; circle(g, bx + bw - 20 + (lx + lw / 2 - bx - bw + 20) * u, by - 30, 3, '#e2e8f0'); text(g, 'CO₂', bx + bw / 2 + 60, by - 40, { size: 10, align: 'center', color: COLORS.muted }); }
        const T = p.temp; const fT = T > 48 ? 0 : Math.exp(-Math.pow((T - 33) / 9, 2));
        label(g, T > 48 ? 'enzyme bị biến tính – ngừng lên men' : T < 18 ? 'quá lạnh – lên men rất chậm' : `hoạt tính enzyme ${Math.round(fT * 100)}%`, bx + bw / 2, by + bh + 42, { size: 11, color: T > 48 ? COLORS.danger : COLORS.muted });
        // đồ thị
        const px = Math.max(lx + lw + 50, w * 0.52), py = 60, pw = w - px - 30, ph = h - py - 70;
        if (pw > 150) {
          const tmax = Math.max(30, st.time);
          const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: tmax, ymin: 0, ymax: p.glucose, xlabel: 'thời gian (s mô phỏng)', ylabel: 'g/L', title: 'Glucose giảm, ethanol tăng' });
          polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(r[1])]), '#fbbf24', 2.5);
          polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(r[2])]), '#f472b6', 2.5);
          text(g, '— glucose', px + pw - 8, py + 20, { size: 10.5, align: 'right', color: '#fbbf24' }); text(g, '— ethanol', px + pw - 8, py + 36, { size: 10.5, align: 'right', color: '#f472b6' });
          if (st.E > 100) text(g, 'ethanol > 12% → nấm men bị ức chế, tốc độ giảm', px, h - 22, { size: 11, color: COLORS.warn });
        }
      },
      metrics(p) { const used = p.glucose - st.G; return [['Glucose còn', `${st.G.toFixed(0)} g/L`], ['Ethanol', `${st.E.toFixed(1)} g/L (≈ ${(st.E / 789 * 100).toFixed(1)}% V)`], ['CO2 sinh ra', `${(used / 180 * 2 * 24.79).toFixed(1)} L/L dịch`], ['Hiệu suất tới giờ', `${(used / p.glucose * 100).toFixed(0)} %`]]; }
    };
  }
};
