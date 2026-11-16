import { COLORS, text, label, beaker, flame, plot, polyline, roundRect, line, mixColor } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'chem-carb-hydrolysis',
  subject: 'chem',
  chapter: 'carbohydrate',
  title: 'Thủy phân saccharose và tinh bột',
  summary: 'Xem chuỗi polysaccharide bị cắt thành monosaccharide dưới tác dụng của acid hoặc enzyme, rồi kiểm chứng bằng phản ứng tráng bạc.',
  equation: ['C12H22O11 + H2O → C6H12O6 (glucose) + C6H12O6 (fructose)   (H+, t° hoặc enzyme)', '(C6H10O5)n + nH2O → nC6H12O6   (H+, t° hoặc amylase)'],
  keywords: ['thủy phân', 'saccharose', 'tinh bột', 'enzyme', 'amylase', 'glucose'],
  theory: [
    'Saccharose (disaccharide) và tinh bột, cellulose (polysaccharide) đều được tạo bởi các gốc monosaccharide nối qua **liên kết glycoside**. Thủy phân là cắt các liên kết này bằng **nước**, cần xúc tác **acid + đun nóng** hoặc **enzyme** ở nhiệt độ thường/ cơ thể.',
    'Sản phẩm cuối là **glucose** (và fructose với saccharose) có nhóm –CHO nên **sau thủy phân** dung dịch mới cho phản ứng tráng bạc, còn trước đó thì không.',
    'Trong cơ thể: amylase (nước bọt, tụy) thủy phân tinh bột → maltose → glucose; glucose đi vào máu. Nhai cơm lâu thấy ngọt là vì vậy.'
  ],
  observe: ['Dùng enzyme ở 37 °C nhanh hơn acid ở 37 °C; nhưng enzyme bị **biến tính** trên 60 °C nên tốc độ giảm về 0.', 'Sau khi thủy phân hơn 50%, bấm "Thử tráng bạc" để thấy kết quả dương tính.'],
  exam: ['Thủy phân m gam tinh bột với hiệu suất H% rồi lên men/tráng bạc – tính sản phẩm.', 'Giải thích vì sao saccharose không tráng bạc nhưng sản phẩm thủy phân thì có.'],
  params: [
    { key: 'sub', label: 'Chất', type: 'select', value: 'starch', options: [['starch', 'Tinh bột'], ['sac', 'Saccharose']] },
    { key: 'cat', label: 'Xúc tác', type: 'select', value: 'acid', options: [['acid', 'Acid (H2SO4 loãng)'], ['enz', 'Enzyme (amylase / sucrase)']] },
    { key: 'temp', label: 'Nhiệt độ', min: 20, max: 100, step: 1, value: 80, unit: '°C' }
  ],
  actions: [{ key: 'ag', label: '🥈 Thử tráng bạc' }],
  create() {
    const N = 12;
    const st = { bonds: new Array(N - 1).fill(true), prog: 0, hist: [], agResult: null, agTimer: 0 };
    return {
      onParam(k) { if (k === 'sub') { st.bonds = new Array(N - 1).fill(true); st.prog = 0; st.hist = []; st.agResult = null; } },
      action(key, p) { if (key === 'ag') { st.agResult = st.prog > 0.3 ? 'pos' : 'neg'; st.agTimer = 4; } },
      update(dt, p, t) {
        let k;
        if (p.cat === 'acid') k = 0.02 * Math.exp((p.temp - 20) / 15);
        else { const T = p.temp; k = T > 65 ? 0 : 0.35 * Math.exp(-Math.pow((T - 37) / 14, 2)); }
        const n = p.sub === 'sac' ? 1 : N - 1;
        for (let i = 0; i < n; i++) if (st.bonds[i] && Math.random() < k * dt) st.bonds[i] = false;
        const broken = st.bonds.slice(0, n).filter((b) => !b).length;
        st.prog = broken / n;
        if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) { st.hist.push([t, st.prog]); if (st.hist.length > 300) st.hist.shift(); }
        st.agTimer = Math.max(0, st.agTimer - dt);
      },
      draw(g, w, h, p, t) {
        // Chuỗi phân tử trên cùng
        const isSac = p.sub === 'sac';
        const n = isSac ? 2 : N;
        const r = 16, gap = 42;
        const total = (n - 1) * gap;
        const x0 = w / 2 - total / 2, y0 = 90;
        text(g, isSac ? 'Saccharose = glucose – fructose' : 'Tinh bột (amylose): …–glucose–glucose–glucose–…', w / 2, 40, { size: 14, align: 'center', weight: '700' });
        let offset = 0;
        for (let i = 0; i < n; i++) {
          // khi liên kết đứt thì các mảnh tách xa nhau
          if (i > 0 && !st.bonds[i - 1]) offset += 10;
          const x = x0 + i * gap + offset - (offset / 2);
          const y = y0 + (i % 2 ? 6 : -6) + Math.sin(t * 2 + i) * 2;
          const fructose = isSac && i === 1;
          g.fillStyle = fructose ? '#f472b6' : '#60a5fa';
          g.beginPath();
          if (fructose) { for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * (2 * Math.PI / 5); g.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } }
          else { for (let k = 0; k < 6; k++) { const a = k * (Math.PI / 3); g.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } }
          g.closePath(); g.fill();
          text(g, fructose ? 'Fru' : 'Glu', x, y, { size: 10, align: 'center', baseline: 'middle', color: '#0b1020', weight: '700' });
          if (i < n - 1) {
            const nx = x0 + (i + 1) * gap + offset + (!st.bonds[i] ? 10 : 0) - (offset + (!st.bonds[i] ? 10 : 0)) / 2;
            const ny = y0 + ((i + 1) % 2 ? 6 : -6);
            if (st.bonds[i]) line(g, x + r, y, nx - r, ny, '#cbd5e1', 3);
            else { text(g, 'H₂O', (x + nx) / 2, y - 28, { size: 10, align: 'center', color: '#93c5fd' }); line(g, x + r, y, x + r + 6, y, '#ef4444', 2); line(g, nx - r - 6, ny, nx - r, ny, '#ef4444', 2); }
          }
        }
        text(g, 'liên kết glycoside bị cắt bởi H2O', w / 2, y0 + 44, { size: 11, align: 'center', color: COLORS.muted });

        // Cốc + lửa
        const bx = 50, by = 170, bw = 170, bh = 200;
        beaker(g, bx, by, bw, bh, 0.7, mixColor('#e2e8f0', '#fef3c7', st.prog), { title: (isSac ? 'Saccharose' : 'Hồ tinh bột') + (p.cat === 'acid' ? ' + H2SO4' : ' + enzyme') });
        if (p.temp > 40) flame(g, bx + bw / 2, by + bh + 40, 0.5 + (p.temp - 40) / 100, '#fbbf24', t);
        label(g, `${p.temp} °C`, bx + bw / 2, by + bh + 56, { size: 11 });
        if (p.cat === 'enz' && p.temp > 65) label(g, 'enzyme bị biến tính!', bx + bw / 2, by - 14, { size: 11, color: COLORS.danger });

        // Đồ thị
        const px = 300, py = 180, pw = w - px - 30, ph = h - py - 60;
        const tmax = Math.max(20, st.hist.length ? st.hist[st.hist.length - 1][0] : 20);
        const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: tmax, ymin: 0, ymax: 1, xlabel: 'thời gian (s)', ylabel: 'tỉ lệ thủy phân', title: 'Tiến trình thủy phân' });
        polyline(g, st.hist.map(([tt, v]) => [P.X(tt), P.Y(v)]), COLORS.chem, 2.5);
        // Kết quả tráng bạc
        if (st.agTimer > 0 && st.agResult) {
          g.globalAlpha = Math.min(1, st.agTimer);
          g.fillStyle = st.agResult === 'pos' ? 'rgba(226,232,240,0.95)' : 'rgba(30,41,59,0.95)';
          roundRect(g, px + pw / 2 - 150, py + ph / 2 - 36, 300, 72, 12); g.fill();
          text(g, st.agResult === 'pos' ? '✔ Có gương bạc – đã tạo glucose' : '✘ Không có gương bạc – chưa thủy phân', px + pw / 2, py + ph / 2 + 5, { size: 14, align: 'center', color: st.agResult === 'pos' ? '#0b1020' : COLORS.text, weight: '700' });
          g.globalAlpha = 1;
        }
      },
      metrics(p) { return [['Đã thủy phân', `${Math.round(st.prog * 100)} %`], ['Xúc tác', p.cat === 'acid' ? 'H+ , t°' : 'enzyme'], ['Enzyme hoạt động', p.cat === 'enz' ? (p.temp > 65 ? 'biến tính' : p.temp < 30 ? 'chậm' : 'tốt') : '—']]; }
    };
  }
};
