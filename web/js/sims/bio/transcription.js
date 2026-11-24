import { COLORS, text, label, circle, line, roundRect, arrow } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';
import { nuc, randomSeq } from './dna-replication.js';

const PAIR_RNA = { A: 'U', T: 'A', G: 'C', C: 'G' };
const PAIR_DNA = { A: 'T', T: 'A', G: 'C', C: 'G' };

export default {
  id: 'bio-transcription',
  subject: 'bio',
  chapter: 'molecular',
  title: 'Phiên mã: tổng hợp mRNA từ gene',
  summary: 'RNA polymerase bám vào vùng khởi động, trượt dọc mạch khuôn 3′→5′ và lắp ribonucleotide (A–U, G–C) tạo mRNA chiều 5′→3′; dừng ở tín hiệu kết thúc.',
  equation: ['Mạch khuôn (3′→5′): A – U, T – A, G – C, C – G → mRNA (5′→3′)', 'mRNA có trình tự giống mạch bổ sung (mạch mã hóa) nhưng T thay bằng U'],
  keywords: ['phiên mã', 'mRNA', 'RNA polymerase', 'mạch khuôn', 'mạch mã hóa', 'promoter', 'gene', 'intron exon'],
  theory: [
    '**Phiên mã** là quá trình tổng hợp **RNA** từ **mạch khuôn của gene** (mạch 3′→5′), nhờ **RNA polymerase**. Gồm 3 giai đoạn: **khởi đầu** (enzyme bám vùng khởi động, tháo xoắn), **kéo dài** (lắp ribonucleotide theo nguyên tắc bổ sung A–U, G–C, mRNA dài ra theo chiều 5′→3′), **kết thúc** (gặp tín hiệu kết thúc, mRNA được giải phóng).',
    'Ở sinh vật nhân thực, mRNA sơ khai còn phải **cắt intron, nối exon** (trưởng thành) rồi mới ra tế bào chất. Ở nhân sơ, phiên mã và dịch mã diễn ra đồng thời.',
    'mRNA mang thông tin của gene dưới dạng **bộ ba mã sao (codon)** để ribosome dịch thành protein.'
  ],
  observe: ['Quan sát hai mạch DNA tách ra cục bộ ("bong bóng phiên mã") và đóng lại sau khi enzyme đi qua.', 'So sánh mRNA với mạch mã hóa: giống hệt trừ T → U.'],
  exam: ['Xác định trình tự mRNA từ mạch khuôn hoặc mạch mã hóa.', 'Tính số ribonucleotide mỗi loại; số lần phiên mã từ lượng mRNA.'],
  quiz: {
    question: 'Mạch khuôn của gene có bộ ba 3′–TAC–5′. Bộ ba tương ứng (codon) trên mRNA là gì?',
    options: ['5′–ATG–3′', '5′–UAC–3′', '5′–AUG–3′', '5′–TAC–3′'],
    answer: 2,
    explanation: 'RNA polymerase lắp ribonucleotide theo nguyên tắc bổ sung T–A, A–U, C–G, G–C. RNA không có T mà dùng U, nên TAC trên mạch khuôn cho AUG trên mRNA (codon mở đầu).'
  },
  params: [
    { key: 'len', label: 'Chiều dài gene (nucleotide)', min: 12, max: 30, step: 3, value: 18 },
    { key: 'speed', label: 'Tốc độ RNA polymerase', min: 0.5, max: 4, step: 0.5, value: 1.5, decimals: 1 }
  ],
  create(ctx) {
    const st = { tpl: randomSeq(ctx.params.len), pos: 0, done: false, copies: 0 };
    return {
      onParam(k, p) { if (k === 'len') { st.tpl = randomSeq(p.len); st.pos = 0; st.done = false; } },
      update(dt, p) {
        st.pos += dt * p.speed * 1.4;
        if (st.pos >= st.tpl.length + 3) { st.pos = 0; st.copies++; }
      },
      draw(g, w, h, p) {
        const n = st.tpl.length;
        const x0 = 60, span = Math.min(w - 120, n * 36), step = span / n;
        const cy = 180;
        const pos = st.pos;
        text(g, 'Gene (DNA) – mạch khuôn 3′→5′ ở dưới, mạch mã hóa 5′→3′ ở trên', x0, 40, { size: 13, weight: '700' });
        // promoter / terminator
        g.fillStyle = 'rgba(74,222,128,0.15)'; roundRect(g, x0 - 50, cy - 40, 48, 80, 6); g.fill(); text(g, 'khởi', x0 - 26, cy - 4, { size: 9, align: 'center', color: '#4ade80' }); text(g, 'động', x0 - 26, cy + 8, { size: 9, align: 'center', color: '#4ade80' });
        g.fillStyle = 'rgba(248,113,113,0.15)'; roundRect(g, x0 + span + 2, cy - 40, 48, 80, 6); g.fill(); text(g, 'kết', x0 + span + 26, cy - 4, { size: 9, align: 'center', color: '#f87171' }); text(g, 'thúc', x0 + span + 26, cy + 8, { size: 9, align: 'center', color: '#f87171' });
        for (let i = 0; i < n; i++) {
          const x = x0 + i * step + step / 2;
          const d = i - pos; // khoảng cách tới enzyme
          const open = Math.abs(d + 1.5) < 2.5 ? (2.5 - Math.abs(d + 1.5)) / 2.5 : 0;
          const sep = open * 40;
          const tplB = st.tpl[i], codB = PAIR_DNA[tplB];
          const yTop = cy - 16 - sep, yBot = cy + 16 + sep;
          line(g, x - step / 2, yTop - 12, x + step / 2, yTop - 12, '#94a3b8', 4);
          line(g, x - step / 2, yBot + 12, x + step / 2, yBot + 12, '#94a3b8', 4);
          nuc(g, x, yTop, codB, -1); nuc(g, x, yBot, tplB, 1);
          if (open < 0.3) line(g, x, yTop + 8, x, yBot - 8, 'rgba(226,232,240,0.4)', 1.5, [2, 2]);
        }
        text(g, "5′", x0 - 10, cy - 36, { size: 10, align: 'right', color: COLORS.muted }); text(g, "3′", x0 + span + 10, cy - 36, { size: 10, color: COLORS.muted });
        text(g, "3′", x0 - 10, cy + 44, { size: 10, align: 'right', color: COLORS.muted }); text(g, "5′", x0 + span + 10, cy + 44, { size: 10, color: COLORS.muted });
        // RNA polymerase
        const ex = x0 + clamp(pos, 0, n) * step;
        g.fillStyle = 'rgba(251,191,36,0.85)'; g.beginPath(); g.ellipse(ex, cy, 40, 32, 0, 0, Math.PI * 2); g.fill();
        text(g, 'RNA', ex, cy - 4, { size: 10, align: 'center', color: '#0b1020', weight: '800' }); text(g, 'polymerase', ex, cy + 8, { size: 8.5, align: 'center', color: '#0b1020', weight: '800' });
        arrow(g, ex + 44, cy - 50, ex + 70, cy - 50, '#fbbf24', 2);
        // mRNA đang tổng hợp: nằm dưới mạch khuôn, đi ra khỏi enzyme
        const made = Math.floor(clamp(pos, 0, n));
        const my = cy + 90;
        for (let i = 0; i < made; i++) { const x = x0 + i * step + step / 2; const yy = my + Math.sin(i * 0.5) * 4; nuc(g, x, yy, PAIR_RNA[st.tpl[i]], 1, true); if (i > 0) line(g, x - step, my + Math.sin((i - 1) * 0.5) * 4 + 12, x, yy + 12, '#c084fc', 3); }
        if (made > 0) { text(g, "mRNA 5′", x0 - 10, my + 4, { size: 10, align: 'right', color: '#c084fc' }); text(g, made >= n ? "3′ – hoàn tất, giải phóng" : "3′ đang kéo dài", x0 + made * step + 6, my + 4, { size: 10, color: '#c084fc' }); }
        // bảng so sánh
        const by = h - 80;
        text(g, 'Mạch mã hóa: ' + [...st.tpl].map((b) => PAIR_DNA[b]).join(' '), x0, by, { size: 11.5, color: COLORS.muted });
        text(g, 'Mạch khuôn:  ' + [...st.tpl].join(' '), x0, by + 20, { size: 11.5, color: COLORS.muted });
        text(g, 'mRNA:          ' + [...st.tpl].slice(0, made).map((b) => PAIR_RNA[b]).join(' '), x0, by + 40, { size: 11.5, color: '#c084fc', weight: '700' });
      },
      metrics(p) { const n = st.tpl.length; const made = Math.floor(clamp(st.pos, 0, n)); const cnt = { A: 0, U: 0, G: 0, C: 0 }; for (const b of st.tpl) cnt[PAIR_RNA[b]]++; return [['Đã phiên mã', `${made}/${n} nucleotide`], ['Số bản mRNA đã tạo', st.copies], ['mRNA: A/U/G/C', `${cnt.A}/${cnt.U}/${cnt.G}/${cnt.C}`], ['Số codon', Math.floor(n / 3)]]; }
    };
  }
};
