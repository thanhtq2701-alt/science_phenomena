import { COLORS, text, label, testTube, flame, bar, Bubbles, line } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'chem-ester-hydrolysis',
  subject: 'chem',
  chapter: 'ester-lipid',
  title: 'Thủy phân ester: môi trường acid vs. xà phòng hóa',
  summary: 'So sánh hai ống nghiệm chứa ethyl acetate đun với H2SO4 loãng (thuận nghịch, còn lớp ester) và với NaOH (một chiều, lớp ester biến mất).',
  equation: ['CH3COOC2H5 + H2O ⇌ CH3COOH + C2H5OH  (H+, t°)', 'CH3COOC2H5 + NaOH → CH3COONa + C2H5OH  (t°)', 'Chất béo: (RCOO)3C3H5 + 3NaOH → 3RCOONa + C3H5(OH)3  (xà phòng + glycerol)'],
  keywords: ['xà phòng hóa', 'thủy phân', 'ester', 'chất béo', 'NaOH'],
  theory: [
    'Trong **môi trường acid**, thủy phân ester là phản ứng **thuận nghịch**: sau khi đun vẫn còn một lớp ester nổi phía trên.',
    'Trong **môi trường kiềm** (NaOH), acid tạo thành bị trung hòa thành muối nên phản ứng **một chiều** và hoàn toàn: lớp ester biến mất, dung dịch đồng nhất. Phản ứng này gọi là **xà phòng hóa** vì áp dụng cho chất béo sẽ thu được xà phòng (muối sodium của acid béo).',
    'Đun nóng chỉ làm phản ứng **nhanh hơn**, không thay đổi bản chất thuận nghịch hay một chiều.'
  ],
  observe: ['Giảm nhiệt độ xuống 25 °C: cả hai ống gần như không đổi trong thời gian mô phỏng.', 'Bật "chất béo + NaOH": thấy lớp dầu mất dần và xuất hiện bọt xà phòng.'],
  exam: ['Nhận biết ester/chất béo bằng phản ứng xà phòng hóa; viết PTHH thủy phân chất béo.', 'Giải thích vì sao ống NaOH không còn lớp ester còn ống acid thì có.'],
  quiz: {
    question: 'Đun ethyl acetate với H2SO4 loãng (ống 1) và với dung dịch NaOH (ống 2). Sau một thời gian, lớp ester nổi phía trên còn ở ống nào?',
    options: ['Chỉ còn ở ống H2SO4 loãng', 'Chỉ còn ở ống NaOH', 'Còn ở cả hai ống', 'Mất hết ở cả hai ống'],
    answer: 0,
    explanation: 'Trong môi trường acid, thủy phân ester là phản ứng thuận nghịch nên vẫn còn ester. Trong NaOH, acid sinh ra bị trung hòa thành muối nên phản ứng một chiều (xà phòng hóa), lớp ester biến mất.'
  },
  params: [
    { key: 'temp', label: 'Nhiệt độ', min: 25, max: 100, step: 5, value: 80, unit: '°C' },
    { key: 'sub', label: 'Chất đem thủy phân', type: 'select', value: 'ester', options: [['ester', 'Ethyl acetate'], ['fat', 'Chất béo (tristearin)']] }
  ],
  create() {
    const st = { a: 1, b: 1, bub: new Bubbles(), foam: [] };
    return {
      update(dt, p, t) {
        const k = 0.05 * Math.exp((p.temp - 25) / 22) * (p.sub === 'fat' ? 0.6 : 1);
        // acid: tiến về cân bằng 0.35 ester còn lại; base: về 0
        st.a += (0.35 - st.a) * (1 - Math.exp(-k * dt));
        st.b += (0 - st.b) * (1 - Math.exp(-k * 1.5 * dt));
        if (p.temp > 60) { st.bub.spawn(200, 330, Math.random() < (p.temp - 60) / 80 ? 1 : 0); st.bub.spawn(440, 330, Math.random() < (p.temp - 60) / 80 ? 1 : 0); }
        st.bub.update(dt, 200);
        if (p.sub === 'fat' && st.b < 0.7 && Math.random() < 0.15) st.foam.push({ x: 405 + Math.random() * 70, y: 215, r: 3 + Math.random() * 5, life: 1 });
        for (const f of st.foam) f.life -= dt * 0.15;
        st.foam = st.foam.filter((f) => f.life > 0);
      },
      draw(g, w, h, p, t) {
        const s = clamp(w / 900, 0.6, 1);
        const tubes = [
          { x: 160, title: 'Ống 1: + H2SO4 loãng', frac: st.a, liquid: '#bfdbfe', note: 'thuận nghịch' },
          { x: 400, title: 'Ống 2: + NaOH', frac: st.b, liquid: '#c7d2fe', note: 'một chiều' }
        ];
        text(g, p.sub === 'fat' ? 'Chất béo (dầu) + dung dịch, đun cách thủy' : 'Ethyl acetate + dung dịch, đun cách thủy', 20, 30, { size: 14, weight: '700' });
        for (const tb of tubes) {
          const tw = 80, th = 240, ty = 100;
          const r = testTube(g, tb.x, ty, tw, th, 0.7, tb.liquid, { title: tb.title });
          // lớp ester/dầu nổi
          const layerH = 40 * tb.frac;
          if (layerH > 0.5) {
            g.fillStyle = p.sub === 'fat' ? 'rgba(250,204,21,0.8)' : 'rgba(254,240,138,0.85)';
            g.fillRect(tb.x + 1, r.top, tw - 2, layerH);
            line(g, tb.x + 1, r.top + layerH, tb.x + tw - 1, r.top + layerH, 'rgba(255,255,255,0.4)', 1);
          }
          label(g, `ester còn ${Math.round(tb.frac * 100)}%`, tb.x + tw / 2, r.top - 18, { size: 11 });
          label(g, tb.note, tb.x + tw / 2, ty + th + 36, { size: 11, color: COLORS.muted });
          if (p.temp > 40) flame(g, tb.x + tw / 2, ty + th + 58, 0.5 + (p.temp - 40) / 120, '#fbbf24', t);
        }
        for (const f of st.foam) { g.globalAlpha = f.life; g.strokeStyle = '#fff'; g.beginPath(); g.arc(f.x, f.y - (1 - f.life) * 20, f.r, 0, 6.3); g.stroke(); }
        g.globalAlpha = 1;
        st.bub.draw(g);
        // Bảng so sánh bên phải
        if (w > 700) {
          const bx = 600, by = 110;
          text(g, 'So sánh', bx, by, { size: 14, weight: '700' });
          const rows = [['Môi trường', 'Acid (H+)', 'Kiềm (OH⁻)'], ['Chiều phản ứng', 'thuận nghịch', 'một chiều'], ['Sản phẩm', 'acid + alcohol', 'muối + alcohol'], ['Lớp ester sau đun', 'còn', 'hết'], ['Ứng dụng', '—', 'nấu xà phòng']];
          rows.forEach((r, i) => {
            const y = by + 30 + i * 26;
            text(g, r[0], bx, y, { size: 12, color: COLORS.muted });
            text(g, r[1], bx + 130, y, { size: 12 });
            text(g, r[2], bx + 230, y, { size: 12, color: COLORS.chem });
          });
          bar(g, bx, by + 190, 280, 10, 1 - st.a, '#60a5fa', 'Ống 1 đã thủy phân');
          bar(g, bx, by + 230, 280, 10, 1 - st.b, COLORS.chem, 'Ống 2 đã thủy phân');
        }
      },
      metrics(p) { return [['Ester còn lại – ống acid', `${(st.a * 100).toFixed(0)} %`], ['Ester còn lại – ống NaOH', `${(st.b * 100).toFixed(0)} %`], ['Nhiệt độ', `${p.temp} °C`]]; }
    };
  }
};
