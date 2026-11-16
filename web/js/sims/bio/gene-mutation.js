import { COLORS, text, label, circle, line, roundRect, arrow } from '../../core/draw.js';
import { nuc } from './dna-replication.js';
import { CODON } from './translation.js';

const BASES = ['A', 'U', 'G', 'C'];
function wildMRNA(n) { const keys = Object.keys(CODON).filter((k) => CODON[k] !== 'STOP' && k !== 'AUG'); let s = 'AUG'; for (let i = 1; i < n - 1; i++) s += keys[Math.floor(Math.random() * keys.length)]; return s + 'UAA'; }
function translate(seq) { const out = []; for (let i = 0; i + 2 < seq.length; i += 3) { const aa = CODON[seq.slice(i, i + 3)]; if (!aa) break; if (aa === 'STOP') { out.push('STOP'); break; } out.push(aa); } return out; }

export default {
  id: 'bio-gene-mutation',
  subject: 'bio',
  chapter: 'molecular',
  title: 'Đột biến gene và hậu quả lên protein',
  summary: 'Thay thế, thêm hoặc mất một nucleotide trên gene rồi dịch mã lại: đột biến đồng nghĩa, sai nghĩa, vô nghĩa hay dịch khung – thấy ngay chuỗi amino acid thay đổi thế nào.',
  equation: ['Thay thế 1 cặp: ảnh hưởng ≤ 1 codon → đồng nghĩa / sai nghĩa / vô nghĩa', 'Thêm / mất 1 cặp: dịch khung đọc từ điểm đột biến → thay đổi hàng loạt amino acid'],
  keywords: ['đột biến gene', 'đột biến điểm', 'thay thế', 'thêm mất nucleotide', 'dịch khung', 'sai nghĩa', 'vô nghĩa', 'đồng nghĩa', 'tác nhân đột biến'],
  theory: [
    '**Đột biến gene** là biến đổi trong cấu trúc gene, thường liên quan đến **một cặp nucleotide** (đột biến điểm): **thay thế**, **thêm** hoặc **mất** một cặp. Nguyên nhân: tác nhân vật lí (tia UV, phóng xạ), hóa học (5-BU, acridine), sinh học (virus) hoặc sai sót khi nhân đôi.',
    '**Thay thế** chỉ ảnh hưởng tới codon bị đột biến: **đồng nghĩa** (codon mới mã hóa cùng amino acid – do mã thoái hóa), **sai nghĩa** (đổi amino acid, ví dụ bệnh hồng cầu hình liềm), **vô nghĩa** (thành codon kết thúc → protein ngắn).',
    '**Thêm/mất** làm **dịch khung đọc** từ vị trí đột biến trở đi, thay đổi toàn bộ amino acid phía sau → hậu quả thường nghiêm trọng nhất. Đột biến gene là nguồn **nguyên liệu sơ cấp** cho tiến hóa và chọn giống.'
  ],
  observe: ['Chọn "thay thế" và dịch chuyển vị trí: tìm trường hợp đồng nghĩa (amino acid không đổi).', 'Chọn thêm/mất: toàn bộ amino acid sau điểm đột biến thay đổi (dịch khung).', 'Đột biến ở nucleotide thứ 3 của codon thường ít hậu quả hơn (tính thoái hóa).'],
  exam: ['Phân loại đột biến điểm và hậu quả lên mRNA, protein.', 'Tính số nucleotide, liên kết hydrogen của gene sau đột biến.'],
  params: [
    { key: 'type', label: 'Loại đột biến', type: 'select', value: 'sub', options: [['sub', 'Thay thế 1 nucleotide'], ['ins', 'Thêm 1 nucleotide'], ['del', 'Mất 1 nucleotide']] },
    { key: 'pos', label: 'Vị trí đột biến (nucleotide thứ)', min: 4, max: 21, step: 1, value: 8 },
    { key: 'newBase', label: 'Nucleotide thay thế / thêm', type: 'select', value: 'A', options: BASES.map((b) => [b, b]) }
  ],
  actions: [{ key: 'new', label: '🎲 Gene mới' }],
  create() {
    const st = { wt: wildMRNA(8), flash: 0 };
    const mutate = (p) => { const i = Math.min(p.pos - 1, st.wt.length - 1); if (p.type === 'sub') return st.wt.slice(0, i) + p.newBase + st.wt.slice(i + 1); if (p.type === 'ins') return st.wt.slice(0, i) + p.newBase + st.wt.slice(i); return st.wt.slice(0, i) + st.wt.slice(i + 1); };
    return {
      action(key) { if (key === 'new') st.wt = wildMRNA(8); },
      update(dt) { st.flash = (st.flash + dt) % 1; },
      draw(g, w, h, p) {
        const mut = mutate(p);
        const wtAA = translate(st.wt), muAA = translate(mut);
        const i0 = p.pos - 1;
        const step = Math.min(26, (w - 140) / Math.max(st.wt.length, mut.length));
        const x0 = 110;
        const drawRow = (seq, y, title, hi, color) => {
          text(g, title, 20, y + 4, { size: 11.5, color: COLORS.muted });
          for (let i = 0; i < seq.length; i++) { const x = x0 + i * step + step / 2; nuc(g, x, y, seq[i], 1, hi(i)); if (i % 3 === 2 && i < seq.length - 1) line(g, x + step / 2, y - 12, x + step / 2, y + 12, COLORS.grid, 1); }
        };
        const drawAA = (aas, y, title, cmp) => {
          text(g, title, 20, y + 4, { size: 11.5, color: COLORS.muted });
          aas.forEach((aa, i) => { const x = x0 + i * 3 * step + 1.5 * step; const changed = cmp && cmp[i] !== aa; circle(g, x, y, 12, aa === 'STOP' ? '#f87171' : changed ? '#fbbf24' : '#4ade80', '#0b1020'); text(g, aa === 'STOP' ? '■' : aa, x, y + 1, { size: 8, align: 'center', baseline: 'middle', color: '#0b1020', weight: '800' }); });
        };
        text(g, 'Gene bình thường (biểu diễn qua mRNA) → protein', 20, 36, { size: 13, weight: '700' });
        drawRow(st.wt, 70, 'mRNA gốc', (i) => i === i0 && p.type !== 'ins', '#fff');
        drawAA(wtAA, 112, 'protein gốc', null);
        // mũi tên đột biến
        const ax = x0 + i0 * step + step / 2;
        arrow(g, ax, 140, ax, 168, '#f87171', 2.5);
        label(g, p.type === 'sub' ? `thay ${st.wt[i0]} → ${p.newBase}` : p.type === 'ins' ? `thêm ${p.newBase}` : `mất ${st.wt[i0]}`, ax + 70, 154, { size: 10.5, color: '#f87171' });
        text(g, 'Gene đột biến → protein', 20, 196, { size: 13, weight: '700' });
        drawRow(mut, 226, 'mRNA đột biến', (i) => p.type === 'sub' ? i === i0 : p.type === 'ins' ? i >= i0 : i >= i0, '#fff');
        drawAA(muAA, 268, 'protein đột biến', wtAA);
        // phân loại
        let kind, note;
        if (p.type === 'sub') {
          const ci = Math.floor(i0 / 3);
          if (wtAA[ci] === muAA[ci]) { kind = 'Đột biến ĐỒNG NGHĨA (câm)'; note = 'codon mới mã hóa cùng amino acid nhờ tính thoái hóa của mã di truyền → protein không đổi.'; }
          else if (muAA[ci] === 'STOP') { kind = 'Đột biến VÔ NGHĨA'; note = 'codon mới là codon kết thúc → chuỗi polypeptide ngắn lại, thường mất chức năng.'; }
          else if (ci === 0) { kind = 'Mất codon mở đầu'; note = 'không còn AUG → dịch mã không khởi đầu được tại vị trí này.'; }
          else { kind = 'Đột biến SAI NGHĨA'; note = 'một amino acid bị thay bằng amino acid khác (ví dụ Glu → Val gây hồng cầu hình liềm).'; }
        } else { kind = 'Đột biến DỊCH KHUNG'; note = `khung đọc lệch 1 nucleotide từ codon ${Math.floor(i0 / 3) + 1} → mọi amino acid phía sau thay đổi, có thể gặp codon kết thúc sớm.`; }
        g.fillStyle = 'rgba(30,41,59,0.7)'; roundRect(g, 20, 300, w - 40, 70, 10); g.fill();
        text(g, kind, 36, 326, { size: 14, weight: '700', color: p.type === 'sub' && wtAA.join() === muAA.join() ? '#4ade80' : '#fbbf24' });
        text(g, note, 36, 350, { size: 11.5, color: COLORS.muted });
        const changed = muAA.filter((a, i) => wtAA[i] !== a).length;
        text(g, `Protein gốc: ${wtAA.filter((a) => a !== 'STOP').length} aa   |   Protein đột biến: ${muAA.filter((a) => a !== 'STOP').length} aa   |   amino acid thay đổi: ${changed}`, 36, h - 24, { size: 11.5, color: COLORS.muted });
        text(g, '■ xanh: không đổi   ■ vàng: đổi   ■ đỏ: codon kết thúc', w - 36, h - 24, { size: 10.5, align: 'right', color: COLORS.muted });
      },
      metrics(p) { const mut = mutate(p); const wtAA = translate(st.wt), muAA = translate(mut); return [['Chiều dài mRNA', `${st.wt.length} → ${mut.length}`], ['Amino acid', `${wtAA.filter((a) => a !== 'STOP').length} → ${muAA.filter((a) => a !== 'STOP').length}`], ['Amino acid thay đổi', muAA.filter((a, i) => wtAA[i] !== a).length]]; }
    };
  }
};
