import { COLORS, text, label, beaker, roundRect, circle, line, arrow, mixColor, withAlpha, Bubbles } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const SERIES = ['K', 'Na', 'Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Ag', 'Au'];
const E0 = { K: -2.93, Na: -2.71, Mg: -2.37, Al: -1.66, Zn: -0.76, Fe: -0.44, Ni: -0.26, Sn: -0.14, Pb: -0.13, H: 0, Cu: 0.34, Ag: 0.80, Au: 1.50 };
const METAL = { Mg: '#cbd5e1', Al: '#cbd5e1', Zn: '#94a3b8', Fe: '#78716c', Cu: '#d97706', Ag: '#e5e7eb', Ni: '#a8a29e', Pb: '#57534e', Sn: '#d6d3d1' };
const SOL = { 'Mg2+': ['Mg', '#e2e8f0'], 'Zn2+': ['Zn', '#e2e8f0'], 'Fe2+': ['Fe', '#bbf7d0'], 'Cu2+': ['Cu', '#60a5fa'], 'Ag+': ['Ag', '#e2e8f0'], 'H+ (HCl)': ['H', '#e2e8f0'], 'Pb2+': ['Pb', '#e2e8f0'] };

export default {
  id: 'chem-activity-series',
  subject: 'chem',
  chapter: 'metals',
  title: 'Dãy điện hóa: kim loại đẩy kim loại khỏi muối',
  summary: 'Nhúng thanh kim loại vào dung dịch muối/acid: kim loại mạnh hơn tan ra, kim loại yếu hơn bám lên thanh. Quy tắc α và dãy điện hóa.',
  equation: ['Fe + CuSO4 → FeSO4 + Cu   (Cu đỏ bám lên Fe, dd xanh nhạt dần)', 'Cu + 2AgNO3 → Cu(NO3)2 + 2Ag   (Ag bám, dd chuyển xanh)', 'Cu + FeSO4 → không phản ứng', 'Zn + 2HCl → ZnCl2 + H2↑'],
  keywords: ['dãy điện hóa', 'quy tắc alpha', 'tính khử', 'thế điện cực', 'kim loại đẩy muối'],
  theory: [
    'Trong dãy điện hóa, **từ trái sang phải tính khử của kim loại giảm**, tính oxi hóa của ion tăng. Kim loại đứng **trước** đẩy được kim loại đứng **sau** ra khỏi dung dịch muối (quy tắc α): chất khử mạnh + chất oxi hóa mạnh → chất khử yếu + chất oxi hóa yếu.',
    'Kim loại đứng **trước H** phản ứng với acid HCl/H2SO4 loãng giải phóng H2. Kim loại kiềm (K, Na) phản ứng với **nước** trong dung dịch trước nên không đẩy được kim loại khỏi muối.',
    'Hiện tượng quan sát: thanh kim loại mòn, **lớp kim loại mới bám** (Cu đỏ, Ag trắng xám), **màu dung dịch đổi** (Cu2+ xanh nhạt dần; Fe2+ xanh lục nhạt xuất hiện).'
  ],
  observe: ['Thử Cu vào FeSO4: không hiện tượng – vì Cu đứng sau Fe.', 'Zn vào HCl: bọt khí H2; Cu vào HCl: không.', 'Ag+ với mọi kim loại trong danh sách đều phản ứng.'],
  exam: ['Dự đoán phản ứng theo dãy điện hóa; bài toán tăng/giảm khối lượng thanh kim loại.', 'Sắp xếp tính khử/oxi hóa; viết PT ion thu gọn.'],
  params: [
    { key: 'metal', label: 'Thanh kim loại', type: 'select', value: 'Fe', options: Object.keys(METAL).map((k) => [k, k]) },
    { key: 'sol', label: 'Dung dịch', type: 'select', value: 'Cu2+', options: Object.keys(SOL).map((k) => [k, k]) }
  ],
  create() {
    const st = { prog: 0, bub: new Bubbles() };
    return {
      onParam() { st.prog = 0; },
      update(dt, p) {
        const [ion] = SOL[p.sol];
        const dE = E0[ion] - E0[p.metal];
        if (dE > 0) {
          st.prog = clamp(st.prog + dt * 0.06 * Math.min(3, dE * 2), 0, 1);
          if (ion === 'H' && Math.random() < 0.8) st.bub.spawn(190, 250, 1);
        }
        st.bub.update(dt, 140);
      },
      draw(g, w, h, p, t) {
        const [ion, solColor] = SOL[p.sol];
        const dE = E0[ion] - E0[p.metal];
        const reacts = dE > 0;
        // cốc
        const bx = 60, by = 100, bw = 240, bh = 230;
        const newIonColor = p.metal === 'Cu' ? '#60a5fa' : p.metal === 'Fe' ? '#bbf7d0' : '#e2e8f0';
        const liquid = reacts ? mixColor(solColor, newIonColor, st.prog) : solColor;
        beaker(g, bx, by, bw, bh, 0.75, withAlpha(toHex(liquid), 0.5), { title: `dung dịch ${p.sol}` });
        // thanh kim loại
        const mx = bx + bw / 2, mw = 26 * (1 - 0.35 * st.prog);
        g.fillStyle = METAL[p.metal]; roundRect(g, mx - mw / 2, by - 30, mw, bh - 20, 3); g.fill();
        text(g, p.metal, mx, by - 10, { size: 13, align: 'center', color: '#0b1020', weight: '800' });
        if (reacts && ion !== 'H') {
          // lớp bám
          g.fillStyle = METAL[ion] || '#e5e7eb';
          const thick = 10 * st.prog;
          for (let i = 0; i < 12; i++) { const y = by + 60 + i * 12; const ww = thick * (0.6 + 0.4 * Math.sin(i * 1.7 + 1)); g.fillRect(mx - mw / 2 - ww, y, mw + 2 * ww, 10); }
          label(g, `${ion} bám lên thanh`, mx, by + bh - 20, { size: 11, color: COLORS.warn });
        }
        st.bub.draw(g);
        label(g, reacts ? (ion === 'H' ? 'có bọt khí H2' : 'CÓ phản ứng') : 'KHÔNG phản ứng', mx, by - 50, { size: 12, color: reacts ? '#4ade80' : '#f87171' });
        if (reacts) {
          const n = ion === 'Ag' ? 2 : ion === 'H' ? 2 : 1;
          const eq = ion === 'H' ? `${p.metal} + 2H⁺ → ${p.metal}²⁺ + H₂↑` : `${p.metal} + ${n > 1 ? n : ''}${ion}${ion === 'Ag' ? '⁺' : '²⁺'} → ${p.metal}²⁺ + ${n > 1 ? n : ''}${ion}`;
          text(g, eq, mx, by + bh + 46, { size: 13, align: 'center', weight: '700' });
        } else text(g, `${p.metal} đứng sau ${ion} trong dãy điện hóa → không đẩy được`, mx, by + bh + 46, { size: 11.5, align: 'center', color: COLORS.muted });

        // Dãy điện hóa
        const sx = Math.max(360, bx + bw + 60), sy = 120, sw = w - sx - 30;
        if (sw > 220) {
          text(g, 'Dãy điện hóa (tính khử giảm dần →)', sx, sy - 20, { size: 13, weight: '700' });
          const step = sw / (SERIES.length - 1);
          g.strokeStyle = '#475569'; g.lineWidth = 3; g.beginPath(); g.moveTo(sx, sy + 20); g.lineTo(sx + sw, sy + 20); g.stroke();
          SERIES.forEach((s, i) => {
            const x = sx + i * step;
            const isM = s === p.metal, isI = s === ion;
            circle(g, x, sy + 20, isM || isI ? 9 : 5, isM ? '#4ade80' : isI ? '#60a5fa' : '#94a3b8');
            text(g, s, x, sy + 48, { size: 11, align: 'center', color: isM ? '#4ade80' : isI ? '#60a5fa' : COLORS.muted, weight: isM || isI ? '800' : '500' });
            text(g, E0[s].toFixed(2), x, sy + 64, { size: 8.5, align: 'center', color: COLORS.muted });
          });
          const xm = sx + SERIES.indexOf(p.metal) * step, xi = sx + SERIES.indexOf(ion) * step;
          if (reacts) arrow(g, xm, sy - 4, xi, sy - 4, '#4ade80', 2); else arrow(g, xm, sy - 4, xi, sy - 4, '#f87171', 2);
          text(g, 'kim loại (chất khử)', xm, sy - 14, { size: 9.5, align: 'center', color: '#4ade80' });
          text(g, 'ion (chất oxi hóa)', xi, sy + 84, { size: 9.5, align: 'center', color: '#60a5fa' });
          // quy tắc alpha
          const qy = sy + 130;
          text(g, 'Quy tắc α', sx, qy, { size: 13, weight: '700' });
          text(g, `${p.metal}²⁺ / ${p.metal}          ${ion}${ion === 'Ag' || ion === 'H' ? '⁺' : '²⁺'} / ${ion}`, sx, qy + 26, { size: 13 });
          text(g, 'chất oxi hóa mạnh + chất khử mạnh → chất oxi hóa yếu + chất khử yếu', sx, qy + 50, { size: 11, color: COLORS.muted });
          text(g, `ΔE° = E°(${ion}) − E°(${p.metal}) = ${dE.toFixed(2)} V ${reacts ? '> 0 ⇒ xảy ra' : '< 0 ⇒ không xảy ra'}`, sx, qy + 74, { size: 12, color: reacts ? '#4ade80' : '#f87171' });
        }
      },
      metrics(p) { const [ion] = SOL[p.sol]; const dE = E0[ion] - E0[p.metal]; return [['ΔE°', `${dE.toFixed(2)} V`], ['Phản ứng', dE > 0 ? 'có' : 'không'], ['Tiến độ', `${Math.round(st.prog * 100)} %`]]; }
    };
  }
};
function toHex(rgb) { if (rgb.startsWith('#')) return rgb; const m = rgb.match(/\d+/g); return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join(''); }
