import { COLORS, text, label, line, arrow, roundRect, polyline } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const BANDS = [
  ['Sóng vô tuyến', 1e-1, 1e4, '#64748b'], ['Vi sóng', 1e-3, 1e-1, '#94a3b8'], ['Hồng ngoại', 7.6e-7, 1e-3, '#f87171'],
  ['Ánh sáng nhìn thấy', 3.8e-7, 7.6e-7, '#fde047'], ['Tử ngoại', 1e-8, 3.8e-7, '#a78bfa'], ['Tia X', 1e-11, 1e-8, '#60a5fa'], ['Tia γ', 1e-14, 1e-11, '#c084fc']
];

export default {
  id: 'physics-em-wave',
  subject: 'physics',
  chapter: 'magnetism',
  title: 'Điện từ trường và sóng điện từ',
  summary: 'Điện trường và từ trường dao động vuông góc với nhau và với phương truyền, lan đi với tốc độ c. Kéo tần số để đi dọc thang sóng điện từ từ vô tuyến tới tia γ.',
  equation: ['c = λ·f = 3·10⁸ m/s (trong chân không)', 'E ⊥ B ⊥ v ; E và B dao động cùng pha', 'Năng lượng photon ε = h·f'],
  keywords: ['sóng điện từ', 'điện từ trường', 'Maxwell', 'thang sóng điện từ', 'bước sóng', 'tần số', 'sóng vô tuyến', 'tia X'],
  theory: [
    'Theo Maxwell: **từ trường biến thiên sinh ra điện trường xoáy** và **điện trường biến thiên sinh ra từ trường**. Hai trường này không tách rời nhau, gọi là **điện từ trường**, lan truyền trong không gian thành **sóng điện từ**.',
    'Sóng điện từ là **sóng ngang**: vectơ E, B và phương truyền đôi một vuông góc; E và B dao động **cùng pha**. Sóng điện từ truyền được **trong chân không** với tốc độ c = 3·10⁸ m/s; tuân theo phản xạ, khúc xạ, giao thoa.',
    '**Thang sóng điện từ** sắp theo bước sóng giảm dần: vô tuyến, vi sóng, hồng ngoại, ánh sáng nhìn thấy, tử ngoại, tia X, tia γ. Bước sóng càng ngắn thì năng lượng photon càng lớn, khả năng đâm xuyên và ion hóa càng mạnh.'
  ],
  observe: ['Quan sát E (đỏ) và B (xanh) luôn vuông góc, cùng đạt cực đại.', 'Tăng tần số: bước sóng ngắn lại, chuyển sang vùng có năng lượng cao hơn.', 'Tần số 100 MHz là đài FM; 2,4 GHz là Wi-Fi và lò vi sóng.'],
  exam: ['Tính λ, f của sóng điện từ; xếp thứ tự các bức xạ trên thang sóng.', 'Đặc điểm và ứng dụng của từng loại sóng.'],
  params: [
    { key: 'logf', label: 'Tần số (log₁₀ Hz)', min: 4, max: 21, step: 0.1, value: 8, decimals: 1, help: '8 = 100 MHz (FM), 14.7 ≈ ánh sáng xanh, 18 = tia X' },
    { key: 'speed', label: 'Tốc độ minh họa', min: 0.2, max: 2, step: 0.1, value: 1, decimals: 1 }
  ],
  create() {
    const st = { ph: 0 };
    return {
      update(dt, p) { st.ph += dt * 3 * p.speed; },
      draw(g, w, h, p) {
        const f = Math.pow(10, p.logf), lam = 3e8 / f;
        const band = BANDS.find((b) => lam >= b[1] && lam < b[2]) || (lam >= 1e4 ? BANDS[0] : BANDS[6]);
        // mô hình 3D giả: trục x truyền, E theo trục đứng, B theo trục xiên
        const ox = 60, oy = 190, L = w - 120;
        line(g, ox, oy, ox + L, oy, '#94a3b8', 1.5); arrow(g, ox + L - 30, oy, ox + L, oy, '#94a3b8', 1.5); text(g, 'phương truyền v', ox + L - 10, oy + 18, { size: 10.5, align: 'right', color: COLORS.muted });
        const cycles = 3 + (p.logf - 4) / 17 * 3;
        const Ept = [], Bpt = [];
        for (let i = 0; i <= 200; i++) { const u = i / 200; const ph = u * cycles * Math.PI * 2 - st.ph; const a = Math.sin(ph); Ept.push([ox + u * L, oy - a * 80]); Bpt.push([ox + u * L + a * 30, oy + a * 28]); }
        for (let i = 0; i <= 200; i += 8) { line(g, Ept[i][0], oy, Ept[i][0], Ept[i][1], 'rgba(248,113,113,0.35)', 1); line(g, ox + i / 200 * L, oy, Bpt[i][0], Bpt[i][1], 'rgba(56,189,248,0.35)', 1); }
        polyline(g, Ept, '#f87171', 2.5); polyline(g, Bpt, '#38bdf8', 2.5);
        text(g, 'E', ox + 4, oy - 90, { size: 14, weight: '800', color: '#f87171' }); text(g, 'B', ox + 40, oy + 50, { size: 14, weight: '800', color: '#38bdf8' });
        // đánh dấu bước sóng
        const lamPx = L / cycles; line(g, ox + 20, oy - 110, ox + 20 + lamPx, oy - 110, '#fbbf24', 1.5); text(g, `λ = ${fmtLen(lam)}`, ox + 20 + lamPx / 2, oy - 116, { size: 11, align: 'center', color: '#fbbf24' });
        // thang sóng
        const sy = h - 110, sx = 60, sw = w - 120;
        text(g, 'Thang sóng điện từ (bước sóng giảm dần →)', sx, sy - 14, { size: 12, weight: '700' });
        const lmin = -14, lmax = 4;
        for (const [nm, a, b, c] of BANDS) { const x1 = sx + (lmax - Math.log10(b)) / (lmax - lmin) * sw, x2 = sx + (lmax - Math.log10(a)) / (lmax - lmin) * sw; g.fillStyle = c; g.globalAlpha = nm === band[0] ? 0.95 : 0.4; roundRect(g, x1, sy, Math.max(4, x2 - x1), 28, 4); g.fill(); g.globalAlpha = 1; text(g, nm, (x1 + x2) / 2, sy + 46, { size: 9.5, align: 'center', color: nm === band[0] ? COLORS.text : COLORS.muted }); }
        const xl = sx + (lmax - clamp(Math.log10(lam), lmin, lmax)) / (lmax - lmin) * sw;
        g.fillStyle = '#fff'; g.beginPath(); g.moveTo(xl, sy - 2); g.lineTo(xl - 6, sy - 12); g.lineTo(xl + 6, sy - 12); g.closePath(); g.fill();
        label(g, `f = ${fmtF(f)} → ${band[0]}`, w / 2, 30, { size: 12, color: band[3] });
        text(g, `Năng lượng photon ε = hf = ${(6.626e-34 * f / 1.602e-19).toExponential(2)} eV`, sx, h - 20, { size: 11, color: COLORS.muted });
      },
      metrics(p) { const f = Math.pow(10, p.logf); const lam = 3e8 / f; const band = BANDS.find((b) => lam >= b[1] && lam < b[2]); return [['Tần số', fmtF(f)], ['Bước sóng', fmtLen(lam)], ['Vùng', band ? band[0] : lam >= 1e4 ? 'Sóng vô tuyến dài' : 'Tia γ']]; }
    };
  }
};
function fmtLen(m) { if (m >= 1000) return (m / 1000).toFixed(1) + ' km'; if (m >= 1) return m.toFixed(2) + ' m'; if (m >= 1e-2) return (m * 100).toFixed(1) + ' cm'; if (m >= 1e-3) return (m * 1000).toFixed(1) + ' mm'; if (m >= 1e-6) return (m * 1e6).toFixed(1) + ' μm'; if (m >= 1e-9) return (m * 1e9).toFixed(0) + ' nm'; return m.toExponential(1) + ' m'; }
function fmtF(f) { if (f >= 1e12) return f.toExponential(2) + ' Hz'; if (f >= 1e9) return (f / 1e9).toFixed(1) + ' GHz'; if (f >= 1e6) return (f / 1e6).toFixed(1) + ' MHz'; if (f >= 1e3) return (f / 1e3).toFixed(1) + ' kHz'; return f.toFixed(0) + ' Hz'; }
