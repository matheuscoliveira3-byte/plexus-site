// Um dia com o Plexus (V7, 14/10/2026; o vídeo contínuo, 18/10/2026): o motor da seção.
// Até 17/10 a seção travava a tela como «Como o Plexus funciona» e o rolar escolhia o momento. Desde 18/10 ela não
// prende mais a rolagem (o pedido dele: «a continuous video, so the time line should follow the duration of
// animation»): a seção tem a altura do conteúdo, e o motor é o relógio do vídeo. Um relógio só: o momento i (de 0 a
// n - 1) e os segundos s dentro dele. A demonstração publica a duração de cada momento em sec.diaDuracoes (nove
// números, em segundos); sem ela, 8 s por momento. Quando s chega à duração, o vídeo passa ao momento seguinte com
// s = 0; depois do último, volta ao primeiro, em laço.
//
// O aviso «dia:passo» sai a cada quadro enquanto o vídeo toca (e a cada mudança quando está parado), com i, s, t (o
// quanto se andou no momento, s / duração, de 0 a 1), p (o total, (i + t) / n), n, forma («largo» no computador, «alto»
// no celular), linha (a, b ou c), tela (1, 2 ou 3) e tocando. O estado fica também em sec.diaEstado.
//
// Quando toca: com pelo menos 30 % da janela (.dia-tela) à vista e a aba à vista. Antes de entrar na tela, a página
// mostra o primeiro quadro das 08:00; ao sair, o vídeo pausa onde está e continua dali ao voltar. Quem pede menos
// movimento no sistema não vê o vídeo tocar sozinho: só o momento escolhido, parado. Clicar numa hora (sec.irPara(k),
// o .dia-cab e os pontos do celular) pula para o começo daquele momento e segue dali, sem rolar a página.
//
// O palco da demonstração tem um tamanho de desenho fixo, escalado pelo motor para caber (--escala): 820 por 600 na
// forma larga e 400 por 560 na alta. A área da janela tem a proporção do palco (dia.css), então a escala vem da
// largura da coluna. A demonstração desenha nele em pixels de desenho e nunca mede a tela.
(function () {
  var sec = document.getElementById('um-dia');
  if (!sec || !sec.classList.contains('dia')) return;
  var d = document.documentElement.dataset;
  var linha = /^[abc]$/.test(d.linha || '') ? d.linha : 'a';
  var tela = /^[123]$/.test(d.tela || '') ? d.tela : '1';
  sec.dataset.linha = linha;
  sec.dataset.tela = tela;
  var area = sec.querySelector('.dia-tela');
  var palco = sec.querySelector('.dia-palco');
  var lista = sec.querySelector('.dia-linha');
  var barra = sec.querySelector('.dia-progresso span');
  var itens = [].slice.call(sec.querySelectorAll('.dia-m'));
  var n = itens.length;
  if (!area || !palco || !lista || !n) return;
  sec.style.setProperty('--n', n);
  var celular = window.matchMedia('(max-width: 900px)');
  var menos = window.matchMedia('(prefers-reduced-motion: reduce)');
  var TAM = { largo: [820, 600], alto: [400, 560] };
  var forma = '';

  var escala = function () {
    var f = celular.matches ? 'alto' : 'largo';
    if (f !== forma) {
      forma = f;
      sec.dataset.forma = f;
      palco.style.width = TAM[f][0] + 'px';
      palco.style.height = TAM[f][1] + 'px';
      palco.style.margin = (-TAM[f][1] / 2) + 'px 0 0 ' + (-TAM[f][0] / 2) + 'px';
    }
    var r = area.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var s = Math.min(r.width / TAM[f][0], r.height / TAM[f][1]);
    s = Math.max(0.5, Math.min(s, 1.25));
    sec.style.setProperty('--escala', s.toFixed(3));
  };

  // ===== o relógio do vídeo =====
  var rel = { i: 0, s: 0, raf: 0, antes: 0 };
  var visivel = false;
  var marcado = -1;
  var duracao = function (k) {
    var v = sec.diaDuracoes && +sec.diaDuracoes[k];
    return v > 0 ? v : 8;
  };
  var podeTocar = function () { return !menos.matches && visivel && !document.hidden; };
  var marcar = function () {
    if (rel.i === marcado) return;
    var i = rel.i;
    itens.forEach(function (li, k) {
      li.classList.toggle('ativo', k === i);
      li.classList.toggle('visto', k < i);
      if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    sec.dataset.momento = String(i + 1);
    marcado = i;
  };
  var avisar = function () {
    marcar();
    var i = rel.i, t = Math.min(1, Math.max(0, rel.s / duracao(i))), p = (i + t) / n;
    // --p e --t ficam na lista (só a régua do b usa o --p), e não na seção: mudar uma variável na seção a cada quadro
    // faria o navegador refazer o estilo da janela inteira
    if (barra) barra.style.transform = 'scaleX(' + Math.max(0.04, p).toFixed(4) + ')';
    lista.style.setProperty('--p', p.toFixed(4));
    lista.style.setProperty('--t', t.toFixed(4));
    sec.diaEstado = { i: i, s: rel.s, t: t, p: p, n: n, forma: forma, linha: linha, tela: tela, tocando: !!rel.raf };
    sec.dispatchEvent(new CustomEvent('dia:passo', { detail: sec.diaEstado }));
  };
  var quadro = function (agora) {
    if (!podeTocar()) { rel.raf = 0; rel.antes = 0; avisar(); return; }
    var dt = rel.antes ? Math.min(0.1, Math.max(0, (agora - rel.antes) / 1000)) : 0;
    rel.antes = agora;
    rel.s += dt;
    if (rel.s >= duracao(rel.i)) { rel.i = (rel.i + 1) % n; rel.s = 0; }
    rel.raf = requestAnimationFrame(quadro);
    avisar();
  };
  var acordar = function () {
    if (rel.raf || !podeTocar()) return;
    rel.antes = 0;
    rel.raf = requestAnimationFrame(quadro);
  };
  var parar = function () {
    if (!rel.raf) return;
    cancelAnimationFrame(rel.raf);
    rel.raf = 0; rel.antes = 0;
    avisar();
  };
  var conferir = function () { if (podeTocar()) acordar(); else parar(); };

  // o vídeo toca com pelo menos 30 % da janela à vista; abaixo disso, e com a aba escondida, pausa onde está
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (es) {
      var e = es[es.length - 1];
      visivel = e.isIntersecting && e.intersectionRatio >= 0.295;
      conferir();
    }, { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1] }).observe(area);
  } else visivel = true;
  document.addEventListener('visibilitychange', conferir);
  var mudouMenos = function () { conferir(); avisar(); };
  if (menos.addEventListener) menos.addEventListener('change', mudouMenos); else if (menos.addListener) menos.addListener(mudouMenos);

  // a hora leva ao começo do momento, e o vídeo segue dali (parado, para quem pede menos movimento)
  sec.irPara = function (k) {
    k = Math.max(0, Math.min(n - 1, Math.round(+k) || 0));
    rel.i = k; rel.s = 0; rel.antes = 0;
    avisar();
    acordar();
  };
  itens.forEach(function (li, k) {
    var cab = li.querySelector('.dia-cab');
    if (cab) cab.addEventListener('click', function () { sec.irPara(k); });
  });

  // ===== a altura da lista no computador =====
  // A lista abre o texto de um momento por vez e fica centrada ao lado da janela. Onde ela é mais alta que a janela
  // (as telas entre 900 e 1100 de largura), a altura da seção mudaria a cada momento, e a página embaixo andaria com o
  // vídeo: a lista guarda a altura do momento de texto mais longo.
  var reservar = function () {
    if (celular.matches) { lista.style.minHeight = ''; return; }
    var gap = parseFloat(getComputedStyle(lista).rowGap) || 0, base = gap * (n - 1), maior = 0;
    itens.forEach(function (li) {
      var corpo = li.querySelector('.dia-corpo'), dentro = corpo && corpo.firstElementChild;
      base += li.offsetHeight - (corpo ? corpo.offsetHeight : 0);
      if (dentro) maior = Math.max(maior, dentro.scrollHeight);
    });
    lista.style.minHeight = Math.ceil(base + maior) + 'px';
  };

  var refazer = function () { escala(); reservar(); avisar(); };
  window.addEventListener('resize', refazer);
  if (window.ResizeObserver) new ResizeObserver(function () { escala(); avisar(); }).observe(area);
  window.addEventListener('load', reservar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reservar);
  escala();
  reservar();
  avisar();
})();
