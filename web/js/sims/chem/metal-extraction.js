import { COLORS, text, label, beaker, circle, line, roundRect, flame, arrow, Bubbles, mixColor, withAlpha, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const METHODS = {
  pyro: { name: 'Nhiệt luyện: Fe2O3 + CO', eq: 'Fe2O3 + 3CO →(t° cao) 2Fe + 3CO2', for: 'kim loại trung bình (Zn, Fe, Sn, Pb, Cu)', reducer: 'C, CO, H2, Al', note: 'Lò cao luyện gang: quặng hematite + than cốc, CO khử oxide ở 500–1200 °C.' },
  hydro: { name: 'Thủy luyện: Fe + CuSO4', eq: 'Fe + CuSO4 → FeSO4 + Cu  (hoặc Zn + 2AgNO3)', for: 'kim loại yếu (Cu, Ag, Au)', reducer: 'Fe, Zn (kim loại mạnh hơn)', note: 'Hòa tan quặng thành dung dịch muối rồi dùng kim loại mạnh hơn đẩy ra; tách vàng bằng NaCN rồi khử bằng Zn.' },
  electro: { name: 'Điện phân nóng chảy: Al2O3 / NaCl', eq: '2Al2O3 →(đpnc, cryolite) 4Al + 3O2 ;  2NaCl →(đpnc) 2Na + Cl2', for: 'kim loại mạnh (K, Na, Ca, Mg, Al)', reducer: 'dòng điện (cathode)', note: 'Oxide/muối nóng chảy, cathode khử ion kim loại. Al: 950 °C nhờ cryolite Na3AlF6 hạ nhiệt độ nóng chảy.' }
};
const SERIES = ['K', 'Na', 'Ca', 'Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Ag', 'Au'];

export default {
  id: 'chem-metal-extraction',
  subject: 'chem',
  chapter: 'metals',
  title: 'Điều chế kim loại: nhiệt luyện, thủy luyện, điện phân',
  summary: 'Nguyên tắc chung là khử ion kim loại Mⁿ⁺ + ne → M. Chọn phương pháp theo vị trí trong dãy điện hóa: kim loại mạnh phải điện phân nóng chảy, trung bình nhiệt luyện, yếu thủy luyện.',
  equation: ['Nguyên tắc: Mⁿ⁺ + ne → M (khử ion kim loại)', 'Nhiệt luyện: Fe2O3 + 3CO → 2Fe + 3CO2 ; CuO + H2 → Cu + H2O', 'Điện phân nóng chảy: 2Al2O3 → 4Al + 3O2 ; MgCl2 → Mg + Cl2'],
  keywords: ['điều chế kim loại', 'nhiệt luyện', 'thủy luyện', 'điện phân nóng chảy', 'lò cao', 'cryolite', 'nhôm', 'quặng'],
  theory: [
    'Trong tự nhiên hầu hết kim loại tồn tại dạng **hợp chất** (oxide, sulfide, muối). Điều chế kim loại là **khử ion kim loại** thành nguyên tử: Mⁿ⁺ + ne → M.',
    '**Nhiệt luyện**: khử oxide kim loại bằng C, CO, H2, Al ở nhiệt độ cao – dùng cho kim loại **sau Al** (Zn, Fe, Sn, Pb, Cu). **Thủy luyện**: hòa tan thành muối rồi dùng kim loại mạnh hơn đẩy ra – kim loại **yếu** (Cu, Ag, Au). **Điện phân nóng chảy**: với kim loại **mạnh** (K → Al) vì không có chất khử hóa học đủ mạnh; điện phân dung dịch cho kim loại sau Al.',
    'Sản xuất nhôm: tinh chế quặng bauxite thành Al2O3, điện phân nóng chảy trong cryolite ở ~950 °C với điện cực than chì; anode bị tiêu hao do tạo CO, CO2.'
  ],
  observe: ['Chọn kim loại Na: chỉ điện phân nóng chảy mới điều chế được (thử nhiệt luyện: không xảy ra).', 'Chọn Cu: cả ba phương pháp đều được nhưng thủy luyện và nhiệt luyện rẻ hơn.', 'Xem dãy điện hóa được tô màu theo phương pháp.'],
  exam: ['Chọn phương pháp điều chế phù hợp cho từng kim loại; viết PTHH.', 'Tính khối lượng kim loại/ thể tích khí trong nhiệt luyện và điện phân nóng chảy (Faraday).'],
  params: [
    { key: 'method', label: 'Phương pháp', type: 'select', value: 'pyro', options: Object.entries(METHODS).map(([k, v]) => [k, v.name]) },
    { key: 'metal', label: 'Kim loại muốn điều chế', type: 'select', value: 'Fe', options: ['Na', 'Mg', 'Al', 'Zn', 'Fe', 'Cu', 'Ag'].map((m) => [m, m]) },
    { key: 'temp', label: 'Nhiệt độ (nhiệt luyện)', min: 200, max: 1500, step: 50, value: 900, unit: '°C' }
  ],
  create() {
    const st = { prog: 0, bub: new Bubbles() };
    return {
      onParam(k) { if (k !== 'temp') st.prog = 0; },
      update(dt, p) {
        const idx = SERIES.indexOf(p.metal);
        const ok = p.method === 'electro' ? true : p.method === 'pyro' ? idx > SERIES.indexOf('Al') && p.temp >= 500 : idx >= SERIES.indexOf('Cu');
        if (ok) st.prog = clamp(st.prog + dt * 0.12 * (p.method === 'pyro' ? p.temp / 900 : 1), 0, 1);
        if (st.geo && ok && Math.random() < 0.6) st.bub.spawn(st.geo.x, st.geo.y, 1, { spread: 30 });
        if (st.geo) st.bub.update(dt, st.geo.top);
      },
      draw(g, w, h, p, t) {
        const m = METHODS[p.method];
        const idx = SERIES.indexOf(p.metal);
        const ok = p.method === 'electro' ? true : p.method === 'pyro' ? idx > SERIES.indexOf('Al') && p.temp >= 500 : idx >= SERIES.indexOf('Cu');
        const bx = 40, by = 90, bw = 240, bh = 220;
        text(g, m.name, 30, 40, { size: 13, weight: '700' });
        if (p.method === 'pyro') {
          g.fillStyle = '#475569'; roundRect(g, bx, by, bw, bh, 12); g.fill();
          g.fillStyle = mixColor('#7f1d1d', '#9ca3af', st.prog); roundRect(g, bx + 40, by + 60, bw - 80, bh - 100, 8); g.fill();
          text(g, st.prog > 0.6 ? p.metal : `${p.metal}ₓOᵧ`, bx + bw / 2, by + bh / 2 + 10, { size: 18, align: 'center', color: '#fff', weight: '800' });
          arrow(g, bx - 10, by + bh / 2, bx + 40, by + bh / 2, '#a3e635', 3); text(g, 'CO / H₂ / C', bx - 10, by + bh / 2 - 14, { size: 10.5, color: '#a3e635' });
          arrow(g, bx + bw - 40, by + 30, bx + bw + 20, by - 10, '#94a3b8', 2); text(g, 'CO₂', bx + bw + 24, by - 6, { size: 10.5, color: COLORS.muted });
          flame(g, bx + bw / 2, by + bh + 40, 0.6 + p.temp / 1500, '#f97316', t); label(g, `${p.temp} °C`, bx + bw / 2, by + bh + 58, { size: 11 });
          if (!ok) label(g, idx <= SERIES.indexOf('Al') ? `${p.metal} quá mạnh – CO/C không khử được oxide` : 'nhiệt độ quá thấp', bx + bw / 2, by - 16, { size: 10.5, color: COLORS.danger });
        } else if (p.method === 'hydro') {
          const r = beaker(g, bx, by, bw, bh, 0.75, withAlpha(mixColor(p.metal === 'Cu' ? '#60a5fa' : '#e2e8f0', '#bbf7d0', st.prog), 0.5), { title: `dung dịch muối ${p.metal}` });
          st.geo = null;
          g.fillStyle = '#78716c'; roundRect(g, bx + bw / 2 - 12, by - 20, 24, bh - 30, 3); g.fill(); text(g, 'Fe/Zn', bx + bw / 2, by + 20, { size: 9, align: 'center', color: '#0b1020', weight: '800' });
          if (ok) { g.fillStyle = p.metal === 'Cu' ? '#d97706' : '#e5e7eb'; for (let i = 0; i < 10; i++) { const y = by + 60 + i * 12; const ww = 8 * st.prog; g.fillRect(bx + bw / 2 - 12 - ww, y, 24 + 2 * ww, 9); } label(g, `${p.metal} bám lên thanh`, bx + bw / 2, by + bh - 20, { size: 10.5, color: COLORS.warn }); }
          else label(g, `${p.metal} đứng trước Fe/Zn → không đẩy được; ${p.metal === 'Na' || p.metal === 'Mg' || p.metal === 'Al' ? 'muối của nó trong nước không bị khử' : ''}`, bx + bw / 2, by - 36, { size: 10, color: COLORS.danger });
        } else {
          g.fillStyle = '#475569'; roundRect(g, bx, by, bw, bh, 12); g.fill();
          const melt = p.metal === 'Al' ? 'Al₂O₃ + cryolite nóng chảy' : `${p.metal}Cl nóng chảy`;
          g.fillStyle = withAlpha('#f97316', 0.5); g.fillRect(bx + 10, by + 60, bw - 20, bh - 70);
          text(g, melt, bx + bw / 2, by + bh - 20, { size: 10, align: 'center', color: COLORS.text });
          const cx = bx + 60, ax = bx + bw - 60;
          g.fillStyle = '#1f2937'; g.fillRect(cx - 10, by + 20, 20, bh - 60); g.fillRect(ax - 10, by + 20, 20, bh - 60);
          text(g, 'cathode −', cx, by + 12, { size: 9.5, align: 'center', color: '#f87171' }); text(g, 'anode + (than chì)', ax, by + 12, { size: 9.5, align: 'center', color: '#60a5fa' });
          st.geo = { x: ax, y: by + bh - 30, top: by + 60 };
          st.bub.draw(g);
          g.fillStyle = '#e5e7eb'; g.globalAlpha = st.prog; g.fillRect(cx - 10 - 8 * st.prog, by + 100, 20 + 16 * st.prog, bh - 140); g.globalAlpha = 1;
          label(g, `${p.metal} lỏng bám/chìm ở cathode`, cx, by + bh + 20, { size: 10, color: COLORS.warn }); label(g, p.metal === 'Al' ? 'O₂ (→ CO, CO₂) ở anode' : 'Cl₂ ở anode', ax, by + bh + 20, { size: 10, color: '#60a5fa' });
          flame(g, bx + bw / 2, by + bh + 50, 0.9, '#f97316', t);
        }
        bar(g, bx, by + bh + 80, bw, 10, st.prog, '#4ade80', `Tiến độ: ${Math.round(st.prog * 100)}%`);
        // dãy điện hóa + phương pháp
        const rx = bx + bw + 60, rw = w - rx - 30;
        if (rw > 200) {
          text(g, 'Chọn phương pháp theo dãy điện hóa', rx, 80, { size: 13, weight: '700' });
          const step = rw / (SERIES.length - 1);
          const colorFor = (i) => i <= SERIES.indexOf('Al') ? '#f87171' : i < SERIES.indexOf('Cu') ? '#fbbf24' : '#4ade80';
          g.fillStyle = 'rgba(248,113,113,0.2)'; g.fillRect(rx, 100, step * 4.5, 24); g.fillStyle = 'rgba(251,191,36,0.2)'; g.fillRect(rx + step * 4.5, 100, step * 6, 24); g.fillStyle = 'rgba(74,222,128,0.2)'; g.fillRect(rx + step * 10.5, 100, rw - step * 10.5, 24);
          SERIES.forEach((s, i) => { const x = rx + i * step; circle(g, x, 112, s === p.metal ? 8 : 4, colorFor(i)); text(g, s, x, 140, { size: 10, align: 'center', color: s === p.metal ? COLORS.text : COLORS.muted, weight: s === p.metal ? '800' : '500' }); });
          text(g, 'điện phân nóng chảy', rx + step * 2, 162, { size: 9.5, align: 'center', color: '#f87171' }); text(g, 'nhiệt luyện / điện phân dd', rx + step * 7.5, 162, { size: 9.5, align: 'center', color: '#fbbf24' }); text(g, 'thủy luyện', rx + step * 12.5, 162, { size: 9.5, align: 'center', color: '#4ade80' });
          text(g, m.eq, rx, 200, { size: 11.5, color: COLORS.text });
          text(g, `Áp dụng cho: ${m.for}`, rx, 224, { size: 11, color: COLORS.muted }); text(g, `Chất khử: ${m.reducer}`, rx, 244, { size: 11, color: COLORS.muted });
          wrap(g, m.note, rx, 272, rw, 11, COLORS.muted);
          label(g, ok ? `✔ ${p.metal} điều chế được bằng phương pháp này` : `✘ Không phù hợp cho ${p.metal}`, rx + rw / 2, 340, { size: 11.5, color: ok ? '#4ade80' : '#f87171' });
        }
      },
      metrics(p) { const idx = SERIES.indexOf(p.metal); const best = idx <= SERIES.indexOf('Al') ? 'điện phân nóng chảy' : idx < SERIES.indexOf('Cu') ? 'nhiệt luyện' : 'thủy luyện / nhiệt luyện'; return [['Phương pháp phù hợp nhất', best], ['Tiến độ', `${Math.round(st.prog * 100)} %`]]; }
    };
  }
};
function wrap(g, str, x, y, maxW, size, color) { g.font = `500 ${size}px Inter, system-ui, sans-serif`; const words = str.split(' '); let line = '', yy = y; for (const wd of words) { const tt = line + wd + ' '; if (g.measureText(tt).width > maxW && line) { text(g, line, x, yy, { size, color }); line = wd + ' '; yy += size + 6; } else line = tt; } text(g, line, x, yy, { size, color }); }
