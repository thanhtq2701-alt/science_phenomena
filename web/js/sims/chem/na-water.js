import { COLORS, text, label, beaker, circle, flame, mixColor, Bubbles, withAlpha } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const METALS = {
  Li: { name: 'Lithium', rate: 0.25, color: '#e2e8f0', flame: null, note: 'phản ứng chậm, nổi, sủi bọt' },
  Na: { name: 'Sodium', rate: 0.6, color: '#f1f5f9', flame: '#fbbf24', note: 'chạy trên mặt nước, nóng chảy thành giọt tròn' },
  K: { name: 'Potassium', rate: 1.2, color: '#e9d5ff', flame: '#c084fc', note: 'bốc cháy ngay với ngọn lửa tím' }
};

export default {
  id: 'chem-na-water',
  subject: 'chem',
  chapter: 'group-ia-iia',
  title: 'Kim loại kiềm tác dụng với nước',
  summary: 'Mẩu Na chạy trên mặt nước, nóng chảy thành giọt tròn, sủi bọt H2, dung dịch có phenolphthalein hóa hồng; K mạnh hơn, bốc cháy ngọn lửa tím.',
  equation: ['2Na + 2H2O → 2NaOH + H2↑', '2K + 2H2O → 2KOH + H2↑ (bốc cháy)', 'Phenolphthalein + OH− → màu hồng'],
  keywords: ['kim loại kiềm', 'natri', 'sodium', 'kali', 'nước', 'phenolphthalein', 'hydrogen'],
  theory: [
    'Kim loại kiềm (nhóm IA) có **1 electron hóa trị**, bán kính lớn, năng lượng ion hóa nhỏ → **tính khử rất mạnh**, phản ứng mãnh liệt với nước ngay nhiệt độ thường tạo **base mạnh và H2**.',
    'Tính khử **tăng từ Li → Cs**: Li phản ứng chậm, Na chạy trên mặt nước và nóng chảy (nhiệt độ nóng chảy thấp ~98 °C), K bốc cháy, Rb/Cs nổ.',
    'Vì nhẹ hơn nước và phản ứng mạnh nên Na, K phải **bảo quản trong dầu hỏa**. Dung dịch sau phản ứng có môi trường base → phenolphthalein **hóa hồng**.'
  ],
  observe: ['Bật phenolphthalein để thấy vệt hồng lan ra từ vị trí mẩu kim loại.', 'Đổi sang K: xuất hiện ngọn lửa tím; sang Li: chậm hơn nhiều.', 'Tăng kích thước mẩu: phản ứng kéo dài hơn và mạnh hơn.'],
  exam: ['Giải thích hiện tượng thí nghiệm Na + H2O; tính thể tích H2 và nồng độ NaOH thu được.', 'So sánh mức độ phản ứng của Li, Na, K với nước; cách bảo quản kim loại kiềm.'],
  quiz: {
    question: 'Thả một mẩu sodium (Na) vào chậu nước có vài giọt phenolphthalein. Hiện tượng nào đúng?',
    options: ['Na chìm xuống đáy, tan từ từ, nước không đổi màu', 'Na bốc cháy với ngọn lửa màu tím', 'Na chạy trên mặt nước, sủi bọt khí, nước quanh mẩu Na hóa hồng', 'Na nổi yên, không phản ứng'],
    answer: 2,
    explanation: 'Na nhẹ hơn nước, phản ứng tỏa nhiệt làm Na nóng chảy thành giọt tròn và khí H2 đẩy nó chạy trên mặt nước. NaOH sinh ra làm phenolphthalein hóa hồng. Ngọn lửa tím là của K.'
  },
  params: [
    { key: 'metal', label: 'Kim loại', type: 'select', value: 'Na', options: Object.entries(METALS).map(([k, v]) => [k, `${k} – ${v.name}`]) },
    { key: 'size', label: 'Kích thước mẩu', min: 1, max: 5, step: 1, value: 3 },
    { key: 'pp', label: 'Có phenolphthalein', type: 'toggle', value: true }
  ],
  create() {
    const st = { mass: 1, x: 0.5, vx: 0.4, bub: new Bubbles(), pink: 0, trail: [] };
    return {
      onParam(k) { if (k === 'metal' || k === 'size') { st.mass = 1; st.pink = 0; st.trail = []; } },
      update(dt, p, t) {
        const m = METALS[p.metal];
        if (st.mass > 0) {
          st.mass = clamp(st.mass - dt * m.rate / (p.size * 1.2), 0, 1);
          st.x += st.vx * dt * m.rate * 1.3;
          if (st.x < 0.12 || st.x > 0.88) st.vx *= -1;
          st.x = clamp(st.x, 0.12, 0.88);
          st.pink = clamp(st.pink + dt * m.rate * 0.15 * p.size, 0, 1);
          if (Math.random() < m.rate) st.trail.push({ x: st.x, life: 1 });
          if (st.geo && Math.random() < m.rate * 1.5) st.bub.spawn(st.geo.bx + st.x * st.geo.bw, st.geo.surf + 10, 2, { spread: 24 });
        }
        if (st.geo) st.bub.update(dt, st.geo.surf - 2);
        for (const tr of st.trail) tr.life -= dt * 0.3;
        st.trail = st.trail.filter((x) => x.life > 0);
      },
      draw(g, w, h, p, t) {
        const m = METALS[p.metal];
        const bx = 60, by = 80, bw = Math.min(460, w * 0.55), bh = 300;
        const liquid = p.pp ? mixColor('#e2e8f0', '#ec4899', st.pink * 0.75) : '#e2e8f0';
        const r = beaker(g, bx, by, bw, bh, 0.6, withAlpha(toHex(liquid), 0.4), { title: 'nước' + (p.pp ? ' + phenolphthalein' : '') });
        const surf = r.top;
        // vệt hồng theo đường đi
        if (p.pp) for (const tr of st.trail) { g.globalAlpha = tr.life * 0.5; circle(g, bx + tr.x * bw, surf + 15 + (1 - tr.life) * 40, 18 * (1.3 - tr.life), '#f472b6'); }
        g.globalAlpha = 1;
        st.geo = { bx, bw, surf };
        st.bub.draw(g);
        // mẩu kim loại
        if (st.mass > 0) {
          const R = (6 + p.size * 3) * Math.cbrt(st.mass);
          const mx = bx + st.x * bw, my = surf - R * 0.5;
          const molten = p.metal !== 'Li' && st.mass < 0.95;
          circle(g, mx, my, R, m.color, 'rgba(0,0,0,0.3)');
          if (molten) circle(g, mx - R * 0.3, my - R * 0.3, R * 0.3, 'rgba(255,255,255,0.7)');
          text(g, p.metal, mx, my + 1, { size: 11, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' });
          if (m.flame && (p.metal === 'K' || st.mass < 0.6)) flame(g, mx, my - R * 0.6, 0.6 + p.size * 0.15, m.flame, t);
          label(g, m.note, bx + bw / 2, by - 16, { size: 11, color: COLORS.muted });
        } else label(g, 'kim loại đã tan hết', bx + bw / 2, by - 16, { size: 11, color: COLORS.muted });
        // Giải thích phải
        const rx = bx + bw + 40;
        if (w - rx > 180) {
          text(g, 'Điều gì đang xảy ra?', rx, 100, { size: 14, weight: '700' });
          const notes = [`2${p.metal} + 2H₂O → 2${p.metal}OH + H₂↑`, '', '• Nhẹ hơn nước → nổi.', '• Phản ứng tỏa nhiệt mạnh → kim loại nóng chảy', '  thành giọt tròn (Na, K).', '• H₂ thoát ra đẩy mẩu kim loại chạy.', '• OH⁻ sinh ra → phenolphthalein hồng.', p.metal === 'K' ? '• K: nhiệt đủ đốt cháy H₂, lửa tím.' : p.metal === 'Na' ? '• Na: ngọn lửa vàng nếu mẩu to.' : '• Li: chậm nhất trong nhóm.'];
          notes.forEach((n, i) => text(g, n, rx, 128 + i * 21, { size: i === 0 ? 13 : 11.5, weight: i === 0 ? '700' : '500', color: i === 0 ? COLORS.text : COLORS.muted }));
          text(g, 'Tính khử tăng: Li < Na < K < Rb < Cs', rx, 128 + notes.length * 21 + 10, { size: 12, color: COLORS.chem, weight: '600' });
        }
      },
      metrics(p) { const mol = p.size * 0.002; return [['Kim loại còn lại', `${Math.round(st.mass * 100)} %`], ['n(H2) sinh ra', `${(mol * (1 - st.mass) / 2 * 1000).toFixed(2)} mmol`], ['pH dung dịch', st.pink > 0.05 ? 'base (> 7)' : '≈ 7']]; }
    };
  }
};
function toHex(rgb) { if (rgb.startsWith('#')) return rgb; const m = rgb.match(/\d+/g); return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join(''); }
