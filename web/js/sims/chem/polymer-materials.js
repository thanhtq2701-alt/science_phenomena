import { COLORS, text, label, circle, line, roundRect, bar } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

const MATS = {
  pe: { name: 'Polyethylene (PE) – chất dẻo', mono: 'CH2=CH2', use: 'túi, màng bọc, chai', type: 'chất dẻo (nhiệt dẻo)', elastic: 0.1, soft: 0.8, color: '#94a3b8' },
  pvc: { name: 'Poly(vinyl chloride) (PVC) – chất dẻo', mono: 'CH2=CHCl', use: 'ống nước, vỏ dây điện', type: 'chất dẻo (nhiệt dẻo)', elastic: 0.05, soft: 0.6, color: '#64748b' },
  rubber: { name: 'Cao su thiên nhiên (chưa lưu hóa)', mono: 'isoprene C5H8', use: 'kém bền, dính khi nóng', type: 'cao su', elastic: 0.6, soft: 0.95, color: '#fbbf24' },
  vulc: { name: 'Cao su lưu hóa (có cầu nối S)', mono: 'isoprene + S', use: 'lốp xe, gioăng', type: 'cao su', elastic: 1, soft: 0.5, color: '#f97316' },
  nylon: { name: 'Nylon-6,6 – tơ tổng hợp', mono: 'diamine + diacid', use: 'vải, dây dù', type: 'tơ (sợi)', elastic: 0.2, soft: 0.3, color: '#60a5fa' },
  bakelite: { name: 'Nhựa phenol-formaldehyde (nhiệt rắn)', mono: 'phenol + HCHO', use: 'vỏ ổ cắm, tay cầm nồi', type: 'chất dẻo (nhiệt rắn)', elastic: 0, soft: 0.05, color: '#92400e' }
};

