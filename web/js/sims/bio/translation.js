import { COLORS, text, label, circle, line, roundRect, arrow } from '../../core/draw.js';
import { clamp } from '../../core/engine.js';
import { nuc } from './dna-replication.js';

export const CODON = {
  UUU: 'Phe', UUC: 'Phe', UUA: 'Leu', UUG: 'Leu', CUU: 'Leu', CUC: 'Leu', CUA: 'Leu', CUG: 'Leu', AUU: 'Ile', AUC: 'Ile', AUA: 'Ile', AUG: 'Met', GUU: 'Val', GUC: 'Val', GUA: 'Val', GUG: 'Val',
  UCU: 'Ser', UCC: 'Ser', UCA: 'Ser', UCG: 'Ser', CCU: 'Pro', CCC: 'Pro', CCA: 'Pro', CCG: 'Pro', ACU: 'Thr', ACC: 'Thr', ACA: 'Thr', ACG: 'Thr', GCU: 'Ala', GCC: 'Ala', GCA: 'Ala', GCG: 'Ala',
  UAU: 'Tyr', UAC: 'Tyr', UAA: 'STOP', UAG: 'STOP', CAU: 'His', CAC: 'His', CAA: 'Gln', CAG: 'Gln', AAU: 'Asn', AAC: 'Asn', AAA: 'Lys', AAG: 'Lys', GAU: 'Asp', GAC: 'Asp', GAA: 'Glu', GAG: 'Glu',
  UGU: 'Cys', UGC: 'Cys', UGA: 'STOP', UGG: 'Trp', CGU: 'Arg', CGC: 'Arg', CGA: 'Arg', CGG: 'Arg', AGU: 'Ser', AGC: 'Ser', AGA: 'Arg', AGG: 'Arg', GGU: 'Gly', GGC: 'Gly', GGA: 'Gly', GGG: 'Gly'
};
const AA_COLOR = { Met: '#4ade80', Phe: '#f87171', Leu: '#fb923c', Ile: '#fbbf24', Val: '#a3e635', Ser: '#2dd4bf', Pro: '#38bdf8', Thr: '#60a5fa', Ala: '#818cf8', Tyr: '#a78bfa', His: '#c084fc', Gln: '#e879f9', Asn: '#f472b6', Lys: '#fb7185', Asp: '#f43f5e', Glu: '#ef4444', Cys: '#facc15', Trp: '#84cc16', Arg: '#14b8a6', Gly: '#94a3b8' };
const ANTI = { A: 'U', U: 'A', G: 'C', C: 'G' };

function makeMRNA(nCodons) {
  const codons = ['AUG'];
  const keys = Object.keys(CODON).filter((k) => CODON[k] !== 'STOP' && k !== 'AUG');
  for (let i = 1; i < nCodons - 1; i++) codons.push(keys[Math.floor(Math.random() * keys.length)]);
  codons.push(['UAA', 'UAG', 'UGA'][Math.floor(Math.random() * 3)]);
  return codons;
}

