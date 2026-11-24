import { COLORS, text, label, circle, line, arrow, flame } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'physics-thin-lens',
  subject: 'physics',
  chapter: 'legacy',
  title: 'Thấu kính hội tụ: dựng ảnh của ngọn nến',
  summary: 'Kế thừa bài "Candle Optics" của bản gốc, sửa lại đúng công thức thấu kính 1/d + 1/d′ = 1/f và vẽ ba tia đặc biệt. Di chuyển nến để thấy ảnh thật/ảo, lớn/nhỏ.',
  equation: ['1/f = 1/d + 1/d′', 'k = −d′/d  (k < 0: ảnh thật ngược chiều; k > 0: ảnh ảo cùng chiều)', 'Thấu kính mỏng: 1/f = (n − 1)(1/R1 − 1/R2)'],
  keywords: ['thấu kính', 'hội tụ', 'tiêu cự', 'ảnh thật', 'ảnh ảo', 'tia đặc biệt', 'số phóng đại'],
  theory: [
    'Ba tia đặc biệt qua thấu kính hội tụ: tia **song song trục chính** → ló qua **tiêu điểm ảnh F′**; tia qua **quang tâm O** → truyền thẳng; tia qua **tiêu điểm vật F** → ló **song song trục chính**.',
    'Vật ngoài khoảng tiêu cự (d > f) cho **ảnh thật, ngược chiều** (hứng được trên màn); d > 2f ảnh nhỏ hơn vật, f < d < 2f ảnh lớn hơn vật. Vật trong khoảng tiêu cự (d < f) cho **ảnh ảo, cùng chiều, lớn hơn vật** (kính lúp).',
    'Bản gốc dùng công thức f = 5/(độ tụ·(n − 0,5)) không có cơ sở vật lí; phiên bản này tính tiêu cự từ công thức thấu kính mỏng với hai mặt cầu bán kính R.'
  ],
  observe: ['Kéo nến vào trong tiêu cự (d < f): ảnh ảo cùng chiều, lớn, nằm cùng phía với vật.', 'Đặt d = 2f: ảnh thật bằng vật tại 2f.', 'Tăng chiết suất n: tiêu cự giảm.'],
  exam: ['Tính d′, k từ d và f; vẽ ảnh bằng tia đặc biệt; xác định tính chất ảnh.'],
  quiz: {
    question: 'Thấu kính hội tụ có tiêu cự 15 cm, ngọn nến đặt cách thấu kính 30 cm (d = 2f). Ảnh của ngọn nến có đặc điểm gì?',
    options: ['Ảnh ảo, cùng chiều, lớn hơn vật', 'Ảnh thật, ngược chiều, nhỏ hơn vật', 'Không tạo được ảnh', 'Ảnh thật, ngược chiều, cao bằng vật'],
    answer: 3,
    explanation: 'Từ 1/f = 1/d + 1/d′ với d = 30 cm, f = 15 cm được d′ = 30 cm, k = −d′/d = −1: ảnh thật, ngược chiều, cao bằng vật, nằm ở 2f phía bên kia thấu kính.'
  },
  params: [
    { key: 'd', label: 'Khoảng cách vật d', min: 5, max: 60, step: 1, value: 30, unit: 'cm' },
    { key: 'n', label: 'Chiết suất n', min: 1.3, max: 1.9, step: 0.05, value: 1.5, decimals: 2 },
    { key: 'R', label: 'Bán kính mặt cầu R', min: 10, max: 40, step: 1, value: 15, unit: 'cm' },
    { key: 'hObj', label: 'Chiều cao nến', min: 2, max: 10, step: 1, value: 5, unit: 'cm' }
  ],
  create() {
    return {
      update() {},
      draw(g, w, h, p, t) {
        const f = p.R / (2 * (p.n - 1)); // 1/f = (n-1)(2/R)
        const d = p.d;
        const dp = Math.abs(d - f) < 1e-6 ? Infinity : 1 / (1 / f - 1 / d);
        const k = Number.isFinite(dp) ? -dp / d : Infinity;
        const sc = Math.min(w / 160, 6); // px per cm
        const ox = w * 0.5, oy = h / 2;
        // trục chính
        line(g, 20, oy, w - 20, oy, '#475569', 1.5);
        // thấu kính
        g.fillStyle = 'rgba(56,189,248,0.2)'; g.beginPath(); g.ellipse(ox, oy, 10, 110, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#38bdf8'; g.lineWidth = 2; g.stroke();
        arrow(g, ox, oy - 90, ox, oy - 118, '#38bdf8', 2, 8); arrow(g, ox, oy + 90, ox, oy + 118, '#38bdf8', 2, 8);
        text(g, 'O', ox + 8, oy + 16, { size: 11, color: COLORS.muted });
        // tiêu điểm
        for (const s of [-1, 1]) { circle(g, ox + s * f * sc, oy, 4, '#fbbf24'); text(g, s < 0 ? 'F' : "F′", ox + s * f * sc, oy + 20, { size: 11, align: 'center', color: '#fbbf24' }); circle(g, ox + s * 2 * f * sc, oy, 3, '#94a3b8'); text(g, '2F', ox + s * 2 * f * sc, oy + 20, { size: 10, align: 'center', color: COLORS.muted }); }
        // vật (nến)
        const vx = ox - d * sc, hObj = p.hObj * sc;
        g.fillStyle = '#fde68a'; g.fillRect(vx - 4, oy - hObj + 10, 8, hObj - 10);
        flame(g, vx, oy - hObj + 12, 0.5, '#fbbf24', t);
        text(g, 'vật', vx, oy + 20, { size: 11, align: 'center', color: COLORS.muted });
        // ảnh
        let ix = null, ih = 0;
        if (Number.isFinite(dp)) { ix = ox + dp * sc; ih = hObj * k; }
        const tip = { x: vx, y: oy - hObj };
        const real = Number.isFinite(dp) && dp > 0;
        // tia 1: song song → qua F′
        const r1 = [tip.x, tip.y, ox, tip.y];
        line(g, ...r1, '#f87171', 1.8);
        const dir1 = { x: ox + f * sc - ox, y: oy - tip.y }; // từ (ox, tip.y) về F′
        extendRay(g, ox, tip.y, dir1.x, dir1.y, w, '#f87171', real ? null : ix !== null ? [ix, oy - ih] : null);
        // tia 2: qua quang tâm
        extendRay(g, tip.x, tip.y, ox - tip.x, oy - tip.y, w, '#4ade80', real ? null : ix !== null ? [ix, oy - ih] : null);
        // tia 3: qua F → song song
        const dirF = { x: ox - tip.x, y: 0 };
        const slope = (oy - tip.y) / (ox - f * sc - tip.x);
        const yAtLens = tip.y + slope * (ox - tip.x);
        if (Math.abs(yAtLens - oy) < 115) { line(g, tip.x, tip.y, ox, yAtLens, '#a78bfa', 1.8); line(g, ox, yAtLens, w - 20, yAtLens, '#a78bfa', 1.8); if (!real && ix !== null) line(g, ox, yAtLens, ix, oy - ih, 'rgba(167,139,250,0.5)', 1.2, [5, 4]); }
        void dirF;
        if (ix !== null && Math.abs(ix) < w * 3) {
          const ihc = clamp(ih, -h / 2 + 10, h / 2 - 10);
          g.globalAlpha = real ? 1 : 0.55;
          g.fillStyle = real ? '#fdba74' : '#fde68a'; g.fillRect(ix - 4, Math.min(oy, oy - ihc), 8, Math.abs(ihc));
          g.globalAlpha = 1;
          label(g, real ? `ảnh thật, ${k < 0 ? 'ngược chiều' : ''}, d′ = ${dp.toFixed(1)} cm` : `ảnh ảo, cùng chiều, d′ = ${dp.toFixed(1)} cm`, clamp(ix, 60, w - 60), oy + (ih > 0 ? 40 : -ihc - 20), { size: 11 });
        } else label(g, 'd = f: ảnh ở vô cực', ox, oy - 140, { size: 11, color: COLORS.warn });
        text(g, `f = R/(2(n−1)) = ${f.toFixed(1)} cm`, 20, 30, { size: 12 });
        text(g, `1/d′ = 1/f − 1/d ⇒ d′ = ${Number.isFinite(dp) ? dp.toFixed(1) + ' cm' : '∞'}   k = −d′/d = ${Number.isFinite(k) ? k.toFixed(2) : '∞'}`, 20, 52, { size: 12, color: COLORS.muted });
        text(g, 'đỏ: tia song song → F′;  lục: tia qua O;  tím: tia qua F → song song', 20, h - 16, { size: 10.5, color: COLORS.muted });
      },
      metrics(p) { const f = p.R / (2 * (p.n - 1)); const dp = Math.abs(p.d - f) < 1e-6 ? Infinity : 1 / (1 / f - 1 / p.d); return [['Tiêu cự f', `${f.toFixed(1)} cm`], ["d′", Number.isFinite(dp) ? `${dp.toFixed(1)} cm` : '∞'], ['Số phóng đại k', Number.isFinite(dp) ? (-dp / p.d).toFixed(2) : '∞'], ['Tính chất', !Number.isFinite(dp) ? 'ảnh ở vô cực' : dp > 0 ? 'thật, ngược chiều' : 'ảo, cùng chiều'], ['Chiều cao ảnh', Number.isFinite(dp) ? `${Math.abs(p.hObj * dp / p.d).toFixed(1)} cm` : '—']]; }
    };
  }
};
function extendRay(g, x, y, dx, dy, w, color, virtualTarget) {
  const L = Math.hypot(dx, dy) || 1; const ux = dx / L, uy = dy / L;
  const len = (w - x) / Math.max(ux, 1e-6);
  line(g, x, y, x + ux * len, y + uy * len, color, 1.8);
  if (virtualTarget) line(g, x, y, virtualTarget[0], virtualTarget[1], color.replace(')', ',0.5)').replace('rgb', 'rgba').replace('#', '#'), 1.2, [5, 4]);
}
