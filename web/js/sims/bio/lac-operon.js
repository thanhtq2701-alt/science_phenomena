import { COLORS, text, label, circle, line, roundRect, arrow, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'bio-lac-operon',
  subject: 'bio',
  chapter: 'molecular',
  title: 'Điều hòa hoạt động gene: operon Lac ở E. coli',
  summary: 'Không có lactose: protein ức chế bám vào vùng vận hành O, chặn RNA polymerase. Có lactose: lactose bám vào protein ức chế làm nó rời O, các gene Z, Y, A được phiên mã, enzyme phân giải lactose được tạo ra.',
  equation: ['Operon Lac = P (khởi động) + O (vận hành) + Z, Y, A (gene cấu trúc)', 'Gene điều hòa R (nằm ngoài operon) → protein ức chế', 'Lactose + protein ức chế → phức bất hoạt → O tự do → phiên mã'],
  keywords: ['operon Lac', 'điều hòa gene', 'protein ức chế', 'vùng vận hành', 'vùng khởi động', 'lactose', 'E. coli', 'Jacob Monod'],
  theory: [
    'Vi khuẩn chỉ tốn năng lượng tạo enzyme phân giải lactose **khi môi trường có lactose**. Mô hình **operon Lac** (Jacob & Monod, 1961) giải thích cơ chế này ở mức phiên mã.',
    '**Khi không có lactose**: gene điều hòa R tổng hợp **protein ức chế**, protein này bám vào **vùng vận hành O**, ngăn RNA polymerase trượt từ P sang các gene Z, Y, A → operon **đóng**.',
    '**Khi có lactose**: lactose (chất cảm ứng) **gắn vào protein ức chế**, làm biến đổi cấu hình nên nó **không bám được O** nữa. RNA polymerase phiên mã Z, Y, A → mRNA → enzyme β-galactosidase, permease, transacetylase phân giải lactose. Khi lactose hết, protein ức chế lại bám O, operon đóng.'
  ],
  observe: ['Bật/tắt lactose và quan sát protein ức chế rời/bám vào O.', 'Khi có lactose, enzyme tăng, lactose bị phân giải dần → operon tự tắt lại.', 'Thử đột biến gene R (protein ức chế mất chức năng): operon luôn mở.'],
  exam: ['Nêu cấu trúc operon Lac và vai trò từng thành phần; phân biệt gene điều hòa với operon.', 'Dự đoán hoạt động operon khi đột biến ở R, O, P.'],
  params: [
    { key: 'lactose', label: 'Lactose trong môi trường', min: 0, max: 100, step: 5, value: 60, unit: '%' },
    { key: 'mutR', label: 'Đột biến gene R (ức chế mất chức năng)', type: 'toggle', value: false },
    { key: 'consume', label: 'Enzyme phân giải lactose', type: 'toggle', value: true }
  ],
  create(ctx) {
    const st = { lac: ctx.params.lactose, open: 0, enzyme: 0, polX: 0, mrna: [], repPos: 1 };
    return {
      onParam(k, p) { if (k === 'lactose') st.lac = p.lactose; },
      update(dt, p) {
        const induced = p.mutR || st.lac > 8;
        st.open += ((induced ? 1 : 0) - st.open) * (1 - Math.exp(-dt * 2));
        st.repPos += ((induced ? 0 : 1) - st.repPos) * (1 - Math.exp(-dt * 3));
        if (st.open > 0.8) { st.polX += dt * 0.6; if (st.polX > 1) { st.polX = 0; st.mrna.push({ x: 0, life: 6 }); st.enzyme = clamp(st.enzyme + 12, 0, 100); } } else st.polX = 0;
        for (const m of st.mrna) { m.life -= dt; m.x += dt * 20; }
        st.mrna = st.mrna.filter((m) => m.life > 0);
        st.enzyme = clamp(st.enzyme - dt * 3, 0, 100);
        if (p.consume) st.lac = clamp(st.lac - dt * st.enzyme * 0.08, 0, 100);
      },
      draw(g, w, h, p, t) {
        const x0 = 40, y = 200, unit = Math.min(90, (w - 80) / 8);
        // DNA
        line(g, x0, y, x0 + unit * 7.6, y, '#94a3b8', 6);
        const boxes = [['R', 0, 1, '#a78bfa', 'gene điều hòa'], ['P', 1.6, 0.8, '#4ade80', 'khởi động'], ['O', 2.4, 0.8, '#fbbf24', 'vận hành'], ['Z', 3.2, 1.4, '#38bdf8', 'lacZ'], ['Y', 4.6, 1.4, '#38bdf8', 'lacY'], ['A', 6, 1.4, '#38bdf8', 'lacA']];
        for (const [n, s, l, c, lbl] of boxes) { g.fillStyle = c; roundRect(g, x0 + s * unit, y - 14, l * unit - 4, 28, 5); g.fill(); text(g, n, x0 + s * unit + (l * unit - 4) / 2, y + 5, { size: 13, align: 'center', color: '#0b1020', weight: '800' }); text(g, lbl, x0 + s * unit + (l * unit - 4) / 2, y + 44, { size: 9.5, align: 'center', color: COLORS.muted }); }
        g.strokeStyle = COLORS.grid; g.lineWidth = 1; g.strokeRect(x0 + 1.55 * unit, y - 30, 5.9 * unit, 90); text(g, 'OPERON Lac', x0 + 4.5 * unit, y - 36, { size: 10.5, align: 'center', color: COLORS.muted });
        // protein ức chế (từ R)
        const repX = x0 + 2.8 * unit - 2, repY = y - 20 - (1 - st.repPos) * 90;
        const bound = st.repPos > 0.9;
        g.fillStyle = p.mutR ? '#64748b' : '#f472b6'; g.beginPath(); g.moveTo(repX - 22, repY - 26); g.lineTo(repX + 22, repY - 26); g.lineTo(repX + 16, repY); g.lineTo(repX - 16, repY); g.closePath(); g.fill();
        text(g, p.mutR ? 'ức chế (hỏng)' : 'protein ức chế', repX, repY - 32, { size: 9.5, align: 'center', color: p.mutR ? COLORS.muted : '#f9a8d4' });
        // lactose
        const nLac = Math.round(st.lac / 10);
        for (let i = 0; i < nLac; i++) { const lx = x0 + 1.2 * unit + ((i * 83) % (5.5 * unit)), ly = 70 + ((i * 47) % 50) + Math.sin(t * 2 + i) * 4; circle(g, lx, ly, 6, '#fde68a'); circle(g, lx + 8, ly, 6, '#fde68a'); }
        if (nLac > 0 && !bound && !p.mutR) { circle(g, repX - 6, repY - 14, 5, '#fde68a'); circle(g, repX + 4, repY - 14, 5, '#fde68a'); }
        text(g, `lactose: ${st.lac.toFixed(0)}%`, x0 + 1.2 * unit, 58, { size: 11, color: '#fde68a' });
        // RNA polymerase
        if (st.open > 0.5) { const px = x0 + 1.9 * unit + st.polX * 5.5 * unit; circle(g, px, y - 24, 20, 'rgba(251,191,36,0.9)'); text(g, 'RNA pol', px, y - 20, { size: 8.5, align: 'center', color: '#0b1020', weight: '800' }); }
        else { circle(g, x0 + 1.9 * unit, y - 24, 20, 'rgba(251,191,36,0.5)'); text(g, 'RNA pol', x0 + 1.9 * unit, y - 20, { size: 8.5, align: 'center', color: '#0b1020', weight: '800' }); line(g, x0 + 2.25 * unit, y - 40, x0 + 2.25 * unit, y - 8, '#f87171', 3); text(g, 'bị chặn', x0 + 2.25 * unit, y - 46, { size: 9, align: 'center', color: '#f87171' }); }
        // mRNA & enzyme
        st.mrna.forEach((m) => { const mx = x0 + 3.5 * unit + m.x, my = y + 80 + (6 - m.life) * 8; line(g, mx, my, mx + 70, my, '#c084fc', 3); text(g, 'mRNA Z-Y-A', mx + 35, my - 6, { size: 9, align: 'center', color: '#c084fc' }); });
        bar(g, x0, h - 60, Math.min(360, w - 80), 12, st.enzyme / 100, '#38bdf8', `Enzyme phân giải lactose: ${st.enzyme.toFixed(0)}%`);
        label(g, st.open > 0.5 ? 'OPERON MỞ – đang phiên mã' : 'OPERON ĐÓNG – protein ức chế bám O', x0 + 4.5 * unit, y + 120, { size: 12, color: st.open > 0.5 ? '#4ade80' : '#f87171' });
        if (w > 720) { const rx = w - 300; text(g, 'Logic:', rx, h - 120, { size: 12, weight: '700' }); [p.mutR ? 'R đột biến → không có ức chế → luôn mở' : st.lac > 8 ? 'lactose gắn ức chế → rời O → mở' : 'không lactose → ức chế bám O → đóng', p.consume ? 'enzyme tiêu thụ lactose → sẽ tự đóng' : 'không tiêu thụ lactose'].forEach((s, i) => text(g, s, rx, h - 98 + i * 20, { size: 11, color: COLORS.muted })); }
      },
      metrics(p) { return [['Lactose', `${st.lac.toFixed(0)} %`], ['Operon', st.open > 0.5 ? 'mở' : 'đóng'], ['Enzyme', `${st.enzyme.toFixed(0)} %`], ['Protein ức chế', p.mutR ? 'mất chức năng' : st.repPos > 0.9 ? 'bám O' : 'rời O (gắn lactose)']]; }
    };
  }
};
