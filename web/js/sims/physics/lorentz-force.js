import { COLORS, text, label, circle, line, arrow, roundRect } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

export default {
  id: 'physics-lorentz-force',
  subject: 'physics',
  chapter: 'magnetism',
  title: 'Lực từ tác dụng lên dây dẫn mang dòng điện',
  summary: 'Thanh kim loại trên hai ray trong từ trường: cấp dòng điện, thanh bị đẩy theo quy tắc bàn tay trái. F = B·I·L·sinα, đổi chiều I hoặc B thì lực đổi chiều.',
  equation: ['F = B·I·L·sinα', 'Quy tắc bàn tay trái: B xuyên vào lòng bàn tay, 4 ngón theo chiều I, ngón cái choãi 90° chỉ chiều F'],
  keywords: ['lực từ', 'bàn tay trái', 'Ampère', 'BIL', 'động cơ điện', 'cân dòng điện'],
  theory: [
    'Dây dẫn mang dòng điện đặt trong từ trường chịu **lực từ (lực Ampère)**: F = B·I·L·sinα, với α là góc giữa dây dẫn và vectơ B. Lực lớn nhất khi dây **vuông góc** với B, bằng 0 khi dây **song song** với B.',
    'Chiều lực xác định bằng **quy tắc bàn tay trái**. Đổi chiều dòng điện hoặc đổi chiều từ trường → lực đổi chiều. Đây là nguyên lí hoạt động của **động cơ điện, loa điện động**.',
    'Thí nghiệm cân dòng điện: đo lực từ lên đoạn dây để xác định B = F/(I·L).'
  ],
  observe: ['Đặt α = 0: thanh không chuyển động dù I lớn.', 'Đảo dấu I: thanh chạy ngược lại.', 'Tăng B và I: gia tốc thanh tăng theo tích B·I.'],
  exam: ['Tính F = BIL sinα; xác định chiều lực bằng bàn tay trái.', 'Bài toán thanh trượt trên ray, dây treo trong từ trường, cân bằng lực.'],
  params: [
    { key: 'B', label: 'Cảm ứng từ B', min: -1, max: 1, step: 0.1, value: 0.5, unit: 'T', decimals: 1, help: 'dương: hướng vào màn hình (×), âm: hướng ra (•)' },
    { key: 'I', label: 'Dòng điện I', min: -5, max: 5, step: 0.5, value: 2, unit: 'A', decimals: 1 },
    { key: 'L', label: 'Chiều dài thanh L', min: 0.1, max: 0.5, step: 0.05, value: 0.2, unit: 'm', decimals: 2 },
    { key: 'alpha', label: 'Góc α giữa thanh và B', min: 0, max: 90, step: 5, value: 90, unit: '°' }
  ],
  create() {
    const st = { x: 0, v: 0 };
    return {
      onParam(k) { if (k === 'B' || k === 'I') { /* giữ vị trí */ } },
      update(dt, p) {
        const F = force(p);
        const m = 0.05; // kg
        const a = F / m;
        st.v += a * dt; st.v *= Math.exp(-dt * 1.5);
        st.x += st.v * dt * 100;
        if (st.x > 160) { st.x = 160; st.v = 0; } if (st.x < -160) { st.x = -160; st.v = 0; }
      },
      draw(g, w, h, p, t) {
        const F = force(p);
        const cx = w * 0.42, cy = h / 2;
        // vùng từ trường: lưới × hoặc •
        const fw = 420, fh = 240;
        g.fillStyle = 'rgba(56,189,248,0.05)'; roundRect(g, cx - fw / 2, cy - fh / 2, fw, fh, 10); g.fill();
        g.strokeStyle = 'rgba(56,189,248,0.3)'; g.lineWidth = 1; g.stroke();
        const Bmag = Math.abs(p.B);
        if (Bmag > 0.05) for (let i = 0; i < 10; i++) for (let j = 0; j < 6; j++) {
          const x = cx - fw / 2 + 25 + i * (fw - 50) / 9, y = cy - fh / 2 + 25 + j * (fh - 50) / 5;
          const col = `rgba(56,189,248,${0.3 + Bmag * 0.6})`;
          if (p.B > 0) { line(g, x - 4, y - 4, x + 4, y + 4, col, 1.5); line(g, x - 4, y + 4, x + 4, y - 4, col, 1.5); } else circle(g, x, y, 2.5, col);
        }
        label(g, p.B > 0 ? 'B hướng vào màn hình (×)' : p.B < 0 ? 'B hướng ra màn hình (•)' : 'B = 0', cx, cy - fh / 2 - 16, { size: 11, color: '#38bdf8' });
        // hai ray ngang
        line(g, cx - fw / 2 + 10, cy - 50, cx + fw / 2 - 10, cy - 50, '#94a3b8', 4);
        line(g, cx - fw / 2 + 10, cy + 50, cx + fw / 2 - 10, cy + 50, '#94a3b8', 4);
        // nguồn
        text(g, 'nguồn', cx - fw / 2 - 30, cy + 4, { size: 10.5, align: 'center', color: COLORS.muted });
        line(g, cx - fw / 2 + 10, cy - 50, cx - fw / 2 - 10, cy - 50, '#94a3b8', 3); line(g, cx - fw / 2 - 10, cy - 50, cx - fw / 2 - 10, cy - 12, '#94a3b8', 3);
        line(g, cx - fw / 2 + 10, cy + 50, cx - fw / 2 - 10, cy + 50, '#94a3b8', 3); line(g, cx - fw / 2 - 10, cy + 50, cx - fw / 2 - 10, cy + 12, '#94a3b8', 3);
        line(g, cx - fw / 2 - 22, cy - 12, cx - fw / 2 + 2, cy - 12, '#e2e8f0', 4); line(g, cx - fw / 2 - 16, cy + 12, cx - fw / 2 - 4, cy + 12, '#e2e8f0', 2);
        // thanh (nghiêng theo alpha so với B? B vuông góc màn hình nên α = góc giữa thanh và B — mô tả bằng độ nghiêng thanh ra khỏi mặt phẳng; minh họa bằng độ ngắn hình chiếu)
        const bx = cx + st.x;
        const proj = Math.sin(p.alpha * Math.PI / 180);
        const len = 100 * Math.max(proj, 0.12);
        g.save(); g.translate(bx, cy);
        g.fillStyle = '#d97706'; roundRect(g, -7, -len / 2 - 6, 14, len + 12, 4); g.fill();
        g.restore();
        if (p.alpha < 90) label(g, `thanh nghiêng, α = ${p.alpha}° (hình chiếu)`, bx, cy + 75, { size: 10, color: COLORS.muted });
        // dòng điện trên thanh
        if (Math.abs(p.I) > 0.1) { const dir = p.I > 0 ? 1 : -1; const u = (t * 1.5) % 1; const yy = cy - 45 + u * 90; const ay = dir > 0 ? yy : cy + 45 - u * 90; circle(g, bx, ay, 4, '#fbbf24'); arrow(g, bx + 18, cy - 30 * dir, bx + 18, cy + 30 * dir, '#fbbf24', 2); text(g, 'I', bx + 30, cy + 4, { size: 12, color: '#fbbf24', weight: '700' }); }
        // lực
        if (Math.abs(F) > 1e-4) { const d = Math.sign(F); arrow(g, bx, cy, bx + d * (30 + Math.min(80, Math.abs(F) * 100)), cy, '#f87171', 3.5, 12); text(g, `F = ${(Math.abs(F) * 1000).toFixed(1)} mN`, bx + d * 60, cy - 18, { size: 11.5, align: 'center', color: '#f87171', weight: '700' }); }
        else label(g, 'F = 0', bx, cy - 70, { size: 11, color: COLORS.muted });
        // bàn tay trái bên phải
        const rx = Math.max(w * 0.74, cx + fw / 2 + 40);
        if (w - rx > 140) {
          text(g, 'Quy tắc bàn tay trái', rx, 70, { size: 13, weight: '700' });
          ['• B xuyên vào lòng bàn tay', '• 4 ngón theo chiều I', '• ngón cái (90°) → chiều F', '', `F = B·I·L·sinα`, `= ${Math.abs(p.B)}·${Math.abs(p.I)}·${p.L}·sin${p.alpha}°`, `= ${(Math.abs(F) * 1000).toFixed(1)} mN`].forEach((s, i) => text(g, s, rx, 96 + i * 22, { size: 11.5, color: i >= 4 ? COLORS.text : COLORS.muted, weight: i === 6 ? '700' : '500' }));
        }
      },
      metrics(p) { const F = force(p); return [['F', `${(Math.abs(F) * 1000).toFixed(1)} mN`], ['Chiều F', F > 0 ? 'sang phải' : F < 0 ? 'sang trái' : '—'], ['Vận tốc thanh', `${st.v.toFixed(2)} m/s`]]; }
    };
  }
};
// Quy ước: B>0 (vào màn hình), I>0 (chạy từ trên xuống) ⇒ F sang trái (bàn tay trái). Đổi dấu B hoặc I thì đảo.
function force(p) { return -p.B * p.I * p.L * Math.sin(p.alpha * Math.PI / 180); }
