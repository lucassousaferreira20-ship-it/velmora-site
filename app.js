(function () {
  'use strict';
  var cfg = window.VELMORA || {};
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document, body = doc.body;
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento: tudo bem */ } }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sessao(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  // ---- endereços vindos do config.js ----
  doc.querySelectorAll('[data-link]').forEach(function (el) {
    var url = cfg[el.getAttribute('data-link')];
    if (url) {
      el.setAttribute('href', url);
      if (/^https?:/.test(url) && el.getAttribute('data-link') !== 'download') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
    } else {
      el.removeAttribute('href');
      el.removeAttribute('download');
      el.setAttribute('aria-disabled', 'true');
      var tag = doc.createElement('span');
      tag.className = 'em-breve';
      tag.textContent = 'em breve';
      el.appendChild(tag);
    }
  });
  if (cfg.canalLauncher) doc.querySelectorAll('[data-canal]').forEach(function (el) { el.textContent = cfg.canalLauncher; });

  // ---- barra de cima e menu no celular ----
  var topo = doc.getElementById('topo-nav');
  var btn = doc.querySelector('.menu-btn'), menu = doc.getElementById('menu');
  btn.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('aberto'); btn.setAttribute('aria-expanded', 'false'); }
  });

  // ---- rolagem: barra com fundo + faixas com paralaxe suave ----
  var faixas = [].slice.call(doc.querySelectorAll('[data-parallax]'));
  var preso = false;
  function aoRolar() {
    topo.classList.toggle('rolou', (window.scrollY || 0) > 24);
    if (reduz) return;
    var vh = window.innerHeight || 800;
    faixas.forEach(function (f) {
      var r = f.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
      p = Math.max(-1, Math.min(1, p));
      f.style.setProperty('--py', (-p * r.height * 0.11).toFixed(1) + 'px');
    });
  }
  window.addEventListener('scroll', function () {
    if (preso) return; preso = true;
    requestAnimationFrame(function () { aoRolar(); preso = false; });
  }, { passive: true });
  window.addEventListener('resize', aoRolar);
  aoRolar();

  // ---- vídeo da abertura ----
  var video = doc.getElementById('hero-video');
  var heroVisivel = true;
  function tocarVideo() { if (video && !reduz) { var p = video.play(); if (p && p.catch) p.catch(function () { /* fica no quadro parado */ }); } }
  if (video) {
    if (reduz) { video.removeAttribute('autoplay'); video.pause(); } else { tocarVideo(); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        heroVisivel = es[0].isIntersecting;
        if (heroVisivel) tocarVideo(); else video.pause();
      }, { threshold: 0.02 }).observe(doc.getElementById('inicio'));
    }
  }

  // ---- cinzas no ar ----
  (function () {
    var cv = doc.getElementById('cinzas');
    if (!cv || reduz || !cv.getContext) return;
    var c = cv.getContext('2d'), W = 0, H = 0, ps = [], dpr = Math.min(window.devicePixelRatio || 1, 1.5), ativo = true, ultimo = 0;
    function nova(aleatorio) {
      return { x: Math.random() * W, y: aleatorio ? Math.random() * H : -10, r: 0.6 + Math.random() * 1.9, vy: 6 + Math.random() * 16, vx: 4 + Math.random() * 12, f: Math.random() * 6.28, a: 0.12 + Math.random() * 0.5 };
    }
    function medir() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, Math.max(36, W / 18)));
      while (ps.length < n) ps.push(nova(true));
      ps.length = n;
    }
    function quadro(t) {
      requestAnimationFrame(quadro);
      if (!ativo || !heroVisivel) { ultimo = t; return; }
      var dt = Math.min(0.05, (t - ultimo) / 1000 || 0.016); ultimo = t;
      c.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.f += dt * 0.8;
        p.x += (p.vx + Math.sin(p.f) * 10) * dt; p.y += p.vy * dt;
        if (p.y > H + 10 || p.x > W + 10) { ps[i] = nova(false); ps[i].x = Math.random() * W * 0.9; continue; }
        c.beginPath(); c.fillStyle = 'rgba(222,214,196,' + (p.a * (0.6 + 0.4 * Math.sin(p.f * 1.3))).toFixed(3) + ')';
        c.arc(p.x, p.y, p.r, 0, 6.2832); c.fill();
      }
    }
    medir(); window.addEventListener('resize', medir);
    doc.addEventListener('visibilitychange', function () { ativo = !doc.hidden; });
    requestAnimationFrame(quadro);
  })();

  // ---- o sino (som sintetizado, sem arquivo) ----
  var ctx = null;
  function badalada() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = ctx || new AC();
      if (ctx.state === 'suspended') ctx.resume();
      var t0 = ctx.currentTime + 0.02, base = 164.8; // mi grave
      var parciais = [[1, 0.55, 7], [2.0, 0.3, 5.5], [2.76, 0.22, 4], [5.4, 0.12, 2.5], [8.93, 0.06, 1.4]];
      var saida = ctx.createGain(); saida.gain.value = 0.5; saida.connect(ctx.destination);
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
  var sino = doc.getElementById('sino-mini');
  function tocar() {
    sino.classList.remove('toca'); void sino.getBoundingClientRect(); sino.classList.add('toca');
    badalada();
  }
  doc.getElementById('toque').addEventListener('click', tocar);

  // ---- a música tema ----
  var audio = null, vol = parseInt(ler('velmora:vol') || '45', 10); if (isNaN(vol)) vol = 45;
  var somEl = doc.getElementById('som'), somBtn = doc.getElementById('som-btn'), somVol = doc.getElementById('som-vol');
  var quer = false, anim = 0;
  somVol.value = vol;
  function alvo() { return Math.pow(vol / 100, 1.6) * 0.9; }
  function rampa(para, ms, fim) {
    cancelAnimationFrame(anim);
    if (!audio) return;
    var de = audio.volume, t0 = performance.now();
    (function passo(t) {
      var k = Math.min(1, (t - t0) / ms);
      audio.volume = Math.max(0, Math.min(1, de + (para - de) * k));
      if (k < 1) anim = requestAnimationFrame(passo); else if (fim) fim();
    })(t0);
  }
  function atualizarSom() {
    somEl.classList.toggle('tocando', quer);
    somBtn.setAttribute('aria-pressed', quer ? 'true' : 'false');
    somBtn.setAttribute('aria-label', quer ? 'Desligar a música' : 'Ligar a música');
    doc.getElementById('som-rotulo').textContent = quer ? 'Música ligada' : 'Música desligada';
  }
  function ligar() {
    if (!audio) { audio = new Audio('media/velmora-tema.mp3'); audio.loop = true; audio.preload = 'auto'; audio.volume = 0; }
    quer = true; atualizarSom(); guardar('velmora:som', 'on');
    var p = audio.play();
    if (p && p.catch) p.catch(function () { quer = false; atualizarSom(); });
    rampa(alvo(), 3500);
  }
  function desligar() {
    quer = false; atualizarSom(); guardar('velmora:som', 'off');
    rampa(0, 900, function () { if (!quer && audio) audio.pause(); });
  }
  somBtn.addEventListener('click', function () { if (quer) desligar(); else ligar(); });
  somVol.addEventListener('input', function () {
    vol = parseInt(somVol.value, 10) || 0; guardar('velmora:vol', String(vol));
    if (audio && quer) { cancelAnimationFrame(anim); audio.volume = alvo(); }
  });
  doc.addEventListener('visibilitychange', function () {
    if (!audio || !quer) return;
    if (doc.hidden) audio.pause(); else { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
  });
  atualizarSom();

  // ---- o portão: uma entrada só, com ou sem som ----
  var portao = doc.getElementById('portao'), btnSom = doc.getElementById('entrar-som'), btnMudo = doc.getElementById('entrar-mudo');
  function entrou(comSom) {
    sessao('velmora:entrou', '1');
    somEl.hidden = false;
    body.classList.remove('travado'); body.classList.add('entrou');
    portao.classList.add('saindo');
    setTimeout(function () { if (portao.parentNode) portao.parentNode.removeChild(portao); }, 1600);
    tocarVideo();
    if (comSom) { ligar(); setTimeout(tocar, 900); } else { guardar('velmora:som', 'off'); }
    aoRolar();
  }
  if (portao && sessao('velmora:entrou') !== '1') {
    body.classList.add('travado');
    btnSom.addEventListener('click', function () { entrou(true); });
    btnMudo.addEventListener('click', function () { entrou(false); });
    doc.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape' && body.classList.contains('travado')) { doc.removeEventListener('keydown', esc); entrou(false); }
    });
    setTimeout(function () { btnSom.focus({ preventScroll: true }); }, 60);
  } else {
    // já entrou nesta aba: sem portão, e a música só volta se a pessoa ligar de novo
    if (portao && portao.parentNode) portao.parentNode.removeChild(portao);
    somEl.hidden = false; body.classList.add('entrou');
  }

  // ---- galeria ----
  var gal = doc.getElementById('galeria');
  function passoGal(d) { gal.scrollBy({ left: d * Math.max(260, gal.clientWidth * 0.7), behavior: reduz ? 'auto' : 'smooth' }); }
  doc.getElementById('gal-ant').addEventListener('click', function () { passoGal(-1); });
  doc.getElementById('gal-prox').addEventListener('click', function () { passoGal(1); });

  // ---- situação do servidor (só aparece se config.js tiver o endereço) ----
  if (cfg.servidor) {
    var st = doc.getElementById('status'), tx = doc.getElementById('status-txt');
    try {
      fetch('https://api.mcsrvstat.us/3/' + encodeURIComponent(cfg.servidor)).then(function (r) { return r.json(); }).then(function (j) {
        st.hidden = false;
        if (j && j.online) { st.classList.add('on'); tx.textContent = 'Servidor aberto' + (j.players && j.players.max ? ': ' + j.players.online + ' de ' + j.players.max + ' jogadores' : ''); }
        else { st.classList.add('off'); tx.textContent = 'Servidor fechado agora'; }
      }).catch(function () { /* sem rede: a linha continua escondida */ });
    } catch (e) { /* ignora */ }
  }
})();
