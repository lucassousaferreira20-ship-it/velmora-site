(function () {
  'use strict';
  var cfg = window.VELMORA || {};
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- endereços vindos do config.js ----
  document.querySelectorAll('[data-link]').forEach(function (el) {
    var url = cfg[el.getAttribute('data-link')];
    if (url) {
      el.setAttribute('href', url);
      if (/^https?:/.test(url) && el.getAttribute('data-link') !== 'download') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
    } else {
      el.removeAttribute('href');
      el.removeAttribute('download');
      el.setAttribute('aria-disabled', 'true');
      var tag = document.createElement('span');
      tag.className = 'em-breve';
      tag.textContent = 'em breve';
      el.appendChild(tag);
    }
  });
  if (cfg.canalLauncher) document.querySelectorAll('[data-canal]').forEach(function (el) { el.textContent = cfg.canalLauncher; });

  // ---- barra de cima: fundo só depois de rolar ----
  var topo = document.getElementById('topo-nav');
  function aoRolar() {
    var y = window.scrollY || 0;
    topo.classList.toggle('rolou', y > 24);
    if (!reduz) {
      var h = window.innerHeight || 800;
      var t = Math.min(1, y / h);
      document.getElementById('quadro').style.setProperty('--zoom', (1 + t * 0.22).toFixed(4)); // a cidade se aproxima
    }
  }
  var preso = false;
  window.addEventListener('scroll', function () {
    if (preso) return; preso = true;
    requestAnimationFrame(function () { aoRolar(); preso = false; });
  }, { passive: true });
  aoRolar();

  // ---- menu no celular ----
  var btn = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
  btn.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('aberto'); btn.setAttribute('aria-expanded', 'false'); }
  });

  // ---- o sino ----
  var ctx = null;
  function badalada() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = ctx || new AC();
      if (ctx.state === 'suspended') ctx.resume();
      var t0 = ctx.currentTime + 0.02, base = 164.8; // mi grave
      var parciais = [[1, 0.55, 7], [2.0, 0.3, 5.5], [2.76, 0.22, 4], [5.4, 0.12, 2.5], [8.93, 0.06, 1.4]];
      var saida = ctx.createGain(); saida.gain.value = 0.55; saida.connect(ctx.destination);
      parciais.forEach(function (p) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = base * p[0];
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(p[1], t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + p[2]);
        o.connect(g); g.connect(saida); o.start(t0); o.stop(t0 + p[2] + 0.1);
      });
    } catch (e) { /* sem áudio: o sino só balança */ }
  }
  var sino = document.getElementById('sino-mini'), ondas = document.getElementById('ondas');
  function tocar() {
    sino.classList.remove('toca'); void sino.getBoundingClientRect(); sino.classList.add('toca');
    if (!reduz) {
      for (var i = 0; i < 3; i++) (function (i) {
        setTimeout(function () {
          var o = document.createElement('div'); o.className = 'onda'; ondas.appendChild(o);
          setTimeout(function () { o.remove(); }, 4400);
        }, i * 650);
      })(i);
    }
    badalada();
  }
  document.getElementById('torre').addEventListener('click', tocar);
  document.getElementById('toque').addEventListener('click', tocar);
  if (!reduz) setTimeout(function () { sino.classList.add('toca'); }, 3600); // uma badalada muda quando a névoa abre
})();
