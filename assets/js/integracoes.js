// A seção das integrações (V7h, 14/10/2026): a troca das três opções pelo endereço (?integracoes=a|b|c; sem
// nada, b, a escolhida por ele às 17:13), e a faixa que corre da c. Sem este
// roteiro, a seção mostra a b.
(function () {
  var secao = document.getElementById('integracoes');
  if (!secao) return;
  var pedida = null;
  var op = /^[abc]$/.test(pedida || '') ? pedida : 'b';
  secao.setAttribute('data-op', op);

  // c: a faixa anda devagar para a esquerda e volta ao começo sem emenda (as peças vão duplicadas, a cópia
  // escondida dos leitores de tela). Para com o mouse em cima, com o foco dentro, fora da tela e com a aba
  // escondida; com movimento reduzido, fica parada, com todas as peças à vista.
  var faixa = secao.querySelector('.faixa');
  if (op !== 'c' || !faixa) return;
  var trilho = faixa.querySelector('.faixa-trilho');
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  var originais = Array.prototype.slice.call(trilho.children);
  originais.forEach(function (li) {
    var copia = li.cloneNode(true);
    copia.setAttribute('aria-hidden', 'true');
    copia.querySelectorAll('a, button').forEach(function (a) { a.tabIndex = -1; });
    trilho.appendChild(copia);
  });
  var VELOCIDADE = 28; // pixels por segundo
  var periodo = 0, x = 0, ultimo = 0, quadro = 0;
  var motivo = { mouse: false, foco: false, fora: true, aba: document.hidden, reduzir: reduzir.matches };
  var parada = function () { return motivo.mouse || motivo.foco || motivo.fora || motivo.aba || motivo.reduzir; };
  var medir = function () {
    var antes = periodo;
    periodo = trilho.children[originais.length].offsetLeft - originais[0].offsetLeft;
    // na primeira medida, a faixa começa com o Gmail logo depois do desbotado da esquerda
    if (!antes) x = periodo - Math.round(faixa.clientWidth * 0.12);
    else x = x * periodo / antes;
    pintar();
  };
  var pintar = function () { trilho.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px, 0, 0)'; };
  var passo = function (t) {
    quadro = 0;
    if (parada()) { ultimo = 0; return; }
    if (ultimo) x += VELOCIDADE * Math.min(t - ultimo, 100) / 1000;
    ultimo = t;
    if (x >= periodo) x -= periodo;
    pintar();
    quadro = window.requestAnimationFrame(passo);
  };
  var rever = function () {
    faixa.classList.toggle('parada', motivo.reduzir);
    faixa.setAttribute('data-estado', parada() ? 'parada' : 'andando');
    if (!parada() && !quadro) { ultimo = 0; quadro = window.requestAnimationFrame(passo); }
  };
  faixa.addEventListener('mouseenter', function () { motivo.mouse = true; rever(); });
  faixa.addEventListener('mouseleave', function () { motivo.mouse = false; rever(); });
  faixa.addEventListener('focusin', function () { motivo.foco = true; rever(); });
  faixa.addEventListener('focusout', function () { motivo.foco = false; rever(); });
  document.addEventListener('visibilitychange', function () { motivo.aba = document.hidden; rever(); });
  var mudou = function () { motivo.reduzir = reduzir.matches; if (!motivo.reduzir) medir(); rever(); };
  if (reduzir.addEventListener) reduzir.addEventListener('change', mudou);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { motivo.fora = !es[0].isIntersecting; rever(); }).observe(faixa);
  } else {
    motivo.fora = false;
  }
  window.addEventListener('resize', function () { if (!motivo.reduzir) medir(); }, { passive: true });
  if (!motivo.reduzir) medir();
  rever();
  // as letras e as imagens mudam a largura das peças depois de carregar; mede de novo
  var remedir = function () { if (!motivo.reduzir) medir(); };
  window.addEventListener('load', remedir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remedir);
})();
