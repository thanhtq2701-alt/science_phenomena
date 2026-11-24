/**
 * Kiểm tra tính hợp lệ của mọi module mô phỏng: metadata, chương tồn tại, tham số đúng kiểu,
 * create()/update()/draw() chạy được với canvas giả lập.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSims } from '../tools/build-catalog.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const curriculum = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'curriculum.json'), 'utf8'));
const sims = await loadSims();

/** Canvas 2D giả: mọi phương thức đều no-op, đủ để chạy draw() */
function fakeContext() {
  const noop = () => {};
  const grad = { addColorStop: noop };
  return new Proxy({}, {
    get(_, prop) {
      if (prop === 'measureText') return () => ({ width: 10 });
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => grad;
      if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
      return noop;
    },
    set() { return true; }
  });
}

test('có ít nhất 40 mô phỏng', () => { assert.ok(sims.length >= 40, `chỉ có ${sims.length}`); });

test('id duy nhất và đúng tiền tố môn', () => {
  const ids = new Set();
  for (const s of sims) {
    assert.ok(!ids.has(s.id), `id trùng: ${s.id}`);
    ids.add(s.id);
    assert.ok(s.id.startsWith(s.subject + '-'), `${s.id} phải bắt đầu bằng ${s.subject}-`);
  }
});

test('môn và chương tồn tại trong curriculum', () => {
  for (const s of sims) {
    const sub = curriculum.subjects.find((x) => x.id === s.subject);
    assert.ok(sub, `${s.id}: môn ${s.subject} không tồn tại`);
    assert.ok(sub.chapters.some((c) => c.id === s.chapter), `${s.id}: chương ${s.chapter} không có trong ${s.subject}`);
  }
});

test('mỗi chương có ít nhất một mô phỏng', () => {
  for (const sub of curriculum.subjects) for (const c of sub.chapters) {
    assert.ok(sims.some((s) => s.subject === sub.id && s.chapter === c.id), `chương ${sub.id}/${c.id} chưa có bài`);
  }
});

test('metadata đầy đủ', () => {
  for (const s of sims) {
    assert.equal(typeof s.title, 'string');
    assert.ok(s.title.length > 5, `${s.id}: title ngắn`);
    assert.ok(s.summary && s.summary.length > 20, `${s.id}: thiếu summary`);
    assert.ok(s.theory && s.theory.length, `${s.id}: thiếu theory`);
    assert.equal(typeof s.create, 'function', `${s.id}: thiếu create()`);
  }
});

test('tham số có key/label/value hợp lệ', () => {
  for (const s of sims) for (const p of s.params || []) {
    assert.ok(p.key && p.label, `${s.id}: param thiếu key/label`);
    const type = p.type || 'range';
    if (type === 'range') {
      assert.ok(typeof p.min === 'number' && typeof p.max === 'number', `${s.id}.${p.key}: thiếu min/max`);
      assert.ok(p.value >= p.min && p.value <= p.max, `${s.id}.${p.key}: value ngoài khoảng`);
    } else if (type === 'select') {
      assert.ok(Array.isArray(p.options) && p.options.length >= 2, `${s.id}.${p.key}: select cần ≥2 options`);
      assert.ok(p.options.some((o) => String(o[0]) === String(p.value)), `${s.id}.${p.key}: value không nằm trong options`);
    } else if (type === 'toggle') {
      assert.equal(typeof p.value, 'boolean', `${s.id}.${p.key}: toggle cần boolean`);
    } else assert.fail(`${s.id}.${p.key}: kiểu ${type} không hỗ trợ`);
  }
});

test('quiz "Dự đoán trước" hợp lệ và mỗi môn có ít nhất 10 bài', () => {
  for (const s of sims) {
    if (!s.quiz) continue;
    const q = s.quiz;
    assert.ok(typeof q.question === 'string' && q.question.length > 10, `${s.id}: quiz thiếu question`);
    assert.ok(Array.isArray(q.options) && q.options.length >= 2, `${s.id}: quiz cần ≥2 options`);
    assert.ok(q.options.every((o) => typeof o === 'string' && o.length), `${s.id}: quiz có option rỗng`);
    assert.equal(new Set(q.options).size, q.options.length, `${s.id}: quiz có option trùng`);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${s.id}: quiz.answer ngoài options`);
    assert.ok(typeof q.explanation === 'string' && q.explanation.length > 10, `${s.id}: quiz thiếu explanation`);
  }
  for (const sub of curriculum.subjects) {
    const n = sims.filter((s) => s.subject === sub.id && s.quiz).length;
    assert.ok(n >= 10, `${sub.id}: chỉ có ${n} quiz`);
  }
});

test('create/update/draw/metrics chạy không lỗi (mọi tổ hợp select)', () => {
  const g = fakeContext();
  for (const s of sims) {
    const base = {};
    for (const p of s.params || []) base[p.key] = p.value;
    const selects = (s.params || []).filter((p) => p.type === 'select');
    const variants = [base];
    for (const sel of selects) for (const [v] of sel.options) variants.push({ ...base, [sel.key]: v });
    for (const params of variants) {
      const inst = s.create({ w: 900, h: 520, params, runner: null });
      assert.ok(inst && typeof inst.update === 'function' && typeof inst.draw === 'function', `${s.id}: instance thiếu update/draw`);
      let t = 0;
      for (let i = 0; i < 90; i++) { t += 1 / 60; inst.update(1 / 60, params, t); }
      inst.draw(g, 900, 520, params, t);
      inst.draw(g, 360, 340, params, t);
      if (inst.metrics) {
        const m = inst.metrics(params, t);
        assert.ok(Array.isArray(m), `${s.id}: metrics phải trả về mảng`);
        for (const row of m) assert.ok(Array.isArray(row) && row.length >= 2, `${s.id}: hàng metrics không hợp lệ`);
      }
      for (const a of s.actions || []) if (inst.action) inst.action(a.key, params);
      if (inst.onParam) for (const p of s.params || []) inst.onParam(p.key, params);
      inst.update(1 / 60, params, t + 1 / 60);
      inst.draw(g, 900, 520, params, t);
    }
  }
});
