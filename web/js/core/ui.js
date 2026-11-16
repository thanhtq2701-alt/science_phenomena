/** Xây bảng điều khiển (slider / select / toggle / nút) từ spec của sim. */
import { fmt } from './draw.js';

export function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) n.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
}

export function buildControls(sim, params, onChange) {
  const box = el('div', { class: 'controls' });
  for (const s of sim.params || []) {
    const type = s.type || 'range';
    const row = el('div', { class: 'ctl' });
    if (type === 'range') {
      const val = el('span', { class: 'ctl-val' }, fmtVal(params[s.key], s));
      const input = el('input', { type: 'range', min: s.min, max: s.max, step: s.step ?? 1, value: params[s.key] });
      input.addEventListener('input', () => {
        const v = parseFloat(input.value);
        val.textContent = fmtVal(v, s);
        onChange(s.key, v);
      });
      row.append(el('label', {}, el('span', {}, s.label), val), input);
      if (s.help) row.append(el('div', { class: 'ctl-help' }, s.help));
    } else if (type === 'select') {
      const sel = el('select', {});
      for (const [v, lbl] of s.options) sel.append(el('option', { value: v, selected: String(v) === String(params[s.key]) ? '' : undefined }, lbl));
      sel.addEventListener('change', () => {
        const opt = s.options.find((o) => String(o[0]) === sel.value);
        onChange(s.key, opt ? opt[0] : sel.value);
      });
      row.append(el('label', {}, el('span', {}, s.label)), sel);
      if (s.help) row.append(el('div', { class: 'ctl-help' }, s.help));
    } else if (type === 'toggle') {
      const input = el('input', { type: 'checkbox' });
      input.checked = !!params[s.key];
      input.addEventListener('change', () => onChange(s.key, input.checked));
      row.append(el('label', { class: 'toggle' }, input, el('span', {}, s.label)));
      if (s.help) row.append(el('div', { class: 'ctl-help' }, s.help));
    }
    box.append(row);
  }
  return box;
}

export function fmtVal(v, s) {
  if (typeof v !== 'number') return String(v);
  return fmt(v, s.decimals ?? (s.step && s.step < 1 ? 2 : 0)) + (s.unit ? ' ' + s.unit : '');
}

export function buildActions(sim, runner, onAny) {
  const box = el('div', { class: 'actions' });
  const pause = el('button', { class: 'btn', onclick: () => { runner.action('pause'); pause.textContent = runner.running ? '⏸ Tạm dừng' : '▶ Tiếp tục'; } }, '⏸ Tạm dừng');
  const reset = el('button', { class: 'btn', onclick: () => { runner.action('reset'); pause.textContent = '⏸ Tạm dừng'; onAny && onAny(); } }, '↺ Làm lại');
  box.append(pause, reset);
  for (const a of sim.actions || []) {
    box.append(el('button', { class: 'btn btn-accent', onclick: () => { runner.action(a.key); if (!runner.running) { runner.running = true; pause.textContent = '⏸ Tạm dừng'; } onAny && onAny(); } }, a.label));
  }
  const speed = el('select', { class: 'speed', title: 'Tốc độ mô phỏng' });
  for (const v of [0.25, 0.5, 1, 2, 4]) speed.append(el('option', { value: v, selected: v === 1 ? '' : undefined }, `×${v}`));
  speed.addEventListener('change', () => { runner.speed = parseFloat(speed.value); });
  box.append(el('label', { class: 'speed-wrap' }, 'Tốc độ ', speed));
  return box;
}

export function renderMetrics(container, rows) {
  if (!rows || !rows.length) { container.innerHTML = ''; return; }
  // Tránh tạo DOM mỗi frame: cập nhật text tại chỗ
  if (container.childElementCount !== rows.length) {
    container.innerHTML = '';
    for (const r of rows) container.append(el('div', { class: 'metric' }, el('span', { class: 'metric-k' }, r[0]), el('span', { class: 'metric-v' }, '')));
  }
  rows.forEach((r, i) => {
    const node = container.children[i];
    if (node.firstChild.textContent !== r[0]) node.firstChild.textContent = r[0];
    const v = typeof r[1] === 'number' ? fmt(r[1], r[2] ?? 2) : String(r[1]);
    if (node.lastChild.textContent !== v) node.lastChild.textContent = v;
    if (r[3]) node.lastChild.style.color = r[3]; else node.lastChild.style.color = '';
  });
}

/** Markdown siêu nhẹ: **đậm**, *nghiêng*, `mã`, xuống dòng, chỉ số ^ và _ cho công thức */
export function md(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

/** Chuyển công thức hóa học kiểu "H2SO4" / "Cu2+" sang HTML với chỉ số */
export function chem(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/([A-Za-z\)\]])(\d+)([+-]?)/g, (m, a, d, s) => `${a}<sub>${d}</sub>${s ? `<sup>${s}</sup>` : ''}`)
    .replace(/(\d)([+-])(?![\w(])/g, '<sup>$1$2</sup>')
    .replace(/\^(\{[^}]+\}|\S)/g, (m, s) => `<sup>${s.replace(/[{}]/g, '')}</sup>`)
    .replace(/->|→/g, '→').replace(/<=>|⇌/g, '⇌');
}
