(function () {
  var root = document.documentElement;
  var stored;
  try { stored = localStorage.getItem('theme'); } catch (e) {}
  var theme = stored || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'space' : 'light');

  var canvas, ctx;
  var animId = null;
  var stars = [];
  var glowStars = [];
  var shootingStars = [];

  root.setAttribute('data-theme', theme);

  function updateButton() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var isSpace = root.getAttribute('data-theme') === 'space';
    btn.textContent = isSpace ? '🪐' : '☀️';
    btn.setAttribute('aria-pressed', isSpace ? 'true' : 'false');
    btn.setAttribute('aria-label', isSpace ? 'Switch to light mode' : 'Switch to space mode');
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function ensureCanvas() {
    if (canvas) return canvas;
    canvas = document.createElement('canvas');
    canvas.id = 'space-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');
    window.addEventListener('resize', resizeCanvas);
    return canvas;
  }

  function seedStars() {
    var w = window.innerWidth, h = window.innerHeight;
    var area = w * h;
    var colors = ['255,255,255', '255,244,214', '202,225,255'];

    stars = [];
    var count = Math.min(220, Math.round(area / 4500));
    for (var i = 0; i < count; i++) {
      stars.push({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.4, 1.6),
        base: rand(0.3, 0.85),
        amp: rand(0.2, 0.55),
        speed: rand(0.3, 1.4),
        phase: rand(0, Math.PI * 2),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    glowStars = [];
    var glowCount = Math.min(9, Math.round(area / 95000));
    for (var j = 0; j < glowCount; j++) {
      glowStars.push({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(1.3, 2.2),
        base: rand(0.5, 0.85),
        amp: rand(0.2, 0.4),
        speed: rand(0.2, 0.6),
        phase: rand(0, Math.PI * 2)
      });
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function maybeSpawnShootingStar() {
    if (shootingStars.length < 2 && Math.random() < 0.003) {
      shootingStars.push({
        x: rand(window.innerWidth * 0.1, window.innerWidth * 0.8),
        y: rand(0, window.innerHeight * 0.3),
        vx: rand(4, 7),
        vy: rand(2, 3.5),
        life: 0,
        maxLife: rand(40, 70)
      });
    }
  }

  function draw(time) {
    var w = window.innerWidth, h = window.innerHeight;
    var t = time / 1000;

    var grad = ctx.createRadialGradient(w * 0.5, h * 0.15, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.85);
    grad.addColorStop(0, '#141433');
    grad.addColorStop(0.5, '#0a0a20');
    grad.addColorStop(1, '#020208');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    stars.forEach(function (s) {
      var alpha = s.base + s.amp * Math.sin(t * s.speed + s.phase);
      alpha = Math.max(0.05, Math.min(1, alpha));
      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + s.color + ',' + alpha + ')';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    glowStars.forEach(function (s) {
      var alpha = s.base + s.amp * Math.sin(t * s.speed + s.phase);
      alpha = Math.max(0.2, Math.min(1, alpha));
      var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 10);
      g.addColorStop(0, 'rgba(255,255,255,' + alpha + ')');
      g.addColorStop(0.2, 'rgba(210,225,255,' + (alpha * 0.5) + ')');
      g.addColorStop(1, 'rgba(210,225,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    maybeSpawnShootingStar();
    shootingStars = shootingStars.filter(function (s) { return s.life < s.maxLife; });
    shootingStars.forEach(function (s) {
      var progress = s.life / s.maxLife;
      var alpha = Math.sin(progress * Math.PI);
      var tailX = s.x - s.vx * 8;
      var tailY = s.y - s.vy * 8;
      var lineGrad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      lineGrad.addColorStop(0, 'rgba(255,255,255,' + alpha + ')');
      lineGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      s.x += s.vx;
      s.y += s.vy;
      s.life++;
    });

    animId = requestAnimationFrame(draw);
  }

  function startSpace() {
    ensureCanvas();
    canvas.style.display = 'block';
    resizeCanvas();
    if (!animId) animId = requestAnimationFrame(draw);
  }

  function stopSpace() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    if (canvas) canvas.style.display = 'none';
    shootingStars = [];
  }

  function setTheme(t) {
    theme = t;
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    updateButton();
    if (t === 'space') startSpace(); else stopSpace();
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateButton();
    if (root.getAttribute('data-theme') === 'space') startSpace();

    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var current = root.getAttribute('data-theme');
        setTheme(current === 'space' ? 'light' : 'space');
      });
    }
  });
})();
