import { COLORS, text, label, beaker, flame, mixColor, circle, line } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

export default {
  id: 'chem-starch-iodine',
  subject: 'chem',
  chapter: 'carbohydrate',
  title: 'Hồ tinh bột + iodine: màu xanh tím và nhiệt độ',
  summary: 'Phân tử iodine chui vào lòng xoắn amylose tạo hợp chất màu xanh tím. Đun nóng xoắn duỗi ra, màu mất; để nguội màu trở lại.',
  equation: ['(C6H10O5)n (amylose xoắn) + I2 → phức bọc I2 màu xanh tím', 'Đun nóng ⇄ để nguội: mất màu ⇄ có màu lại'],
  keywords: ['tinh bột', 'iodine', 'xanh tím', 'amylose', 'nhận biết'],
  theory: [
    'Amylose trong tinh bột có cấu trúc **xoắn lò xo** (mỗi vòng ≈ 6 gốc glucose). Phân tử **I2 chui vào lòng ống xoắn**, tạo hợp chất hấp thụ ánh sáng cho **màu xanh tím** đặc trưng.',
    'Khi **đun nóng**, chuỗi dao động mạnh, xoắn duỗi ra, I2 thoát khỏi lòng xoắn → **mất màu**. Để **nguội**, xoắn hình thành trở lại → **có màu lại**. Đây là hiện tượng vật lí – hóa học thuận nghịch, dùng để **nhận biết tinh bột** (hoặc nhận biết iodine).',
    'Ứng dụng: nhỏ iodine lên lát chuối xanh/khoai tây thấy xanh tím; dùng hồ tinh bột làm chỉ thị trong chuẩn độ iodine.'
  ],
  observe: ['Kéo nhiệt độ lên trên 70 °C rồi hạ xuống để xem màu mất đi và trở lại.', 'Giảm lượng iodine: màu nhạt dần nhưng vẫn là xanh tím.'],
  exam: ['Nhận biết tinh bột bằng dung dịch I2; giải thích hiện tượng khi đun nóng.'],
  quiz: {
    question: 'Hồ tinh bột đã có màu xanh tím với iodine. Đun nóng lên khoảng 90 °C rồi để nguội. Màu thay đổi thế nào?',
    options: ['Mất màu khi nóng, có màu lại khi nguội', 'Giữ nguyên màu xanh tím', 'Mất màu hẳn, để nguội cũng không trở lại', 'Chuyển sang màu đỏ gạch'],
    answer: 0,
    explanation: 'Màu xanh tím do I2 nằm trong lòng xoắn amylose. Đun nóng làm xoắn duỗi ra, I2 thoát ra nên mất màu; để nguội xoắn hình thành lại nên có màu trở lại.'
  },
  params: [
    { key: 'temp', label: 'Nhiệt độ', min: 20, max: 100, step: 5, value: 25, unit: '°C' },
    { key: 'iodine', label: 'Lượng I2 nhỏ vào', min: 0, max: 10, step: 1, value: 5, unit: 'giọt' }
  ],
  create() {
    const st = { color: 0, unwound: 0, iod: [] };
    for (let i = 0; i < 10; i++) st.iod.push({ ph: Math.random() * TAU, free: Math.random() });
    return {
      update(dt, p) {
        const target = p.temp > 65 ? 1 : p.temp > 50 ? (p.temp - 50) / 15 : 0;
        st.unwound += (target - st.unwound) * (1 - Math.exp(-dt * 1.2));
        const ctarget = (1 - st.unwound) * clamp(p.iodine / 6, 0, 1);
        st.color += (ctarget - st.color) * (1 - Math.exp(-dt * 1.5));
      },
      draw(g, w, h, p, t) {
        // Cốc hồ tinh bột
        const bx = 60, by = 100, bw = 200, bh = 230;
        const liquid = mixColor('#e2e8f0', '#312e81', st.color);
        beaker(g, bx, by, bw, bh, 0.7, liquid, { title: 'Hồ tinh bột + I2' });
        if (p.temp > 40) flame(g, bx + bw / 2, by + bh + 40, 0.5 + (p.temp - 40) / 100, '#fbbf24', t);
        label(g, `${p.temp} °C`, bx + bw / 2, by + bh + 56, { size: 11 });
        const colorName = st.color > 0.6 ? 'xanh tím đậm' : st.color > 0.25 ? 'xanh tím nhạt' : st.color > 0.08 ? 'gần như không màu' : 'không màu (trắng đục)';
        label(g, colorName, bx + bw / 2, by - 16, { size: 12, color: st.color > 0.25 ? '#c4b5fd' : COLORS.muted });

        // Mô hình phân tử bên phải: xoắn amylose
        const cx = Math.max(420, w * 0.62), cy = h / 2 - 10;
        text(g, 'Mô hình phân tử', cx - 120, 40, { size: 14, weight: '700' });
        const turns = 7, len = Math.min(w - cx - 40, 340);
        const R = 34 * (1 - 0.75 * st.unwound);
        const pts = [];
        const n = 140;
        for (let i = 0; i <= n; i++) {
          const u = i / n;
          const ang = u * turns * TAU;
          // xoắn: khi duỗi ra thì biến thành đường zic zắc mềm
          const x = cx - len / 2 + u * len + Math.cos(ang) * 6 * st.unwound;
          const y = cy + Math.sin(ang) * R + Math.sin(u * 30 + t * 3) * 10 * st.unwound;
          pts.push([x, y, Math.cos(ang)]);
        }
        // vẽ phía sau
        g.lineWidth = 7; g.lineCap = 'round';
        for (let i = 1; i < pts.length; i++) {
          if (pts[i][2] > 0) continue;
          g.strokeStyle = '#4ade80'; g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke();
        }
        // iodine
        const nIn = Math.round(clamp(p.iodine / 10, 0, 1) * st.iod.length);
        st.iod.forEach((io, i) => {
          const inside = i < nIn && st.unwound < 0.5;
          const u = 0.1 + (i / st.iod.length) * 0.8;
          let x, y;
          if (inside) { x = cx - len / 2 + u * len; y = cy + Math.sin(t + io.ph) * 3; }
          else { x = cx - len / 2 + u * len + Math.sin(t * 1.3 + io.ph) * 40; y = cy + (io.free - 0.5) * 220 + Math.cos(t * 0.9 + io.ph) * 30; }
          if (i < nIn) {
            circle(g, x - 6, y, 6, '#7c3aed'); circle(g, x + 6, y, 6, '#7c3aed');
            text(g, 'I₂', x, y - 10, { size: 9, align: 'center', color: '#c4b5fd' });
          }
        });
        g.lineWidth = 7;
        for (let i = 1; i < pts.length; i++) {
          if (pts[i][2] <= 0) continue;
          g.strokeStyle = '#86efac'; g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke();
        }
        g.lineCap = 'butt';
        text(g, st.unwound > 0.5 ? 'Xoắn amylose duỗi ra → I2 thoát ra ngoài → mất màu' : 'I2 nằm trong lòng xoắn amylose → màu xanh tím', cx, cy + 90, { size: 12.5, align: 'center', color: COLORS.muted });
        line(g, cx - len / 2, cy + 110, cx + len / 2, cy + 110, COLORS.grid, 1);
        text(g, `Độ duỗi xoắn: ${Math.round(st.unwound * 100)}%`, cx, cy + 130, { size: 12, align: 'center' });
      },
      metrics(p) { return [['Cường độ màu', `${Math.round(st.color * 100)} %`], ['Xoắn bị duỗi', `${Math.round(st.unwound * 100)} %`], ['Nhiệt độ', `${p.temp} °C`]]; }
    };
  }
};
