// app.js — тема и маршрутизация. Каждый раздел — модуль sections/*.js с mount(root) → функция очистки.
import { subscribe, resetState, getPalette, getFont, readableOn } from './state.js';
import './petals.js';

const ROUTES = {
  brief: () => import('./sections/brief.js'),
  color: () => import('./sections/color.js'),
  type: () => import('./sections/typography.js'),
  result: () => import('./sections/result.js'),
};
const view = document.getElementById('view');
const notice = document.getElementById('notice');
let unmount = null, token = 0;

subscribe((s, { message }) => { // тема: CSS-переменные для всего сайта
  const p = getPalette(s), r = document.documentElement.style;
  r.setProperty('--bg', p.bg); r.setProperty('--text', p.text); r.setProperty('--accent', p.accent);
  r.setProperty('--on-accent', readableOn(p.accent, p));
  r.setProperty('--font-head', getFont(s).stack);
  notice.hidden = !message; notice.textContent = message;
});

async function route() {
  const key = ROUTES[location.hash.slice(1)] ? location.hash.slice(1) : 'brief';
  const me = ++token;
  document.querySelectorAll('nav a').forEach(a =>
    a.getAttribute('href') === '#' + key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  try {
    const mod = await ROUTES[key]();
    if (me !== token) return;
    if (unmount) unmount();
    view.replaceChildren();
    unmount = mod.mount(view) || null;
    view.querySelector('h1')?.focus();
  } catch (e) {
    view.textContent = 'Не удалось открыть раздел. Проверьте, что сайт запущен через Live Server.';
    console.error(e);
  }
}
document.getElementById('reset').addEventListener('click', resetState);
addEventListener('hashchange', route);
route();
