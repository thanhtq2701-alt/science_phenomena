import { COLORS, text, label, circle, roundRect, bar, mixColor } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const STAGES_PRIMARY = [['Đá trần / dung nham', 0], ['Địa y, rêu', 5], ['Cỏ, cây thân thảo', 20], ['Cây bụi', 50], ['Cây gỗ ưa sáng', 100], ['Rừng ổn định (đỉnh cực)', 200]];
const STAGES_SECONDARY = [['Đất trống sau cháy/khai thác', 0], ['Cỏ dại', 2], ['Cây bụi', 10], ['Cây gỗ ưa sáng', 30], ['Rừng thứ sinh', 80], ['Rừng ổn định (đỉnh cực)', 150]];

export default {
  id: 'bio-succession',
  subject: 'bio',
  chapter: 'ecology',
  title: 'Diễn thế sinh thái nguyên sinh và thứ sinh',
  summary: 'Quần xã thay đổi tuần tự theo thời gian: từ đá trần (nguyên sinh) hoặc đất bỏ hoang (thứ sinh) tới rừng ổn định. Đất dày lên, độ đa dạng và sinh khối tăng; tác động của con người có thể làm diễn thế đi ngược.',
  equation: ['Diễn thế nguyên sinh: môi trường trống trơn → quần xã tiên phong → … → quần xã đỉnh cực', 'Diễn thế thứ sinh: quần xã bị phá hủy → … → quần xã ổn định hoặc suy thoái'],
  keywords: ['diễn thế sinh thái', 'nguyên sinh', 'thứ sinh', 'quần xã đỉnh cực', 'sinh vật tiên phong', 'địa y', 'đa dạng sinh học', 'rừng thứ sinh'],
  theory: [
    '**Diễn thế sinh thái** là quá trình biến đổi tuần tự của quần xã qua các giai đoạn, tương ứng với sự biến đổi của môi trường. Nguyên nhân bên ngoài (khí hậu, thiên tai, con người) và bên trong (cạnh tranh, hoạt động của chính quần xã làm thay đổi môi trường).',
    '**Nguyên sinh**: bắt đầu từ môi trường **chưa có sinh vật** (đá trần, đảo núi lửa). Sinh vật tiên phong (địa y, rêu) phong hóa đá tạo đất mỏng → cỏ → cây bụi → cây gỗ → quần xã **đỉnh cực** tương đối ổn định. **Thứ sinh**: bắt đầu từ nơi quần xã đã bị phá hủy nhưng **còn đất**, nên nhanh hơn; có thể dẫn tới quần xã suy thoái nếu tiếp tục bị khai thác.',
    'Xu hướng chung: **đất dày và giàu mùn hơn, số loài tăng, lưới thức ăn phức tạp hơn, sinh khối tăng**, quần xã ổn định hơn. Hiểu diễn thế giúp khai thác hợp lí và phục hồi rừng.'
  ],
  observe: ['So sánh thời gian đạt rừng ổn định: nguyên sinh lâu hơn nhiều.', 'Bấm "Cháy rừng" khi đã thành rừng: quần xã quay về giai đoạn đầu của diễn thế thứ sinh.'],
  exam: ['Phân biệt diễn thế nguyên sinh và thứ sinh (khởi đầu, kết quả, ví dụ).', 'Nêu xu hướng biến đổi các chỉ số của quần xã trong diễn thế.'],
  params: [
    { key: 'type', label: 'Loại diễn thế', type: 'select', value: 'primary', options: [['primary', 'Nguyên sinh (đá trần)'], ['secondary', 'Thứ sinh (đất bỏ hoang)']] },
    { key: 'speed', label: 'Năm / giây', min: 1, max: 30, step: 1, value: 10 }
  ],
  actions: [{ key: 'fire', label: '🔥 Cháy rừng' }],
  create() {
    const st = { year: 0, type: 'primary' };
    return {
      onParam(k, p) { if (k === 'type') { st.year = 0; st.type = p.type; } },
      action(key) { if (key === 'fire') { st.type = 'secondary'; st.year = 0; } },
      update(dt, p) { st.year = Math.min(260, st.year + dt * p.speed); },
      draw(g, w, h, p, t) {
        const stages = st.type === 'primary' ? STAGES_PRIMARY : STAGES_SECONDARY;
        let idx = 0; for (let i = 0; i < stages.length; i++) if (st.year >= stages[i][1]) idx = i;
        const nextY = stages[idx + 1] ? stages[idx + 1][1] : stages[idx][1] + 1;
        const frac = clamp((st.year - stages[idx][1]) / (nextY - stages[idx][1]), 0, 1);
        const level = clamp((idx + frac) / (stages.length - 1), 0, 1);
        // cảnh
        const gx = 30, gy = 60, gw = w - 60, gh = h - 200;
        g.fillStyle = mixColor('#0c4a6e', '#38bdf8', 0.3); roundRect(g, gx, gy, gw, gh, 10); g.fill();
        const groundY = gy + gh - 40;
        const soil = st.type === 'primary' ? level * 30 : 10 + level * 25;
        g.fillStyle = '#57534e'; g.fillRect(gx, groundY, gw, 40); g.fillStyle = '#78350f'; g.fillRect(gx, groundY - soil * 0.3, gw, soil * 0.3 + 4);
        const rnd = (i) => ((i * 9301 + 49297) % 233280) / 233280;
        for (let i = 0; i < 60; i++) {
          const x = gx + 10 + rnd(i) * (gw - 20);
          const r = rnd(i + 99);
          if (level > 0.1 && r < 0.9) { g.fillStyle = '#a3e635'; g.fillRect(x, groundY - 3, 6, 3); } // địa y/rêu
          if (level > 0.3 && r < 0.75) { g.strokeStyle = '#4ade80'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, groundY); g.lineTo(x - 3, groundY - 14 * clamp((level - 0.3) * 4, 0, 1)); g.moveTo(x, groundY); g.lineTo(x + 3, groundY - 12 * clamp((level - 0.3) * 4, 0, 1)); g.stroke(); }
          if (level > 0.5 && r < 0.4) circle(g, x, groundY - 18, 14 * clamp((level - 0.5) * 4, 0, 1), '#16a34a');
          if (level > 0.7 && r < 0.22) { const th = 90 * clamp((level - 0.7) * 3.3, 0, 1); g.fillStyle = '#78350f'; g.fillRect(x - 3, groundY - th, 6, th); circle(g, x, groundY - th, 26 * clamp((level - 0.7) * 3.3, 0, 1), '#15803d'); }
        }
        label(g, `Năm ${Math.floor(st.year)}: ${stages[idx][0]}`, w / 2, gy + 20, { size: 12.5 });
        // timeline giai đoạn
        const ty = h - 120, tw = w - 80;
        stages.forEach(([nm, y], i) => { const x = 40 + i * tw / (stages.length - 1); circle(g, x, ty, i === idx ? 9 : 5, i <= idx ? '#4ade80' : '#475569'); text(g, nm, x, ty + 22, { size: 9.5, align: 'center', color: i === idx ? COLORS.text : COLORS.muted }); text(g, `~${y} năm`, x, ty + 36, { size: 9, align: 'center', color: COLORS.muted }); });
        // chỉ số
        const by = h - 50, bw = (w - 100) / 3;
        bar(g, 40, by, bw - 20, 9, level, '#a3e635', `Số loài: ${Math.round(5 + level * 95)}`);
        bar(g, 40 + bw, by, bw - 20, 9, level, '#16a34a', `Sinh khối: ${Math.round(level * 300)} t/ha`);
        bar(g, 40 + 2 * bw, by, bw - 20, 9, soil / 35, '#b45309', `Độ dày đất: ${soil.toFixed(0)} cm`);
      },
      metrics() { return [['Năm', Math.floor(st.year)], ['Loại diễn thế', st.type === 'primary' ? 'nguyên sinh' : 'thứ sinh']]; }
    };
  }
};
