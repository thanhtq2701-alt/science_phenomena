import { COLORS, text, label, circle, roundRect, polyline } from '../../core/draw.js';
import { clamp, gauss } from '../../core/engine.js';

export default {
  id: 'physics-brownian',
  subject: 'physics',
  chapter: 'thermal',
  title: 'Chuyển động Brown',
  summary: 'Hạt phấn hoa trong nước bị vô số phân tử nước va chạm không đều từ mọi phía nên chuyển động hỗn loạn. Nhiệt độ cao, hạt nhỏ → chuyển động càng rõ.',
  equation: ['Quãng đường dịch chuyển trung bình ⟨x²⟩ ∝ T · t / (η · r)'],
  keywords: ['Brown', 'chuyển động nhiệt', 'phân tử', 'va chạm', 'Einstein'],
  theory: [
    'Năm 1827 Robert Brown quan sát hạt phấn hoa trong nước chuyển động **hỗn loạn, không ngừng**. Giải thích (Einstein, 1905): các **phân tử nước** chuyển động nhiệt va chạm vào hạt từ mọi phía, **không cân bằng tại mỗi thời điểm** nên hạt bị đẩy ngẫu nhiên.',
    'Đây là **bằng chứng trực tiếp** cho thuyết động học phân tử: phân tử chất lỏng và khí chuyển động không ngừng, nhiệt độ càng cao chuyển động càng mạnh.',
    'Hạt càng **nhỏ** thì lực tổng hợp càng mất cân bằng → chuyển động Brown càng rõ. Hạt lớn thì các va chạm bù trừ nhau.'
  ],
  observe: ['Tăng nhiệt độ: quỹ đạo (vệt vàng) lan xa hơn.', 'Tăng bán kính hạt: hạt gần như đứng yên.', 'Bật "hiện phân tử nước" để thấy nguyên nhân.'],
  exam: ['Giải thích chuyển động Brown; nêu các yếu tố ảnh hưởng.'],
  params: [
    { key: 'temp', label: 'Nhiệt độ', min: 273, max: 373, step: 5, value: 300, unit: 'K' },
    { key: 'radius', label: 'Bán kính hạt', min: 4, max: 20, step: 1, value: 8, unit: 'px' },
    { key: 'show', label: 'Hiện phân tử nước', type: 'toggle', value: true }
  ],
  create() {
    const st = { x: 0.5, y: 0.5, vx: 0, vy: 0, path: [], mols: [], disp2: 0, n: 0 };
    for (let i = 0; i < 140; i++) st.mols.push({ x: Math.random(), y: Math.random(), vx: gauss(), vy: gauss() });
    return {
      update(dt, p) {
        const amp = Math.sqrt(p.temp / 300);
        const kick = amp * 12 / p.radius;
        st.vx += gauss() * kick * Math.sqrt(dt) * 6; st.vy += gauss() * kick * Math.sqrt(dt) * 6;
        st.vx *= Math.exp(-dt * 4); st.vy *= Math.exp(-dt * 4);
        st.x += st.vx * dt * 0.05; st.y += st.vy * dt * 0.05;
        if (st.x < 0.05 || st.x > 0.95) { st.vx *= -1; st.x = clamp(st.x, 0.05, 0.95); }
        if (st.y < 0.05 || st.y > 0.95) { st.vy *= -1; st.y = clamp(st.y, 0.05, 0.95); }
        st.n += dt; if (st.n > 0.08) { st.path.push([st.x, st.y]); st.n = 0; if (st.path.length > 400) st.path.shift(); }
        for (const m of st.mols) {
          m.x += m.vx * dt * 0.25 * amp; m.y += m.vy * dt * 0.25 * amp;
          if (m.x < 0 || m.x > 1) { m.vx *= -1; m.x = clamp(m.x, 0, 1); } if (m.y < 0 || m.y > 1) { m.vy *= -1; m.y = clamp(m.y, 0, 1); }
          if (Math.random() < dt * 2) { m.vx = gauss(); m.vy = gauss(); }
        }
        if (st.path.length) { const o = st.path[0]; st.disp2 = Math.hypot(st.x - o[0], st.y - o[1]); }
      },
      draw(g, w, h, p) {
        const bx = 40, by = 40, bs = Math.min(w * 0.55, h - 80);
        g.fillStyle = 'rgba(30,58,138,0.25)'; roundRect(g, bx, by, bs, bs, 10); g.fill(); g.strokeStyle = COLORS.grid; g.lineWidth = 2; g.stroke();
        if (p.show) for (const m of st.mols) circle(g, bx + m.x * bs, by + m.y * bs, 2.2, 'rgba(147,197,253,0.6)');
        polyline(g, st.path.map(([x, y]) => [bx + x * bs, by + y * bs]), 'rgba(251,191,36,0.6)', 1.5);
        circle(g, bx + st.x * bs, by + st.y * bs, p.radius, '#fbbf24', 'rgba(0,0,0,0.4)');
        label(g, 'kính hiển vi: hạt phấn hoa trong nước', bx + bs / 2, by - 14, { size: 11, color: COLORS.muted });
        const rx = bx + bs + 40;
        if (w - rx > 180) {
          text(g, 'Vì sao hạt chuyển động?', rx, 80, { size: 14, weight: '700' });
          ['Hàng tỉ phân tử nước va vào hạt mỗi giây,', 'từ mọi hướng, với số lượng không đều nhau', '→ lực tổng hợp ≠ 0 và đổi hướng ngẫu nhiên.', '', `Nhiệt độ ${p.temp} K: phân tử chuyển động`, `nhanh hơn ${Math.sqrt(p.temp / 273).toFixed(2)} lần so với 273 K.`, '', `Hạt bán kính ${p.radius}: hạt càng lớn, các va chạm`, 'càng bù trừ nhau → ít chuyển động.'].forEach((s, i) => text(g, s, rx, 110 + i * 22, { size: 12, color: COLORS.muted }));
        }
      },
      metrics(p) { return [['Tốc độ hạt tức thời', Math.hypot(st.vx, st.vy), 1], ['Độ dịch chuyển (từ đầu vệt)', st.disp2 * 100, 1], ['Nhiệt độ', `${p.temp} K`]]; }
    };
  }
};
