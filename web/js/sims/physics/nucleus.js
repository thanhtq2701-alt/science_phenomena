import { COLORS, text, label, circle, line, plot, polyline, roundRect, bar } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

const SYM = ['n', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu'];

/** Công thức bán thực nghiệm Weizsäcker (MeV) */
function bindingEnergy(Z, A) {
  const N = A - Z;
  if (A < 1) return 0;
  const aV = 15.75, aS = 17.8, aC = 0.711, aA = 23.7, aP = 11.18;
  let E = aV * A - aS * Math.pow(A, 2 / 3) - aC * Z * (Z - 1) / Math.cbrt(A) - aA * (N - Z) * (N - Z) / A;
  if (Z % 2 === 0 && N % 2 === 0) E += aP / Math.sqrt(A); else if (Z % 2 === 1 && N % 2 === 1) E -= aP / Math.sqrt(A);
  return Math.max(0, E);
}

export default {
  id: 'physics-nucleus',
  subject: 'physics',
  chapter: 'nuclear',
  title: 'Cấu tạo hạt nhân và năng lượng liên kết',
  summary: 'Ghép proton, neutron thành hạt nhân; xem kí hiệu, độ hụt khối, năng lượng liên kết riêng và vị trí trên đồ thị Fe-56 bền nhất.',
  equation: ['Kí hiệu: ᴬ_Z X,  A = Z + N', 'Δm = Z·m_p + N·m_n − m_hạt nhân', 'E_lk = Δm·c²  ;  E_lk riêng = E_lk / A  (lớn nhất ≈ 8,8 MeV ở Fe-56)'],
  keywords: ['hạt nhân', 'proton', 'neutron', 'nucleon', 'độ hụt khối', 'năng lượng liên kết riêng', 'đồng vị', 'bán kính hạt nhân'],
  theory: [
    'Hạt nhân gồm **Z proton** (điện tích +e) và **N neutron** (trung hòa), tổng **A = Z + N nucleon**. Các hạt nhân cùng Z khác N là **đồng vị**. Bán kính hạt nhân R ≈ 1,2·A^(1/3) fm.',
    'Khối lượng hạt nhân **nhỏ hơn** tổng khối lượng các nucleon riêng lẻ: **độ hụt khối Δm**. Năng lượng tương ứng **E_lk = Δm·c²** là năng lượng cần để tách hạt nhân thành các nucleon (lực hạt nhân rất mạnh, tầm ngắn).',
    '**Năng lượng liên kết riêng E_lk/A** đặc trưng cho độ bền: lớn nhất (~8,8 MeV) ở các hạt nhân trung bình (A ≈ 50–95, Fe, Ni). Vì vậy **phân hạch hạt nhân nặng** và **tổng hợp hạt nhân nhẹ** đều tỏa năng lượng.'
  ],
  observe: ['Chọn Z = 26, N = 30 (Fe-56): năng lượng liên kết riêng gần cực đại.', 'Tăng N quá nhiều so với Z: hạt nhân kém bền (vùng ngoài vệt bền).', 'Thử Z = 92, N = 146 (U-238): E_lk riêng ≈ 7,6 MeV, thấp hơn Fe.'],
  exam: ['Xác định Z, N, A từ kí hiệu; tính độ hụt khối và năng lượng liên kết, năng lượng liên kết riêng.', 'So sánh độ bền của các hạt nhân.'],
  params: [
    { key: 'Z', label: 'Số proton Z', min: 1, max: 94, step: 1, value: 26 },
    { key: 'N', label: 'Số neutron N', min: 0, max: 146, step: 1, value: 30 }
  ],
  create() {
    return {
      update() {},
      draw(g, w, h, p, t) {
        const Z = p.Z, N = p.N, A = Z + N;
        const E = bindingEnergy(Z, A), Ea = A ? E / A : 0;
        const mp = 1.007276, mn = 1.008665, u = 931.5;
        const dm = E / u;
        // vẽ hạt nhân: nucleon xếp cầu
        const cx = w * 0.25, cy = h / 2 - 20;
        const R = Math.min(120, 22 * Math.cbrt(A) + 10);
        const pts = [];
        const total = Math.min(A, 300);
        for (let i = 0; i < total; i++) { const phi = Math.acos(1 - 2 * (i + 0.5) / total); const th = Math.PI * (1 + Math.sqrt(5)) * i + t * 0.3; const r = R * 0.9; pts.push({ x: r * Math.sin(phi) * Math.cos(th), y: r * Math.sin(phi) * Math.sin(th) * 0.9, z: r * Math.cos(phi), isP: i % A < Z ? (i * 7919) % A < Z : false }); }
        // phân bổ proton theo tỉ lệ
        pts.forEach((q, i) => { q.isP = (i * 2654435761 % total) < Z * total / A; });
        pts.sort((a, b) => a.z - b.z);
        const rr = Math.max(3, 9 - A / 40);
        for (const q of pts) { const sh = 0.6 + 0.4 * (q.z + R) / (2 * R); circle(g, cx + q.x, cy + q.y, rr, q.isP ? `rgba(248,113,113,${sh})` : `rgba(148,163,184,${sh})`); }
        label(g, `${SYM[Z] || '?'}-${A}   (Z = ${Z}, N = ${N}, A = ${A})`, cx, cy - R - 24, { size: 13 });
        text(g, `R ≈ 1,2·A^(1/3) = ${(1.2 * Math.cbrt(A)).toFixed(2)} fm`, cx, cy + R + 28, { size: 11, align: 'center', color: COLORS.muted });
        circle(g, cx - 60, cy + R + 50, 5, '#f87171'); text(g, 'proton', cx - 50, cy + R + 54, { size: 10.5, color: COLORS.muted });
        circle(g, cx + 10, cy + R + 50, 5, '#94a3b8'); text(g, 'neutron', cx + 20, cy + R + 54, { size: 10.5, color: COLORS.muted });
        // bảng số
        const rx = w * 0.5, ry = 60;
        if (w - rx > 250) {
          text(g, 'Năng lượng liên kết (công thức bán thực nghiệm)', rx, ry, { size: 13, weight: '700' });
          const rows = [['Σ m nucleon', `${(Z * mp + N * mn).toFixed(4)} u`], ['Độ hụt khối Δm', `${dm.toFixed(4)} u`], ['E_lk = Δm·c²', `${E.toFixed(1)} MeV`], ['E_lk / A', `${Ea.toFixed(2)} MeV/nucleon`]];
          rows.forEach((r, i) => { text(g, r[0], rx, ry + 28 + i * 22, { size: 12, color: COLORS.muted }); text(g, r[1], rx + 170, ry + 28 + i * 22, { size: 12.5, weight: '700' }); });
          // đồ thị E/A theo A
          const px = rx, py = ry + 130, pw = w - px - 30, ph = h - py - 50;
          const P = plot(g, px, py, pw, ph, { xmin: 0, xmax: 250, ymin: 0, ymax: 10, xlabel: 'số khối A', ylabel: 'E_lk/A (MeV)', title: 'Đường cong năng lượng liên kết riêng' });
          const curve = []; for (let a = 2; a <= 250; a += 2) { const zOpt = Math.round(a / (1.98 + 0.0155 * Math.pow(a, 2 / 3))); curve.push([P.X(a), P.Y(bindingEnergy(zOpt, a) / a)]); }
          polyline(g, curve, 'rgba(148,163,184,0.6)', 2);
          circle(g, P.X(56), P.Y(8.79), 4, '#4ade80'); text(g, 'Fe-56', P.X(56) + 6, P.Y(8.79) - 6, { size: 10, color: '#4ade80' });
          circle(g, P.X(A), P.Y(clamp(Ea, 0, 10)), 6, '#fbbf24', '#0b1020');
          text(g, `${SYM[Z] || '?'}-${A}`, P.X(A) + 8, P.Y(clamp(Ea, 0, 10)) + 4, { size: 10.5, color: '#fbbf24' });
          const stableN = Math.round(Z * (1 + 0.0155 * Math.pow(A, 2 / 3) * 1)); // xấp xỉ
          const zOpt = A / (1.98 + 0.0155 * Math.pow(A, 2 / 3));
          const stab = Math.abs(Z - zOpt) < 1.5 ? 'gần vệt bền' : Z > zOpt ? 'thừa proton (dễ phóng xạ β⁺)' : 'thừa neutron (dễ phóng xạ β⁻)';
          text(g, `Độ bền: ${stab}`, rx, h - 20, { size: 11.5, color: COLORS.muted });
          void stableN;
        }
      },
      metrics(p) { const A = p.Z + p.N; const E = bindingEnergy(p.Z, A); return [['Kí hiệu', `${SYM[p.Z] || '?'}-${A}`], ['Số khối A', A], ['E_lk', `${E.toFixed(1)} MeV`], ['E_lk / A', `${(A ? E / A : 0).toFixed(2)} MeV`], ['Δm', `${(E / 931.5).toFixed(4)} u`]]; }
    };
  }
};
