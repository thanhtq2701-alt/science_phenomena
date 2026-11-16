import { COLORS, text, label, testTube, circle, line, mixColor, withAlpha, Falling, atom, ATOM } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

const EXPS = {
  cu_nh3: { title: 'Cu2+ + dung dịch NH3 (nhỏ từ từ đến dư)', start: '#60a5fa', stages: [{ at: 2, color: '#93c5fd', precip: '#3b82f6', msg: 'Kết tủa xanh lam Cu(OH)2' }, { at: 6, color: '#1e3a8a', precip: null, msg: 'Kết tủa tan, dung dịch xanh lam đậm [Cu(NH3)4]2+' }], eq: ['Cu2+ + 2NH3 + 2H2O → Cu(OH)2↓ + 2NH4+', 'Cu(OH)2 + 4NH3 → [Cu(NH3)4](OH)2'], complex: { center: 'Cu', ligands: ['NH3', 'NH3', 'NH3', 'NH3'], shape: 'vuông phẳng', color: '#1e40af' } },
  fe_scn: { title: 'Fe3+ + dung dịch KSCN', start: '#fde68a', stages: [{ at: 1, color: '#991b1b', precip: null, msg: 'Dung dịch đỏ máu [Fe(SCN)]2+ – nhận biết Fe3+' }], eq: ['Fe3+ + SCN− → [Fe(SCN)]2+ (đỏ máu)'], complex: { center: 'Fe', ligands: ['SCN', 'H2O', 'H2O', 'H2O', 'H2O', 'H2O'], shape: 'bát diện', color: '#991b1b' } },
  fe_oh: { title: 'Fe3+ + dung dịch NaOH', start: '#fde68a', stages: [{ at: 2, color: '#fef3c7', precip: '#b45309', msg: 'Kết tủa nâu đỏ Fe(OH)3, không tan trong NaOH dư' }], eq: ['Fe3+ + 3OH− → Fe(OH)3↓ (nâu đỏ)'], complex: null },
  fe2_oh: { title: 'Fe2+ + NaOH, để ngoài không khí', start: '#d9f99d', stages: [{ at: 2, color: '#ecfccb', precip: '#86efac', msg: 'Kết tủa trắng xanh Fe(OH)2' }, { at: 6, color: '#fef3c7', precip: '#b45309', msg: 'Hóa nâu đỏ ngoài không khí: Fe(OH)2 → Fe(OH)3' }], eq: ['Fe2+ + 2OH− → Fe(OH)2↓ (trắng xanh)', '4Fe(OH)2 + O2 + 2H2O → 4Fe(OH)3 (nâu đỏ)'], complex: null },
  cu_h2o: { title: 'CuSO4 khan + nước', start: '#f1f5f9', stages: [{ at: 1, color: '#60a5fa', precip: null, msg: 'Màu xanh của [Cu(H2O)6]2+ – nhận biết nước' }], eq: ['CuSO4 (trắng) + 6H2O → [Cu(H2O)6]SO4 (xanh)'], complex: { center: 'Cu', ligands: ['H2O', 'H2O', 'H2O', 'H2O', 'H2O', 'H2O'], shape: 'bát diện', color: '#2563eb' } },
  ni_dmg: { title: 'Ni2+ + dimethylglyoxime (DMG)', start: '#a7f3d0', stages: [{ at: 2, color: '#d1fae5', precip: '#f43f5e', msg: 'Kết tủa đỏ hồng Ni(DMG)2 – nhận biết Ni2+' }], eq: ['Ni2+ + 2DMG → [Ni(DMG)2]↓ (đỏ) + 2H+'], complex: { center: 'Ni', ligands: ['DMG', 'DMG'], shape: 'vuông phẳng', color: '#be123c' } }
};

