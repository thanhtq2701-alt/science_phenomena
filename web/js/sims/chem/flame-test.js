import { COLORS, text, label, circle, line, arrow, roundRect, withAlpha } from '../../core/draw.js';
import { TAU, clamp } from '../../core/engine.js';

const ELEMENTS = {
  Li: { name: 'Lithium', color: '#ef4444', vi: 'đỏ tía', wl: 671 },
  Na: { name: 'Sodium', color: '#facc15', vi: 'vàng', wl: 589 },
  K: { name: 'Potassium', color: '#c084fc', vi: 'tím', wl: 766 },
  Ca: { name: 'Calcium', color: '#fb923c', vi: 'đỏ cam', wl: 622 },
  Sr: { name: 'Strontium', color: '#dc2626', vi: 'đỏ son', wl: 650 },
  Ba: { name: 'Barium', color: '#a3e635', vi: 'lục vàng', wl: 524 },
  Cu: { name: 'Copper (so sánh)', color: '#22d3ee', vi: 'xanh lục lam', wl: 515 }
};

export default {
  id: 'chem-flame-test',
  subject: 'chem',
  chapter: 'group-ia-iia',
  title: 'Màu ngọn lửa của kim loại nhóm IA, IIA',
  summary: 'Đưa muối kim loại vào ngọn lửa: electron bị kích thích lên mức cao rồi rơi xuống phát ra photon có màu đặc trưng. Ứng dụng trong pháo hoa và nhận biết ion.',
  equation: ['Nhiệt → e⁻ (mức thấp) → e⁻ (mức cao)  →  e⁻ rơi xuống + phát photon (λ đặc trưng)', 'E_photon = hc/λ  ;  Na: λ = 589 nm (vàng)'],
  keywords: ['màu ngọn lửa', 'thử màu lửa', 'pháo hoa', 'kim loại kiềm', 'kiềm thổ', 'quang phổ'],
  theory: [
    'Khi đốt hợp chất của kim loại IA, IIA, nhiệt của ngọn lửa làm **electron nhảy lên mức năng lượng cao hơn**. Khi **rơi về mức thấp**, electron phát ra **photon có năng lượng xác định** → ánh sáng màu đặc trưng cho từng nguyên tố.',
    'Màu: **Li đỏ tía, Na vàng, K tím, Ca đỏ cam, Sr đỏ son, Ba lục vàng**. Màu vàng của Na rất mạnh nên dễ che các màu khác (dùng kính coban xanh để lọc).',
    'Ứng dụng: nhận biết ion kim loại, làm pháo hoa (Sr đỏ, Ba lục, Na vàng, Cu xanh).'
  ],
  observe: ['Chọn từng nguyên tố để xem màu và bước sóng; so sánh vị trí trên dải quang phổ.', 'Nhìn sơ đồ mức năng lượng: bước nhảy lớn → photon năng lượng cao → λ ngắn (xanh/tím).'],
  exam: ['Nhận biết Na+, K+, Ca2+, Ba2+ bằng màu ngọn lửa.', 'Giải thích hiện tượng dựa trên cấu hình electron và mức năng lượng.'],
  params: [
    { key: 'el', label: 'Nguyên tố (muối chloride)', type: 'select', value: 'Na', options: Object.entries(ELEMENTS).map(([k, v]) => [k, `${k} – ${v.name}`]) }
  ],
  create() {
    const st = { photons: [], ePhase: 0 };
    return {
      update(dt, p) {
        st.ePhase = (st.ePhase + dt * 0.8) % 1;
        if (Math.random() < 0.5) st.photons.push({ x: 0, y: 0, a: -Math.PI / 2 + (Math.random() - .5) * 2.2, s: 60 + Math.random() * 60, life: 1 });
        for (const ph of st.photons) { ph.x += Math.cos(ph.a) * ph.s * dt; ph.y += Math.sin(ph.a) * ph.s * dt; ph.life -= dt * 0.8; }
        st.photons = st.photons.filter((x) => x.life > 0);
      },
      draw(g, w, h, p, t) {
        const el = ELEMENTS[p.el];
        // Đèn + lửa
        const fx = Math.min(200, w * 0.25), fy = h - 80;
        g.fillStyle = '#475569'; roundRect(g, fx - 40, fy, 80, 50, 8); g.fill(); g.fillStyle = '#64748b'; g.fillRect(fx - 6, fy - 30, 12, 32);
        text(g, 'đèn khí', fx, fy + 32, { size: 10.5, align: 'center', color: COLORS.muted });
        // ngọn lửa màu
        const flick = 1 + 0.06 * Math.sin(t * 23) + 0.04 * Math.sin(t * 37);
        const grd = g.createRadialGradient(fx, fy - 90, 5, fx, fy - 90, 110);
        grd.addColorStop(0, '#fff'); grd.addColorStop(0.25, el.color); grd.addColorStop(0.7, withAlpha(el.color, 0.4)); grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        g.beginPath(); g.ellipse(fx, fy - 95, 50 * flick, 110 * flick, 0, 0, TAU); g.fill();
        g.fillStyle = withAlpha('#38bdf8', 0.5); g.beginPath(); g.ellipse(fx, fy - 20, 14, 26, 0, 0, TAU); g.fill();
        // dây platinum
        g.strokeStyle = '#cbd5e1'; g.lineWidth = 2; g.beginPath(); g.moveTo(fx + 120, fy - 180); g.lineTo(fx + 10, fy - 100); g.stroke(); circle(g, fx + 8, fy - 100, 6, null, '#cbd5e1');
        text(g, `dây Pt nhúng ${p.el}Cl`, fx + 125, fy - 186, { size: 10.5, color: COLORS.muted });
        // photon
        for (const ph of st.photons) { g.globalAlpha = ph.life; circle(g, fx + ph.x, fy - 90 + ph.y, 2.5, el.color); }
        g.globalAlpha = 1;
        label(g, `${p.el}: ngọn lửa màu ${el.vi}`, fx, 40, { size: 13, color: el.color });
        // Sơ đồ mức năng lượng
        const ex = Math.max(fx + 200, w * 0.45), ey = 70, ew = 200;
        text(g, 'Mức năng lượng electron', ex, ey - 14, { size: 13, weight: '700' });
        const lowY = ey + 170, highY = ey + 40;
        line(g, ex, lowY, ex + ew, lowY, '#94a3b8', 2); text(g, 'E₁ (cơ bản)', ex + ew + 6, lowY + 4, { size: 10.5, color: COLORS.muted });
        line(g, ex, highY, ex + ew, highY, '#94a3b8', 2); text(g, 'E₂ (kích thích)', ex + ew + 6, highY + 4, { size: 10.5, color: COLORS.muted });
        // electron: nửa chu kì đi lên (hấp thụ nhiệt), nửa chu kì rơi xuống (phát photon)
        const ph = st.ePhase;
        const up = ph < 0.5;
        const u = up ? ph / 0.5 : (ph - 0.5) / 0.5;
        const eyy = up ? lowY + (highY - lowY) * easeOut(u) : highY + (lowY - highY) * easeIn(u);
        const exx = up ? ex + 50 : ex + 150;
        circle(g, exx, eyy, 7, '#fbbf24'); text(g, 'e⁻', exx, eyy - 12, { size: 9, align: 'center', color: '#fde68a' });
        if (up) { arrow(g, ex + 50, lowY - 8, ex + 50, highY + 10, 'rgba(251,191,36,0.4)', 1.5); text(g, 'hấp thụ nhiệt', ex + 50, lowY + 18, { size: 10, align: 'center', color: COLORS.warn }); }
        else { arrow(g, ex + 150, highY + 8, ex + 150, lowY - 10, withAlpha(el.color, 0.6), 1.5); if (u > 0.7) { arrow(g, ex + 160, (highY + lowY) / 2, ex + 200, (highY + lowY) / 2 - 20, el.color, 2); text(g, 'photon λ = ' + el.wl + ' nm', ex + 180, (highY + lowY) / 2 - 28, { size: 10, align: 'center', color: el.color }); } }
        text(g, `ΔE = hc/λ = ${(1240 / el.wl).toFixed(2)} eV`, ex, lowY + 40, { size: 11.5, color: COLORS.muted });
        // Dải quang phổ
        const sx = ex, sy = lowY + 80, sw = Math.min(w - sx - 30, 360);
        text(g, 'Dải khả kiến (nm)', sx, sy - 8, { size: 11, color: COLORS.muted });
        for (let i = 0; i < 100; i++) { const wl = 380 + (i / 100) * 400; g.fillStyle = wlToColor(wl); g.fillRect(sx + (i / 100) * sw, sy, sw / 100 + 1, 18); }
        const px = sx + ((clamp(el.wl, 380, 780) - 380) / 400) * sw;
        g.fillStyle = '#fff'; g.beginPath(); g.moveTo(px, sy + 20); g.lineTo(px - 6, sy + 30); g.lineTo(px + 6, sy + 30); g.closePath(); g.fill();
        text(g, `${el.wl} nm`, px, sy + 44, { size: 10.5, align: 'center' });
        text(g, '380', sx, sy + 44, { size: 9, color: COLORS.muted }); text(g, '780', sx + sw, sy + 44, { size: 9, color: COLORS.muted, align: 'right' });
        // bảng màu
        const ty = sy + 70;
        Object.entries(ELEMENTS).forEach(([k, v], i) => { const x = sx + i * (sw / 7); circle(g, x + 10, ty, 8, v.color); text(g, k, x + 10, ty + 20, { size: 10, align: 'center', color: k === p.el ? COLORS.text : COLORS.muted, weight: k === p.el ? '800' : '500' }); });
      },
      metrics(p) { const el = ELEMENTS[p.el]; return [['Màu ngọn lửa', el.vi], ['Bước sóng chính', `${el.wl} nm`], ['Năng lượng photon', `${(1240 / el.wl).toFixed(2)} eV`]]; }
    };
  }
};
function easeOut(x) { return 1 - Math.pow(1 - x, 2); }
function easeIn(x) { return x * x; }
function wlToColor(wl) {
  let r = 0, g = 0, b = 0;
  if (wl < 440) { r = -(wl - 440) / 60; b = 1; } else if (wl < 490) { g = (wl - 440) / 50; b = 1; } else if (wl < 510) { g = 1; b = -(wl - 510) / 20; } else if (wl < 580) { r = (wl - 510) / 70; g = 1; } else if (wl < 645) { r = 1; g = -(wl - 645) / 65; } else { r = 1; }
  const f = wl > 700 ? 0.3 + 0.7 * (780 - wl) / 80 : wl < 420 ? 0.3 + 0.7 * (wl - 380) / 40 : 1;
  return `rgb(${Math.round(255 * r * f)},${Math.round(255 * g * f)},${Math.round(255 * b * f)})`;
}
