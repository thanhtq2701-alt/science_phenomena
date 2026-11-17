import { COLORS, text, label, circle, roundRect, plot, polyline, mixColor } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'bio-reaction-norm',
  subject: 'bio',
  chapter: 'mendel',
  title: 'Kiểu gene – môi trường – kiểu hình: thường biến và mức phản ứng',
  summary: 'Cùng kiểu gene, thỏ Himalaya có lông đen ở đầu mút cơ thể vì nơi đó lạnh; cây hoa cẩm tú cầu đổi màu theo pH đất. Năng suất lúa của hai giống thay đổi theo chăm sóc nhưng trong giới hạn mức phản ứng.',
  equation: ['Kiểu hình = Kiểu gene + Môi trường', 'Mức phản ứng: tập hợp các kiểu hình của một kiểu gene trong các môi trường khác nhau (do kiểu gene quy định)'],
  keywords: ['thường biến', 'mức phản ứng', 'mềm dẻo kiểu hình', 'thỏ Himalaya', 'cẩm tú cầu', 'kiểu gene', 'môi trường', 'giống tốt kĩ thuật tốt'],
  theory: [
    '**Bố mẹ không truyền cho con tính trạng có sẵn mà truyền một kiểu gene**. Kiểu hình là kết quả tương tác giữa kiểu gene và **điều kiện môi trường**.',
    'Ví dụ: thỏ Himalaya có gene tổng hợp sắc tố melanin chỉ hoạt động ở **nhiệt độ thấp** → lông đen ở tai, mũi, chân, đuôi (nơi lạnh); cạo lông lưng và chườm đá, lông mọc lại sẽ đen. Hoa cẩm tú cầu: đất chua → xanh lam, đất kiềm → hồng.',
    '**Mức phản ứng** là giới hạn kiểu hình của một kiểu gene; tính trạng chất lượng có mức phản ứng **hẹp**, tính trạng số lượng có mức phản ứng **rộng**. Năng suất = giống (kiểu gene) × kĩ thuật (môi trường): giống quy định năng suất tối đa.'
  ],
  observe: ['Hạ nhiệt độ quanh thỏ: vùng lông đen lan rộng; nâng lên 35 °C: lông trắng hết.', 'Kéo pH đất của cẩm tú cầu từ 5 lên 8.', 'Tăng mức chăm sóc: hai giống lúa tăng năng suất nhưng giống thường không vượt được trần của nó.'],
  exam: ['Giải thích thí nghiệm thỏ Himalaya; phân biệt thường biến với đột biến.', 'Vận dụng mức phản ứng vào sản xuất nông nghiệp.'],
  params: [
    { key: 'temp', label: 'Nhiệt độ môi trường (thỏ)', min: 0, max: 35, step: 1, value: 15, unit: '°C' },
    { key: 'shave', label: 'Cạo lông lưng + chườm đá', type: 'toggle', value: false },
    { key: 'ph', label: 'pH đất (cẩm tú cầu)', min: 4.5, max: 8.5, step: 0.1, value: 5.5, decimals: 1 },
    { key: 'care', label: 'Mức chăm sóc lúa', min: 0, max: 100, step: 5, value: 50, unit: '%' }
  ],
  create() {
    return {
      update() {},
      draw(g, w, h, p) {
        // thỏ
        const bx = 40, by = 60;
        text(g, 'Thỏ Himalaya (cùng kiểu gene)', bx, 40, { size: 12.5, weight: '700' });
        const black = (localT) => localT < 30 - p.temp * 0.0 && localT < 33 ? clamp((33 - localT) / 10, 0, 1) : 0;
        const body = p.temp + 8, extrem = p.temp - 2, back = p.shave ? 2 : body;
        const fur = (lt) => mixColor('#f8fafc', '#111827', black(lt));
        g.fillStyle = fur(back); g.beginPath(); g.ellipse(bx + 120, by + 120, 80, 50, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = fur(body); g.beginPath(); g.ellipse(bx + 120, by + 140, 72, 30, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = fur(body + 2); g.beginPath(); g.ellipse(bx + 205, by + 90, 34, 28, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = fur(extrem); g.beginPath(); g.ellipse(bx + 232, by + 92, 10, 9, 0, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(bx + 200, by + 40, 8, 26, -0.2, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(bx + 215, by + 42, 8, 26, 0.2, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(bx + 40, by + 115, 14, 12, 0, 0, Math.PI * 2); g.fill();
        g.fillRect(bx + 70, by + 160, 18, 24); g.fillRect(bx + 160, by + 160, 18, 24);
        if (p.shave) label(g, '❄ vùng lưng bị chườm lạnh → lông mọc lại màu đen', bx + 120, by + 205, { size: 10, color: '#93c5fd' });
        text(g, `Mút cơ thể ≈ ${extrem} °C, thân ≈ ${body} °C; enzyme tạo melanin chỉ hoạt động dưới ~33 °C`, bx, by + 228, { size: 10, color: COLORS.muted });
        // cẩm tú cầu
        const fx = Math.min(w * 0.5, bx + 340), fy = 90;
        text(g, 'Cẩm tú cầu theo pH đất', fx, 40, { size: 12.5, weight: '700' });
        const fc = mixColor('#3b82f6', '#ec4899', clamp((p.ph - 5) / 2.5, 0, 1));
        for (let i = 0; i < 18; i++) { const a = i * 2.39996; const r = 9 * Math.sqrt(i); circle(g, fx + 70 + Math.cos(a) * r, fy + 50 + Math.sin(a) * r, 9, fc, 'rgba(0,0,0,0.2)'); }
        text(g, p.ph < 6 ? 'đất chua → hoa xanh lam' : p.ph > 7 ? 'đất kiềm → hoa hồng' : 'trung tính → tím', fx + 70, fy + 120, { size: 11, align: 'center', color: COLORS.muted });
        // mức phản ứng lúa
        const px = 60, py = by + 260, pw = w - 100, ph = h - py - 50;
        if (ph > 80) {
          const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: 100, ymin: 0, ymax: 10, xlabel: 'mức chăm sóc (%)', ylabel: 'tấn/ha', title: 'Mức phản ứng năng suất của hai giống lúa' });
          const yieldOf = (c, max) => 2 + (max - 2) * (1 - Math.exp(-c / 35));
          const g1 = [], g2 = []; for (let c = 0; c <= 100; c += 2) { g1.push([P.X(c), P.Y(yieldOf(c, 9))]); g2.push([P.X(c), P.Y(yieldOf(c, 5.5))]); }
          polyline(g, g1, '#4ade80', 2.5); polyline(g, g2, '#fbbf24', 2.5);
          circle(g, P.X(p.care), P.Y(yieldOf(p.care, 9)), 5, '#4ade80'); circle(g, P.X(p.care), P.Y(yieldOf(p.care, 5.5)), 5, '#fbbf24');
          text(g, `giống tốt: ${yieldOf(p.care, 9).toFixed(1)} t/ha (trần 9)`, px + pw - 8, py + 20, { size: 10.5, align: 'right', color: '#4ade80' });
          text(g, `giống thường: ${yieldOf(p.care, 5.5).toFixed(1)} t/ha (trần 5,5)`, px + pw - 8, py + 36, { size: 10.5, align: 'right', color: '#fbbf24' });
        }
      },
      metrics(p) { return [['Nhiệt độ', `${p.temp} °C`], ['Màu hoa', p.ph < 6 ? 'xanh lam' : p.ph > 7 ? 'hồng' : 'tím'], ['Chăm sóc', `${p.care} %`]]; }
    };
  }
};
