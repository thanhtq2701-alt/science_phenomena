import { COLORS, text, label, testTube, flame, circle, line, mixColor, withAlpha, roundRect } from '../../core/draw.js';
import { clamp, TAU } from '../../core/engine.js';

const AGENTS = { heat: 'Đun nóng', acid: 'Thêm acid (HCl / giấm)', metal: 'Muối kim loại nặng (Pb2+, Cu2+)', alcohol: 'Ethanol đậm đặc', none: 'Không tác động' };

export default {
  id: 'chem-protein-denaturation',
  subject: 'chem',
  chapter: 'nitrogen',
  title: 'Protein: sự đông tụ (biến tính) và phản ứng màu',
  summary: 'Lòng trắng trứng trong suốt đông tụ thành khối trắng đục khi đun, gặp acid, muối kim loại nặng hay ethanol: cấu trúc không gian bị phá vỡ. Thêm phản ứng màu với HNO3 (vàng) và Cu(OH)2 (tím).',
  equation: ['Protein (cấu trúc bậc 2, 3, 4) →(t°, acid, base, Pb2+…) protein biến tính (mất cấu trúc không gian, đông tụ)', 'Protein + HNO3 đặc → kết tủa vàng (vòng benzene của Tyr, Phe)', 'Protein + Cu(OH)2 → phức màu tím (biuret)'],
  keywords: ['protein', 'đông tụ', 'biến tính', 'lòng trắng trứng', 'albumin', 'phản ứng màu', 'xanthoprotein', 'biuret', 'enzyme'],
  theory: [
    'Protein là polypeptide có **cấu trúc không gian** (xoắn α, gấp β, cuộn gập) giữ bởi liên kết hydrogen, cầu disulfide, tương tác kị nước. **Biến tính** là sự phá vỡ cấu trúc không gian này (không đứt liên kết peptide) do **nhiệt, acid/base, muối kim loại nặng, ethanol, cồn**; protein mất tính tan và hoạt tính sinh học → **đông tụ**.',
    'Ví dụ: luộc trứng, nấu riêu cua (đun), sữa chua (acid), ngộ độc kim loại nặng (Pb, Hg làm biến tính enzyme – vì thế uống sữa/lòng trắng trứng để giải độc tạm thời), sát trùng bằng cồn 70°.',
    'Nhận biết protein: **phản ứng biuret** với Cu(OH)2 cho màu **tím**; **phản ứng với HNO3 đặc** cho kết tủa **vàng** (protein chứa amino acid có vòng benzene).'
  ],
  observe: ['Chọn "Đun nóng" và tăng nhiệt độ qua 60 °C: dung dịch trắng đục dần, thành khối.', 'Thử HNO3 đặc: kết tủa vàng; Cu(OH)2: tím.', 'Enzyme (protein) cũng bị biến tính → giải thích vì sao sốt cao nguy hiểm.'],
  exam: ['Nêu hiện tượng khi đun lòng trắng trứng/ thêm acid; giải thích.', 'Nhận biết protein bằng phản ứng màu; so sánh với peptide ngắn.'],
  params: [
    { key: 'agent', label: 'Tác nhân', type: 'select', value: 'heat', options: Object.entries(AGENTS) },
    { key: 'temp', label: 'Nhiệt độ (khi đun)', min: 20, max: 100, step: 5, value: 40, unit: '°C' },
    { key: 'test', label: 'Thuốc thử màu', type: 'select', value: 'none', options: [['none', 'Không'], ['hno3', 'HNO3 đặc'], ['cuoh2', 'Cu(OH)2 / NaOH']] }
  ],
  create() {
    const st = { denat: 0, chains: [] };
    for (let i = 0; i < 4; i++) st.chains.push({ ph: Math.random() * TAU, cx: 0.25 + 0.5 * Math.random(), cy: 0.3 + 0.5 * Math.random() });
    return {
      onParam(k) { if (k === 'agent') st.denat = 0; },
      update(dt, p) {
        let rate = 0;
        if (p.agent === 'heat') rate = p.temp >= 60 ? 0.25 * (p.temp - 55) / 45 : 0;
        else if (p.agent === 'acid') rate = 0.2; else if (p.agent === 'metal') rate = 0.35; else if (p.agent === 'alcohol') rate = 0.15;
        st.denat = clamp(st.denat + rate * dt, 0, 1);
      },
      draw(g, w, h, p, t) {
        const tx = 120, ty = 80, tw = 90, th = 260;
        let liquid = mixColor('#fef9c3', '#f8fafc', st.denat);
        let precip = null;
        if (p.test === 'hno3') { liquid = '#fde047'; precip = '#facc15'; } else if (p.test === 'cuoh2') { liquid = '#a78bfa'; }
        testTube(g, tx, ty, tw, th, 0.6, withAlpha(toHex(liquid), p.test === 'none' ? 0.3 + st.denat * 0.65 : 0.85), { precipitate: precip, precipHeight: 20, title: 'lòng trắng trứng (albumin)' });
        // khối đông tụ
        if (st.denat > 0.2 && p.test === 'none') { for (let i = 0; i < 9; i++) { const a = i * 0.7 + t * 0.2; const x = tx + tw / 2 + Math.cos(a) * 22 * st.denat, y = ty + 150 + Math.sin(a * 1.3) * 50; circle(g, x, y, 6 + 8 * st.denat, 'rgba(248,250,252,0.9)'); } }
        if (p.agent === 'heat' && p.temp > 30) flame(g, tx + tw / 2, ty + th + 50, 0.5 + (p.temp - 30) / 120, '#fbbf24', t);
        if (p.agent !== 'heat' && p.agent !== 'none') { g.fillStyle = '#cbd5e1'; g.fillRect(tx + tw / 2 - 4, ty - 60, 8, 44); const u = (t * 1.5) % 1; circle(g, tx + tw / 2, ty - 10 + u * 60, 3, p.agent === 'metal' ? '#60a5fa' : '#e2e8f0'); }
        label(g, p.test === 'hno3' ? 'KẾT TỦA VÀNG (xanthoprotein)' : p.test === 'cuoh2' ? 'MÀU TÍM (biuret)' : st.denat > 0.7 ? 'ĐÔNG TỤ – trắng đục, kết khối' : st.denat > 0.2 ? 'bắt đầu vẩn đục' : 'trong suốt, hơi vàng', tx + tw / 2, ty - 16 - (p.agent !== 'heat' && p.agent !== 'none' ? 50 : 0), { size: 11, color: COLORS.text });
        // mô hình cấu trúc protein bên phải
        const rx = Math.max(330, w * 0.42), rw = w - rx - 30, ry = 80;
        text(g, 'Cấu trúc không gian của protein', rx, 60, { size: 13, weight: '700' });
        g.fillStyle = 'rgba(30,41,59,0.5)'; roundRect(g, rx, ry, rw, 220, 10); g.fill();
        st.chains.forEach((c, k) => {
          const cx = rx + c.cx * rw, cy = ry + c.cy * 200;
          g.strokeStyle = ['#f87171', '#60a5fa', '#4ade80', '#fbbf24'][k]; g.lineWidth = 3; g.beginPath();
          for (let i = 0; i <= 60; i++) { const u = i / 60; const fold = 1 - st.denat; // cuộn gập → duỗi
            const x = cx + (u - 0.5) * (40 + 160 * st.denat) + Math.cos(u * 18 + c.ph) * 18 * fold; const y = cy + Math.sin(u * 18 + c.ph + t * 0.5) * 18 * fold + Math.sin(u * 6 + t + k) * 6 * st.denat; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
          g.stroke();
        });
        if (st.denat > 0.5) for (let i = 0; i < 3; i++) for (let j = i + 1; j < 4; j++) { const a = st.chains[i], b = st.chains[j]; line(g, rx + a.cx * rw, ry + a.cy * 200, rx + b.cx * rw, ry + b.cy * 200, 'rgba(226,232,240,0.25)', 1, [3, 3]); }
        text(g, st.denat < 0.3 ? 'chuỗi cuộn gập gọn, tan trong nước, có hoạt tính' : st.denat < 0.7 ? 'liên kết hydrogen bị phá → chuỗi duỗi ra' : 'chuỗi duỗi, dính vào nhau → đông tụ, mất hoạt tính', rx, ry + 240, { size: 11.5, color: COLORS.muted });
        text(g, `Tác nhân: ${AGENTS[p.agent]}${p.agent === 'heat' ? ` (${p.temp} °C, đông tụ từ ~60 °C)` : ''}`, rx, ry + 262, { size: 11.5, color: COLORS.muted });
        text(g, 'Liên kết peptide KHÔNG đứt – biến tính ≠ thủy phân', rx, ry + 284, { size: 11, color: COLORS.warn });
      },
      metrics(p) { return [['Mức biến tính', `${Math.round(st.denat * 100)} %`], ['Hoạt tính sinh học', st.denat > 0.5 ? 'mất' : 'còn'], ['Phản ứng màu', p.test === 'hno3' ? 'vàng' : p.test === 'cuoh2' ? 'tím' : '—']]; }
    };
  }
};
function toHex(c) { if (c.startsWith('#')) return c; const m = c.match(/\d+/g); return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join(''); }
