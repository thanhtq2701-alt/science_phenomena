import { COLORS, text, label, testTube, flame, mixColor, Falling, circle, line } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'chem-glucose-tests',
  subject: 'chem',
  chapter: 'carbohydrate',
  title: 'Nhận biết glucose: Cu(OH)2 và phản ứng tráng bạc',
  summary: 'Ba thí nghiệm kinh điển: glucose hòa tan Cu(OH)2 thành dung dịch xanh lam (poly-alcohol), đun nóng tạo kết tủa đỏ gạch Cu2O, và tráng gương bạc với AgNO3/NH3 (nhóm –CHO).',
  equation: ['2C6H12O6 + Cu(OH)2 → (C6H11O6)2Cu + 2H2O   (xanh lam, nhiệt độ thường)', 'C5H11O5–CHO + 2Cu(OH)2 + NaOH → C5H11O5–COONa + Cu2O↓ (đỏ gạch) + 3H2O  (t°)', 'C5H11O5–CHO + 2[Ag(NH3)2]OH → C5H11O5–COONH4 + 2Ag↓ + 3NH3 + H2O  (t°)'],
  keywords: ['tráng bạc', 'tráng gương', 'Cu2O', 'đỏ gạch', 'glucose', 'aldehyde'],
  theory: [
    'Glucose có **nhiều nhóm –OH kề nhau** nên hòa tan Cu(OH)2 ở nhiệt độ thường tạo phức **xanh lam** (tính chất của poly-alcohol).',
    'Glucose có **nhóm –CHO** nên thể hiện tính khử: khử Cu(OH)2 (đun nóng) thành **Cu2O đỏ gạch**, khử [Ag(NH3)2]+ thành **Ag bám thành ống** (phản ứng tráng bạc/tráng gương).',
    'Fructose không có –CHO nhưng trong môi trường kiềm chuyển hóa thành glucose nên **cũng tráng bạc**. Saccharose không có –CHO và không chuyển hóa nên **không** tráng bạc (trừ khi thủy phân trước).'
  ],
  observe: ['Chọn thí nghiệm Cu(OH)2 rồi tăng nhiệt độ: màu chuyển xanh lam → vàng → đỏ gạch khi đun.', 'Tráng bạc: đun nhẹ 60–70 °C cho lớp bạc bám đều; đun sôi mạnh bạc tách thành bột đen.', 'Thử với saccharose: không có hiện tượng với thuốc thử Tollens.'],
  exam: ['Phân biệt glucose – fructose – saccharose – tinh bột bằng Cu(OH)2, AgNO3/NH3, I2.', 'Tính khối lượng Ag thu được: 1 mol glucose → 2 mol Ag.'],
  quiz: {
    question: 'Nhỏ dung dịch glucose vào Cu(OH)2 trong NaOH ở nhiệt độ thường, chưa đun. Hiện tượng là gì?',
    options: ['Không có hiện tượng gì', 'Xuất hiện ngay kết tủa đỏ gạch', 'Kết tủa tan, tạo dung dịch xanh lam', 'Có lớp bạc bám lên thành ống'],
    answer: 2,
    explanation: 'Glucose có nhiều nhóm –OH kề nhau nên hòa tan Cu(OH)2 tạo phức xanh lam ở nhiệt độ thường. Phải đun nóng thì nhóm –CHO mới khử Cu(OH)2 thành Cu2O đỏ gạch.'
  },
  params: [
    { key: 'test', label: 'Thí nghiệm', type: 'select', value: 'cuoh2', options: [['cuoh2', 'Cu(OH)2 trong NaOH'], ['ag', 'AgNO3/NH3 (Tollens)']] },
    { key: 'sugar', label: 'Chất thử', type: 'select', value: 'glucose', options: [['glucose', 'Glucose'], ['fructose', 'Fructose'], ['saccharose', 'Saccharose'], ['starch', 'Tinh bột']] },
    { key: 'temp', label: 'Nhiệt độ', min: 25, max: 100, step: 5, value: 25, unit: '°C' },
    { key: 'mol', label: 'Lượng chất thử', min: 0.1, max: 2, step: 0.1, value: 1, unit: 'mmol', decimals: 1 }
  ],
  create() {
    const st = { prog: 0, dissolve: 0, mirror: 0, fall: new Falling(), ag: [] };
    return {
      onParam(k) { if (k === 'test' || k === 'sugar') { st.prog = 0; st.dissolve = 0; st.mirror = 0; st.fall.list = []; st.ag = []; } },
      update(dt, p) {
        const reducing = p.sugar === 'glucose' || p.sugar === 'fructose';
        const polyol = p.sugar !== 'starch';
        if (p.test === 'cuoh2') {
          if (polyol) st.dissolve = clamp(st.dissolve + dt * 0.5, 0, 1);
          if (reducing && p.temp >= 60 && st.dissolve > 0.9) {
            const rate = 0.08 * (p.temp - 50) / 50;
            st.prog = clamp(st.prog + rate * dt, 0, 1);
            if (Math.random() < 0.5) st.fall.spawn(240, 190, 1, '#b91c1c', 2.2);
          }
        } else {
          if (reducing && p.temp >= 50) {
            const rate = 0.08 * (p.temp - 40) / 50;
            st.prog = clamp(st.prog + rate * dt, 0, 1);
            if (p.temp <= 80) st.mirror = clamp(st.mirror + rate * dt, 0, 1);
            else if (Math.random() < 0.6) st.fall.spawn(240, 190, 1, '#1f2937', 2);
          }
        }
        st.fall.update(dt, 330);
      },
      draw(g, w, h, p, t) {
        const tx = 200, ty = 80, tw = 80, th = 260;
        const reducing = p.sugar === 'glucose' || p.sugar === 'fructose';
        let liquid, precip = null;
        if (p.test === 'cuoh2') {
          // chưa tan: huyền phù xanh nhạt (Cu(OH)2 kết tủa); tan: xanh lam trong; đun: đỏ gạch
          const base = p.sugar === 'starch' ? '#7dd3fc' : mixColor('#93c5fd', '#1d4ed8', st.dissolve);
          liquid = mixColor(base, '#fb923c', st.prog * 0.6);
          if (p.sugar === 'starch') precip = '#60a5fa';
          if (st.prog > 0.05) precip = '#b91c1c';
        } else {
          liquid = 'rgba(226,232,240,0.35)';
          if (st.prog > 0.5 && p.temp > 80) precip = '#111827';
        }
        const r = testTube(g, tx, ty, tw, th, 0.65, liquid, { precipitate: precip, precipHeight: 6 + 20 * st.prog, title: p.test === 'cuoh2' ? 'Cu(OH)2/NaOH + ' + nameOf(p.sugar) : '[Ag(NH3)2]OH + ' + nameOf(p.sugar) });
        // gương bạc
        if (st.mirror > 0) {
          g.save();
          g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx, ty + th - tw / 2); g.arc(tx + tw / 2, ty + th - tw / 2, tw / 2, Math.PI, 0, true); g.lineTo(tx + tw, ty); g.closePath(); g.clip();
          const grd = g.createLinearGradient(tx, 0, tx + tw, 0);
          grd.addColorStop(0, `rgba(226,232,240,${0.9 * st.mirror})`); grd.addColorStop(0.5, `rgba(148,163,184,${0.5 * st.mirror})`); grd.addColorStop(1, `rgba(241,245,249,${0.9 * st.mirror})`);
          g.fillStyle = grd;
          g.fillRect(tx, r.top, tw, th);
          g.restore();
          label(g, 'lớp Ag bám thành ống (gương)', tx + tw / 2, ty - 16, { size: 11, color: '#e2e8f0' });
        }
        st.fall.draw(g);
        if (p.temp > 40) flame(g, tx + tw / 2, ty + th + 60, 0.5 + (p.temp - 40) / 120, '#fbbf24', t);
        label(g, `${p.temp} °C`, tx + tw / 2, ty + th + 76, { size: 11 });

        // Khung giải thích phải
        const bx = 340, by = 70;
        text(g, 'Quan sát', bx, by, { size: 14, weight: '700' });
        let msg = [];
        if (p.test === 'cuoh2') {
          if (p.sugar === 'starch') msg = ['Tinh bột không hòa tan Cu(OH)2:', 'vẫn là huyền phù xanh nhạt.'];
          else if (st.dissolve < 0.9) msg = ['Kết tủa Cu(OH)2 đang tan dần…'];
          else if (!reducing) msg = ['Dung dịch xanh lam trong suốt (phức poly-alcohol).', 'Đun nóng: KHÔNG có kết tủa đỏ gạch', '→ saccharose không có nhóm –CHO.'];
          else if (p.temp < 60) msg = ['Dung dịch xanh lam trong suốt', '→ có nhiều –OH kề nhau.', 'Hãy đun nóng để thử tính khử!'];
          else msg = ['Đun nóng: xuất hiện kết tủa ĐỎ GẠCH Cu2O', '→ có nhóm –CHO (tính khử).', `Tiến độ: ${Math.round(st.prog * 100)}%`];
        } else {
          if (!reducing) msg = ['Không có hiện tượng.', p.sugar === 'saccharose' ? 'Saccharose không có –CHO và không chuyển hóa trong NH3.' : 'Tinh bột không có nhóm –CHO tự do.'];
          else if (p.temp < 50) msg = ['Cần đun nhẹ (60–70 °C) để phản ứng xảy ra.'];
          else if (p.temp > 80) msg = ['Đun quá mạnh: Ag tạo thành bột đen lắng xuống,', 'không bám gương.'];
          else msg = ['Ag kim loại bám thành ống → GƯƠNG BẠC.', p.sugar === 'fructose' ? 'Fructose chuyển hóa thành glucose trong môi trường kiềm.' : 'Glucose khử Ag+ → Ag.', `Tiến độ: ${Math.round(st.prog * 100)}%`];
        }
        msg.forEach((m, i) => text(g, m, bx, by + 28 + i * 22, { size: 13, color: i === 0 ? COLORS.text : COLORS.muted }));
        // Bảng nhận biết
        if (w > 760) {
          const rows = [['Chất', 'Cu(OH)2 (lạnh)', 'Cu(OH)2 (đun)', 'AgNO3/NH3', 'I2'], ['Glucose', 'xanh lam', 'đỏ gạch', 'Ag', '—'], ['Fructose', 'xanh lam', 'đỏ gạch', 'Ag', '—'], ['Saccharose', 'xanh lam', '—', '—', '—'], ['Tinh bột', '—', '—', '—', 'xanh tím']];
          const y0 = by + 150;
          rows.forEach((row, i) => row.forEach((c, j) => text(g, c, bx + j * 105, y0 + i * 24, { size: 11.5, color: i === 0 ? COLORS.chem : (row[0] === nameOf(p.sugar) ? COLORS.text : COLORS.muted), weight: i === 0 ? '700' : '500' })));
          line(g, bx, y0 + 8, bx + 520, y0 + 8, COLORS.grid, 1);
        }
      },
      metrics(p) {
        const reducing = p.sugar === 'glucose' || p.sugar === 'fructose';
        const nAg = reducing ? 2 * p.mol : 0;
        return p.test === 'ag'
          ? [['Tiến độ phản ứng', `${Math.round(st.prog * 100)} %`], ['n(Ag) lí thuyết', `${nAg.toFixed(1)} mmol`], ['m(Ag) lí thuyết', `${(nAg * 108 * st.prog).toFixed(0)} mg`]]
          : [['Cu(OH)2 đã tan', `${Math.round(st.dissolve * 100)} %`], ['Cu2O tạo thành', `${Math.round(st.prog * 100)} %`], ['n(Cu2O) lí thuyết', `${(reducing ? p.mol : 0).toFixed(1)} mmol`]];
      }
    };
  }
};

function nameOf(s) { return { glucose: 'Glucose', fructose: 'Fructose', saccharose: 'Saccharose', starch: 'Tinh bột' }[s]; }
