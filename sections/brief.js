// sections/brief.js — бриф и первый экран (Геля). Читает/пишет общий state только через state.js.
import { subscribe, setState } from '../state.js';

const FIELDS = [
  { key: 'name', label: 'Название бренда', hint: 'Введите название — оно появится на макетах.', tag: 'input' },
  { key: 'slogan', label: 'Слоган', hint: 'Добавьте слоган, например «Собери свой момент.».', tag: 'input' },
  { key: 'audience', label: 'Аудитория', hint: 'Опишите, для кого бренд.', tag: 'textarea' },
  { key: 'goal', label: 'Цель бренда', hint: 'Напишите, какую задачу решает бренд.', tag: 'textarea' },
  { key: 'character', label: 'Характер бренда', hint: 'Назовите 2–3 слова о характере.', tag: 'textarea' },
];

export function mount(root) {
  if (!document.querySelector('link[data-brief]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = new URL('./brief.css', import.meta.url); l.dataset.brief = '';
    document.head.append(l);
  }
  root.innerHTML = `
    <div class="brief">
      <div class="lead"><h1 tabindex="-1">Бриф</h1>
        <p>Расскажите о бренде: справа сразу видно, как это выглядит. Все поля обязательные.</p></div>
      <form novalidate aria-label="Бриф бренда"></form>
      <section class="card" aria-label="Живой пример">
        <h2 data-out="name"></h2><p class="slogan" data-out="slogan"></p>
        <button class="btn" type="button" tabindex="-1" aria-hidden="true">Собрать букет</button>
        <dl><dt>Аудитория</dt><dd data-out="audience"></dd><dt>Цель</dt><dd data-out="goal"></dd><dt>Характер</dt><dd data-out="character"></dd></dl>
      </section>
      <div class="next"><a class="btn" href="#color" id="go">Дальше: выбрать цвет</a>
        <span class="small" id="go-msg" role="status"></span></div>
    </div>`;

  const form = root.querySelector('form'), touched = new Set(), els = {}, hints = {};
  for (const f of FIELDS) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<label for="f-${f.key}">${f.label}</label><${f.tag} id="f-${f.key}" ${f.tag === 'textarea' ? 'rows="2"' : ''} aria-describedby="h-${f.key}" required></${f.tag}><p class="hint" id="h-${f.key}"></p>`;
    form.append(wrap);
    els[f.key] = wrap.querySelector(f.tag); hints[f.key] = wrap.querySelector('.hint');
    els[f.key].addEventListener('input', () => { touched.add(f.key); setState({ [f.key]: els[f.key].value }); });
    els[f.key].addEventListener('blur', () => { touched.add(f.key); check(); });
  }

  function check(showAll = false) { // подсказки для пустых обязательных полей
    let firstBad = null;
    for (const f of FIELDS) {
      const bad = !els[f.key].value.trim();
      const show = bad && (showAll || touched.has(f.key));
      els[f.key].setAttribute('aria-invalid', String(show));
      hints[f.key].textContent = show ? f.hint : '';
      if (bad && !firstBad) firstBad = f.key;
    }
    return firstBad;
  }

  const off = subscribe(s => {
    for (const f of FIELDS) {
      if (els[f.key].value !== s[f.key] && document.activeElement !== els[f.key]) els[f.key].value = s[f.key]; // сброс/внешнее изменение
      root.querySelector(`[data-out="${f.key}"]`).textContent = s[f.key].trim() || '—';
    }
    check();
  });

  root.querySelector('#go').addEventListener('click', e => {
    const bad = check(true);
    root.querySelector('#go-msg').textContent = bad ? 'Заполните пустые поля, чтобы перейти дальше.' : '';
    if (bad) { e.preventDefault(); els[bad].focus(); }
  });
  return off;
}
