import { COLORS, text, label, circle, line, arrow, roundRect, plot, polyline } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

export default {
  id: 'physics-faraday-induction',
  subject: 'physics',
  chapter: 'magnetism',
  title: 'Cảm ứng điện từ: nam châm chuyển động qua ống dây',
  summary: 'Đưa nam châm vào/ra ống dây: từ thông biến thiên sinh ra suất điện động cảm ứng, điện kế lệch. Nam châm đứng yên thì không có dòng. Định luật Faraday và Lenz.',
  equation: ['Φ = N·B·S·cosα', 'e = −ΔΦ/Δt  (định luật Faraday)', 'Định luật Lenz: dòng cảm ứng có chiều chống lại sự biến thiên từ thông sinh ra nó'],
  keywords: ['cảm ứng điện từ', 'từ thông', 'Faraday', 'Lenz', 'suất điện động cảm ứng', 'điện kế', 'ống dây'],
  theory: [
    'Khi **từ thông qua ống dây biến thiên** (nam châm tiến lại gần/ra xa, hoặc quay, hoặc thay đổi diện tích), trong ống dây xuất hiện **suất điện động cảm ứng** e = −ΔΦ/Δt. Nếu mạch kín, có **dòng điện cảm ứng**.',
    '**Độ lớn** e tỉ lệ với **tốc độ biến thiên từ thông**: đưa nam châm nhanh hơn, dùng nam châm mạnh hơn, ống dây nhiều vòng hơn → e lớn hơn. Nam châm **đứng yên** trong ống dây → Φ không đổi → e = 0.',
    '**Định luật Lenz**: dòng cảm ứng tạo từ trường **chống lại** nguyên nhân sinh ra nó: nam châm tiến lại → ống dây đẩy; nam châm đi ra → ống dây hút. Vì thế đưa nam châm vào ống dây cần tốn công – đó là năng lượng của dòng điện.'
  ],
  observe: ['Chọn "Tay đưa qua lại": thấy kim điện kế lệch hai chiều ngược nhau khi vào và ra.', 'Chọn "Đứng yên trong ống dây": kim về 0 dù từ thông lớn.', 'Tăng số vòng N: biên độ e tăng tỉ lệ.'],
  exam: ['Tính từ thông, suất điện động cảm ứng; xác định chiều dòng cảm ứng theo Lenz.', 'Giải thích thí nghiệm nam châm – ống dây – điện kế.'],
  quiz: {
    question: 'Đưa nam châm vào trong ống dây rồi rút ra. Kim điện kế nối với ống dây lệch thế nào?',
    options: ['Không lệch', 'Lệch cùng một chiều cả khi đưa vào và khi rút ra', 'Chỉ lệch khi nam châm nằm yên trong ống dây', 'Lệch theo hai chiều ngược nhau khi đưa vào và khi rút ra'],
    answer: 3,
    explanation: 'Dòng cảm ứng chỉ xuất hiện khi từ thông biến thiên. Đưa vào thì từ thông tăng, rút ra thì giảm, nên theo định luật Lenz dòng cảm ứng đổi chiều. Nam châm nằm yên thì kim về 0.'
  },
  params: [
    { key: 'motion', label: 'Chuyển động nam châm', type: 'select', value: 'osc', options: [['osc', 'Tay đưa qua lại (dao động)'], ['in', 'Đưa vào rồi dừng'], ['still', 'Đứng yên trong ống dây']] },
    { key: 'speed', label: 'Tốc độ đưa', min: 0.2, max: 3, step: 0.1, value: 1, decimals: 1 },
    { key: 'N', label: 'Số vòng dây N', min: 50, max: 1000, step: 50, value: 300 },
    { key: 'Bm', label: 'Độ mạnh nam châm', min: 0.1, max: 1, step: 0.1, value: 0.5, unit: 'T', decimals: 1 }
  ],
  create() {
    const st = { x: -1.4, flux: 0, emf: 0, hist: [], time: 0, phase: 0 };
    const fluxAt = (x, p) => p.N * p.Bm * 1e-3 * Math.exp(-x * x * 2.2); // Wb (S ≈ 10 cm²), hồ sơ Gauss
    return {
      onParam(k) { if (k === 'motion') { st.x = -1.4; st.phase = 0; st.hist = []; st.time = 0; } },
      update(dt, p) {
        st.time += dt;
        let x;
        if (p.motion === 'osc') { st.phase += dt * p.speed * 1.2; x = -1.2 * Math.cos(st.phase); }
        else if (p.motion === 'in') { x = Math.min(0, st.x + dt * p.speed * 0.8); }
        else x = 0;
        const f0 = fluxAt(st.x, p), f1 = fluxAt(x, p);
        st.emf = -(f1 - f0) / dt;
        st.x = x; st.flux = f1;
        if (Math.floor(st.time * 30) !== Math.floor((st.time - dt) * 30)) { st.hist.push([st.time, st.emf, st.flux]); if (st.hist.length > 240) st.hist.shift(); }
      },
      draw(g, w, h, p, t) {
        const cx = w * 0.3, cy = 150;
        // ống dây
        const cw = 180, ch = 70;
        g.fillStyle = 'rgba(217,119,6,0.15)'; roundRect(g, cx - cw / 2, cy - ch / 2, cw, ch, 8); g.fill();
        for (let i = 0; i < 14; i++) { const x = cx - cw / 2 + 8 + i * (cw - 16) / 13; g.strokeStyle = '#d97706'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, cy, 5, ch / 2, 0, 0, TAU); g.stroke(); }
        text(g, `ống dây N = ${p.N} vòng`, cx, cy + ch / 2 + 20, { size: 11, align: 'center', color: COLORS.muted });
        // nam châm
        const mx = cx + st.x * 150;
        g.fillStyle = '#ef4444'; roundRect(g, mx - 60, cy - 16, 60, 32, 3); g.fill();
        g.fillStyle = '#3b82f6'; roundRect(g, mx, cy - 16, 60, 32, 3); g.fill();
        text(g, 'S', mx - 30, cy + 5, { size: 14, align: 'center', color: '#fff', weight: '800' }); text(g, 'N', mx + 30, cy + 5, { size: 14, align: 'center', color: '#fff', weight: '800' });
        // vận tốc
        const v = p.motion === 'osc' ? 1.2 * Math.sin(st.phase) * p.speed * 1.2 : p.motion === 'in' && st.x < 0 ? p.speed * 0.8 : 0;
        if (Math.abs(v) > 0.05) arrow(g, mx, cy - 32, mx + Math.sign(v) * 40, cy - 32, '#fbbf24', 2.5);
        // điện kế
        const gx = cx, gy = cy + 170;
        line(g, cx - cw / 2, cy + ch / 2, cx - cw / 2, gy, '#e2e8f0', 2); line(g, cx + cw / 2, cy + ch / 2, cx + cw / 2, gy, '#e2e8f0', 2);
        line(g, cx - cw / 2, gy, gx - 40, gy, '#e2e8f0', 2); line(g, cx + cw / 2, gy, gx + 40, gy, '#e2e8f0', 2);
        circle(g, gx, gy, 40, '#0f172a', '#e2e8f0', 2.5);
        const emfMax = p.N * p.Bm * 1e-3 * 2.5 * 1.2 * p.speed * 1.5 + 1e-6;
        const ang = -Math.PI / 2 + clamp(st.emf / emfMax, -1, 1) * Math.PI / 3;
        arrow(g, gx, gy + 15, gx + Math.cos(ang) * 34, gy + 15 + Math.sin(ang) * 34, '#f87171', 2.5, 7);
        text(g, 'G', gx, gy - 18, { size: 14, align: 'center', weight: '800' });
        text(g, 'điện kế', gx, gy + 56, { size: 10.5, align: 'center', color: COLORS.muted });
        // dòng cảm ứng
        if (Math.abs(st.emf) > emfMax * 0.03) { const dir = Math.sign(st.emf); const u = (t * 2) % 1; const px = cx - cw / 2 + ((dir > 0 ? u : 1 - u) * cw); circle(g, px, cy - ch / 2 - 8, 4, '#fbbf24'); label(g, dir > 0 ? 'dòng cảm ứng ↻' : 'dòng cảm ứng ↺', cx, cy - ch / 2 - 26, { size: 10.5, color: '#fbbf24' }); }
        else label(g, 'không có dòng cảm ứng (Φ không đổi)', cx, cy - ch / 2 - 26, { size: 10.5, color: COLORS.muted });
        // đồ thị
        const px = w * 0.56, py = 50, pw = w - px - 30, ph = (h - 110) / 2;
        const t0 = st.hist.length ? st.hist[0][0] : 0, t1 = Math.max(t0 + 4, st.time);
        const fmax = p.N * p.Bm * 1e-3 * 1.1;
        const P1 = plot(g, px, py, pw, ph, { xmin: t0, xmax: t1, ymin: 0, ymax: fmax, title: 'Từ thông Φ (Wb)' });
        polyline(g, st.hist.map((r) => [P1.X(r[0]), P1.Y(r[2])]), '#38bdf8', 2);
        const P2 = plot(g, px, py + ph + 40, pw, ph, { xmin: t0, xmax: t1, ymin: -emfMax, ymax: emfMax, title: 'Suất điện động e = −ΔΦ/Δt (V)', xlabel: 'thời gian (s)' });
        polyline(g, [[P2.X(t0), P2.Y(0)], [P2.X(t1), P2.Y(0)]], COLORS.grid, 1);
        polyline(g, st.hist.map((r) => [P2.X(r[0]), P2.Y(clamp(r[1], -emfMax, emfMax))]), '#f87171', 2);
      },
      metrics(p) { return [['Từ thông Φ', `${(st.flux * 1000).toFixed(2)} mWb`], ['e cảm ứng', `${st.emf.toFixed(3)} V`], ['Vị trí nam châm', st.x, 2]]; }
    };
  }
};
