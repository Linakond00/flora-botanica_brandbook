// petals.js — мягкие лепестки сакуры на фоне. Только декор: state не читает и не меняет.
// Подключается одной строкой в app.js: import './petals.js';
const COLORS = ['#F7C6D0', '#F4B0C0', '#FBDDE3'];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (!reduceMotion.matches) start();

function start() {
  const style = document.createElement('style');
  style.textContent = '#petals{position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}@media print{#petals{display:none}}';
  document.head.append(style);

  const canvas = document.createElement('canvas');
  canvas.id = 'petals';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w = 0, h = 0, petals = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  function makePetal(anywhere) {
    return {
      x: rand(0, w), y: anywhere ? rand(0, h) : rand(-60, -10),
      s: rand(7, 13),                       // размер
      vy: rand(25, 55),                     // скорость падения, px/сек
      sway: rand(0.6, 1.4), amp: rand(10, 28), phase: rand(0, 6.28),
      rot: rand(0, 6.28), vr: rand(-1, 1),  // вращение
      flip: rand(0, 6.28), vf: rand(1.2, 2.6), // «кувыркание»
      a: rand(0.45, 0.8), c: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(12, Math.min(28, Math.round(w / 70)));
    while (petals.length < count) petals.push(makePetal(true));
    petals.length = count;
  }

  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(Math.cos(p.flip) * 0.8 + 0.2 * Math.sign(Math.cos(p.flip) || 1), 1);
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.c;
    const s = p.s;
    ctx.beginPath();            // лепесток с характерной выемкой на кончике
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.9, -s * 0.7, s * 0.8, s * 0.5, s * 0.14, s);
    ctx.lineTo(0, s * 0.78);
    ctx.lineTo(-s * 0.14, s);
    ctx.bezierCurveTo(-s * 0.8, s * 0.5, -s * 0.9, -s * 0.7, 0, -s);
    ctx.fill();
    ctx.restore();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); // после паузы вкладки не прыгаем
    last = now;
    ctx.clearRect(0, 0, w, h);
    for (const p of petals) {
      p.y += p.vy * dt;
      p.x += (Math.sin(now / 1000 * p.sway + p.phase) * p.amp + 14) * dt; // лёгкий ветер вправо
      p.rot += p.vr * dt;
      p.flip += p.vf * dt;
      if (p.y > h + 20 || p.x > w + 40) Object.assign(p, makePetal(false));
      draw(p);
    }
    requestAnimationFrame(frame);
  }

  addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
}