import { COLORS, text, label, circle, line, roundRect } from '../../core/draw.js';

/** Phả hệ 3 thế hệ cố định; kiểu gene sinh theo kiểu di truyền được chọn */
const FAMILY = [
  { id: 1, sex: 'M', gen: 0, x: 0.3 }, { id: 2, sex: 'F', gen: 0, x: 0.42 }, { id: 3, sex: 'M', gen: 0, x: 0.62 }, { id: 4, sex: 'F', gen: 0, x: 0.74 },
  { id: 5, sex: 'F', gen: 1, x: 0.22, p: [1, 2] }, { id: 6, sex: 'M', gen: 1, x: 0.36, p: [1, 2] }, { id: 7, sex: 'F', gen: 1, x: 0.48, p: [1, 2] }, { id: 8, sex: 'M', gen: 1, x: 0.64, p: [3, 4] }, { id: 9, sex: 'F', gen: 1, x: 0.78, p: [3, 4] },
  { id: 10, sex: 'M', gen: 2, x: 0.46, p: [7, 8] }, { id: 11, sex: 'F', gen: 2, x: 0.56, p: [7, 8] }, { id: 12, sex: 'M', gen: 2, x: 0.66, p: [7, 8] }
];
const MODES = {
  ar: { name: 'Gene lặn trên NST thường (bạch tạng)', tip: 'Bố mẹ bình thường sinh con bệnh → gene lặn. Có con gái bệnh mà bố bình thường → không liên kết X.' },
  ad: { name: 'Gene trội trên NST thường (tật ngón ngắn)', tip: 'Bệnh xuất hiện ở mọi thế hệ; mỗi người bệnh có ít nhất một bố/mẹ bệnh.' },
  xr: { name: 'Gene lặn trên X (máu khó đông)', tip: 'Chủ yếu nam bị bệnh; mẹ mang gene truyền cho con trai; bố không truyền cho con trai.' }
};
const PRESET = {
  ar: { 1: 'Aa', 2: 'Aa', 3: 'AA', 4: 'Aa', 5: 'aa', 6: 'AA', 7: 'Aa', 8: 'Aa', 9: 'AA', 10: 'aa', 11: 'Aa', 12: 'AA' },
  ad: { 1: 'Aa', 2: 'aa', 3: 'aa', 4: 'aa', 5: 'Aa', 6: 'aa', 7: 'Aa', 8: 'aa', 9: 'aa', 10: 'Aa', 11: 'aa', 12: 'Aa' },
  xr: { 1: 'XAY', 2: 'XAXa', 3: 'XAY', 4: 'XAXA', 5: 'XAXa', 6: 'XaY', 7: 'XAXa', 8: 'XAY', 9: 'XAXA', 10: 'XaY', 11: 'XAXA', 12: 'XAY' }
};
const sick = (mode, gt) => mode === 'ar' ? gt === 'aa' : mode === 'ad' ? gt.includes('A') : (gt === 'XaY' || gt === 'XaXa');
const carrier = (mode, gt) => (mode === 'ar' && gt === 'Aa') || (mode === 'xr' && gt === 'XAXa');

