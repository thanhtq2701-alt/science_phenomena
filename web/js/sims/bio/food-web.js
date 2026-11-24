import { COLORS, text, label, circle, line, roundRect, arrow, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const WEB = {
  nodes: [
    { id: 'grass', name: 'Cỏ', icon: '🌾', level: 1 }, { id: 'tree', name: 'Cây', icon: '🌳', level: 1 },
    { id: 'grasshopper', name: 'Châu chấu', icon: '🦗', level: 2 }, { id: 'rabbit', name: 'Thỏ', icon: '🐇', level: 2 }, { id: 'mouse', name: 'Chuột', icon: '🐭', level: 2 },
    { id: 'frog', name: 'Ếch', icon: '🐸', level: 3 }, { id: 'snake', name: 'Rắn', icon: '🐍', level: 3 }, { id: 'fox', name: 'Cáo', icon: '🦊', level: 3 },
    { id: 'eagle', name: 'Đại bàng', icon: '🦅', level: 4 }
  ],
  links: [['grass', 'grasshopper'], ['grass', 'rabbit'], ['grass', 'mouse'], ['tree', 'mouse'], ['grasshopper', 'frog'], ['mouse', 'snake'], ['mouse', 'fox'], ['rabbit', 'fox'], ['frog', 'snake'], ['snake', 'eagle'], ['fox', 'eagle'], ['rabbit', 'eagle']]
};

export default {
  id: 'bio-food-web',
  subject: 'bio',
  chapter: 'ecology',
  title: 'Chuỗi, lưới thức ăn và tháp năng lượng',
  summary: 'Chọn một sinh vật để tô sáng các chuỗi thức ăn đi qua nó; xem năng lượng giảm khoảng 90% qua mỗi bậc dinh dưỡng (quy luật 10%) và tác động khi một loài biến mất.',
  equation: ['Hiệu suất sinh thái ≈ 10%: năng lượng bậc n+1 ≈ 10% năng lượng bậc n', 'Sinh vật sản xuất → SV tiêu thụ bậc 1 → bậc 2 → bậc 3 → SV phân giải'],
  keywords: ['chuỗi thức ăn', 'lưới thức ăn', 'bậc dinh dưỡng', 'tháp sinh thái', 'tháp năng lượng', 'hiệu suất sinh thái', 'sinh vật sản xuất', 'sinh vật tiêu thụ'],
  theory: [
    '**Chuỗi thức ăn** là dãy các loài có quan hệ dinh dưỡng, mỗi loài là một mắt xích vừa ăn mắt xích trước vừa bị mắt xích sau ăn. Nhiều chuỗi có mắt xích chung tạo thành **lưới thức ăn**. Lưới càng phức tạp, quần xã càng **ổn định**.',
    '**Bậc dinh dưỡng**: sinh vật sản xuất (bậc 1), tiêu thụ bậc 1 (ăn thực vật), tiêu thụ bậc 2, 3… Chỉ khoảng **10% năng lượng** được chuyển lên bậc kế tiếp, phần còn lại mất qua hô hấp, chất thải, nhiệt → **tháp năng lượng luôn có đáy rộng** và chuỗi thức ăn thường không quá 4–5 bậc.',
    'Loại bỏ một loài (đặc biệt loài chủ chốt) gây hiệu ứng dây chuyền: con mồi của nó tăng, vật ăn nó giảm hoặc chuyển sang mồi khác.'
  ],
  observe: ['Chọn "Chuột": thấy chuột là mắt xích chung của 3 chuỗi.', 'Bật "Loại bỏ loài": xem các loài phụ thuộc hoàn toàn vào nó mất nguồn thức ăn.', 'Đổi năng lượng bậc 1 để thấy tháp năng lượng co giãn.'],
  exam: ['Đếm số chuỗi thức ăn trong lưới; xác định bậc dinh dưỡng của một loài (có thể thuộc nhiều bậc).', 'Tính hiệu suất sinh thái, năng lượng ở mỗi bậc.'],
  quiz: {
    question: 'Sinh vật sản xuất tích lũy 10 000 kcal/m²/năm. Theo quy luật 10%, sinh vật tiêu thụ bậc 2 nhận được khoảng bao nhiêu?',
    options: ['100 kcal', '1 000 kcal', '5 000 kcal', '10 kcal'],
    answer: 0,
    explanation: 'Mỗi bậc chỉ nhận khoảng 10% năng lượng của bậc trước: sinh vật sản xuất 10 000 → tiêu thụ bậc 1 khoảng 1 000 → tiêu thụ bậc 2 khoảng 100 kcal/m²/năm.'
  },
  params: [
    { key: 'focus', label: 'Sinh vật đang xét', type: 'select', value: 'mouse', options: WEB.nodes.map((n) => [n.id, `${n.icon} ${n.name}`]) },
    { key: 'remove', label: 'Loại bỏ loài này khỏi lưới', type: 'toggle', value: false },
    { key: 'E1', label: 'Năng lượng bậc 1 (kcal/m²/năm)', min: 1000, max: 20000, step: 500, value: 10000 }
  ],
  create() {
    const st = { t: 0 };
    return {
      update(dt) { st.t += dt; },
      draw(g, w, h, p) {
        const nodes = WEB.nodes; const links = WEB.links.filter(([a, b]) => !(p.remove && (a === p.focus || b === p.focus)));
        const levels = [1, 2, 3, 4];
        const areaW = Math.min(w * 0.6, 560), x0 = 30;
        const pos = {};
        for (const lv of levels) { const ns = nodes.filter((n) => n.level === lv); ns.forEach((n, i) => { pos[n.id] = [x0 + (i + 1) * areaW / (ns.length + 1), h - 60 - (lv - 1) * (h - 130) / 3]; }); }
        // chuỗi đi qua focus
        const inChain = new Set();
        const up = (id) => { inChain.add(id); for (const [a, b] of links) if (a === id) up(b); };
        const down = (id) => { inChain.add(id); for (const [a, b] of links) if (b === id) down(a); };
        if (!p.remove) { up(p.focus); down(p.focus); }
        // loài mất nguồn thức ăn khi remove
        const starving = new Set();
        if (p.remove) for (const n of nodes) { if (n.level > 1 && n.id !== p.focus && !links.some(([, b]) => b === n.id)) starving.add(n.id); }
        for (const [a, b] of links) { const A = pos[a], B = pos[b]; const hi = inChain.has(a) && inChain.has(b) && !p.remove; arrow(g, A[0], A[1] - 18, B[0], B[1] + 22, hi ? '#fbbf24' : 'rgba(148,163,184,0.35)', hi ? 2.5 : 1.2, 8); }
        for (const n of nodes) { const [x, y] = pos[n.id]; const isF = n.id === p.focus; const gone = p.remove && isF; const st2 = starving.has(n.id); circle(g, x, y, 22, gone ? 'rgba(239,68,68,0.15)' : isF ? 'rgba(251,191,36,0.3)' : inChain.has(n.id) ? 'rgba(251,191,36,0.12)' : 'rgba(30,41,59,0.8)', isF ? '#fbbf24' : st2 ? '#f87171' : 'rgba(148,163,184,0.5)', isF ? 2.5 : 1.2); g.globalAlpha = gone ? 0.3 : 1; text(g, n.icon, x, y + 7, { size: 20, align: 'center' }); g.globalAlpha = 1; text(g, n.name + (st2 ? ' (mất thức ăn!)' : ''), x, y + 38, { size: 10, align: 'center', color: st2 ? '#f87171' : COLORS.muted }); if (gone) { line(g, x - 16, y - 16, x + 16, y + 16, '#ef4444', 3); line(g, x - 16, y + 16, x + 16, y - 16, '#ef4444', 3); } }
        levels.forEach((lv) => text(g, ['SV sản xuất', 'SV tiêu thụ bậc 1', 'SV tiêu thụ bậc 2', 'SV tiêu thụ bậc 3'][lv - 1], x0, h - 60 - (lv - 1) * (h - 130) / 3 - 30, { size: 9.5, color: COLORS.muted }));
        // đếm chuỗi
        const chains = []; const walk = (id, path) => { const outs = links.filter(([a]) => a === id); if (!outs.length) { chains.push(path); return; } for (const [, b] of outs) walk(b, [...path, b]); };
        for (const n of nodes.filter((n) => n.level === 1)) if (!(p.remove && n.id === p.focus)) walk(n.id, [n.id]);
        const focusChains = chains.filter((c) => c.includes(p.focus));
        // tháp năng lượng
        const rx = x0 + areaW + 40, rw = w - rx - 30;
        if (rw > 150) {
          text(g, 'Tháp năng lượng (quy luật 10%)', rx, 60, { size: 13, weight: '700' });
          const E = [p.E1, p.E1 * 0.1, p.E1 * 0.01, p.E1 * 0.001];
          for (let i = 0; i < 4; i++) { const y = 240 - i * 42; const ww = rw * Math.pow(0.6, i); const x = rx + (rw - ww) / 2; g.fillStyle = ['#4ade80', '#a3e635', '#fbbf24', '#f97316'][i]; g.globalAlpha = 0.85; roundRect(g, x, y, ww, 36, 4); g.fill(); g.globalAlpha = 1; text(g, `bậc ${i + 1}: ${E[i] >= 1 ? E[i].toLocaleString('vi-VN') : E[i].toFixed(1)} kcal`, rx + rw / 2, y + 23, { size: 10.5, align: 'center', color: '#0b1020', weight: '700' }); }
          text(g, 'mỗi bậc chỉ nhận ≈ 10% năng lượng bậc dưới', rx, 300, { size: 10.5, color: COLORS.muted });
          text(g, 'Chuỗi thức ăn trong lưới', rx, 340, { size: 13, weight: '700' });
          text(g, `Tổng: ${chains.length} chuỗi; qua ${nodes.find((n) => n.id === p.focus).name}: ${p.remove ? 0 : focusChains.length}`, rx, 362, { size: 11.5, color: COLORS.muted });
          focusChains.slice(0, 5).forEach((c, i) => text(g, c.map((id) => nodes.find((n) => n.id === id).icon).join(' → '), rx, 388 + i * 22, { size: 13 }));
          if (p.remove && starving.size) text(g, `Loài mất nguồn thức ăn: ${[...starving].map((id) => nodes.find((n) => n.id === id).name).join(', ')}`, rx, h - 20, { size: 11, color: '#f87171' });
        }
      },
      metrics(p) { const nodes = WEB.nodes; const links = WEB.links.filter(([a, b]) => !(p.remove && (a === p.focus || b === p.focus))); const chains = []; const walk = (id, path) => { const outs = links.filter(([a]) => a === id); if (!outs.length) { chains.push(path); return; } for (const [, b] of outs) walk(b, [...path, b]); }; for (const n of nodes.filter((n) => n.level === 1)) if (!(p.remove && n.id === p.focus)) walk(n.id, [n.id]); return [['Số chuỗi thức ăn', chains.length], ['Chuỗi qua loài đang xét', p.remove ? 0 : chains.filter((c) => c.includes(p.focus)).length], ['Năng lượng bậc 4', `${(p.E1 * 0.001).toFixed(1)} kcal`]]; }
    };
  }
};
