/**
 * Vòng lặp mô phỏng dùng chung cho mọi bài.
 * Một "sim" là module export default { id, subject, chapter, title, ..., params, create(ctx) }
 * create() trả về instance có: update(dt, p, t), draw(g, w, h, p, t), metrics?(p), action?(key, p), onParam?(key, p)
 */
export class Runner {
  constructor(canvas, sim, params) {
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    this.sim = sim;
    this.params = params;
    this.inst = null;
    this.running = true;
    this.speed = 1;
    this.last = 0;
    this.time = 0;
    this.frame = 0;
    this.listeners = new Set();
    this.resize();
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    this.reset();
    this.raf = requestAnimationFrame((t) => this.tick(t));
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width));
    const h = Math.max(240, Math.floor(rect.height));
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w;
    this.h = h;
    if (this.inst && this.inst.onResize) this.inst.onResize(w, h);
  }

  reset() {
    this.time = 0;
    this.frame = 0;
    this.running = true;
    this.inst = this.sim.create({ w: this.w, h: this.h, params: this.params, runner: this });
  }

  setParam(key, value) {
    this.params[key] = value;
    if (this.inst && this.inst.onParam) this.inst.onParam(key, this.params);
  }

  action(key) {
    if (key === 'reset') return this.reset();
    if (key === 'pause') { this.running = !this.running; return; }
    if (this.inst && this.inst.action) this.inst.action(key, this.params);
  }

  onFrame(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  tick(t) {
    this.raf = requestAnimationFrame((tt) => this.tick(tt));
    const dtRaw = this.last ? (t - this.last) / 1000 : 0;
    this.last = t;
    const dt = Math.min(dtRaw, 0.05) * this.speed;
    if (this.running && dt > 0) {
      this.time += dt;
      this.frame++;
      try { this.inst.update(dt, this.params, this.time); } catch (e) { console.error(e); this.running = false; }
    }
    const g = this.g;
    g.save();
    g.clearRect(0, 0, this.w, this.h);
    try { this.inst.draw(g, this.w, this.h, this.params, this.time); } catch (e) { console.error(e); this.running = false; }
    g.restore();
    for (const fn of this.listeners) fn(this);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this._onResize);
    if (this.inst && this.inst.destroy) this.inst.destroy();
  }
}

/** Tạo object tham số mặc định từ spec */
export function defaultParams(sim) {
  const p = {};
  for (const s of sim.params || []) p[s.key] = s.value;
  return p;
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const TAU = Math.PI * 2;
export function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