export default {
  id: 'chem-complex-ions',
  subject: 'chem',
  chapter: 'transition',
  title: 'Phức chất và màu sắc của ion kim loại chuyển tiếp',
  summary: 'Nhỏ dần thuốc thử vào dung dịch ion kim loại chuyển tiếp: kết tủa hydroxide, phức chất tan với NH3, màu đỏ máu Fe3+–SCN. Xem cấu trúc phức tứ diện/bát diện.',
  equation: ['Cu2+ + 2NH3 + 2H2O → Cu(OH)2↓ ; Cu(OH)2 + 4NH3 → [Cu(NH3)4]2+ (xanh lam đậm)', 'Fe3+ + SCN− → [Fe(SCN)]2+ (đỏ máu)', 'Fe2+ + 2OH− → Fe(OH)2 (trắng xanh) →(O2) Fe(OH)3 (nâu đỏ)'],
  keywords: ['phức chất', 'phối tử', 'kim loại chuyển tiếp', 'Cu(NH3)4', 'Fe(SCN)', 'hydroxide', 'màu dung dịch'],
  theory: [
    'Ion kim loại chuyển tiếp có **orbital d chưa đầy** nên thường **có màu** và dễ tạo **phức chất**: nguyên tử trung tâm liên kết với các **phối tử** (H2O, NH3, OH−, Cl−, SCN−…) bằng **liên kết cho – nhận**.',
    'Phức [Cu(H2O)6]2+ xanh nhạt; thay H2O bằng NH3 cho [Cu(NH3)4(H2O)2]2+ xanh lam đậm. **Dạng hình học**: phối trí 4 → tứ diện hoặc vuông phẳng; phối trí 6 → bát diện.',
    'Ứng dụng: nhận biết ion (Fe3+ bằng SCN−, Ni2+ bằng DMG), hòa tan Cu(OH)2, AgCl trong NH3; phức chất trong sinh học (hemoglobin – Fe, chlorophyll – Mg).'
  ],
  observe: ['Cu2+ + NH3: tăng dần giọt thuốc thử – thấy kết tủa xuất hiện rồi tan khi NH3 dư.', 'Fe2+ + NaOH: để lâu kết tủa chuyển màu trắng xanh → nâu đỏ.'],
  exam: ['Nhận biết Fe2+, Fe3+, Cu2+, Ni2+ bằng thuốc thử; giải thích hiện tượng theo giai đoạn.', 'Xác định số phối trí, phối tử, dạng hình học của phức chất.'],
  params: [
    { key: 'exp', label: 'Thí nghiệm', type: 'select', value: 'cu_nh3', options: Object.entries(EXPS).map(([k, v]) => [k, v.title]) },
    { key: 'drops', label: 'Lượng thuốc thử', min: 0, max: 10, step: 1, value: 0, unit: 'giọt' }
  ],
  create() {
    const st = { shown: 0, fall: new Falling(), air: 0 };
    return {
      onParam(k) { if (k === 'exp') { st.shown = 0; st.fall.list = []; st.air = 0; } },
      update(dt, p) {
        st.shown += (p.drops - st.shown) * (1 - Math.exp(-dt * 1.5));
        const e = EXPS[p.exp];
        const stage = currentStage(e, st.shown);
        if (stage && stage.precip && Math.random() < 0.5 && Math.abs(st.shown - p.drops) > 0.05) st.fall.spawn(200, 200, 1, stage.precip, 2);
        st.fall.update(dt, 330);
        if (p.exp === 'fe2_oh' && st.shown >= 2) st.air += dt;
      },
      draw(g, w, h, p, t) {
        const e = EXPS[p.exp];
        let liquid = e.start, precip = null, msg = 'Chưa nhỏ thuốc thử – dung dịch ban đầu';
        let stage = null;
        for (const s of e.stages) {
          const k = clamp((st.shown - (s.at - 1)) / 1, 0, 1);
          if (k > 0) { liquid = mixColor(liquid, s.color, k); if (k > 0.3) { precip = s.precip; msg = s.msg; } stage = s; }
        }
        if (p.exp === 'fe2_oh' && st.shown >= 2) { const k = clamp(st.air / 6, 0, 1); if (precip) precip = mixColor('#86efac', '#b45309', k); if (k > 0.5) msg = e.stages[1].msg; }
        const tx = 170, ty = 80, tw = 80, th = 260;
        testTube(g, tx, ty, tw, th, 0.6, withAlpha(toHex(liquid), 0.75), { precipitate: precip, precipHeight: 10 + 16 * clamp(st.shown / 4, 0, 1), title: e.title });
        st.fall.draw(g);
        // ống nhỏ giọt
        g.fillStyle = '#cbd5e1'; g.fillRect(tx + tw / 2 - 4, ty - 70, 8, 50); g.beginPath(); g.moveTo(tx + tw / 2 - 4, ty - 20); g.lineTo(tx + tw / 2 + 4, ty - 20); g.lineTo(tx + tw / 2, ty - 8); g.closePath(); g.fill();
        if (Math.abs(st.shown - p.drops) > 0.05) { const u = (t * 2) % 1; circle(g, tx + tw / 2, ty - 6 + u * 80, 3, '#e2e8f0'); }
        label(g, msg, tx + tw / 2, ty + th + 44, { size: 11 });
        // Phức chất
        const cx = Math.max(500, w * 0.68), cy = 200;
        if (e.complex && stage) {
          text(g, `Cấu trúc phức: ${e.complex.shape}`, cx, 60, { size: 13, weight: '700', align: 'center' });
          const n = e.complex.ligands.length;
          const R = 70;
          for (let i = 0; i < n; i++) {
            let x, y;
            if (n === 6) { const a = i * TAU / 4 + t * 0.3; if (i < 4) { x = cx + Math.cos(a) * R; y = cy + Math.sin(a) * R * 0.45; } else { x = cx; y = cy + (i === 4 ? -R : R); } }
            else { const a = i * TAU / n + t * 0.3; x = cx + Math.cos(a) * R; y = cy + Math.sin(a) * R * (e.complex.shape === 'vuông phẳng' ? 0.5 : 0.8); }
            line(g, cx, cy, x, y, '#94a3b8', 2);
            circle(g, x, y, 16, '#334155', '#94a3b8'); text(g, e.complex.ligands[i], x, y + 1, { size: 8.5, align: 'center', baseline: 'middle', color: '#e2e8f0', weight: '700' });
          }
          atom(g, cx, cy, 20, ATOM[e.complex.center] || '#d97706', e.complex.center);
          text(g, 'phối tử cho cặp e → ion trung tâm (liên kết cho – nhận)', cx, cy + 120, { size: 11, align: 'center', color: COLORS.muted });
          text(g, `Số phối trí: ${n}`, cx, cy + 140, { size: 12, align: 'center' });
        } else if (!e.complex) {
          text(g, 'Kết tủa hydroxide', cx, 60, { size: 13, weight: '700', align: 'center' });
          const notes = p.exp === 'fe_oh' ? ['Fe(OH)3 nâu đỏ, không tan trong kiềm dư.', 'Fe3+ có tính oxi hóa; Fe(OH)3 bền trong không khí.'] : ['Fe(OH)2 trắng xanh, kém bền.', 'Bị O2 không khí oxi hóa dần thành Fe(OH)3 nâu đỏ.', 'Hiện tượng: kết tủa chuyển màu từ đáy lên trên.'];
          notes.forEach((n, i) => text(g, n, cx, 100 + i * 24, { size: 12, align: 'center', color: COLORS.muted }));
        } else text(g, 'Nhỏ thuốc thử để thấy phức chất hình thành', cx, 120, { size: 12, align: 'center', color: COLORS.muted });
        // phương trình
        e.eq.forEach((q, i) => text(g, q, cx, h - 70 + i * 22, { size: 12, align: 'center', color: i === e.eq.length - 1 && stage ? COLORS.chem : COLORS.muted }));
      },
      metrics(p) { const e = EXPS[p.exp]; const s = currentStage(e, st.shown); return [['Giai đoạn', s ? e.stages.indexOf(s) + 1 : 0], ['Kết tủa', s && s.precip ? 'có' : 'không'], ['Số phối trí', e.complex ? e.complex.ligands.length : '—']]; }
    };
  }
};
function currentStage(e, shown) { let cur = null; for (const s of e.stages) if (shown >= s.at - 0.7) cur = s; return cur; }
function toHex(rgb) { if (rgb.startsWith('#')) return rgb; const m = rgb.match(/\d+/g); return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join(''); }
