// sections/color.js — заготовка. Лиза: замените содержимое mount(), контракт (mount(root) → функция очистки) оставьте.
import { subscribe, setState, getPalette, getFont } from '../state.js';

export function mount(root) {
  root.innerHTML = `<h1 tabindex="-1">Цвет</h1><p>Здесь будет выбор палитры из PALETTES (setState({ paletteId })) и образцы фона, текста и кнопки.</p>
    <div class="panel"><p id="out"></p><button class="btn" type="button">Кнопка в цвете палитры</button></div>`;
  const out = root.querySelector('#out');
  // Подписка: вызывается сразу и при любом изменении state. Для записи: setState({ paletteId: 'olive' }).
  return subscribe(s => { out.textContent = `${s.name}: палитра «${getPalette(s).name}», шрифт ${getFont(s).name}, макет ${s.layoutId}`; });
}