export default {
  id: 'chem-polymer-materials',
  subject: 'chem',
  chapter: 'polymer',
  title: 'Vật liệu polymer: chất dẻo, cao su lưu hóa, tơ',
  summary: 'Kéo giãn và nung từng vật liệu: cao su lưu hóa đàn hồi nhờ cầu nối disulfide, nhựa nhiệt dẻo mềm khi nóng, nhựa nhiệt rắn không chảy, tơ là sợi dài bền.',
  equation: ['Lưu hóa: cao su + S (t°) → mạng lưới cầu –S–S– giữa các mạch', 'Nhiệt dẻo: mạch thẳng/nhánh, mềm khi nóng, tái chế được', 'Nhiệt rắn: mạng không gian, không nóng chảy, không tái chế'],
  keywords: ['chất dẻo', 'cao su', 'lưu hóa', 'tơ', 'nhiệt dẻo', 'nhiệt rắn', 'PE', 'PVC', 'nylon', 'vật liệu polymer', 'composite'],
  theory: [
    '**Chất dẻo** là vật liệu polymer có tính dẻo (biến dạng khi chịu nhiệt/áp lực và giữ nguyên dạng). **Nhiệt dẻo** (PE, PP, PVC, PS) có mạch thẳng/nhánh → mềm khi đun, tái chế được. **Nhiệt rắn** (phenol-formaldehyde, epoxy) có mạng không gian → không nóng chảy.',
    '**Cao su** có tính đàn hồi. Cao su thiên nhiên (polyisoprene) kém bền, dính khi nóng, giòn khi lạnh. **Lưu hóa** với lưu huỳnh tạo **cầu nối –S–S–** giữa các mạch → đàn hồi tốt hơn, chịu nhiệt, không tan trong dung môi.',
    '**Tơ** là polymer hình sợi dài, mảnh, bền (mạch không phân nhánh, xếp song song). Tơ thiên nhiên (bông, tơ tằm, len), tơ nhân tạo (visco, acetate – từ cellulose), tơ tổng hợp (nylon, lapsan, nitron). **Composite** = polymer nền + chất độn.'
  ],
  observe: ['Kéo cao su lưu hóa: giãn rồi trở lại; kéo PE: biến dạng vĩnh viễn (chảy dẻo).', 'Nung PE/PVC: mềm chảy; nung nhựa phenol-formaldehyde: không chảy.', 'So sánh cao su trước và sau lưu hóa.'],
  exam: ['Phân loại polymer theo nguồn gốc, cấu trúc, tính chất; vì sao lưu hóa làm cao su bền hơn.', 'Viết PTHH điều chế PE, PVC, nylon-6,6, cao su buna.'],
  params: [
    { key: 'mat', label: 'Vật liệu', type: 'select', value: 'vulc', options: Object.entries(MATS).map(([k, v]) => [k, v.name]) },
    { key: 'pull', label: 'Lực kéo', min: 0, max: 100, step: 5, value: 0, unit: '%' },
    { key: 'temp', label: 'Nhiệt độ', min: 20, max: 300, step: 10, value: 25, unit: '°C' }
  ],
  create() {
    const st = { stretch: 0, perm: 0, melt: 0 };
    return {
      onParam(k) { if (k === 'mat') { st.stretch = 0; st.perm = 0; st.melt = 0; } },
      update(dt, p) {
        const m = MATS[p.mat];
        const target = p.pull / 100 * (0.3 + m.elastic * 0.9 + m.soft * 0.3);
        st.stretch += (target - st.stretch) * (1 - Math.exp(-dt * 4));
        // biến dạng vĩnh viễn với vật liệu dẻo (không đàn hồi)
        if (p.pull > 20 && m.elastic < 0.3) st.perm = clamp(st.perm + dt * 0.1 * (1 - m.elastic) * p.pull / 100, 0, 0.6);
        const meltT = p.mat === 'bakelite' ? 9999 : p.mat === 'pe' ? 120 : p.mat === 'pvc' ? 160 : p.mat === 'nylon' ? 250 : p.mat === 'rubber' ? 100 : 200;
        const tgt = p.temp > meltT ? 1 : 0;
        st.melt += (tgt - st.melt) * (1 - Math.exp(-dt));
      },
      draw(g, w, h, p, t) {
        const m = MATS[p.mat];
        // mẫu vật liệu kéo giãn
        const cx = w * 0.3, cy = 150;
        const baseL = 120, L = baseL * (1 + st.stretch + st.perm);
        text(g, m.name, 30, 40, { size: 13, weight: '700' });
        g.fillStyle = '#334155'; roundRect(g, cx - L / 2 - 30, cy - 20, 30, 40, 4); g.fill(); roundRect(g, cx + L / 2, cy - 20, 30, 40, 4); g.fill();
        const thick = 30 / Math.sqrt(1 + st.stretch + st.perm) * (1 - st.melt * 0.5);
        g.fillStyle = m.color; roundRect(g, cx - L / 2, cy - thick / 2 + st.melt * 20, L, thick, 6); g.fill();
        if (st.melt > 0.3) { g.fillStyle = m.color; g.globalAlpha = st.melt; g.beginPath(); g.ellipse(cx, cy + 40, L / 2 + 20, 12 * st.melt, 0, 0, TAU); g.fill(); g.globalAlpha = 1; label(g, 'nóng chảy / mềm nhão', cx, cy + 70, { size: 10.5, color: COLORS.warn }); }
        if (p.pull > 0) { text(g, '←', cx - L / 2 - 50, cy + 6, { size: 20, color: '#fbbf24' }); text(g, '→', cx + L / 2 + 36, cy + 6, { size: 20, color: '#fbbf24' }); }
        label(g, `độ giãn ${Math.round((st.stretch + st.perm) * 100)}%${st.perm > 0.05 ? ` (vĩnh viễn ${Math.round(st.perm * 100)}%)` : ''}`, cx, cy - 50, { size: 11 });
        if (p.mat === 'bakelite' && p.temp > 250) label(g, 'không chảy – cháy/phân hủy khi quá nóng', cx, cy + 70, { size: 10.5, color: COLORS.danger });
        // mô hình mạch
        const mx = 30, my = 240, mw = Math.min(w * 0.55, 480), mh = 180;
        g.fillStyle = 'rgba(30,41,59,0.5)'; roundRect(g, mx, my, mw, mh, 10); g.fill();
        const sx = 1 + st.stretch * 0.8;
        const nCh = 4;
        for (let k = 0; k < nCh; k++) {
          const y0 = my + 30 + k * 40;
          g.strokeStyle = m.color; g.lineWidth = 3; g.beginPath();
          for (let i = 0; i <= 40; i++) { const u = i / 40; const x = mx + 20 + u * (mw - 40); const amp = p.mat === 'rubber' || p.mat === 'vulc' ? 14 / sx : 5; const y = y0 + Math.sin(u * 20 + k + t * (st.melt + 0.2)) * amp; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
          g.stroke();
        }
        if (p.mat === 'vulc') for (let i = 0; i < 6; i++) { const x = mx + 50 + i * (mw - 100) / 5; for (let k = 0; k < nCh - 1; k++) { const y0 = my + 30 + k * 40; line(g, x, y0 + 4, x, y0 + 36, '#facc15', 3); text(g, 'S–S', x + 6, y0 + 24, { size: 8, color: '#facc15' }); } }
        if (p.mat === 'bakelite') for (let i = 0; i < 10; i++) { const x = mx + 30 + i * (mw - 60) / 9; for (let k = 0; k < nCh - 1; k++) line(g, x, my + 34 + k * 40, x + 15, my + 66 + k * 40, '#fde68a', 2); }
        text(g, p.mat === 'vulc' ? 'cầu nối S–S giữ các mạch → kéo giãn rồi hồi lại' : p.mat === 'rubber' ? 'mạch cuộn xoắn, không có cầu nối → trượt lên nhau, dính' : p.mat === 'bakelite' ? 'mạng không gian 3 chiều → cứng, không nóng chảy' : p.mat === 'nylon' ? 'mạch thẳng xếp song song, liên kết hydrogen → sợi bền' : 'mạch thẳng/nhánh trượt lên nhau → dẻo, mềm khi nóng', mx + 10, my + mh - 10, { size: 10.5, color: COLORS.muted });
        // thẻ tính chất
        const rx = mx + mw + 30, rw = w - rx - 30;
        if (rw > 150) {
          text(g, 'Tính chất', rx, 250, { size: 13, weight: '700' });
          bar(g, rx, 280, rw, 10, m.elastic, '#f97316', `Đàn hồi: ${Math.round(m.elastic * 100)}%`);
          bar(g, rx, 320, rw, 10, m.soft, '#60a5fa', `Dẻo/mềm: ${Math.round(m.soft * 100)}%`);
          text(g, `Loại: ${m.type}`, rx, 360, { size: 11.5, color: COLORS.muted });
          text(g, `Monomer: ${m.mono}`, rx, 382, { size: 11.5, color: COLORS.muted });
          text(g, `Ứng dụng: ${m.use}`, rx, 404, { size: 11.5, color: COLORS.muted });
        }
      },
      metrics(p) { const m = MATS[p.mat]; return [['Loại vật liệu', m.type], ['Độ giãn', `${Math.round((st.stretch + st.perm) * 100)} %`], ['Biến dạng vĩnh viễn', `${Math.round(st.perm * 100)} %`], ['Trạng thái nhiệt', st.melt > 0.5 ? 'mềm/chảy' : 'rắn']]; }
    };
  }
};
