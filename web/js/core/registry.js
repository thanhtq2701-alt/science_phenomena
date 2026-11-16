/**
 * Danh sách module mô phỏng. Đường dẫn tương đối tới thư mục web/js/sims/.
 * Thêm bài mới: tạo file trong sims/<môn>/ rồi thêm vào đây. tools/build-catalog.js sẽ sinh data/catalog.json.
 */
export const SIM_PATHS = [
  // ===== Hóa học 12 =====
  'chem/esterification.js',
  'chem/ester-hydrolysis.js',
  'chem/glucose-tests.js',
  'chem/starch-iodine.js',
  'chem/carb-hydrolysis.js',
  'chem/amine-reactions.js',
  'chem/amino-acid.js',
  'chem/polymerization.js',
  'chem/galvanic-cell.js',
  'chem/electrolysis.js',
  'chem/activity-series.js',
  'chem/corrosion.js',
  'chem/na-water.js',
  'chem/hard-water.js',
  'chem/flame-test.js',
  'chem/complex-ions.js',
  // ===== Vật lí 12 =====
  'physics/kinetic-model.js',
  'physics/brownian.js',
  'physics/heating-curve.js',
  'physics/thermal-equilibrium.js',
  'physics/boyle.js',
  'physics/charles.js',
  'physics/gas-pressure.js',
  'physics/magnetic-field.js',
  'physics/lorentz-force.js',
  'physics/faraday-induction.js',
  'physics/ac-generator.js',
  'physics/radioactive-decay.js',
  'physics/fission-fusion.js',
  'physics/nucleus.js',
  'physics/damped-oscillator.js',
  'physics/thin-lens.js',
  // ===== Sinh học 12 =====
  'bio/dna-replication.js',
  'bio/transcription.js',
  'bio/translation.js',
  'bio/lac-operon.js',
  'bio/gene-mutation.js',
  'bio/mitosis-meiosis.js',
  'bio/chromosome-mutation.js',
  'bio/punnett.js',
  'bio/linkage.js',
  'bio/sex-linked.js',
  'bio/hardy-weinberg.js',
  'bio/natural-selection.js',
  'bio/genetic-drift.js',
  'bio/population-growth.js',
  'bio/predator-prey.js',
  'bio/food-web.js'
];

export async function loadAllSims(base = '../sims/') {
  const mods = await Promise.all(SIM_PATHS.map((p) => import(base + p)));
  return mods.map((m, i) => {
    const sim = m.default;
    if (!sim || !sim.id) throw new Error('Module không có export default hợp lệ: ' + SIM_PATHS[i]);
    sim.path = SIM_PATHS[i];
    return sim;
  });
}
