// sections/result.js — раздел «Итог» (Ксюша). Собирает бриф, цвета, шрифт и два макета.
// Печать — window.print(). Контракт: mount(root) → функция очистки (unsubscribe).
import { subscribe, setState, getPalette, getFont, LAYOUTS } from '../state.js';

export function mount(root) {
  if (!document.querySelector('link[data-result]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = new URL('./result.css', import.meta.url);
    l.dataset.result = '';
    document.head.append(l);
  }

  root.innerHTML = `
    <div class="result">
      <div class="lead">
        <h1 tabindex="-1">Итог</h1>
        <p>Здесь собрано всё вместе: бриф, цвета, шрифт и два макета — постер и карточка соцсетей.
           Выберите композицию, проверьте результат и распечатайте брендбук через диалог браузера.</p>
      </div>

      <div class="result__controls" aria-label="Управление итоговым брендбуком">
        <fieldset class="field">
          <legend>Композиция макетов</legend>
          <div class="layout-choice" role="radiogroup" aria-label="Выбор композиции">
            ${LAYOUTS.map(l => `
              <button type="button" class="layout-btn" role="radio" aria-checked="false" data-layout="${l.id}">
                <span class="layout-btn__name">${l.name}</span>
                <span class="layout-btn__check" aria-hidden="true">✓</span>
              </button>
            `).join('')}
          </div>
          <p class="hint small">Влияет на оба макета — постер и карточку соцсетей.</p>
        </fieldset>

        <div class="print-row">
          <button type="button" class="btn" id="print-btn">Печать / PDF</button>
          <span class="small">Откроется диалог браузера. Выберите «Сохранить как PDF». Данные никуда не отправляются.</span>
        </div>
      </div>

      <section class="brandbook" aria-label="Итоговый брендбук">
        <div class="bb-block">
          <h3>Бриф</h3>
          <dl class="bb-info">
            <dt>Название</dt><dd data-info="name"></dd>
            <dt>Слоган</dt><dd data-info="slogan"></dd>
            <dt>Аудитория</dt><dd data-info="audience"></dd>
            <dt>Цель</dt><dd data-info="goal"></dd>
            <dt>Характер</dt><dd data-info="character"></dd>
          </dl>
        </div>

        <div class="bb-block">
          <h3>Цвета <span class="bb-meta" data-info="palette-name"></span></h3>
          <div class="bb-palette" id="bb-palette"></div>
        </div>

        <div class="bb-block">
          <h3>Типографика</h3>
          <dl class="bb-info">
            <dt>Шрифт</dt><dd data-info="font-name"></dd>
            <dt>Размер образца</dt><dd data-info="font-size"></dd>
            <dt>Насыщенность</dt><dd data-info="font-weight"></dd>
            <dt>Текст образца</dt><dd data-info="preview-text"></dd>
          </dl>
        </div>

        <div class="bb-block">
          <h3>Макеты <span class="bb-meta" data-info="layout-name"></span></h3>
          <div class="bb-previews">
            <div class="bb-preview">
              <p class="bb-preview__caption small">Постер</p>
              <div class="preview preview--poster" id="poster-preview" role="img" aria-label="Постер бренда"></div>
            </div>
            <div class="bb-preview">
              <p class="bb-preview__caption small">Карточка соцсетей</p>
              <div class="preview preview--card" id="card-preview" role="img" aria-label="Карточка для соцсетей"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  const layoutBtns = [...root.querySelectorAll('[data-layout]')];
  const posterEl = root.querySelector('#poster-preview');
  const cardEl = root.querySelector('#card-preview');

  const escapeHtml = str => String(str).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  function renderPreview(el, s) {
    el.dataset.variant = s.layoutId;
    el.style.setProperty('--pv-size', s.fontSize + 'px');
    el.style.setProperty('--pv-weight', String(s.fontWeight));

    const name = (s.name || '').trim() || 'Название бренда';
    const slogan = (s.slogan || '').trim() || 'Слоган бренда';

    el.innerHTML = `
      <div class="pv__accent" aria-hidden="true"></div>
      <div class="pv__name">${escapeHtml(name)}</div>
      <div class="pv__slogan">${escapeHtml(slogan)}</div>
    `;
  }

  // --- Клик и клавиатура для выбора композиции ---
  layoutBtns.forEach(btn => {
    btn.addEventListener('click', () => setState({ layoutId: btn.dataset.layout }));
  });

  root.querySelector('.layout-choice').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const idx = layoutBtns.findIndex(b => b.getAttribute('aria-checked') === 'true');
    const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
    const next = (idx + dir + layoutBtns.length) % layoutBtns.length;
    e.preventDefault();
    layoutBtns[next].focus();
    setState({ layoutId: layoutBtns[next].dataset.layout });
  });

  // --- Печать / PDF ---
  root.querySelector('#print-btn').addEventListener('click', () => window.print());

  // --- Подписка: обновляет бриф, палитру, шрифт и оба макета ---
  const off = subscribe(s => {
    const p = getPalette(s);
    const f = getFont(s);

    const setInfo = (k, v) => {
      const el = root.querySelector(`[data-info="${k}"]`);
      if (el) el.textContent = v;
    };
    setInfo('name', s.name.trim() || '—');
    setInfo('slogan', s.slogan.trim() || '—');
    setInfo('audience', s.audience.trim() || '—');
    setInfo('goal', s.goal.trim() || '—');
    setInfo('character', s.character.trim() || '—');
    setInfo('palette-name', `«${p.name}»`);
    setInfo('font-name', f.name);
    setInfo('font-size', `${s.fontSize} px`);
    setInfo('font-weight', String(s.fontWeight));
    setInfo('preview-text', s.previewText.trim() || '—');
    const layoutName = (LAYOUTS.find(l => l.id === s.layoutId) || LAYOUTS[0]).name;
    setInfo('layout-name', `«${layoutName}»`);

    // Свотчи палитры
    root.querySelector('#bb-palette').innerHTML = `
      <div class="bb-swatch" style="background:${p.bg}; color:${p.text}">
        <span class="bb-swatch__label">Фон</span>
        <span class="bb-swatch__code">${p.bg}</span>
      </div>
      <div class="bb-swatch" style="background:${p.text}; color:${p.bg}">
        <span class="bb-swatch__label">Текст</span>
        <span class="bb-swatch__code">${p.text}</span>
      </div>
      <div class="bb-swatch" style="background:${p.accent}; color:${p.text}">
        <span class="bb-swatch__label">Акцент</span>
        <span class="bb-swatch__code">${p.accent}</span>
      </div>
    `;

    // Кнопки композиции
    layoutBtns.forEach(b => {
      const on = b.dataset.layout === s.layoutId;
      b.setAttribute('aria-checked', String(on));
      b.classList.toggle('is-active', on);
    });

    // Макеты
    renderPreview(posterEl, s);
    renderPreview(cardEl, s);
  });

  return off;
}