import { COLORS, text, label, circle, line, roundRect, arrow, plot, polyline } from '../../core/draw.js';
import { clamp, gauss } from '../../core/engine.js';

export default {
  id: 'physics-current-balance',
  subject: 'physics',
  chapter: 'magnetism',
  title: 'Thực hành đo cảm ứng từ bằng "cân dòng điện"',
  summary: 'Khung dây treo dưới đòn cân, cạnh đáy nằm trong khe nam châm. Cho dòng điện qua, lực từ kéo đáy khung xuống; đọc số chỉ cân, vẽ đồ thị F theo I và tính B từ hệ số góc: B = k/(N·L).',
  equation: ['F = N·B·I·L  (cạnh đáy vuông góc với B)', 'F = Δm·g (độ thay đổi số chỉ cân)', 'Đồ thị F – I là đường thẳng qua gốc, hệ số góc k = N·B·L ⇒ B = k/(N·L)'],
  keywords: ['cân dòng điện', 'cảm ứng từ', 'lực từ', 'thực hành', 'đo B', 'khung dây', 'nam châm chữ U', 'đồ thị'],
  theory: [
    'Bố trí: nam châm chữ U đặt trên **cân điện tử** (hoặc khung dây treo vào lực kế), khung dây N vòng có cạnh đáy dài L nằm ngang trong khe nam châm, vuông góc với đường sức. Nguồn một chiều và ampe kế điều chỉnh I.',
    'Dòng điện qua cạnh đáy chịu **lực từ F = N·B·I·L**; theo định luật III Newton, nam châm chịu phản lực ngược chiều nên **số chỉ cân thay đổi Δm** với F = Δm·g. Hai cạnh bên chịu lực triệt tiêu nhau.',
    'Thay đổi I, đo F, vẽ đồ thị F – I: các điểm nằm gần một đường thẳng qua gốc; hệ số góc k = NBL ⇒ **B = k/(N·L)**. Đảo chiều dòng điện thì Δm đổi dấu.'
  ],
  observe: ['Tăng I từng nấc rồi bấm "Ghi số liệu" để có ≥ 4 điểm.', 'Đảo chiều dòng điện: số chỉ cân giảm thay vì tăng.', 'So sánh B tính được với giá trị thật của nam châm.'],
  exam: ['Trình bày phương án đo B; xử lí số liệu bằng đồ thị F – I.', 'Xác định chiều lực từ bằng quy tắc bàn tay trái, giải thích số chỉ cân tăng/giảm.'],
  params: [
    { key: 'I', label: 'Cường độ dòng điện I', min: -4, max: 4, step: 0.5, value: 2, unit: 'A', decimals: 1 },
    { key: 'N', label: 'Số vòng khung N', min: 10, max: 100, step: 10, value: 50 },
    { key: 'Btrue', label: 'B thật của nam châm (ẩn khi đo)', min: 0.02, max: 0.2, step: 0.01, value: 0.08, unit: 'T', decimals: 2 }
  ],
  actions: [{ key: 'rec', label: '📝 Ghi số liệu' }, { key: 'clear', label: '🧹 Xóa số liệu' }],
  create() {
    const L = 0.04, g0 = 9.81, m0 = 312.40; // m, m/s², g số chỉ cân ban đầu
    const st = { data: [], read: m0 };
    return {
      onParam(k) { if (k === 'N' || k === 'Btrue') st.data = []; },
      action(key, p) { if (key === 'clear') { st.data = []; return; } if (key === 'rec') { const F = p.N * p.Btrue * p.I * L * (1 + gauss() * 0.02); st.data.push([p.I, F]); } },
      update(dt, p) { const F = p.N * p.Btrue * p.I * L; const target = m0 + F / g0 * 1000; st.read += (target - st.read) * (1 - Math.exp(-dt * 4)); },
      draw(g, w, h, p) {
        const F = p.N * p.Btrue * p.I * L;
        const cx = 170, cy = 200;
        // nam châm trên cân
        g.fillStyle = '#334155'; roundRect(g, cx - 120, cy + 90, 240, 40, 6); g.fill();
        text(g, `${st.read.toFixed(2)} g`, cx, cy + 117, { size: 16, align: 'center', color: '#4ade80', weight: '700' });
        text(g, 'cân điện tử', cx, cy + 148, { size: 10, align: 'center', color: COLORS.muted });
        g.fillStyle = '#ef4444'; roundRect(g, cx - 90, cy - 10, 40, 100, 4); g.fill(); g.fillStyle = '#3b82f6'; roundRect(g, cx + 50, cy - 10, 40, 100, 4); g.fill(); g.fillStyle = '#64748b'; g.fillRect(cx - 90, cy + 70, 180, 20);
        text(g, 'N', cx - 70, cy + 20, { size: 14, align: 'center', color: '#fff', weight: '800' }); text(g, 'S', cx + 70, cy + 20, { size: 14, align: 'center', color: '#fff', weight: '800' });
        for (let i = 0; i < 4; i++) arrow(g, cx - 46, cy + 4 + i * 14, cx + 46, cy + 4 + i * 14, 'rgba(56,189,248,0.4)', 1, 5);
        // khung dây treo từ giá
        line(g, cx - 140, 40, cx + 140, 40, '#94a3b8', 4); line(g, cx, 40, cx, 70, '#94a3b8', 2);
        g.strokeStyle = '#d97706'; g.lineWidth = 4; g.strokeRect(cx - 30, 70, 60, cy + 20 - 70);
        // cạnh đáy: mặt cắt dòng điện
        circle(g, cx, cy + 20, 9, '#fbbf24', '#0b1020'); if (p.I > 0) circle(g, cx, cy + 20, 3, '#0b1020'); else if (p.I < 0) { line(g, cx - 5, cy + 15, cx + 5, cy + 25, '#0b1020', 2); line(g, cx - 5, cy + 25, cx + 5, cy + 15, '#0b1020', 2); }
        // Quy ước: F > 0 là lực từ lên cạnh đáy hướng LÊN → phản lực lên nam châm hướng XUỐNG → số chỉ cân TĂNG
        if (Math.abs(F) > 1e-5) {
          const d = Math.sign(F);
          arrow(g, cx + 22, cy + 20, cx + 22, cy + 20 - d * 40, '#f87171', 2.5);
          text(g, `F lên khung ${d > 0 ? '↑' : '↓'}`, cx + 30, cy + 20 - d * 46, { size: 10, color: '#f87171' });
          label(g, d > 0 ? 'phản lực lên nam châm ↓ → cân TĂNG' : 'phản lực lên nam châm ↑ → cân GIẢM', cx, cy + 172, { size: 10.5, color: '#fca5a5' });
        }
        label(g, `I = ${p.I} A, N = ${p.N}, L = 4 cm`, cx, 20, { size: 11 });
        // đồ thị
        const px = 360, pw = w - px - 30, ph = h - 170;
        if (pw > 160) {
          const Fmax = Math.max(0.02, p.N * p.Btrue * 4 * L * 1.2);
          const P = plot(g, px, 50, pw, ph, { xmin: -4, xmax: 4, ymin: -Fmax, ymax: Fmax, xlabel: 'I (A)', ylabel: 'F (N)', title: 'Đồ thị F – I' });
          polyline(g, [[P.X(-4), P.Y(0)], [P.X(4), P.Y(0)]], COLORS.grid, 1); polyline(g, [[P.X(0), P.Y(-Fmax)], [P.X(0), P.Y(Fmax)]], COLORS.grid, 1);
          for (const [I, f] of st.data) circle(g, P.X(I), P.Y(f), 4, '#fbbf24');
          if (st.data.length >= 2) {
            const k = st.data.reduce((a, [I, f]) => a + I * f, 0) / Math.max(1e-9, st.data.reduce((a, [I]) => a + I * I, 0)); // hồi quy qua gốc
            polyline(g, [[P.X(-4), P.Y(-4 * k)], [P.X(4), P.Y(4 * k)]], '#4ade80', 2);
            const B = k / (p.N * L); const err = (B - p.Btrue) / p.Btrue * 100;
            text(g, `k = ${k.toFixed(4)} N/A  ⇒  B = k/(N·L) = ${B.toFixed(4)} T  (thật ${p.Btrue} T, sai số ${err >= 0 ? '+' : ''}${err.toFixed(1)}%)`, px, 50 + ph + 40, { size: 12, color: '#4ade80', weight: '700' });
          } else text(g, 'Ghi ít nhất 2 điểm (nên ≥ 4, cả I âm và dương).', px, 50 + ph + 40, { size: 11.5, color: COLORS.muted });
          text(g, `F hiện tại = Δm·g = ${((st.read - m0) / 1000 * g0).toFixed(4)} N`, px, 50 + ph + 62, { size: 11, color: COLORS.muted });
        }
      },
      metrics(p) { return [['Số chỉ cân', `${st.read.toFixed(2)} g`], ['Δm', `${(st.read - m0).toFixed(2)} g`], ['F = NBIL', `${(p.N * p.Btrue * p.I * L).toFixed(4)} N`], ['Điểm số liệu', st.data.length]]; }
    };
  }
};
