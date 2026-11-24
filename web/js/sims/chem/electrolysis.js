import { COLORS, text, label, beaker, roundRect, circle, line, Bubbles, mixColor, withAlpha } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const F = 96485;
const MODES = {
  cuso4: { title: 'Điện phân dd CuSO4 (điện cực trơ)', cathode: 'Cu2+ + 2e → Cu', anode: '2H2O → O2 + 4H+ + 4e', total: '2CuSO4 + 2H2O → 2Cu + O2 + 2H2SO4', gasC: null, gasA: 'O2', deposit: 'Cu', n: 2, M: 64, color: '#60a5fa', fade: true },
  nacl: { title: 'Điện phân dd NaCl (có màng ngăn)', cathode: '2H2O + 2e → H2 + 2OH−', anode: '2Cl− → Cl2 + 2e', total: '2NaCl + 2H2O → 2NaOH + H2 + Cl2', gasC: 'H2', gasA: 'Cl2', deposit: null, n: 2, M: 2, color: '#e2e8f0', fade: false },
  plating: { title: 'Mạ đồng (anode Cu tan, cathode là vật cần mạ)', cathode: 'Cu2+ + 2e → Cu (bám lên vật)', anode: 'Cu → Cu2+ + 2e (anode tan)', total: 'Cu(anode) → Cu(cathode); nồng độ CuSO4 không đổi', gasC: null, gasA: null, deposit: 'Cu', n: 2, M: 64, color: '#60a5fa', fade: false },
  water: { title: 'Điện phân nước (dd H2SO4 loãng / NaOH)', cathode: '2H2O + 2e → H2 + 2OH−', anode: '2H2O → O2 + 4H+ + 4e', total: '2H2O → 2H2 + O2', gasC: 'H2', gasA: 'O2', deposit: null, n: 2, M: 2, color: '#bfdbfe', fade: false }
};

