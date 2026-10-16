// sol-b: a tela do Plexus (V6, 13/10/2026). Monta no palco a janela do produto (a barra lateral, as sete cenas) e os
// painéis que saem dela, e desenha cada parte como função de (i, t), o aviso «sol:passo» do motor: quem sobe a
// página vê tudo voltar. No que anda com o rolar, só transform e opacity; o resto é classe, com a transição curta do
// CSS. Quem pede menos movimento vê os mesmos estados, sem deslocamento e sem transição.
(function () {
  'use strict';
  var sec = document.getElementById('solucao');
  if (!sec || sec.dataset.op !== 'b') return;
  var palco = sec.querySelector('.sol-palco');
  if (!palco) return;
  var menos = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ===== as peças do desenho =====
  var F = '/assets/img/fontes/';
  var logo = function (n) { return '<img src="' + F + n + '.svg" alt="" width="18" height="18" decoding="async">'; };
  var ic = function (id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; };
  var LACO = '<svg viewBox="0 0 514 540" aria-hidden="true"><use href="#marca"/></svg>';
  var VISTO = '<svg viewBox="0 0 12 12" aria-hidden="true"><use href="#i-check"/></svg>';
  var CURSOR = '<svg viewBox="0 0 22 24" aria-hidden="true"><path d="M3 2.2v16.6l4.3-4.1 2.9 6.6 3-1.3-2.9-6.5h6z" fill="#1b1b19" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  var PORTAS = [
    ['gmail', 'Gmail', 'e-mail'],
    ['outlook', 'Outlook', 'e-mail'],
    ['agenda', 'Google Agenda', 'agenda'],
    ['drive', 'Google Drive', 'arquivos'],
    ['onedrive', 'OneDrive', 'arquivos'],
    ['whatsapp', 'WhatsApp', 'conversas'],
    ['meet', 'Google Meet', 'reuniões gravadas']
  ];

  var cena1 =
    '<section class="sb-cena" data-c="0">' +
      '<div class="sb-topo"><p class="sb-titulo">Conexões</p><p class="sb-placar"><i></i><span><b class="sb-placar-n">0</b> de 7 ao vivo</span></p></div>' +
      '<p class="sb-sub">Cada porta conectada entra no mesmo contexto.</p>' +
      '<ul class="sb-portas">' + PORTAS.map(function (p) {
        return '<li><span class="sb-ladrilho">' + logo(p[0]) + '<i class="sb-badge"></i></span>' +
          '<span class="sb-nome">' + p[1] + '<small>' + p[2] + '</small></span>' +
          '<span class="sb-estado"><span class="sb-conectar">Conectar</span><span class="sb-vivo"><i></i>ao vivo</span></span></li>';
      }).join('') + '</ul>' +
    '</section>';

  var flut1 =
    '<div class="sb-flut sb-dia" data-c="0">' +
      '<div class="sb-cab"><span class="sb-selo-laco">' + LACO + '</span><span><b>O primeiro dia</b><small><span>lendo uma vez só</span><span>o mapa está pronto</span></small></span></div>' +
      '<ol class="sb-leituras">' + [['Os cabeçalhos', '90 dias'], ['Os e-mails que você enviou', '2 semanas'], ['As conversas que esperam você', '7 dias']].map(function (l, k) {
        return '<li><span class="sb-marco"><span>' + (k + 1) + '</span>' + VISTO + '</span><span class="sb-ler"><span>' + l[0] + '</span><small>' + l[1] + '</small><i class="sb-barra"><i></i></i></span></li>';
      }).join('') + '</ol>' +
      '<div class="sb-numeros"><p><span class="sb-n" data-max="148">0</span><small>pessoas</small></p><p><span class="sb-n" data-max="6">0</span><small>conversas em aberto</small></p></div>' +
      '<p class="sb-papeis"><span>cliente</span><span>sócia</span><span>fornecedor</span><span>equipe</span></p>' +
      '<p class="sb-nada">' + VISTO + 'Mapeado sozinho</p>' +
      '<i class="sb-apaga"></i>' +
    '</div>' +
    '<div class="sb-flut sb-c1" data-c="0">' +
      '<p class="sb-de">' + LACO + '<span>Hoje, o primeiro cartão</span><span class="sb-agora"><i></i>agora</span></p>' +
      '<p class="sb-cartao-t">O Sérgio, da Padaria Bom Grão, espera a sua resposta desde ontem.</p>' +
      '<p class="sb-quem"><span class="sb-avatar">S</span><span>Sérgio</span><span class="sb-selo">cliente</span><span class="sb-origem">' + logo('gmail') + 'ontem, 17:40</span></p>' +
      '<div class="sb-pe"><span>A resposta já está escrita.</span><span class="sb-botoes"><span class="sb-b um">Abrir</span></span></div>' +
    '</div>';


  // ===== Partes 2 a 4: o Sérgio, Hoje e Tarefas =====
  var palavras = function (str) { return str.split(' ').map(function (w) { return '<span class="sb-pal">' + w + '</span>'; }).join(' '); };
  var origem = function (lg, txt) { return '<span class="sb-origem">' + logo(lg) + txt + '</span>'; };
  var fato = function (txt, lg, de) { return '<li><p>' + txt + '</p>' + origem(lg, de) + '</li>'; };

  var cena2 =
    '<section class="sb-cena" data-c="1">' +
      '<div class="sb-pessoa-cab"><span class="sb-avatar sb-avatar-g">S</span><p class="sb-titulo">Sérgio<span class="sb-selo">cliente</span></p><p class="sb-sub">Padaria Bom Grão</p></div>' +
      '<p class="sb-rotulo">O que se sabe</p>' +
      '<ul class="sb-fatos">' +
        fato('Prometeu os extratos de setembro até quinta.', 'gmail', 'Gmail, 08:42') +
        fato('O banco atrasou os extratos de setembro.', 'whatsapp', 'o WhatsApp de ontem') +
        fato('O fechamento de setembro depende dos extratos.', 'meet', 'a reunião de 06/10') +
        fato('A guia do dia 20 depende do fechamento.', 'meet', 'a reunião de 06/10') +
      '</ul>' +
    '</section>';
  var fonte = function (lg, quem, quando, corpo) {
    return '<div class="sb-fonte"><p class="sb-fonte-cab"><span class="sb-ladrilho">' + logo(lg) + '</span><span><b>' + quem + '</b><small>' + quando + '</small></span></p><p class="sb-fonte-txt">' + corpo + '</p></div>';
  };
  var flut2 =
    '<div class="sb-flut sb-fontes" data-c="1">' +
      fonte('gmail', 'Sérgio', 'Gmail, hoje às 08:42', 'Helena, o banco ainda não mandou tudo. <mark>Consigo os extratos até quinta</mark>, pode ser?') +
      fonte('whatsapp', 'Sérgio', 'WhatsApp, ontem às 18:20', '<mark>O banco atrasou os extratos de setembro.</mark> Amanhã eu cobro o gerente.') +
      fonte('meet', 'Reunião com o Sérgio', 'Google Meet, 06/10', '<span class="sb-fala">Helena</span><mark>Sem os extratos, o fechamento não sai</mark>, e <mark>a guia do dia 20 depende dele</mark>.') +
    '</div>';

  var cena3 =
    '<section class="sb-cena" data-c="2">' +
      '<div class="sb-topo"><p class="sb-titulo">Hoje</p><p class="sb-abas"><span class="on">Decisões</span><span>Tarefas</span><span>Agenda</span></p></div>' +
      '<div class="sb-cartao sb-c3">' +
        '<p class="sb-cartao-t">O Sérgio pede mais prazo para os extratos. Aceito?</p>' +
        '<div class="sb-opcao sb-op-rec"><span class="sb-radio"></span><div class="sb-op-txt"><p>Aceitar até quinta<span class="sb-rec">recomendada</span></p>' +
          '<div class="sb-resposta"><small>' + logo('gmail') + 'A resposta ao Sérgio</small><p>' + palavras('Sérgio, sem problema. Fico no aguardo dos extratos até quinta. Abraço, Helena.') + '</p></div></div></div>' +
        '<div class="sb-opcao sb-op-2"><span class="sb-radio"></span><div class="sb-op-txt"><p>Pedir os extratos até amanhã</p></div></div>' +
        '<div class="sb-acoes"><span class="sb-b">Reprovar</span><span class="sb-b um">Aprovar</span></div>' +
      '</div>' +
    '</section>';
  var flut3 =
    '<div class="sb-flut sb-c3b" data-c="2">' +
      '<p class="sb-cartao-t">Para responder à Renata, falta uma informação.</p>' +
      '<p class="sb-pergunta">O contrato social já foi registrado na junta?</p>' +
      '<p class="sb-caixa"><span class="sb-digita"></span><i class="sb-caret"></i><span class="sb-caixa-vazia">Responda aqui</span><span class="sb-enviar"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span></p>' +
    '</div>';

  var tarefa = function (titulo, sub, extra, cls) {
    return '<li class="' + (cls || '') + '"><span class="sb-anel">' + VISTO + '</span><div><p class="sb-t-titulo"><span>' + titulo + '<i class="sb-risco"></i></span></p><small>' + sub + '</small>' + (extra || '') + '</div></li>';
  };
  var cena4 =
    '<section class="sb-cena" data-c="3">' +
      '<div class="sb-topo"><p class="sb-titulo">Tarefas</p><p class="sb-abas"><span class="on">Todas</span><span>Suas</span><span>Plexus</span></p></div>' +
      '<p class="sb-grupo">Esperando alguém</p>' +
      '<ul class="sb-tarefas">' +
        tarefa('Extratos de setembro da Padaria Bom Grão', 'até quinta, 15/10 · esperando o Sérgio', '<p class="sb-chegou">' + logo('gmail') + 'Chegou às 10:14, no e-mail do Sérgio</p>', 'sb-t-alvo') +
        tarefa('Contrato social da Construtora Alvorada', 'esperando a Renata') +
      '</ul>' +
      '<p class="sb-grupo">Esta semana</p>' +
      '<ul class="sb-tarefas">' +
        tarefa('Conciliar setembro da Padaria Bom Grão', '<span class="sb-troca"><span>depois dos extratos · você</span><span>pode começar, os extratos chegaram</span></span>', '', 'sb-t-prox') +
        tarefa('A guia do dia 20 da Padaria Bom Grão', 'terça, 20/10 · você') +
      '</ul>' +
    '</section>';
  var flut4 =
    '<div class="sb-flut sb-chega" data-c="3">' +
      '<p class="sb-fonte-cab"><span class="sb-ladrilho">' + logo('gmail') + '</span><span><b>Sérgio</b><small>Gmail, hoje às 10:14</small></span></p>' +
      '<p class="sb-chega-t">Extratos de setembro</p>' +
      '<p class="sb-fonte-txt">Helena, seguem os extratos. Desculpe a demora.</p>' +
      '<p class="sb-anexo"><span class="sb-pdf">PDF</span>extratos-setembro.pdf</p>' +
    '</div>';

  // ===== Partes 5 a 7: o WhatsApp, os Loops e a conversa =====
  var ONDA = [5, 9, 14, 8, 17, 11, 6, 13, 18, 10, 7, 15, 12, 6, 9, 16, 11, 7, 13, 8, 5, 10, 14, 7];
  var cena5 =
    '<section class="sb-cena" data-c="4">' +
      '<div class="sb-topo"><p class="sb-titulo">Hoje</p></div>' +
      '<p class="sb-grupo">Pedido pelo WhatsApp</p>' +
      '<div class="sb-apres">' +
        '<div class="sb-slide"><i class="sb-sl-barra"></i><i class="sb-sl-l1"></i><i class="sb-sl-l2"></i>' +
          '<span class="sb-sl-col"><i style="height:46%"></i><i style="height:70%"></i></span><span class="sb-sl-col"><i style="height:62%"></i><i style="height:38%"></i></span>' +
          '<span class="sb-sl-prog"><i></i></span></div>' +
        '<p class="sb-apres-t">Apresentação dos dois regimes</p>' +
        '<p class="sb-apres-s">Padaria Bom Grão · 9 slides</p>' +
        '<p class="sb-troca sb-apres-st"><span><i class="sb-pulso"></i>em preparo</span><span>' + VISTO + 'pronta para revisar</span></p>' +
      '</div>' +
    '</section>';
  var flut5 =
    '<div class="sb-flut sb-cel" data-c="4">' +
      '<div class="sb-cel-tela">' +
        '<p class="sb-cel-status"><span class="sb-troca sb-cel-hora"><span>12:41</span><span>15:52</span></span><i class="sb-cel-ilha"></i><span class="sb-cel-ics"><i></i><i></i><i></i></span></p>' +
        '<div class="sb-wa-cab"><svg viewBox="0 0 10 16" aria-hidden="true"><path d="M8 2 2 8l6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="sb-wa-av">' + LACO + '</span><span><b>Plexus</b><small>online</small></span></div>' +
        '<div class="sb-wa-chat"><div class="sb-wa-fio">' +
          '<p class="sb-wa-dia">Hoje</p>' +
          '<div class="sb-wa-msg sb-wa-eu sb-wa-audio"><svg class="sb-wa-play" viewBox="0 0 12 14" aria-hidden="true"><path d="M1.5 1.2v11.6L11 7z" fill="currentColor"/></svg><span class="sb-wa-onda">' +
            ONDA.map(function (h) { return '<i style="height:' + h + 'px"></i>'; }).join('') + '</span><span class="sb-wa-pe"><span>0:48</span><span>12:41 <svg viewBox="0 0 18 11" aria-hidden="true"><path d="M1 6l3 3 6-7M7 8l1 1 6-7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span></div>' +
          '<div class="sb-wa-par"><div class="sb-wa-msg sb-wa-ele sb-wa-digit"><i></i><i></i><i></i></div>' +
            '<div class="sb-wa-msg sb-wa-ele sb-wa-r1">Anotei. A apresentação dos dois regimes para a Padaria Bom Grão fica pronta para você revisar até as 16h.<small>12:42</small></div></div>' +
          '<div class="sb-wa-msg sb-wa-ele sb-wa-r2">Pronta, no Plexus, para você revisar.<small>15:52</small></div>' +
        '</div></div>' +
        '<div class="sb-wa-barra"><span class="sb-wa-campo"><span class="sb-wa-ph">Mensagem</span><span class="sb-wa-grava"><i></i><b class="sb-wa-tempo">0:00</b></span></span><span class="sb-wa-mic"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" fill="currentColor"/><path d="M3 8a5 5 0 0 0 10 0M8 13v2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span></div>' +
      '</div>' +
    '</div>';

  var loop = function (cls, titulo, sub) {
    return '<li class="' + cls + '"><span class="sb-ladrilho sb-l-ic">' + ic('i-loops') + '</span><span class="sb-nome">' + titulo + '<small>' + sub + '</small></span></li>';
  };
  var cena6 =
    '<section class="sb-cena" data-c="5">' +
      '<div class="sb-topo"><p class="sb-titulo">Loops</p></div>' +
      '<p class="sb-sub">O que se repete roda sozinho e volta para você aprovar.</p>' +
      '<ul class="sb-loops">' +
        loop('sb-l-alv', 'Resumo do mês da Construtora Alvorada', '<span class="sb-troca"><span>toda segunda · preparando</span><span>toda segunda · pronto para aprovar</span></span>') +
        loop('sb-l-novo', 'Resumo do mês da Padaria Bom Grão', 'toda segunda · a primeira em 19/10') +
      '</ul>' +
    '</section>';
  var flut6 =
    '<div class="sb-flut sb-c6" data-c="5">' +
      '<p class="sb-de">' + LACO + '<span>O Plexus percebeu</span></p>' +
      '<p class="sb-cartao-t">Você manda o resumo do mês da Padaria Bom Grão toda segunda. Quer que eu deixe pronto?</p>' +
      '<div class="sb-acoes"><span class="sb-b">Agora não</span><span class="sb-b um sb-criar">Criar o Loop</span></div>' +
    '</div>' +
    '<div class="sb-flut sb-c6b" data-c="5">' +
      '<p class="sb-de">' + ic('i-loops') + '<span>Resumo do mês, Construtora Alvorada</span></p>' +
      '<p class="sb-c6b-t">Setembro fechado, com as notas conferidas e nenhuma pendência com o banco.</p>' +
      '<p class="sb-aprendeu">' + VISTO + 'Com a sua correção de 06/10, os impostos vêm primeiro.</p>' +
      '<div class="sb-acoes"><span class="sb-b">Corrigir</span><span class="sb-b um">Aprovar</span></div>' +
    '</div>';

  var PERGUNTA = 'O que falta para fechar setembro da Padaria Bom Grão?';
  var cena7 =
    '<section class="sb-cena sb-chat" data-c="6">' +
      '<div class="sb-topo"><p class="sb-titulo">Conversas</p></div>' +
      '<p class="sb-perg">' + PERGUNTA + '</p>' +
      '<div class="sb-resp">' +
        '<p class="sb-resp-cab"><span class="sb-selo-laco">' + LACO + '</span><span class="sb-lendo"><i></i><i></i><i></i></span></p>' +
        '<p class="sb-resp-t">' + palavras('Os extratos de setembro chegaram hoje, às 10:14. Falta a conciliação, e depois a guia do dia 20.') + '</p>' +
        '<p class="sb-resp-or">' + origem('gmail', 'Gmail, 10:14') + origem('meet', 'a reunião de 06/10') + '</p>' +
      '</div>' +
      '<p class="sb-caixa sb-chat-caixa"><span class="sb-digita"></span><i class="sb-caret"></i><span class="sb-caixa-vazia">Pergunte sobre o seu trabalho</span><span class="sb-enviar"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span></p>' +
    '</section>';
  var flut7 =
    '<div class="sb-flut sb-c7" data-c="6">' +
      '<div class="sb-cab"><span class="sb-selo-laco">' + LACO + '</span><span><b>O mesmo contexto no seu assistente</b><small>sem explicar tudo de novo para a IA</small></span></div>' +
      '<ul class="sb-ias"><li><span>Claude</span><span class="sb-vivo"><i></i>conectado</span></li><li><span>ChatGPT</span><span class="sb-vivo"><i></i>conectado</span></li></ul>' +
    '</div>';

  var html =
    '<div class="sb">' +
      '<div class="sb-mesa">' +
        '<div class="sb-janela">' +
          '<div class="sb-cromo"><i></i><i></i><i></i></div>' +
          '<div class="sb-corpo">' +
            '<div class="sb-lado">' +
              '<p class="sb-marca">' + LACO + '<span>Plexus</span></p>' +
              '<ul class="sb-nav">' +
                '<li data-n="hoje">' + ic('i-hoje') + '<span>Hoje</span><b class="sb-conta">1</b></li>' +
                '<li data-n="tarefas">' + ic('i-tarefas') + '<span>Tarefas</span></li>' +
                '<li data-n="loops">' + ic('i-loops') + '<span>Loops</span></li>' +
                '<li data-n="conexoes">' + ic('i-conexoes') + '<span>Conexões</span></li>' +
                '<li data-n="conversas">' + ic('i-chat') + '<span>Conversas</span></li>' +
              '</ul>' +
            '</div>' +
            '<div class="sb-main">' + cena1 + cena2 + cena3 + cena4 + cena5 + cena6 + cena7 + '</div>' +
          '</div>' +
          '<div class="sb-veu"></div>' +
        '</div>' +
        flut1 + flut2 + flut3 + flut4 + flut5 + flut6 + flut7 +
        '<div class="sb-cursor">' + CURSOR + '</div>' +
      '</div>' +
    '</div>';

  palco.innerHTML = html;

  // ===== as ferramentas do desenho =====
  var raiz = palco.querySelector('.sb');
  var mesa = raiz.querySelector('.sb-mesa');
  var q = function (s, el) { return (el || raiz).querySelector(s); };
  var qa = function (s, el) { return [].slice.call((el || raiz).querySelectorAll(s)); };
  var seg = function (t, a, b) { return t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a); };
  var sai = function (x) { return 1 - Math.pow(1 - x, 3); };
  var mistura = function (a, b, x) { return a + (b - a) * x; };
  var liga = function (el, c, on) { if (el.classList.contains(c) !== !!on) el.classList.toggle(c, !!on); };
  var texto = function (el, s) { if (el.textContent !== s) el.textContent = s; };
  // a posição que anda com o rolar; para quem pede menos movimento, só aparece ou some, no lugar final
  var poe = function (el, x, y, s, o) {
    if (menos.matches) { x = 0; y = 0; s = 1; o = o >= 0.5 ? 1 : 0; }
    var k = x.toFixed(1) + ',' + y.toFixed(1) + ',' + s.toFixed(3) + ',' + o.toFixed(3);
    if (el._sb === k) return;
    el._sb = k;
    el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)' + (s !== 1 ? ' scale(' + s.toFixed(3) + ')' : '');
    el.style.opacity = o.toFixed(3);
  };
  // onde fica um elemento dentro da mesa, no tamanho de desenho (o palco é escalado por transform, que não mexe aqui)
  var lugar = function (el) {
    var x = 0, y = 0;
    while (el && el !== mesa) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    return { x: x, y: y };
  };

  var janela = q('.sb-janela');
  var veu = q('.sb-veu');
  var cursor = q('.sb-cursor');
  var navs = qa('.sb-nav li');
  var cenas = qa('.sb-cena');
  var fluts = qa('.sb-flut');
  var NAV = ['conexoes', '', 'hoje', 'tarefas', 'hoje', 'loops', 'conversas'];

  // ===== Parte 1: Conexões =====
  var p1 = {
    linhas: qa('.sb-portas li'),
    placar: q('.sb-placar'),
    placarN: q('.sb-placar-n'),
    dia: q('.sb-dia'),
    leituras: qa('.sb-leituras li'),
    barras: qa('.sb-barra i'),
    apaga: q('.sb-dia .sb-apaga'),
    ns: qa('.sb-dia .sb-n'),
    papeis: qa('.sb-papeis span'),
    nada: q('.sb-nada'),
    c1: q('.sb-c1'),
    conta: q('.sb-conta'),
    alvos: null
  };
  // cada porta tem a sua janela de rolar: o ponteiro chega, aperta, e ela fica ao vivo
  var P1_INI = 0.03, P1_PASSO = 0.068;
  var medir1 = function () {
    p1.alvos = p1.linhas.map(function (li) {
      var b = li.querySelector('.sb-conectar');
      var l = lugar(b);
      return { x: l.x + b.offsetWidth * 0.55, y: l.y + b.offsetHeight * 0.55 };
    });
  };
  var parte1 = function (t) {
    if (!p1.alvos) medir1();
    var vivas = 0;
    var cx = 0, cy = 0, aperta = false;
    p1.linhas.forEach(function (li, k) {
      var a = P1_INI + k * P1_PASSO;
      var x = seg(t, a, a + P1_PASSO);
      var viva = x >= 0.72;
      if (viva) vivas++;
      liga(li, 'vivo', viva);
      liga(li, 'aperta', x >= 0.5 && x < 0.72);
      liga(li, 'acende', viva && x < 1 + (k === 6 ? 0.6 : 0));
    });
    // o ponteiro: vem de fora, desce de botão em botão e sai depois da última porta
    var fim = P1_INI + 7 * P1_PASSO;
    var al = p1.alvos;
    if (t < P1_INI + P1_PASSO * 0.45) {
      var e = sai(seg(t, 0, P1_INI + P1_PASSO * 0.45));
      cx = mistura(al[0].x + 34, al[0].x, e); cy = mistura(al[0].y + 30, al[0].y, e);
    } else {
      var k = Math.min(6, Math.floor((t - P1_INI) / P1_PASSO));
      var dentro = seg(t, P1_INI + k * P1_PASSO, P1_INI + (k + 1) * P1_PASSO);
      if (k >= 6 && dentro >= 1) {
        var s = sai(seg(t, fim, fim + 0.06));
        cx = al[6].x + s * 40; cy = al[6].y + s * 36;
      } else if (dentro < 0.45 && k > 0) {
        var m = sai(dentro / 0.45);
        cx = mistura(al[k - 1].x, al[k].x, m); cy = mistura(al[k - 1].y, al[k].y, m);
      } else {
        cx = al[k].x; cy = al[k].y;
      }
      aperta = dentro >= 0.5 && dentro < 0.72;
    }
    poe(cursor, cx, cy, 1, menos.matches ? 0 : 1 - seg(t, fim, fim + 0.05));
    liga(cursor, 'aperta', aperta);
    texto(p1.placarN, String(vivas));
    liga(p1.placar, 'on', vivas > 0);

    // o primeiro dia sobe por cima da janela, lê as três coisas, e recua quando o primeiro cartão chega
    var dEnt = sai(seg(t, 0.5, 0.6));
    var cEnt = sai(seg(t, 0.79, 0.86));
    poe(p1.dia, 0, (1 - dEnt) * 56 + cEnt * 6, 1 - cEnt * 0.03, dEnt);
    poe(p1.apaga, 0, 0, 1, cEnt);
    var marcos = [0.55, 0.61, 0.67, 0.73];
    p1.leituras.forEach(function (li, k) {
      var x = seg(t, marcos[k], marcos[k + 1]);
      liga(li, 'lendo', x > 0 && x < 1);
      liga(li, 'lido', x >= 1);
      var b = p1.barras[k];
      var k2 = x.toFixed(3);
      if (b._sb !== k2) { b._sb = k2; b.style.transform = 'scaleX(' + k2 + ')'; }
    });
    var cresce = sai(seg(t, 0.57, 0.76));
    p1.ns.forEach(function (n) { texto(n, String(Math.round(cresce * Number(n.dataset.max)))); });
    p1.papeis.forEach(function (sp, k) { liga(sp, 'on', t >= 0.64 + k * 0.025); });
    liga(p1.nada, 'on', t >= 0.75);
    liga(p1.dia, 'pronto', t >= 0.75);

    // a janela recua um pouco enquanto os painéis estão por cima
    var recua = sai(seg(t, 0.5, 0.62));
    poe(janela, 0, -recua * 4, 1 - recua * 0.012, 1);
    poe(veu, 0, 0, 1, recua);

    // o primeiro cartão desce por cima de tudo
    poe(p1.c1, 0, (1 - cEnt) * -22, 0.97 + cEnt * 0.03, cEnt);
    liga(p1.conta, 'on', t >= 0.82);
  };


  // ===== Parte 2: o que se sabe do Sérgio, cada frase com a origem =====
  var p2 = { fatos: qa('.sb-fatos li'), painel: q('.sb-fontes'), fontes: qa('.sb-fonte'), marcas: qa('.sb-fontes mark') };
  var parte2 = function (t) {
    var ent = sai(seg(t, 0, 0.08));
    poe(p2.painel, (1 - ent) * 24, (1 - ent) * -10, 1, ent);
    var qual = t < 0.24 ? 0 : t < 0.46 ? 1 : 2;
    p2.fontes.forEach(function (f, k) { liga(f, 'on', k === qual); });
    var marca = [0.07, 0.29, 0.51, 0.64];
    p2.marcas.forEach(function (m, k) { liga(m, 'on', t >= marca[k]); });
    var chega = [0.12, 0.34, 0.56, 0.7];
    var ultimo = -1;
    p2.fatos.forEach(function (li, k) { var on = t >= chega[k]; liga(li, 'on', on); if (on) ultimo = k; });
    p2.fatos.forEach(function (li, k) { liga(li, 'novo', k === ultimo && t < chega[k] + 0.2); });
  };

  // ===== Parte 3: o cartão com as opções e a resposta pronta; e o que falta, pedido =====
  var p3 = {
    rec: q('.sb-op-rec'), op2: q('.sb-op-2'), pals: qa('.sb-c3 .sb-pal'), resp: q('.sb-resposta'),
    b: q('.sb-c3b'), digita: q('.sb-c3b .sb-digita'), caixa: q('.sb-c3b .sb-caixa')
  };
  var RESPOSTA_RENATA = 'Sim, foi registrado em 02/10.';
  var parte3 = function (t) {
    liga(p3.rec, 'on', t >= 0.04);
    liga(p3.op2, 'on', t >= 0.1);
    liga(p3.rec, 'marcada', t >= 0.2);
    liga(p3.resp, 'on', t >= 0.24);
    var n = Math.round(seg(t, 0.26, 0.46) * p3.pals.length);
    p3.pals.forEach(function (w, k) { liga(w, 'on', k < n); });
    var ent = sai(seg(t, 0.5, 0.62));
    poe(p3.b, 0, (1 - ent) * 40, 1, ent);
    var c = Math.round(seg(t, 0.66, 0.88) * RESPOSTA_RENATA.length);
    texto(p3.digita, RESPOSTA_RENATA.slice(0, c));
    liga(p3.caixa, 'cheia', c > 0);
    liga(p3.caixa, 'digitando', c > 0 && c < RESPOSTA_RENATA.length);
    liga(p3.caixa, 'pronta', c >= RESPOSTA_RENATA.length);
  };

  // ===== Parte 4: a tarefa de espera fecha quando a entrega chega =====
  var p4 = { painel: q('.sb-chega'), alvo: q('.sb-t-alvo'), prox: q('.sb-t-prox'), chegou: q('.sb-chegou'), destino: null };
  var parte4 = function (t) {
    if (!p4.destino) {
      var a = lugar(p4.alvo), b = lugar(p4.painel);
      p4.destino = { x: a.x + 40 - b.x, y: a.y + 10 - b.y };
    }
    var ent = sai(seg(t, 0.06, 0.18));
    var vai = seg(t, 0.36, 0.5);
    var v = vai * vai * (3 - 2 * vai);
    var x = (1 - ent) * 30 + v * p4.destino.x;
    var y = (1 - ent) * -8 + v * p4.destino.y;
    poe(p4.painel, x, y, 1 - v * 0.55, ent * (1 - seg(t, 0.44, 0.5)));
    liga(p4.alvo, 'recebe', t >= 0.47 && t < 0.62);
    liga(p4.chegou, 'on', t >= 0.48);
    liga(p4.alvo, 'feita', t >= 0.6);
    liga(p4.prox, 'solta', t >= 0.72);
  };

  // ===== Parte 5: o celular entra, o áudio sai, e a apresentação fica pronta na janela =====
  var p5 = {
    cel: q('.sb-cel'), audio: q('.sb-wa-audio'), digit: q('.sb-wa-digit'), r1: q('.sb-wa-r1'), r2: q('.sb-wa-r2'),
    barra: q('.sb-wa-barra'), tempo: q('.sb-wa-tempo'), hora: q('.sb-cel-hora'),
    apres: q('.sb-apres'), prog: q('.sb-sl-prog i'), st: q('.sb-apres-st'),
    fio: q('.sb-wa-fio'), dia: q('.sb-wa-dia'), par: q('.sb-wa-par'), fundos: null
  };
  // a conversa fica presa embaixo, como no WhatsApp: cada mensagem nova empurra as outras para cima
  var medir5 = function () {
    var f = function (el, h) { return el.offsetTop + (h === undefined ? el.offsetHeight : h); };
    p5.fundos = {
      total: p5.fio.offsetHeight, dia: f(p5.dia), audio: f(p5.audio),
      digit: f(p5.par, p5.digit.offsetHeight), r1: f(p5.par, p5.r1.offsetHeight), r2: f(p5.r2)
    };
  };
  var parte5 = function (t) {
    var ent = sai(seg(t, 0, 0.16));
    poe(p5.cel, (1 - ent) * 300, (1 - ent) * 18, 1, ent);
    var g = seg(t, 0.2, 0.36);
    liga(p5.barra, 'gravando', g > 0 && g < 1);
    var seg48 = Math.round(g * 48);
    texto(p5.tempo, '0:' + (seg48 < 10 ? '0' : '') + seg48);
    liga(p5.audio, 'on', t >= 0.37);
    liga(p5.digit, 'on', t >= 0.42 && t < 0.5);
    liga(p5.r1, 'on', t >= 0.5);
    liga(p5.apres, 'on', t >= 0.52);
    var pr = seg(t, 0.54, 0.74);
    var k = pr.toFixed(3);
    if (p5.prog._sb !== k) { p5.prog._sb = k; p5.prog.style.transform = 'scaleX(' + k + ')'; }
    liga(p5.apres, 'pronta', t >= 0.75);
    liga(p5.st, 'solta', t >= 0.75);
    liga(p5.hora, 'solta', t >= 0.75);
    liga(p5.r2, 'on', t >= 0.78);
    if (!p5.fundos) medir5();
    var fu = p5.fundos;
    var ult = t >= 0.78 ? fu.r2 : t >= 0.5 ? fu.r1 : t >= 0.42 ? fu.digit : t >= 0.37 ? fu.audio : fu.dia;
    var desce = Math.round(fu.total - ult);
    if (p5.fio._sb !== desce) { p5.fio._sb = desce; p5.fio.style.transform = 'translateY(' + desce + 'px)'; }
  };

  // ===== Parte 6: o Plexus propõe o Loop, a pessoa cria, e o resumo chega pronto =====
  var p6 = { c: q('.sb-c6'), criar: q('.sb-criar'), novo: q('.sb-l-novo'), alv: q('.sb-l-alv'), b: q('.sb-c6b'), alvo: null };
  var parte6 = function (t) {
    if (!p6.alvo) {
      var a = lugar(p6.criar), c = lugar(p6.c), n = lugar(p6.novo);
      p6.alvo = { x: a.x + p6.criar.offsetWidth * 0.5, y: a.y + p6.criar.offsetHeight * 0.55, dx: n.x - c.x, dy: n.y - c.y };
    }
    var ent = sai(seg(t, 0, 0.08));
    var vai = seg(t, 0.44, 0.56);
    var v = vai * vai * (3 - 2 * vai);
    poe(p6.c, v * p6.alvo.dx * 0.4, (1 - ent) * 24 + v * p6.alvo.dy * 0.5, 1 - v * 0.18, ent * (1 - v));
    var m = sai(seg(t, 0.16, 0.34));
    var cx = mistura(p6.alvo.x + 120, p6.alvo.x, m), cy = mistura(p6.alvo.y + 90, p6.alvo.y, m);
    poe(cursor, cx, cy, 1, menos.matches ? 0 : seg(t, 0.12, 0.18) * (1 - seg(t, 0.46, 0.52)));
    var aperta = t >= 0.36 && t < 0.44;
    liga(cursor, 'aperta', aperta);
    liga(p6.criar, 'aperta', aperta);
    liga(p6.novo, 'on', t >= 0.52);
    liga(p6.novo, 'novo', t >= 0.52 && t < 0.8);
    liga(p6.alv, 'solta', t >= 0.66);
    var b = sai(seg(t, 0.7, 0.82));
    poe(p6.b, 0, (1 - b) * 40, 1, b);
  };

  // ===== Parte 7: a pergunta, a resposta com a origem, e o mesmo contexto lá fora =====
  var p7 = {
    caixa: q('.sb-chat-caixa'), digita: q('.sb-chat-caixa .sb-digita'), perg: q('.sb-perg'), resp: q('.sb-resp'),
    lendo: q('.sb-lendo'), pals: qa('.sb-resp-t .sb-pal'), or: q('.sb-resp-or'), c: q('.sb-c7')
  };
  var parte7 = function (t) {
    var c = Math.round(seg(t, 0.03, 0.2) * PERGUNTA.length);
    var enviada = t >= 0.23;
    texto(p7.digita, enviada ? '' : PERGUNTA.slice(0, c));
    liga(p7.caixa, 'cheia', !enviada && c > 0);
    liga(p7.caixa, 'digitando', !enviada && c > 0 && c < PERGUNTA.length);
    liga(p7.caixa, 'pronta', !enviada && c >= PERGUNTA.length);
    liga(p7.perg, 'on', enviada);
    liga(p7.resp, 'on', t >= 0.26);
    liga(p7.lendo, 'on', t >= 0.26 && t < 0.34);
    var n = Math.round(seg(t, 0.34, 0.54) * p7.pals.length);
    p7.pals.forEach(function (w, k) { liga(w, 'on', k < n); });
    liga(p7.or, 'on', t >= 0.56);
    var e = sai(seg(t, 0.62, 0.76));
    poe(p7.c, 0, (1 - e) * 40, 1, e);
    poe(p7.caixa, 0, e * 10, 1, 1 - e);
  };

  var partes = [parte1, parte2, parte3, parte4, parte5, parte6, parte7];

  // ===== a troca de parte =====
  var atual = -1;
  // o que sai de cena some no lugar onde está, sem voltar ao ponto de partida
  var apaga = function (el) { if (el.style.opacity !== '0') { el.style.opacity = '0'; el._sb = ''; } };
  var trocar = function (i) {
    cenas.forEach(function (c) { liga(c, 'on', Number(c.dataset.c) === i); });
    navs.forEach(function (li) { liga(li, 'on', li.dataset.n === NAV[i]); });
    fluts.forEach(function (f) { if (Number(f.dataset.c) !== i) apaga(f); });
    if (i !== 0 && i !== 5) apaga(cursor);
    if (i !== 0) { liga(p1.conta, 'on', true); poe(janela, 0, 0, 1, 1); poe(veu, 0, 0, 1, 0); }
    atual = i;
  };
  var desenhar = function (s) {
    if (!s) return;
    var i = Math.max(0, Math.min(6, s.i | 0));
    var t = Math.max(0, Math.min(1, +s.t || 0));
    if (i !== atual) trocar(i);
    if (partes[i]) partes[i](t);
  };
  sec.addEventListener('sol:passo', function (e) { desenhar(e.detail); });
  var refazer = function () { p1.alvos = null; p4.destino = null; p6.alvo = null; p5.fundos = null; var s = sec.solEstado; atual = -1; desenhar(s || { i: 0, t: 0 }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refazer);
  if (menos.addEventListener) menos.addEventListener('change', function () { qa('[style]', raiz).forEach(function (el) { el._sb = ''; }); refazer(); });
  desenhar(sec.solEstado || { i: 0, t: 0 });
})();
