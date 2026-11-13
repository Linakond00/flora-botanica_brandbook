// sections/color.js — раздел «Цвет» (Лиза).
// Контракт: mount(root) → функция очистки (unsubscribe). Общий state только через state.js.
import { subscribe, setState, getPalette, PALETTES } from '../state.js';

export function mount(root) {
  // Подключаем стили раздела один раз
  if (!document.querySelector('link[data-color]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = new URL('./color.css', import.meta.url);
    l.dataset.color = '';
    document.head.append(l);
  }

  root.innerHTML = `
    <div class="color">
      <div class="lead">
        <h1 tabindex="-1">Цвет</h1>
        <p>Выберите палитру — фон, текст и кнопка сразу примерят её на себя. Каждая палитра подписана, чтобы выбор был понятен не только по цвету.</p>
      </div>

      <div class="color__grid" role="radiogroup" aria-label="Палитры бренда">
        ${PALETTES.map(p => `
          <button
            type="button"
            class="palette"
            role="radio"
            aria-checked="false"
            data-palette="${p.id}"
          >
            <span class="palette__swatches" aria-hidden="true">
              <span class="swatch" style="background:${p.bg}"></span>
              <span class="swatch" style="background:${p.text}"></span>
              <span class="swatch" style="background:${p.accent}"></span>
            </span>
            <span class="palette__name">${p.name}</span>
            <span class="palette__codes small">${p.bg} · ${p.text} · ${p.accent}</span>
            <span class="palette__check" aria-hidden="true">✓</span>
          </button>
        `).join('')}
      </div>

      <section class="sample" aria-label="Живой образец палитры">
        <h2>Образец</h2>
        <p class="sample__text">
          Так выглядит основной текст на фоне палитры. Кнопка ниже использует акцентный цвет,
          а цвет текста на ней подобран автоматически по контрасту.
        </p>
        <div class="sample__row">
          <button class="btn" type="button">Кнопка в цвете палитры</button>
          <span class="sample__accent" aria-hidden="true"></span>
        </div>
      </section>

      <div class="next">
        <a class="btn" href="#type">Дальше: типографика</a>
        <span class="small" id="color-current" role="status"></span>
      </div>
    </div>
  `;

  const buttons = [...root.querySelectorAll('[data-palette]')];
  const current = root.querySelector('#color-current');

  // Клик по палитре → setState → app.js перекрасит весь сайт
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      setState({ paletteId: btn.dataset.palette });
    });
  });

  // Клавиатура для radiogroup: стрелки ←/→ переключают палитру
  root.querySelector('.color__grid').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const idx = buttons.findIndex(b => b.getAttribute('aria-checked') === 'true');
    const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
    const next = (idx + dir + buttons.length) % buttons.length;
    e.preventDefault();
    buttons[next].focus();
    setState({ paletteId: buttons[next].dataset.palette });
  });

  // Подписка: подсветить выбранную + текст-статус. Возвращаем unsubscribe.
  return subscribe(s => {
    const active = s.paletteId;
    buttons.forEach(b => {
      const on = b.dataset.palette === active;
      b.setAttribute('aria-checked', String(on));
      b.classList.toggle('is-active', on);
    });
    current.textContent = `Выбрана палитра «${getPalette(s).name}».`;
  });
}