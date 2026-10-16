// Como o Plexus funciona (V6, 13/10/2026): o motor da seção que trava a tela. Mede o quanto a pessoa desceu dentro
// do trilho, abre a parte do momento, enche a barra e avisa a arte da opção (sol-a, sol-b ou sol-c) pelo evento
// «sol:passo», com i (a parte, de 0 a 6), t (o quanto se andou dentro dela, de 0 a 1) e p (o total, de 0 a 1).
// O estado do momento fica também em sec.solEstado, para a arte que carrega depois do primeiro aviso.
(function () {
  var sec = document.getElementById('solucao');
  if (!sec || !sec.classList.contains('sol')) return;
  var op = document.documentElement.dataset.solucao;
  // sem nada no endereço abre a C, a escolha dele às 19:17 de 13/10 («mais dinâmica e legal»)
  if (!/^[abc]$/.test(op || '')) op = 'c';
  sec.dataset.op = op;
  var trilho = sec.querySelector('.sol-trilho');
  var fixo = sec.querySelector('.sol-fixo');
  var arte = sec.querySelector('.sol-arte');
  var barra = sec.querySelector('.sol-progresso span');
  var itens = [].slice.call(sec.querySelectorAll('.sol-item'));
  var n = itens.length;
  sec.style.setProperty('--n', n);
  var menos = window.matchMedia('(prefers-reduced-motion: reduce)');
  var atual = -1;
  var ultimo = '';

  var topoFixo = function () { return parseFloat(getComputedStyle(fixo).top) || 0; };
  var escala = function () {
    var r = arte.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var s = Math.min(r.width / 640, r.height / 560);
    s = Math.max(0.42, Math.min(s, 1.3));
    sec.style.setProperty('--escala', s.toFixed(3));
  };
  var medir = function () {
    var curso = trilho.offsetHeight - fixo.offsetHeight;
    var andou = topoFixo() - trilho.getBoundingClientRect().top;
    var p = curso > 0 ? Math.min(1, Math.max(0, andou / curso)) : 0;
    var x = p * n;
    var i = Math.min(n - 1, Math.floor(x));
    var t = Math.min(1, Math.max(0, x - i));
    if (i !== atual) {
      itens.forEach(function (li, k) {
        li.classList.toggle('ativo', k === i);
        li.classList.toggle('visto', k < i);
        li.querySelector('.sol-pilula').setAttribute('aria-expanded', k === i ? 'true' : 'false');
      });
      sec.dataset.passo = String(i + 1);
      atual = i;
    }
    if (barra) barra.style.transform = 'scaleX(' + Math.max(0.04, p).toFixed(4) + ')';
    sec.style.setProperty('--p', p.toFixed(4));
    sec.style.setProperty('--t', t.toFixed(4));
    var chave = i + ':' + t.toFixed(3);
    if (chave === ultimo) return;
    ultimo = chave;
    sec.solEstado = { i: i, t: t, p: p, n: n, op: op };
    sec.dispatchEvent(new CustomEvent('sol:passo', { detail: sec.solEstado }));
  };
  var pedido = false;
  var quadro = function () {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(function () { pedido = false; medir(); });
  };
  window.addEventListener('scroll', quadro, { passive: true });
  window.addEventListener('resize', function () { escala(); quadro(); });
  if (window.ResizeObserver) new ResizeObserver(function () { escala(); }).observe(arte);
  // a pílula leva ao começo da parte dela (um pouco adiante, para a arte já estar montada)
  itens.forEach(function (li, k) {
    li.querySelector('.sol-pilula').addEventListener('click', function () {
      var curso = trilho.offsetHeight - fixo.offsetHeight;
      var inicio = trilho.getBoundingClientRect().top + window.scrollY - topoFixo();
      window.scrollTo({ top: Math.round(inicio + curso * ((k + 0.4) / n)), behavior: menos.matches ? 'instant' : 'smooth' });
    });
  });
  escala();
  medir();
})();
