/* «Подворье. Журнал» — апгрейд блога до издания: рубрики, обложка выпуска,
   главный материал крупно, сетка 4:5. Состояние: < 6 материалов → лента (§4.5 структуры). */
import './wave1.css';
import { blogPosts, articleMeta, rubrics, CAT } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
let rubric = 'all';

const meta = p => articleMeta[p.slug] || { rubric: p.cat || 'Продукт', accent: 'bread' };
const COVER = { 'kak-vybrat-klubniku': '🍓', 'sekrety-sozrevaniya-syra': '🧀',
                'semja-plotnikovyh': '🐄', 'retsept-syrnika': '🥞' };

function card(p, lead = false) {
  const m = meta(p);
  return `<a class="jr-card cat-${m.accent}" href="/article.html?slug=${p.slug}">
    <div class="jr-cover">${COVER[p.slug] || '🌾'}</div>
    <div class="jr-meta">${m.rubric}<span>${p.read}</span></div>
    <h3>${p.title}</h3>
    <p>${p.excerpt}</p>
  </a>`;
}

function render() {
  const list = rubric === 'all' ? blogPosts : blogPosts.filter(p => meta(p).rubric === rubric);

  // Главный материал крупно — только в общей выдаче
  const lead = rubric === 'all' ? list[0] : null;
  const rest = lead ? list.slice(1) : list;

  $('#jrLead').hidden = !lead;
  if (lead) {
    const m = meta(lead);
    $('#jrLead').className = `jr-lead cat-${m.accent}`;
    $('#jrLead').innerHTML = `
      <a class="jr-cover" href="/article.html?slug=${lead.slug}">${COVER[lead.slug] || '🌾'}</a>
      <div>
        <div class="jr-meta">${m.rubric}<span>${lead.date}</span><span>${lead.read}</span></div>
        <h2 class="sect-t" style="margin:10px 0 14px">${lead.title}</h2>
        <p class="lead" style="color:var(--muted)">${lead.excerpt}</p>
        <a class="btn btn-ghost" href="/article.html?slug=${lead.slug}" style="margin-top:20px">Читать материал</a>
      </div>`;
  }

  // Меньше 6 материалов — не строим сетку издания, показываем ленту
  const grid = $('#jrGrid');
  grid.className = blogPosts.length < 6 ? 'jr-grid' : 'jr-grid';
  grid.innerHTML = rest.length
    ? rest.map(p => card(p)).join('')
    : `<p style="color:var(--muted)">В рубрике «${rubric}» пока нет материалов.
       <a href="#" data-all style="color:var(--brown);font-weight:700">Показать все</a></p>`;
  grid.querySelector('[data-all]')?.addEventListener('click', e => { e.preventDefault(); rubric = 'all'; render(); });

  $('#jrRubrics').querySelectorAll('button').forEach(b =>
    b.classList.toggle('on', b.dataset.rub === rubric));
}

$('#jrRubrics').innerHTML = [['all', 'Все материалы'], ...rubrics.map(r => [r, r])]
  .map(([k, label]) => `<button data-rub="${k}">${label}</button>`).join('');
$('#jrRubrics').querySelectorAll('button').forEach(b =>
  b.onclick = () => { rubric = b.dataset.rub; render(); });

$('#jrIssue').textContent = `Выпуск №1 · ${blogPosts.length} материалов`;
render();
