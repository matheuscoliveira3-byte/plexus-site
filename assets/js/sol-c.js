// Como o Plexus funciona, a arte C (13/10/2026): o mapa em volta do laço. Continua a peça da dor (os aplicativos
// entram no Plexus): o laço no centro de um palco de papel, e a cada parte o que nasce em volta dele. O estado de
// cada coisa é função da parte (i) e do quanto se andou nela (t), nunca do relógio: quem sobe a página vê tudo
// voltar. O relógio só move o que é enfeite contínuo (o pulso nas linhas, o halo do centro e os três pontinhos da
// resposta), e some para quem pede menos movimento. No celular o palco fica pequeno: as letras crescem, os selos
// ficam poucos, e o papel se alonga para cima e para baixo, no espaço que sobra na tela (o fator k), sem passar da
// arte nem cobrir o texto.
(function () {
  var sec = document.getElementById('solucao');
  if (!sec || sec.dataset.op !== 'c') return;
  var palco = sec.querySelector('.sol-palco');
  var arte = sec.querySelector('.sol-arte');
  if (!palco || !arte) return;
  var celular = window.matchMedia('(max-width: 900px)');

  // ===== as contas do rolar =====
  var lim = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var faixa = function (t, a, b) { return lim((t - a) / (b - a)); };
  var sai = function (x) { return 1 - (1 - x) * (1 - x) * (1 - x); };
  var suave = function (x) { return x * x * (3 - 2 * x); };
  var mix = function (a, b, x) { return a + (b - a) * x; };
  var r1 = function (v) { return Math.round(v * 10) / 10; };
  var r3 = function (v) { return Math.round(v * 1000) / 1000; };
  // um pico que sobe e desce em volta de c (para o centro respirar quando algo chega ou sai dele)
  var pico = function (t, c, w) { return lim(1 - Math.abs(t - c) / w); };

  var logo = function (n) { return '<img src="/assets/img/fontes/' + n + (n.indexOf('.') < 0 ? '.svg' : '') + '" alt="">'; };
  var LACO = '<svg viewBox="0 0 514 540" aria-hidden="true"><use href="#marca"/></svg>';
  var VISTO = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.6 6.3l2.3 2.2 4.6-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var RELOGIO = '<svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M6 3.6V6l1.6 1" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';

  // ===== o que se mostra (x e y em pixels do desenho, a partir do centro do papel) =====
  // d é o desenho largo (640 por 560); c o do celular, desenhado para o papel alongado de k = 1,6 (640 por 896).
  // A parte 1: os oito aplicativos em volta do centro, na ordem do texto da esquerda (o e-mail, a agenda, os
  // arquivos e as reuniões, que o gravador do Plexus grava no Meet, no Teams e no Zoom; o WhatsApp saiu em 19/10), no sentido do
  // relógio, com um vão em cima (para a equipe) e outro embaixo (para a frase do fim).
  var APPS = [
    { n: 'gmail', d: [-92, -202], c: [-88, -272], b: [-115, -260] },
    { n: 'outlook', d: [88, -200], c: [88, -272], b: [115, -260] },
    { n: 'agenda', d: [218, -118], c: [216, -159], b: [280, -162] },
    { n: 'drive', d: [262, 10], c: [258, 17], b: [334, -11] },
    { n: 'onedrive', d: [202, 140], c: [198, 186], b: [257, 136] },
    // 19/10/2026, 09:37, a decisão dele: o WhatsApp sai do mapa das fontes (fica só na parte 6, a conversa com o Plexus);
    // o Meet e o Teams descem um pouco para o lado esquerdo continuar equilibrado sem ele
    { n: 'meet', d: [-214, 118], c: [-210, 160], b: [-275, 118] },
    { n: 'teams', d: [-262, -24], c: [-256, -32], b: [-332, -44] },
    { n: 'zoom.png', d: [-192, -146], c: [-190, -196], b: [-247, -194] }
  ];
  // o mapa do primeiro dia: quem é quem (no celular, só três; no celular baixo, dois)
  var SELOS = [
    { l: 'S', a: 'Sérgio', b: 'cliente', d: [-140, -76], c: [-95, -110], bx: [-155, -115] },
    { l: 'R', a: 'Renata', b: 'cliente', d: [132, -48], c: [155, -82], bx: [160, -83] },
    { l: 'M', a: 'Marcos', b: 'sócio', d: [-128, 92], c: [-100, 104], bx: null },
    { l: 'B', a: 'Banco', b: 'fornecedor', d: [136, 96], c: null, bx: null },
    { l: 'E', a: 'Equipe', b: '', d: [0, -142], c: null, bx: null }
  ];
  var NADA = { d: [0, 200], c: [0, 330], b: [0, 262] };

  // A parte 2: o que se sabe do Sérgio, cada coisa com o selo de onde veio
  var QUEM = { d: [0, 98], c: [0, -196], b: [0, -165] };
  var FATOS = [
    { t: 'O jurídico dele ainda revisa o contrato', n: 'outlook', h: 'ontem, 18:20', d: [-178, -150], c: [-44, -50], b: [-70, -25] },
    { t: 'Ele promete mandar o contrato assinado até quinta', n: 'gmail', h: 'hoje, 08:42', d: [178, -138], c: [44, 118], b: [70, 150] },
    { t: 'O início fica para o dia 20', n: 'meet', h: 'reunião de 02/10', d: [-174, 176], c: [-44, 286], b: null },
    { t: 'Mandou a planilha do trimestre', n: 'drive', h: '30/09, 16:05', d: [178, 182], c: null, b: null }
  ];
  // A parte 3: o cartão. A parte 4: a tarefa de espera e o que a fecha.
  var CARTAO = { d: [0, 58], c: [0, 40], b: [0, 75] };
  var TAREFA = { d: [0, 18], c: [0, 20], b: [0, 20] };
  // A parte 5, as entregas: o pedido chega ao centro, o contexto é puxado, e os slides se juntam no cartão
  var PEDIDO = { d: [-130, -196], c: [0, -372], b: [0, -292] };
  var CONTEXTO = [
    { n: 'gmail', t: 'e-mail do Sérgio', d: [-210, 130], c: [-140, -250], b: [-160, -190] },
    { n: 'drive', t: 'planilha do trimestre', d: [-80, 186], c: [-140, -168], b: [-160, -115] }
  ];
  var ENTREGA = { d: [162, 0], c: [0, 190], b: [0, 145] };
  // A parte 6, o Plexus no WhatsApp: a conversa com o contato Plexus, que cresce de cima para baixo
  var ZAP = { d: [98, 0], c: [0, 60], b: [0, 45] };
  // A parte 7: a volta em torno do centro e o que sai a cada volta
  var RAIO = { d: 92, c: 128 };
  var PILHA = { d: [128, [-106, -10, 86]], c: [0, [40, 186, 332]], b: [0, [0, 120, 240]] };
  var TODA = { b: [250, -300] };  // no celular baixo, «toda segunda» fica ao lado da volta, e não em cima
  // A parte 8: a pergunta, a resposta com a origem, e o mesmo contexto nos assistentes que a pessoa já usa
  var PERGUNTA = { d: [84, -56], c: [70, -96], b: [100, -92] };
  var DIGITA = { d: [-170, 16], c: [-160, 30], b: [-210, 10] };
  var RESPOSTA = { d: [-34, 72], c: [-10, 170], b: [-20, 150] };
  var IAS = [
    { n: 'claude', d: [-206, -212], c: [-215, -390], b: [-280, -275] },
    { n: 'chatgpt', d: [-206, -122], c: [-215, -272], b: [-180, -190] },
    { n: 'gemini', d: [206, -212], c: [215, -390], b: [280, -275] },
    { n: 'grok', d: [206, -122], c: [215, -272], b: [180, -190] }
  ];
  var MESMO = { d: [0, -236], c: [0, -232], b: [0, -178] };

  // onde fica o centro em cada parte (x, y, escala); entre uma parte e a outra ele desliza no começo da nova
  var CENTRO = {
    d: [[0, 0, 1], [0, 0, 0.92], [0, -178, 0.78], [0, -178, 0.78], [-150, -16, 0.9], [-214, -4, 0.9], [-186, -6, 0.9], [0, -168, 0.8]],
    c: [[0, 0, 1], [0, -320, 0.9], [0, -330, 0.85], [0, -330, 0.85], [150, -215, 0.85], [0, -385, 0.75], [0, -200, 0.95], [0, -330, 0.85]],
    b: [[0, -25, 1], [0, -275, 0.9], [0, -285, 0.85], [0, -285, 0.85], [170, -160, 0.85], [0, -305, 0.7], [0, -205, 0.95], [0, -260, 0.85]]
  };

  // ===== a montagem =====
  var fio = function (cls, k) { return '<path class="' + cls + '" pathLength="1"' + (k !== undefined ? ' style="animation-delay:' + (-k * 0.53).toFixed(2) + 's"' : '') + '/>'; };
  var selo = function (l, a, b, cls) {
    return '<span class="sc-selo sc-m' + (cls ? ' ' + cls : '') + '"><span class="sc-av">' + l + '</span><span class="sc-st">' + a +
      (b ? '<span class="sc-pp"><span class="sc-vg">, </span>' + b + '</span>' : '') + '</span></span>';
  };
  // os slides em miniatura que se juntam no cartão da entrega (o último, o dos dois cenários, fica por cima)
  var MINIS = [
    '<i class="sc-sl-t" style="width:70%;height:10px"></i><i class="sc-sl-t" style="width:42%"></i><i class="sc-sl-m"></i>',
    '<i class="sc-sl-t"></i><i class="sc-sl-l"></i><i class="sc-sl-l"></i><i class="sc-sl-l" style="width:52%"></i>',
    '<i class="sc-sl-t"></i><i class="sc-sl-g"></i>',
    '<i class="sc-sl-t"></i><i class="sc-sl-n"></i><i class="sc-sl-l" style="width:60%"></i>',
    '<i class="sc-sl-t"></i><span class="sc-sl-2"><i class="sc-sl-l"></i><i class="sc-sl-l"></i></span>',
    '<i class="sc-sl-t"></i><span class="sc-sl-c"><i style="height:62%"></i><i style="height:84%"></i><i style="height:48%"></i></span><span class="sc-sl-c"><i style="height:40%"></i><i style="height:70%"></i><i style="height:92%"></i></span>'
  ].map(function (h, j) { return '<span class="sc-lamina sc-lamina-' + j + '">' + h + '</span>'; }).join('');
  var VISTOS = '<svg viewBox="0 0 16 12" aria-hidden="true"><path d="M1.5 6.5l2.6 2.4 5.4-6M6.6 8.4l.6.5 5.4-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ONDA = [6, 10, 16, 9, 20, 13, 24, 15, 10, 18, 26, 14, 9, 17, 22, 12, 8, 15, 20, 11, 7, 13, 9, 6].map(function (h) { return '<i style="height:' + h + 'px"></i>'; }).join('');
  // a seta em círculo da parte 6, desenhada uma vez: um arco de 300 graus com a ponta no sentido do relógio
  var roda = function (r) {
    var a0 = -78 * Math.PI / 180, a1 = 222 * Math.PI / 180;
    var x0 = r * Math.cos(a0), y0 = r * Math.sin(a0), x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
    var tx = -Math.sin(a1), ty = Math.cos(a1), nx = Math.cos(a1), ny = Math.sin(a1), w = r / 13, l = r / 8;
    var ponta = [x1 + tx * l, y1 + ty * l, x1 + nx * w, y1 + ny * w, x1 - nx * w, y1 - ny * w].map(r1);
    var m = r + 20;
    return '<svg class="sc-roda sc-m" viewBox="' + (-m) + ' ' + (-m) + ' ' + (2 * m) + ' ' + (2 * m) + '" style="width:' + 2 * m + 'px;height:' + 2 * m + 'px" aria-hidden="true">' +
      '<circle r="' + r + '" class="sc-roda-trilho"/>' +
      '<path class="sc-roda-arco" d="M' + r1(x0) + ' ' + r1(y0) + ' A' + r + ' ' + r + ' 0 1 1 ' + r1(x1) + ' ' + r1(y1) + '"/>' +
      '<path class="sc-roda-ponta" d="M' + ponta[0] + ' ' + ponta[1] + ' L' + ponta[2] + ' ' + ponta[3] + ' L' + ponta[4] + ' ' + ponta[5] + 'Z"/></svg>';
  };

  palco.innerHTML =
    '<div class="sc">' +
      '<div class="sc-papel"><div class="sc-brilho"></div></div>' +
      '<div class="sc-cena"><div class="sc-origem">' +
        // parte 1
        '<div class="sc-g sc-g1">' +
          '<svg class="sc-fios" aria-hidden="true">' + APPS.map(function (a, k) { return fio('sc-fio') + fio('sc-pulso', k); }).join('') + '</svg>' +
          APPS.map(function (a) { return '<span class="app sc-app sc-m">' + logo(a.n) + '<i class="sc-ok">' + VISTO + '</i></span>'; }).join('') +
          SELOS.map(function (s) { return selo(s.l, s.a, s.b); }).join('') +
          '<span class="sc-nada sc-m"><i>' + VISTO + '</i>Mapeado sozinho</span>' +
        '</div>' +
        // parte 2
        '<div class="sc-g sc-g2">' +
          '<svg class="sc-fios" aria-hidden="true">' + FATOS.map(function () { return fio('sc-fio'); }).join('') + '</svg>' +
          selo('S', 'Sérgio', 'Grupo Vértice', 'sc-quem') +
          FATOS.map(function (f) { return '<span class="sc-fato sc-m"><span class="sc-ft">' + f.t + '</span><span class="sc-fonte">' + logo(f.n) + f.h + '</span></span>'; }).join('') +
        '</div>' +
        // parte 3
        '<div class="sc-g sc-g3">' +
          '<svg class="sc-fios" aria-hidden="true">' + fio('sc-fio') + '</svg>' +
          '<div class="sc-cartao sc-m">' +
            '<p class="sc-de sc-ln">' + logo('gmail') + '<span>Sérgio, Grupo Vértice</span><span class="sc-hora">08:42</span></p>' +
            '<p class="sc-ct-t sc-ln">O Sérgio pede mais prazo para o contrato assinado. Aceito?</p>' +
            '<div class="sc-op sc-on sc-ln"><i class="sc-r"><i></i></i><span class="sc-ot">Aceitar até quinta<small>O início continua no dia 20.</small></span><em>recomendada</em></div>' +
            '<div class="sc-op sc-ln"><i class="sc-r"></i><span class="sc-ot">Pedir o contrato até amanhã</span></div>' +
            '<div class="sc-bt sc-ln"><span>Reprovar</span><span class="sc-pri">Aprovar<i class="sc-anel"></i></span></div>' +
          '</div>' +
        '</div>' +
        // parte 4
        '<div class="sc-g sc-g4">' +
          '<svg class="sc-fios" aria-hidden="true">' + fio('sc-fio') + '</svg>' +
          '<div class="sc-tarefa sc-m">' +
            '<span class="sc-cx"><i class="sc-cx-ok">' + VISTO + '</i></span>' +
            '<span class="sc-tt"><span class="sc-tn">Contrato assinado até quinta<i class="sc-risco"></i></span>' +
              '<span class="sc-tags"><span class="sc-tag sc-espera">' + RELOGIO + 'esperando o Sérgio</span><span class="sc-tag sc-fechada">' + VISTO + 'fechada</span></span></span>' +
            '<span class="sc-vaga"><i class="sc-vaga-b"></i><span class="sc-chega"><span class="app">' + logo('gmail') + '</span><span class="sc-ch-t">Chegou às 10:14</span><span class="sc-arq">contrato-assinado.pdf</span></span></span>' +
          '</div>' +
        '</div>' +
        // parte 5, as entregas
        '<div class="sc-g sc-g5">' +
          '<svg class="sc-fios" aria-hidden="true">' + fio('sc-fio sc-tracejado') + CONTEXTO.map(function () { return fio('sc-fio'); }).join('') +
            CONTEXTO.map(function (x, k) { return fio('sc-pulso', k * 2.5); }).join('') + '</svg>' +
          '<p class="sc-pedido sc-m">Monta a apresentação dos dois cenários de preço para o Grupo Vértice</p>' +
          CONTEXTO.map(function (x) { return '<span class="sc-chip sc-ctx sc-m">' + logo(x.n) + x.t + '</span>'; }).join('') +
          '<div class="sc-entrega sc-m"><span class="sc-deck"><i class="sc-deck-vaga"></i>' + MINIS + '</span>' +
            '<span class="sc-dt sc-en">Apresentação dos dois cenários</span>' +
            '<span class="sc-meta sc-en"><span>9 slides</span><span class="sc-tag sc-pronta">' + VISTO + 'pronta para revisar</span></span>' +
            '<span class="sc-bt sc-en"><span>Revisar</span><span class="sc-pri">Aprovar</span></span></div>' +
        '</div>' +
        // parte 6, o Plexus no WhatsApp
        '<div class="sc-g sc-g6">' +
          '<svg class="sc-fios" aria-hidden="true">' + fio('sc-fio') + '</svg>' +
          '<div class="sc-zap sc-m"><div class="sc-zap-topo"><span class="sc-zap-av">' + LACO + '</span><span class="sc-zap-nome">Plexus<small>online</small></span>' + logo('whatsapp') + '</div>' +
            '<div class="sc-zap-tela"><div class="sc-zap-lista">' +
              '<div class="sc-zm sc-ele"><p>Você tem 2 cartões para responder.<span class="sc-zh">10:02</span></p></div>' +
              '<div class="sc-zm sc-zbts"><span>Responder por aqui<i></i></span><span>Ir para o Plexus<i></i></span></div>' +
              '<div class="sc-zm sc-ele"><p>O Sérgio, do Grupo Vértice, pede mais prazo para o contrato assinado. Aceito?<small>A recomendada é aceitar até quinta.</small><span class="sc-zh">10:02</span></p></div>' +
              '<div class="sc-zm sc-zbts"><span>Aceitar até quinta<i></i></span><span>Pedir até amanhã<i></i></span></div>' +
              '<div class="sc-zm sc-eu"><p>Aceitar até quinta<span class="sc-zh">10:03' + VISTOS + '</span></p></div>' +
              '<div class="sc-zm sc-eu"><p class="sc-zaudio"><span class="sc-play"></span><span class="sc-onda"><span class="sc-onda-a">' + ONDA + '</span><span class="sc-onda-b">' + ONDA + '</span></span><span class="sc-zh">0:09</span></p></div>' +
              '<div class="sc-zm sc-ele"><p>Anotei. Criei a tarefa de cobrar a Renata na sexta.<span class="sc-zh">10:05</span></p></div>' +
            '</div></div></div>' +
        '</div>' +
        // parte 7, os loops
        '<div class="sc-g sc-g7">' +
          roda(RAIO.d) + roda(RAIO.c) +
          '<span class="sc-chip sc-toda sc-m">' + logo('agenda') + 'toda segunda</span>' +
          ['28/09', '05/10', '12/10'].map(function (d, j) {
            return '<div class="sc-resumo sc-m"><span class="sc-rs-i">' + LACO + '</span><span class="sc-rs-t">Relatório da semana, pronto para aprovar' +
              '<span class="sc-rs-s"><span class="sc-rs-d">segunda, ' + d + '</span>' + (j ? '<span class="sc-tag sc-pronta">com a sua correção</span>' : '') + '</span></span></div>';
          }).join('') +
        '</div>' +
        // parte 8, o chat
        '<div class="sc-g sc-g8">' +
          '<svg class="sc-fios" aria-hidden="true">' + IAS.map(function () { return fio('sc-fio'); }).join('') + IAS.map(function (a, k) { return fio('sc-pulso', k * 1.4); }).join('') + '</svg>' +
          '<p class="sc-pergunta sc-m">O que falta para começar com o Grupo Vértice?</p>' +
          '<p class="sc-digita sc-m"><i></i><i></i><i></i></p>' +
          '<div class="sc-resposta sc-m"><span class="sc-de"><span class="sc-mini">' + LACO + '</span>Plexus</span>' +
            '<span class="sc-rt">Falta conferir o contrato assinado do Sérgio, que chegou às 10:14. Com ele, o início fica no dia 20.</span>' +
            '<span class="sc-chip sc-origem-r">' + logo('gmail') + 'e-mail do Sérgio, 10:14</span></div>' +
          IAS.map(function (a) { return '<span class="app sc-ia sc-m">' + logo(a.n) + '</span>'; }).join('') +
          '<span class="sc-mesmo sc-m">o mesmo contexto</span>' +
        '</div>' +
        // o centro, por cima de tudo
        '<div class="sc-nucleo sc-m"><span class="sc-radares"><i></i><i></i></span><span class="sc-no">' + LACO + '</span></div>' +
      '</div></div>' +
    '</div>';

  var raiz = palco.querySelector('.sc');
  var um = function (s, d) { return (d || raiz).querySelector(s); };
  var todos = function (s, d) { return [].slice.call((d || raiz).querySelectorAll(s)); };
  var brilho = um('.sc-brilho');
  var nucleo = um('.sc-nucleo');
  var radares = um('.sc-radares');
  var G = todos('.sc-g');
  var g1 = { fios: todos('.sc-fio', G[0]), pulsos: todos('.sc-pulso', G[0]), apps: todos('.sc-app'), oks: todos('.sc-ok'), selos: todos('.sc-selo', G[0]), nada: um('.sc-nada') };
  var g2 = { fios: todos('.sc-fio', G[1]), quem: um('.sc-quem'), fatos: todos('.sc-fato') };
  var g3 = { fio: um('.sc-fio', G[2]), cartao: um('.sc-cartao'), linhas: todos('.sc-ln'), ponto: um('.sc-on .sc-r i'), rec: um('.sc-on em'), anel: um('.sc-anel') };
  var g4 = { fio: um('.sc-fio', G[3]), tarefa: um('.sc-tarefa'), ok: um('.sc-cx-ok'), risco: um('.sc-risco'), nome: um('.sc-tn'), espera: um('.sc-espera'), fechada: um('.sc-fechada'), chega: um('.sc-chega'), vaga: um('.sc-vaga-b') };
  var g5 = { fios: todos('.sc-fio', G[4]), pulsos: todos('.sc-pulso', G[4]), pedido: um('.sc-pedido'), ctx: todos('.sc-ctx'), entrega: um('.sc-entrega'), deck: um('.sc-deck'), vaga: um('.sc-deck-vaga'), minis: todos('.sc-lamina'), en: todos('.sc-en'), pronta: um('.sc-pronta', G[4]) };
  var g6 = { fio: um('.sc-fio', G[5]), zap: um('.sc-zap'), tela: um('.sc-zap-tela'), lista: um('.sc-zap-lista'), msgs: todos('.sc-zm'), toques: todos('.sc-zbts i'), tocado: um('.sc-onda-b', G[5]) };
  var g7 = { rodas: todos('.sc-roda'), toda: um('.sc-toda'), resumos: todos('.sc-resumo') };
  var g8 = { fios: todos('.sc-fio', G[7]), pulsos: todos('.sc-pulso', G[7]), pergunta: um('.sc-pergunta'), digita: um('.sc-digita'), resposta: um('.sc-resposta'), origem: um('.sc-origem-r'), ias: todos('.sc-ia'), mesmo: um('.sc-mesmo') };

  // ===== escrever só o que mudou =====
  var por = function (el, tf, op) {
    if (tf !== null && tf !== el._tf) { el.style.transform = tf; el._tf = tf; }
    var o = op < 0.004 ? 0 : op > 0.996 ? 1 : r3(op);
    if (o !== el._op) {
      el.style.opacity = String(o);
      el.classList.toggle('sc-fora', o === 0);
      el._op = o;
    }
  };
  var em = function (x, y, s) {
    return 'translate(' + r1(x) + 'px, ' + r1(y) + 'px) translate(-50%, -50%)' + (s === undefined || s === 1 ? '' : ' scale(' + r3(s) + ')');
  };
  var escala = function (s) { return 'scale(' + r3(s) + ')'; };
  // a linha que se desenha: o quanto falta (1 apagada, 0 inteira)
  var risco = function (el, falta, op) {
    var off = r3(falta);
    if (off !== el._off) { el.style.strokeDashoffset = String(off); el._off = off; }
    por(el, null, (falta < 0.999 ? 1 : 0) * (op === undefined ? 1 : op));
  };

  // ===== a forma do momento (desktop ou celular) e o fator k =====
  var lay = { c: false, b: false, k: 1, u: 1, alto: {} };
  var curva = function (x, y, ex, ey, b) {
    // de (x, y) a (ex, ey), com uma curva leve, todas no mesmo sentido (o mapa gira em volta do laço)
    var dx = ex - x, dy = ey - y;
    var cx = x + dx / 2 + dy * b, cy = y + dy / 2 - dx * b;
    return 'M' + r1(x) + ' ' + r1(y) + ' Q' + r1(cx) + ' ' + r1(cy) + ' ' + r1(ex) + ' ' + r1(ey);
  };
  // o y do desenho: no largo, vezes k (sempre 1); no celular, as posições estão desenhadas para k = 1,6
  // No celular baixo (k abaixo de 1,35, como o iPhone com as barras do Safari), a forma b: menos coisas, desenhadas
  // para k = 1 numa cena reduzida a 0,8 (800 por 700 antes da redução).
  var Y = function (v) { return lay.b ? v * lay.k : lay.c ? v * lay.k / 1.6 : v * lay.k; };
  var pega = function (o, b) {
    var f = lay.b ? (b || 'b') : lay.c ? 'c' : 'd';
    return f in o ? o[f] : f === (b || 'b') ? o.c : o.d;
  };
  var pos = function (o, b) { var p = pega(o, b) || o.d; return [p[0], Y(p[1])]; };
  var CP = function (k) { var c = (lay.b ? CENTRO.b : lay.c ? CENTRO.c : CENTRO.d)[k]; return [c[0], Y(c[1]), c[2]]; };
  var medirK = function () {
    if (!celular.matches) return 1;
    // a arte muda de altura conforme o texto da parte aberta; o papel se alonga só até a menor delas
    var ativo = sec.querySelector('.sol-item.ativo .sol-corpo p');
    var esc = parseFloat(getComputedStyle(sec).getPropertyValue('--escala')) || 0.5;
    var alto = arte.getBoundingClientRect().height;
    if (ativo && ativo.parentNode) {
      var agora = ativo.getBoundingClientRect().height, maior = agora;
      var molde = ativo.cloneNode(false);
      molde.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;width:' + ativo.getBoundingClientRect().width + 'px';
      ativo.parentNode.appendChild(molde);
      todos('.sol-corpo p', sec).forEach(function (p) {
        molde.textContent = p.textContent;
        maior = Math.max(maior, molde.getBoundingClientRect().height);
      });
      molde.remove();
      alto -= maior - agora;
    }
    return Math.max(1, Math.min(1.62, (alto / esc) / 560 * 0.94));
  };
  var montar = function () {
    lay.c = celular.matches;
    lay.k = medirK();
    lay.b = lay.c && lay.k < 1.35;
    lay.u = lay.b ? 0.8 : 1;
    raiz.classList.toggle('sc-cel', lay.c);
    raiz.classList.toggle('sc-baixo', lay.b);
    var h = 560 * lay.k;
    raiz.style.top = r1((560 - h) / 2) + 'px';
    raiz.style.height = r1(h) + 'px';
    um('.sc-origem').style.transform = lay.u === 1 ? '' : 'scale(' + lay.u + ')';
    var W = 640 / lay.u, H = h / lay.u;
    todos('.sc-fios').forEach(function (s) {
      s.setAttribute('viewBox', r1(-W / 2) + ' ' + r1(-H / 2) + ' ' + r1(W) + ' ' + r1(H));
      s.style.left = r1(-W / 2) + 'px';
      s.style.width = r1(W) + 'px';
      s.style.top = r1(-H / 2) + 'px';
      s.style.height = r1(H) + 'px';
    });
    // as alturas dos cartões (sem as transformações), para as linhas que saem do centro chegarem à borda deles
    lay.alto.cartao = g3.cartao.offsetHeight;
    lay.alto.tarefa = g4.tarefa.offsetHeight;
    var c = CP(0);
    APPS.forEach(function (a, k) {
      var p = pos(a), d = curva(p[0], p[1], c[0], c[1], 0.12);
      g1.fios[k].setAttribute('d', d);
      g1.pulsos[k].setAttribute('d', d);
    });
    c = CP(1);
    FATOS.forEach(function (f, k) { var p = pos(f); g2.fios[k].setAttribute('d', curva(p[0], p[1], c[0], c[1], 0.1)); });
    c = CP(2);
    var p3 = pos(CARTAO);
    g3.fio.setAttribute('d', 'M' + c[0] + ' ' + r1(c[1]) + ' L' + p3[0] + ' ' + r1(p3[1] - lay.alto.cartao / 2));
    c = CP(3);
    var p4 = pos(TAREFA);
    g4.fio.setAttribute('d', 'M' + c[0] + ' ' + r1(c[1]) + ' L' + p4[0] + ' ' + r1(p4[1] - lay.alto.tarefa / 2));
    c = CP(7);
    IAS.forEach(function (a, k) {
      var p = pos(a);
      var d = curva(c[0], c[1], p[0], p[1], p[0] > 0 ? 0.12 : -0.12);
      g8.fios[k].setAttribute('d', d);
      g8.pulsos[k].setAttribute('d', d);
    });
    // a parte 5: o pedido e o contexto ligados ao centro; onde fica o lugar dos slides dentro do cartão
    c = CP(4);
    var pp = pos(PEDIDO);
    g5.fios[0].setAttribute('d', curva(pp[0], pp[1], c[0], c[1], lay.c ? 0.12 : -0.12));
    CONTEXTO.forEach(function (x, k) {
      var p = pos(x), d = curva(p[0], p[1], c[0], c[1], lay.c ? -0.1 : 0.12);
      g5.fios[k + 1].setAttribute('d', d);
      g5.pulsos[k].setAttribute('d', d);
    });
    var pe = pos(ENTREGA);
    lay.deck = [pe[0] - g5.entrega.offsetWidth / 2 + g5.deck.offsetLeft + g5.deck.offsetWidth / 2,
      pe[1] - g5.entrega.offsetHeight / 2 + g5.deck.offsetTop + g5.deck.offsetHeight / 2];
    // a parte 6: no celular, a janela vai de logo abaixo do centro até perto da borda de baixo do papel; a linha do
    // centro até a janela, e onde termina cada mensagem da conversa
    c = CP(5);
    if (lay.c) {
      var meio = 56 * c[2] + 12, topo = c[1] + meio + 22, base = 280 * lay.k / lay.u - 22;
      g6.zap.style.height = r1(base - topo) + 'px';
      lay.zap = [0, (topo + base) / 2];
    } else {
      g6.zap.style.height = '';
      lay.zap = null;
    }
    var pz = lay.zap || pos(ZAP);
    g6.fio.setAttribute('d', lay.c ? 'M' + c[0] + ' ' + r1(c[1]) + ' L' + pz[0] + ' ' + r1(pz[1] - g6.zap.offsetHeight / 2)
      : 'M' + c[0] + ' ' + r1(c[1]) + ' L' + r1(pz[0] - g6.zap.offsetWidth / 2) + ' ' + r1(pz[1]));
    lay.tela = g6.tela.clientHeight;
    lay.fins = g6.msgs.map(function (m) { return m.offsetTop + m.offsetHeight; });
    todos('*').forEach(function (el) { el._tf = undefined; });
  };

  // ===== a parte 1: as integrações e o mapa do primeiro dia =====
  // t de 0 a 0,6: um a um, cada logo se liga ao centro por uma linha que se desenha; ligada, a linha leva um pulso
  // ao centro. De 0,57 a 0,85: o mapa nasce do centro (quem é quem). De 0,82 a 1: a frase.
  var INICIO = function (k) { return 0.03 + k * 0.058; };
  var parte1 = function (lt) {
    var recua = suave(faixa(lt, 0.52, 0.7));
    var ligados = 0, c = CP(0);
    APPS.forEach(function (a, k) {
      var s0 = INICIO(k), p = pos(a);
      var acende = faixa(lt, s0 - 0.025, s0 + 0.035);
      var linha = sai(faixa(lt, s0, s0 + 0.11));
      var ok = faixa(lt, s0 + 0.095, s0 + 0.13);
      ligados += ok;
      var ab = mix(1, 1.05, recua);
      por(g1.apps[k], em(c[0] + (p[0] - c[0]) * ab, c[1] + (p[1] - c[1]) * ab, mix(0.86, 1, sai(acende)) * mix(1, 0.86, recua)), mix(0.32, 1, acende) * mix(1, 0.68, recua));
      risco(g1.fios[k], 1 - linha, mix(1, 0.5, recua));
      por(g1.pulsos[k], null, ok * mix(1, 0.4, recua));
      por(g1.oks[k], escala(mix(0.3, 1, sai(ok))), ok);
    });
    SELOS.forEach(function (s, k) {
      var el = g1.selos[k];
      if (!pega(s, 'bx')) { por(el, null, 0); return; }
      var a = 0.57 + k * 0.04;
      var e = sai(faixa(lt, a, a + 0.12));
      var p = pos(s, 'bx');
      por(el, em(mix(c[0], p[0], mix(0.08, 1, e)), mix(c[1], p[1], mix(0.08, 1, e)), mix(0.55, 1, e)), faixa(lt, a, a + 0.05));
    });
    var en = sai(faixa(lt, 0.82, 0.95)), pn = pos(NADA);
    por(g1.nada, em(pn[0], pn[1] + 10 * (1 - en)), en);
    return { ligados: ligados / APPS.length, bump: APPS.reduce(function (s, a, k) { return s + pico(lt, INICIO(k) + 0.115, 0.03); }, 0) };
  };

  // ===== a parte 2: o contexto do Sérgio, cada coisa com a origem =====
  // O nome dele aparece embaixo do centro; as quatro coisas chegam de fora, uma a uma, e se ligam ao centro.
  var parte2 = function (lt) {
    var c = CP(1), bump = 0;
    var eq = sai(faixa(lt, 0.09, 0.2)), pq = pos(QUEM);
    por(g2.quem, em(pq[0], pq[1] + 10 * (1 - eq)), eq);
    FATOS.forEach(function (f, k) {
      var el = g2.fatos[k];
      if (!pega(f)) { por(el, null, 0); risco(g2.fios[k], 1); return; }
      var a = 0.12 + k * 0.17, p = pos(f);
      var e = sai(faixa(lt, a, a + 0.1));
      var dx = p[0] - c[0], dy = p[1] - c[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
      por(el, em(p[0] + dx / L * 28 * (1 - e), p[1] + dy / L * 28 * (1 - e), mix(0.94, 1, e)), faixa(lt, a, a + 0.06));
      risco(g2.fios[k], 1 - sai(faixa(lt, a + 0.05, a + 0.15)));
      bump += pico(lt, a + 0.15, 0.03);
    });
    return { bump: bump };
  };

  // ===== a parte 3: o cartão sai do centro e cresce =====
  var parte3 = function (lt) {
    var c = AGORA, p = pos(CARTAO);
    var e = sai(faixa(lt, 0.15, 0.38));
    por(g3.cartao, em(mix(c[0], p[0], e), mix(c[1], p[1], e), mix(0.12, 1, e)), faixa(lt, 0.15, 0.2));
    risco(g3.fio, 1 - sai(faixa(lt, 0.22, 0.38)));
    g3.linhas.forEach(function (el, k) {
      var a = 0.17 + k * 0.05, x = sai(faixa(lt, a, a + 0.12));
      por(el, 'translateY(' + r1(10 * (1 - x)) + 'px)', x);
    });
    var rec = faixa(lt, 0.58, 0.68);
    por(g3.ponto, escala(mix(0.2, 1, sai(rec))), rec);
    por(g3.rec, escala(mix(0.8, 1, sai(rec))), rec);
    var ap = faixa(lt, 0.76, 0.88);
    por(g3.anel, escala(mix(0.92, 1, sai(ap))), ap);
    return { bump: pico(lt, 0.17, 0.05) };
  };

  // ===== a parte 4: a tarefa de espera, e a entrega que a fecha =====
  var parte4 = function (lt) {
    var c = CP(3), p = pos(TAREFA);
    var e = sai(faixa(lt, 0.1, 0.3));
    por(g4.tarefa, em(mix(c[0], p[0], e), mix(c[1], p[1], e), mix(0.12, 1, e)), faixa(lt, 0.1, 0.15));
    risco(g4.fio, 1 - sai(faixa(lt, 0.16, 0.3)));
    var v = sai(faixa(lt, 0.3, 0.56));
    por(g4.chega, 'translateX(' + r1((lay.c ? 560 : 380) * (1 - v)) + 'px)', faixa(lt, 0.3, 0.36));
    por(g4.vaga, null, 1 - faixa(lt, 0.5, 0.58));
    var f = faixa(lt, 0.58, 0.67);
    por(g4.ok, escala(mix(0.4, 1, sai(f))), f);
    por(g4.risco, 'scaleX(' + r3(sai(faixa(lt, 0.62, 0.78))) + ')', 1);
    por(g4.nome, null, mix(1, 0.62, faixa(lt, 0.66, 0.8)));
    por(g4.espera, null, 1 - faixa(lt, 0.6, 0.67));
    por(g4.fechada, escala(mix(0.9, 1, sai(faixa(lt, 0.64, 0.74)))), faixa(lt, 0.64, 0.72));
    return { bump: pico(lt, 0.12, 0.05) };
  };

  // ===== a parte 5: as entregas =====
  // O pedido chega ao centro; o contexto é puxado de onde está (o e-mail do Sérgio, a planilha do Drive); do centro
  // saem os slides, que se juntam no cartão; no fim, o cartão pronto para revisar, com Revisar e Aprovar.
  var parte5 = function (lt) {
    var c = CP(4), pp = pos(PEDIDO), pe = pos(ENTREGA), bump = 0;
    var e = sai(faixa(lt, 0.06, 0.16));
    por(g5.pedido, em(pp[0] - 20 * (1 - e), pp[1], mix(0.96, 1, e)), faixa(lt, 0.06, 0.12));
    risco(g5.fios[0], 1 - sai(faixa(lt, 0.14, 0.26)), 0.9);
    bump += pico(lt, 0.26, 0.04);
    CONTEXTO.forEach(function (x, k) {
      var a = 0.24 + k * 0.05, p = pos(x), ex = sai(faixa(lt, a, a + 0.08));
      por(g5.ctx[k], em(p[0], p[1] + 10 * (1 - ex), mix(0.92, 1, ex)), faixa(lt, a, a + 0.05));
      risco(g5.fios[k + 1], 1 - sai(faixa(lt, a + 0.04, a + 0.14)));
      por(g5.pulsos[k], null, faixa(lt, a + 0.14, a + 0.18));
      bump += pico(lt, a + 0.14, 0.03);
    });
    var ec = sai(faixa(lt, 0.34, 0.44));
    por(g5.entrega, em(pe[0] + 24 * (1 - ec), pe[1], 1), faixa(lt, 0.34, 0.4));
    por(g5.vaga, null, 1 - faixa(lt, 0.66, 0.74));
    var n = g5.minis.length, dx = c[0] - lay.deck[0], dy = c[1] - lay.deck[1];
    g5.minis.forEach(function (el, j) {
      var a = 0.42 + j * 0.05, v = sai(faixa(lt, a, a + 0.09)), d = (n - 1 - j) * 4;
      por(el, 'translate(' + r1(dx * (1 - v) - d) + 'px, ' + r1(dy * (1 - v) - d) + 'px) scale(' + r3(mix(0.16, 1, v)) + ')', faixa(lt, a, a + 0.03));
      bump += pico(lt, a, 0.025) * 0.6;
    });
    g5.en.forEach(function (el, k) {
      var a = 0.72 + k * 0.05, x = sai(faixa(lt, a, a + 0.1));
      por(el, 'translateY(' + r1(8 * (1 - x)) + 'px)', x);
    });
    por(g5.pronta, escala(mix(0.85, 1, sai(faixa(lt, 0.8, 0.9)))), faixa(lt, 0.8, 0.86));
    return { bump: bump };
  };

  // ===== a parte 6: o Plexus no WhatsApp =====
  // A conversa com o contato Plexus: os cartões chegam por ali, a pessoa responde com um toque, manda um áudio
  // pedindo algo, e o Plexus responde que anotou. A conversa cresce de cima para baixo e rola quando enche.
  var ZM = [0.12, 0.16, 0.32, 0.36, 0.5, 0.6, 0.78];
  var TOQUES = [0.26, -1, 0.45, -1];
  var parte6 = function (lt) {
    var c = CP(5), pz = lay.zap || pos(ZAP);
    var e = sai(faixa(lt, 0.04, 0.14));
    por(g6.zap, em(pz[0], pz[1] + 16 * (1 - e), mix(0.97, 1, e)), faixa(lt, 0.04, 0.1));
    risco(g6.fio, 1 - sai(faixa(lt, 0.06, 0.16)));
    var fim = 0;
    g6.msgs.forEach(function (el, k) {
      var x = sai(faixa(lt, ZM[k], ZM[k] + 0.07));
      por(el, 'translateY(' + r1(10 * (1 - x)) + 'px)', faixa(lt, ZM[k], ZM[k] + 0.05));
      fim = mix(fim, lay.fins[k], x);
    });
    var rola = Math.min(0, lay.tela - fim - (lay.c ? 20 : 12));
    por(g6.lista, 'translateY(' + r1(rola) + 'px)', 1);
    g6.toques.forEach(function (el, k) { por(el, null, TOQUES[k] < 0 ? 0 : faixa(lt, TOQUES[k], TOQUES[k] + 0.03)); });
    var tocou = r3(100 - 100 * faixa(lt, 0.63, 0.73));
    if (tocou !== g6.tocado._clip) { g6.tocado.style.clipPath = 'inset(0 ' + tocou + '% 0 0)'; g6.tocado._clip = tocou; }
    return { bump: pico(lt, 0.12, 0.04) + pico(lt, 0.32, 0.04) + pico(lt, 0.78, 0.04) };
  };

  // ===== a parte 7: o que se repete gira em volta do centro, e a cada volta sai o resumo =====
  var VOLTAS = 3, GIRO = [0.03, 0.81];
  var parte7 = function (lt) {
    var c = CP(6), a = AGORA, r = lay.c ? RAIO.c : RAIO.d, ph = pega(PILHA);
    var giro = 360 * VOLTAS * faixa(lt, GIRO[0], GIRO[1]);
    g7.rodas.forEach(function (el, k) {
      var minha = (k === 1) === lay.c;
      por(el, minha ? 'translate(' + r1(a[0]) + 'px, ' + r1(a[1]) + 'px) translate(-50%, -50%) rotate(' + r1(giro) + 'deg) scale(' + r3(mix(0.7, 1, sai(faixa(lt, 0.06, 0.2)))) + ')' : null, minha ? faixa(lt, 0.06, 0.14) : 0);
    });
    var pt = lay.b ? pos(TODA) : [a[0], a[1] - r - (lay.c ? 52 : 34)];
    por(g7.toda, em(pt[0], pt[1], mix(0.9, 1, sai(faixa(lt, 0.12, 0.22)))), faixa(lt, 0.12, 0.2));
    var passo = (GIRO[1] - GIRO[0]) / VOLTAS;
    var E = [1, 2, 3].map(function (v) { var t0 = GIRO[0] + passo * v - 0.01; return sai(faixa(lt, t0, t0 + 0.09)); });
    var bump = 0;
    g7.resumos.forEach(function (el, j) {
      var e = E[j], depois = 0;
      for (var l = j + 1; l < 3; l++) depois += E[l];
      var ty = Y(ph[1][0]) + (Y(ph[1][1]) - Y(ph[1][0])) * depois;
      por(el, em(mix(c[0], ph[0], e), mix(c[1], ty, e), mix(0.2, 1, e)), faixa(lt, GIRO[0] + passo * (j + 1) - 0.01, GIRO[0] + passo * (j + 1) + 0.03) * mix(1, 0.72, depois / 2));
      bump += pico(lt, GIRO[0] + passo * (j + 1), 0.03);
    });
    return { bump: bump };
  };

  // ===== a parte 8: a pergunta e a resposta com a origem; o mesmo contexto nos assistentes que a pessoa já usa =====
  var parte8 = function (lt) {
    var c = CP(7), pq = pos(PERGUNTA), pd = pos(DIGITA), pr = pos(RESPOSTA);
    var q = sai(faixa(lt, 0.08, 0.18));
    por(g8.pergunta, em(pq[0], pq[1] + 14 * (1 - q)), q);
    por(g8.digita, em(pd[0], pd[1]), faixa(lt, 0.17, 0.2) * (1 - faixa(lt, 0.23, 0.26)));
    var a = sai(faixa(lt, 0.23, 0.36));
    por(g8.resposta, em(pr[0], pr[1] + 14 * (1 - a)), faixa(lt, 0.23, 0.3));
    por(g8.origem, escala(mix(0.9, 1, sai(faixa(lt, 0.36, 0.44)))), faixa(lt, 0.36, 0.42));
    IAS.forEach(function (ia, k) {
      var a0 = 0.46 + k * 0.06, p = pos(ia);
      var e = sai(faixa(lt, a0, a0 + 0.1));
      por(g8.ias[k], em(p[0] + (p[0] > 0 ? 18 : -18) * (1 - e), p[1], mix(0.86, 1, e)), faixa(lt, a0, a0 + 0.06));
      risco(g8.fios[k], 1 - sai(faixa(lt, a0 + 0.04, a0 + 0.16)));
      por(g8.pulsos[k], null, faixa(lt, a0 + 0.16, a0 + 0.21));
    });
    var pm = pos(MESMO), m = sai(faixa(lt, 0.76, 0.88));
    por(g8.mesmo, em(pm[0], pm[1] + 8 * (1 - m)), m);
    return { bump: pico(lt, 0.62, 0.04) + pico(lt, 0.8, 0.04) };
  };

  var AGORA = [0, 0, 1];
  var PARTES = [parte1, parte2, parte3, parte4, parte5, parte6, parte7, parte8];
  // qual desenho vai com cada pílula, pelo nome dela (se a ordem da seção mudar, a arte acompanha); o que não casar
  // fica com a posição
  var NOMES = ['integra', 'contexto', 'cart', 'tarefa', 'entrega', 'whatsapp', 'loop', 'chat'];
  var ARTE = todos('.sol-item .nome', sec).map(function (el, k) {
    var t = el.textContent.toLowerCase(), a = -1;
    NOMES.forEach(function (n, j) { if (a < 0 && t.indexOf(n) >= 0) a = j; });
    return a < 0 ? Math.min(k, PARTES.length - 1) : a;
  });
  var A = function (i) { return ARTE.length ? ARTE[Math.max(0, Math.min(ARTE.length - 1, i))] : i; };

  // ===== o desenho do momento =====
  // a parte do momento anda pelo t; a anterior fica no estado final e recua e esmaece no começo da nova; as
  // outras ficam escondidas (sem pintar)
  var desenhar = function (st) {
    if (!st) return;
    var i = A(st.i), ant = st.i > 0 ? A(st.i - 1) : -1, t = st.t, info = { ligados: 1, bump: 0 };
    // o centro: desliza para o lugar da parte no começo dela (as partes que nascem dele partem de onde ele está)
    var de = CP(ant < 0 ? i : ant), para = CP(i);
    var m = ant < 0 ? 1 : suave(faixa(t, 0, 0.22));
    AGORA = [mix(de[0], para[0], m), mix(de[1], para[1], m), mix(de[2], para[2], m)];
    G.forEach(function (g, k) {
      if (k === i) {
        por(g, 'scale(1)', 1);
        var r = PARTES[k](t);
        info.bump = r.bump || 0;
        if (k === 0) info.ligados = r.ligados;
      } else if (k === ant) {
        var x = suave(faixa(t, 0, 0.13));
        por(g, 'scale(' + r3(mix(1, 0.9, x)) + ')', 1 - x);
        if (x < 1) PARTES[k](1);
      } else {
        por(g, null, 0);
      }
    });
    // o centro respira quando algo chega a ele ou sai dele
    var cx = AGORA[0], cy = AGORA[1], cs = AGORA[2];
    por(nucleo, 'translate(' + r1(cx) + 'px, ' + r1(cy) + 'px) scale(' + r3(cs * (1 + 0.05 * Math.min(1, info.bump))) + ')', 1);
    por(radares, null, info.ligados);
    por(brilho, 'translate(' + r1(cx) + 'px, ' + r1(cy) + 'px) scale(' + r3(mix(0.8, 1, info.ligados) * cs) + ')', 1);
  };

  var ultimo = null;
  sec.addEventListener('sol:passo', function (e) { ultimo = e.detail; desenhar(ultimo); });
  var medida = '';
  var refazer = function (forca) {
    var m = window.innerWidth + 'x' + window.innerHeight;
    if (forca !== true && m === medida) return;
    medida = m;
    montar();
    desenhar(ultimo || sec.solEstado);
  };
  window.addEventListener('resize', refazer);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { refazer(true); });
  medida = window.innerWidth + 'x' + window.innerHeight;
  montar();
  ultimo = sec.solEstado || { i: 0, t: 0 };
  desenhar(ultimo);
})();
