import { COLORS, text, label, circle, roundRect, plot, polyline } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const REL = {
  competition: { name: 'Cạnh tranh (thí nghiệm Gause với trùng cỏ)', a: 'P. aurelia', b: 'P. caudatum', sign: '(−, −)', ex: 'Hai loài trùng cỏ cùng ăn vi khuẩn: nuôi chung thì P. caudatum bị loại (loại trừ cạnh tranh).', ab: -0.6, ba: -1.6 },
  mutualism: { name: 'Cộng sinh (nấm + tảo → địa y)', a: 'Nấm', b: 'Tảo', sign: '(+, +)', ex: 'Hai loài cùng có lợi và bắt buộc: tảo quang hợp cung cấp chất hữu cơ, nấm cung cấp nước, khoáng.', ab: 0.6, ba: 0.6 },
  commensalism: { name: 'Hội sinh (cá ép bám cá mập)', a: 'Cá mập', b: 'Cá ép', sign: '(0, +)', ex: 'Cá ép có lợi (được di chuyển, ăn thức ăn thừa); cá mập không lợi không hại.', ab: 0, ba: 0.6 },
  parasitism: { name: 'Kí sinh (dây tơ hồng trên cây chủ)', a: 'Cây chủ', b: 'Tơ hồng', sign: '(−, +)', ex: 'Vật kí sinh sống nhờ, lấy chất dinh dưỡng của vật chủ, thường không giết chết ngay.', ab: -0.4, ba: 0.8 },
  amensalism: { name: 'Ức chế – cảm nhiễm (tảo giáp nở hoa)', a: 'Cá, tôm', b: 'Tảo giáp', sign: '(−, 0)', ex: 'Tảo giáp tiết độc tố làm chết cá, tôm; bản thân tảo không được lợi trực tiếp.', ab: -0.8, ba: 0 }
};

