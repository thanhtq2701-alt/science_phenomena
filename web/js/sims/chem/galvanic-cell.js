import { COLORS, text, label, beaker, roundRect, circle, line, arrow, mixColor, withAlpha } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

export const E0 = { Mg: -2.37, Al: -1.66, Zn: -0.76, Fe: -0.44, Ni: -0.26, Sn: -0.14, Pb: -0.13, H: 0, Cu: 0.34, Ag: 0.80, Au: 1.50 };
const ION_COLOR = { Mg: '#e2e8f0', Al: '#e2e8f0', Zn: '#e2e8f0', Fe: '#bbf7d0', Ni: '#bbf7d0', Sn: '#e2e8f0', Pb: '#e2e8f0', Cu: '#60a5fa', Ag: '#e2e8f0', Au: '#fde68a' };
const METAL_COLOR = { Mg: '#cbd5e1', Al: '#cbd5e1', Zn: '#94a3b8', Fe: '#78716c', Ni: '#a8a29e', Sn: '#d6d3d1', Pb: '#57534e', Cu: '#d97706', Ag: '#e5e7eb', Au: '#facc15' };

export default {
  id: 'chem-galvanic-cell',
  subject: 'chem',
  chapter: 'electrochem',
  title: 'Pin Galvani (pin điện hóa) Zn–Cu',
  summary: 'Electron chạy từ cực âm (Zn tan) qua dây dẫn sang cực dương (Cu2+ bám), ion qua cầu muối khép mạch. Đổi cặp kim loại để tính sức điện động chuẩn.',
  equation: ['Anode (−): Zn → Zn2+ + 2e', 'Cathode (+): Cu2+ + 2e → Cu', 'Tổng: Zn + Cu2+ → Zn2+ + Cu', 'E°pin = E°(cathode) − E°(anode) = 0,34 − (−0,76) = 1,10 V'],
  keywords: ['pin điện hóa', 'galvani', 'sức điện động', 'thế điện cực chuẩn', 'cầu muối', 'anode', 'cathode'],
  theory: [
    'Pin Galvani biến **năng lượng hóa học thành điện năng**. Kim loại có thế điện cực chuẩn **nhỏ hơn** là **anode (cực âm)**: bị oxi hóa, tan ra, nhường electron. Kim loại có E° **lớn hơn** là **cathode (cực dương)**: ion của nó nhận electron, bám lên điện cực.',
    'Electron đi theo **dây dẫn** từ anode sang cathode (dòng điện quy ước ngược lại). **Cầu muối** cho ion di chuyển: cation sang cốc cathode, anion sang cốc anode, giữ dung dịch trung hòa điện.',
    'Sức điện động chuẩn **E°pin = E°cathode − E°anode > 0**. Pin ngừng hoạt động khi anode tan hết hoặc ion cathode cạn kiệt.'
  ],
  observe: ['Rút cầu muối (tắt công tắc cầu muối): vôn kế về 0 – mạch không khép kín.', 'Đổi cặp Mg–Ag để có E° lớn nhất; Cu–Ag chỉ 0,46 V.', 'Để lâu: thanh Zn mòn dần, Cu dày lên, dung dịch CuSO4 nhạt màu.'],
  exam: ['Xác định anode/cathode, chiều dòng electron, viết quá trình tại mỗi điện cực.', 'Tính E°pin từ bảng thế điện cực chuẩn; so sánh tính khử/oxi hóa.'],
  quiz: {
    question: 'Pin Zn–Cu đang hoạt động, vôn kế chỉ khoảng 1,10 V. Nếu rút cầu muối ra, vôn kế chỉ bao nhiêu?',
    options: ['Vẫn khoảng 1,10 V', 'Tăng lên vì bớt cản trở', 'Về 0', 'Đổi dấu thành −1,10 V'],
    answer: 2,
    explanation: 'Cầu muối cho ion di chuyển giữa hai cốc để khép kín mạch và giữ dung dịch trung hòa điện. Rút cầu muối thì mạch hở, pin ngừng hoạt động.'
  },
  params: [
    { key: 'A', label: 'Kim loại điện cực trái', type: 'select', value: 'Zn', options: Object.keys(E0).filter((k) => k !== 'H').map((k) => [k, k]) },
    { key: 'B', label: 'Kim loại điện cực phải', type: 'select', value: 'Cu', options: Object.keys(E0).filter((k) => k !== 'H').map((k) => [k, k]) },
    { key: 'bridge', label: 'Có cầu muối', type: 'toggle', value: true },
    { key: 'load', label: 'Điện trở tải', min: 1, max: 20, step: 1, value: 5, unit: 'Ω' }
  ],
  create() {
    const st = { q: 0, electrons: [], ions: [], flash: 0 };
    for (let i = 0; i < 14; i++) st.electrons.push(i / 14);
    for (let i = 0; i < 8; i++) st.ions.push({ u: Math.random(), sign: i % 2 ? 1 : -1 });
    return {
      update(dt, p) {
        const E = cellE(p);
        if (p.bridge && E > 0 && p.A !== p.B) {
          const I = E / p.load;
          st.q += I * dt;
          const v = 0.25 * I;
          st.electrons = st.electrons.map((u) => (u + v * dt) % 1);
          for (const io of st.ions) io.u = (io.u + v * 0.8 * dt) % 1;
        }
      },
      draw(g, w, h, p, t) {
        const E = cellE(p);
        const same = p.A === p.B;
        const left = E0[p.A] <= E0[p.B] ? p.A : p.B; // anode nằm ở cốc có E° nhỏ hơn; vẫn giữ vị trí trái/phải theo lựa chọn
        const anodeIsLeft = E0[p.A] <= E0[p.B];
        const cx = w / 2, baseY = h - 60;
        const bw = Math.min(200, w * 0.26), bh = 190;
        const lx = cx - bw - 60, rx = cx + 60;
        const consumed = clamp(st.q / 60, 0, 1);
        // Cốc
        const leftIon = ION_COLOR[p.A], rightIon = ION_COLOR[p.B];
        const lLevel = 0.72, rLevel = 0.72;
        beaker(g, lx, baseY - bh, bw, bh, lLevel, withAlpha(toHex(anodeIsLeft ? mixColor(leftIon, leftIon, 0) : mixColor(leftIon, '#e2e8f0', consumed * 0.7)), 0.55), { title: `dd ${p.A}SO4` });
        beaker(g, rx, baseY - bh, bw, bh, rLevel, withAlpha(toHex(anodeIsLeft ? mixColor(rightIon, '#e2e8f0', consumed * 0.7) : rightIon), 0.55), { title: `dd ${p.B}SO4` });
        // Điện cực
        const ew = 22;
        const lthin = anodeIsLeft ? consumed * 0.5 : -consumed * 0.3, rthin = anodeIsLeft ? -consumed * 0.3 : consumed * 0.5;
        const lex = lx + bw / 2, rex = rx + bw / 2;
        drawElectrode(g, lex, baseY - bh - 30, ew * (1 - lthin), bh - 20, METAL_COLOR[p.A], p.A, anodeIsLeft && !same ? '−' : (!same ? '+' : ''));
        drawElectrode(g, rex, baseY - bh - 30, ew * (1 - rthin), bh - 20, METAL_COLOR[p.B], p.B, !anodeIsLeft && !same ? '−' : (!same ? '+' : ''));
        // Cầu muối
        const by = baseY - bh - 10;
        if (p.bridge) {
          g.strokeStyle = '#a78bfa'; g.lineWidth = 16; g.lineCap = 'round';
          g.beginPath(); g.moveTo(lx + bw - 30, baseY - 60); g.lineTo(lx + bw - 30, by); g.lineTo(rx + 30, by); g.lineTo(rx + 30, baseY - 60); g.stroke();
          g.lineCap = 'butt';
          text(g, 'cầu muối (KNO3)', cx, by - 14, { size: 11, align: 'center', color: '#c4b5fd' });
          // ion di chuyển trong cầu muối
          if (E > 0 && !same) for (const io of st.ions) {
            const path = bridgePath(lx + bw - 30, rx + 30, baseY - 60, by);
            // cation → cathode, anion → anode
            const toRight = (io.sign > 0) === anodeIsLeft;
            const pt = path(toRight ? io.u : 1 - io.u);
            circle(g, pt[0], pt[1], 4, io.sign > 0 ? '#fde68a' : '#86efac');
            text(g, io.sign > 0 ? 'K⁺' : 'NO₃⁻', pt[0], pt[1] - 8, { size: 8, align: 'center', color: COLORS.muted });
          }
        } else label(g, 'không có cầu muối → mạch hở', cx, by - 14, { size: 11, color: COLORS.danger });
        // Dây dẫn + vôn kế
        const wy = 50;
        g.strokeStyle = '#e2e8f0'; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(lex, baseY - bh - 30); g.lineTo(lex, wy); g.lineTo(cx - 40, wy); g.stroke();
        g.beginPath(); g.moveTo(rex, baseY - bh - 30); g.lineTo(rex, wy); g.lineTo(cx + 40, wy); g.stroke();
        circle(g, cx, wy, 36, '#0f172a', '#e2e8f0', 2.5);
        text(g, 'V', cx, wy - 6, { size: 16, align: 'center', weight: '800' });
        text(g, `${(p.bridge && !same ? E : 0).toFixed(2)} V`, cx, wy + 14, { size: 12, align: 'center', color: COLORS.warn, weight: '700' });
        // electron chạy
        if (p.bridge && E > 0 && !same) {
          const path = wirePath(anodeIsLeft ? lex : rex, anodeIsLeft ? rex : lex, baseY - bh - 30, wy, cx);
          for (const u of st.electrons) { const pt = path(u); circle(g, pt[0], pt[1], 4, '#fbbf24'); text(g, 'e⁻', pt[0], pt[1] - 8, { size: 8, align: 'center', color: '#fde68a' }); }
          text(g, 'chiều electron →', anodeIsLeft ? cx - 120 : cx + 120, wy - 44, { size: 10.5, align: 'center', color: '#fde68a' });
        }
        // Quá trình tại điện cực
        const an = anodeIsLeft ? p.A : p.B, ca = anodeIsLeft ? p.B : p.A;
        const ax = anodeIsLeft ? lx : rx, cxx = anodeIsLeft ? rx : lx;
        if (!same) {
          label(g, `${an} → ${an}²⁺ + 2e  (oxi hóa)`, ax + bw / 2, baseY + 36, { size: 10.5, color: '#f87171' });
          label(g, `${ca}²⁺ + 2e → ${ca}  (khử)`, cxx + bw / 2, baseY + 36, { size: 10.5, color: '#60a5fa' });
        } else label(g, 'Hai điện cực giống nhau → E° = 0, không có dòng', cx, baseY + 36, { size: 11, color: COLORS.muted });
      },
      metrics(p) {
        const E = cellE(p), same = p.A === p.B;
        const an = E0[p.A] <= E0[p.B] ? p.A : p.B, ca = an === p.A ? p.B : p.A;
        return [['E° pin', `${(same ? 0 : E).toFixed(2)} V`], ['Anode (−)', same ? '—' : an], ['Cathode (+)', same ? '—' : ca], ['Dòng điện', `${(p.bridge && !same ? E / p.load : 0).toFixed(2)} A`], ['Điện lượng đã qua', `${st.q.toFixed(1)} C`], ['Khối lượng anode tan', `${(st.q / (2 * 96485) * 65).toFixed(4)} g (nếu Zn)`]];
      }
    };
  }
};

