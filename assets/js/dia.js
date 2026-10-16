// Um dia com o Plexus (V7, 14/10/2026): o motor da seção que trava a tela, irmão do de «Como o Plexus funciona».
// Mede o quanto a pessoa desceu dentro do trilho, abre o momento do dia, enche a barra e avisa a linha do tempo e a
// demonstração da opção pelo evento «dia:passo», com i (o momento, de 0 a n - 1), t (o quanto se andou dentro dele,
// de 0 a 1), p (o total, de 0 a 1), n, forma («largo» no computador, «alto» no celular), linha (a, b ou c) e tela
// (1, 2 ou 3). O estado fica também em sec.diaEstado, para quem carrega depois do primeiro aviso.
//
// O palco da demonstração tem um tamanho de desenho fixo, escalado pelo motor para caber (--escala): 820 por 600 na
// forma larga e 400 por 560 na alta. A demonstração desenha nele em pixels de desenho e nunca mede a tela.
(function () {
  var sec = document.getElementById('um-dia');
  if (!sec || !sec.classList.contains('dia')) return;
  var d = document.documentElement.dataset;
  var linha = /^[abc]$/.test(d.linha || '') ? d.linha : 'a';
  var tela = /^[123]$/.test(d.tela || '') ? d.tela : '1';
  sec.dataset.linha = linha;
  sec.dataset.tela = tela;
  var trilho = sec.querySelector('.dia-trilho');
  var fixo = sec.querySelector('.dia-fixo');
  var area = sec.querySelector('.dia-tela');
  var palco = sec.querySelector('.dia-palco');
  var barra = sec.querySelector('.dia-progresso span');
  var itens = [].slice.call(sec.querySelectorAll('.dia-m'));
  var n = itens.length;
  sec.style.setProperty('--n', n);
  var celular = window.matchMedia('(max-width: 900px)');
  var menos = window.matchMedia('(prefers-reduced-motion: reduce)');
  var TAM = { largo: [820, 600], alto: [400, 560] };
  var forma = '';
  var atual = -1;
  var ultimo = '';

  var topoFixo = function () { return parseFloat(getComputedStyle(fixo).top) || 0; };
  var escala = function () {
    var f = celular.matches ? 'alto' : 'largo';
    if (f !== forma) {
      forma = f;
      sec.dataset.forma = f;
      palco.style.width = TAM[f][0] + 'px';
      palco.style.height = TAM[f][1] + 'px';
      palco.style.margin = (-TAM[f][1] / 2) + 'px 0 0 ' + (-TAM[f][0] / 2) + 'px';
      ultimo = '';
    }
    var r = area.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var s = Math.min(r.width / TAM[f][0], r.height / TAM[f][1]);
    s = Math.max(0.5, Math.min(s, 1.25));
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
        if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      sec.dataset.momento = String(i + 1);
      atual = i;
    }
    if (barra) barra.style.transform = 'scaleX(' + Math.max(0.04, p).toFixed(4) + ')';
    sec.style.setProperty('--p', p.toFixed(4));
    sec.style.setProperty('--t', t.toFixed(4));
    var chave = forma + ':' + i + ':' + t.toFixed(3);
    if (chave === ultimo) return;
    ultimo = chave;
    sec.diaEstado = { i: i, t: t, p: p, n: n, forma: forma, linha: linha, tela: tela };
    sec.dispatchEvent(new CustomEvent('dia:passo', { detail: sec.diaEstado }));
  };
  var pedido = false;
  var quadro = function () {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(function () { pedido = false; medir(); });
  };
  window.addEventListener('scroll', quadro, { passive: true });
  window.addEventListener('resize', function () { escala(); quadro(); });
  if (window.ResizeObserver) new ResizeObserver(function () { escala(); quadro(); }).observe(area);
  // o momento leva ao começo dele (um pouco adiante, para a tela já estar montada)
  sec.irPara = function (k) {
    var curso = trilho.offsetHeight - fixo.offsetHeight;
    var inicio = trilho.getBoundingClientRect().top + window.scrollY - topoFixo();
    window.scrollTo({ top: Math.round(inicio + curso * ((k + 0.4) / n)), behavior: menos.matches ? 'instant' : 'smooth' });
  };
  itens.forEach(function (li, k) {
    var cab = li.querySelector('.dia-cab');
    if (cab) cab.addEventListener('click', function () { sec.irPara(k); });
  });
  // o fundo embaixo da janela no padrão do site (17:13 de 14/10): 64 pixels (48 no celular) do fim do que se vê na
  // tela presa até o fim da seção, como nas outras passagens; a janela fica centrada, e a folga que sobra muda com
  // o tamanho do navegador, então o trilho perde ou ganha o que passa disso (a seção corta o que sobra)
  var pedra = function () {
    var fim = -Infinity;
    sec.querySelectorAll('.dia-tela .t1-jan, .dia-m, .dia-pontos').forEach(function (el) { if (el.offsetHeight) fim = Math.max(fim, el.getBoundingClientRect().bottom); });
    if (!isFinite(fim) || getComputedStyle(fixo).position !== 'sticky') { trilho.style.marginBottom = ''; return; }
    var agora = parseFloat(trilho.style.marginBottom) || 0;
    var folga = (fixo.getBoundingClientRect().bottom - fim) + (sec.getBoundingClientRect().bottom - trilho.getBoundingClientRect().bottom - agora);
    var quer = window.matchMedia('(max-width: 640px)').matches ? 48 : 64;
    trilho.style.marginBottom = Math.round(quer - folga) + 'px';
  };
  window.addEventListener('resize', pedra);
  window.addEventListener('load', pedra);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pedra);
  escala();
  medir();
  pedra();
})();
