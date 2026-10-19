// Abertura C, ajuste 2 (PLX-119, 18/10/2026): a frase pelo endereço e o movimento da animação do topo.
//
// A frase: ?frase=a|b|c (sem nada, a). O HTML mostra a a; aqui só se marca a escolha na seção.
// O título: ?titulo=2 põe data-titulo="2" na seção (o título em duas linhas, uma frase por linha; sem nada, quatro).
//
// A animação: o HTML já traz o quadro parado (o cartão do Sérgio aberto, com a recomendada marcada, e o aviso dele,
// do Gmail), que é o de quem pede menos movimento; com roteiro e movimento, o CSS troca esse aviso pelo da reunião
// até o primeiro quadro, para casar com o instante em que o roteiro começa. Aqui o estado de cada peça é função do tempo (quem olha
// num instante qualquer vê um quadro coerente); o relógio é o requestAnimationFrame e só corre com a aba visível e o
// topo na tela. Quatro vezes, em ordem (Gmail, Google Meet, Outlook, Google Drive), 29,5 s no total:
//   o aviso de cada vez surge no seu lado 2,5 s depois do começo da vez anterior e flutua;
//   0 a 0,6 s    o aviso desce até o logo da fonte, na fileira do meio; o logo acende e o laço bate (0,75 s);
//   0,8 a 1,4 s  a caixa de vidro sai do laço e abre no cartão; as partes entram uma a uma a partir de 1,15 s, quando
//                a caixa está quase do tamanho do cartão; a recomendada se marca (2 s);
//   4 a 5 s      o cursor anda até Aprovar (ou Confirmar) e clica aos 5 s;
//   5,3 a 5,85 s o cartão se recolhe na primeira linha do feito, e embaixo nasce a segunda;
//   7,5 a 8 s    esmaece e vem a vez seguinte.
// A vez do Drive não tem cartão: o laço bate e a caixa abre direto na linha «Guardado no contexto...», que fica até 5 s.
// O roteiro começa aos 3,2 s da vez do Sérgio, o mesmo quadro do HTML (sem salto entre o parado e o primeiro quadro).
(function () {
  var sec = document.querySelector('.hero');
  if (!sec) return;
  var q = new URLSearchParams(location.search).get('frase');
  if (/^[bc]$/.test(q || '')) sec.dataset.frase = q;
  if (new URLSearchParams(location.search).get('titulo') === '2') sec.dataset.titulo = '2';

  var fig = sec.querySelector('.cc');
  if (!fig || !window.requestAnimationFrame) return;
  var menos = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  var DUR = [8000, 8000, 8000, 5500], INI = [], L = 0;
  DUR.forEach(function (d) { INI.push(L); L += d; });
  var INICIO = 3200;

  var lim = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var seg = function (t, a, b) { return lim((t - a) / (b - a)); };
  var sai = function (x) { return 1 - Math.pow(1 - x, 3); };
  var entra = function (x) { return x * x * x; };
  var suave = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var mix = function (a, b, x) { return a + (b - a) * x; };
  var pico = function (t, c, w) { return lim(1 - Math.abs(t - c) / w); };
  var r1 = function (v) { return Math.round(v * 10) / 10; };
  var r3 = function (v) { return Math.round(v * 1000) / 1000; };
  var mixR = function (a, b, x) { return { x: mix(a.x, b.x, x), y: mix(a.y, b.y, x), w: mix(a.w, b.w, x), h: mix(a.h, b.h, x) }; };

  var um = function (s, d) { return (d || fig).querySelector(s); };
  var todos = function (s, d) { return Array.prototype.slice.call((d || fig).querySelectorAll(s)); };
  var caixa = um('.cc-caixa'), no = um('.cc-no'), seta = um('.cc-seta'), toque = um('.cc-toque');
  var vezes = [0, 1, 2, 3].map(function (i) {
    var v = um('.cc-vez[data-i="' + i + '"]'), cartao = um('.cc-cartao', v);
    return {
      aviso: um('.cc-aviso[data-i="' + i + '"]'), fonte: um('.cc-fonte[data-i="' + i + '"]'),
      cartao: cartao, on: cartao && um('.cc-on', cartao), pri: cartao && um('.cc-pri', cartao),
      partes: cartao ? Array.prototype.slice.call(cartao.children) : [],
      l1: um('.cc-l1', v), l2: um('.cc-l2', v)
    };
  });
  // o aviso de cada vez surge 2,5 s depois do começo da anterior (em relação ao começo da sua vez, um número negativo)
  var SURGE = vezes.map(function (v, i) { var a = (i + 3) % 4; return 2500 - DUR[a]; });

  // ===== as medidas (offsetLeft e offsetTop ignoram as transformações) =====
  var M = null;
  var ret = function (el) {
    var x = 0, y = 0, e = el;
    while (e && e !== fig) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
  };
  var centro = function (r) { return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; };
  var medir = function () {
    M = { W: fig.offsetWidth, no: ret(no), v: vezes.map(function (v) {
      var a = ret(v.aviso), f = ret(v.fonte), ca = centro(a), cf = centro(f);
      var m = { desce: { x: cf.x - ca.x, y: cf.y - ca.y }, l1: ret(v.l1) };
      if (v.cartao) { m.cartao = ret(v.cartao); var p = centro(ret(v.pri)); m.alvo = { x: p.x + 10, y: p.y + 8 }; }
      return m;
    }) };
  };

  var por = function (el, tr, op) {
    el.style.transform = tr === null ? '' : tr;
    el.style.opacity = op === null ? '' : String(r3(op));
  };
  // o tempo de uma vez em relação a um instante do laço, entre -6 s e o resto (para o aviso que surge antes da vez)
  var rel = function (t, i) { var u = ((t - INI[i]) % L + L) % L; return u > L - 6000 ? u - L : u; };

  // ===== um quadro, como função do instante t (0 a L) =====
  var quadro = function (t) {
    if (!M) medir();
    var k = 0; while (k < 3 && t >= INI[k + 1]) k++;
    var u = t - INI[k], D = DUR[k], apaga = 1 - seg(u, D - 500, D);

    // os avisos e os logos (cada um no seu tempo; o de uma vez pode surgir durante a anterior)
    vezes.forEach(function (V, i) {
      var v = rel(t, i), m = M.v[i];
      var e = sai(seg(v, SURGE[i], SURGE[i] + 500));
      var bia = Math.sin((v - SURGE[i]) / 2800 * 2 * Math.PI) * 3 * (1 - seg(v, -300, 0));
      var d = suave(seg(v, 0, 600));
      var op = v < SURGE[i] || v > 600 ? 0 : e * (1 - seg(v, 280, 600));
      por(V.aviso, 'translate(' + r1(m.desce.x * d) + 'px, ' + r1((12 * (1 - e) + bia) * (1 - d) + m.desce.y * d) + 'px) scale(' + r3(mix(1, 0.18, d)) + ')', op);
      var a = Math.min(seg(v, 430, 600), 1 - seg(v, 950, 1400));
      V.fonte.style.setProperty('--a', String(r3(a)));
      V.fonte.style.transform = a > 0 ? 'scale(' + r3(1 + 0.08 * a) + ')' : '';
    });

    // o laço bate quando o aviso chega
    no.style.transform = 'scale(' + r3(1 + 0.12 * pico(u, 760, 200)) + ')';

    // as outras vezes ficam escondidas
    vezes.forEach(function (o, i) {
      if (i === k) return;
      if (o.cartao) por(o.cartao, null, 0);
      por(o.l1, null, 0); if (o.l2) por(o.l2, null, 0);
    });

    var V = vezes[k], m = M.v[k], R, raio;
    var g = sai(seg(u, 800, 1400));
    if (V.cartao) {
      // o cartão: as partes entram uma a uma, a recomendada (ou as tarefas) se marca
      por(V.cartao, null, 1 - seg(u, 5150, 5330)); // o texto apaga antes de a caixa se recolher
      V.partes.forEach(function (el, j) {
        var x = sai(seg(u, 1150 + j * 110, 1500 + j * 110)); // a primeira parte entra quando a caixa já fez 93 % do caminho
        por(el, 'translateY(' + r1(8 * (1 - x)) + 'px)', x);
      });
      V.on.style.setProperty('--m', String(r3(sai(seg(u, 2000, 2250)))));
      V.pri.style.transform = 'scale(' + r3(1 - 0.05 * pico(u, 5020, 130)) + ')';

      // a caixa: do laço ao cartão, do cartão à primeira linha
      if (u < 5300) { R = mixR(M.no, m.cartao, g); raio = mix(15, 18, g); }
      else { var c = sai(seg(u, 5300, 5850)); R = mixR(m.cartao, m.l1, c); raio = mix(18, 14, c); }

      // o cursor anda até o botão e clica
      var x0 = Math.min(m.alvo.x + 72, M.W - 22), y0 = m.alvo.y + 56;
      var cm = suave(seg(u, 4100, 4800));
      var sx = mix(x0, m.alvo.x, cm), sy = mix(y0, m.alvo.y, cm);
      por(seta, 'translate(' + r1(sx - 2) + 'px, ' + r1(sy - 1.5) + 'px) scale(' + r3(1 - 0.12 * pico(u, 5020, 110)) + ')', seg(u, 4000, 4200) * (1 - seg(u, 5250, 5450)));
      var tq = seg(u, 5000, 5400);
      por(toque, 'translate(' + r1(m.alvo.x) + 'px, ' + r1(m.alvo.y) + 'px) scale(' + r3(mix(0.4, 1.3, sai(tq))) + ')', tq > 0 && tq < 1 ? 0.9 * (1 - tq) : 0);

      // as linhas do feito
      por(V.l1, null, seg(u, 5650, 5950) * apaga);
      if (V.l2) { var n = sai(seg(u, 5850, 6250)); por(V.l2, 'translateY(' + r1(10 * (1 - n)) + 'px)', n * apaga); }
    } else {
      // sem cartão: a caixa abre do laço direto na linha do feito
      R = mixR(M.no, m.l1, g); raio = 14;
      por(V.l1, null, seg(u, 1150, 1450) * apaga);
      por(seta, null, 0); por(toque, null, 0);
    }
    caixa.style.transform = 'translate(' + r1(R.x) + 'px, ' + r1(R.y) + 'px)';
    caixa.style.width = r1(R.w) + 'px';
    caixa.style.height = r1(R.h) + 'px';
    caixa.style.borderRadius = r1(raio) + 'px';
    caixa.style.opacity = String(r3(seg(u, 800, 920) * apaga));
  };

  // ===== o relógio =====
  var t = INICIO, ultimo = null, raf = 0, visivel = true, vivo = false;
  var tique = function (agora) {
    if (ultimo !== null) t = (t + Math.min(agora - ultimo, 100)) % L;
    ultimo = agora;
    quadro(t);
    raf = requestAnimationFrame(tique);
  };
  var ligar = function () {
    if (raf || !visivel || document.hidden || (menos && menos.matches)) return;
    if (!vivo) { vivo = true; fig.classList.add('vivo'); M = null; quadro(t); }
    ultimo = null;
    raf = requestAnimationFrame(tique);
  };
  var desligar = function () { if (raf) cancelAnimationFrame(raf); raf = 0; };
  // quem passa a pedir menos movimento com a página aberta volta ao quadro parado do HTML
  var parar = function () {
    desligar();
    vivo = false;
    fig.classList.remove('vivo');
    var els = [caixa, no, seta, toque];
    vezes.forEach(function (v) {
      els.push(v.aviso, v.fonte, v.l1);
      if (v.l2) els.push(v.l2);
      if (v.cartao) { els.push(v.cartao, v.pri, v.on); els = els.concat(v.partes); }
    });
    els.forEach(function (el) { el.removeAttribute('style'); });
  };

  var refazer = function () { M = null; if (vivo) quadro(t); };
  if ('ResizeObserver' in window) new ResizeObserver(refazer).observe(fig);
  else window.addEventListener('resize', refazer);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refazer);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visivel = es[es.length - 1].isIntersecting;
      if (visivel) ligar(); else desligar();
    }).observe(sec);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) desligar(); else ligar(); });
  if (menos && menos.addEventListener) menos.addEventListener('change', function (e) { if (e.matches) parar(); else ligar(); });
  ligar();
})();
