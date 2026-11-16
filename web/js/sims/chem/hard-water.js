import { COLORS, text, label, beaker, circle, flame, Falling, roundRect, withAlpha, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'chem-hard-water',
  subject: 'chem',
  chapter: 'group-ia-iia',
  title: 'Nước cứng và cách làm mềm',
  summary: 'Nước chứa nhiều Ca2+, Mg2+ là nước cứng. Đun sôi chỉ loại được tính cứng tạm thời; Na2CO3 hoặc trao đổi ion loại được cả tính cứng vĩnh cửu.',
  equation: ['Ca(HCO3)2 →(t°) CaCO3↓ + CO2↑ + H2O   (cứng tạm thời)', 'Ca2+ + CO3 2− → CaCO3↓ ;  Mg2+ + CO3 2− → MgCO3↓   (Na2CO3 làm mềm)', '2RCOONa (xà phòng) + Ca2+ → (RCOO)2Ca↓ + 2Na+   (xà phòng mất tác dụng)'],
  keywords: ['nước cứng', 'làm mềm', 'Ca2+', 'Mg2+', 'HCO3-', 'Na2CO3', 'trao đổi ion', 'cặn'],
  theory: [
    '**Nước cứng** chứa nhiều **Ca2+, Mg2+**. Phân loại theo anion: **tạm thời** (HCO3−), **vĩnh cửu** (Cl−, SO4 2−), **toàn phần** (cả hai).',
    'Tác hại: đóng cặn CaCO3 trong nồi hơi/ấm nước, xà phòng tạo kết tủa nên ít bọt và tốn xà phòng, làm thực phẩm lâu chín.',
    'Làm mềm = **giảm nồng độ Ca2+, Mg2+**. Đun sôi chỉ phân hủy HCO3− nên chỉ xử lí cứng tạm thời. Dùng **Na2CO3, Na3PO4** hoặc **nhựa trao đổi ion** (thay Ca2+, Mg2+ bằng Na+) loại được mọi loại nước cứng.'
  ],
  observe: ['Chọn nước cứng vĩnh cửu rồi đun sôi: không có kết tủa, độ cứng không đổi.', 'Chọn Na2CO3: kết tủa trắng xuất hiện với mọi loại nước cứng.', 'Thử xà phòng: nước càng cứng càng ít bọt.'],
  exam: ['Phân loại nước cứng từ thành phần ion; chọn hóa chất làm mềm phù hợp.', 'Tính lượng Na2CO3 cần để làm mềm; viết PT ion thu gọn.'],
  params: [
    { key: 'type', label: 'Loại nước cứng', type: 'select', value: 'temp', options: [['temp', 'Tạm thời (Ca(HCO3)2)'], ['perm', 'Vĩnh cửu (CaSO4, MgCl2)'], ['total', 'Toàn phần']] },
    { key: 'method', label: 'Cách xử lí', type: 'select', value: 'boil', options: [['none', 'Chưa xử lí'], ['boil', 'Đun sôi'], ['na2co3', 'Thêm Na2CO3'], ['resin', 'Cột trao đổi ion']] },
    { key: 'soap', label: 'Thử với xà phòng', type: 'toggle', value: false }
  ],
  create() {
    const st = { prog: 0, fall: new Falling(), ions: [], foam: [] };
    for (let i = 0; i < 24; i++) st.ions.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * 0.1, vy: (Math.random() - .5) * 0.1, kind: i % 3 === 0 ? 'Mg' : 'Ca', gone: false });
    return {
      onParam(k) { if (k === 'type' || k === 'method') { st.prog = 0; st.fall.list = []; for (const io of st.ions) io.gone = false; } },
      update(dt, p) {
        const removable = p.method === 'boil' ? (p.type === 'temp' ? 1 : p.type === 'total' ? 0.5 : 0) : p.method === 'none' ? 0 : 1;
        const target = removable;
        if (st.prog < target) { st.prog = clamp(st.prog + dt * 0.12, 0, target); if (Math.random() < 0.6) st.fall.spawn(200, 200, 1, '#f8fafc', 2); }
        const nGone = Math.round(st.prog * st.ions.length);
        st.ions.forEach((io, i) => { io.gone = i < nGone; io.x += io.vx * dt; io.y += io.vy * dt; if (io.x < 0 || io.x > 1) io.vx *= -1; if (io.y < 0 || io.y > 1) io.vy *= -1; io.x = clamp(io.x, 0, 1); io.y = clamp(io.y, 0, 1); });
        st.fall.update(dt, 330);
        if (p.soap) { const hardness = 1 - st.prog; const foamRate = 1.2 * (1 - hardness) + 0.1; if (Math.random() < foamRate * dt * 8) st.foam.push({ x: Math.random(), life: 1, r: 4 + Math.random() * 7 }); }
        for (const f of st.foam) f.life -= dt * 0.4;
        st.foam = st.foam.filter((f) => f.life > 0);
      },
      draw(g, w, h, p, t) {
        const bx = 60, by = 90, bw = Math.min(300, w * 0.4), bh = 240;
        const r = beaker(g, bx, by, bw, bh, 0.72, 'rgba(96,165,250,0.18)', { precipitate: st.prog > 0.05 && p.method !== 'resin' ? '#f1f5f9' : null, precipHeight: 4 + 14 * st.prog, title: typeName(p.type) });
        // ion
        g.save(); g.beginPath(); g.rect(bx, r.top, bw, bh - (r.top - by)); g.clip();
        for (const io of st.ions) {
          if (io.gone) continue;
          const x = bx + 20 + io.x * (bw - 40), y = r.top + 15 + io.y * (bh - (r.top - by) - 40);
          circle(g, x, y, 7, io.kind === 'Ca' ? '#86efac' : '#bbf7d0'); text(g, io.kind + '²⁺', x, y + 1, { size: 7, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' });
        }
        g.restore();
        st.fall.draw(g);
        if (p.method === 'boil') { flame(g, bx + bw / 2, by + bh + 40, 0.9, '#fbbf24', t); for (let i = 0; i < 5; i++) { const u = (t * 0.6 + i / 5) % 1; circle(g, bx + 40 + i * (bw - 80) / 4, r.top + 60 - u * 60, 3 + u * 3, null, 'rgba(255,255,255,0.6)'); } }
        if (p.method === 'na2co3') { g.fillStyle = '#e2e8f0'; roundRect(g, bx + bw / 2 - 20, by - 50, 40, 36, 6); g.fill(); text(g, 'Na₂CO₃', bx + bw / 2, by - 28, { size: 9, align: 'center', baseline: 'middle', color: '#0b1020', weight: '700' }); for (let i = 0; i < 3; i++) { const u = (t * 1.5 + i / 3) % 1; circle(g, bx + bw / 2 + (i - 1) * 8, by - 10 + u * (r.top - by + 10), 2.5, '#f8fafc'); } }
        if (p.method === 'resin') {
          const cx = bx + bw + 50; g.fillStyle = '#334155'; roundRect(g, cx - 18, by + 20, 36, 180, 8); g.fill();
          for (let i = 0; i < 30; i++) circle(g, cx - 10 + (i % 3) * 10, by + 35 + Math.floor(i / 3) * 16, 4, '#fbbf24');
          text(g, 'nhựa R–Na', cx, by + 215, { size: 10, align: 'center', color: COLORS.muted });
          text(g, 'Ca²⁺ vào → Na⁺ ra', cx, by + 232, { size: 10, align: 'center', color: COLORS.muted });
        }
        // xà phòng
        if (p.soap) for (const f of st.foam) { g.globalAlpha = f.life * 0.8; circle(g, bx + 10 + f.x * (bw - 20), r.top - 4 - (1 - f.life) * 25, f.r, 'rgba(255,255,255,0.35)', '#fff'); }
        g.globalAlpha = 1;
        // Bảng phải
        const rx = Math.max(bx + bw + 120, w * 0.52), rw = w - rx - 30;
        if (rw > 180) {
          text(g, 'Độ cứng còn lại', rx, 100, { size: 14, weight: '700' });
          bar(g, rx, 130, rw, 12, 1 - st.prog, '#86efac', `Ca²⁺ + Mg²⁺: ${Math.round((1 - st.prog) * 100)}%`);
          const msg = resultMsg(p, st.prog);
          msg.forEach((m, i) => text(g, m, rx, 175 + i * 22, { size: 12, color: i === 0 ? COLORS.text : COLORS.muted, weight: i === 0 ? '700' : '500' }));
          const rows = [['Cách làm mềm', 'Tạm thời', 'Vĩnh cửu'], ['Đun sôi', '✔', '✘'], ['Ca(OH)2 vừa đủ', '✔', '✘'], ['Na2CO3 / Na3PO4', '✔', '✔'], ['Trao đổi ion', '✔', '✔']];
          rows.forEach((row, i) => row.forEach((c, j) => text(g, c, rx + j * (rw / 3), 300 + i * 22, { size: 11.5, color: i === 0 ? COLORS.chem : c === '✔' ? '#4ade80' : c === '✘' ? '#f87171' : COLORS.muted, weight: i === 0 ? '700' : '500' })));
          if (p.soap) text(g, `Xà phòng: ${st.prog > 0.7 ? 'nhiều bọt (nước mềm)' : 'ít bọt, có kết tủa – nước còn cứng'}`, rx, 300 + rows.length * 22 + 12, { size: 11.5, color: COLORS.warn });
        }
      },
      metrics(p) { return [['Độ cứng còn', `${Math.round((1 - st.prog) * 100)} %`], ['Kết tủa', st.prog > 0.05 && p.method !== 'resin' ? 'CaCO3/MgCO3 trắng' : 'không'], ['Kết quả', st.prog >= 0.99 ? 'nước mềm' : st.prog > 0 ? 'mềm một phần' : 'vẫn cứng']]; }
    };
  }
};
function typeName(t) { return { temp: 'nước cứng tạm thời', perm: 'nước cứng vĩnh cửu', total: 'nước cứng toàn phần' }[t]; }
function resultMsg(p, prog) {
  if (p.method === 'none') return ['Chưa xử lí', 'Ca²⁺, Mg²⁺ vẫn còn nguyên trong nước.'];
  if (p.method === 'boil') return p.type === 'temp' ? ['Đun sôi: HCO₃⁻ phân hủy', 'Ca(HCO₃)₂ → CaCO₃↓ + CO₂ + H₂O', 'Cặn trắng bám đáy – nước trở nên mềm.'] : p.type === 'perm' ? ['Đun sôi: KHÔNG tác dụng', 'Cl⁻, SO₄²⁻ không phân hủy khi đun', '→ Ca²⁺, Mg²⁺ vẫn còn.'] : ['Đun sôi: chỉ loại phần tạm thời', 'Phần vĩnh cửu (Cl⁻, SO₄²⁻) vẫn còn.'];
  if (p.method === 'na2co3') return ['Na₂CO₃: kết tủa Ca²⁺, Mg²⁺', 'Ca²⁺ + CO₃²⁻ → CaCO₃↓', 'Hiệu quả với mọi loại nước cứng.'];
  return ['Trao đổi ion: Ca²⁺, Mg²⁺ bị giữ lại', '2R–Na + Ca²⁺ → R₂Ca + 2Na⁺', 'Nước ra chỉ chứa Na⁺ → mềm.'];
}
