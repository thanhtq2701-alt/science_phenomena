import { COLORS, text, label, circle, line, roundRect, arrow } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

const STEPS = [
  { t: 'Tách DNA', d: 'Tách gene cần chuyển (gene insulin người) và plasmid của vi khuẩn E. coli.' },
  { t: 'Cắt bằng enzyme giới hạn', d: 'Cùng một enzyme cắt (restrictase, vd EcoRI) cắt gene và plasmid tạo đầu dính bổ sung …G | AATTC….' },
  { t: 'Nối bằng ligase', d: 'Đầu dính bắt cặp, enzyme nối (ligase) nối lại → DNA tái tổ hợp (plasmid mang gene insulin).' },
  { t: 'Chuyển vào tế bào nhận', d: 'Đưa plasmid tái tổ hợp vào E. coli (biến nạp bằng CaCl2 hoặc xung điện).' },
  { t: 'Chọn dòng & nhân lên', d: 'Nuôi trên môi trường có kháng sinh: chỉ tế bào nhận plasmid (mang gene kháng) sống. Vi khuẩn nhân nhanh và tổng hợp insulin.' }
];

export default {
  id: 'bio-recombinant-dna',
  subject: 'bio',
  chapter: 'molecular',
  title: 'Công nghệ gene: tạo DNA tái tổ hợp sản xuất insulin',
  summary: 'Từng bước cắt gene insulin người và plasmid bằng cùng một enzyme giới hạn, nối bằng ligase, biến nạp vào E. coli, chọn dòng bằng kháng sinh rồi để vi khuẩn sản xuất insulin.',
  equation: ['Gene cần chuyển + thể truyền (plasmid) →(restrictase, ligase) DNA tái tổ hợp', 'DNA tái tổ hợp → tế bào nhận → chọn dòng → sinh vật biến đổi gene'],
  keywords: ['công nghệ gene', 'DNA tái tổ hợp', 'plasmid', 'enzyme cắt giới hạn', 'ligase', 'E. coli', 'insulin', 'sinh vật biến đổi gene', 'GMO'],
  theory: [
    '**Công nghệ gene** là quy trình tạo ra tế bào hay sinh vật có gene bị biến đổi hoặc có thêm gene mới. Trung tâm là kĩ thuật tạo **DNA tái tổ hợp**: gene cần chuyển gắn vào **thể truyền** (plasmid, virus) để đưa vào tế bào nhận.',
    'Hai enzyme then chốt: **enzyme cắt giới hạn (restrictase)** nhận biết trình tự đặc hiệu và cắt tạo **đầu dính**; **ligase** nối các đoạn DNA. Thể truyền thường mang **gene đánh dấu** (kháng kháng sinh, phát sáng) để chọn lọc tế bào đã nhận DNA.',
    'Thành tựu: vi khuẩn sản xuất insulin, hormone sinh trưởng; cây trồng kháng sâu (bông Bt), lúa vàng (giàu β-carotene); động vật chuyển gene. Cần đánh giá an toàn sinh học và đạo đức.'
  ],
  observe: ['Bấm "Bước tiếp theo" để đi qua 5 bước.', 'Ở bước chọn dòng: khuẩn lạc không nhận plasmid chết trên môi trường kháng sinh.'],
  exam: ['Trình bày các bước tạo DNA tái tổ hợp và vai trò của restrictase, ligase, thể truyền, gene đánh dấu.', 'Nêu thành tựu và ứng dụng công nghệ gene.'],
  params: [{ key: 'auto', label: 'Tự chạy các bước', type: 'toggle', value: true }],
  actions: [{ key: 'next', label: '⏭ Bước tiếp theo' }],
  create() {
    const st = { step: 0, u: 0, cells: [] };
    for (let i = 0; i < 14; i++) st.cells.push({ x: Math.random(), y: Math.random(), has: Math.random() < 0.4 });
    return {
      action(key) { if (key === 'next') { st.step = (st.step + 1) % STEPS.length; st.u = 0; } },
      update(dt, p) { st.u = Math.min(1, st.u + dt * 0.4); if (p.auto && st.u >= 1) { st.timer = (st.timer || 0) + dt; if (st.timer > 1.5) { st.timer = 0; st.step = (st.step + 1) % STEPS.length; st.u = 0; } } },
      draw(g, w, h, p, t) {
        const s = st.step, u = st.u;
        const cx = w * 0.35, cy = h / 2 - 20;
        // plasmid
        const R = 70;
        const plasmidOpen = s >= 1;
        const gap = s === 1 ? 0.35 * u : s >= 2 ? 0.35 : 0;
        if (s <= 2) {
          g.strokeStyle = '#60a5fa'; g.lineWidth = 8; g.beginPath(); g.arc(cx - 40, cy, R, -Math.PI / 2 + gap, -Math.PI / 2 + TAU - gap); g.stroke();
          g.strokeStyle = '#a3e635'; g.lineWidth = 8; g.beginPath(); g.arc(cx - 40, cy, R, Math.PI * 0.6, Math.PI * 0.85); g.stroke(); text(g, 'gene kháng KS', cx - 40 + Math.cos(Math.PI * 0.72) * (R + 30), cy + Math.sin(Math.PI * 0.72) * (R + 30), { size: 9.5, align: 'center', color: '#a3e635' });
          text(g, 'plasmid', cx - 40, cy + 4, { size: 11, align: 'center', color: '#93c5fd' });
          // gene insulin
          const gx = s === 2 ? cx - 40 + (1 - u) * 160 : cx + 140, gy = s === 2 ? cy - R - (1 - u) * 0 : cy - R;
          g.fillStyle = '#f472b6'; roundRect(g, gx - 30, gy - 8, 60, 16, 4); g.fill(); text(g, 'insulin', gx, gy + 4, { size: 9.5, align: 'center', color: '#0b1020', weight: '800' });
          if (s >= 1) { text(g, 'AATT', gx - 40, gy - 10, { size: 8, color: '#fbbf24' }); text(g, 'TTAA', gx + 26, gy + 20, { size: 8, color: '#fbbf24' }); }
          if (s === 1) { text(g, '✂ EcoRI', cx + 60, cy - R - 30, { size: 12, color: '#fbbf24' }); }
          if (s === 2 && u > 0.9) label(g, 'ligase nối đầu dính → plasmid tái tổ hợp', cx - 40, cy + R + 30, { size: 11, color: '#4ade80' });
        } else if (s === 3) {
          // tế bào vi khuẩn nhận plasmid
          g.fillStyle = 'rgba(74,222,128,0.12)'; g.strokeStyle = '#4ade80'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, 150, 80, 0, 0, TAU); g.fill(); g.stroke();
          g.strokeStyle = 'rgba(148,163,184,0.6)'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; g.lineTo(cx - 40 + Math.cos(a) * 50 + Math.sin(a * 5) * 6, cy + Math.sin(a) * 30); } g.stroke(); text(g, 'NST vi khuẩn', cx - 40, cy + 50, { size: 9.5, align: 'center', color: COLORS.muted });
          const px = cx + 220 - u * 140; g.strokeStyle = '#60a5fa'; g.lineWidth = 4; g.beginPath(); g.arc(px, cy - 10, 22, 0, TAU); g.stroke(); g.strokeStyle = '#f472b6'; g.beginPath(); g.arc(px, cy - 10, 22, -0.6, 0.3); g.stroke();
          text(g, 'E. coli', cx, cy - 90, { size: 12, align: 'center', color: '#4ade80' });
        } else {
          // đĩa thạch kháng sinh
          g.fillStyle = 'rgba(253,224,71,0.12)'; g.strokeStyle = '#94a3b8'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 130, 0, TAU); g.fill(); g.stroke();
          for (const c of st.cells) { const x = cx + (c.x - 0.5) * 200, y = cy + (c.y - 0.5) * 200; if (Math.hypot(x - cx, y - cy) > 120) continue; const alive = c.has; circle(g, x, y, alive ? 6 + u * 8 : 6, alive ? '#4ade80' : `rgba(148,163,184,${1 - u})`); if (alive && u > 0.6) text(g, '💉', x + 10, y - 8, { size: 10 }); }
          text(g, 'môi trường có kháng sinh', cx, cy + 150, { size: 11, align: 'center', color: COLORS.muted });
          label(g, 'chỉ khuẩn lạc mang plasmid sống → nhân lên, tiết insulin', cx, cy - 150, { size: 11, color: '#4ade80' });
        }
        // timeline các bước
        const rx = Math.max(cx + 230, w * 0.62), rw = w - rx - 20;
        if (rw > 180) {
          STEPS.forEach((st2, i) => { const y = 60 + i * 64; const on = i === s; circle(g, rx + 12, y, 11, on ? '#4ade80' : i < s ? 'rgba(74,222,128,0.4)' : '#334155'); text(g, String(i + 1), rx + 12, y + 4, { size: 11, align: 'center', color: '#0b1020', weight: '800' }); text(g, st2.t, rx + 32, y + 4, { size: 12, weight: on ? '800' : '500', color: on ? COLORS.text : COLORS.muted }); if (on) wrap(g, st2.d, rx + 32, y + 24, rw - 36, 10.5, COLORS.muted); });
        }
      },
      metrics() { return [['Bước', `${st.step + 1}/5: ${STEPS[st.step].t}`]]; }
    };
  }
};
function wrap(g, str, x, y, maxW, size, color) { g.font = `500 ${size}px Inter, system-ui, sans-serif`; const words = str.split(' '); let line = '', yy = y; for (const wd of words) { const tt = line + wd + ' '; if (g.measureText(tt).width > maxW && line) { text(g, line, x, yy, { size, color }); line = wd + ' '; yy += size + 5; } else line = tt; } text(g, line, x, yy, { size, color }); }
