/** Ứng dụng: hash router + các trang (Trang chủ, Môn học, Bài mô phỏng, Giới thiệu) */
import { loadAllSims } from './core/registry.js';
import { Runner, defaultParams } from './core/engine.js';
import { el, buildControls, buildActions, renderMetrics, md, chem } from './core/ui.js';

const state = { curriculum: null, sims: [], runner: null, ready: false, api: false, view: null, spy: null };

// Có server Node (Render Web Service / chạy local) thì bật góp ý + thống kê; bản tĩnh thì tự tắt.
const apiReady = fetch('/api/health', { cache: 'no-store' })
  .then((r) => (r.ok ? r.json() : null))
  .then((j) => { state.api = !!(j && j.ok); })
  .catch(() => { state.api = false; });
const app = document.getElementById('app');

async function boot() {
  const [cur, sims] = await Promise.all([
    fetch('data/curriculum.json').then((r) => r.json()),
    loadAllSims() // import() trong registry.js được phân giải tương đối với core/, nên mặc định '../sims/'
  ]);
  state.curriculum = cur;
  state.sims = sims;
  await apiReady;
  state.ready = true;
  window.addEventListener('hashchange', route);
  route();
}

function subjectOf(id) { return state.curriculum.subjects.find((s) => s.id === id); }
function chapterOf(sub, id) { return sub.chapters.find((c) => c.id === id); }
function simsOf(subId, chapId) { return state.sims.filter((s) => s.subject === subId && (!chapId || s.chapter === chapId)); }

function route() {
  // Hash dạng #/<trang>/<id>?<tham số>, ví dụ #/physics/ideal-gas hoặc #/sim/physics-boyle?V=1.5
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const [page, a] = path.split('/');
  document.querySelectorAll('.nav a').forEach((n) => n.classList.toggle('active', n.getAttribute('href') === '#/' + (page || '')));
  const sub = subjectOf(page);
  // Cùng một môn: chỉ cuộn tới chương, không vẽ lại trang
  if (sub && state.view === 'subject:' + sub.id) return focusChapter(sub, a || null, true);
  if (state.runner) { state.runner.destroy(); state.runner = null; }
  if (state.spy) { state.spy.disconnect(); state.spy = null; }
  state.view = null;
  window.scrollTo(0, 0);
  if (!page) return renderHome();
  if (page === 'about') return renderAbout();
  if (page === 'sim' && a) return renderSim(a, new URLSearchParams(query));
  if (page === 'search') return renderSearch(decodeURIComponent(a || ''));
  if (sub) { renderSubject(sub); return focusChapter(sub, a || null, false); }
  renderHome();
}

/** Tô sáng chương trên thanh bên và cuộn tới chương đó (hoặc lên đầu nếu chapId rỗng) */
function focusChapter(sub, chapId, smooth) {
  setActiveChapter(chapId);
  state.spyLockUntil = Date.now() + (smooth ? 1200 : 300); // không để theo dõi cuộn ghi đè trong lúc đang cuộn
  const behavior = smooth ? 'smooth' : 'auto';
  requestAnimationFrame(() => {
    const target = chapId && document.getElementById('chap-' + chapId);
    if (target) target.scrollIntoView({ behavior, block: 'start' });
    else window.scrollTo({ top: 0, behavior });
  });
}

function setActiveChapter(chapId) {
  document.querySelectorAll('.side-link').forEach((n) => n.classList.toggle('active', (n.dataset.chap || '') === (chapId || '')));
}

// ---------- Trang chủ ----------
function renderHome() {
  const total = state.sims.length;
  const cards = state.curriculum.subjects.map((s) => {
    const n = simsOf(s.id).length;
    return el('a', { class: 'subject-card', href: '#/' + s.id, style: `--c:${s.color}` },
      el('div', { class: 'subject-icon' }, s.icon),
      el('h2', {}, s.name),
      el('p', {}, s.tagline),
      el('div', { class: 'subject-meta' }, `${s.chapters.length} chương · ${n} mô phỏng`)
    );
  });
  const searchBox = el('form', { class: 'search', onsubmit: (e) => { e.preventDefault(); location.hash = '#/search/' + encodeURIComponent(e.target.q.value.trim()); } },
    el('input', { name: 'q', placeholder: 'Tìm mô phỏng: ví dụ "tráng bạc", "bán rã", "operon"...', autocomplete: 'off' }),
    el('button', { class: 'btn btn-accent' }, 'Tìm')
  );
  app.replaceChildren(
    el('section', { class: 'hero' },
      el('h1', {}, 'Phòng thí nghiệm ảo ', el('span', { class: 'grad' }, 'Khoa học 12')),
      el('p', { class: 'lead' }, `${total} mô phỏng tương tác: phản ứng Hóa học, thí nghiệm Vật lí và hình động Sinh học theo Chương trình GDPT 2018. Kéo thanh trượt, bấm nút và quan sát hiện tượng diễn ra.`),
      searchBox
    ),
    el('section', { class: 'subjects' }, cards),
    el('section', { class: 'featured' },
      el('h3', {}, 'Bài nổi bật'),
      el('div', { class: 'grid' }, pickFeatured().map(simCard))
    )
  );
}

