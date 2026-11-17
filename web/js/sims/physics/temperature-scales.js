import { COLORS, text, label, circle, roundRect, line, mixColor } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const POINTS = [[-273.15, '0 tuyệt đối'], [-196, 'N₂ lỏng sôi'], [-78.5, 'CO₂ rắn (đá khô)'], [0, 'nước đá tan'], [37, 'thân nhiệt'], [100, 'nước sôi (1 atm)'], [327, 'chì nóng chảy'], [1538, 'sắt nóng chảy']];

export default {
  id: 'physics-temperature-scales',
  subject: 'physics',
  chapter: 'thermal',
  title: 'Nhiệt độ, thang Celsius – Kelvin và nhiệt kế',
  summary: 'Kéo nhiệt độ để xem cùng một trạng thái trên ba thang Celsius, Kelvin, Fahrenheit; nhiệt kế chất lỏng dâng lên vì chất lỏng nở vì nhiệt. Mốc 0 K là độ không tuyệt đối.',
  equation: ['T (K) = t (°C) + 273,15', 't (°F) = 1,8·t (°C) + 32', 'ΔT (K) = Δt (°C): 1 K = 1 °C về độ lớn'],
  keywords: ['nhiệt độ', 'Celsius', 'Kelvin', 'Fahrenheit', 'nhiệt kế', 'độ không tuyệt đối', 'thang nhiệt độ', 'cân bằng nhiệt'],
  theory: [
    '**Nhiệt độ** cho biết mức độ nóng lạnh, gắn với **động năng trung bình** chuyển động nhiệt của phân tử. Hai vật tiếp xúc trao đổi nhiệt tới khi **cùng nhiệt độ** – đó là cơ sở của phép đo bằng nhiệt kế.',
    '**Thang Celsius** lấy mốc nước đá tan (0 °C) và nước sôi (100 °C) ở áp suất tiêu chuẩn. **Thang Kelvin** (thang nhiệt động, đơn vị SI) lấy **0 K = −273,15 °C** là độ không tuyệt đối – nhiệt độ thấp nhất, khi đó động năng chuyển động nhiệt cực tiểu. Mỗi độ chia của hai thang bằng nhau.',
    'Nhiệt kế chất lỏng hoạt động dựa trên sự **nở vì nhiệt**; còn có nhiệt kế điện trở, cặp nhiệt điện, hồng ngoại.'
  ],
  observe: ['Kéo về −273 °C: thang Kelvin chỉ 0 – không thể thấp hơn.', 'Ở −40 thì °C và °F trùng nhau.', 'Đổi từ 20 °C lên 30 °C: tăng 10 °C cũng là tăng 10 K.'],
  exam: ['Đổi đơn vị nhiệt độ giữa các thang; hiểu ΔT(K) = Δt(°C).', 'Ý nghĩa của độ không tuyệt đối.'],
  params: [
    { key: 't', label: 'Nhiệt độ', min: -273, max: 400, step: 1, value: 25, unit: '°C' },
    { key: 'fluid', label: 'Chất lỏng nhiệt kế', type: 'select', value: 'alcohol', options: [['alcohol', 'Rượu màu (−110 → 78 °C)'], ['hg', 'Thủy ngân (−39 → 357 °C)']] }
  ],
  create() {
    const st = { shown: 25 };
    return {
      update(dt, p) { st.shown += (p.t - st.shown) * (1 - Math.exp(-dt * 3)); },
      draw(g, w, h, p) {
        const tC = st.shown, tK = tC + 273.15, tF = tC * 1.8 + 32;
        const cols = [['Celsius (°C)', tC, -273.15, 400, '#38bdf8'], ['Kelvin (K)', tK, 0, 673.15, '#4ade80'], ['Fahrenheit (°F)', tF, -459.67, 752, '#f472b6']];
        const top = 70, bottom = h - 70;
        const colW = Math.min(150, (w * 0.6) / 3);
        cols.forEach(([name, val, mn, mx, c], i) => {
          const x = 70 + i * colW;
          const Y = (v) => bottom - ((v - mn) / (mx - mn)) * (bottom - top);
          line(g, x, top, x, bottom, '#475569', 2);
          for (let k = 0; k <= 8; k++) { const v = mn + (mx - mn) * k / 8; line(g, x - 6, Y(v), x, Y(v), '#475569', 1.5); text(g, v.toFixed(0), x - 10, Y(v) + 4, { size: 9.5, align: 'right', color: COLORS.muted }); }
          circle(g, x, Y(val), 7, c, '#0b1020');
          label(g, `${val.toFixed(name.startsWith('K') ? 2 : 1)}`, x + 40, Y(val), { size: 11, color: c });
          text(g, name, x, top - 20, { size: 11.5, align: 'center', weight: '700', color: c });
          if (i === 0) for (const [v, nm] of POINTS) { if (v < -273.15 || v > 400) continue; line(g, x, Y(v), x + colW * 2 + 10, Y(v), 'rgba(148,163,184,0.12)', 1, [3, 4]); }
        });
        // các mốc
        const mx = 70 + 2 * colW + 60;
        const Yc = (v) => bottom - ((v + 273.15) / 673.15) * (bottom - top);
        for (const [v, nm] of POINTS) { if (v > 400) continue; text(g, `${nm} (${v} °C)`, mx, Yc(v) + 4, { size: 10, color: Math.abs(v - tC) < 15 ? COLORS.text : COLORS.muted }); }
        // nhiệt kế
        const tx = Math.max(mx + 170, w - 120), ty = top, tH = bottom - top - 30;
        const range = p.fluid === 'hg' ? [-39, 357] : [-110, 78];
        const ok = tC >= range[0] && tC <= range[1];
        const level = clamp((tC - range[0]) / (range[1] - range[0]), 0, 1);
        if (tx + 40 < w) {
          g.strokeStyle = COLORS.glass; g.lineWidth = 2; roundRect(g, tx - 8, ty, 16, tH, 8); g.stroke();
          circle(g, tx, ty + tH + 14, 16, p.fluid === 'hg' ? '#cbd5e1' : '#ef4444', COLORS.glass);
          g.fillStyle = p.fluid === 'hg' ? '#cbd5e1' : '#ef4444'; g.fillRect(tx - 4, ty + tH * (1 - level), 8, tH * level + 4);
          text(g, `${range[0]} °C`, tx + 14, ty + tH, { size: 9.5, color: COLORS.muted }); text(g, `${range[1]} °C`, tx + 14, ty + 8, { size: 9.5, color: COLORS.muted });
          if (!ok) label(g, tC < range[0] ? 'chất lỏng đông đặc!' : 'chất lỏng sôi – vỡ nhiệt kế!', tx, ty - 16, { size: 10, color: COLORS.danger, align: 'right' });
        }
        if (tC <= -272.5) label(g, 'ĐỘ KHÔNG TUYỆT ĐỐI – động năng nhiệt cực tiểu', w / 2, h - 30, { size: 12, color: '#93c5fd' });
        else text(g, `${tC.toFixed(1)} °C = ${tK.toFixed(2)} K = ${tF.toFixed(1)} °F`, w / 2, h - 26, { size: 13, align: 'center', weight: '700' });
      },
      metrics(p) { const tC = p.t; return [['Celsius', `${tC} °C`], ['Kelvin', `${(tC + 273.15).toFixed(2)} K`], ['Fahrenheit', `${(tC * 1.8 + 32).toFixed(1)} °F`]]; }
    };
  }
};