export default {
  id: 'bio-species-interactions',
  subject: 'bio',
  chapter: 'ecology',
  title: 'Quan hệ giữa các loài trong quần xã',
  summary: 'Nuôi riêng rồi nuôi chung hai loài để xem số lượng thay đổi thế nào: cạnh tranh loại trừ (Gause), cộng sinh, hội sinh, kí sinh, ức chế – cảm nhiễm. Mỗi quan hệ có một cặp dấu (+, −, 0) đặc trưng.',
  equation: ['dN1/dt = r1·N1·(K1 − N1 + α12·N2)/K1', 'dN2/dt = r2·N2·(K2 − N2 + α21·N1)/K2', 'α > 0: được lợi ; α < 0: bị hại ; α = 0: không ảnh hưởng'],
  keywords: ['quan hệ khác loài', 'cạnh tranh', 'cộng sinh', 'hội sinh', 'kí sinh', 'ức chế cảm nhiễm', 'Gause', 'loại trừ cạnh tranh', 'quần xã'],
  theory: [
    '**Quan hệ hỗ trợ** (không loài nào bị hại): **cộng sinh** (+, +, bắt buộc), **hợp tác** (+, +, không bắt buộc), **hội sinh** (0, +).',
    '**Quan hệ đối kháng** (ít nhất một loài bị hại): **cạnh tranh** (−, −) khi dùng chung nguồn sống – thí nghiệm của Gause cho thấy hai loài có ổ sinh thái trùng nhau không thể cùng tồn tại lâu dài (**nguyên lí loại trừ cạnh tranh**); **kí sinh** (−, +); **ức chế – cảm nhiễm** (−, 0); **sinh vật này ăn sinh vật khác** (−, +).',
    'Các mối quan hệ giúp **khống chế sinh học**, duy trì cân bằng quần xã; cạnh tranh thúc đẩy **phân li ổ sinh thái**.'
  ],
  observe: ['Chọn "Cạnh tranh" và "Nuôi chung": loài 2 giảm dần về 0.', 'Chuyển "Nuôi riêng": cả hai loài đều đạt sức chứa K.', 'Cộng sinh: nuôi chung cả hai đều vượt mức khi nuôi riêng.'],
  exam: ['Phân biệt các mối quan hệ theo dấu (+, −, 0) và cho ví dụ.', 'Đọc đồ thị thí nghiệm Gause, giải thích nguyên lí loại trừ cạnh tranh.'],
  params: [
    { key: 'rel', label: 'Mối quan hệ', type: 'select', value: 'competition', options: Object.entries(REL).map(([k, v]) => [k, v.name]) },
    { key: 'together', label: 'Nuôi chung hai loài', type: 'toggle', value: true }
  ],
  create() {
    const st = { N1: 5, N2: 5, t: 0, hist: [] };
    return {
      onParam() { st.N1 = 5; st.N2 = 5; st.t = 0; st.hist = []; },
      update(dt, p) {
        const R = REL[p.rel]; const K = 100, r = 0.5; const h = dt * 2;
        const a12 = p.together ? R.ab : 0, a21 = p.together ? R.ba : 0;
        const d1 = r * st.N1 * (K - st.N1 + a12 * st.N2) / K, d2 = r * st.N2 * (K - st.N2 + a21 * st.N1) / K;
        st.N1 = clamp(st.N1 + d1 * h, 0, 300); st.N2 = clamp(st.N2 + d2 * h, 0, 300); st.t += h;
        if (st.N1 < 0.5) st.N1 = 0; if (st.N2 < 0.5) st.N2 = 0;
        if (!st.hist.length || st.t - st.hist[st.hist.length - 1][0] > 0.2) { st.hist.push([st.t, st.N1, st.N2]); if (st.hist.length > 300) st.hist.shift(); }
      },
      draw(g, w, h, p) {
        const R = REL[p.rel];
        const bx = 30, by = 60, bw = Math.min(260, w * 0.32), bh = 200;
        const tubes = p.together ? [[bx, 'chung']] : [[bx, R.a], [bx + bw / 2 + 10, R.b]];
        tubes.forEach(([x, nm], i) => {
          const tw = p.together ? bw : bw / 2 - 10;
          g.fillStyle = 'rgba(96,165,250,0.12)'; roundRect(g, x, by, tw, bh, 10); g.fill(); g.strokeStyle = COLORS.glass; g.lineWidth = 2; g.stroke();
          const n1 = p.together || i === 0 ? Math.round(st.N1 / 4) : 0, n2 = p.together || i === 1 ? Math.round(st.N2 / 4) : 0;
          for (let k = 0; k < n1; k++) circle(g, x + 10 + ((k * 37) % (tw - 20)), by + 14 + ((k * 53) % (bh - 28)), 4, '#f87171');
          for (let k = 0; k < n2; k++) circle(g, x + 14 + ((k * 41 + 9) % (tw - 26)), by + 18 + ((k * 29 + 13) % (bh - 32)), 4, '#4ade80');
          text(g, p.together ? 'nuôi chung' : `nuôi riêng: ${nm}`, x + tw / 2, by + bh + 18, { size: 10.5, align: 'center', color: COLORS.muted });
        });
        circle(g, bx + 6, by + bh + 42, 5, '#f87171'); text(g, R.a, bx + 16, by + bh + 46, { size: 11 }); circle(g, bx + 126, by + bh + 42, 5, '#4ade80'); text(g, R.b, bx + 136, by + bh + 46, { size: 11 });
        label(g, `Kí hiệu quan hệ: ${R.sign}`, bx + bw / 2, 30, { size: 12, color: '#fbbf24' });
        wrap(g, R.ex, bx, by + bh + 74, bw, 11, COLORS.muted);
        const px = bx + bw + 60, pw = w - px - 30, ph = h - 120;
        if (pw > 160) {
          const t0 = st.hist.length ? st.hist[0][0] : 0;
          const P = plot(g, px, 50, pw, ph, { xmin: t0, xmax: Math.max(t0 + 30, st.t), ymin: 0, ymax: 200, xlabel: 'thời gian (ngày)', ylabel: 'số lượng', title: 'Biến động số lượng hai loài' });
          polyline(g, [[P.X(t0), P.Y(100)], [P.X(Math.max(t0 + 30, st.t)), P.Y(100)]], 'rgba(148,163,184,0.35)', 1); text(g, 'K khi nuôi riêng', P.X(t0) + 6, P.Y(100) - 6, { size: 9.5, color: COLORS.muted });
          polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(r[1])]), '#f87171', 2.5); polyline(g, st.hist.map((r) => [P.X(r[0]), P.Y(r[2])]), '#4ade80', 2.5);
          if (p.rel === 'competition' && p.together && st.N2 === 0) label(g, `${R.b} bị loại trừ hoàn toàn`, px + pw / 2, 80, { size: 11.5, color: COLORS.danger });
        }
      },
      metrics(p) { const R = REL[p.rel]; return [[R.a, Math.round(st.N1)], [R.b, Math.round(st.N2)], ['Dấu quan hệ', R.sign]]; }
    };
  }
};
function wrap(g, str, x, y, maxW, size, color) { g.font = `500 ${size}px Inter, system-ui, sans-serif`; const words = str.split(' '); let line = '', yy = y; for (const wd of words) { const tt = line + wd + ' '; if (g.measureText(tt).width > maxW && line) { text(g, line, x, yy, { size, color }); line = wd + ' '; yy += size + 5; } else line = tt; } text(g, line, x, yy, { size, color }); }
