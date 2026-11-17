import { COLORS, text, label, beaker, circle, line, roundRect, flame, Bubbles, mixColor, withAlpha, bar, plot, polyline } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const SALTS = {
  NaHCO3: { name: 'NaHCO3 (baking soda)', T: 100, eq: '2NaHCO3 →(t°) Na2CO3 + CO2↑ + H2O', note: 'phân hủy ngay từ ~100 °C → dùng làm bột nở', product: 'Na2CO3' },
  MgCO3: { name: 'MgCO3', T: 350, eq: 'MgCO3 →(t°) MgO + CO2↑', note: 'kém bền nhất trong muối carbonate IIA', product: 'MgO' },
  CaCO3: { name: 'CaCO3 (đá vôi)', T: 900, eq: 'CaCO3 →(t°) CaO + CO2↑', note: 'nung vôi ở ~900–1000 °C', product: 'CaO (vôi sống)' },
  BaCO3: { name: 'BaCO3', T: 1300, eq: 'BaCO3 →(t°) BaO + CO2↑', note: 'bền nhiệt nhất: độ bền tăng dần Mg < Ca < Sr < Ba', product: 'BaO' },
  Na2CO3: { name: 'Na2CO3 (soda)', T: 99999, eq: 'Na2CO3: không phân hủy khi nung (bền nhiệt)', note: 'muối carbonate kim loại kiềm rất bền nhiệt', product: '—' }
};