function pickFeatured() {
  const ids = ['chem-galvanic-cell', 'physics-faraday-induction', 'bio-translation', 'chem-glucose-tests', 'physics-radioactive-decay', 'bio-punnett'];
  return ids.map((id) => state.sims.find((s) => s.id === id)).filter(Boolean);
}

function simCard(sim) {
  const sub = subjectOf(sim.subject);
  const ch = chapterOf(sub, sim.chapter);
  return el('a', { class: 'sim-card', href: '#/sim/' + sim.id, style: `--c:${sub.color}` },
    el('div', { class: 'sim-card-top' }, el('span', { class: 'chip' }, sub.icon + ' ' + sub.short), el('span', { class: 'chip chip-muted' }, ch ? ch.title : sim.chapter)),
    el('h4', {}, sim.title),
    el('p', {}, sim.summary || ''),
    sim.equation ? el('div', { class: 'eq', html: chem(Array.isArray(sim.equation) ? sim.equation[0] : sim.equation) }) : null
  );
}

// ---------- Trang môn học ----------
function renderSubject(sub) {
  const side = el('aside', { class: 'sidebar' },
    el('h3', {}, sub.icon + ' ' + sub.name),
    el('a', { class: 'side-link active', href: '#/' + sub.id, 'data-chap': '' }, 'Tất cả', el('span', { class: 'count' }, simsOf(sub.id).length)),
    ...sub.chapters.map((c) => el('a', { class: 'side-link', href: `#/${sub.id}/${c.id}`, 'data-chap': c.id }, `${c.order}. ${c.title}`, el('span', { class: 'count' }, simsOf(sub.id, c.id).length)))
  );
  const sections = sub.chapters.map((c) => {
    const list = simsOf(sub.id, c.id);
    if (!list.length) return null;
    return el('section', { class: 'chapter', id: 'chap-' + c.id, 'data-chap': c.id },
      el('h3', {}, `Chương ${c.order}. ${c.title}`),
      el('div', { class: 'grid' }, list.map(simCard))
    );
  }).filter(Boolean);
  const main = el('div', { class: 'subject-main' },
    el('h1', { style: `--c:${sub.color}` }, sub.name),
    el('p', { class: 'lead' }, sub.tagline),
    ...sections
  );
  app.replaceChildren(el('div', { class: 'layout-side' }, side, main));
  state.view = 'subject:' + sub.id;

  // Khi người dùng tự cuộn: tô sáng chương đang nằm ở phần trên màn hình
  if ('IntersectionObserver' in window) {
    state.spy = new IntersectionObserver((entries) => {
      if (Date.now() < (state.spyLockUntil || 0)) return;
      const visible = entries.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top);
      if (!visible.length) return;
      const first = sections[0] && sections[0].dataset.chap;
      const chap = visible[0].target.dataset.chap;
      setActiveChapter(window.scrollY < 40 && chap === first ? '' : chap);
    }, { rootMargin: '-80px 0px -60% 0px' });
    sections.forEach((s) => state.spy.observe(s));
  }
}

// ---------- Tìm kiếm ----------
function renderSearch(q) {
  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const nq = norm(q);
  const hits = state.sims.filter((s) => norm(s.title + ' ' + s.summary + ' ' + (s.keywords || []).join(' ') + ' ' + s.chapter).includes(nq));
  app.replaceChildren(
    el('h1', {}, `Kết quả cho "${q}"`),
    el('p', { class: 'lead' }, `${hits.length} mô phỏng`),
    el('div', { class: 'grid' }, hits.map(simCard))
  );
}

