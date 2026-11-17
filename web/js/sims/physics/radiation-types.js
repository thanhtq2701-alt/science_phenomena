import { COLORS, text, label, circle, line, roundRect, arrow } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

const RAYS = {
  alpha: { name: 'α (hạt nhân ⁴He, +2e)', q: 2, m: 4, speed: 0.5, color: '#fbbf24', stop: 'paper', range: 'vài cm trong không khí' },
  beta: { name: 'β⁻ (electron, −e)', q: -1, m: 0.02, speed: 0.9, color: '#a3e635', stop: 'al', range: 'vài m trong không khí, vài mm nhôm' },
  betaP: { name: 'β⁺ (positron, +e)', q: 1, m: 0.02, speed: 0.9, color: '#2dd4bf', stop: 'al', range: 'như β⁻, rồi hủy cặp với electron' },
  gamma: { name: 'γ (photon năng lượng cao)', q: 0, m: 0, speed: 1, color: '#c084fc', stop: 'pb', range: 'xuyên qua vài cm chì' }
};
const BARRIERS = [['none', 'Không có vật cản'], ['paper', 'Tờ giấy'], ['al', 'Lá nhôm 3 mm'], ['pb', 'Tấm chì 5 cm']];

export default {
  id: 'physics-radiation-types',
  subject: 'physics',
  chapter: 'nuclear',
  title: 'Các loại tia phóng xạ: khả năng đâm xuyên và lệch trong từ trường',
  summary: 'Bắn tia α, β⁻, β⁺, γ qua từ trường và vật cản: α lệch ít và bị tờ giấy chặn, β lệch mạnh theo hai chiều ngược nhau và bị nhôm chặn, γ không lệch và xuyên qua nhôm.',
  equation: ['α: ᴬ_Z X → ᴬ⁻⁴_{Z−2} Y + ⁴₂He', 'β⁻: n → p + e⁻ + ν̄ ;  β⁺: p → n + e⁺ + ν', 'γ: hạt nhân ở trạng thái kích thích → trạng thái cơ bản + photon'],
  keywords: ['tia phóng xạ', 'alpha', 'beta', 'gamma', 'positron', 'đâm xuyên', 'ion hóa', 'lệch trong từ trường', 'an toàn phóng xạ'],
  theory: [
    '**Tia α** là dòng hạt nhân heli mang điện +2e, khối lượng lớn, tốc độ ~2·10⁷ m/s, **ion hóa mạnh** nhưng **đâm xuyên yếu**: bị một tờ giấy chặn lại.',
    '**Tia β⁻** (electron) và **β⁺** (positron) mang điện ±e, nhẹ, tốc độ gần bằng tốc độ ánh sáng, đâm xuyên mạnh hơn α, bị **lá nhôm vài mm** chặn. Trong từ trường, β lệch mạnh hơn α nhiều (vì nhẹ) và β⁻, β⁺ lệch **ngược chiều nhau**.',
    '**Tia γ** là sóng điện từ bước sóng rất ngắn, **không mang điện** nên **không lệch** trong từ trường, đâm xuyên rất mạnh, cần lớp chì hay bê tông dày để chắn. Bảo vệ: giữ khoảng cách, giảm thời gian tiếp xúc, dùng vật che chắn.'
  ],
  observe: ['Bật từ trường: α và β⁻ lệch về hai phía, γ đi thẳng.', 'Đặt tờ giấy: chỉ α bị chặn. Lá nhôm: chặn cả β. Chì: chặn phần lớn γ.', 'So sánh độ cong: β nhẹ nên lệch nhiều hơn α.'],
  exam: ['So sánh bản chất, điện tích, khả năng ion hóa và đâm xuyên của các tia.', 'Xác định chiều lệch của tia trong điện trường/từ trường.'],
  params: [
    { key: 'B', label: 'Từ trường (vuông góc, hướng vào)', min: 0, max: 1, step: 0.1, value: 0.5, decimals: 1 },
    { key: 'barrier', label: 'Vật cản', type: 'select', value: 'none', options: BARRIERS },
    { key: 'show', label: 'Tia phát ra', type: 'select', value: 'all', options: [['all', 'Tất cả'], ...Object.entries(RAYS).map(([k, v]) => [k, v.name])] }
  ],
  create() {
    const st = { parts: [], timer: 0, hits: { alpha: 0, beta: 0, betaP: 0, gamma: 0 } };
    return {
      onParam() { st.parts = []; st.hits = { alpha: 0, beta: 0, betaP: 0, gamma: 0 }; },
      update(dt, p) {
        st.timer += dt;
        if (st.timer > 0.12) {
          st.timer = 0;
          const kinds = p.show === 'all' ? Object.keys(RAYS) : [p.show];
          for (const k of kinds) st.parts.push({ k, x: 0, y: 0, vx: RAYS[k].speed, vy: (Math.random() - 0.5) * 0.02, alive: true });
        }
        for (const q of st.parts) {
          const r = RAYS[q.k];
          if (r.q !== 0 && p.B > 0) { // lực Lorentz: v × B (B vào màn hình) → q>0 lệch lên trên
            const k = r.q / (r.m * 40 + 1) * p.B * 2.2; const ax = k * q.vy, ay = -k * q.vx; q.vx += ax * dt; q.vy += ay * dt;
            const sp = Math.hypot(q.vx, q.vy); q.vx *= r.speed / sp; q.vy *= r.speed / sp;
          }
          q.x += q.vx * dt * 0.6; q.y += q.vy * dt * 0.6;
          const bx = 0.62;
          if (p.barrier !== 'none' && q.x >= bx && q.x - q.vx * dt * 0.6 < bx) {
            const stopped = p.barrier === 'paper' ? q.k === 'alpha' : p.barrier === 'al' ? q.k !== 'gamma' : (q.k !== 'gamma' || Math.random() < 0.9);
            if (stopped) q.alive = false;
          }
          if (q.x > 0.95 && q.alive && !q.counted) { q.counted = true; st.hits[q.k]++; }
        }
        st.parts = st.parts.filter((q) => q.alive && q.x < 1.05 && Math.abs(q.y) < 0.6);
      },
      draw(g, w, h, p) {
        const ox = 60, oy = h / 2, W = w - 120, H = h - 80;
        // vùng từ trường
        if (p.B > 0) { g.fillStyle = `rgba(56,189,248,${0.04 + p.B * 0.08})`; roundRect(g, ox + 40, oy - H / 2, W * 0.55, H, 10); g.fill(); for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) { const x = ox + 60 + i * W * 0.55 / 7, y = oy - H / 2 + 30 + j * (H - 60) / 4; line(g, x - 4, y - 4, x + 4, y + 4, 'rgba(56,189,248,0.5)', 1.2); line(g, x - 4, y + 4, x + 4, y - 4, 'rgba(56,189,248,0.5)', 1.2); } text(g, `B = ${p.B} (× hướng vào)`, ox + 50, oy - H / 2 + 16, { size: 10.5, color: '#7dd3fc' }); }
        // nguồn
        g.fillStyle = '#475569'; roundRect(g, ox - 40, oy - 24, 50, 48, 6); g.fill(); text(g, '☢', ox - 15, oy + 7, { size: 20, align: 'center', color: '#fbbf24' }); text(g, 'nguồn', ox - 15, oy + 40, { size: 10, align: 'center', color: COLORS.muted });
        // vật cản
        if (p.barrier !== 'none') { const bx = ox + W * 0.62; const col = { paper: '#f8fafc', al: '#cbd5e1', pb: '#475569' }[p.barrier]; const wd = { paper: 3, al: 8, pb: 22 }[p.barrier]; g.fillStyle = col; g.fillRect(bx, oy - H / 2 + 20, wd, H - 40); text(g, BARRIERS.find((b) => b[0] === p.barrier)[1], bx + wd / 2, oy + H / 2 - 4, { size: 10, align: 'center', color: COLORS.muted }); }
        // màn hứng
        g.fillStyle = 'rgba(74,222,128,0.2)'; g.fillRect(ox + W * 0.95, oy - H / 2 + 10, 10, H - 20); text(g, 'màn đếm', ox + W * 0.95 + 5, oy - H / 2 + 4, { size: 10, align: 'center', color: COLORS.muted });
        for (const q of st.parts) circle(g, ox + q.x * W, oy + q.y * H, q.k === 'gamma' ? 2.5 : q.k === 'alpha' ? 4.5 : 2.5, RAYS[q.k].color);
        // chú thích
        let y = 30;
        for (const [k, r] of Object.entries(RAYS)) { if (p.show !== 'all' && p.show !== k) continue; circle(g, w - 290, y - 4, 5, r.color); text(g, `${r.name}: tới màn ${st.hits[k]}`, w - 278, y, { size: 10.5, color: COLORS.muted }); y += 18; }
        text(g, 'α bị giấy chặn · β bị nhôm chặn · γ cần chì dày', ox, h - 14, { size: 11, color: COLORS.muted });
      },
      metrics() { return Object.entries(RAYS).map(([k, r]) => [r.name.split(' ')[0] + ' tới màn', st.hits[k]]); }
    };
  }
};
