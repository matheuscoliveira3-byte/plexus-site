// A peça da dor (V5b, 13/10/2026): o movimento dos dois desenhos da triagem (?dor=a o fluxo, a escolha dele; b a janela). O HTML já
// traz o estado final, parado; este roteiro só anda quando o sistema não pede menos movimento e a peça está na tela.
// Fora da tela, o ciclo espera no próximo passo. Se o pedido de menos movimento chegar com a página aberta, tudo
// volta ao estado final.
(function () {
  var menos = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  if (!('IntersectionObserver' in window) || !Element.prototype.animate || (menos && menos.matches)) return;
  var E = 'cubic-bezier(0.22, 1, 0.36, 1)';
  var ENTRA = 'cubic-bezier(0.55, 0, 0.75, 0.2)';
  var parou = false;
  var lista = function (x) { return Array.prototype.slice.call(x); };
  var dormir = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  // espera o tempo do passo e depois espera a peça voltar à tela (e a aba voltar a ficar visível: com a aba em
  // segundo plano o navegador congela as animações, e o ciclo seguia empilhando trabalho; o defeito que ele viu
  // às 16:55); se o movimento parou, encerra o ciclo
  var passo = async function (p, ms) {
    await dormir(ms);
    while ((!p.visivel || document.hidden) && !parou) await dormir(250);
    if (parou) throw new Error('parou');
  };
  // uma animação por elemento: a nova cancela a anterior, e o fim fica preso até a próxima
  var mover = function (el, quadros, ms, extra) {
    if (el._a) el._a.cancel();
    el._a = el.animate(quadros, Object.assign({ duration: ms, easing: E, fill: 'forwards' }, extra || {}));
    return el._a.finished;
  };
  var centro = function (el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

  // ===== a: a janela =====
  // O barulho dos aplicativos (a doca com os contadores e os avisos), tudo entra no Plexus, e a janela do dia
  // aparece: cada linha passa pela pergunta e se resolve, riscada pelo Plexus ou em verde para a pessoa.
  var janela = function (fig) {
    var p = { visivel: false, rodando: false, fig: fig };
    var doca = fig.querySelector('.pj-doca');
    var apps = lista(doca.querySelectorAll('.app'));
    var contas = lista(doca.querySelectorAll('.app b'));
    var notas = lista(fig.querySelectorAll('.pj-nota'));
    var no = fig.querySelector('.pj-no');
    var jan = fig.querySelector('.pj-janela');
    var linhas = lista(fig.querySelectorAll('.pj-lista li'));
    p.rodar = async function () {
      p.rodando = true;
      fig.classList.add('vivo');
      try {
        for (;;) {
          // 1. o barulho
          mover(doca, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], 500);
          apps.forEach(function (a, i) { mover(a, [{ opacity: 0, transform: 'scale(0.85)' }, { opacity: 1, transform: 'none' }], 450, { delay: 120 + i * 70 }); });
          contas.forEach(function (b, i) { mover(b, [{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'none' }], 380, { delay: 600 + i * 90, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }); });
          await passo(p, 900);
          var vistas = notas.filter(function (n) { return n.offsetParent !== null; });
          for (var i = 0; i < vistas.length; i++) {
            mover(vistas[i], [{ opacity: 0, transform: 'translateY(10px) scale(0.97)' }, { opacity: 1, transform: 'none' }], 450);
            await passo(p, 430);
          }
          await passo(p, 1000);
          // 2. tudo entra no Plexus
          var c = centro(no);
          mover(no, [{ opacity: 0, transform: 'scale(0.5)' }, { opacity: 1, transform: 'none' }], 500);
          [doca].concat(vistas).forEach(function (el, k) {
            var o = centro(el);
            mover(el, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate(' + (c.x - o.x) + 'px, ' + (c.y - o.y) + 'px) scale(0.2)' }], 700, { delay: 80 + k * 45, easing: ENTRA });
          });
          await passo(p, 1050);
          await mover(no, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1.1)' }, { opacity: 1, transform: 'scale(1)' }], 420);
          await passo(p, 250);
          // 3. a janela do dia
          mover(no, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.15)' }], 450);
          mover(jan, [{ opacity: 0, transform: 'translateY(12px) scale(0.97)' }, { opacity: 1, transform: 'none' }], 650);
          await passo(p, 400);
          for (var j = 0; j < linhas.length; j++) { linhas[j].classList.add('on'); await passo(p, 110); }
          await passo(p, 900);
          for (var k = 0; k < linhas.length; k++) { linhas[k].classList.add('res'); await passo(p, 800); }
          await passo(p, 4200);
          // recomeça
          await mover(jan, [{ opacity: 1 }, { opacity: 0 }], 450);
          linhas.forEach(function (l) { l.classList.remove('on', 'res'); });
          [doca, no].concat(apps, contas, notas).forEach(function (el) { if (el._a) el._a.cancel(); });
          await passo(p, 500);
        }
      } catch (e) { /* o movimento parou */ }
    };
    return p;
  };

  // ===== b: o fluxo =====
  // Os aplicativos entram pela esquerda (no celular, por cima) e somem no Plexus; de lá sai o trabalho, para a
  // faixa do Plexus (entra e é riscado) ou para a faixa da pessoa (fica).
  // Cada exemplo é o que o Plexus pronto faz com o que chega por aquele canal (conferido em 13/10 contra o mapa dos
  // canais e a seção da solução): a resposta redigida sai só depois do sim da pessoa; o combinado da reunião vem do
  // gravador; a promessa vira tarefa de espera; o relatório e a apresentação voltam para a pessoa revisar.
  var ITENS = [
    ['gmail', 'Redigir a resposta com o contrato', 'p'], ['teams', 'Registrar o que ficou combinado', 'p'], ['outlook', 'Decidir o preço da proposta', 'v'],
    ['whatsapp', 'Acompanhar a nota prometida', 'p'], ['drive', 'Montar o relatório da semana', 'p'], ['gmail', 'Escolher entre as duas cotações', 'v'],
    ['outlook', 'Arquivar o anexo do cliente', 'p'], ['outlook', 'Marcar a reunião pedida', 'p'], ['whatsapp', 'Recomendar o caminho ao cliente', 'v'],
    ['whatsapp', 'Preparar a apresentação pedida por áudio', 'p'], ['gmail', 'Separar o que importa do resto', 'p'], ['zoom', 'Negociar o prazo com o cliente', 'v']
  ];
  // 13/10, 19:17: o gravador do Plexus grava o Meet, o Teams e o Zoom (a correção dele: «aqui parece que você se limita
  // ao Google Meet»); o Teams entra como reunião gravada, nunca como porta de leitura de conversa
  var LOGOS = ['gmail', 'whatsapp', 'meet', 'outlook', 'drive', 'teams', 'agenda', 'zoom', 'onedrive'];
  var fluxo = function (fig) {
    var p = { visivel: false, rodando: false, fig: fig };
    var palco = fig.querySelector('.pf-palco');
    var entram = fig.querySelector('.pf-entram');
    var no = fig.querySelector('.pf-no');
    var faixas = { p: fig.querySelector('.pf-plexus ol'), v: fig.querySelector('.pf-voce ol') };
    var teto = { p: 3, v: 2 };
    var n = 0;
    // um logo entra e some no Plexus
    var voar = async function (logo) {
      var r0 = palco.getBoundingClientRect();
      var largo = r0.width > 560;
      var a = document.createElement('span');
      a.className = 'app voa';
      a.innerHTML = '<img src="/assets/img/fontes/' + logo + '.svg" alt="">';
      entram.appendChild(a);
      var t = a.getBoundingClientRect();
      var cn = centro(no);
      var nx = cn.x - r0.left - t.width / 2, ny = cn.y - r0.top - t.height / 2;
      var x0, y0;
      if (largo) { x0 = -t.width; y0 = r0.height * (0.18 + Math.random() * 0.64) - t.height / 2; }
      else { x0 = r0.width * (0.12 + Math.random() * 0.76) - t.width / 2; y0 = -t.height; }
      var mx = largo ? x0 + (nx - x0) * 0.55 : x0 + (nx - x0) * 0.35;
      var my = largo ? y0 + (ny - y0) * 0.35 : y0 + (ny - y0) * 0.55;
      await mover(a, [
        { transform: 'translate(' + x0 + 'px, ' + y0 + 'px) scale(1)', opacity: 0 },
        { transform: 'translate(' + (x0 + (mx - x0) * 0.3) + 'px, ' + (y0 + (my - y0) * 0.3) + 'px) scale(1)', opacity: 1, offset: 0.18 },
        { transform: 'translate(' + mx + 'px, ' + my + 'px) scale(0.95)', opacity: 1, offset: 0.6 },
        { transform: 'translate(' + nx + 'px, ' + ny + 'px) scale(0.35)', opacity: 0 }
      ], 4200 + Math.random() * 1400, { easing: 'cubic-bezier(0.45, 0, 0.55, 1)' });
      a.remove();
      no.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 360, easing: E });
    };
    // o trabalho sai do Plexus para a faixa dele; se a faixa já tem o mesmo trabalho, é ele que sai
    var sair = async function (item) {
      var ol = faixas[item[2]];
      var li = document.createElement('li');
      li.className = 'pf-item';
      li.innerHTML = '<img src="/assets/img/fontes/' + item[0] + '.svg" alt=""><span></span>';
      li.lastChild.textContent = item[1];
      // a faixa nunca passa do teto: o que sobra sai do fluxo na hora (fica por cima, onde estava, e some), e
      // o que já está saindo não conta
      var velhos = lista(ol.children).filter(function (x) { return !x.classList.contains('saindo'); });
      var antes = velhos.map(function (x) { return x.getBoundingClientRect(); });
      var igual = velhos.filter(function (x) { return x.textContent === item[1]; })[0];
      var ficam = velhos.filter(function (x) { return x !== igual; });
      var sobras = igual ? [igual] : [];
      while (ficam.length + 1 > teto[item[2]]) sobras.push(ficam.pop());
      sobras.forEach(function (x) {
        var topo = x.offsetTop;
        x.classList.add('saindo');
        x.style.position = 'absolute'; x.style.left = '0'; x.style.top = topo + 'px';
        mover(x, [{ opacity: 1 }, { opacity: 0 }], 300).then(function () { x.remove(); });
        setTimeout(function () { x.remove(); }, 600);
      });
      ol.insertBefore(li, ol.firstChild);
      ficam.forEach(function (x) {
        var i = velhos.indexOf(x), d = x.getBoundingClientRect();
        mover(x, [{ transform: 'translate(0, ' + (antes[i].top - d.top) + 'px)' }, { transform: 'none' }], 500);
      });
      var cl = centro(li), cn2 = centro(no);
      await mover(li, [{ transform: 'translate(' + (cn2.x - cl.x) + 'px, ' + (cn2.y - cl.y) + 'px) scale(0.5)', opacity: 0 }, { transform: 'none', opacity: 1 }], 700);
      if (item[2] === 'p') setTimeout(function () { li.classList.add('feito'); }, 700);
    };
    p.rodar = async function () {
      p.rodando = true;
      fig.classList.add('vivo');
      try {
        for (;;) {
          voar(LOGOS[n % LOGOS.length]);
          if (n % 4 === 3) sair(ITENS[Math.floor(n / 4) % ITENS.length]);
          n++;
          await passo(p, 420);
        }
      } catch (e) { /* o movimento parou */ }
    };
    return p;
  };

  var pecas = lista(document.querySelectorAll('.pj')).map(janela).concat(lista(document.querySelectorAll('.pf')).map(fluxo));
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var p = e.target._peca;
      p.visivel = e.isIntersecting;
      if (p.visivel && !p.rodando && !parou) p.rodar();
    });
  }, { threshold: 0.3 });
  pecas.forEach(function (p) { p.fig._peca = p; io.observe(p.fig); });

  if (menos && menos.addEventListener) menos.addEventListener('change', function (e) {
    if (!e.matches) return;
    parou = true;
    pecas.forEach(function (p) {
      p.fig.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
      p.fig.classList.remove('vivo');
      lista(p.fig.querySelectorAll('.pj-lista li')).forEach(function (l) { l.classList.add('on', 'res'); });
      lista(p.fig.querySelectorAll('.voa')).forEach(function (v) { v.remove(); });
    });
  });
})();