// ---------- Trang mô phỏng ----------
function renderSim(id, query = new URLSearchParams()) {
  const sim = state.sims.find((s) => s.id === id);
  if (!sim) { app.replaceChildren(el('h1', {}, 'Không tìm thấy mô phỏng'), el('a', { href: '#/' }, '← Trang chủ')); return; }
  const sub = subjectOf(sim.subject);
  const ch = chapterOf(sub, sim.chapter);
  const list = simsOf(sim.subject, sim.chapter);
  const idx = list.indexOf(sim);
  const prev = list[idx - 1], next = list[idx + 1];

  const params = applyQuery(sim, defaultParams(sim), query);
  const canvas = el('canvas', { class: 'stage' });
  const metricsBox = el('div', { class: 'metrics' });
  const metricsPanel = el('div', {}, el('h3', {}, 'Số liệu'), metricsBox);
  const revealMetrics = () => { metricsPanel.hidden = false; };
  const prediction = sim.quiz ? buildQuiz(sim.quiz, revealMetrics) : null;
  metricsPanel.hidden = !!prediction;
  const controls = buildControls(sim, params, (k, v) => state.runner && state.runner.setParam(k, v));

  const panel = el('aside', { class: 'panel' },
    el('h3', {}, 'Điều khiển'),
    controls,
    el('div', { id: 'actions' }),
    prediction,
    metricsPanel
  );

  const eqs = sim.equation ? (Array.isArray(sim.equation) ? sim.equation : [sim.equation]) : [];
  const theory = el('section', { class: 'theory' },
    eqs.length ? el('div', { class: 'eq-block' }, el('h3', {}, 'Phương trình / Công thức'), ...eqs.map((e) => el('div', { class: 'eq', html: chem(e) }))) : null,
    sim.theory ? el('div', {}, el('h3', {}, 'Giải thích'), ...(Array.isArray(sim.theory) ? sim.theory : [sim.theory]).map((t) => el('p', { html: chemMd(t) }))) : null,
    sim.observe ? el('div', { class: 'observe' }, el('h3', {}, 'Hãy thử & quan sát'), el('ul', {}, ...sim.observe.map((t) => el('li', { html: chemMd(t) })))) : null,
    sim.exam ? el('div', { class: 'exam' }, el('h3', {}, 'Liên hệ bài thi'), el('ul', {}, ...sim.exam.map((t) => el('li', { html: chemMd(t) })))) : null
  );

  const feedback = !state.api ? null : el('details', { class: 'feedback' },
    el('summary', {}, 'Góp ý cho bài này'),
    el('form', { onsubmit: sendFeedback(sim.id) },
      el('select', { name: 'rating' }, el('option', { value: '5' }, '★★★★★ Rất dễ hiểu'), el('option', { value: '4' }, '★★★★ Tốt'), el('option', { value: '3' }, '★★★ Bình thường'), el('option', { value: '2' }, '★★ Khó hiểu'), el('option', { value: '1' }, '★ Sai / lỗi')),
      el('textarea', { name: 'message', placeholder: 'Bạn thấy chỗ nào chưa rõ, sai hoặc muốn thêm gì?', maxlength: 2000, required: '' }),
      el('button', { class: 'btn btn-accent' }, 'Gửi'),
      el('span', { class: 'fb-status' })
    )
  );

  app.replaceChildren(
    el('div', { class: 'crumbs' }, el('a', { href: '#/' }, 'Trang chủ'), ' › ', el('a', { href: '#/' + sub.id }, sub.name), ' › ', el('a', { href: `#/${sub.id}/${sim.chapter}` }, ch ? ch.title : sim.chapter)),
    el('h1', { style: `--c:${sub.color}` }, sim.title),
    el('p', { class: 'lead' }, sim.summary || ''),
    el('div', { class: 'sim-layout' }, el('div', { class: 'stage-wrap', style: `--c:${sub.color}` }, canvas), panel),
    theory,
    ...(feedback ? [feedback] : []),
    el('nav', { class: 'pager' },
      prev ? el('a', { href: '#/sim/' + prev.id }, '← ' + prev.title) : el('span'),
      next ? el('a', { href: '#/sim/' + next.id }, next.title + ' →') : el('span'))
  );

  const runner = new Runner(canvas, sim, params);
  state.runner = runner;
  if (state.api) fetch('/api/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sim: sim.id }) }).catch(() => {});
  const actions = buildActions(sim, runner);
  const shareButton = el('button', { class: 'btn', onclick: async () => {
    const link = simLink(sim, runner.params);
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(link);
        shareButton.textContent = '✓ Đã chép';
        window.setTimeout(() => { shareButton.textContent = '🔗 Sao chép link'; }, 1500);
        return;
      } catch {}
    }
    window.prompt('Sao chép link mô phỏng:', link);
  } }, '🔗 Sao chép link');
  actions.append(shareButton);
  document.getElementById('actions').replaceWith(actions);
  let acc = 0;
  runner.onFrame((r) => {
    acc++;
    if (acc % 6 !== 0 || !r.inst || !r.inst.metrics) return;
    renderMetrics(metricsBox, r.inst.metrics(r.params, r.time));
  });
}