export default {
  id: 'chem-carbonate-decomp',
  subject: 'chem',
  chapter: 'group-ia-iia',
  title: 'Nhiệt phân muối carbonate, hydrogencarbonate',
  summary: 'Nung các muối carbonate: NaHCO3 phân hủy từ 100 °C, MgCO3 ở 350 °C, CaCO3 ở 900 °C, Na2CO3 không phân hủy. CO2 sinh ra làm đục nước vôi trong.',
  equation: ['2NaHCO3 →(t°) Na2CO3 + CO2 + H2O', 'CaCO3 →(t° ≈ 900 °C) CaO + CO2', 'CO2 + Ca(OH)2 → CaCO3↓ + H2O ; CaCO3 + CO2 + H2O → Ca(HCO3)2 (dư CO2, trong lại)'],
  keywords: ['nhiệt phân', 'carbonate', 'hydrogencarbonate', 'nung vôi', 'CaCO3', 'NaHCO3', 'độ bền nhiệt', 'nước vôi trong', 'bột nở'],
  theory: [
    'Muối **carbonate của kim loại kiềm** (Na2CO3, K2CO3) **bền với nhiệt**, không phân hủy khi nung. Muối **hydrogencarbonate** (NaHCO3, Ca(HCO3)2) **kém bền**, phân hủy ngay khi đun nhẹ tạo carbonate + CO2 + H2O.',
    'Muối carbonate của **kim loại kiềm thổ** phân hủy khi nung mạnh tạo oxide + CO2; **độ bền nhiệt tăng dần** MgCO3 < CaCO3 < SrCO3 < BaCO3 (ion kim loại càng lớn, càng ít phân cực ion CO3 2−).',
    'Ứng dụng: **nung vôi** (CaCO3 → CaO) sản xuất vôi, xi măng; NaHCO3 làm **bột nở, thuốc giảm đau dạ dày**; nhận biết CO2 bằng **nước vôi trong** (đục rồi trong lại nếu CO2 dư).'
  ],
  observe: ['Nâng nhiệt độ dần, ghi nhiệt độ bắt đầu sủi bọt với từng muối.', 'Na2CO3: tới 1500 °C vẫn không có khí.', 'Sục CO2 lâu vào nước vôi: đục rồi trong lại (tạo Ca(HCO3)2 tan).'],
  exam: ['So sánh độ bền nhiệt; viết PTHH nhiệt phân; tính khối lượng chất rắn giảm sau nung.', 'Bài toán CO2 + Ca(OH)2 (tạo 1 hoặc 2 muối).'],
  params: [
    { key: 'salt', label: 'Muối đem nung', type: 'select', value: 'CaCO3', options: Object.entries(SALTS).map(([k, v]) => [k, v.name]) },
    { key: 'temp', label: 'Nhiệt độ nung', min: 25, max: 1500, step: 25, value: 600, unit: '°C' },
    { key: 'mass', label: 'Khối lượng muối', min: 1, max: 20, step: 1, value: 10, unit: 'g' }
  ],
  create() {
    const st = { prog: 0, cloud: 0, bub: new Bubbles(), co2: 0 };
    return {
      onParam(k) { if (k === 'salt' || k === 'mass') { st.prog = 0; st.cloud = 0; st.co2 = 0; } },
      update(dt, p) {
        const s = SALTS[p.salt];
        const rate = p.temp >= s.T ? 0.1 * (1 + (p.temp - s.T) / 400) : 0;
        const d = Math.min(1 - st.prog, rate * dt);
        st.prog += d;
        if (d > 0 && st.geo && Math.random() < 0.8) st.bub.spawn(st.geo.x, st.geo.y, 1, { spread: 40 });
        if (st.geo) st.bub.update(dt, st.geo.top);
        // sục CO2 lâu → đục rồi trong lại
        st.co2 += d;
        st.cloud = st.co2 < 0.6 ? clamp(st.co2 * 2, 0, 1) : clamp(1 - (st.co2 - 0.6) * 2.5, 0, 1);
      },
      draw(g, w, h, p, t) {
        const s = SALTS[p.salt];
        // ống nghiệm nằm ngang / chén nung
        const bx = 40, by = 150, bw = 220, bh = 60;
        g.fillStyle = 'rgba(148,163,184,0.1)'; roundRect(g, bx, by, bw, bh, 20); g.fill(); g.strokeStyle = COLORS.glass; g.lineWidth = 2.5; g.stroke();
        const solidCol = mixColor('#f8fafc', p.salt === 'CaCO3' || p.salt === 'BaCO3' || p.salt === 'MgCO3' ? '#fef3c7' : '#f1f5f9', st.prog);
        g.fillStyle = solidCol; roundRect(g, bx + 20, by + 25, 90 * (1 - st.prog * 0.4), 28, 6); g.fill();
        text(g, st.prog > 0.7 ? s.product : p.salt, bx + 60, by + 44, { size: 11, align: 'center', color: '#0b1020', weight: '800' });
        flame(g, bx + 60, by + bh + 50, 0.5 + p.temp / 1500, p.temp > 900 ? '#ef4444' : '#fbbf24', t); label(g, `${p.temp} °C`, bx + 60, by + bh + 68, { size: 11 });
        // ống dẫn → nước vôi
        const lx = bx + bw + 60, ly = 90, lw = 110, lh = 170;
        line(g, bx + bw, by + bh / 2, lx + lw / 2, by + bh / 2, '#94a3b8', 3); line(g, lx + lw / 2, by + bh / 2, lx + lw / 2, ly + lh - 30, '#94a3b8', 3);
        const r = beaker(g, lx, ly, lw, lh, 0.7, '#e0f2fe', { title: 'nước vôi trong', surface: false });
        st.geo = { x: lx + lw / 2, y: ly + lh - 30, top: r.top };
        g.fillStyle = `rgba(241,245,249,${st.cloud * 0.9})`; g.fillRect(lx + 2, r.top, lw - 4, ly + lh - r.top - 2);
        st.bub.draw(g);
        label(g, st.co2 > 0.9 ? 'trong lại: CaCO3 + CO2 + H2O → Ca(HCO3)2' : st.cloud > 0.3 ? 'vẩn đục CaCO3 → có CO2' : st.prog > 0 ? 'bắt đầu đục' : p.temp >= s.T ? '' : 'chưa có khí', lx + lw / 2, ly - 14, { size: 10.5 });
        if (p.temp < s.T && s.T < 99999) label(g, `cần ≥ ${s.T} °C`, bx + bw / 2, by - 16, { size: 11, color: COLORS.warn });
        if (s.T >= 99999) label(g, 'bền nhiệt – không phân hủy', bx + bw / 2, by - 16, { size: 11, color: COLORS.muted });
        // bảng phải
        const rx = Math.max(lx + lw + 50, w * 0.55), rw = w - rx - 30;
        if (rw > 180) {
          text(g, 'Nhiệt độ phân hủy', rx, 70, { size: 13, weight: '700' });
          const list = Object.entries(SALTS).filter(([k]) => k !== 'Na2CO3');
          list.forEach(([k, v], i) => { const y = 95 + i * 34; const sel = k === p.salt; text(g, k, rx, y + 10, { size: 11.5, color: sel ? COLORS.text : COLORS.muted, weight: sel ? '800' : '500' }); bar(g, rx + 80, y + 2, rw - 80, 10, v.T / 1500, sel ? '#f97316' : 'rgba(148,163,184,0.5)'); text(g, `${v.T} °C`, rx + rw, y + 24, { size: 9.5, align: 'right', color: COLORS.muted }); });
          text(g, 'Na2CO3, K2CO3: không phân hủy', rx, 240, { size: 11, color: COLORS.muted });
          const px = rx + ((p.temp / 1500) * (rw - 80)) + 80; line(g, px, 90, px, 232, '#fbbf24', 1.5, [4, 3]);
          text(g, s.eq, rx, 280, { size: 11.5, color: COLORS.text });
          wrap(g, s.note, rx, 304, rw, 11, COLORS.muted);
          if (s.T < 99999) { const M = { NaHCO3: 84, MgCO3: 84, CaCO3: 100, BaCO3: 197 }[p.salt]; const nCO2 = p.salt === 'NaHCO3' ? p.mass / M / 2 : p.mass / M; text(g, `CO2 tối đa: ${(nCO2 * 1000).toFixed(0)} mmol = ${(nCO2 * 24.79).toFixed(2)} L (đkc); đã sinh ${Math.round(st.prog * 100)}%`, rx, 350, { size: 11, color: COLORS.warn }); }
        }
      },
      metrics(p) { const s = SALTS[p.salt]; return [['Nhiệt độ phân hủy', s.T < 99999 ? `${s.T} °C` : 'không'], ['Đã phân hủy', `${Math.round(st.prog * 100)} %`], ['Nước vôi', st.cloud > 0.3 ? 'đục' : st.co2 > 0.9 ? 'trong lại' : 'trong']]; }
    };
  }
};
function wrap(g, str, x, y, maxW, size, color) { g.font = `500 ${size}px Inter, system-ui, sans-serif`; const words = str.split(' '); let line = '', yy = y; for (const wd of words) { const tt = line + wd + ' '; if (g.measureText(tt).width > maxW && line) { text(g, line, x, yy, { size, color }); line = wd + ' '; yy += size + 6; } else line = tt; } text(g, line, x, yy, { size, color }); }
