import { COLORS, text, label, beaker, circle, line, roundRect, withAlpha, bar } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

export default {
  id: 'chem-soap-micelle',
  subject: 'chem',
  chapter: 'ester-lipid',
  title: 'Xà phòng và chất giặt rửa: cơ chế tẩy vết dầu mỡ',
  summary: 'Phân tử xà phòng có đầu ưa nước và đuôi kị nước: đuôi cắm vào giọt dầu, đầu quay ra nước tạo micelle rồi bị nước cuốn đi. So sánh xà phòng với chất giặt rửa tổng hợp trong nước cứng.',
  equation: ['Xà phòng: RCOO−Na+ (R dài ~ C15–C17) – đầu ưa nước COO−, đuôi kị nước R', 'Trong nước cứng: 2RCOO− + Ca2+ → (RCOO)2Ca↓ (mất tác dụng)', 'Chất giặt rửa tổng hợp: R–SO3−Na+ hoặc R–OSO3−Na+, không kết tủa với Ca2+, Mg2+'],
  keywords: ['xà phòng', 'chất giặt rửa', 'micelle', 'ưa nước', 'kị nước', 'tẩy rửa', 'nước cứng', 'alkylbenzene sulfonate'],
  theory: [
    'Xà phòng là **muối sodium/potassium của acid béo**; chất giặt rửa tổng hợp là muối sodium của alkyl sulfate hay alkylbenzene sulfonate. Cả hai có cấu trúc **lưỡng tính**: **đầu phân cực ưa nước** và **đuôi hydrocarbon dài kị nước**.',
    'Khi giặt, đuôi kị nước **hòa tan vào vết dầu mỡ**, đầu ưa nước hướng ra nước. Khuấy, giọt dầu bị chia nhỏ, bao bọc thành **micelle** mang điện âm bên ngoài, lơ lửng trong nước và bị rửa trôi. Xà phòng cũng làm **giảm sức căng bề mặt** để nước thấm vào vải.',
    'Trong **nước cứng**, xà phòng tạo kết tủa với Ca2+, Mg2+ nên tốn xà phòng và vải bị bám cặn; chất giặt rửa tổng hợp **không bị kết tủa** nên dùng được trong nước cứng, nhưng loại mạch nhánh khó phân hủy sinh học.'
  ],
  observe: ['Bấm "Khuấy" để thấy đuôi kị nước bám vào giọt dầu rồi tách thành micelle.', 'Bật nước cứng với xà phòng: kết tủa xuất hiện, dầu không được tẩy; đổi sang chất giặt rửa tổng hợp thì vẫn tẩy được.'],
  exam: ['Giải thích cơ chế tẩy rửa dựa trên cấu tạo phân tử xà phòng.', 'Vì sao không nên dùng xà phòng với nước cứng; ưu nhược điểm của chất giặt rửa tổng hợp.'],
  params: [
    { key: 'agent', label: 'Chất tẩy rửa', type: 'select', value: 'soap', options: [['soap', 'Xà phòng (RCOONa)'], ['syn', 'Chất giặt rửa tổng hợp (RSO3Na)']] },
    { key: 'hard', label: 'Nước cứng (nhiều Ca2+)', type: 'toggle', value: false },
    { key: 'amount', label: 'Lượng chất tẩy', min: 0, max: 10, step: 1, value: 6 }
  ],
  actions: [{ key: 'stir', label: '🌀 Khuấy / giặt' }],
  create() {
    const st = { oil: 1, micelles: [], stirs: 0, precip: 0, mols: [] };
    for (let i = 0; i < 40; i++) st.mols.push({ a: Math.random() * TAU, r: 0.5 + Math.random() * 0.5, attached: false, ph: Math.random() * TAU });
    return {
      onParam() { st.oil = 1; st.micelles = []; st.precip = 0; st.stirs = 0; for (const m of st.mols) m.attached = false; },
      action(key, p) {
        if (key !== 'stir') return;
        const active = p.agent === 'syn' || !p.hard;
        const eff = active ? clamp(p.amount / 6, 0, 1) : 0.05;
        if (p.agent === 'soap' && p.hard) st.precip = clamp(st.precip + p.amount * 0.08, 0, 1);
        if (st.oil > 0.05 && eff > 0.1) { const n = Math.round(3 * eff); for (let i = 0; i < n; i++) st.micelles.push({ x: 0.5 + (Math.random() - .5) * 0.2, y: 0.55, vx: (Math.random() - .5) * 0.25, vy: -(0.05 + Math.random() * 0.15), r: 10 + Math.random() * 6 }); st.oil = clamp(st.oil - 0.18 * eff, 0, 1); }
        st.stirs++;
      },
      update(dt, p) {
        const active = p.agent === 'syn' || !p.hard;
        const nAttach = active ? Math.round(clamp(p.amount / 10, 0, 1) * st.mols.length * st.oil) : 0;
        st.mols.forEach((m, i) => { m.attached = i < nAttach; m.ph += dt; });
        for (const mc of st.micelles) { mc.x += mc.vx * dt; mc.y += mc.vy * dt; if (mc.x < 0.05 || mc.x > 0.95) mc.vx *= -1; if (mc.y < 0.08) mc.vy = Math.abs(mc.vy) * 0.3; }
      },
      draw(g, w, h, p, t) {
        const bx = 40, by = 70, bw = Math.min(360, w * 0.45), bh = 300;
        const r = beaker(g, bx, by, bw, bh, 0.85, 'rgba(96,165,250,0.18)', { precipitate: st.precip > 0.05 ? '#f1f5f9' : null, precipHeight: 4 + 16 * st.precip, title: (p.hard ? 'nước cứng' : 'nước') + ' + vải dính dầu' });
        // vải
        g.fillStyle = '#e2e8f0'; roundRect(g, bx + 30, by + bh - 70, bw - 60, 28, 4); g.fill();
        // giọt dầu trên vải
        const oilR = 40 * Math.sqrt(st.oil);
        const ox = bx + bw / 2, oy = by + bh - 60;
        if (st.oil > 0.02) { g.fillStyle = 'rgba(234,179,8,0.85)'; g.beginPath(); g.ellipse(ox, oy, oilR, oilR * 0.5, 0, 0, TAU); g.fill(); }
        // phân tử chất tẩy
        for (const m of st.mols) {
          if (m.attached && st.oil > 0.02) { const a = Math.PI + m.a / 2 * 0.9 + 0.05; const hx = ox + Math.cos(a) * (oilR + 10), hy = oy + Math.sin(a) * (oilR * 0.5 + 10); drawSurfactant(g, hx, hy, a + Math.PI, p.agent); }
          else { const x = bx + 20 + ((m.a / TAU) * (bw - 40)), y = r.top + 20 + m.r * (bh - 120) + Math.sin(t + m.ph) * 6; if (!(p.agent === 'soap' && p.hard && st.precip > 0.3 && m.r > 0.7)) drawSurfactant(g, x, y, m.ph + t * 0.3, p.agent); }
        }
        // micelle
        for (const mc of st.micelles) { const x = bx + mc.x * bw, y = by + mc.y * bh; g.fillStyle = 'rgba(234,179,8,0.8)'; circle(g, x, y, mc.r * 0.6, 'rgba(234,179,8,0.8)'); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; drawSurfactant(g, x + Math.cos(a) * (mc.r + 4), y + Math.sin(a) * (mc.r + 4), a + Math.PI, p.agent, 0.6); } }
        label(g, `dầu còn trên vải: ${Math.round(st.oil * 100)}%`, bx + bw / 2, by - 14, { size: 11.5, color: st.oil < 0.3 ? '#4ade80' : COLORS.warn });
        // chú thích phải
        const rx = bx + bw + 40;
        if (w - rx > 200) {
          text(g, 'Phân tử chất tẩy rửa', rx, 80, { size: 13, weight: '700' });
          drawSurfactant(g, rx + 20, 115, 0, p.agent, 2);
          text(g, p.agent === 'soap' ? 'đầu ưa nước COO⁻Na⁺' : 'đầu ưa nước SO₃⁻Na⁺', rx + 60, 100, { size: 11, color: '#60a5fa' });
          text(g, 'đuôi kị nước (C15–C17)', rx + 60, 134, { size: 11, color: '#fbbf24' });
          const notes = p.agent === 'soap' && p.hard ? ['Ca²⁺ + 2RCOO⁻ → (RCOO)₂Ca↓', 'Xà phòng kết tủa → không tẩy được,', 'cặn bám lên vải.'] : ['1. Đuôi kị nước cắm vào giọt dầu.', '2. Khuấy: dầu vỡ thành giọt nhỏ', '   bọc bởi lớp đầu ưa nước → micelle.', '3. Micelle tan trong nước, bị rửa trôi.', p.agent === 'syn' && p.hard ? 'RSO₃⁻ không kết tủa với Ca²⁺ → vẫn tẩy tốt.' : ''];
          notes.forEach((s, i) => text(g, s, rx, 170 + i * 22, { size: 11.5, color: COLORS.muted }));
          bar(g, rx, 300, w - rx - 30, 10, 1 - st.oil, '#4ade80', `Hiệu quả tẩy: ${Math.round((1 - st.oil) * 100)}%`);
          text(g, `Số lần khuấy: ${st.stirs}`, rx, 340, { size: 11, color: COLORS.muted });
        }
      },
      metrics(p) { return [['Dầu còn lại', `${Math.round(st.oil * 100)} %`], ['Micelle tạo thành', st.micelles.length], ['Kết tủa với Ca2+', p.agent === 'soap' && p.hard ? 'có' : 'không']]; }
    };
  }
};
function drawSurfactant(g, x, y, ang, agent, s = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.strokeStyle = '#fbbf24'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 0); for (let i = 1; i <= 5; i++) g.lineTo(-i * 6, (i % 2 ? 3 : -3)); g.stroke();
  circle(g, 0, 0, 5, agent === 'soap' ? '#60a5fa' : '#818cf8', '#0b1020');
  g.restore();
}
