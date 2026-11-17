import { COLORS, text, label, circle, line, roundRect, flame, bar, mixColor } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

export default {
  id: 'bio-miller-urey',
  subject: 'bio',
  chapter: 'evolution',
  title: 'Phát sinh sự sống: thí nghiệm Miller – Urey (tiến hóa hóa học)',
  summary: 'Mô phỏng khí quyển nguyên thủy CH4, NH3, H2, hơi nước trong bình kín, phóng tia lửa điện và làm lạnh tuần hoàn: sau vài ngày nước chuyển nâu vì có amino acid và các chất hữu cơ đơn giản.',
  equation: ['CH4 + NH3 + H2 + H2O →(tia lửa điện, tuần hoàn) amino acid (glycine, alanine…) + chất hữu cơ khác', 'Tiến hóa hóa học → tiền sinh học → tiến hóa sinh học'],
  keywords: ['Miller Urey', 'phát sinh sự sống', 'tiến hóa hóa học', 'khí quyển nguyên thủy', 'amino acid', 'tiến hóa tiền sinh học', 'tế bào sơ khai'],
  theory: [
    'Theo quan niệm hiện đại, sự sống hình thành qua 3 giai đoạn: **tiến hóa hóa học** (từ chất vô cơ tạo chất hữu cơ đơn giản rồi phức tạp), **tiến hóa tiền sinh học** (hình thành tế bào sơ khai có màng, có khả năng nhân đôi), **tiến hóa sinh học** (từ tế bào nguyên thủy tới sinh giới ngày nay).',
    'Năm 1953, **Miller và Urey** cho hỗn hợp CH4, NH3, H2, hơi nước (mô phỏng khí quyển nguyên thủy, **không có O2**) tuần hoàn qua buồng **phóng tia lửa điện** (mô phỏng sét) và bộ làm lạnh. Sau một tuần, dung dịch xuất hiện nhiều **amino acid** và hợp chất hữu cơ – chứng minh chất hữu cơ có thể hình thành từ chất vô cơ bằng con đường hóa học.',
    'Vai trò của nguồn năng lượng tự nhiên (sét, tia tử ngoại, núi lửa) và việc không có O2 tự do (chất hữu cơ không bị oxi hóa phân hủy).'
  ],
  observe: ['Tắt tia lửa điện: hầu như không tạo chất hữu cơ.', 'Thêm O2 vào bình: chất hữu cơ tạo ra bị oxi hóa, hiệu suất giảm mạnh.', 'Để chạy lâu: dung dịch chuyển hồng rồi nâu.'],
  exam: ['Trình bày thí nghiệm Miller – Urey, mục đích và kết luận.', 'Các giai đoạn phát sinh sự sống; điều kiện của khí quyển nguyên thủy.'],
  params: [
    { key: 'spark', label: 'Phóng tia lửa điện', type: 'toggle', value: true },
    { key: 'o2', label: 'Có O2 trong khí quyển', type: 'toggle', value: false },
    { key: 'speed', label: 'Ngày / giây', min: 0.1, max: 2, step: 0.1, value: 0.5, decimals: 1 }
  ],
  create() {
    const st = { day: 0, org: 0, aa: { Glycine: 0, Alanine: 0, 'Aspartic acid': 0, 'Glutamic acid': 0 }, flash: 0, gas: [] };
    for (let i = 0; i < 26; i++) st.gas.push({ u: Math.random(), kind: ['CH₄', 'NH₃', 'H₂', 'H₂O'][i % 4] });
    return {
      onParam() { st.day = 0; st.org = 0; for (const k in st.aa) st.aa[k] = 0; },
      update(dt, p) {
        const days = dt * p.speed; st.day += days;
        const rate = (p.spark ? 1 : 0.02) * (p.o2 ? 0.08 : 1);
        st.org = clamp(st.org + rate * days * 0.12 - (p.o2 ? st.org * 0.2 * days : 0), 0, 1);
        const w = { Glycine: 0.45, Alanine: 0.3, 'Aspartic acid': 0.15, 'Glutamic acid': 0.1 };
        for (const k in st.aa) st.aa[k] = st.org * w[k];
        if (p.spark && Math.random() < 0.15) st.flash = 1; st.flash = Math.max(0, st.flash - dt * 6);
        for (const g of st.gas) g.u = (g.u + dt * 0.08) % 1;
      },
      draw(g, w, h, p, t) {
        const S = Math.min(1, w / 820);
        // vòng tuần hoàn: bình đun (dưới trái) → ống lên → buồng phóng điện (trên phải) → bộ làm lạnh → bẫy chữ U → về bình
        const A = [120 * S + 20, 300], B = [120 * S + 20, 90], C = [420 * S, 90], D = [420 * S, 300];
        const path = (u) => { const segs = [[A, B], [B, C], [C, D], [D, A]]; const k = Math.floor(u * 4), f = u * 4 - k; const [P0, P1] = segs[k % 4]; return [P0[0] + (P1[0] - P0[0]) * f, P0[1] + (P1[1] - P0[1]) * f]; };
        g.strokeStyle = COLORS.glass; g.lineWidth = 6; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.lineTo(...C); g.lineTo(...D); g.lineTo(...A); g.stroke();
        // buồng phóng điện
        circle(g, C[0], C[1] + 10, 54, mixColor('#0f172a', '#312e81', st.flash * 0.6), COLORS.glass, 3);
        line(g, C[0] - 50, C[1] + 10, C[0] - 12, C[1] + 10, '#94a3b8', 3); line(g, C[0] + 12, C[1] + 10, C[0] + 50, C[1] + 10, '#94a3b8', 3);
        if (p.spark && st.flash > 0.2) { g.strokeStyle = '#fde047'; g.lineWidth = 2; g.beginPath(); g.moveTo(C[0] - 12, C[1] + 10); for (let i = 1; i < 6; i++) g.lineTo(C[0] - 12 + i * 4.8, C[1] + 10 + (i % 2 ? -8 : 8)); g.stroke(); }
        text(g, 'buồng phóng tia lửa điện (sét)', C[0], C[1] - 56, { size: 10.5, align: 'center', color: '#fde047' });
        text(g, p.o2 ? 'khí: CH₄, NH₃, H₂, H₂O + O₂' : 'khí: CH₄, NH₃, H₂, H₂O (không O₂)', C[0], C[1] + 82, { size: 10, align: 'center', color: p.o2 ? COLORS.danger : COLORS.muted });
        // bộ làm lạnh
        g.fillStyle = 'rgba(56,189,248,0.2)'; g.fillRect(D[0] - 14, 170, 28, 100); text(g, 'làm lạnh', D[0] + 20, 220, { size: 10, color: '#7dd3fc' });
        // bình đun
        const liquid = mixColor('#bfdbfe', '#92400e', st.org);
        circle(g, A[0], A[1] + 20, 50, liquid, COLORS.glass, 3);
        flame(g, A[0], A[1] + 100, 0.7, '#fbbf24', t);
        text(g, 'nước "đại dương nguyên thủy"', A[0], A[1] + 120, { size: 10, align: 'center', color: COLORS.muted });
        for (const gp of st.gas) { const [x, y] = path(gp.u); text(g, gp.kind, x, y - 6, { size: 8.5, align: 'center', color: COLORS.muted }); circle(g, x, y, 2.5, '#e2e8f0'); }
        // kết quả
        const rx = Math.max(D[0] + 90, w * 0.6), rw = w - rx - 30;
        if (rw > 160) {
          text(g, `Ngày ${st.day.toFixed(1)}`, rx, 60, { size: 14, weight: '700' });
          bar(g, rx, 90, rw, 10, st.org, '#b45309', `Chất hữu cơ trong nước: ${Math.round(st.org * 100)}% (màu dung dịch)`);
          text(g, 'Amino acid phát hiện được:', rx, 140, { size: 12, weight: '700' });
          Object.entries(st.aa).forEach(([k, v], i) => bar(g, rx, 165 + i * 34, rw, 8, v / 0.45, '#4ade80', `${k}: ${(v * 100).toFixed(1)} đơn vị`));
          label(g, !p.spark ? 'không có năng lượng → gần như không phản ứng' : p.o2 ? 'O₂ oxi hóa phân hủy chất hữu cơ' : st.org > 0.5 ? 'Chất hữu cơ hình thành từ chất vô cơ ✔' : 'đang tích lũy…', rx + rw / 2, 320, { size: 11, color: !p.spark || p.o2 ? COLORS.danger : '#4ade80' });
        }
      },
      metrics() { return [['Ngày', st.day, 1], ['Chất hữu cơ', `${Math.round(st.org * 100)} %`], ['Glycine', st.aa.Glycine * 100, 1]]; }
    };
  }
};