function cellE(p) { return Math.abs(E0[p.A] - E0[p.B]); }
function drawElectrode(g, x, y, w, h, color, sym, sign) {
  g.fillStyle = color; roundRect(g, x - w / 2, y, w, h, 3); g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.3)'; g.stroke();
  text(g, sym, x, y + h / 2, { size: 12, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' });
  if (sign) label(g, sign, x + w / 2 + 14, y + 10, { size: 13, color: sign === '−' ? '#f87171' : '#60a5fa' });
}
function wirePath(x1, x2, y0, wy, cx) {
  // từ điện cực 1 lên dây, qua vôn kế, xuống điện cực 2
  const segs = [[x1, y0, x1, wy], [x1, wy, x2, wy], [x2, wy, x2, y0]];
  const lens = segs.map((s) => Math.hypot(s[2] - s[0], s[3] - s[1]));
  const total = lens.reduce((a, b) => a + b, 0);
  return (u) => { let d = u * total; for (let i = 0; i < segs.length; i++) { if (d <= lens[i]) { const k = d / lens[i]; return [segs[i][0] + (segs[i][2] - segs[i][0]) * k, segs[i][1] + (segs[i][3] - segs[i][1]) * k]; } d -= lens[i]; } return [x2, y0]; };
}
function bridgePath(x1, x2, y0, by) { return wirePath(x1, x2, y0, by, 0); }
function toHex(rgb) { const m = rgb.match(/\d+/g); if (!m) return rgb; return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join(''); }
