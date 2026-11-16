import { COLORS, text, label, circle, roundRect, line } from '../../core/draw.js';
import { clamp, TAU, gauss } from '../../core/engine.js';

export default {
  id: 'physics-kinetic-model',
  subject: 'physics',
  chapter: 'thermal',
  title: 'Mô hình động học phân tử: rắn – lỏng – khí',
  summary: 'Phân tử chất rắn dao động quanh vị trí cân bằng, chất lỏng trượt lên nhau, chất khí chuyển động hỗn loạn. Tăng nhiệt độ để thấy dao động mạnh hơn và chuyển thể.',
  equation: ['Động năng trung bình phân tử: W̄đ = (3/2)·k·T', 'Lực tương tác: rất mạnh (rắn) → yếu hơn (lỏng) → không đáng kể (khí)'],
  keywords: ['cấu trúc chất', 'thuyết động học phân tử', 'rắn lỏng khí', 'chuyển thể', 'nhiệt độ'],
  theory: [
    'Theo **thuyết động học phân tử**: chất được cấu tạo từ các phân tử chuyển động **không ngừng, hỗn loạn**; nhiệt độ càng cao chuyển động càng nhanh; giữa các phân tử có **lực hút và lực đẩy**.',
    '**Chất rắn**: phân tử rất gần nhau, lực tương tác mạnh, chỉ **dao động quanh vị trí cân bằng** cố định → có hình dạng, thể tích xác định. **Chất lỏng**: dao động quanh vị trí cân bằng nhưng vị trí này **di chuyển được** → có thể tích xác định, hình dạng theo bình chứa. **Chất khí**: phân tử rất xa nhau, chuyển động tự do → chiếm toàn bộ bình.',
    'Khi tăng nhiệt độ, động năng tăng, lực liên kết không giữ nổi → **chuyển thể** (nóng chảy, hóa hơi).'
  ],
  observe: ['Kéo nhiệt độ từ thấp lên cao ở chế độ "tự động theo nhiệt độ" để thấy mạng tinh thể vỡ ra rồi thành khí.', 'So sánh tốc độ phân tử trung bình giữa ba thể ở cùng nhiệt độ.'],
  exam: ['Nêu đặc điểm cấu trúc và chuyển động phân tử của ba thể; giải thích các tính chất vĩ mô.'],
  params: [
    { key: 'temp', label: 'Nhiệt độ', min: 50, max: 900, step: 10, value: 300, unit: 'K' },
    { key: 'state', label: 'Thể', type: 'select', value: 'auto', options: [['auto', 'Tự động theo nhiệt độ'], ['solid', 'Rắn'], ['liquid', 'Lỏng'], ['gas', 'Khí']] }
  ],
  create() {
    const N = 64;
    const st = { p: [], state: 'solid' };
    const cols = 8;
    for (let i = 0; i < N; i++) st.p.push({ hx: (i % cols) / cols, hy: Math.floor(i / cols) / cols, x: 0, y: 0, vx: 0, vy: 0, ph: Math.random() * TAU });
    return {
      update(dt, p, t) {
        const T = p.temp;
        st.state = p.state === 'auto' ? (T < 273 ? 'solid' : T < 500 ? 'liquid' : 'gas') : p.state;
        const amp = Math.sqrt(T / 300);
        for (const q of st.p) {
          if (st.state === 'solid') {
            // dao động quanh nút mạng
            q.x = q.hx + Math.sin(t * 9 + q.ph) * 0.012 * amp; q.y = q.hy + Math.cos(t * 7.3 + q.ph * 1.7) * 0.012 * amp;
          } else if (st.state === 'liquid') {
            // vị trí cân bằng trôi chậm + dao động
            q.hx += (Math.random() - .5) * 0.02 * amp * dt * 8; q.hy += (Math.random() - .5) * 0.02 * amp * dt * 8;
            q.hx = clamp(q.hx, 0, 0.95); q.hy = clamp(q.hy, 0.35, 0.95);
            q.x = q.hx + Math.sin(t * 8 + q.ph) * 0.02 * amp; q.y = q.hy + Math.cos(t * 6 + q.ph) * 0.02 * amp;
          } else {
            if (q.vx === 0 && q.vy === 0) { q.vx = gauss() * 0.3 * amp; q.vy = gauss() * 0.3 * amp; }
            const v = Math.hypot(q.vx, q.vy), target = 0.35 * amp;
            if (v > 0) { q.vx *= 1 + (target / v - 1) * dt; q.vy *= 1 + (target / v - 1) * dt; }
            q.x += q.vx * dt; q.y += q.vy * dt;
            if (q.x < 0) { q.x = 0; q.vx *= -1; } if (q.x > 0.97) { q.x = 0.97; q.vx *= -1; }
            if (q.y < 0) { q.y = 0; q.vy *= -1; } if (q.y > 0.97) { q.y = 0.97; q.vy *= -1; }
          }
          if (st.state !== 'gas') { q.vx = 0; q.vy = 0; }
          if (st.state === 'gas' && p.state !== 'gas' && T < 500 && p.state === 'auto') { /* chuyển về lỏng */ }
        }
        if (st.state !== 'gas') for (const q of st.p) { if (st.state === 'solid') { const i = st.p.indexOf(q); q.hx = (i % cols) / cols; q.hy = 0.3 + Math.floor(i / cols) / cols * 0.7; } }
      },
      draw(g, w, h, p, t) {
        const bx = 40, by = 50, bw = Math.min(420, w * 0.5), bh = h - 100;
        g.fillStyle = 'rgba(30,41,59,0.5)'; roundRect(g, bx, by, bw, bh, 10); g.fill(); g.strokeStyle = COLORS.grid; g.lineWidth = 2; g.stroke();
        const r = Math.min(bw, bh) / 20;
        const col = st.state === 'solid' ? '#60a5fa' : st.state === 'liquid' ? '#38bdf8' : '#fbbf24';
        for (const q of st.p) circle(g, bx + 10 + q.x * (bw - 20 - 2 * r) + r, by + 10 + q.y * (bh - 20 - 2 * r) + r, r, col, 'rgba(0,0,0,0.3)');
        if (st.state === 'solid') for (let i = 0; i < st.p.length; i++) { const q = st.p[i]; if (i % 8 < 7) { const n = st.p[i + 1]; line(g, bx + 10 + q.x * (bw - 20 - 2 * r) + r, by + 10 + q.y * (bh - 20 - 2 * r) + r, bx + 10 + n.x * (bw - 20 - 2 * r) + r, by + 10 + n.y * (bh - 20 - 2 * r) + r, 'rgba(96,165,250,0.25)', 1); } }
        label(g, { solid: 'THỂ RẮN', liquid: 'THỂ LỎNG', gas: 'THỂ KHÍ' }[st.state] + ` – ${p.temp} K`, bx + bw / 2, by - 16, { size: 12, color: col });
        // Bảng so sánh phải
        const rx = bx + bw + 40, rw = w - rx - 20;
        if (rw > 200) {
          text(g, 'Đặc điểm', rx, 70, { size: 14, weight: '700' });
          const rows = {
            solid: ['Khoảng cách: rất gần (≈ kích thước phân tử)', 'Lực tương tác: rất mạnh', 'Chuyển động: dao động quanh nút mạng cố định', 'Hình dạng & thể tích: xác định', 'Ví dụ: nước đá, kim loại, muối'],
            liquid: ['Khoảng cách: gần, không trật tự xa', 'Lực tương tác: yếu hơn chất rắn', 'Chuyển động: dao động quanh vị trí cân bằng di chuyển', 'Thể tích xác định, hình dạng theo bình', 'Ví dụ: nước, dầu, thủy ngân'],
            gas: ['Khoảng cách: rất xa (≈ 10 lần kích thước)', 'Lực tương tác: không đáng kể', 'Chuyển động: hỗn loạn, tự do, va chạm', 'Không có hình dạng, thể tích riêng', 'Ví dụ: không khí, hơi nước']
          }[st.state];
          rows.forEach((s, i) => text(g, s, rx, 100 + i * 26, { size: 12, color: COLORS.muted }));
          // thang nhiệt độ
          const sy = 260, sw = rw - 20;
          text(g, 'Thang nhiệt độ (K)', rx, sy - 10, { size: 11, color: COLORS.muted });
          g.fillStyle = '#60a5fa'; g.fillRect(rx, sy, sw * (273 - 50) / 850, 12);
          g.fillStyle = '#38bdf8'; g.fillRect(rx + sw * (273 - 50) / 850, sy, sw * (500 - 273) / 850, 12);
          g.fillStyle = '#fbbf24'; g.fillRect(rx + sw * (500 - 50) / 850, sy, sw * 400 / 850, 12);
          const px = rx + sw * (p.temp - 50) / 850; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(px, sy + 14); g.lineTo(px - 5, sy + 24); g.lineTo(px + 5, sy + 24); g.closePath(); g.fill();
          text(g, '273 K', rx + sw * (273 - 50) / 850, sy + 38, { size: 9.5, align: 'center', color: COLORS.muted }); text(g, '500 K (minh họa)', rx + sw * (500 - 50) / 850, sy + 38, { size: 9.5, align: 'center', color: COLORS.muted });
          text(g, `Động năng tb ∝ T: ${(1.5 * 1.38e-23 * p.temp * 1e21).toFixed(2)}·10⁻²¹ J`, rx, sy + 70, { size: 12 });
          text(g, `Tốc độ căn quân phương (N2): ${Math.sqrt(3 * 8.314 * p.temp / 0.028).toFixed(0)} m/s`, rx, sy + 94, { size: 12 });
        }
      },
      metrics(p) { return [['Thể hiện tại', { solid: 'rắn', liquid: 'lỏng', gas: 'khí' }[st.state]], ['Động năng tb (10⁻²¹ J)', 1.5 * 1.38e-23 * p.temp * 1e21, 2], ['v_rms của N2', `${Math.sqrt(3 * 8.314 * p.temp / 0.028).toFixed(0)} m/s`]]; }
    };
  }
};