export default {
  id: 'bio-translation',
  subject: 'bio',
  chapter: 'molecular',
  title: 'Dịch mã: ribosome tổng hợp chuỗi polypeptide',
  summary: 'Ribosome trượt trên mRNA từng codon một; tRNA có anticodon bổ sung mang amino acid tương ứng đến; chuỗi polypeptide dài dần và dừng ở codon kết thúc.',
  equation: ['mRNA (codon 5′→3′) ↔ tRNA (anticodon 3′→5′): A–U, G–C', 'Mở đầu: AUG (Met) ;  Kết thúc: UAA, UAG, UGA (không mã hóa amino acid)', 'Số amino acid trong chuỗi hoàn chỉnh = số codon − 2 (trừ mở đầu và kết thúc)'],
  keywords: ['dịch mã', 'ribosome', 'tRNA', 'anticodon', 'codon', 'mã di truyền', 'polypeptide', 'amino acid'],
  theory: [
    '**Khởi đầu**: tiểu đơn vị bé của ribosome gắn vào mRNA ở codon mở đầu **AUG**; tRNA mang **Met** (ở nhân sơ là fMet) có anticodon UAC khớp vào; tiểu đơn vị lớn ráp vào tạo ribosome hoàn chỉnh.',
    '**Kéo dài**: tRNA kế tiếp mang amino acid đến vị trí A, anticodon khớp bổ sung với codon; liên kết **peptide** hình thành giữa amino acid mới và chuỗi; ribosome **dịch chuyển một codon** (3 nucleotide) theo chiều 5′→3′; tRNA đã trao amino acid rời đi.',
    '**Kết thúc**: gặp codon **UAA/UAG/UGA** không có tRNA tương ứng, chuỗi polypeptide được giải phóng, Met mở đầu bị cắt bỏ, chuỗi cuộn gập thành protein. Mã di truyền có tính **phổ biến, đặc hiệu, thoái hóa**.'
  ],
  observe: ['Xem tRNA bay tới với anticodon khớp codon đang ở vị trí A.', 'Đếm số amino acid ở cuối so với số codon.', 'Bấm "mRNA mới" để sinh trình tự ngẫu nhiên khác.'],
  exam: ['Xác định chuỗi amino acid từ mRNA/ gene dùng bảng mã di truyền.', 'Tính số tRNA, số liên kết peptide, số lượt ribosome.'],
  quiz: {
    question: 'Một mRNA có 8 codon, gồm codon mở đầu AUG và một codon kết thúc. Khi ribosome gặp codon kết thúc, chuỗi vừa tổng hợp có bao nhiêu amino acid (tính cả Met mở đầu)?',
    options: ['8', '7', '6', '24'],
    answer: 1,
    explanation: 'Codon kết thúc (UAA, UAG, UGA) không có tRNA tương ứng nên không mã hóa amino acid: 8 − 1 = 7. Sau đó Met mở đầu bị cắt bỏ nên protein hoàn chỉnh còn 6 amino acid.'
  },
  params: [
    { key: 'n', label: 'Số codon trên mRNA', min: 5, max: 14, step: 1, value: 8 },
    { key: 'speed', label: 'Tốc độ ribosome', min: 0.3, max: 3, step: 0.1, value: 1, decimals: 1 }
  ],
  actions: [{ key: 'new', label: '🧬 mRNA mới' }],
  create(ctx) {
    const st = { codons: makeMRNA(ctx.params.n), idx: 0, phase: 0, chain: [], done: false, trna: null };
    const reset = (p) => { st.codons = makeMRNA(p.n); st.idx = 0; st.phase = 0; st.chain = []; st.done = false; };
    return {
      onParam(k, p) { if (k === 'n') reset(p); },
      action(key, p) { if (key === 'new') reset(p); },
      update(dt, p) {
        if (st.done) return;
        st.phase += dt * p.speed;
        if (st.phase >= 1) {
          st.phase = 0;
          const aa = CODON[st.codons[st.idx]];
          if (aa === 'STOP') { st.done = true; }
          else { st.chain.push(aa); st.idx++; }
        }
      },
      draw(g, w, h, p) {
        const codons = st.codons;
        const step = Math.min(78, (w - 100) / codons.length);
        const x0 = w / 2 - codons.length * step / 2, my = h - 110;
        // mRNA
        line(g, x0 - 20, my + 12, x0 + codons.length * step + 20, my + 12, '#c084fc', 4);
        text(g, "5′", x0 - 30, my + 16, { size: 11, color: '#c084fc' }); text(g, "3′", x0 + codons.length * step + 26, my + 16, { size: 11, color: '#c084fc' });
        codons.forEach((c, i) => { for (let k = 0; k < 3; k++) nuc(g, x0 + i * step + 12 + k * 16, my, c[k], 1); text(g, CODON[c] === 'STOP' ? 'stop' : CODON[c], x0 + i * step + 28, my + 32, { size: 9.5, align: 'center', color: i < st.idx ? AA_COLOR[CODON[c]] : COLORS.muted }); });
        // ribosome
        const ri = Math.min(st.idx, codons.length - 1);
        const rx = x0 + ri * step + 28 + (st.done ? 0 : st.phase * 0);
        g.fillStyle = 'rgba(148,163,184,0.25)'; g.beginPath(); g.ellipse(rx, my - 60, step * 1.1, 46, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(148,163,184,0.35)'; g.beginPath(); g.ellipse(rx, my - 14, step * 1.05, 20, 0, 0, Math.PI * 2); g.fill();
        text(g, 'ribosome', rx, my - 96, { size: 10, align: 'center', color: COLORS.muted });
        text(g, 'P', rx - step / 2, my - 40, { size: 10, align: 'center', color: COLORS.muted }); text(g, 'A', rx + step / 2 - 10, my - 40, { size: 10, align: 'center', color: COLORS.muted });
        // tRNA bay đến vị trí A
        if (!st.done) {
          const c = codons[st.idx]; const aa = CODON[c];
          if (aa !== 'STOP') {
            const u = clamp(st.phase / 0.6, 0, 1);
            const tx = rx + 60 + (1 - u) * 200, ty = my - 70 - (1 - u) * 120;
            drawTRNA(g, tx, ty, c, aa);
          } else label(g, 'codon kết thúc – không có tRNA tương ứng → giải phóng chuỗi', rx, my - 120, { size: 11, color: '#f87171' });
        } else label(g, `Hoàn tất: chuỗi polypeptide ${st.chain.length} amino acid`, rx, my - 120, { size: 11, color: '#4ade80' });
        // chuỗi polypeptide đi ra từ ribosome
        const chain = st.chain;
        for (let i = 0; i < chain.length; i++) {
          const k = chain.length - 1 - i;
          const cx = rx - 10 - k * 24 + Math.sin(k * 0.8) * 6, cy = my - 150 - Math.sin(k * 0.9) * 22 - k * 3;
          if (k > 0) line(g, cx, cy, rx - 10 - (k - 1) * 24 + Math.sin((k - 1) * 0.8) * 6, my - 150 - Math.sin((k - 1) * 0.9) * 22 - (k - 1) * 3, '#e2e8f0', 2);
          circle(g, cx, cy, 11, AA_COLOR[chain[i]] || '#94a3b8', '#0b1020'); text(g, chain[i], cx, cy + 1, { size: 7.5, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' });
        }
        text(g, 'Chuỗi polypeptide: ' + (chain.length ? chain.join(' – ') : '(chưa có)'), 20, 30, { size: 12, color: COLORS.text });
        text(g, 'tRNA mang amino acid đến, anticodon khớp bổ sung với codon tại vị trí A, rồi ribosome dịch 1 codon.', 20, 52, { size: 11, color: COLORS.muted });
      },
      metrics(p) { return [['Số codon', st.codons.length], ['Đã dịch', `${st.idx} codon`], ['Amino acid trong chuỗi', st.chain.length], ['Liên kết peptide', Math.max(0, st.chain.length - 1)], ['Trạng thái', st.done ? 'kết thúc' : 'đang kéo dài']]; }
    };
  }
};
function drawTRNA(g, x, y, codon, aa) {
  g.fillStyle = 'rgba(45,212,191,0.9)'; g.beginPath(); g.moveTo(x - 26, y); g.lineTo(x + 26, y); g.lineTo(x + 14, y + 30); g.lineTo(x - 14, y + 30); g.closePath(); g.fill();
  const anti = [...codon].map((b) => ANTI[b]).join('');
  for (let k = 0; k < 3; k++) nuc(g, x - 16 + k * 16, y + 38, anti[k], 1);
  text(g, 'anticodon ' + anti, x, y + 56, { size: 8.5, align: 'center', color: '#5eead4' });
  circle(g, x, y - 14, 11, AA_COLOR[aa] || '#94a3b8', '#0b1020'); text(g, aa, x, y - 13, { size: 7.5, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' });
  text(g, 'tRNA', x + 34, y + 18, { size: 9, color: '#5eead4' });
}
