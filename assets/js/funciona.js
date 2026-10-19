// PLX-119, item 1, jeito A, «o texto grande» (18/10/2026). Roda antes de solucao.js (vem antes dele na página) e
// não mexe no motor: escuta o «sol:passo» e deixa à vista o texto da parte do momento. Também escolhe o texto curto
// abaixo do título pelo endereço (?texto=a|b|c; sem nada, a).
// Ajuste 2 do dono (18/10/2026, 18:16): a coluna da esquerda alinhada com o quadro da arte. O quadro (.sc-papel)
// fica centrado na área da arte, com a escala que o motor dá; aqui se mede a folga entre a área e o quadro, em cima
// e embaixo, e ela vai para --fa-folga-topo e --fa-folga-pe (funciona-a.css empurra o texto e a barra por elas).
// Só no computador; no celular a arte fica em cima e a folga é zero.
(function () {
  var sec = document.getElementById('solucao');
  if (!sec) return;
  var q = new URLSearchParams(location.search).get('texto');
  if (/^[bc]$/.test(q || '')) sec.dataset.texto = q;
  var textos = [].slice.call(sec.querySelectorAll('.fa-texto'));
  var atual = -1;
  var mostrar = function (i) {
    if (i === atual || !textos[i]) return;
    textos.forEach(function (el, k) { el.classList.toggle('fa-on', k === i); });
    atual = i;
  };
  sec.addEventListener('sol:passo', function (e) { if (e.detail) mostrar(e.detail.i); });
  mostrar(sec.solEstado ? sec.solEstado.i : 0);

  var arte = sec.querySelector('.sol-arte');
  var computador = window.matchMedia('(min-width: 901px)');
  var px = function (v) { return Math.max(0, Math.round(v * 10) / 10) + 'px'; };
  var alinhar = function () {
    var topo = 0, pe = 0;
    if (arte && computador.matches) {
      var a = arte.getBoundingClientRect();
      var papel = sec.querySelector('.sc-papel');
      var r = papel && papel.getBoundingClientRect();
      if (r && r.height) { topo = r.top - a.top; pe = a.bottom - r.bottom; }
      else if (a.height) {
        // a arte ainda não montou: a mesma conta do motor (o palco de 640 por 560, centrado)
        var s = Math.max(0.42, Math.min(a.width / 640, a.height / 560, 1.3));
        topo = pe = (a.height - 560 * s) / 2;
      }
    }
    sec.style.setProperty('--fa-folga-topo', px(topo));
    sec.style.setProperty('--fa-folga-pe', px(pe));
  };
  var pedido = 0;
  var depois = function () { cancelAnimationFrame(pedido); pedido = requestAnimationFrame(alinhar); };
  window.addEventListener('resize', depois);
  window.addEventListener('load', depois);
  if (window.ResizeObserver && arte) new ResizeObserver(depois).observe(arte);
  var primeiro = function () { depois(); sec.removeEventListener('sol:passo', primeiro); };
  sec.addEventListener('sol:passo', primeiro);
  depois();
})();
