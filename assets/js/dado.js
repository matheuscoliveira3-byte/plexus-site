// Os três números da seção do dado contam do zero até o valor quando a lista aparece na tela (o pedido dele
// de 16/10, «esses números devem ter um efeito de crescendo»): um depois do outro, desacelerando no fim.
// O HTML traz o valor final, que fica parado sem roteiro e para quem pede menos movimento ao sistema.
// O leitor de tela lê sempre o valor final; a contagem é só visual.
(function () {
  var lista = document.querySelector('.dado-slack .lista');
  var menos = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!lista || menos || !('IntersectionObserver' in window)) return;

  var milhar = new Intl.NumberFormat('pt-BR');
  var DURACAO = 1600;
  var ATRASO = 180;

  var numeros = Array.prototype.slice.call(lista.querySelectorAll('.num')).map(function (el) {
    var texto = el.textContent.trim();
    var m = texto.match(/^(\D*)([\d.]+)(\D*)$/);
    if (!m) return null;
    var alvo = Number(m[2].replace(/\./g, ''));
    var visivel = document.createElement('span');
    visivel.setAttribute('aria-hidden', 'true');
    var lido = document.createElement('span');
    lido.className = 'sr-only';
    lido.textContent = texto;
    el.textContent = '';
    el.appendChild(visivel);
    el.appendChild(lido);
    var mostra = function (v) { visivel.textContent = m[1] + milhar.format(v) + m[3]; };
    mostra(0);
    return { alvo: alvo, mostra: mostra };
  }).filter(Boolean);

  var contar = function (n, atraso) {
    var t0 = null;
    var passo = function (t) {
      if (t0 === null) t0 = t + atraso;
      var k = Math.max(0, Math.min(1, (t - t0) / DURACAO));
      n.mostra(Math.round(n.alvo * (1 - Math.pow(1 - k, 4))));
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  var io = new IntersectionObserver(function (entradas) {
    if (!entradas.some(function (e) { return e.isIntersecting; })) return;
    io.disconnect();
    numeros.forEach(function (n, i) { contar(n, i * ATRASO); });
  }, { threshold: 0.33 });
  io.observe(lista);
})();
