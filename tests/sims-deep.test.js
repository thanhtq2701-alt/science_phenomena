/**
 * Kiểm tra sâu: mỗi bài chạy ~20 s mô phỏng ở giá trị mặc định, min và max của từng thanh trượt,
 * mọi lựa chọn select, bật/tắt toggle, bấm mọi action. Bắt lỗi:
 *  - tham số số truyền vào hàm vẽ canvas là NaN / Infinity (hình sẽ biến mất hoặc vỡ)
 *  - số liệu hiển thị chứa "NaN" hoặc "undefined"
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSims } from '../tools/build-catalog.js';

const sims = await loadSims();

function strictContext(problems, simId, label) {
  const grad = { addColorStop: (o) => { if (!Number.isFinite(o)) problems.push(`${simId} [${label}] gradient offset ${o}`); } };
  const check = (name) => (...args) => {
    for (const a of args) if (typeof a === 'number' && !Number.isFinite(a)) { problems.push(`${simId} [${label}] ${name}(${args.map(String).join(', ')})`); break; }
    if (name === 'createLinearGradient' || name === 'createRadialGradient') return grad;
    if (name === 'measureText') return { width: 10 };
    return undefined;
  };
  return new Proxy({}, { get: (_, prop) => (typeof prop === 'string' ? check(prop) : undefined), set: () => true });
}

function variants(sim) {
  const base = {};
  for (const p of sim.params || []) base[p.key] = p.value;
  const out = [['mặc định', base]];
  for (const p of sim.params || []) {
    const type = p.type || 'range';
    if (type === 'range') { out.push([`${p.key}=min`, { ...base, [p.key]: p.min }]); out.push([`${p.key}=max`, { ...base, [p.key]: p.max }]); }
    else if (type === 'select') for (const [v] of p.options) out.push([`${p.key}=${v}`, { ...base, [p.key]: v }]);
    else if (type === 'toggle') out.push([`${p.key}=${!p.value}`, { ...base, [p.key]: !p.value }]);
  }
  return out;
}

test('không có NaN/Infinity khi vẽ và trong số liệu (mọi giá trị biên)', () => {
  const problems = [];
  for (const sim of sims) {
    for (const [label, params] of variants(sim)) {
      const g = strictContext(problems, sim.id, label);
      const inst = sim.create({ w: 960, h: 520, params: { ...params }, runner: null });
      let t = 0;
      for (let i = 0; i < 600; i++) {
        t += 1 / 30;
        inst.update(1 / 30, params, t);
        if (i === 200) for (const a of sim.actions || []) inst.action && inst.action(a.key, params);
        if (i % 100 === 0) inst.draw(g, 960, 520, params, t);
      }
      inst.draw(g, 960, 520, params, t);
      inst.draw(g, 380, 340, params, t);
      if (inst.metrics) for (const row of inst.metrics(params, t)) {
        const s = String(row[1]);
        if (/NaN|undefined|Infinity/.test(s) && !/∞/.test(s)) problems.push(`${sim.id} [${label}] metric "${row[0]}" = ${s}`);
      }
    }
  }
  const uniq = [...new Set(problems)];
  assert.equal(uniq.length, 0, `${uniq.length} vấn đề:\n` + uniq.slice(0, 40).join('\n'));
});
