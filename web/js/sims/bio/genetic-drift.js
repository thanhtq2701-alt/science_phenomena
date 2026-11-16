import { COLORS, text, label, circle, roundRect, plot, polyline } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'bio-genetic-drift',
  subject: 'bio',
  chapter: 'evolution',
  title: 'Phiêu bạt di truyền (trôi dạt gene) và hiệu ứng cổ chai',
  summary: 'Ở quần thể nhỏ, tần số allele thay đổi ngẫu nhiên qua mỗi thế hệ và có thể bị cố định hoặc mất hẳn dù không có chọn lọc. So sánh 5 quần thể cùng xuất phát.',
  equation: ['Phiêu bạt: biến động ngẫu nhiên của tần số allele, không có hướng', 'Phương sai thay đổi tần số mỗi thế hệ ≈ p·q / (2N) → N nhỏ: biến động lớn'],
  keywords: ['phiêu bạt di truyền', 'trôi dạt gene', 'yếu tố ngẫu nhiên', 'cổ chai', 'hiệu ứng sáng lập', 'quần thể nhỏ', 'cố định allele'],
  theory: [
    '**Phiêu bạt di truyền** (các yếu tố ngẫu nhiên) là sự biến đổi tần số allele do **sai số lấy mẫu** khi một số ít cá thể sinh sản tạo thế hệ sau. Nó **không có hướng**: allele có lợi vẫn có thể bị loại, allele có hại vẫn có thể được cố định.',
    'Tác động **mạnh ở quần thể nhỏ**, yếu ở quần thể lớn. Qua nhiều thế hệ, một allele sẽ **được cố định** (tần số 1) hoặc **biến mất** (tần số 0), làm **giảm đa dạng di truyền**.',
    '**Hiệu ứng cổ chai**: quần thể bị giảm mạnh kích thước (thiên tai, săn bắt) → vốn gene thay đổi ngẫu nhiên. **Hiệu ứng sáng lập**: nhóm nhỏ tách ra lập quần thể mới mang vốn gene không đại diện cho quần thể gốc.'
  ],
  observe: ['N = 10: các đường tần số dao động dữ dội, nhanh chóng chạm 0 hoặc 1.', 'N = 500: các đường gần như nằm ngang quanh 0,5.', 'Bấm "Cổ chai": kích thước giảm đột ngột vài thế hệ rồi hồi phục – xem tần số nhảy ngẫu nhiên.'],
  exam: ['Phân biệt phiêu bạt di truyền với chọn lọc tự nhiên; vì sao phiêu bạt là nhân tố tiến hóa.', 'Giải thích giảm đa dạng di truyền ở quần thể nhỏ, loài nguy cấp.'],
  params: [
    { key: 'N', label: 'Kích thước quần thể N', min: 10, max: 500, step: 10, value: 50 },
    { key: 'p0', label: 'Tần số allele A ban đầu', min: 0.1, max: 0.9, step: 0.05, value: 0.5, decimals: 2 },
    { key: 'speed', label: 'Thế hệ / giây', min: 0.5, max: 10, step: 0.5, value: 3, decimals: 1 }
  ],
  actions: [{ key: 'bottleneck', label: '🍾 Cổ chai (N → 8 trong 3 thế hệ)' }, { key: 'restart', label: '🔄 Chạy lại' }],
  create(ctx) {
    const K = 5;
    const st = { pops: [], gen: 0, timer: 0, bn: 0 };
    const init = (p) => { st.pops = []; for (let i = 0; i < K; i++) st.pops.push({ p: p.p0, hist: [p.p0] }); st.gen = 0; st.bn = 0; };
    init(ctx.params);
    const step = (p) => {
      const N = st.bn > 0 ? 8 : p.N;
      for (const q of st.pops) { if (q.p <= 0 || q.p >= 1) { q.hist.push(q.p); continue; } let cnt = 0; for (let i = 0; i < 2 * N; i++) if (Math.random() < q.p) cnt++; q.p = cnt / (2 * N); q.hist.push(q.p); if (q.hist.length > 300) q.hist.shift(); }
      st.gen++; if (st.bn > 0) st.bn--;
    };
    return {
      onParam(k, p) { if (k === 'p0') init(p); },
      action(key, p) { if (key === 'restart') init(p); if (key === 'bottleneck') st.bn = 3; },
      update(dt, p) { st.timer += dt * p.speed; while (st.timer >= 1) { st.timer -= 1; step(p); } },
      draw(g, w, h, p) {
        const cols = ['#f87171', '#fbbf24', '#4ade80', '#60a5fa', '#c084fc'];
        const px = 60, py = 60, pw = w - px - 260, ph = h - py - 70;
        const len = Math.max(50, st.pops[0].hist.length);
        const g0 = Math.max(0, st.gen - len + 1);
        const P = plot(g, px, py, Math.max(200, pw), ph, { xmin: g0, xmax: g0 + len - 1, ymin: 0, ymax: 1, xlabel: 'thế hệ', ylabel: 'tần số allele A', title: `5 quần thể cùng N = ${st.bn > 0 ? '8 (cổ chai!)' : p.N}, p0 = ${p.p0}` });
        polyline(g, [[P.X(g0), P.Y(p.p0)], [P.X(g0 + len - 1), P.Y(p.p0)]], 'rgba(148,163,184,0.35)', 1);
        st.pops.forEach((q, i) => { const off = st.gen - q.hist.length + 1; polyline(g, q.hist.map((v, k) => [P.X(off + k), P.Y(v)]), cols[i], 2); circle(g, P.X(st.gen), P.Y(q.p), 4, cols[i]); });
        // bảng phải
        const rx = w - 230;
        text(g, 'Trạng thái', rx, 80, { size: 13, weight: '700' });
        st.pops.forEach((q, i) => { const y = 108 + i * 26; circle(g, rx + 6, y - 4, 6, cols[i]); const s = q.p >= 1 ? 'A cố định' : q.p <= 0 ? 'A mất (a cố định)' : `p = ${q.p.toFixed(2)}`; text(g, `QT ${i + 1}: ${s}`, rx + 18, y, { size: 11.5, color: q.p >= 1 || q.p <= 0 ? '#fbbf24' : COLORS.text }); });
        const fixed = st.pops.filter((q) => q.p <= 0 || q.p >= 1).length;
        text(g, `Đã cố định/mất: ${fixed}/5`, rx, 250, { size: 12, color: COLORS.muted });
        text(g, `Thế hệ: ${st.gen}`, rx, 272, { size: 12, color: COLORS.muted });
        const sd = Math.sqrt(p.p0 * (1 - p.p0) / (2 * p.N));
        text(g, `Độ lệch chuẩn mỗi thế hệ`, rx, 310, { size: 11, color: COLORS.muted }); text(g, `√(pq/2N) ≈ ${sd.toFixed(3)}`, rx, 330, { size: 12, weight: '700' });
        ['N nhỏ → biến động lớn,', 'nhanh cố định hoặc mất allele.', 'N lớn → tần số gần như ổn định.'].forEach((s, i) => text(g, s, rx, 365 + i * 18, { size: 11, color: COLORS.muted }));
      },
      metrics(p) { return [['Thế hệ', st.gen], ['Quần thể đã cố định', `${st.pops.filter((q) => q.p <= 0 || q.p >= 1).length}/5`], ['Tần số trung bình', st.pops.reduce((a, q) => a + q.p, 0) / 5, 3], ['N hiệu dụng', st.bn > 0 ? 8 : p.N]]; }
    };
  }
};
