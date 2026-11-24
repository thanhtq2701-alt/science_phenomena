import { COLORS, text, label, beaker, roundRect, circle, line, arrow, withAlpha, Bubbles, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'chem-corrosion',
  subject: 'chem',
  chapter: 'metals',
  title: 'Ăn mòn điện hóa và bảo vệ kim loại',
  summary: 'Cặp Fe–Cu trong dung dịch muối tạo pin điện hóa nhỏ làm sắt gỉ nhanh; gắn Zn (anode hi sinh) thì Zn bị ăn mòn thay cho sắt.',
  equation: ['Anode (Fe): Fe → Fe2+ + 2e', 'Cathode (Cu): O2 + 2H2O + 4e → 4OH−', '4Fe(OH)2 + O2 + 2H2O → 4Fe(OH)3 → gỉ sắt Fe2O3·nH2O', 'Bảo vệ: Zn → Zn2+ + 2e (Zn hi sinh, Fe là cathode được bảo vệ)'],
  keywords: ['ăn mòn điện hóa', 'gỉ sắt', 'anode hi sinh', 'bảo vệ kim loại', 'Fe-Cu', 'Zn'],
  theory: [
    '**Ăn mòn điện hóa** xảy ra khi có **hai kim loại khác nhau (hoặc kim loại – tạp chất) tiếp xúc** và cùng nhúng trong **dung dịch chất điện li**. Kim loại mạnh hơn là anode bị oxi hóa (tan), kim loại yếu hơn là cathode nơi O2 (hoặc H+) nhận electron.',
    'Ăn mòn điện hóa **nhanh hơn nhiều** so với ăn mòn hóa học vì electron được chuyển qua kim loại, không cần va chạm trực tiếp. Nước biển (nhiều ion) làm ăn mòn nhanh hơn nước tinh khiết.',
    '**Bảo vệ bằng anode hi sinh**: gắn Zn/Mg vào vỏ tàu, đường ống thép. Zn mạnh hơn Fe nên Zn tan thay sắt. Ngoài ra còn sơn phủ, mạ, tạo hợp kim không gỉ.'
  ],
  observe: ['So sánh ba trường hợp: Fe đơn độc, Fe–Cu, Fe–Zn trong cùng điều kiện.', 'Giảm nồng độ muối về 0 (nước cất): tốc độ ăn mòn giảm mạnh.', 'Tắt O2 (dung dịch đã đuổi khí): ăn mòn gần như dừng.'],
  exam: ['Xác định điện cực nào bị ăn mòn trong cặp kim loại; điều kiện ăn mòn điện hóa.', 'Giải thích vì sao gắn Zn lên vỏ tàu bảo vệ được thép.'],
  quiz: {
    question: 'Thanh sắt tiếp xúc với đồng, cùng nhúng trong nước muối có O2 hòa tan. So với thanh sắt đứng riêng, sắt bị gỉ thế nào?',
    options: ['Chậm hơn vì đồng che chắn cho sắt', 'Nhanh hơn vì tạo pin điện hóa, sắt là cực âm bị oxi hóa', 'Như nhau', 'Sắt không gỉ, đồng bị ăn mòn thay'],
    answer: 1,
    explanation: 'Fe và Cu tiếp xúc trong dung dịch điện li tạo pin điện hóa: Fe mạnh hơn làm anode (cực âm) bị oxi hóa, O2 nhận electron ở Cu. Ăn mòn điện hóa nhanh hơn nhiều so với sắt đứng riêng.'
  },
  params: [
    { key: 'pair', label: 'Vật liệu', type: 'select', value: 'fecu', options: [['fe', 'Chỉ Fe'], ['fecu', 'Fe tiếp xúc Cu'], ['fezn', 'Fe tiếp xúc Zn (anode hi sinh)']] },
    { key: 'salt', label: 'Nồng độ NaCl', min: 0, max: 5, step: 0.5, value: 3, unit: '%', decimals: 1 },
    { key: 'o2', label: 'Có O2 hòa tan', type: 'toggle', value: true }
  ],
  create() {
    const st = { rustFe: 0, lossZn: 0, el: 0, bub: new Bubbles() };
    return {
      onParam() { st.rustFe = 0; st.lossZn = 0; },
      update(dt, p) {
        const cond = (0.1 + p.salt / 5) * (p.o2 ? 1 : 0.05);
        const rateFe = p.pair === 'fecu' ? 0.12 : p.pair === 'fe' ? 0.03 : 0.003;
        const rateZn = p.pair === 'fezn' ? 0.1 : 0;
        st.rustFe = clamp(st.rustFe + rateFe * cond * dt, 0, 1);
        st.lossZn = clamp(st.lossZn + rateZn * cond * dt, 0, 1);
        st.el = (st.el + dt * (p.pair === 'fe' ? 0 : cond * 1.5)) % 1;
      },
      draw(g, w, h, p, t) {
        const bx = 60, by = 90, bw = Math.min(380, w * 0.5), bh = 250;
        const rustTint = withAlpha('#b45309', 0.08 + st.rustFe * 0.35);
        beaker(g, bx, by, bw, bh, 0.78, p.salt > 0 ? 'rgba(96,165,250,0.18)' : 'rgba(226,232,240,0.12)', { title: p.salt > 0 ? `dung dịch NaCl ${p.salt}%` : 'nước cất' });
        g.fillStyle = rustTint; g.fillRect(bx + 2, by + bh - 0.78 * (bh - 10), bw - 4, 0.78 * (bh - 10) - 2);
        // thanh Fe
        const fx = bx + bw * 0.4, fy = by + 50, fw = 60, fh = 150;
        g.fillStyle = '#78716c'; roundRect(g, fx - fw / 2, fy, fw, fh, 4); g.fill();
        text(g, 'Fe', fx, fy + fh / 2, { size: 14, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' });
        // gỉ
        for (let i = 0; i < 24; i++) { const seed = i * 7.3; const rx = fx - fw / 2 + ((seed * 13) % fw), ry = fy + ((seed * 29) % fh); const r = 6 * st.rustFe * (0.5 + ((seed * 3) % 10) / 10); if (r > 0.5) circle(g, rx, ry, r, withAlpha('#b45309', 0.85)); }
        // kim loại thứ hai
        if (p.pair !== 'fe') {
          const isZn = p.pair === 'fezn';
          const ox = fx + fw / 2 + 18, ow = 36 * (1 - 0.5 * st.lossZn), oh = 110;
          g.fillStyle = isZn ? '#94a3b8' : '#d97706'; roundRect(g, ox, fy + 20, ow, oh, 4); g.fill();
          text(g, isZn ? 'Zn' : 'Cu', ox + ow / 2, fy + 20 + oh / 2, { size: 13, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' });
          line(g, fx + fw / 2, fy + 30, ox, fy + 30, '#e2e8f0', 3);
          // electron chuyển: từ anode sang cathode
          const from = isZn ? ox : fx + fw / 2, to = isZn ? fx + fw / 2 : ox;
          const ex = from + (to - from) * st.el;
          circle(g, ex, fy + 30, 4, '#fbbf24'); text(g, 'e⁻', ex, fy + 20, { size: 9, align: 'center', color: '#fde68a' });
          label(g, isZn ? 'Zn: anode (tan)' : 'Cu: cathode', ox + ow / 2, fy + 20 + oh + 18, { size: 10.5, color: isZn ? '#f87171' : '#60a5fa' });
          label(g, isZn ? 'Fe: cathode (được bảo vệ)' : 'Fe: anode (gỉ)', fx, fy + fh + 18, { size: 10.5, color: isZn ? '#60a5fa' : '#f87171' });
          // O2 nhận e tại cathode
          if (p.o2) { const cxx = isZn ? fx - fw / 2 - 20 : ox + ow + 20; const yy = fy + 60 + Math.sin(t * 2) * 10; circle(g, cxx, yy, 7, '#38bdf8'); text(g, 'O₂', cxx, yy - 11, { size: 9, align: 'center', color: '#7dd3fc' }); text(g, '+2H₂O+4e → 4OH⁻', cxx, yy + 22, { size: 8.5, align: 'center', color: COLORS.muted }); }
        } else {
          label(g, 'Fe đơn độc: ăn mòn hóa học, chậm', fx, fy + fh + 18, { size: 10.5, color: COLORS.muted });
        }
        if (!p.o2) label(g, 'không có O2 → gần như không ăn mòn', bx + bw / 2, by - 14, { size: 11, color: COLORS.muted });
        // Bên phải: thanh so sánh
        const rx = bx + bw + 40, rw = w - rx - 30;
        if (rw > 160) {
          text(g, 'Mức độ ăn mòn', rx, 110, { size: 14, weight: '700' });
          bar(g, rx, 150, rw, 12, st.rustFe, '#b45309', `Fe bị gỉ: ${Math.round(st.rustFe * 100)}%`);
          if (p.pair === 'fezn') bar(g, rx, 200, rw, 12, st.lossZn, '#94a3b8', `Zn bị tan: ${Math.round(st.lossZn * 100)}%`);
          const notes = p.pair === 'fecu' ? ['Fe mạnh hơn Cu → Fe là anode, bị oxi hóa.', 'Electron chạy sang Cu, O2 nhận e ở đó.', 'Ăn mòn nhanh hơn Fe đơn độc.'] : p.pair === 'fezn' ? ['Zn mạnh hơn Fe → Zn là anode, tan thay Fe.', 'Fe trở thành cathode, được bảo vệ.', 'Ứng dụng: gắn Zn vào vỏ tàu biển.'] : ['Chỉ có ăn mòn hóa học: Fe + O2 + H2O → gỉ.', 'Chậm vì không có cặp điện cực.'];
          notes.forEach((n, i) => text(g, n, rx, 250 + i * 22, { size: 12, color: COLORS.muted }));
          text(g, 'Điều kiện ăn mòn điện hóa:', rx, 340, { size: 12, weight: '700' });
          ['① 2 điện cực khác bản chất', '② tiếp xúc trực tiếp / qua dây dẫn', '③ cùng trong dung dịch điện li'].forEach((n, i) => text(g, n, rx, 362 + i * 20, { size: 11.5, color: COLORS.muted }));
        }
      },
      metrics(p) { return [['Fe bị gỉ', `${Math.round(st.rustFe * 100)} %`], ['Zn bị tan', `${Math.round(st.lossZn * 100)} %`], ['Kiểu ăn mòn', p.pair === 'fe' ? 'hóa học' : 'điện hóa'], ['Tốc độ tương đối', ((p.pair === 'fecu' ? 4 : p.pair === 'fe' ? 1 : 0.1) * (0.1 + p.salt / 5) * (p.o2 ? 1 : 0.05)).toFixed(2)]]; }
    };
  }
};
