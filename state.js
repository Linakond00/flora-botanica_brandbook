// state.js — общий state и справочники. Разделы импортируют отсюда и больше ни откуда не берут данные.
import { loadDraft, saveDraft, clearDraft } from './storage.js';

export const PALETTES = [
  { id: 'dew', name: 'Утренняя роса', bg: '#FDF6F3', text: '#3D3436', accent: '#E86B7A' },
  { id: 'olive', name: 'Оливковое молоко', bg: '#F7F5EE', text: '#3A3D32', accent: '#7A8B5C' },
  { id: 'apricot', name: 'Закатный абрикос', bg: '#FFF8F0', text: '#3B332C', accent: '#E8944A' },
];
export const FONTS = [
  { id: 'coca', name: 'Coca-Cola Rus-Lat', stack: "'Coca-Cola Rus-Lat', 'Montserrat', sans-serif" },
  { id: 'montserrat', name: 'Montserrat', stack: "'Montserrat', sans-serif" },
];
export const LAYOUTS = [ // для Ксюши: названия можно поменять, id держим
  { id: 'airy', name: 'Воздушная' },
  { id: 'bold', name: 'Крупная' },
];

export const DEMO_STATE = Object.freeze({
  name: 'Flora & Botanica',
  slogan: 'Собери свой момент.',
  audience: 'Девушки и парни 20–30 лет, которые ценят эмоции и эстетику',
  goal: 'Помочь собрать букет, который передаёт настроение момента',
  character: 'Мягкий, лёгкий, зумерская нежность',
  paletteId: 'dew', fontId: 'coca', fontSize: 48, fontWeight: 600,
  layoutId: 'airy', previewText: 'Как будто только что развернул цветы',
});

const exists = (list, id) => list.some(i => i.id === id);
function clean(raw) { // берём только известные поля, чужое и битое отбрасываем
  const s = { ...DEMO_STATE };
  if (!raw) return s;
  for (const k of ['name', 'slogan', 'audience', 'goal', 'character', 'previewText'])
    if (typeof raw[k] === 'string') s[k] = raw[k];
  if (exists(PALETTES, raw.paletteId)) s.paletteId = raw.paletteId;
  if (exists(FONTS, raw.fontId)) s.fontId = raw.fontId;
  if (exists(LAYOUTS, raw.layoutId)) s.layoutId = raw.layoutId;
  if (Number.isFinite(raw.fontSize)) s.fontSize = Math.min(96, Math.max(12, raw.fontSize));
  if ([400, 500, 600, 700].includes(raw.fontWeight)) s.fontWeight = raw.fontWeight;
  return s;
}

const loaded = loadDraft();
let state = clean(loaded.data);
let message = loaded.message;
const listeners = new Set();
const notify = () => listeners.forEach(fn => fn(getState(), { message }));

export const getState = () => ({ ...state });
export const getPalette = (s = state) => PALETTES.find(p => p.id === s.paletteId) || PALETTES[0];
export const getFont = (s = state) => FONTS.find(f => f.id === s.fontId) || FONTS[0];

/** Единственный способ менять данные: setState({ slogan: '...' }). Сохраняет и оповещает всех. */
export function setState(patch) {
  state = clean({ ...state, ...patch });
  message = saveDraft(state).message;
  notify();
}
export function resetState() {
  state = { ...DEMO_STATE };
  message = clearDraft().message;
  notify();
}
/** subscribe(fn): fn(state, {message}) вызывается сразу и после каждого изменения. Возвращает функцию отписки. */
export function subscribe(fn) {
  listeners.add(fn);
  fn(getState(), { message });
  return () => listeners.delete(fn);
}

function lum(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
/** Цвет текста для кнопки с акцентной заливкой: тёмный текст палитры или её фон — что контрастнее. */
export const readableOn = (accent, p) => contrast(accent, p.text) >= contrast(accent, p.bg) ? p.text : p.bg;
