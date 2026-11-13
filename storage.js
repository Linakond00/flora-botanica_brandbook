// storage.js — единственное место, где трогаем localStorage. Каждая функция возвращает {ok, message}, исключения наружу не летят.
export const STORAGE_KEY = 'brandbook-draft';
const MSG_BROKEN = 'Сохранённый черновик повреждён, поэтому показаны демо-данные. Новые правки заменят его.';
const MSG_OFF = 'Хранилище браузера недоступно. Сайт работает, но изменения пропадут после обновления страницы.';

export function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { ok: true, data: null, message: '' };
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new SyntaxError('shape');
    return { ok: true, data, message: '' };
  } catch (e) {
    return { ok: false, data: null, message: e instanceof SyntaxError ? MSG_BROKEN : MSG_OFF };
  }
}
export function saveDraft(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return { ok: true, message: '' }; }
  catch { return { ok: false, message: MSG_OFF }; }
}
export function clearDraft() {
  try { localStorage.removeItem(STORAGE_KEY); return { ok: true, message: '' }; }
  catch { return { ok: false, message: MSG_OFF }; }
}
