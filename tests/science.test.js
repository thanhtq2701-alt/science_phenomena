/**
 * Đối chiếu đáp số của mô phỏng với giá trị chuẩn trong SGK / tính tay.
 * Mỗi kiểm tra đọc số liệu (metrics) hiển thị cho học sinh, nên nếu sai ở đây là học sinh thấy sai.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSims } from '../tools/build-catalog.js';

const sims = Object.fromEntries((await loadSims()).map((s) => [s.id, s]));

function run(id, override = {}, { seconds = 0, actions = [] } = {}) {
  const sim = sims[id];
  assert.ok(sim, `không có bài ${id}`);
  const p = {};
  for (const q of sim.params || []) p[q.key] = q.value;
  Object.assign(p, override);
  const inst = sim.create({ w: 900, h: 520, params: p, runner: null });
  let t = 0;
  for (let i = 0; i < seconds * 60; i++) { t += 1 / 60; inst.update(1 / 60, p, t); }
  for (const a of actions) inst.action(a, p);
  const m = Object.fromEntries((inst.metrics ? inst.metrics(p, t) : []).map((r) => [r[0], r[1]]));
  return { inst, m, p };
}
const num = (v) => parseFloat(String(v).replace(',', '.'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} ≠ ${b} (±${tol})`);

test('Hóa: ester hóa K = 4, tỉ lệ 1:1 → hiệu suất cân bằng 2/3', () => {
  near(num(run('chem-esterification', { ratio: 1 }).m['Hiệu suất cân bằng (theo acid)']), 66.7, 0.1, 'H%');
  // dư ethanol 3:1 → hiệu suất ≈ 90,2 %
  near(num(run('chem-esterification', { ratio: 3 }).m['Hiệu suất cân bằng (theo acid)']), 90.2, 0.3, 'H% dư alcohol');
});

test('Hóa: E° pin Zn–Cu = 1,10 V; Mg–Ag = 3,17 V', () => {
  assert.equal(run('chem-galvanic-cell', { A: 'Zn', B: 'Cu' }).m['E° pin'], '1.10 V');
  assert.equal(run('chem-galvanic-cell', { A: 'Mg', B: 'Ag' }).m['E° pin'], '3.17 V');
  assert.equal(run('chem-galvanic-cell', { A: 'Zn', B: 'Cu' }).m['Anode (−)'], 'Zn');
});

test('Hóa: dãy điện hóa – Fe đẩy Cu, Cu không đẩy Fe', () => {
  assert.equal(run('chem-activity-series', { metal: 'Fe', sol: 'Cu2+' }).m['Phản ứng'], 'có');
  assert.equal(run('chem-activity-series', { metal: 'Cu', sol: 'Fe2+' }).m['Phản ứng'], 'không');
  assert.equal(run('chem-activity-series', { metal: 'Cu', sol: 'H+ (HCl)' }).m['Phản ứng'], 'không');
});

test('Hóa: chuẩn độ KMnO4 – 10 mL Fe2+ 0,1 M cần 10 mL KMnO4 0,02 M', () => {
  const r = run('chem-kmno4-titration', { cFe: 0.1, cMn: 0.02, step: 1 }, { actions: Array(9).fill('drop') });
  assert.equal(r.m['Đã qua điểm tương đương'], 'chưa');
  r.inst.action('drop', r.p);
  assert.equal(r.inst.metrics(r.p).find((x) => x[0] === 'Đã qua điểm tương đương')[1], 'có');
});

test('Hóa: điều chế kim loại – Na chỉ bằng điện phân nóng chảy', () => {
  assert.equal(run('chem-metal-extraction', { metal: 'Na' }).m['Phương pháp phù hợp nhất'], 'điện phân nóng chảy');
  assert.equal(run('chem-metal-extraction', { metal: 'Fe' }).m['Phương pháp phù hợp nhất'], 'nhiệt luyện');
});

test('Hóa: Na2CO3 không bị nhiệt phân, CaCO3 phân hủy ở 900 °C', () => {
  assert.equal(run('chem-carbonate-decomp', { salt: 'Na2CO3', temp: 1500 }, { seconds: 5 }).m['Đã phân hủy'], '0 %');
  assert.equal(run('chem-carbonate-decomp', { salt: 'CaCO3', temp: 600 }, { seconds: 5 }).m['Đã phân hủy'], '0 %');
  assert.notEqual(run('chem-carbonate-decomp', { salt: 'CaCO3', temp: 1000 }, { seconds: 5 }).m['Đã phân hủy'], '0 %');
});

test('Lí: máy biến áp lí tưởng U2 = U1·N2/N1', () => {
  assert.equal(run('physics-transformer', { N1: 200, N2: 400, U1: 12, ac: true }).m.U2, '24.0 V');
  assert.equal(run('physics-transformer', { N1: 200, N2: 400, U1: 12, ac: false }).m.U2, '0.0 V');
});

test('Lí: thấu kính f = R/(2(n−1)); d = 2f cho ảnh thật bằng vật', () => {
  const { m } = run('physics-thin-lens', { d: 30, n: 1.5, R: 15 });
  assert.equal(m['Tiêu cự f'], '15.0 cm');
  assert.equal(m['d′'], '30.0 cm');
  assert.equal(m['Số phóng đại k'], '-1.00');
});

test('Lí: cân dòng điện F = NBIL', () => {
  near(num(run('physics-current-balance', { N: 50, Btrue: 0.08, I: 2 }).m['F = NBIL']), 0.32, 1e-4, 'F');
});

test('Lí: bán rã – sau 1 chu kì còn ≈ 1/2 (thống kê 2000 hạt)', () => {
  const { m } = run('physics-radioactive-decay', { N0: 2000, rate: 1 }, { seconds: 10 });
  near(num(m['t / T']), 1, 0.02, 't/T');
  near(num(String(m['Còn lại N']).split('/')[0]), 1000, 120, 'N còn lại');
});

test('Lí: năng lượng liên kết riêng Fe-56 ≈ 8,8 MeV, U-238 ≈ 7,6 MeV', () => {
  near(num(run('physics-nucleus', { Z: 26, N: 30 }).m['E_lk / A']), 8.79, 0.15, 'Fe-56');
  near(num(run('physics-nucleus', { Z: 92, N: 146 }).m['E_lk / A']), 7.57, 0.15, 'U-238');
});

test('Lí: định luật I – ΔU = A + Q trong mọi quá trình', () => {
  for (const proc of ['compress', 'heatP', 'heatV', 'expand']) {
    const { m } = run('physics-first-law', { proc }, { seconds: 4 });
    near(num(m['ΔU']), num(m.A) + num(m.Q), 0.3, proc);
  }
});

test('Lí: thang nhiệt độ 0 °C = 273,15 K; −40 °C = −40 °F', () => {
  assert.equal(run('physics-temperature-scales', { t: 0 }).m.Kelvin, '273.15 K');
  assert.equal(run('physics-temperature-scales', { t: -40 }).m.Fahrenheit, '-40.0 °F');
});

test('Sinh: Hardy–Weinberg – một thế hệ ngẫu phối từ 0,5 AA + 0,5 aa → 0,25 : 0,5 : 0,25', () => {
  const { m } = run('bio-hardy-weinberg', { AA: 0.5, aa: 0.5, mating: 'random', sel: 0 }, { actions: ['gen'] });
  assert.equal(m['AA / Aa / aa'], '0.250 / 0.500 / 0.250');
});

test('Sinh: tự phối – dị hợp giảm một nửa mỗi thế hệ', () => {
  const { m } = run('bio-hardy-weinberg', { AA: 0, aa: 0, mating: 'self', sel: 0 }, { actions: ['gen', 'gen'] });
  assert.equal(m['AA / Aa / aa'], '0.375 / 0.250 / 0.375');
});

test('Sinh: liên kết X – XᴬXᵃ × XᴬY → 50 % con trai bệnh, 0 % con gái bệnh', () => {
  const { m } = run('bio-sex-linked', { mom: 'XAXa', dad: 'XAY' });
  assert.equal(m['P(con trai bệnh)'], '50 %');
  assert.equal(m['P(con gái bệnh)'], '0 %');
});

test('Sinh: tương tác gene – tỉ lệ lí thuyết', () => {
  assert.equal(run('bio-gene-interaction', { mode: 'comp' }).m['Tỉ lệ lí thuyết'], '9 : 7');
  assert.equal(run('bio-gene-interaction', { mode: 'add' }).m['Tỉ lệ lí thuyết'], '15 : 1');
});

test('Sinh: thí nghiệm Gause – P. caudatum bị loại khi nuôi chung, đạt K khi nuôi riêng', () => {
  const together = run('bio-species-interactions', { rel: 'competition', together: true }, { seconds: 60 }).m;
  assert.equal(together['P. caudatum'], 0);
  near(together['P. aurelia'], 100, 2, 'P. aurelia đạt K');
  const apart = run('bio-species-interactions', { rel: 'competition', together: false }, { seconds: 60 }).m;
  near(apart['P. caudatum'], 100, 2, 'nuôi riêng đạt K');
});

test('Sinh: di truyền ngoài nhân – con luôn giống mẹ', () => {
  assert.equal(run('bio-extranuclear', { mom: 'var', dad: 'green' }).m['Kiểu hình F1'], 'lá đốm');
  assert.equal(run('bio-extranuclear', { mom: 'green', dad: 'var' }).m['Kiểu hình F1'], 'lá xanh');
});

test('Sinh: chu trình carbon cân bằng khi không có tác động của con người', () => {
  const { m } = run('bio-carbon-cycle', { fossil: 0, forest: 100 }, { seconds: 20 });
  near(num(m['CO₂ khí quyển']), 399, 3, 'ppm ổn định');
  const burn = run('bio-carbon-cycle', { fossil: 8, forest: 100 }, { seconds: 20 }).m;
  assert.ok(num(burn['CO₂ khí quyển']) > 420, 'đốt nhiên liệu làm CO2 tăng');
});

test('Sinh: tăng trưởng logistic tiến về K', () => {
  near(num(run('bio-population-growth', { mode: 'logistic', r: 0.5, K: 500, N0: 20 }, { seconds: 25 }).m['N hiện tại']), 500, 5, 'N → K');
});
