// O roteiro das três seções novas da V3 (13/10/2026): o número, a dor e a solução.
// Cada opção anda uma vez, quando a peça dela (marcada com data-palco) aparece pelo menos um terço na tela: o roteiro
// marca a peça e a opção com «chegou», e os números contam. Na solução c, cada fileira anda quando ela aparece.
// Os estados de partida só valem com a classe «anima» no documento, que este roteiro põe quando o sistema não pede
// menos movimento. Sem roteiro, ou com o pedido (também se ele vier com a página aberta), fica o estado final, parado.
// A lista das sete partes da solução (a opção a) troca o que a tela mostra, pelo clique e pelas setas do teclado.
(function () {
  var raiz = document.documentElement;
  var menos = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var ops = Array.prototype.slice.call(document.querySelectorAll('.op'));

  var contar = function (el) {
    var alvo = Number(el.getAttribute('data-conta'));
    var t0 = null;
    var passo = function (t) {
      if (!raiz.classList.contains('anima')) { el.textContent = alvo; return; }
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / 1000);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  var palcos = Array.prototype.slice.call(document.querySelectorAll('[data-palco]'));
  var chegar = function (palco) {
    palco.classList.add('chegou');
    var op = palco.closest('.op');
    if (!op || op.classList.contains('chegou')) return;
    op.classList.add('chegou');
    if (raiz.classList.contains('anima')) op.querySelectorAll('[data-conta]').forEach(contar);
  };
  var parar = function () {
    raiz.classList.remove('anima');
    // o que já andava termina na hora (a revisão da V3, L3)
    if (document.getAnimations) document.getAnimations().forEach(function (a) { if (!(a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.hero'))) a.finish(); });
    palcos.forEach(function (p) { p.classList.add('chegou'); });
    ops.forEach(function (op) {
      op.classList.add('chegou');
      op.querySelectorAll('[data-conta]').forEach(function (el) { el.textContent = el.getAttribute('data-conta'); });
    });
  };

  if ('IntersectionObserver' in window && !(menos && menos.matches)) {
    raiz.classList.add('anima');
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) { chegar(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.33 });
    palcos.forEach(function (p) { io.observe(p); });
    if (menos && menos.addEventListener) menos.addEventListener('change', function (e) { if (e.matches) parar(); });
  }

  // A lista das sete partes, como abas: uma parte aberta por vez, a tela mostra a dela.
  document.querySelectorAll('.passos').forEach(function (lista) {
    var abas = Array.prototype.slice.call(lista.querySelectorAll('[role=tab]'));
    var itens = lista.closest('.op').querySelectorAll('.app2-nav li');
    var abrir = function (aba, foco) {
      abas.forEach(function (a) {
        var on = a === aba;
        a.setAttribute('aria-selected', on ? 'true' : 'false');
        a.tabIndex = on ? 0 : -1;
        document.getElementById(a.getAttribute('aria-controls')).classList.toggle('on', on);
      });
      var n = aba.id.slice(-1);
      itens.forEach(function (li) { li.classList.toggle('on', (' ' + li.getAttribute('data-para') + ' ').indexOf(' ' + n + ' ') >= 0); });
      if (foco) aba.focus();
    };
    abas.forEach(function (aba, i) {
      aba.addEventListener('click', function () { abrir(aba, false); });
      aba.addEventListener('keydown', function (ev) {
        var j = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: abas.length - 1 }[ev.key];
        if (j === undefined) return;
        ev.preventDefault();
        abrir(abas[(j + abas.length) % abas.length], true);
      });
    });
  });
})();
