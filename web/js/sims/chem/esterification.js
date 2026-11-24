import { COLORS, text, label, beaker, flame, molecule, plot, polyline, bar, Bubbles, mixColor } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const K_EQ = 4; // hằng số cân bằng ester hóa (ethyl acetate) ≈ 4

function xEq(r) {
  // K = x^2 / ((1-x)(r-x)), giải nhị phân trên (0, min(1,r))
  let lo = 0, hi = Math.min(1, r) - 1e-6;
  for (let i = 0; i < 60; i++) {
    const x = (lo + hi) / 2;
    const f = x * x - K_EQ * (1 - x) * (r - x);
    if (f > 0) hi = x; else lo = x;
  }
  return (lo + hi) / 2;
}

const ACID = [{ s: 'C', x: 0, y: 0 }, { s: 'C', x: -28, y: 0 }, { s: 'O', x: 14, y: -22 }, { s: 'O', x: 16, y: 20 }, { s: 'H', x: 34, y: 28 }];
const ACID_B = [[0, 1], [0, 2, 2], [0, 3], [3, 4]];
const ALC = [{ s: 'C', x: 0, y: 0 }, { s: 'C', x: 28, y: 0 }, { s: 'O', x: -20, y: 18 }, { s: 'H', x: -38, y: 28 }];
const ALC_B = [[0, 1], [0, 2], [2, 3]];
const ESTER = [{ s: 'C', x: -40, y: 0 }, { s: 'C', x: -12, y: 0 }, { s: 'O', x: 0, y: -24 }, { s: 'O', x: 10, y: 18 }, { s: 'C', x: 38, y: 10 }, { s: 'C', x: 60, y: -14 }];
const ESTER_B = [[0, 1], [1, 2, 2], [1, 3], [3, 4], [4, 5]];
const WATER = [{ s: 'O', x: 0, y: 0 }, { s: 'H', x: -16, y: 12 }, { s: 'H', x: 16, y: 12 }];
const WATER_B = [[0, 1], [0, 2]];

