// sections/typography.js — раздел «Типографика» (Лиза).
// Контракт: mount(root) → функция очистки (unsubscribe).
import { subscribe, setState, getFont, FONTS } from '../state.js';

export function mount(root) {
  if (!document.querySelector('link[data-type]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = new URL('./typography.css', import.meta.url);
    l.dataset.type = '';
    document.head.append(l);
  }

  root.innerHTML = `
    <div class="type">
      <div class="lead">
        <h1 tabindex="-1">Типографика</h1>
        <p>Напишите свой текст, выберите шрифт и настройте размер или насыщенность —
           образец обновится сразу. Эти же настройки попадут на постер и карточку в разделе «Итог».</p>
      </div>

      <form class="type__controls" aria-label="Настройки типографики" novalidate>
        <div class="field">
          <label for="preview-text">Текст для образца</label>
          <input
            id="preview-text"
            type="text"
            maxlength="120"
            placeholder="Например: Как будто только что развернул цветы"
            autocomplete="off"
          >
          <p class="hint small" id="preview-text-hint">
            До 120 символов. Виден в образце и на макетах.
          </p>
        </div>

        <fieldset class="field font-choice">
          <legend>Шрифт (кириллица)</legend>
          <div class="font-grid" role="radiogroup" aria-label="Выбор шрифта">
            ${FONTS.map(f => `
              <button
                type="button"
                class="font-btn"
                role="radio"
                aria-checked="false"
                data-font="${f.id}"
                style="font-family:${f.stack}"
              >
                <span class="font-btn__name">${f.name}</span>
                <span class="font-btn__sample" aria-hidden="true">Съешь ещё этих мягких булок</span>
                <span class="font-btn__check" aria-hidden="true">✓</span>
              </button>
            `).join('')}
          </div>
        </fieldset>

        <div class="field">
          <label for="font-size">Размер шрифта образца</label>
          <div class="range-row">
            <input
              id="font-size"
              type="range"
              min="16"
              max="96"
              step="2"
              aria-describedby="font-size-hint"
            >
            <output id="font-size-out" for="font-size" class="small">48 px</output>
          </div>
          <p class="hint small" id="font-size-hint">16–96 px. Влияет на заголовок образца и на макеты.</p>
        </div>

        <div class="field">
          <label for="font-weight">Насыщенность</label>
          <select id="font-weight">
            <option value="400">Обычная (400)</option>
            <option value="500">Средняя (500)</option>
            <option value="600">Полужирная (600)</option>
            <option value="700">Жирная (700)</option>
          </select>
        </div>
      </form>

      <section class="sample" aria-label="Живой образец типографики">
        <p class="sample__caption small">Образец</p>
        <p class="sample__preview" id="sample-preview"></p>
        <p class="sample__meta small" id="sample-meta"></p>
      </section>

      <div class="next">
        <a class="btn" href="#result">Дальше: макеты и итог</a>
      </div>
    </div>
  `;

  const input  = root.querySelector('#preview-text');
  const range  = root.querySelector('#font-size');
  const rangeOut = root.querySelector('#font-size-out');
  const weight = root.querySelector('#font-weight');
  const sample = root.querySelector('#sample-preview');
  const meta   = root.querySelector('#sample-meta');
  const fontBtns = [...root.querySelectorAll('[data-font]')];

  // --- 1. Текст образца ---
  input.addEventListener('input', () => setState({ previewText: input.value }));

  // --- 2. Шрифт ---
  fontBtns.forEach(btn => btn.addEventListener('click', () => {
    setState({ fontId: btn.dataset.font });
  }));

  // Клавиатура внутри радиогруппы шрифтов: ←/→
  root.querySelector('.font-grid').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const idx = fontBtns.findIndex(b => b.getAttribute('aria-checked') === 'true');
    const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
    const next = (idx + dir + fontBtns.length) % fontBtns.length;
    e.preventDefault();
    fontBtns[next].focus();
    setState({ fontId: fontBtns[next].dataset.font });
  });

  // --- 3. Размер ---
  range.addEventListener('input', () => {
    const v = Number(range.value);
    rangeOut.textContent = v + ' px';
    setState({ fontSize: v });
  });

  // --- 4. Насыщенность ---
  weight.addEventListener('change', () => {
    setState({ fontWeight: Number(weight.value) });
  });

  // --- Синхронизация UI с общим state ---
  return subscribe(s => {
    // поля (не затираем, если пользователь в них печатает)
    if (document.activeElement !== input && input.value !== s.previewText) {
      input.value = s.previewText;
    }
    if (document.activeElement !== range) range.value = String(s.fontSize);
    rangeOut.textContent = s.fontSize + ' px';
    if (document.activeElement !== weight) weight.value = String(s.fontWeight);

    // карточки шрифтов
    fontBtns.forEach(b => {
      const on = b.dataset.font === s.fontId;
      b.setAttribute('aria-checked', String(on));
      b.classList.toggle('is-active', on);
    });

    // образец: использует var(--font-head) + размер и насыщенность из state
    const text = (s.previewText || '').trim() || 'Пример текста для проверки шрифта';
    sample.textContent = text;
    sample.style.fontSize = s.fontSize + 'px';
    sample.style.fontWeight = String(s.fontWeight);

    const f = getFont(s);
    meta.textContent = `${f.name} · ${s.fontSize} px · ${s.fontWeight}`;
  });
}