export default {
  id: 'bio-pedigree',
  subject: 'bio',
  chapter: 'mendel',
  title: 'Phân tích phả hệ và di truyền học người',
  summary: 'Đọc sơ đồ phả hệ 3 thế hệ cho bệnh bạch tạng (lặn NST thường), tật ngón ngắn (trội) và máu khó đông (lặn trên X). Bật "hiện kiểu gene" để kiểm tra suy luận và tính xác suất con cặp vợ chồng thế hệ II bị bệnh.',
  equation: ['Kí hiệu: □ nam, ○ nữ, tô đen: bị bệnh, chấm giữa: mang gene', 'Bố mẹ bình thường sinh con bệnh → bệnh do gene lặn', 'Gene lặn trên X: con trai bệnh nhận Xᵃ từ mẹ'],
  keywords: ['phả hệ', 'di truyền người', 'bạch tạng', 'máu khó đông', 'gene trội', 'gene lặn', 'tư vấn di truyền', 'xác suất'],
  theory: [
    'Ở người khó lai thí nghiệm, nên dùng **phương pháp phả hệ**: theo dõi sự di truyền một tính trạng qua nhiều thế hệ của một gia đình để xác định tính trạng **trội hay lặn**, do gene trên **NST thường hay NST giới tính**.',
    'Quy tắc nhanh: (1) bố mẹ bình thường sinh con bệnh ⇒ **lặn**; bố mẹ cùng bệnh sinh con bình thường ⇒ **trội**. (2) Nếu có **mẹ bệnh mà con trai bình thường**, hoặc **con gái bệnh mà bố bình thường** ⇒ gene lặn **không** nằm trên X.',
    'Ứng dụng: **tư vấn di truyền** – tính xác suất sinh con mắc bệnh để các cặp vợ chồng chủ động sàng lọc trước sinh.'
  ],
  observe: ['Đoán kiểu di truyền từ hình rồi bật "hiện kiểu gene" để kiểm tra.', 'Chú ý cặp vợ chồng 7 × 8 và xác suất con của họ.'],
  exam: ['Xác định quy luật di truyền và kiểu gene từ phả hệ; tính xác suất con bị bệnh/ không bệnh, theo giới.'],
  params: [
    { key: 'mode', label: 'Bệnh / kiểu di truyền', type: 'select', value: 'ar', options: Object.entries(MODES).map(([k, v]) => [k, v.name]) },
    { key: 'show', label: 'Hiện kiểu gene', type: 'toggle', value: false }
  ],
  create() {
    return {
      update() {},
      draw(g, w, h, p) {
        const gt = PRESET[p.mode];
        const W = w - 80, ys = [80, 200, 320];
        const pos = {}; for (const f of FAMILY) pos[f.id] = [40 + f.x * W, ys[f.gen]];
        // đường hôn nhân & con
        const couples = [[1, 2], [3, 4], [7, 8]];
        for (const [a, b] of couples) { line(g, pos[a][0], pos[a][1], pos[b][0], pos[b][1], '#94a3b8', 2); const mx = (pos[a][0] + pos[b][0]) / 2; const kids = FAMILY.filter((f) => f.p && f.p[0] === a); if (!kids.length) continue; const yk = pos[kids[0].id][1] - 40; line(g, mx, pos[a][1], mx, yk, '#94a3b8', 2); line(g, Math.min(...kids.map((k) => pos[k.id][0])), yk, Math.max(...kids.map((k) => pos[k.id][0])), yk, '#94a3b8', 2); for (const k of kids) line(g, pos[k.id][0], yk, pos[k.id][0], pos[k.id][1] - 16, '#94a3b8', 2); }
        for (const f of FAMILY) {
          const [x, y] = pos[f.id]; const s = sick(p.mode, gt[f.id]); const c = carrier(p.mode, gt[f.id]);
          g.fillStyle = s ? '#e2e8f0' : '#0b1020'; g.strokeStyle = '#e2e8f0'; g.lineWidth = 2;
          if (f.sex === 'M') { g.fillRect(x - 15, y - 15, 30, 30); g.strokeRect(x - 15, y - 15, 30, 30); } else { g.beginPath(); g.arc(x, y, 16, 0, Math.PI * 2); g.fill(); g.stroke(); }
          if (c && p.show) circle(g, x, y, 4, '#fbbf24');
          text(g, String(f.id), x, y + 32, { size: 10, align: 'center', color: COLORS.muted });
          if (p.show) text(g, gt[f.id].replace('XA', 'Xᴬ').replace('XA', 'Xᴬ').replace('Xa', 'Xᵃ').replace('Xa', 'Xᵃ'), x, y + 46, { size: 10.5, align: 'center', color: s ? '#f87171' : '#4ade80' });
        }
        ['I', 'II', 'III'].forEach((r, i) => text(g, r, 14, ys[i] + 5, { size: 13, weight: '800', color: COLORS.muted }));
        // xác suất cặp 7 × 8
        const m7 = gt[7], f8 = gt[8];
        let pr;
        if (p.mode === 'xr') pr = 'Con trai: 1/2 bệnh; con gái: 0 bệnh, 1/2 mang gene → P(con bệnh) = 1/4';
        else if (p.mode === 'ar') pr = 'Aa × Aa → 1/4 aa: P(con bệnh) = 1/4; P(con bình thường mang gene) = 1/2';
        else pr = 'Aa × aa → P(con bệnh) = 1/2';
        g.fillStyle = 'rgba(30,41,59,0.75)'; roundRect(g, 30, h - 92, w - 60, 78, 10); g.fill();
        text(g, MODES[p.mode].name, 46, h - 68, { size: 12.5, weight: '700' });
        text(g, `Dấu hiệu: ${MODES[p.mode].tip}`, 46, h - 46, { size: 11, color: COLORS.muted });
        text(g, `Cặp 7 × 8 (${p.show ? `${m7} × ${f8}` : 'bật hiện kiểu gene'}): ${pr}`, 46, h - 24, { size: 11, color: COLORS.warn });
        text(g, '□ nam  ○ nữ  ■● bệnh  · mang gene', w - 40, 30, { size: 10.5, align: 'right', color: COLORS.muted });
      },
      metrics(p) { const gt = PRESET[p.mode]; const n = FAMILY.filter((f) => sick(p.mode, gt[f.id])).length; return [['Số người bệnh', `${n}/12`], ['Nam bệnh', FAMILY.filter((f) => f.sex === 'M' && sick(p.mode, gt[f.id])).length], ['Nữ bệnh', FAMILY.filter((f) => f.sex === 'F' && sick(p.mode, gt[f.id])).length]]; }
    };
  }
};
