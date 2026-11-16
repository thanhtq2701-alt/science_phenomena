import { COLORS, text, label, circle, line, roundRect, arrow, bar } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';

const BASE_COLOR = { A: '#f87171', T: '#fbbf24', G: '#4ade80', C: '#60a5fa', U: '#c084fc' };
const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
export function randomSeq(n) { const b = 'ATGC'; let s = ''; for (let i = 0; i < n; i++) s += b[Math.floor(Math.random() * 4)]; return s; }

export default {
  id: 'bio-dna-replication',
  subject: 'bio',
  chapter: 'molecular',
  title: 'Nhân đôi DNA (tái bản)',
  summary: 'Enzyme helicase tháo xoắn, DNA polymerase lắp nucleotide tự do theo nguyên tắc bổ sung A–T, G–C; hai phân tử con mỗi cái giữ một mạch cũ (bán bảo toàn).',
  equation: ['Nguyên tắc bổ sung: A – T, G – C', 'Nguyên tắc bán bảo toàn: mỗi DNA con = 1 mạch cũ + 1 mạch mới', 'Sau k lần nhân đôi: 2ᵏ phân tử; số nucleotide tự do cần = N·(2ᵏ − 1)'],
  keywords: ['nhân đôi DNA', 'tái bản', 'helicase', 'DNA polymerase', 'bán bảo toàn', 'bổ sung', 'Okazaki', 'chạc tái bản'],
  theory: [
    '**Bước 1 – tháo xoắn**: enzyme **helicase** cắt liên kết hydrogen giữa hai mạch, tạo **chạc chữ Y**. **Bước 2 – tổng hợp**: **DNA polymerase** gắn nucleotide tự do vào mạch khuôn theo **nguyên tắc bổ sung** (A–T, G–C), chỉ theo chiều 5′→3′ nên một mạch tổng hợp liên tục, mạch kia tổng hợp **gián đoạn thành các đoạn Okazaki** rồi được **ligase** nối lại. **Bước 3**: hai DNA con xoắn lại.',
    '**Nguyên tắc bán bảo toàn**: mỗi DNA con gồm một mạch của mẹ và một mạch mới. Nhờ vậy thông tin di truyền được truyền chính xác qua các thế hệ tế bào.',
    'Xảy ra ở pha S của kì trung gian, trong nhân (sinh vật nhân thực) trước khi tế bào phân chia.'
  ],
  observe: ['Tăng tốc độ polymerase để thấy chạc tái bản di chuyển nhanh hơn.', 'Mạch dưới tổng hợp theo từng đoạn ngắn ngược chiều chạc (đoạn Okazaki).', 'Bấm "Nhân đôi lần nữa" để đếm số phân tử sau k lần.'],
  exam: ['Tính số nucleotide mỗi loại môi trường cung cấp sau k lần nhân đôi.', 'Số phân tử DNA chứa toàn N¹⁴ / N¹⁵ trong thí nghiệm Meselson – Stahl.'],
  params: [
    { key: 'len', label: 'Số cặp nucleotide', min: 12, max: 30, step: 2, value: 20 },
    { key: 'speed', label: 'Tốc độ DNA polymerase', min: 0.5, max: 4, step: 0.5, value: 1.5, decimals: 1 }
  ],
  actions: [{ key: 'again', label: '🔁 Nhân đôi lần nữa' }],
  create(ctx) {
    const st = { seq: randomSeq(ctx.params.len), fork: 0, done: false, rounds: 0, okazaki: [] };
    return {
      onParam(k, p) { if (k === 'len') { st.seq = randomSeq(p.len); st.fork = 0; st.done = false; st.okazaki = []; } },
      action(key, p) { if (key === 'again' && st.done) { st.rounds++; st.fork = 0; st.done = false; st.okazaki = []; } },
      update(dt, p) {
        if (st.done) return;
        st.fork += dt * p.speed * 1.2;
        if (st.fork >= st.seq.length) { st.fork = st.seq.length; st.done = true; st.rounds++; }
      },
      draw(g, w, h, p, t) {
        const n = st.seq.length;
        const x0 = 40, span = Math.min(w - 80, n * 36), step = span / n;
        const cy = 200;
        const f = st.fork;
        const fi = Math.floor(f);
        text(g, 'Chạc tái bản (nhìn phẳng): mạch cũ đậm, mạch mới sáng', x0, 40, { size: 13, weight: '700' });
        for (let i = 0; i < n; i++) {
          const x = x0 + i * step + step / 2;
          const opened = i < f;
          const sep = opened ? clamp((f - i) * 14, 0, 70) : 0;
          const b = st.seq[i], c = PAIR[b];
          // mạch khuôn trên (3'→5') và dưới
          const yTop = cy - 18 - sep, yBot = cy + 18 + sep;
          line(g, x - step / 2, yTop - 14, x + step / 2, yTop - 14, '#94a3b8', 4);
          line(g, x - step / 2, yBot + 14, x + step / 2, yBot + 14, '#94a3b8', 4);
          nuc(g, x, yTop, b, -1); nuc(g, x, yBot, c, 1);
          if (!opened) { line(g, x, yTop + 8, x, yBot - 8, 'rgba(226,232,240,0.5)', 1.5, [2, 2]); }
          else {
            // mạch mới: trên liên tục (leading) tới f-1; dưới gián đoạn (Okazaki) theo từng khối 4
            const newTop = i < f - 1;
            const block = Math.floor(i / 4); const blockDone = (f - 1) >= (block + 1) * 4 || st.done; const inBlockProgress = f - 1 - block * 4;
            const newBot = blockDone || (i - block * 4) < inBlockProgress - 1.5;
            if (newTop) { nuc(g, x, yTop + 36, PAIR[b], 1, true); line(g, x - step / 2, yTop + 50, x + step / 2, yTop + 50, '#a3e635', 3); }
            if (newBot) { nuc(g, x, yBot - 36, PAIR[c], -1, true); line(g, x - step / 2, yBot - 50, x + step / 2, yBot - 50, '#a3e635', 3); }
          }
        }
        // enzyme
        const fx = x0 + f * step;
        circle(g, fx + 10, cy, 22, 'rgba(251,191,36,0.9)'); text(g, 'helicase', fx + 10, cy + 4, { size: 8.5, align: 'center', color: '#0b1020', weight: '800' });
        if (f > 1 && !st.done) { circle(g, fx - 24, cy - 60, 16, 'rgba(96,165,250,0.9)'); text(g, 'pol', fx - 24, cy - 56, { size: 9, align: 'center', color: '#0b1020', weight: '800' }); circle(g, x0 + (Math.floor((f - 1) / 4) * 4 + Math.min(4, f - 1 - Math.floor((f - 1) / 4) * 4)) * step, cy + 60, 16, 'rgba(96,165,250,0.9)'); text(g, 'pol', x0 + (Math.floor((f - 1) / 4) * 4 + Math.min(4, f - 1 - Math.floor((f - 1) / 4) * 4)) * step, cy + 64, { size: 9, align: 'center', color: '#0b1020', weight: '800' }); }
        text(g, 'mạch dẫn đầu: tổng hợp liên tục →', x0, cy - 100, { size: 11, color: COLORS.muted });
        text(g, 'mạch theo sau: tổng hợp gián đoạn (đoạn Okazaki) ←, ligase nối', x0, cy + 112, { size: 11, color: COLORS.muted });
        // chú thích & thống kê
        const sy = h - 110;
        bar(g, x0, sy, Math.min(400, w - 80), 10, f / n, '#a3e635', `Tiến độ: ${Math.round(f / n * 100)}%${st.done ? ' – xong! Hai DNA con, mỗi cái 1 mạch cũ + 1 mạch mới' : ''}`);
        const counts = { A: 0, T: 0, G: 0, C: 0 }; for (const ch of st.seq) { counts[ch]++; counts[PAIR[ch]]++; }
        const k = st.rounds;
        text(g, `Số lần nhân đôi: ${k} → ${Math.pow(2, k)} phân tử.  Nucleotide tự do đã dùng: A = T = ${counts.A * (Math.pow(2, k) - 1)}, G = C = ${counts.G * (Math.pow(2, k) - 1)}`, x0, sy + 40, { size: 11.5, color: COLORS.muted });
        ['A', 'T', 'G', 'C'].forEach((b, i) => { circle(g, x0 + i * 60, sy + 65, 7, BASE_COLOR[b]); text(g, b, x0 + i * 60 + 12, sy + 69, { size: 11, color: COLORS.muted }); });
      },
      metrics(p) { const n = st.seq.length; return [['Cặp nucleotide', n], ['Liên kết hydrogen', [...st.seq].reduce((a, b) => a + (b === 'A' || b === 'T' ? 2 : 3), 0)], ['Tiến độ chạc', `${Math.round(st.fork / n * 100)} %`], ['Số lần nhân đôi', st.rounds], ['Số phân tử DNA', Math.pow(2, st.rounds)]]; }
    };
  }
};
export function nuc(g, x, y, b, dir, isNew = false) {
  g.fillStyle = BASE_COLOR[b]; if (isNew) g.globalAlpha = 0.95;
  roundRect(g, x - 7, dir < 0 ? y - 8 : y - 8, 14, 16, 3); g.fill(); g.globalAlpha = 1;
  if (isNew) { g.strokeStyle = '#fff'; g.lineWidth = 1; g.stroke(); }
  text(g, b, x, y + 1, { size: 9, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' });
}
