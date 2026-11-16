import { COLORS, text, label, circle, line, arrow, roundRect, bar } from '../../core/draw.js';
import { clamp, TAU, rand } from '../../core/engine.js';

export default {
  id: 'physics-fission-fusion',
  subject: 'physics',
  chapter: 'nuclear',
  title: 'Phân hạch dây chuyền và nhiệt hạch',
  summary: 'Neutron bắn vào U-235 làm hạt nhân vỡ thành hai mảnh và 2–3 neutron mới, gây phản ứng dây chuyền; so sánh với nhiệt hạch D + T → He + n ở nhiệt độ hàng trăm triệu độ.',
  equation: ['n + ²³⁵U → ¹⁴¹Ba + ⁹²Kr + 3n + ≈ 200 MeV', '²H + ³H → ⁴He + n + 17,6 MeV', 'Hệ số nhân neutron k: k < 1 tắt dần, k = 1 duy trì (lò), k > 1 bùng nổ (bom)'],
  keywords: ['phân hạch', 'nhiệt hạch', 'dây chuyền', 'uranium', 'neutron', 'lò phản ứng', 'thanh điều khiển', 'năng lượng hạt nhân'],
  theory: [
    '**Phân hạch**: hạt nhân nặng (U-235, Pu-239) hấp thụ neutron chậm rồi vỡ thành hai hạt nhân trung bình + 2–3 neutron + năng lượng ≈ 200 MeV. Các neutron này lại gây phân hạch tiếp → **phản ứng dây chuyền**.',
    '**Hệ số nhân neutron k** = số neutron gây được phân hạch tiếp theo trung bình. Cần **khối lượng tới hạn** để k ≥ 1. Trong lò phản ứng, **thanh điều khiển (Cd, B)** hấp thụ bớt neutron giữ k = 1; **chất làm chậm** (nước, graphite) làm neutron chậm lại để dễ bị U-235 bắt.',
    '**Nhiệt hạch**: hai hạt nhân nhẹ (D, T) kết hợp thành hạt nhân nặng hơn, tỏa năng lượng lớn **tính trên một nucleon** hơn phân hạch. Cần nhiệt độ ~10⁸ K để thắng lực đẩy Coulomb. Xảy ra trong lòng Mặt Trời; con người mới chỉ thực hiện được không kiểm soát (bom H) và thử nghiệm (ITER, tokamak).'
  ],
  observe: ['Tăng "thanh điều khiển" để k giảm xuống dưới 1: dây chuyền tắt.', 'Giảm mật độ U-235 (nhiên liệu nghèo): neutron thoát ra ngoài, k < 1.', 'Ở nhiệt hạch, giảm nhiệt độ dưới 50 triệu K: hạt nhân không đủ năng lượng để vượt rào Coulomb.'],
  exam: ['Viết và cân bằng phương trình phân hạch, nhiệt hạch; tính năng lượng tỏa ra theo độ hụt khối.', 'Điều kiện xảy ra phản ứng dây chuyền; vai trò của thanh điều khiển và chất làm chậm.'],
  params: [
    { key: 'mode', label: 'Phản ứng', type: 'select', value: 'fission', options: [['fission', 'Phân hạch U-235 (dây chuyền)'], ['fusion', 'Nhiệt hạch D + T']] },
    { key: 'density', label: 'Mật độ U-235 (độ giàu)', min: 10, max: 100, step: 5, value: 60, unit: '%' },
    { key: 'control', label: 'Thanh điều khiển (hấp thụ n)', min: 0, max: 100, step: 5, value: 20, unit: '%' },
    { key: 'temp', label: 'Nhiệt độ plasma (nhiệt hạch)', min: 10, max: 300, step: 10, value: 150, unit: 'triệu K' }
  ],
  create(ctx) {
    const st = { nuc: [], n: [], frag: [], energy: 0, fissions: 0, gen: [1], acc: 0, lastCount: 0, pl: [] };
    const seed = (p) => {
      st.nuc = []; st.n = []; st.frag = []; st.energy = 0; st.fissions = 0; st.gen = [1];
      const cols = 12, rows = 8;
      for (let i = 0; i < cols * rows; i++) { if (Math.random() * 100 < p.density) st.nuc.push({ x: (i % cols + 0.5) / cols, y: (Math.floor(i / cols) + 0.5) / rows, alive: true }); }
      st.n.push({ x: 0.02, y: 0.5, vx: 0.35, vy: 0, life: 6 });
      st.pl = []; for (let i = 0; i < 24; i++) st.pl.push({ x: Math.random(), y: Math.random(), vx: rand(-1, 1), vy: rand(-1, 1), kind: i % 2 ? 'D' : 'T', fused: 0 });
    };
    seed(ctx.params);
    return {
      onParam(k, p) { if (k === 'mode' || k === 'density') seed(p); },
      action(key, p) { if (key === 'fire') st.n.push({ x: 0.02, y: Math.random(), vx: 0.35, vy: 0, life: 6 }); },
      update(dt, p) {
        if (p.mode === 'fission') {
          for (const n of st.n) {
            n.x += n.vx * dt; n.y += n.vy * dt; n.life -= dt;
            if (Math.random() < p.control / 100 * dt * 1.2) n.life = 0; // bị thanh điều khiển hấp thụ
            for (const u of st.nuc) if (u.alive && Math.hypot(u.x - n.x, u.y - n.y) < 0.035) {
              u.alive = false; n.life = 0; st.fissions++; st.energy += 200;
              const k = 2 + (Math.random() < 0.5 ? 1 : 0);
              for (let j = 0; j < k; j++) { const a = Math.random() * TAU; st.n.push({ x: u.x, y: u.y, vx: Math.cos(a) * 0.35, vy: Math.sin(a) * 0.35, life: 4 }); }
              for (let j = 0; j < 2; j++) { const a = Math.random() * TAU; st.frag.push({ x: u.x, y: u.y, vx: Math.cos(a) * 0.12, vy: Math.sin(a) * 0.12, life: 1.2 }); }
              break;
            }
          }
          st.n = st.n.filter((n) => n.life > 0 && n.x > -0.05 && n.x < 1.05 && n.y > -0.05 && n.y < 1.05);
          for (const f of st.frag) { f.x += f.vx * dt; f.y += f.vy * dt; f.life -= dt; }
          st.frag = st.frag.filter((f) => f.life > 0);
          st.acc += dt; if (st.acc > 1) { st.gen.push(st.n.length); if (st.gen.length > 20) st.gen.shift(); st.acc = 0; }
        } else {
          const sp = 0.15 + p.temp / 300 * 0.6;
          for (const a of st.pl) {
            if (a.fused > 0) { a.fused -= dt; continue; }
            a.x += a.vx * sp * dt; a.y += a.vy * sp * dt;
            if (a.x < 0 || a.x > 1) { a.vx *= -1; a.x = clamp(a.x, 0, 1); } if (a.y < 0 || a.y > 1) { a.vy *= -1; a.y = clamp(a.y, 0, 1); }
          }
          const pf = clamp((p.temp - 50) / 250, 0, 1);
          for (let i = 0; i < st.pl.length; i++) for (let j = i + 1; j < st.pl.length; j++) {
            const a = st.pl[i], b = st.pl[j];
            if (a.fused > 0 || b.fused > 0 || a.kind === b.kind) continue;
            if (Math.hypot(a.x - b.x, a.y - b.y) < 0.04 && Math.random() < pf) { a.fused = 1.5; b.fused = 1.5; st.fissions++; st.energy += 17.6; st.frag.push({ x: a.x, y: a.y, vx: 0, vy: 0, life: 1 }); }
            else if (Math.hypot(a.x - b.x, a.y - b.y) < 0.05) { const t = a.vx; a.vx = b.vx; b.vx = t; const t2 = a.vy; a.vy = b.vy; b.vy = t2; }
          }
          for (const a of st.pl) if (a.fused > 0 && a.fused < 0.05) { a.x = Math.random(); a.y = Math.random(); a.fused = 0; }
          for (const f of st.frag) f.life -= dt; st.frag = st.frag.filter((f) => f.life > 0);
        }
      },
      draw(g, w, h, p, t) {
        const bx = 40, by = 60, bw = Math.min(w * 0.55, 520), bh = h - 110;
        g.fillStyle = 'rgba(30,41,59,0.5)'; roundRect(g, bx, by, bw, bh, 10); g.fill();
        if (p.mode === 'fission') {
          // thanh điều khiển
          const nRods = Math.round(p.control / 20); for (let i = 0; i < nRods; i++) { g.fillStyle = 'rgba(148,163,184,0.5)'; g.fillRect(bx + (i + 1) * bw / (nRods + 1) - 5, by, 10, bh * 0.9); }
          for (const u of st.nuc) if (u.alive) { circle(g, bx + u.x * bw, by + u.y * bh, 11, '#f87171', 'rgba(0,0,0,0.3)'); text(g, 'U', bx + u.x * bw, by + u.y * bh + 1, { size: 9, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' }); }
          for (const f of st.frag) { g.globalAlpha = f.life / 1.2; circle(g, bx + f.x * bw, by + f.y * bh, 7, '#fbbf24'); } g.globalAlpha = 1;
          for (const n of st.n) circle(g, bx + n.x * bw, by + n.y * bh, 4, '#a3e635');
          label(g, 'neutron (xanh lá) → U-235 (đỏ) → mảnh vỡ (vàng) + 2–3 n', bx + bw / 2, by - 14, { size: 10.5 });
        } else {
          g.fillStyle = `rgba(249,115,22,${clamp(p.temp / 600, 0.05, 0.4)})`; roundRect(g, bx, by, bw, bh, 10); g.fill();
          for (const a of st.pl) { if (a.fused > 0) continue; circle(g, bx + a.x * bw, by + a.y * bh, 8, a.kind === 'D' ? '#60a5fa' : '#a78bfa'); text(g, a.kind, bx + a.x * bw, by + a.y * bh + 1, { size: 8, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' }); }
          for (const f of st.frag) { g.globalAlpha = f.life; circle(g, bx + f.x * bw, by + f.y * bh, 14 + (1 - f.life) * 20, '#fde68a'); text(g, 'He + n', bx + f.x * bw, by + f.y * bh - 20, { size: 10, align: 'center', color: '#fde68a' }); } g.globalAlpha = 1;
          label(g, `plasma D–T ở ${p.temp} triệu K`, bx + bw / 2, by - 14, { size: 10.5 });
          if (p.temp < 50) label(g, 'nhiệt độ quá thấp: không vượt được rào Coulomb', bx + bw / 2, by + bh / 2, { size: 11, color: COLORS.warn });
        }
        // thống kê phải
        const rx = bx + bw + 40, rw = w - rx - 20;
        if (rw > 150) {
          text(g, p.mode === 'fission' ? 'Phản ứng dây chuyền' : 'Nhiệt hạch', rx, 80, { size: 14, weight: '700' });
          text(g, `Số phản ứng: ${st.fissions}`, rx, 110, { size: 12 });
          text(g, `Năng lượng: ${st.energy.toFixed(0)} MeV`, rx, 132, { size: 12, color: COLORS.warn });
          if (p.mode === 'fission') {
            const alive = st.nuc.filter((u) => u.alive).length;
            bar(g, rx, 170, rw, 10, alive / Math.max(1, st.nuc.length), '#f87171', `U-235 còn lại: ${alive}/${st.nuc.length}`);
            text(g, `Neutron tự do: ${st.n.length}`, rx, 210, { size: 12 });
            const kEst = st.gen.length > 2 ? (st.gen[st.gen.length - 1] + 0.5) / (st.gen[st.gen.length - 2] + 0.5) : 1;
            text(g, `k ước lượng ≈ ${clamp(kEst, 0, 9).toFixed(2)}  ${kEst > 1.2 ? '(bùng nổ)' : kEst > 0.8 ? '(tới hạn)' : '(tắt dần)'}`, rx, 232, { size: 12, color: kEst > 1.2 ? '#f87171' : kEst > 0.8 ? '#4ade80' : COLORS.muted });
            ['Giảm k: tăng thanh điều khiển,', 'giảm độ giàu U-235, khối lượng < tới hạn.', 'Bấm "Bắn neutron" để khởi động lại.'].forEach((s, i) => text(g, s, rx, 270 + i * 20, { size: 11, color: COLORS.muted }));
          } else {
            ['Mỗi phản ứng D + T: 17,6 MeV', '(≈ 3,5 MeV / nucleon, gấp 4 lần phân hạch).', 'Cần T ~ 10⁸ K và mật độ, thời gian giam giữ', 'đủ lớn (tiêu chuẩn Lawson).'].forEach((s, i) => text(g, s, rx, 170 + i * 20, { size: 11, color: COLORS.muted }));
          }
        }
      },
      metrics(p) { return [['Số phản ứng', st.fissions], ['Năng lượng (MeV)', st.energy, 0], p.mode === 'fission' ? ['Neutron tự do', st.n.length] : ['Xác suất kết hợp', `${Math.round(clamp((p.temp - 50) / 250, 0, 1) * 100)} %`]]; }
    };
  },
  actions: [{ key: 'fire', label: '🎯 Bắn neutron' }]
};