export default {
  id: 'chem-electrolysis',
  subject: 'chem',
  chapter: 'electrochem',
  title: 'Điện phân dung dịch và mạ điện',
  summary: 'Dòng điện một chiều ép phản ứng xảy ra: Cu bám cathode, khí thoát ra ở anode, hoặc mạ kim loại. Tính khối lượng sản phẩm bằng định luật Faraday.',
  equation: ['m = (A · I · t) / (n · F)   với F = 96 485 C/mol', 'CuSO4: cathode Cu2+ + 2e → Cu; anode 2H2O → O2 + 4H+ + 4e', 'NaCl (màng ngăn): cathode 2H2O + 2e → H2 + 2OH−; anode 2Cl− → Cl2 + 2e'],
  keywords: ['điện phân', 'Faraday', 'mạ điện', 'cathode', 'anode', 'CuSO4', 'NaCl'],
  theory: [
    'Điện phân là quá trình **oxi hóa – khử xảy ra trên bề mặt điện cực** dưới tác dụng của dòng điện một chiều. Khác với pin: **cathode nối cực âm** của nguồn (xảy ra sự khử), **anode nối cực dương** (xảy ra sự oxi hóa).',
    'Thứ tự khử ở cathode: ion kim loại có tính oxi hóa mạnh (Ag+, Cu2+…) bị khử trước; ion kim loại kiềm, Al3+ không bị khử trong nước – nước bị khử tạo H2. Ở anode trơ: Cl−, Br−, I− bị oxi hóa trước; SO4 2−, NO3 − không bị oxi hóa – nước bị oxi hóa tạo O2.',
    '**Định luật Faraday**: khối lượng chất thoát ra tỉ lệ với điện lượng q = I·t. Mạ điện dùng **anode tan** bằng chính kim loại mạ nên nồng độ dung dịch không đổi.'
  ],
  observe: ['Tăng I: tốc độ Cu bám và khí thoát tăng tỉ lệ.', 'Với CuSO4 điện cực trơ: màu xanh dung dịch nhạt dần, pH giảm (H+ sinh ra).', 'So sánh thể tích khí H2 và O2 khi điện phân nước (2 : 1).'],
  exam: ['Tính m kim loại/ thể tích khí theo I, t; tính thời gian điện phân.', 'Viết quá trình điện cực và PTHH điện phân; xác định pH dung dịch sau điện phân.'],
  quiz: {
    question: 'Điện phân dung dịch CuSO4 với điện cực trơ. Ở cathode (nối cực âm của nguồn) xảy ra hiện tượng gì?',
    options: ['Đồng (Cu) màu đỏ bám lên điện cực', 'Khí O2 thoát ra', 'Khí H2 thoát ra', 'Điện cực tan dần'],
    answer: 0,
    explanation: 'Ở cathode xảy ra sự khử: Cu2+ có tính oxi hóa mạnh hơn nước nên bị khử thành Cu bám lên điện cực. Khí O2 thoát ra ở anode do nước bị oxi hóa.'
  },
  params: [
    { key: 'mode', label: 'Dung dịch', type: 'select', value: 'cuso4', options: Object.entries(MODES).map(([k, v]) => [k, v.title]) },
    { key: 'I', label: 'Cường độ dòng điện', min: 0, max: 5, step: 0.25, value: 2, unit: 'A', decimals: 2 },
    { key: 'scale', label: 'Tốc độ thời gian', min: 1, max: 300, step: 1, value: 60, unit: '× thực' }
  ],
  create() {
    const st = { q: 0, tElapsed: 0, bub: new Bubbles(), gasC: 0, gasA: 0 };
    return {
      onParam(k) { if (k === 'mode') { st.q = 0; st.tElapsed = 0; st.gasC = 0; st.gasA = 0; } },
      update(dt, p) {
        const m = MODES[p.mode];
        const simDt = dt * p.scale;
        st.q += p.I * simDt;
        st.tElapsed += simDt;
        const rate = p.I * 2.5;
        if (st.geo) {
          const { cx, ax, yTop, yBot, surf } = st.geo;
          if (m.gasC && Math.random() < rate * dt) st.bub.spawn(cx, yTop + Math.random() * (yBot - yTop), 1, { color: 'rgba(255,255,255,0.75)', spread: 16 });
          if (m.gasA && Math.random() < rate * dt * (m.gasA === 'O2' && m.gasC === 'H2' ? 0.5 : 1)) st.bub.spawn(ax, yTop + Math.random() * (yBot - yTop), 1, { color: m.gasA === 'Cl2' ? 'rgba(190,242,100,0.8)' : 'rgba(255,255,255,0.75)', spread: 16 });
          st.bub.update(dt, surf);
        }
      },
      draw(g, w, h, p, t) {
        const m = MODES[p.mode];
        const bw = Math.min(360, w * 0.5), bh = 230, bx = 40, by = 110;
        const molDep = st.q / (m.n * F);
        const liquid = m.fade ? mixColor(m.color, '#e2e8f0', clamp(molDep / 0.02, 0, 0.8)) : m.color;
        text(g, m.title, 20, 36, { size: 14, weight: '700' });
        text(g, m.total, 20, 58, { size: 12, color: COLORS.muted });
        beaker(g, bx, by, bw, bh, 0.78, withAlpha(toHex(liquid), 0.45));
        // nguồn một chiều
        const sx = bx + bw / 2, sy = by - 40;
        g.strokeStyle = '#e2e8f0'; g.lineWidth = 2.5;
        const cx = bx + bw * 0.3, ax = bx + bw * 0.7, topE = by + 20;
        g.beginPath(); g.moveTo(cx, topE); g.lineTo(cx, sy); g.lineTo(sx - 18, sy); g.stroke();
        g.beginPath(); g.moveTo(ax, topE); g.lineTo(ax, sy); g.lineTo(sx + 18, sy); g.stroke();
        line(g, sx - 18, sy - 14, sx - 18, sy + 14, '#e2e8f0', 2); line(g, sx + 18, sy - 22, sx + 18, sy + 22, '#e2e8f0', 4);
        text(g, '−', sx - 30, sy - 18, { size: 14, color: '#f87171', weight: '800' }); text(g, '+', sx + 24, sy - 18, { size: 14, color: '#60a5fa', weight: '800' });
        text(g, `nguồn DC, I = ${p.I} A`, sx, sy - 30, { size: 11, align: 'center', color: COLORS.muted });
        // điện cực
        const eh = bh - 60;
        const depositThick = clamp(molDep * 600, 0, 10);
        // cathode
        g.fillStyle = p.mode === 'plating' ? '#78716c' : '#334155'; roundRect(g, cx - 8, topE, 16, eh, 3); g.fill();
        if (m.deposit) { g.fillStyle = '#d97706'; roundRect(g, cx - 8 - depositThick, topE + 40, 16 + depositThick * 2, eh - 40, 3); g.fill(); }
        // anode
        const anodeThin = p.mode === 'plating' ? depositThick : 0;
        g.fillStyle = p.mode === 'plating' ? '#d97706' : '#334155'; roundRect(g, ax - 8 + anodeThin / 2, topE, 16 - anodeThin, eh, 3); g.fill();
        label(g, 'cathode (−)', cx, by + bh + 20, { size: 11, color: '#f87171' });
        label(g, 'anode (+)', ax, by + bh + 20, { size: 11, color: '#60a5fa' });
        text(g, m.cathode, cx, by + bh + 44, { size: 10.5, align: 'center', color: COLORS.muted });
        text(g, m.anode, ax, by + bh + 44, { size: 10.5, align: 'center', color: COLORS.muted });
        st.geo = { cx, ax, yTop: topE + 60, yBot: topE + eh - 10, surf: by + bh - 0.78 * (bh - 10) };
        st.bub.draw(g);
        // electron trên dây
        if (p.I > 0) { const u = (t * 0.5 * p.I) % 1; const pts = [[ax, topE + (sy - topE) * (1 - u)], [sx + 18 + (ax - sx - 18) * (1 - u), sy], [cx, sy + (topE - sy) * u]]; for (const q of pts) circle(g, q[0], q[1], 3.5, '#fbbf24'); }
        // ion trong dung dịch
        if (m.deposit) for (let i = 0; i < 6; i++) { const u = (t * 0.15 * (1 + p.I / 5) + i / 6) % 1; const x = ax - (ax - cx) * u; const y = by + 90 + Math.sin(i * 2 + t) * 50; circle(g, x, y, 5, '#60a5fa'); text(g, 'Cu²⁺', x, y - 9, { size: 8, align: 'center', color: '#93c5fd' }); }
        // Bảng số liệu bên phải
        const rx = bx + bw + 40;
        if (w - rx > 200) {
          text(g, 'Định luật Faraday', rx, 110, { size: 14, weight: '700' });
          const rows = [['q = I·t', `${st.q.toFixed(0)} C`], ['n e⁻ = q / F', `${(st.q / F).toFixed(4)} mol`]];
          if (m.deposit) rows.push([`m(${m.deposit}) = A·q/(n·F)`, `${(molDep * m.M).toFixed(3)} g`]);
          if (m.gasC) rows.push([`V(${m.gasC}) đkc`, `${(st.q / (2 * F) * 24.79).toFixed(3)} L`]);
          if (m.gasA) rows.push([`V(${m.gasA}) đkc`, `${(st.q / ((m.gasA === 'O2' ? 4 : 2) * F) * 24.79).toFixed(3)} L`]);
          rows.forEach((r, i) => { text(g, r[0], rx, 140 + i * 26, { size: 12, color: COLORS.muted }); text(g, r[1], rx + 190, 140 + i * 26, { size: 12.5, weight: '700' }); });
          text(g, `Thời gian điện phân: ${fmtTime(st.tElapsed)}`, rx, 140 + rows.length * 26 + 10, { size: 12, color: COLORS.warn });
        }
      },
      metrics(p) {
        const m = MODES[p.mode];
        const molDep = st.q / (m.n * F);
        return [['Thời gian (mô phỏng)', fmtTime(st.tElapsed)], ['Điện lượng q', `${st.q.toFixed(0)} C`], ['Sản phẩm cathode', m.deposit ? `${(molDep * m.M).toFixed(3)} g ${m.deposit}` : `${(st.q / (2 * F) * 24.79).toFixed(3)} L ${m.gasC}`], ['Sản phẩm anode', m.gasA ? `${(st.q / ((m.gasA === 'O2' ? 4 : 2) * F) * 24.79).toFixed(3)} L ${m.gasA}` : 'anode tan']];
      }
    };
  }
};
function fmtTime(s) { if (s < 60) return `${s.toFixed(0)} s`; if (s < 3600) return `${Math.floor(s / 60)} phút ${Math.floor(s % 60)} s`; return `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} phút`; }
function toHex(rgb) { if (rgb.startsWith('#')) return rgb; const m = rgb.match(/\d+/g); return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join(''); }