function buildQuiz(quiz, onAnswer) {
  const feedback = el('p', { hidden: true });
  const choices = el('div', { class: 'quiz-options' },
    ...quiz.options.map((option, index) => el('button', {
      class: 'btn',
      type: 'button',
      onclick: () => {
        const correct = index === quiz.answer;
        for (const button of choices.children) button.disabled = true;
        feedback.textContent = correct
          ? `Chính xác. ${quiz.explanation}`
          : `Chưa chính xác. Đáp án đúng: ${quiz.options[quiz.answer]}. ${quiz.explanation}`;
        feedback.hidden = false;
        onAnswer();
      }
    }, option))
  );
  return el('section', { class: 'prediction' },
    el('h3', {}, 'Dự đoán trước'),
    el('p', {}, quiz.question),
    choices,
    feedback
  );
}

/** Đặt sẵn tham số từ link, vd #/sim/physics-kinetic-model?temp=610 (bỏ qua giá trị không hợp lệ) */
function applyQuery(sim, params, query) {
  for (const spec of sim.params || []) {
    if (!query.has(spec.key)) continue;
    const raw = query.get(spec.key);
    const type = spec.type || 'range';
    if (type === 'range') { const v = Number(raw); if (Number.isFinite(v)) params[spec.key] = Math.min(spec.max, Math.max(spec.min, v)); }
    else if (type === 'toggle') params[spec.key] = raw === '1' || raw === 'true';
    else if (type === 'select') { const opt = spec.options.find((o) => String(o[0]) === raw); if (opt) params[spec.key] = opt[0]; }
  }
  return params;
}

function simLink(sim, params) {
  const query = new URLSearchParams();
  const defaults = defaultParams(sim);
  for (const spec of sim.params || []) {
    const type = spec.type || 'range';
    const serialize = (value) => {
      if (type === 'toggle') return value ? '1' : '0';
      if (type === 'range') {
        const step = String(spec.step ?? 1).toLowerCase();
        const [base, exponent = '0'] = step.split('e');
        const decimals = spec.decimals ?? Math.max(0, (base.split('.')[1] || '').length - Number(exponent));
        return String(Number(Number(value).toFixed(decimals)));
      }
      return String(value);
    };
    const value = serialize(params[spec.key]);
    if (value !== serialize(defaults[spec.key])) query.set(spec.key, value);
  }
  const search = query.toString();
  return `${window.location.origin}${window.location.pathname}#/sim/${sim.id}${search ? `?${search}` : ''}`;
}

function chemMd(t) { return md(t).replace(/\{\{(.+?)\}\}/g, (m, f) => chem(f)); }

function sendFeedback(simId) {
  return async (e) => {
    e.preventDefault();
    const f = e.target;
    const status = f.querySelector('.fb-status');
    status.textContent = 'Đang gửi...';
    try {
      const r = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sim: simId, rating: Number(f.rating.value), message: f.message.value }) });
      status.textContent = r.ok ? 'Cảm ơn bạn! Đã ghi nhận.' : 'Không gửi được.';
      if (r.ok) f.message.value = '';
    } catch { status.textContent = 'Không gửi được (chạy offline?).'; }
  };
}

// ---------- Giới thiệu ----------
function renderAbout() {
  app.replaceChildren(
    el('h1', {}, 'Giới thiệu'),
    el('div', { class: 'about' },
      el('p', {}, 'Science Phenomena 12 là phòng thí nghiệm ảo cho học sinh lớp 12: mô phỏng phản ứng Hóa học, thí nghiệm Vật lí và các quá trình Sinh học bằng hình động dễ hiểu, chạy hoàn toàn trên trình duyệt.'),
      el('p', {}, 'Nội dung bám theo Chương trình Giáo dục phổ thông 2018. Mỗi bài có phương trình/công thức, lời giải thích, gợi ý quan sát và liên hệ bài thi.'),
      el('h3', {}, 'Cách dùng'),
      el('ul', {}, el('li', {}, 'Chọn môn → chương → bài. Dùng thanh trượt bên phải để đổi điều kiện (nhiệt độ, nồng độ, dòng điện...).'), el('li', {}, 'Nút "Làm lại" đưa thí nghiệm về trạng thái đầu; chọn tốc độ ×0.25 để xem chậm.'), el('li', {}, 'Mục "Hãy thử & quan sát" gợi ý các thao tác đáng làm.')),
      el('h3', {}, 'Tác giả'),
      el('p', {}, 'Trần Quốc Thành · ', el('a', { href: 'https://github.com/thanhtq2701-alt', target: '_blank', rel: 'noopener' }, 'GitHub')),
      el('p', { class: 'muted' }, 'Mã nguồn: JavaScript thuần + Canvas, phục vụ bởi Express. Không cần cài thêm gì ngoài Node.js.')
    )
  );
}

boot().catch((e) => {
  console.error(e);
  app.replaceChildren(el('div', { class: 'error' }, 'Không tải được ứng dụng: ' + e.message));
});