export default {
  id: 'chem-esterification',
  subject: 'chem',
  chapter: 'ester-lipid',
  title: 'Phản ứng ester hóa (điều chế ethyl acetate)',
  summary: 'Acid acetic + ethanol tạo ester có mùi thơm, phản ứng thuận nghịch, xúc tác H2SO4 đặc và đun nóng. Quan sát hiệu suất đạt cân bằng và cách đẩy cân bằng.',
  equation: ['CH3COOH + C2H5OH ⇌ CH3COOC2H5 + H2O  (H2SO4 đặc, t°)'],
  keywords: ['ester', 'ethyl acetate', 'cân bằng', 'xúc tác'],
  theory: [
    'Ester được điều chế bằng phản ứng giữa carboxylic acid và alcohol. Phản ứng **thuận nghịch** và **chậm**, nên cần **H2SO4 đặc** (xúc tác + hút nước) và **đun nóng**.',
    'Hằng số cân bằng K ≈ 4 nên với tỉ lệ 1 : 1, hiệu suất tối đa chỉ ≈ 67%. Muốn tăng hiệu suất: dùng **dư alcohol hoặc acid**, hoặc **chưng cất lấy ester** ra khỏi hỗn hợp.',
    'Ester nhẹ hơn nước, ít tan, nên **nổi thành lớp trên** khi đổ vào nước muối bão hòa; có mùi thơm đặc trưng (ethyl acetate: mùi dứa chín).'
  ],
  observe: [
    'Tắt xúc tác: phản ứng gần như không xảy ra ở 20 °C.',
    'Tăng tỉ lệ ethanol lên 3 : 1 và xem hiệu suất theo acid tăng tới hơn 90%.',
    'Tăng nhiệt độ: **tốc độ** tăng nhưng **hiệu suất cân bằng** gần như không đổi (phản ứng có ΔH ≈ 0).'
  ],
  exam: ['Tính hiệu suất phản ứng ester hóa từ K hoặc từ lượng ester thu được.', 'Giải thích vai trò của H2SO4 đặc và cách tăng hiệu suất.'],
  quiz: {
    question: 'Trộn acid acetic và ethanol theo tỉ lệ mol 1 : 1, có H2SO4 đặc, đun nóng thật lâu. Hiệu suất tạo ester tối đa khoảng bao nhiêu?',
    options: ['Gần 100%', 'Khoảng 33%', 'Khoảng 67%', 'Bằng 0 vì phản ứng cần thêm nước'],
    answer: 2,
    explanation: 'Ester hóa là phản ứng thuận nghịch với K ≈ 4, nên với tỉ lệ 1 : 1 hiệu suất cân bằng chỉ ≈ 2/3. Muốn tăng hiệu suất phải dùng dư alcohol (hoặc acid) hoặc chưng cất lấy ester ra.'
  },
  params: [
    { key: 'temp', label: 'Nhiệt độ', min: 20, max: 100, step: 5, value: 70, unit: '°C' },
    { key: 'ratio', label: 'Tỉ lệ mol ethanol : acid', min: 0.5, max: 4, step: 0.5, value: 1, decimals: 1 },
    { key: 'catalyst', label: 'Có H2SO4 đặc (xúc tác)', type: 'toggle', value: true }
  ],
  actions: [{ key: 'distill', label: '🧪 Chưng cất lấy ester' }],
  create() {
    const st = { x: 0, removed: 0, hist: [], bubbles: new Bubbles(), mols: [], t: 0 };
    for (let i = 0; i < 10; i++) st.mols.push({ kind: i < 5 ? 'acid' : 'alc', x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * 20, vy: (Math.random() - .5) * 20, rot: Math.random() * 6 });
    return {
      action(key) { if (key === 'distill') { st.removed += st.x * 0.6; st.x *= 0.4; } },
      update(dt, p, t) {
        st.t = t;
        const T = p.temp;
        const k = (p.catalyst ? 1 : 0.02) * 0.08 * Math.exp((T - 20) / 25);
        const xe = xEq(p.ratio);
        // tiến về cân bằng với động học bậc giả (ester lấy ra làm x giảm nên lại tiếp tục tiến)
        st.x += (xe - st.x) * (1 - Math.exp(-k * dt));
        st.x = clamp(st.x, 0, 1);
        if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) { st.hist.push([t, st.x + st.removed]); if (st.hist.length > 400) st.hist.shift(); }
        if (T > 60 && p.catalyst) st.bubbles.spawn(160 + Math.random() * 100, 300, Math.random() < (T - 60) / 60 ? 1 : 0, { color: 'rgba(255,255,255,0.5)' });
        st.bubbles.update(dt, 180);
        for (const m of st.mols) {
          m.x += m.vx * dt / 200; m.y += m.vy * dt / 200; m.rot += dt * 0.5;
          if (m.x < 0 || m.x > 1) m.vx *= -1; if (m.y < 0 || m.y > 1) m.vy *= -1;
          m.x = clamp(m.x, 0, 1); m.y = clamp(m.y, 0, 1);
        }
      },
      draw(g, w, h, p, t) {
        const sc = Math.min(1, w / 900);
        // Bình phản ứng
        const bx = 60, by = 110, bw = 220, bh = 220;
        const total = st.x + st.removed;
        const liquid = mixColor('#fde68a', '#fef3c7', total);
        beaker(g, bx, by, bw, bh, 0.75, liquid, { title: 'Bình cầu: acid + ethanol' + (p.catalyst ? ' + H2SO4 đặc' : '') });
        // lớp ester nổi (phần đã tạo)
        if (st.x > 0.02) {
          g.fillStyle = 'rgba(253,224,71,0.55)';
          const top = by + bh - 0.75 * (bh - 10);
          g.fillRect(bx + 1, top, bw - 2, 18 * st.x * 3);
        }
        // phân tử trong bình
        g.save(); g.beginPath(); g.rect(bx, by + 60, bw, bh - 62); g.clip();
        const nEster = Math.round(st.x * 5);
        st.mols.forEach((m, i) => {
          const px = bx + 30 + m.x * (bw - 60), py = by + 80 + m.y * (bh - 100);
          const isEster = i < nEster;
          if (isEster) molecule(g, px, py, ESTER, ESTER_B, 0.35 * sc + 0.2, m.rot);
          else if (m.kind === 'acid') molecule(g, px, py, ACID, ACID_B, 0.35 * sc + 0.2, m.rot);
          else molecule(g, px, py, ALC, ALC_B, 0.35 * sc + 0.2, m.rot);
        });
        g.restore();
        st.bubbles.draw(g);
        if (p.temp > 30) flame(g, bx + bw / 2, by + bh + 36, 0.6 + (p.temp - 30) / 100, p.temp > 80 ? '#f97316' : '#fbbf24', t);
        label(g, `${p.temp} °C`, bx + bw / 2, by + bh + 52, { size: 11 });

        // Sơ đồ phản ứng ở giữa
        const cx = w * 0.62, cy = 70;
        if (w > 700) {
          molecule(g, cx - 150, cy, ACID, ACID_B, 0.55);
          text(g, '+', cx - 85, cy + 5, { size: 20, align: 'center' });
          molecule(g, cx - 40, cy, ALC, ALC_B, 0.55);
          text(g, '⇌', cx + 25, cy + 7, { size: 22, align: 'center', color: COLORS.chem });
          molecule(g, cx + 90, cy, ESTER, ESTER_B, 0.55);
          text(g, '+', cx + 150, cy + 5, { size: 20, align: 'center' });
          molecule(g, cx + 180, cy, WATER, WATER_B, 0.55);
          text(g, 'acid acetic', cx - 150, cy + 32, { size: 11, align: 'center', color: COLORS.muted });
          text(g, 'ethanol', cx - 40, cy + 32, { size: 11, align: 'center', color: COLORS.muted });
          text(g, 'ethyl acetate', cx + 90, cy + 32, { size: 11, align: 'center', color: COLORS.muted });
          text(g, 'nước', cx + 180, cy + 32, { size: 11, align: 'center', color: COLORS.muted });
        }
        // Đồ thị hiệu suất
        const px = Math.max(330, w * 0.4), py = 150, pw = w - px - 30, ph = h - py - 60;
        const xe = xEq(p.ratio);
        const tmax = Math.max(20, st.hist.length ? st.hist[st.hist.length - 1][0] : 20);
        const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: tmax, ymin: 0, ymax: 1, xlabel: 'thời gian (s)', ylabel: 'độ chuyển hóa acid', title: 'Hiệu suất theo thời gian' });
        polyline(g, [[P.X(0), P.Y(xe)], [P.X(tmax), P.Y(xe)]], 'rgba(251,191,36,0.5)', 1.5);
        text(g, `cân bằng ${Math.round(xe * 100)}%`, P.X(tmax) - 6, P.Y(xe) - 6, { size: 11, align: 'right', color: COLORS.warn });
        polyline(g, st.hist.map(([tt, v]) => [P.X(tt), P.Y(v)]), COLORS.chem, 2.5);
        bar(g, px, h - 28, pw, 10, st.x + st.removed, COLORS.chem, `Đã chuyển hóa: ${Math.round((st.x + st.removed) * 100)}%  (trong bình ${Math.round(st.x * 100)}%, đã chưng cất ${Math.round(st.removed * 100)}%)`);
      },
      metrics(p) {
        const xe = xEq(p.ratio);
        return [['Hiệu suất cân bằng (theo acid)', `${(xe * 100).toFixed(1)} %`], ['Độ chuyển hóa hiện tại', `${((st.x + st.removed) * 100).toFixed(1)} %`], ['Hằng số cân bằng K', K_EQ], ['Tốc độ tương đối', (p.catalyst ? 1 : 0.02) * Math.exp((p.temp - 20) / 25), 2]];
      }
    };
  }
};
