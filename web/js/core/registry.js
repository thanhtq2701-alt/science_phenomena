/**
 * Danh sách module mô phỏng. Đường dẫn tương đối tới thư mục web/js/sims/.
 * Thêm bài mới: tạo file trong sims/<môn>/ rồi thêm vào đây. tools/build-catalog.js sẽ sinh data/catalog.json.
 */
export const SIM_PATHS = [
  // ===== Hóa học 12 =====
  'chem/esterification.js',
  'chem/ester-hydrolysis.js',
  'chem/soap-micelle.js',
  'chem/glucose-tests.js',
  'chem/starch-iodine.js',
  'chem/carb-hydrolysis.js',
  'chem/fermentation.js',
  'chem/cellulose.js',
  'chem/amine-reactions.js',
  'chem/amino-acid.js',
  'chem/protein-denaturation.js',
  'chem/polymerization.js',
  'chem/polymer-materials.js',
  'chem/galvanic-cell.js',
  'chem/electrolysis.js',
  'chem/batteries.js',
  'chem/activity-series.js',
  'chem/metallic-bond.js',
  'chem/corrosion.js',
  'chem/metal-extraction.js',
  'chem/na-water.js',
  'chem/hard-water.js',
  'chem/carbonate-decomp.js',
  'chem/flame-test.js',
  'chem/complex-ions.js',
  'chem/kmno4-titration.js',
  // ===== Vật lí 12 =====
  'physics/kinetic-model.js',
  'physics/temperature-scales.js',
  'physics/brownian.js',
  'physics/heating-curve.js',
  'physics/thermal-equilibrium.js',
  'physics/specific-heat-lab.js',
  'physics/latent-heat-lab.js',
  'physics/first-law.js',
  'physics/boyle.js',
  'physics/charles.js',
  'physics/gas-pressure.js',
  'physics/magnetic-field.js',
  'physics/lorentz-force.js',
  'physics/current-balance.js',
  'physics/faraday-induction.js',
  'physics/ac-generator.js',
  'physics/transformer.js',
  'physics/em-wave.js',
  'physics/radioactive-decay.js',
  'physics/radiation-types.js',
  'physics/fission-fusion.js',
  'physics/nucleus.js',
  'physics/damped-oscillator.js',
  'physics/thin-lens.js',
  // ===== Sinh học 12 =====
  'bio/dna-replication.js',
  'bio/transcription.js',
  'bio/translation.js',
  'bio/lac-operon.js',
  'bio/recombinant-dna.js',
  'bio/gene-mutation.js',
  'bio/mitosis-meiosis.js',
  'bio/chromosome-structure.js',
  'bio/chromosome-mutation.js',
  'bio/punnett.js',
  'bio/linkage.js',
  'bio/sex-linked.js',
  'bio/gene-interaction.js',
  'bio/extranuclear.js',
  'bio/reaction-norm.js',
  'bio/pedigree.js',
  'bio/hardy-weinberg.js',
  'bio/gene-flow.js',
  'bio/natural-selection.js',
  'bio/evolution-evidence.js',
  'bio/speciation.js',
  'bio/genetic-drift.js',
  'bio/miller-urey.js',
  'bio/population-growth.js',
  'bio/population-traits.js',
  'bio/predator-prey.js',
  'bio/species-interactions.js',
  'bio/food-web.js',
  'bio/succession.js',
  'bio/carbon-cycle.js',
  'bio/tolerance-limits.js'
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
