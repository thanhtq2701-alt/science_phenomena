import { COLORS, text, label, circle, roundRect, arrow } from '../../core/draw.js';

export default {
  id: 'bio-extranuclear',
  subject: 'bio',
  chapter: 'mendel',
  title: 'Di truyền ngoài nhân (di truyền theo dòng mẹ)',
  summary: 'Lai thuận nghịch cây hoa phấn lá đốm của Correns: kiểu hình đời con luôn giống cây mẹ vì gene trong lục lạp/ti thể nằm ở tế bào chất của trứng, tinh trùng/hạt phấn hầu như không góp tế bào chất.',
  equation: ['Lai thuận: ♀ lá xanh × ♂ lá đốm → F1 100% lá xanh', 'Lai nghịch: ♀ lá đốm × ♂ lá xanh → F1 lá đốm (hoặc trắng/xanh tùy lục lạp nhận được)', 'Kết quả lai thuận ≠ lai nghịch → gene ngoài nhân'],
  keywords: ['di truyền ngoài nhân', 'di truyền tế bào chất', 'theo dòng mẹ', 'lai thuận nghịch', 'lục lạp', 'ti thể', 'Correns', 'hoa phấn'],
  theory: [
    'Ngoài nhân, **ti thể** và **lục lạp** cũng chứa DNA (dạng vòng) mang gene. Khi thụ tinh, giao tử đực hầu như chỉ truyền nhân, còn **tế bào chất của hợp tử chủ yếu là của trứng** → các gene ngoài nhân được di truyền **theo dòng mẹ**.',
    'Dấu hiệu nhận biết: **lai thuận và lai nghịch cho kết quả khác nhau**, và đời con luôn có kiểu hình giống mẹ. Khác với gene liên kết giới tính (kết quả khác nhau theo giới đực/cái).',
    'Ví dụ: tính trạng lá đốm ở cây hoa phấn (*Mirabilis jalapa*), một số bệnh ti thể ở người (bệnh thần kinh thị giác Leber) chỉ truyền từ mẹ. Ứng dụng: tạo dòng bất thụ đực tế bào chất trong sản xuất hạt lai.'
  ],
  observe: ['Đảo vai trò bố mẹ: đời con luôn theo cây mẹ.', 'Phóng to giao tử: trứng có nhiều lục lạp, hạt phấn chỉ có nhân.'],
  exam: ['Phân biệt di truyền ngoài nhân với di truyền liên kết giới tính và gene trong nhân qua phép lai thuận nghịch.'],
  params: [
    { key: 'mom', label: 'Cây mẹ (♀)', type: 'select', value: 'green', options: [['green', 'Lá xanh'], ['var', 'Lá đốm'], ['white', 'Lá trắng']] },
    { key: 'dad', label: 'Cây bố (♂)', type: 'select', value: 'var', options: [['green', 'Lá xanh'], ['var', 'Lá đốm'], ['white', 'Lá trắng']] }
  ],
  create() {
    return {
      update() {},
      draw(g, w, h, p, t) {
        const leaf = (x, y, type, s = 1) => {
          g.save(); g.translate(x, y); g.scale(s, s);
          g.fillStyle = type === 'white' ? '#f1f5f9' : '#22c55e'; g.beginPath(); g.ellipse(0, 0, 30, 16, -0.4, 0, Math.PI * 2); g.fill();
          if (type === 'var') { g.fillStyle = '#f8fafc'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(-16 + i * 8, (i % 2 ? -4 : 5), 5, 3, 0, 0, Math.PI * 2); g.fill(); } }
          g.restore();
        };
        const nm = { green: 'xanh', var: 'đốm', white: 'trắng' };
        const cx = w / 2;
        text(g, `P: ♀ lá ${nm[p.mom]}  ×  ♂ lá ${nm[p.dad]}`, cx, 36, { size: 14, align: 'center', weight: '700' });
        leaf(cx - 160, 90, p.mom, 1.4); leaf(cx + 160, 90, p.dad, 1.4);
        text(g, '♀ mẹ', cx - 160, 130, { size: 11, align: 'center', color: '#f472b6' }); text(g, '♂ bố', cx + 160, 130, { size: 11, align: 'center', color: '#60a5fa' });
        // giao tử
        const chloro = (type) => type === 'green' ? ['#22c55e'] : type === 'white' ? ['#e2e8f0'] : ['#22c55e', '#e2e8f0'];
        circle(g, cx - 160, 200, 40, 'rgba(244,114,182,0.12)', '#f472b6', 2); circle(g, cx - 160, 200, 12, 'rgba(148,163,184,0.4)');
        const cm = chloro(p.mom); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.2; g.fillStyle = cm[i % cm.length]; g.beginPath(); g.ellipse(cx - 160 + Math.cos(a) * 27, 200 + Math.sin(a) * 27, 6, 3.5, a, 0, Math.PI * 2); g.fill(); }
        text(g, 'trứng: nhân + nhiều lục lạp', cx - 160, 258, { size: 10.5, align: 'center', color: COLORS.muted });
        circle(g, cx + 160, 200, 14, 'rgba(96,165,250,0.15)', '#60a5fa', 2); circle(g, cx + 160, 200, 8, 'rgba(148,163,184,0.5)');
        text(g, 'hạt phấn: gần như chỉ có nhân', cx + 160, 258, { size: 10.5, align: 'center', color: COLORS.muted });
        arrow(g, cx - 110, 210, cx - 30, 290, '#f472b6', 2); arrow(g, cx + 140, 216, cx + 30, 290, '#60a5fa', 2);
        // F1
        circle(g, cx, 320, 34, 'rgba(74,222,128,0.1)', '#4ade80', 2); circle(g, cx, 320, 11, 'rgba(148,163,184,0.5)');
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.2; g.fillStyle = cm[i % cm.length]; g.beginPath(); g.ellipse(cx + Math.cos(a) * 23, 320 + Math.sin(a) * 23, 5, 3, a, 0, Math.PI * 2); g.fill(); }
        text(g, 'hợp tử: lục lạp đều từ mẹ', cx, 372, { size: 10.5, align: 'center', color: COLORS.muted });
        leaf(cx, 410, p.mom, 1.2);
        label(g, `F1: 100% lá ${nm[p.mom]} – giống MẸ`, cx, h - 22, { size: 13, color: '#4ade80' });
        if (w > 760) { const rx = w - 240; text(g, 'Lai thuận nghịch', rx, 300, { size: 12, weight: '700' }); text(g, '♀ xanh × ♂ đốm → xanh', rx, 322, { size: 11, color: COLORS.muted }); text(g, '♀ đốm × ♂ xanh → đốm', rx, 342, { size: 11, color: COLORS.muted }); text(g, 'Kết quả khác nhau →', rx, 366, { size: 11, color: COLORS.warn }); text(g, 'gene nằm ngoài nhân', rx, 384, { size: 11, color: COLORS.warn }); }
      },
      metrics(p) { return [['Kiểu hình F1', { green: 'lá xanh', var: 'lá đốm', white: 'lá trắng' }[p.mom]], ['Quyết định bởi', 'tế bào chất của mẹ']]; }
    };
  }
};
