import { COLORS, text, label, circle, roundRect, plot, polyline, bar } from '../../core/draw.js';
import { clamp, gauss } from '../../core/engine.js';

export default {
  id: 'bio-speciation',
  subject: 'bio',
  chapter: 'evolution',
  title: 'Hình thành loài khác khu vực địa lí (cách li địa lí)',
  summary: 'Một quần thể bị chia đôi bởi sông/núi. Hai bên có môi trường khác nhau nên chọn lọc tự nhiên, đột biến và phiêu bạt làm vốn gene phân hóa dần; khi đủ khác biệt, chúng cách li sinh sản và trở thành hai loài.',
  equation: ['Cách li địa lí → ngăn trao đổi gene → phân hóa vốn gene (CLTN, đột biến, phiêu bạt)', '→ cách li sinh sản → loài mới', 'Tiêu chuẩn loài sinh học: cách li sinh sản với loài khác'],
  keywords: ['hình thành loài', 'cách li địa lí', 'cách li sinh sản', 'loài sinh học', 'vốn gene', 'phân hóa', 'tiến hóa nhỏ', 'quần đảo Galápagos'],
  theory: [
    '**Loài sinh học** là nhóm cá thể có thể giao phối với nhau sinh con hữu thụ và **cách li sinh sản** với nhóm khác. Cách li sinh sản gồm **trước hợp tử** (nơi ở, tập tính, mùa vụ, cơ học) và **sau hợp tử** (con lai chết, bất thụ – con la).',
    '**Hình thành loài khác khu vực địa lí**: chướng ngại địa lí (sông, núi, biển) chia cắt quần thể, **ngăn cản trao đổi gene**. Mỗi quần thể chịu chọn lọc theo điều kiện riêng, tích lũy đột biến và biến động ngẫu nhiên khác nhau → vốn gene phân hóa. Khi sai khác đủ lớn, cách li sinh sản hình thành và **loài mới** xuất hiện.',
    'Cách li địa lí **không trực tiếp** tạo ra kiểu hình mới mà chỉ **duy trì sự khác biệt** về vốn gene. Quá trình thường kéo dài rất lâu, hay gặp ở động vật có khả năng phát tán mạnh và trên các quần đảo.'
  ],
  observe: ['Bật "có chướng ngại": hai nửa phân hóa dần màu và kích thước mỏ.', 'Tắt chướng ngại (dòng gene): hai nửa luôn trộn lẫn, không phân hóa.', 'Theo dõi chỉ số cách li sinh sản tăng dần.'],
  exam: ['Trình bày cơ chế hình thành loài khác khu vực địa lí; vai trò của cách li địa lí.', 'Phân biệt các dạng cách li trước và sau hợp tử.'],
  params: [
    { key: 'barrier', label: 'Có chướng ngại địa lí', type: 'toggle', value: true },
    { key: 'diff', label: 'Khác biệt môi trường hai bên', min: 0, max: 1, step: 0.1, value: 0.7, decimals: 1 },
    { key: 'speed', label: 'Thế hệ / giây', min: 1, max: 20, step: 1, value: 8 }
  ],
  create() {
    const N = 80;
    const st = { pop: [], gen: 0, timer: 0, hist: [] };
    for (let i = 0; i < N; i++) st.pop.push({ side: i < N / 2 ? 0 : 1, beak: 0.5 + gauss() * 0.05, x: Math.random(), y: Math.random() });
    const mean = (s) => { const a = st.pop.filter((q) => q.side === s); return a.reduce((t, q) => t + q.beak, 0) / Math.max(1, a.length); };
    return {
      update(dt, p) {
        st.timer += dt * p.speed;
        while (st.timer >= 1) {
          st.timer -= 1; st.gen++;
          const opt = [0.5 - p.diff * 0.35, 0.5 + p.diff * 0.35];
          const next = [];
          for (let s = 0; s < 2; s++) {
            const pool = p.barrier ? st.pop.filter((q) => q.side === s) : st.pop;
            const fit = pool.map((q) => Math.exp(-Math.pow(q.beak - opt[s], 2) / 0.02));
            const tot = fit.reduce((a, b) => a + b, 0);
            for (let i = 0; i < N / 2; i++) {
              const pick = () => { let r = Math.random() * tot; for (let k = 0; k < pool.length; k++) { r -= fit[k]; if (r <= 0) return pool[k]; } return pool[pool.length - 1]; };
              const a = pick(), b = pick();
              next.push({ side: s, beak: clamp((a.beak + b.beak) / 2 + gauss() * 0.02, 0, 1), x: Math.random(), y: Math.random() });
            }
          }
          st.pop = next;
          st.hist.push([st.gen, mean(0), mean(1)]); if (st.hist.length > 300) st.hist.shift();
        }
      },
      draw(g, w, h, p) {
        const bx = 30, by = 50, bw = Math.min(w * 0.5, 440), bh = 240;
        g.fillStyle = 'rgba(132,204,22,0.15)'; roundRect(g, bx, by, bw / 2, bh, 10); g.fill();
        g.fillStyle = `rgba(234,179,8,${0.08 + p.diff * 0.2})`; roundRect(g, bx + bw / 2, by, bw / 2, bh, 10); g.fill();
        if (p.barrier) { g.fillStyle = '#1d4ed8'; g.fillRect(bx + bw / 2 - 8, by, 16, bh); text(g, 'sông', bx + bw / 2, by + bh + 16, { size: 10, align: 'center', color: '#60a5fa' }); }
        text(g, 'rừng ẩm: hạt nhỏ', bx + bw / 4, by - 8, { size: 10.5, align: 'center', color: COLORS.muted }); text(g, 'đồi khô: hạt to, cứng', bx + 3 * bw / 4, by - 8, { size: 10.5, align: 'center', color: COLORS.muted });
        for (const q of st.pop) { const x = bx + (q.side ? bw / 2 + 14 : 6) + q.x * (bw / 2 - 20), y = by + 10 + q.y * (bh - 20); const col = `hsl(${Math.round(120 - q.beak * 120)},70%,55%)`; circle(g, x, y, 5, col); g.fillStyle = '#f8fafc'; g.beginPath(); g.moveTo(x + 4, y - 2); g.lineTo(x + 6 + q.beak * 10, y); g.lineTo(x + 4, y + 2); g.closePath(); g.fill(); }
        const m0 = st.hist.length ? st.hist[st.hist.length - 1][1] : 0.5, m1 = st.hist.length ? st.hist[st.hist.length - 1][2] : 0.5;
        const iso = clamp(Math.abs(m1 - m0) / 0.4, 0, 1);
        bar(g, bx, by + bh + 40, bw, 10, iso, iso > 0.9 ? '#4ade80' : '#fbbf24', `Mức cách li sinh sản (theo độ sai khác): ${Math.round(iso * 100)}%`);
        label(g, iso > 0.9 ? 'ĐÃ HÌNH THÀNH HAI LOÀI' : p.barrier ? 'đang phân hóa…' : 'dòng gene trộn lẫn – không phân hóa', bx + bw / 2, by + bh + 74, { size: 11.5, color: iso > 0.9 ? '#4ade80' : COLORS.muted });
        const px = bx + bw + 60, pw = w - px - 30, ph = h - 120;
        if (pw > 150) {
          const g0 = st.hist.length ? st.hist[0][0] : 0;
          const P = plot(g, px, 60, pw, ph, { xmin: g0, xmax: Math.max(g0 + 50, st.gen), ymin: 0, ymax: 1, xlabel: 'thế hệ', ylabel: 'kích thước mỏ TB', title: 'Phân hóa tính trạng hai quần thể' });
          polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(r[1])]), '#84cc16', 2.5); polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(r[2])]), '#eab308', 2.5);
          text(g, `Thế hệ ${st.gen}`, px, h - 20, { size: 11, color: COLORS.muted });
        }
      },
      metrics() { const last = st.hist[st.hist.length - 1] || [0, 0.5, 0.5]; return [['Thế hệ', st.gen], ['Mỏ TB bên trái', last[1], 2], ['Mỏ TB bên phải', last[2], 2], ['Sai khác', Math.abs(last[2] - last[1]), 2]]; }
    };
  }
};
