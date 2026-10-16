// Um dia com o Plexus, a demonstração 1 (14/10/2026, V2 das 11:3x): «a janela inteira», agora o PRIMEIRO dia da Helena
// em nove momentos. A janela do Plexus, fiel ao front, ocupa o palco inteiro (820 por 600): a barra lateral do front
// (a palavra «Plexus», Hoje com o número, Tarefas, Loops, Conexões, Conversas com a lista, que começa vazia e cresce no
// dia, e a Helena embaixo) e, à direita, a página aberta: Conexões, a Hoje (a frase pela hora, como o front faz, as
// quatro abas, o denominador e o cartão), Tarefas, Conversas e Loops. Um cursor anda e toca nas coisas; o que chega de
// fora entra como aviso discreto; a reunião (o Google Meet com o gravador do Plexus) e o áudio (o celular com o
// WhatsApp) entram por cima da janela, que esmaece. No celular (400 por 560), a janela vira o front no celular, a
// página rola como na mão, as caixas viram o painel que sobe de baixo, e a reunião e a conversa do WhatsApp ocupam o
// palco.
//
// O estado de cada coisa é função do momento (i) e do quanto se andou nele (t), pela conta g = i + t (de 0 a 9): quem
// sobe a página vê tudo voltar. O relógio só move enfeite pequeno (o cursor de texto piscando e os três pontinhos de
// quem digita), que para com a aba escondida e some para quem pede menos movimento.
(function () {
  var sec = document.getElementById('um-dia');
  if (!sec || !sec.classList.contains('dia')) return;
  var dd = document.documentElement.dataset;
  var tela = sec.dataset.tela || (/^[123]$/.test(dd.tela || '') ? dd.tela : '1');
  if (tela !== '1') return;
  var palco = sec.querySelector('.dia-palco');
  if (!palco) return;
  var menos = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ===== as contas =====
  var lim = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var faixa = function (x, a, b) { return lim((x - a) / (b - a)); };
  var sai = function (x) { return 1 - (1 - x) * (1 - x) * (1 - x); };
  var suave = function (x) { return x * x * (3 - 2 * x); };
  var mix = function (a, b, x) { return a + (b - a) * x; };
  var r1 = function (v) { return Math.round(v * 10) / 10; };
  var r3 = function (v) { return Math.round(v * 1000) / 1000; };
  var pico = function (x, c, w) { return lim(1 - Math.abs(x - c) / w); };

  // ===== os desenhos pequenos (os ícones do front, em traço de 16 por 16) =====
  var traco = function (d) { return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var IC = {
    hoje: traco('<path d="M2.5 9.5h3l1 1.75h3l1-1.75h3"/><path d="M4.2 3.25h7.6l1.7 6.25v2.75a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V9.5z"/>'),
    tarefas: traco('<rect x="2.5" y="2.5" width="11" height="11" rx="2.5"/><path d="M5.5 8.1l1.7 1.7 3.3-3.4"/>'),
    loops: traco('<path d="M13 8a5 5 0 1 1-1.46-3.54"/><path d="M13 2.75v2.5h-2.5"/>'),
    conexoes: traco('<circle cx="4.75" cy="11.25" r="2"/><circle cx="11.25" cy="4.75" r="2"/><path d="M6.25 9.75l3.5-3.5"/>'),
    conversas: traco('<path d="M3.5 3h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7.25L4.5 13.25V11h-1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>'),
    painel: traco('<rect x="2" y="2.75" width="12" height="10.5" rx="2"/><path d="M6.25 2.75v10.5"/>'),
    menu: traco('<path d="M2 4.25h12M2 8h12M2 11.75h12"/>'),
    fechar: traco('<path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/>'),
    mail: traco('<rect x="2.25" y="3.5" width="11.5" height="9" rx="1.5"/><path d="M2.75 4.5L8 8.5l5.25-4"/>'),
    arquivo: traco('<path d="M4 2.25h5.25L12.5 5.5v8.25H4z"/><path d="M9.25 2.25V5.5h3.25"/>'),
    mais: traco('<circle cx="3.5" cy="8" r="0.75"/><circle cx="8" cy="8" r="0.75"/><circle cx="12.5" cy="8" r="0.75"/>'),
    perguntar: traco('<path d="M3.5 2.75h9a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H7.5l-3 2.5v-2.5h-1a1 1 0 0 1-1-1v-6.5a1 1 0 0 1 1-1z"/><path d="M5.5 6h5M5.5 8.25h3.5"/>'),
    visto: traco('<path d="M4 8.4l2.6 2.5L12 5.3"/>'),
    volta: traco('<path d="M10 3L5 8l5 5"/>'),
    subir: traco('<path d="M8 12.5v-9M4.25 7.25L8 3.5l3.75 3.75"/>'),
    mic: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" fill="currentColor"/><path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    cam: traco('<rect x="1.75" y="4.25" width="9" height="7.5" rx="1.5"/><path d="M10.75 7l3.5-2v6l-3.5-2"/>'),
    sair: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 9.6c3.6-3.1 8.4-3.1 12 0l-1.6 1.7-2.3-1.1V8.4c-1.4-.4-2.8-.4-4.2 0v1.8l-2.3 1.1z" fill="currentColor"/></svg>'
  };
  var LACO = '<svg viewBox="0 0 514 540" aria-hidden="true"><use href="#marca"/></svg>';
  var logo = function (n) { return '<img src="/assets/img/fontes/' + n + '.svg" alt="">'; };
  var VISTOS = '<svg viewBox="0 0 16 12" aria-hidden="true"><path d="M1.5 6.5l2.6 2.4 5.4-6M6.6 8.4l.6.5 5.4-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SETA = '<svg viewBox="0 0 20 26" aria-hidden="true"><path d="M2.2 1.6v19.6l4.7-4.5 3.2 7.3 3.3-1.4-3.2-7.2h6.5z" fill="#1b1b19" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  var ONDA = [6, 10, 16, 9, 20, 13, 24, 15, 10, 18, 22, 14, 9, 17, 22, 12, 8, 15, 20, 11, 7, 13, 9, 6, 11, 16, 8, 5];
  var onda = function (cls) { return '<span class="t1-onda' + (cls ? ' ' + cls : '') + '">' + ONDA.map(function (h) { return '<i style="height:' + h + 'px"></i>'; }).join('') + '</span>'; };

  // ===== o que se mostra =====
  // A frase do topo da Hoje é a do front pela hora (lib/phrases.ts): de manhã, no começo da tarde e na tarde.
  var FRASES = ['Café na mão, dia na mesa', 'Metade feita, metade por vir', 'A tarde ainda cabe muita coisa'];
  var FINAL = 'Oi, Sérgio. Sem problema, pode mandar o contrato assinado até quinta, 15/10. Assim mantemos o início no dia 20. Abraço, Helena';
  var PERGUNTA = 'Quais propostas ainda estão sem resposta?';
  var PEDIDO = 'Toda segunda, me prepara o relatório da semana de cada cliente';
  var tarefa = function (titulo, sob, dono, extra, marca) {
    return '<li class="t1-tk' + (extra || '') + '"><i class="t1-f t1-m"></i>' + (marca || '<span class="t1-ck"></span>') + '<span class="t1-tb"><span class="t1-tt">' + titulo + '</span><span class="t1-ts">' + sob + '</span></span><span class="t1-to">' + dono + '</span></li>';
  };
  var botao = function (tipo, txt, cls) { return '<span class="t1-bt t1-' + tipo + (cls ? ' ' + cls : '') + '">' + txt + '</span>'; };
  var dlgCab = function (titulo) { return '<div class="t1-dh"><h5>' + titulo + '</h5><span class="t1-x">' + IC.fechar + '</span></div>'; };
  var aviso = function (cls, quem, assunto, hora, lendo, ligou) {
    return '<div class="t1-aviso t1-m ' + cls + '">' + logo('gmail') + '<span><b>' + quem + '</b><small>' + assunto + '</small>' +
      '<span class="t1-lendo"><span class="t1-l1 t1-m">' + LACO + lendo + '</span><span class="t1-l2 t1-m">' + IC.visto + ligou + '</span></span></span><em>' + hora + '</em></div>';
  };
  var lamina = function (k) {
    var c = [
      '<i class="t1-lt"></i><i style="width:45%"></i><i class="t1-lv"></i>',
      '<i class="t1-lt"></i><i></i><i></i><i style="width:60%"></i>',
      '<i class="t1-lt"></i><span class="t1-l2"><i></i><i></i></span>',
      '<i class="t1-lt"></i><span class="t1-lc"><i style="height:60%"></i><i style="height:80%"></i><i style="height:45%"></i><i style="height:90%"></i></span>',
      '<i class="t1-lt"></i><i></i><i style="width:80%"></i><i style="width:50%"></i>'
    ][k];
    return '<span class="t1-lam">' + c + '</span>';
  };
  // a proposta (live/ProposalCard.tsx): o título, quem faz e o prazo, «Recusar» e «Confirmar», cheio, por último
  var proposta = function (cls, titulo, sobre, texto) {
    return '<article class="t1-prop t1-m ' + cls + '"><p class="t1-ct">' + titulo + '</p><p class="t1-cx t1-suave">' + sobre + '</p>' +
      (texto ? '<p class="t1-cx">' + texto + '</p>' : '') +
      '<div class="t1-atos">' + botao('sec', 'Recusar') + botao('pri', 'Confirmar', 't1-confirmar t1-m') + '</div></article>';
  };
  var propostaR = function (cls, titulo, sobre) {
    return '<article class="t1-prop t1-m ' + cls + '"><p class="t1-ct">' + titulo + '</p><p class="t1-cx t1-suave">' + sobre + '</p>' +
      '<div class="t1-prop-pe"><span class="t1-origem-l">' + logo('meet') + 'da reunião com o Sérgio, hoje às 10:00</span>' +
      '<span class="t1-atos">' + botao('sec', 'Recusar') + botao('pri', 'Confirmar', 't1-confirmar t1-m') + '</span></div></article>';
  };
  var fonte = function (n, k, nome, meta) { return '<li><span class="t1-fi">' + logo(n) + '</span><span class="t1-fn">' + k + '</span><b>' + nome + '</b><small>' + meta + '</small></li>'; };
  var caixa = function (cls, dica) {
    return '<div class="t1-caixa ' + cls + '"><span class="t1-cxt"><span class="t1-ph t1-m">' + dica + '</span><span class="t1-dig"></span><span class="t1-cur t1-m"></span></span>' +
      '<span class="t1-envb">' + IC.subir + '<i class="t1-envb-p t1-m">' + IC.subir + '</i></span></div>';
  };
  var pessoa = function (ini, nome, papel, onde) { return '<li class="t1-m"><span class="t1-av">' + ini + '</span><span><b>' + nome + '<em>' + papel + '</em></b><small>' + onde + '</small></span></li>'; };

  // as portas do Plexus pronto: o logo, o nome e o que ela traz; as reuniões pelo gravador do Plexus (Meet, Teams e Zoom)
  var PORTAS = [['gmail', 'Gmail', 'e-mail'], ['outlook', 'Outlook', 'e-mail'], ['agenda', 'Google Agenda', 'agenda'], ['drive', 'Google Drive', 'arquivos'],
    ['onedrive', 'OneDrive', 'arquivos'], ['whatsapp', 'WhatsApp', 'conversas'], ['reunioes', 'Reuniões', 'gravadas pelo gravador do Plexus', ['meet', 'teams', 'zoom']]];
  var NOMES_PG = [['con', 'Conexões'], ['hoje', 'Hoje'], ['tar', 'Tarefas'], ['tar3', 'Tarefas'], ['perg', 'Conversas'], ['conv6', 'Conversas'], ['loops', 'Loops']];

  var MARCACAO =
    '<div class="t1">' +
      '<div class="t1-jan t1-m">' +
        // a barra lateral
        '<aside class="t1-side">' +
          '<div class="t1-side-topo"><span class="t1-palavra">Plexus</span><span class="t1-recolher">' + IC.painel + '</span></div>' +
          '<ul class="t1-nav">' +
            '<li class="t1-it t1-it-hoje"><i class="t1-f t1-m"></i>' + IC.hoje + '<span>Hoje</span><span class="t1-num t1-m">1</span></li>' +
            '<li class="t1-it t1-it-tar"><i class="t1-f t1-m"></i>' + IC.tarefas + '<span>Tarefas</span></li>' +
            '<li class="t1-it t1-it-loops"><i class="t1-f t1-m"></i>' + IC.loops + '<span>Loops</span></li>' +
            '<li class="t1-it t1-it-con"><i class="t1-f t1-m"></i>' + IC.conexoes + '<span>Conexões</span></li>' +
            '<li class="t1-it t1-it-conv"><i class="t1-f t1-m"></i>' + IC.conversas + '<span>Conversas</span></li>' +
          '</ul>' +
          '<ul class="t1-recentes"><li class="t1-rc t1-rc-0 t1-m"><i class="t1-f t1-m"></i><span>Relatório da semana de cada cliente</span></li>' +
            '<li class="t1-rc t1-rc-1 t1-m"><i class="t1-f t1-m"></i><span>Quais propostas ainda estão sem resposta?</span></li></ul>' +
          '<div class="t1-conta"><span><span class="t1-av">H</span><span class="t1-quem"><b>Helena</b><small>plano e uso</small></span></span></div>' +
        '</aside>' +
        // o topo do celular
        '<div class="t1-topo-cel"><span class="t1-menu">' + IC.menu + '</span><span class="t1-laco">' + LACO + '</span><span>' +
          NOMES_PG.map(function (p) { return '<b class="t1-nm t1-nm-' + p[0] + ' t1-m">' + p[1] + '</b>'; }).join('') + '</span></div>' +
        // o conteúdo que muda: some e volta no recomeço, com a moldura, a barra lateral e a sombra paradas
        '<div class="t1-conteudo">' +
        '<div class="t1-main"><div class="t1-rola t1-m">' +
          // Conexões: todas as portas do Plexus pronto, no padrão da lista de portas (a arte B de 13/10), e o mapa do primeiro dia
          '<section class="t1-pg t1-pg-con t1-m">' +
            '<div class="t1-cab"><h4 class="t1-tit"><span>Conexões</span></h4></div>' +
            '<ul class="t1-portas">' + PORTAS.map(function (p) {
              return '<li class="t1-porta t1-pt-' + p[0] + '"><i class="t1-f t1-m"></i><span class="t1-ladrilho">' + (p[3] ? LACO : logo(p[0])) + '<i class="t1-badge t1-m"></i></span>' +
                '<span class="t1-pn"><b>' + p[1] + (p[3] ? '<span class="t1-plogos">' + p[3].map(logo).join('') + '</span>' : '') + '</b><small>' + p[2] + '</small></span>' +
                '<span class="t1-pe"><span class="t1-pc t1-m">Conectar</span><span class="t1-pv t1-m"><i></i>ao vivo</span></span></li>';
            }).join('') + '</ul>' +
            '<div class="t1-mapa t1-m">' +
              '<p class="t1-mapa-cab">' + LACO + '<b>O primeiro dia</b><span class="t1-mapa-st"><em class="t1-st-1 t1-m">lendo uma vez só</em><em class="t1-st-2 t1-m">' + IC.visto + 'Mapeado sozinho</em></span></p>' +
              '<ul class="t1-leit">' + [['Os cabeçalhos dos últimos 90 dias', '2.140 conversas'], ['Os e-mails que você enviou em 14 dias', '312 enviados'], ['Os arquivos do Drive', '1.204 arquivos']].map(function (l) {
                return '<li><span class="t1-lok t1-m">' + IC.visto + '</span><span class="t1-ltx">' + l[0] + '<small class="t1-m">' + l[1] + '</small></span><i class="t1-barra"><i class="t1-m"></i></i></li>';
              }).join('') + '</ul>' +
              '<div class="t1-mapa-g">' +
                '<div><p class="t1-mrot t1-m">Quem é quem</p><ul class="t1-pess">' +
                  pessoa('S', 'Sérgio', 'cliente', 'Grupo Vértice') + pessoa('R', 'Renata', 'cliente', 'Alvorada') +
                  pessoa('M', 'Marcos', 'sócio', 'da empresa') + pessoa('E', 'A equipe', 'equipe', 'da empresa') + '</ul></div>' +
                '<div><p class="t1-mrot t1-m">Em aberto</p><ul class="t1-pess t1-aberto">' +
                  '<li class="t1-m"><span><b>A Nórdica não respondeu à proposta</b><small>e-mail de 02/10</small></span></li>' +
                  '<li class="t1-m"><span><b>A Renata deve a resposta da proposta</b><small>e-mail de 06/10</small></span></li></ul></div>' +
              '</div>' +
            '</div>' +
          '</section>' +
          // a Hoje
          '<section class="t1-pg t1-pg-hoje t1-m">' +
            '<div class="t1-cab"><h4 class="t1-tit">' + FRASES.map(function (f, k) { return '<span class="t1-fr t1-fr-' + k + ' t1-m">' + f + '</span>'; }).join('') + '</h4>' + botao('pri', 'Nova conversa') + '</div>' +
            '<div class="t1-abas">' + ['Decisões', 'Tarefas', 'Agenda', 'Decidido pelo Plexus'].map(function (a, k) { return '<span class="t1-aba t1-aba-' + k + '"><i class="t1-f t1-m"></i><span>' + a + '</span></span>'; }).join('') + '</div>' +
            '<div class="t1-paineis">' +
              // as decisões
              '<div class="t1-p t1-dec-p t1-m">' +
                '<p class="t1-vazio t1-vz-1 t1-m">Nada esperando a sua decisão agora.</p>' +
                '<p class="t1-vazio t1-vz-2 t1-m">Nada esperando a sua decisão agora. Hoje você fechou 1 cartão.</p>' +
                '<p class="t1-vazio t1-vz-3 t1-m">Nada esperando a sua decisão agora.</p>' +
                '<p class="t1-cont t1-m">1 de 1</p>' +
                '<p class="t1-fb t1-fb-1 t1-m">Aprovado: aceitar até quinta. <b>Desfazer</b></p>' +
                '<p class="t1-fb t1-fb-5 t1-m">Aprovado. <b>Desfazer</b></p>' +
                '<p class="t1-vazio t1-vz-5 t1-m" style="top:34px">Nada esperando a sua decisão agora. Hoje você fechou 1 cartão.</p>' +
                '<article class="t1-card t1-card-1 t1-m">' +
                  '<p class="t1-ct">O Sérgio, do Grupo Vértice, pede mais prazo para o contrato assinado. Aceito?</p>' +
                  '<p class="t1-cx">O jurídico dele ainda revisa o contrato. Ele promete mandar assinado até quinta, 15/10, e o início continua no dia 20. <span class="t1-lk">ver e-mail</span></p>' +
                  '<div class="t1-ops">' +
                    '<div><div class="t1-op t1-op-rec"><i class="t1-f t1-m"></i><span class="t1-rad"><i class="t1-m"></i></span><span class="t1-ob"><span class="t1-ol">Aceitar até quinta</span><span class="t1-rec">recomendada</span><span class="t1-ow">O início continua no dia 20.</span></span></div>' +
                      '<p class="t1-prev"><span class="t1-lk" style="display:inline-block">ver a resposta do e-mail</span></p></div>' +
                    '<div class="t1-op"><span class="t1-rad"></span><span class="t1-ob"><span class="t1-ol">Pedir o contrato até amanhã</span><span class="t1-ow">Dá folga ao início, mas depende do jurídico dele.</span></span></div>' +
                    '<div class="t1-op"><span class="t1-rad"></span><span class="t1-ob"><span class="t1-ol">Escrever a minha resposta</span><span class="t1-ow">Você diz o que responder a ele.</span></span></div>' +
                  '</div>' +
                  '<div class="t1-atos">' + botao('fan', 'Conversar') + botao('sec', 'Reprovar') + botao('pri', 'Aprovar', 't1-aprovar-1 t1-m') + '</div>' +
                '</article>' +
                '<div class="t1-env t1-m"><div class="t1-env-cab">' + logo('gmail') + '<span><b>Resposta enviada ao Sérgio</b><small>hoje às 09:05 · na mesma conversa, do seu e-mail</small></span><span class="t1-env-ok">' + IC.visto + '</span></div>' +
                  '<p class="t1-env-corpo">' + FINAL + '</p></div>' +
                '<article class="t1-card t1-card-5 t1-m">' +
                  '<p class="t1-ct">O contrato assinado do Sérgio chegou. Fecho a tarefa?</p>' +
                  '<p class="t1-cx">Ele prometeu o contrato até hoje. Chegou às 10:14, no e-mail dele, com um anexo. <span class="t1-lk">ver e-mail</span></p>' +
                  '<div class="t1-arqs">' + ['contrato-assinado.pdf'].map(function (a) { return '<span class="t1-arq"><span>' + IC.arquivo + '</span>' + a + '</span>'; }).join('') + '</div>' +
                  '<div class="t1-atos">' + botao('fan', 'Conversar') + botao('sec', 'Não fazer') + botao('pri', 'Aprovar', 't1-aprovar-5 t1-m') + '</div>' +
                '</article>' +
              '</div>' +
              // as tarefas do dia (quinta)
              '<div class="t1-p t1-tar-p t1-m">' +
                '<div class="t1-seg">' + ['Todas', 'Suas', 'Plexus', 'Concluídas'].map(function (s, k) { return '<span class="t1-sg t1-sg-' + k + '"><i class="t1-f t1-m"></i><span>' + s + '</span></span>'; }).join('') + '</div>' +
                '<div style="position:relative">' +
                  '<ul class="t1-lista t1-todas-l t1-m">' + tarefa('Reunião com a Nórdica', 'hoje, 14:00', 'você') + tarefa('Proposta revisada para a Nórdica', 'hoje · entregue, esperando você', 'Plexus') + '</ul>' +
                  '<ul class="t1-lista t1-feitas t1-m">' + tarefa('Contrato assinado até quinta', 'hoje · chegou às 10:14, no e-mail do Sérgio · um anexo', 'você', ' t1-feita-l', '<span class="t1-ck t1-feita"></span>') + '</ul>' +
                '</div>' +
              '</div>' +
              // o decidido pelo Plexus
              '<div class="t1-p t1-decid-p t1-m">' +
                '<p class="t1-dg t1-m">Hoje de manhã</p>' +
                '<ul class="t1-dl">' +
                  [['Três boletins de fornecedores', 'lidos e guardados, sem cartão', '07:12'], ['Conta de internet da empresa', 'arquivada no Plexus, já paga no débito automático', '06:55'],
                    ['Comprovante do aluguel de outubro', 'guardado com a mensagem de origem', '06:40'], ['Nota fiscal da assinatura de software', 'guardada, já paga no cartão da empresa', '06:22'],
                    ['Aviso do banco sobre a tarifa de outubro', 'lido e guardado, sem cartão', '06:05']]
                    .map(function (l) { return '<li class="t1-dr t1-m"><span><b>' + l[0] + '</b><small>' + l[1] + '</small></span><em>' + l[2] + '</em></li>'; }).join('') +
                '</ul>' +
              '</div>' +
            '</div>' +
          '</section>' +
          // a página Tarefas (terça, depois da resposta)
          '<section class="t1-pg t1-pg-tar t1-m">' +
            '<div class="t1-cab"><h4 class="t1-tit"><span>Tarefas</span></h4>' + botao('pri', 'Criar tarefa') + '</div>' +
            '<div class="t1-abas">' + ['Todas', 'Suas', 'Plexus', 'Concluídas'].map(function (a, k) { return '<span class="t1-aba' + (k ? '' : ' t1-sim') + '"><i class="t1-f"' + (k ? '' : ' style="opacity:1"') + '></i><span>' + a + '</span></span>'; }).join('') + '</div>' +
            '<p class="t1-grupo">Hoje</p>' +
            '<ul class="t1-lista">' + tarefa('Revisar a proposta da Nórdica', 'hoje, 11:00', 'você') + tarefa('Relatório de setembro da Solar', 'hoje · entregue, esperando você', 'Plexus') + '</ul>' +
            '<p class="t1-grupo">Esta semana</p>' +
            '<ul class="t1-lista">' + tarefa('Reunião com a Nórdica', 'quinta, 14:00', 'você') + tarefa('Contrato assinado até quinta', 'quinta, 15/10 · esperando o Sérgio', 'você', ' t1-nova t1-m') + '</ul>' +
          '</section>' +
          // Tarefas depois da reunião: as duas tarefas sugeridas pela reunião, no alto, como propostas, e a lista embaixo
          '<section class="t1-pg t1-pg-tar3 t1-m">' +
            '<div class="t1-cab"><h4 class="t1-tit"><span>Tarefas</span></h4>' + botao('pri', 'Criar tarefa') + '</div>' +
            '<div class="t1-abas">' + ['Todas', 'Suas', 'Plexus', 'Concluídas'].map(function (a, k) { return '<span class="t1-aba' + (k ? '' : ' t1-sim') + '"><i class="t1-f"' + (k ? '' : ' style="opacity:1"') + '></i><span>' + a + '</span></span>'; }).join('') + '</div>' +
            '<div class="t1-t3">' +
              '<div class="t1-t3-props"><div class="t1-pslot">' + propostaR('t1-prop-a', 'Mandar ao Sérgio os dois cenários de preço', 'Você faz · prazo: sexta, 16/10') + '</div>' +
                '<div class="t1-pslot t1-slot-b">' + propostaR('t1-prop-b', 'Orçamento aprovado do Grupo Vértice', 'Esperando o Sérgio') + '</div></div>' +
              '<div class="t1-t3-lista t1-m"><p class="t1-grupo">Esta semana</p><ul class="t1-lista">' +
                tarefa('Contrato assinado até quinta', 'quinta, 15/10 · esperando o Sérgio', 'você') + tarefa('Reunião com a Nórdica', 'quinta, 14:00', 'você') +
                tarefa('Mandar ao Sérgio os dois cenários de preço', 'sexta, 16/10', 'você', ' t1-nova-a t1-m') + '</ul>' +
                '<p class="t1-grupo t1-grupo-sp t1-m">Sem prazo</p><ul class="t1-lista">' + tarefa('Orçamento aprovado do Grupo Vértice', 'esperando o Sérgio', 'você', ' t1-nova-b t1-m') + '</ul></div>' +
            '</div>' +
          '</section>' +
          // Conversas: a pergunta das 16:20 (a conversa nova e, depois de enviar, a conversa aberta)
          '<section class="t1-pg t1-pg-perg t1-m">' +
            '<div class="t1-nova-c t1-m"><p class="t1-nc-t">' + LACO + 'Perguntar ao Plexus</p>' + caixa('t1-caixa-p', 'Pergunte sobre um e-mail, uma tarefa, uma pessoa ou uma data') + '</div>' +
            '<div class="t1-aberta">' +
              '<div class="t1-q t1-m"><span class="t1-av">H</span><p class="t1-qb">' + PERGUNTA + '</p></div>' +
              '<div class="t1-resp-p t1-ans t1-m"><span class="t1-marca-r">' + LACO + '</span>' +
                '<p class="t1-rx t1-m">Duas propostas ainda estão sem resposta.</p>' +
                '<ol class="t1-itens">' +
                  '<li class="t1-m"><b>Nórdica.</b> A proposta foi enviada em 02/10 e segue sem resposta.<span class="t1-selo">1</span></li>' +
                  '<li class="t1-m"><b>Alvorada.</b> A Renata disse que responde na sexta.<span class="t1-selo">2</span></li></ol>' +
                '<div class="t1-parte t1-fontes-r t1-m"><p class="t1-drot">Fontes · 2</p><ul class="t1-fontes">' +
                  fonte('gmail', 1, 'E-mail para a Nórdica', '02/10') + fonte('gmail', 2, 'E-mail da Renata', '06/10') + '</ul></div>' +
              '</div>' +
            '</div>' +
          '</section>' +
          // Conversas: o pedido do loop, numa conversa nova, com a proposta da rotina
          '<section class="t1-pg t1-pg-conv6 t1-m">' +
            '<div class="t1-nova-c t1-nova-6 t1-m"><p class="t1-nc-t">' + LACO + 'Perguntar ao Plexus</p>' + caixa('t1-caixa-l', 'Pergunte sobre um e-mail, uma tarefa, uma pessoa ou uma data') + '</div>' +
            '<div class="t1-aberta">' +
              '<div class="t1-q t1-q6 t1-m"><span class="t1-av">H</span><p class="t1-qb">' + PEDIDO + '</p></div>' +
              '<div class="t1-resp-p t1-ans t1-resp6 t1-m"><span class="t1-marca-r">' + LACO + '</span><p class="t1-rx">Posso deixar isso rodando sozinho, toda segunda.</p></div>' +
              '<div class="t1-pslot t1-slot-6">' + proposta('t1-prop-6', 'Criar a rotina «Relatório da semana dos clientes»?', 'Plexus faz · toda segunda, 08:00 · a primeira em 19/10',
                'Cada relatório chega para você revisar e aprovar. Nada vai aos clientes sem a sua aprovação.') +
                '<p class="t1-fimc t1-fim-6 t1-m">virou a rotina: Relatório da semana dos clientes</p></div>' +
            '</div>' +
          '</section>' +
          // Loops: a rotina na lista
          '<section class="t1-pg t1-pg-loops t1-m">' +
            '<div class="t1-cab"><h4 class="t1-tit"><span>Loops</span></h4></div>' +
            '<div class="t1-loops-c"><div class="t1-loop-l t1-m"><ul class="t1-lista">' +
              tarefa('Relatório da semana dos clientes', 'toda segunda, 08:00 · a primeira em 19/10 · para revisar e aprovar', 'Plexus', '', '<span class="t1-lp">' + IC.loops + '</span>') + '</ul>' +
              '<p class="t1-nota-l t1-m">Cada relatório chega para você revisar. Nada vai aos clientes sem a sua aprovação.</p></div></div>' +
          '</section>' +
        '</div>' +
        // a caixa da conversa aberta, presa ao rodapé (fora da rolagem)
        '<div class="t1-pilula t1-m"><span>Perguntar mais…</span><span class="t1-envb">' + IC.subir + '</span></div>' +
        '</div>' +
        // o aviso do que chega de fora
        aviso('t1-aviso-1', 'Sérgio · Grupo Vértice', 'Contrato assinado', '08:42', 'O Plexus está lendo', 'Pede a sua decisão') +
        aviso('t1-aviso-5', 'Sérgio · Grupo Vértice', 'Contrato assinado · um anexo', '10:14', 'O Plexus está lendo', 'Ligado à tarefa do contrato') +
        // os diálogos
        '<div class="t1-veu t1-m"></div>' +
        '<div class="t1-capa"><div class="t1-dlg t1-dlg-env t1-m">' + dlgCab('Enviar este e-mail?') +
          '<div class="t1-mail"><div class="t1-mail-cab">' + IC.mail + 'E-mail</div><dl><div><dt>Para</dt><dd>Sérgio, do Grupo Vértice</dd></div><div><dt>Assunto</dt><dd>Re: Contrato assinado</dd></div></dl>' +
            '<p class="t1-mail-corpo t1-livre">' + FINAL + '</p></div>' +
          '<div class="t1-dbt">' + botao('sec', 'Voltar') + botao('pri', 'Enviar', 't1-enviar t1-m') + '</div>' +
        '</div></div>' +
        '<div class="t1-capa"><div class="t1-dlg t1-dlg-tar t1-m">' + dlgCab('Contrato assinado até quinta') +
          '<p class="t1-dsub">quinta, 15/10 · esperando o Sérgio</p>' +
          '<p class="t1-dtx">O Sérgio, do Grupo Vértice, prometeu por e-mail o contrato assinado até quinta. Com ele, o início continua no dia 20.</p>' +
          '<div class="t1-parte"><p class="t1-drot">De onde veio</p><div class="t1-origem">' + logo('gmail') + '<span><b>Sérgio · Grupo Vértice</b><small>13 de outubro, 08:42</small></span></div></div>' +
          '<div class="t1-dbt"><span class="t1-mais">' + IC.mais + '</span>' + botao('sec', 'Chegou') + botao('pri', 'Cobrar', 't1-cobrar') + '</div>' +
        '</div></div>' +
        '<div class="t1-capa"><div class="t1-dlg t1-dlg-ent t1-m">' +
          '<p class="t1-sobre">' + LACO + 'Tarefa do Plexus · hoje, 15:10</p>' + dlgCab('Apresentação dos dois cenários') +
          '<p class="t1-dsub">entregue, esperando você</p>' +
          '<div class="t1-parte"><p class="t1-drot">Entregue</p>' +
            '<p class="t1-dtx">Montei os dois cenários de preço para o Grupo Vértice, com a planilha do trimestre <span class="t1-selo">1</span> e o que vocês combinaram na reunião das 10:00 <span class="t1-selo">2</span>. Nada foi enviado ao Sérgio.</p>' +
            '<div class="t1-laminas">' + [0, 1, 2, 3, 4].map(lamina).join('') + '</div><p class="t1-nota">9 slides</p></div>' +
          '<div class="t1-parte t1-fontes-p"><p class="t1-drot">Fontes · 2</p><ul class="t1-fontes">' +
            fonte('drive', 1, 'Planilha do trimestre', 'Drive · 30/09') + fonte('meet', 2, 'Reunião com o Sérgio', 'Gravação · hoje, 10:00') + '</ul></div>' +
          '<div class="t1-dbt"><span></span>' + botao('sec', IC.perguntar + 'Perguntar sobre isto') + '</div>' +
        '</div></div>' +
        '<div class="t1-esm t1-m"></div></div>' +
      '</div>' +
      // o que entra por cima da janela, no mesmo invólucro que some e volta
      '<div class="t1-sobre-c">' +
      // a reunião no Google Meet, com o gravador do Plexus
      '<div class="t1-meet t1-m">' +
        '<div class="t1-mt-grade">' +
          '<div class="t1-mt t1-mt-s"><i class="t1-fala t1-m"></i><span class="t1-mt-av" style="background:#c26401">S</span><span class="t1-mt-n">Sérgio</span></div>' +
          '<div class="t1-mt t1-mt-h"><i class="t1-fala t1-m"></i><span class="t1-mt-av" style="background:#137333">H</span><span class="t1-mt-n">Você</span></div>' +
          '<div class="t1-mt t1-mt-p"><span class="t1-grav"><i></i>gravando</span><span class="t1-mt-av t1-mt-laco">' + LACO + '</span><span class="t1-mt-n">Gravador do Plexus</span></div>' +
        '</div>' +
        '<div class="t1-mt-pe"><span class="t1-mt-info">' + logo('meet') + '<b class="t1-mt-hora">10:00</b><span>Alinhamento com o Grupo Vértice</span></span>' +
          '<span class="t1-mt-bts"><i>' + IC.mic + '</i><i>' + IC.cam + '</i><i class="t1-mt-sair">' + IC.sair + '</i></span></div>' +
      '</div>' +
      // o celular com a conversa do WhatsApp
      '<div class="t1-zap t1-m">' +
        '<div class="t1-zap-hora"><span><em class="t1-zh-1 t1-m">13:40</em><em class="t1-zh-2 t1-m">15:10</em></span><i></i><span></span></div>' +
        '<div class="t1-zap-topo"><span class="t1-volta">' + IC.volta + '</span><span class="t1-zap-av">' + LACO + '</span><span class="t1-zap-nome">Plexus<small>online</small></span>' + logo('whatsapp') + '</div>' +
        '<div class="t1-zap-tela"><div class="t1-zap-lista">' +
          '<div class="t1-zm t1-eu t1-z-audio t1-m"><p class="t1-zaudio"><span class="t1-play"></span>' + onda() + '<span class="t1-zh">0:18 · 13:40' + VISTOS + '</span></p></div>' +
          '<div class="t1-zm t1-z-p1" style="position:relative"><p class="t1-zdig t1-m" style="position:absolute;left:0;top:0"><i></i><i></i><i></i></p>' +
            '<p class="t1-z-p1t t1-m">Entendi. Monto a apresentação dos dois cenários de preço que você combinou com o Sérgio na reunião das 10:00 e aviso quando estiver pronta para você revisar.<span class="t1-zh">13:41</span></p></div>' +
          '<div class="t1-zm t1-z-p2 t1-m"><p>A apresentação dos dois cenários para o Sérgio está pronta para você revisar. Nada vai a ele antes da sua aprovação.<span class="t1-zh">15:10</span></p>' +
            '<span class="t1-zbt">Ir para o Plexus<i class="t1-m"></i></span></div>' +
        '</div></div>' +
        '<div class="t1-zap-pe"><span class="t1-zcx"><span class="t1-zmsg t1-m">Mensagem</span><span class="t1-zgrav t1-m"><i class="t1-ponto"></i><b class="t1-ztempo">0:00</b>' + onda('t1-zonda') + '</span></span><span class="t1-zmic t1-m">' + IC.mic + '</span></div>' +
      '</div>' +
      '<div class="t1-toque t1-m"></div>' +
      '<div class="t1-cursor">' + SETA + '</div>' +
      '</div>' +
    '</div>';

  // ===== a montagem e as medidas =====
  var raiz, E = {}, forma = '', lay = { alto: false, alvo: {}, rola: [[0, 0]], zap: [0, 0, 0] };
  var um = function (s) { return raiz.querySelector(s); };
  var todos = function (s) { return [].slice.call(raiz.querySelectorAll(s)); };

  var montar = function () {
    palco.innerHTML = MARCACAO;
    raiz = palco.querySelector('.t1');
    E = {
      jan: um('.t1-jan'), esm: um('.t1-esm'), rola: um('.t1-rola'), conteudo: um('.t1-conteudo'), sobreC: um('.t1-sobre-c'),
      pg: { con: um('.t1-pg-con'), hoje: um('.t1-pg-hoje'), tar: um('.t1-pg-tar'), tar3: um('.t1-pg-tar3'), perg: um('.t1-pg-perg'), conv6: um('.t1-pg-conv6'), loops: um('.t1-pg-loops') },
      nm: {}, it: { hoje: um('.t1-it-hoje'), tar: um('.t1-it-tar'), loops: um('.t1-it-loops'), con: um('.t1-it-con'), conv: um('.t1-it-conv') },
      num: um('.t1-num'), rc0: um('.t1-rc-0'), rc1: um('.t1-rc-1'), rcF0: um('.t1-rc-0 .t1-f'), rcF1: um('.t1-rc-1 .t1-f'),
      fr: todos('.t1-fr'), abas: todos('.t1-pg-hoje .t1-aba'), fAbas: todos('.t1-pg-hoje .t1-aba .t1-f'),
      decP: um('.t1-dec-p'), tarP: um('.t1-tar-p'), decidP: um('.t1-decid-p'),
      vz1: um('.t1-vz-1'), vz2: um('.t1-vz-2'), vz3: um('.t1-vz-3'), vz5: um('.t1-vz-5'), cont: um('.t1-cont'), fb1: um('.t1-fb-1'), fb5: um('.t1-fb-5'),
      card1: um('.t1-card-1'), recF: um('.t1-op-rec .t1-f'), recR: um('.t1-op-rec .t1-rad i'), aprovar1: um('.t1-aprovar-1'),
      env: um('.t1-env'), card5: um('.t1-card-5'), aprovar5: um('.t1-aprovar-5'),
      sgs: todos('.t1-sg'), fSgs: todos('.t1-sg .t1-f'), todasL: um('.t1-todas-l'), feitasL: um('.t1-feitas'), feitaF: um('.t1-feita-l .t1-f'),
      dg: um('.t1-dg'), drs: todos('.t1-dr'),
      nova: um('.t1-nova'), novaF: um('.t1-nova .t1-f'),
      // Conexões
      mapa: um('.t1-mapa'),
      st1: um('.t1-st-1'), st2: um('.t1-st-2'), lok: todos('.t1-lok'), lsm: todos('.t1-ltx small'), barras: todos('.t1-barra i'),
      mrot: todos('.t1-mrot'), pess: todos('.t1-pess li'),
      // a reunião e o resumo
      meet: um('.t1-meet'), falaS: um('.t1-mt-s .t1-fala'), falaH: um('.t1-mt-h .t1-fala'), mtHora: um('.t1-mt-hora'),
      propA: um('.t1-prop-a'), propB: um('.t1-prop-b'), confA: um('.t1-prop-a .t1-confirmar'), confB: um('.t1-prop-b .t1-confirmar'),
      slotB: um('.t1-slot-b'), t3lista: um('.t1-t3-lista'), novaA: um('.t1-nova-a'), novaB: um('.t1-nova-b'), novaAF: um('.t1-nova-a .t1-f'), novaBF: um('.t1-nova-b .t1-f'), grupoSp: um('.t1-grupo-sp'),
      // a pergunta
      novaC: um('.t1-pg-perg .t1-nova-c'), cxP: um('.t1-caixa-p'), q: um('.t1-pg-perg .t1-q'), ans: um('.t1-ans'), ansRx: um('.t1-ans .t1-rx'), ansIt: todos('.t1-ans .t1-itens li'), ansF: um('.t1-fontes-r'),
      pilula: um('.t1-pilula'), notaL: um('.t1-nota-l'),
      // o loop
      cxL: um('.t1-caixa-l'), novaC6: um('.t1-nova-6'), q6: um('.t1-q6'), resp6: um('.t1-resp6'), prop6: um('.t1-prop-6'), confL: um('.t1-prop-6 .t1-confirmar'), fim6: um('.t1-fim-6'), loopL: um('.t1-loop-l'),
      aviso1: um('.t1-aviso-1'), aviso5: um('.t1-aviso-5'),
      veu: um('.t1-veu'), envD: um('.t1-dlg-env'), tarD: um('.t1-dlg-tar'), entD: um('.t1-dlg-ent'),
      enviar: um('.t1-enviar'), cobrar: um('.t1-cobrar'),
      zap: um('.t1-zap'), zh1: um('.t1-zh-1'), zh2: um('.t1-zh-2'), zAudio: um('.t1-z-audio'), zDig: um('.t1-zdig'), zP1: um('.t1-z-p1t'), zP2: um('.t1-z-p2'),
      zBt: um('.t1-zbt'), zBtI: um('.t1-zbt i'), zMsg: um('.t1-zmsg'), zGrav: um('.t1-zgrav'), zTempo: um('.t1-ztempo'), zOnda: todos('.t1-zonda i'), zMic: um('.t1-zmic'), zLista: um('.t1-zap-lista'),
      cursor: um('.t1-cursor'), toque: um('.t1-toque'), menu: um('.t1-menu')
    };
    NOMES_PG.forEach(function (p) { E.nm[p[0]] = um('.t1-nm-' + p[0]); });
    [['P', E.cxP], ['L', E.cxL]].forEach(function (c) {
      E['ph' + c[0]] = c[1].querySelector('.t1-ph'); E['dig' + c[0]] = c[1].querySelector('.t1-dig'); E['cur' + c[0]] = c[1].querySelector('.t1-cur');
      E['envb' + c[0]] = c[1].querySelector('.t1-envb'); E['envbP' + c[0]] = c[1].querySelector('.t1-envb-p');
    });
    ['G', 'gmail', 'D', 'drive'].forEach(function (x, k, l) { if (k % 2) return; var p = um('.t1-pt-' + l[k + 1]);
      E['pc' + x] = p.querySelector('.t1-pc'); E['pv' + x] = p.querySelector('.t1-pv'); E['bg' + x] = p.querySelector('.t1-badge'); E['f' + x] = p.querySelector('.t1-f'); });
    E.aviso1L = [E.aviso1.querySelector('.t1-l1'), E.aviso1.querySelector('.t1-l2')];
    E.aviso5L = [E.aviso5.querySelector('.t1-l1'), E.aviso5.querySelector('.t1-l2')];
    raiz.classList.toggle('t1-parado', document.hidden);
  };

  // onde fica cada coisa, em pixels do desenho, a partir do canto do palco (sem as transformações)
  var ponto = function (el) {
    var x = 0, y = 0, n = el;
    while (n && n !== raiz) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return [x, y];
  };
  var centro = function (el, dx, dy) {
    var p = ponto(el);
    return [p[0] + el.offsetWidth * (dx === undefined ? 0.5 : dx), p[1] + el.offsetHeight * (dy === undefined ? 0.5 : dy), !!el.closest('.t1-rola')];
  };
  var medir = function () {
    if (!raiz) return;
    lay.alto = forma === 'alto';
    var a = lay.alvo, alto = lay.alto;
    // o quanto sobem a segunda proposta e a lista quando cada proposta vira tarefa
    lay.hA = E.propA.parentNode.offsetHeight + 12; lay.hB = E.slotB.offsetHeight + 12;
    a.ptGmail = centro(E.pcG);
    a.ptDrive = centro(E.pcD);
    a.aprovar1 = centro(E.aprovar1);
    a.enviar = centro(E.enviar);
    a.navTar = alto ? centro(E.menu) : centro(E.it.tar, 0.3);
    a.navConv = alto ? centro(E.menu) : centro(E.it.conv, 0.3);
    a.navLoops = alto ? centro(E.menu) : centro(E.it.loops, 0.3);
    a.nova = centro(E.nova.querySelector('.t1-tt'), 0.35);
    a.cobrar = centro(E.cobrar, 0.5, 1.6);
    a.confA = centro(E.confA);
    a.confB = centro(E.confB); a.confB[1] -= lay.hA;
    a.caixaP = centro(E.cxP, 0.3);
    a.enviarP = centro(E.envbP);
    a.caixaL = centro(E.cxL, 0.3);
    a.enviarL = centro(E.envbL);
    a.confL = centro(E.confL);
    a.zBt = centro(E.zBt);
    a.aprovar5 = centro(E.aprovar5);
    a.abaTar = centro(E.abas[1]);
    a.sgConcl = centro(E.sgs[3]);
    a.abaDecid = centro(E.abas[3], 0.4);
    var W = alto ? 400 : 820, H = alto ? 560 : 600;
    a.descanso = [W - 90, H - 70, false];
    // a rolagem da página: no momento 0, nas duas formas, o mapa vem depois das portas; no celular, também nos outros
    var topoMain = alto ? 52 : 0, vis = (alto ? 560 : 600) - topoMain;
    var topo = function (el) { return ponto(el)[1] - topoMain; }, fim = function (el) { return topo(el) + el.offsetHeight; };
    var baixo = function (el, folga) { return Math.max(0, fim(el) - vis + (folga || 18)); };
    var mf = baixo(E.mapa);
    if (alto) {
      var c1 = Math.max(0, topo(E.card1) - 14), a1 = Math.max(c1, baixo(E.aprovar1));
      var c5 = Math.max(0, topo(E.card5) - 14), a5 = Math.max(c5, baixo(E.aprovar5));
      var an = baixo(E.ansF, 84), lp = baixo(E.confL, 84);
      var mt = Math.min(mf, Math.max(0, topo(E.mapa) - 12));
      lay.rola = [[0, 0], [0.29, 0], [0.38, mt], [0.56, mt], [0.74, mf], [0.97, mf], [1.0, 0],
        [1.5, 0], [1.64, c1], [2.02, c1], [2.09, a1], [2.29, a1], [2.37, 0],
        [5.5, 0], [5.72, an], [6.0, an], [6.03, 0], [6.4, 0], [6.47, lp], [6.62, lp], [6.66, 0],
        [7.3, 0], [7.42, c5], [7.44, c5], [7.5, a5], [7.56, a5], [7.62, 0], [9, 0]];
    } else {
      lay.rola = [[0, 0], [0.29, 0], [0.4, mf], [0.97, mf], [1.0, 0], [9, 0]];
    }
    // a conversa do WhatsApp rola quando enche
    var tela = E.zLista.parentNode.offsetHeight;
    lay.zap = [E.zAudio, E.zP1.parentNode, E.zP2].map(function (el) { return el.offsetTop + el.offsetHeight + 12 - tela; });
  };

  // ===== escrever só o que mudou =====
  var mv = 1;
  var por = function (el, tf, op) {
    if (tf !== null && tf !== el._tf) { el.style.transform = tf; el._tf = tf; }
    if (op === null || op === undefined) return;
    var o = op < 0.004 ? 0 : op > 0.996 ? 1 : r3(op);
    if (o !== el._op) { el.style.opacity = String(o); el._op = o; }
  };
  var txt = function (el, s) { if (el._tx !== s) { el.textContent = s; el._tx = s; } };
  var liga = function (el, c, on) { on = !!on; if (el['_c' + c] !== on) { el.classList.toggle(c, on); el['_c' + c] = on; } };
  var ty = function (y) { return 'translateY(' + r1(y * mv) + 'px)'; };
  var tx = function (x) { return 'translateX(' + r1(x * mv) + 'px)'; };

  var G = 0;
  var E2 = function (a, b) { return sai(faixa(G, a, b)); };
  // aparece de a a b subindo dy, e (se c existir) sai de c a d continuando a subir
  var aparece = function (el, a, b, c, d, dy) {
    var e = E2(a, b), s = c === undefined ? 0 : E2(c, d);
    if (dy === undefined) dy = 10;
    por(el, ty(dy * (1 - e) - dy * s), e * (1 - s));
  };
  var janela = function (a, b, c, d) { return faixa(G, a, b) * (c === undefined ? 1 : 1 - faixa(G, c, d)); };
  var trilha = function (pts) {
    if (G <= pts[0][0]) return pts[0][1];
    for (var k = 1; k < pts.length; k++) {
      if (G <= pts[k][0]) { var a = pts[k - 1], b = pts[k]; return mix(a[1], b[1], suave(faixa(G, a[0], b[0]))); }
    }
    return pts[pts.length - 1][1];
  };
  var aperta = function (el, gt) { var p = pico(G, gt, 0.014); por(el, p > 0 ? 'scale(' + r3(1 - 0.05 * p) + ')' : 'none', null); };
  var diag = function (el, a, b, c, d) {
    var e = E2(a, b), s = c === undefined ? 0 : E2(c, d), v = e * (1 - s);
    if (lay.alto) por(el, 'translateY(' + r1(100 * (1 - v) * mv) + '%)', v > 0 ? 1 : 0);
    else por(el, 'translateY(' + r1(8 * (1 - e) * mv) + 'px) scale(' + r3(mix(0.98, 1, e)) + ')', v);
    return v;
  };
  // o texto digitado numa caixa: a dica some, as letras entram, e o cursor de texto pisca enquanto espera
  var digita = function (k, texto, a, b, envio) {
    var n = Math.round(texto.length * faixa(G, a, b));
    txt(E['dig' + k], texto.slice(0, n));
    por(E['ph' + k], null, n ? 0 : 1);
    var cur = G >= a - 0.03 && G < envio ? 1 : 0;
    por(E['cur' + k], null, cur);
    liga(E['cur' + k], 't1-pisca', cur && (G < a || G > b));
    por(E['envbP' + k], null, faixa(G, b - 0.01, b));
    aperta(E['envb' + k], envio);
  };

  // as páginas: onde cada uma aparece, como [entra de, entra até, sai de, sai até]
  var PAGINAS = {
    con: [[-1, 0, 0.965, 0.99]],
    hoje: [[1.0, 1.04, 2.56, 2.585], [4.0, 4.04, 5.06, 5.09], [7.0, 7.04, 10, 11]],
    tar: [[2.59, 2.64, 3.0, 3.03]],
    tar3: [[3.45, 3.5, 3.97, 4.0]],
    perg: [[5.1, 5.14, 5.98, 6.0]],
    conv6: [[6.02, 6.06, 6.655, 6.68]],
    loops: [[6.68, 6.72, 6.96, 6.99]]
  };
  var pagina = function (nome) { var s = 0; PAGINAS[nome].forEach(function (w) { s += janela(w[0], w[1], w[2], w[3]); }); return lim(s); };

  // os toques, na ordem: o momento do toque e onde ele cai
  var TOQUES = [[0.11, 'ptGmail'], [0.23, 'ptDrive'], [2.13, 'aprovar1'], [2.25, 'enviar'], [2.56, 'navTar'], [2.77, 'nova'], [3.7, 'confA'], [3.82, 'confB'], [4.74, 'zBt'],
    [5.08, 'navConv'], [5.34, 'enviarP'], [6.29, 'enviarL'], [6.54, 'confL'], [6.65, 'navLoops'], [7.52, 'aprovar5'], [7.66, 'abaTar'], [7.76, 'sgConcl'], [8.1, 'abaDecid']];
  // por onde o cursor anda (no computador): cada parada chega um pouco antes do toque
  var PARADAS = [[0.0, 'descanso'], [0.09, 'ptGmail'], [0.13, 'ptGmail'], [0.21, 'ptDrive'], [0.25, 'ptDrive'], [0.36, 'descanso'],
    [2.0, 'descanso'], [2.11, 'aprovar1'], [2.15, 'aprovar1'], [2.23, 'enviar'], [2.27, 'enviar'], [2.42, 'descanso'], [2.47, 'descanso'], [2.54, 'navTar'], [2.59, 'navTar'],
    [2.75, 'nova'], [2.8, 'nova'], [2.92, 'cobrar'], [3.0, 'cobrar'],
    [3.58, 'descanso'], [3.68, 'confA'], [3.72, 'confA'], [3.8, 'confB'], [3.84, 'confB'], [3.95, 'descanso'],
    [5.0, 'descanso'], [5.06, 'navConv'], [5.1, 'navConv'], [5.15, 'caixaP'], [5.29, 'caixaP'], [5.33, 'enviarP'], [5.37, 'enviarP'], [5.46, 'descanso'],
    [6.0, 'caixaL'], [6.26, 'caixaL'], [6.28, 'enviarL'], [6.32, 'enviarL'], [6.52, 'confL'], [6.56, 'confL'], [6.63, 'navLoops'], [6.67, 'navLoops'], [6.8, 'descanso'],
    [7.38, 'descanso'], [7.5, 'aprovar5'], [7.55, 'aprovar5'], [7.64, 'abaTar'], [7.68, 'abaTar'], [7.74, 'sgConcl'], [7.8, 'sgConcl'], [8.0, 'sgConcl'],
    [8.08, 'abaDecid'], [8.14, 'abaDecid'], [8.4, 'descanso']];
  var rolaY = 0;
  var onde = function (nome) { var p = lay.alvo[nome] || [0, 0, false]; return [p[0], p[1] - (p[2] ? rolaY : 0)]; };

  // ===== o desenho de um instante =====
  var desenhar = function (est) {
    if (!raiz) return;
    G = Math.min(9, Math.max(0, est.i + est.t));
    mv = menos.matches ? 0 : 1;
    var alto = lay.alto;

    // a página rola no celular
    rolaY = trilha(lay.rola);
    por(E.rola, 'translateY(' + r1(-rolaY) + 'px)', null);

    // as páginas e a barra
    var P = {};
    Object.keys(PAGINAS).forEach(function (k) { P[k] = pagina(k); por(E.pg[k], null, P[k]); por(E.nm[k], null, P[k]); });
    por(E.pg.tar, ty(6 * (1 - E2(2.59, 2.66))), null);
    var marca = function (k, v) { por(E.it[k].querySelector('.t1-f'), null, v); liga(E.it[k], 't1-sim', v >= 0.5); };
    marca('hoje', P.hoje); marca('tar', lim(P.tar + P.tar3)); marca('loops', P.loops); marca('con', P.con);
    // Conversas: a página atual pela tinta; o preenchimento vai para a conversa aberta, ou para Conversas na conversa nova
    var aberta = faixa(G, 5.34, 5.38), aberta6 = faixa(G, 6.29, 6.33);
    por(E.it.conv.querySelector('.t1-f'), null, P.perg * (1 - aberta) + P.conv6 * (1 - aberta6));
    liga(E.it.conv, 't1-sim', P.perg >= 0.5 || P.conv6 >= 0.5);
    // a lista das conversas começa vazia e cresce no dia: a pergunta das 16:20, depois o pedido do loop, em cima
    por(E.rc1, ty(32 * faixa(G, 6.31, 6.37)), faixa(G, 5.37, 5.43));
    por(E.rcF1, null, P.perg * aberta);
    por(E.rc0, null, faixa(G, 6.32, 6.38));
    por(E.rcF0, null, P.conv6 * aberta6);

    // a frase do topo da Hoje pela hora: de manhã, 13:40, 15:10, e quinta de manhã
    var tarde = janela(3.98, 4.0, 4.78, 4.84), tarde2 = janela(4.78, 4.84, 5.1, 5.12);
    por(E.fr[0], null, lim(1 - tarde - tarde2));
    por(E.fr[1], null, tarde);
    por(E.fr[2], null, tarde2);

    // o número de Hoje: o cartão aberto do Sérgio, e o da prova na quinta
    por(E.num, null, janela(1.4, 1.43, 2.29, 2.32) + janela(7.34, 7.37, 7.54, 7.57));

    // as abas da Hoje: Decisões, Tarefas (quinta) e Decidido pelo Plexus
    var aDec = 1 - faixa(G, 7.665, 7.7), aTar = janela(7.665, 7.7, 8.105, 8.14), aDecid = faixa(G, 8.105, 8.14);
    por(E.fAbas[0], null, aDec); por(E.fAbas[1], null, aTar); por(E.fAbas[3], null, aDecid);
    liga(E.abas[0], 't1-sim', aDec >= 0.5); liga(E.abas[1], 't1-sim', aTar >= 0.5); liga(E.abas[3], 't1-sim', aDecid >= 0.5);
    por(E.decP, null, aDec);
    por(E.tarP, ty(6 * (1 - E2(7.67, 7.74))), janela(7.67, 7.72, 8.105, 8.14));
    por(E.decidP, null, faixa(G, 8.105, 8.15));

    // ===== momento 0: ela conecta o Gmail e o Google Drive, e o Plexus mapeia sozinho =====
    [['G', 0.11], ['D', 0.23]].forEach(function (c) {
      var x = c[0], t0 = c[1], v = E2(t0 + 0.03, t0 + 0.06);
      aperta(E['pc' + x], t0);
      por(E['pc' + x], null, 1 - faixa(G, t0 + 0.01, t0 + 0.03));
      por(E['pv' + x], tx(6 * (1 - v)), v);
      por(E['bg' + x], 'scale(' + r3(mix(0.2, 1, v)) + ')', v);
      por(E['f' + x], null, janela(t0 + 0.01, t0 + 0.04, t0 + 0.1, t0 + 0.16));
    });
    aparece(E.mapa, 0.3, 0.36, undefined, undefined, 10);
    [[0.36, 0.44], [0.41, 0.49], [0.46, 0.55]].forEach(function (w, k) {
      por(E.barras[k], 'scaleX(' + r3(faixa(G, w[0], w[1])) + ')', 1 - faixa(G, w[1], w[1] + 0.03));
      por(E.lok[k], null, faixa(G, w[1], w[1] + 0.02));
      por(E.lsm[k], null, faixa(G, w[1], w[1] + 0.03));
    });
    por(E.mrot[0], null, faixa(G, 0.56, 0.6)); por(E.mrot[1], null, faixa(G, 0.68, 0.72));
    E.pess.forEach(function (el, k) { var a = k < 4 ? 0.57 + k * 0.03 : 0.69 + (k - 4) * 0.04; aparece(el, a, a + 0.05, undefined, undefined, 6); });
    por(E.st1, null, 1 - faixa(G, 0.78, 0.8));
    por(E.st2, null, faixa(G, 0.8, 0.84));

    // ===== momento 1: o e-mail chega, o Plexus lê, o cartão aparece =====
    aparece(E.aviso1, 1.06, 1.14, 1.37, 1.44, alto ? -10 : 12);
    por(E.aviso1L[0], null, janela(1.17, 1.21, 1.29, 1.32));
    por(E.aviso1L[1], null, faixa(G, 1.29, 1.32));
    por(E.vz1, null, 1 - faixa(G, 1.355, 1.39));
    por(E.cont, null, janela(1.4, 1.44, 2.28, 2.32) + janela(7.34, 7.38, 7.53, 7.57));
    aparece(E.card1, 1.4, 1.48, 2.28, 2.34, 12);
    var rec = faixa(G, 1.5, 1.56);
    por(E.recF, null, rec); por(E.recR, null, rec);

    // ===== momento 2: ela aprova; a resposta sai; a promessa vira tarefa =====
    diag(E.envD, 2.135, 2.18, 2.255, 2.29);
    diag(E.tarD, 2.775, 2.82, 2.98, 3.02);
    var vEnt = diag(E.entD, 4.86, 4.92, 4.98, 5.03);
    por(E.veu, null, Math.max(janela(2.135, 2.17, 2.255, 2.285), janela(2.775, 2.81, 2.98, 3.01), janela(4.86, 4.9, 4.98, 5.02)));
    aperta(E.aprovar1, 2.13);
    aperta(E.enviar, 2.25);
    aparece(E.fb1, 2.33, 2.39, 2.58, 2.6, 0);
    aparece(E.env, 2.35, 2.43, 2.58, 2.6, 12);
    aparece(E.nova, 2.64, 2.7, undefined, undefined, 8);
    por(E.novaF, null, janela(2.66, 2.7, 2.86, 2.94));

    // ===== momento 3: a reunião com o Sérgio vira resumo e tarefas =====
    var dim = janela(3.02, 3.1, 3.44, 3.5) + janela(4.06, 4.16, 4.79, 4.88);
    por(E.esm, null, dim * (alto ? 1 : 0.72));
    por(E.jan, dim > 0 && !alto ? 'scale(' + r3(1 - 0.02 * dim) + ')' : 'none', null);
    var mIn = E2(3.04, 3.12), mOut = E2(3.43, 3.49);
    if (alto) por(E.meet, 'translateX(' + r1(100 * (1 - mIn) * mv) + '%)', mIn > 0 && mOut < 1 ? 1 - mOut : 0);
    else por(E.meet, 'translateY(' + r1(14 * (1 - mIn) * mv) + 'px) scale(' + r3(mix(0.97, 1, mIn) - 0.02 * mOut) + ')', mIn * (1 - mOut));
    por(E.falaS, null, janela(3.12, 3.14, 3.22, 3.24) + janela(3.34, 3.36, 3.41, 3.43));
    por(E.falaH, null, janela(3.23, 3.25, 3.33, 3.35));
    var min = Math.round(24 * faixa(G, 3.08, 3.43));
    txt(E.mtHora, '10:' + (min < 10 ? '0' : '') + min);
    aparece(E.propA, 3.48, 3.54, 3.705, 3.74, 8);
    aparece(E.propB, 3.5, 3.56, 3.825, 3.86, 8);
    aperta(E.confA, 3.7); aperta(E.confB, 3.82);
    // cada proposta confirmada sai, a seguinte e a lista sobem, e a tarefa nova acende na lista
    var xA = menos.matches ? (G >= 3.75 ? 1 : 0) : E2(3.72, 3.78), xB = menos.matches ? (G >= 3.87 ? 1 : 0) : E2(3.84, 3.9);
    por(E.slotB, 'translateY(' + r1(-lay.hA * xA) + 'px)', null);
    por(E.t3lista, 'translateY(' + r1(-lay.hA * xA - lay.hB * xB) + 'px)', null);
    aparece(E.novaA, 3.75, 3.8, undefined, undefined, 6);
    por(E.novaAF, null, janela(3.76, 3.8, 3.88, 3.94));
    aparece(E.grupoSp, 3.87, 3.92, undefined, undefined, 6);
    aparece(E.novaB, 3.87, 3.92, undefined, undefined, 6);
    por(E.novaBF, null, janela(3.88, 3.92, 3.99, 4.02));

    // ===== momento 4: o áudio no WhatsApp; a entrega para revisar =====
    var zIn = E2(4.06, 4.18), zOut = E2(4.78, 4.87);
    por(E.zap, alto ? 'translateX(' + r1(100 * (1 - zIn + zOut) * mv) + '%)' : tx(70 * (1 - zIn) + 70 * zOut), alto ? (zIn > 0 && zOut < 1 ? 1 : 0) : zIn * (1 - zOut));
    var grav = janela(4.18, 4.2, 4.33, 4.35);
    por(E.zGrav, null, grav);
    por(E.zMsg, null, 1 - grav);
    var seg = Math.round(18 * faixa(G, 4.19, 4.33));
    txt(E.zTempo, '0:' + (seg < 10 ? '0' : '') + seg);
    var ondas = faixa(G, 4.19, 4.33) * E.zOnda.length;
    E.zOnda.forEach(function (el, k) { por(el, null, k < ondas ? 1 : 0); });
    por(E.zMic, grav > 0 ? 'scale(' + r3(1 + 0.12 * grav) + ')' : 'none', null);
    aparece(E.zAudio, 4.34, 4.38, undefined, undefined, 10);
    var dig = janela(4.395, 4.415, 4.47, 4.49);
    por(E.zDig, null, dig);
    liga(raiz, 't1-anda', dig > 0 && !menos.matches);
    aparece(E.zP1, 4.48, 4.53, undefined, undefined, 8);
    por(E.zh1, null, 1 - faixa(G, 4.58, 4.62));
    por(E.zh2, null, faixa(G, 4.58, 4.62));
    aparece(E.zP2, 4.62, 4.68, undefined, undefined, 10);
    por(E.zBtI, null, faixa(G, 4.73, 4.75));
    var fim = 0, chegou = [E2(4.34, 4.38), E2(4.395, 4.42), E2(4.62, 4.68)];
    chegou.forEach(function (x, k) { fim = Math.max(fim, lay.zap[k] * x); });
    por(E.zLista, 'translateY(' + r1(-Math.max(0, fim)) + 'px)', null);
    por(E.vz2, null, janela(3.99, 4.0, 4.97, 5.0));

    // ===== momento 5: a pergunta ao Plexus, e a resposta com a origem =====
    digita('P', PERGUNTA, 5.14, 5.3, 5.34);
    por(E.novaC, null, 1 - faixa(G, 5.345, 5.37));
    aparece(E.q, 5.36, 5.41, undefined, undefined, 10);
    aparece(E.ans, 5.42, 5.47, undefined, undefined, 8);
    por(E.ansRx, null, faixa(G, 5.45, 5.49));
    E.ansIt.forEach(function (el, k) { var a = 5.49 + k * 0.05; aparece(el, a, a + 0.05, undefined, undefined, 6); });
    aparece(E.ansF, 5.66, 5.72, undefined, undefined, 6);
    por(E.pilula, null, P.perg * faixa(G, 5.36, 5.4) + P.conv6 * faixa(G, 6.31, 6.35));

    // ===== momento 6: o primeiro loop, pedido numa frase =====
    digita('L', PEDIDO, 6.1, 6.26, 6.29);
    por(E.novaC6, null, 1 - faixa(G, 6.295, 6.32));
    aparece(E.q6, 6.31, 6.35, undefined, undefined, 10);
    aparece(E.resp6, 6.37, 6.41, undefined, undefined, 8);
    aparece(E.prop6, 6.4, 6.46, 6.545, 6.57, 8);
    aperta(E.confL, 6.54);
    aparece(E.fim6, 6.56, 6.6, undefined, undefined, 4);
    aparece(E.loopL, 6.72, 6.77, undefined, undefined, 8);
    aparece(E.notaL, 6.76, 6.8, undefined, undefined, 6);

    // ===== momento 7: quinta, a prova chega e a tarefa fecha =====
    por(E.vz3, null, janela(7.0, 7.04, 7.32, 7.36));
    aparece(E.aviso5, 7.06, 7.14, 7.37, 7.44, alto ? -10 : 12);
    por(E.aviso5L[0], null, janela(7.17, 7.21, 7.29, 7.32));
    por(E.aviso5L[1], null, faixa(G, 7.29, 7.32));
    aparece(E.card5, 7.34, 7.42, 7.525, 7.59, 12);
    aperta(E.aprovar5, 7.52);
    aparece(E.fb5, 7.58, 7.64, undefined, undefined, 6);
    aparece(E.vz5, 7.6, 7.66, undefined, undefined, 8);
    var sC = faixa(G, 7.765, 7.8);
    por(E.fSgs[0], null, 1 - sC); por(E.fSgs[3], null, sC);
    liga(E.sgs[0], 't1-sim', sC < 0.5); liga(E.sgs[3], 't1-sim', sC >= 0.5);
    por(E.todasL, null, 1 - faixa(G, 7.765, 7.79));
    aparece(E.feitasL, 7.775, 7.83, undefined, undefined, 6);
    por(E.feitaF, null, janela(7.8, 7.84, 7.96, 8.02));

    // ===== momento 8: o que não pede você, no «Decidido pelo Plexus» =====
    por(E.dg, null, faixa(G, 8.12, 8.17));
    E.drs.forEach(function (el, k) { var a = 8.18 + k * 0.11; aparece(el, a, a + 0.07, undefined, undefined, 10); });

    // ===== o cursor e o toque =====
    var cOp = janela(0.0, 0.03, 0.3, 0.36) + janela(1.98, 2.02, 2.96, 3.0) + janela(3.58, 3.62, 3.95, 3.99) + janela(5.0, 5.04, 5.42, 5.48) +
      janela(6.02, 6.06, 6.78, 6.84) + janela(7.36, 7.4, 8.62, 8.7);
    if (!alto) {
      var p = posCursor();
      por(E.cursor, 'translate(' + r1(p[0]) + 'px, ' + r1(p[1]) + 'px)', cOp);
    }
    var tq = null, tv = 0;
    for (var k = 0; k < TOQUES.length; k++) {
      var v = pico(G, TOQUES[k][0] + 0.006, 0.02);
      if (v > tv) { tv = v; tq = TOQUES[k]; }
    }
    if (tq) {
      var q = onde(tq[1]), cresce = faixa(G, tq[0] - 0.012, tq[0] + 0.026);
      por(E.toque, 'translate(' + r1(q[0]) + 'px, ' + r1(q[1]) + 'px) scale(' + r3(mix(0.4, 1.25, cresce)) + ')', tv * 0.9);
    } else por(E.toque, null, 0);
    return vEnt;
  };

  // o cursor desliza de parada em parada; quem pede menos movimento o vê pular
  var posCursor = function () {
    var P = PARADAS;
    if (G <= P[0][0]) return onde(P[0][1]);
    for (var k = 1; k < P.length; k++) {
      if (G <= P[k][0]) {
        var a = onde(P[k - 1][1]), b = onde(P[k][1]);
        var x = faixa(G, P[k - 1][0], P[k][0]);
        x = mv ? suave(x) : (x < 0.5 ? 0 : 1);
        // um arco leve no caminho, como a mão faz
        var arco = Math.sin(Math.PI * x) * Math.min(28, Math.abs(b[0] - a[0]) * 0.08) * mv;
        return [mix(a[0], b[0], x), mix(a[1], b[1], x) - arco];
      }
    }
    return onde(P[P.length - 1][1]);
  };

  // ===== a cena de cada momento =====
  // O rolar escolhe o momento (o i do aviso); o t do rolar não move mais a peça. Cada momento é uma cena que toca pelo
  // relógio, para no estado final, some num instante e recomeça. A cena começa com a tela do momento montada e para
  // antes do que é a saída para o momento seguinte. Pausa com a aba escondida e com a seção fora da tela; quem pede
  // menos movimento vê só o estado final, parado. O ritmo de cada cena: [os segundos, o ponto do dia] em cada parada,
  // para a cena andar depressa onde nada acontece e devagar onde há o que ler.
  var RITMOS = [
    [[0, 0], [0.8, 0.11], [2.0, 0.23], [2.6, 0.3], [4.4, 0.55], [5.6, 0.72], [6.2, 0.86]],
    [[0, 1.04], [0.3, 1.12], [0.6, 1.22], [0.85, 1.32], [1.0, 1.4], [1.8, 1.49], [2.3, 1.58]],
    [[0, 2.02], [0.6, 2.13], [1.1, 2.2], [1.5, 2.25], [2.0, 2.35], [3.2, 2.47], [3.7, 2.56], [4.2, 2.66], [4.8, 2.77], [5.3, 2.83], [5.9, 2.94]],
    [[0, 3.1], [2.6, 3.43], [3.0, 3.5], [3.4, 3.6], [4.0, 3.7], [4.4, 3.78], [4.9, 3.82], [5.3, 3.9], [5.6, 3.95]],
    [[0, 4.04], [0.5, 4.18], [1.6, 4.35], [1.9, 4.4], [2.3, 4.49], [3.4, 4.56], [3.6, 4.62], [4.4, 4.7], [4.7, 4.75], [5.3, 4.88], [5.8, 4.93]],
    [[0, 5.13], [1.8, 5.3], [2.1, 5.345], [2.5, 5.42], [3.9, 5.66], [4.4, 5.73]],
    [[0, 6.08], [1.8, 6.26], [2.1, 6.3], [2.6, 6.41], [3.3, 6.47], [3.8, 6.54], [4.3, 6.6], [4.9, 6.66], [5.3, 6.73], [5.9, 6.81]],
    [[0, 7.04], [0.25, 7.1], [0.6, 7.22], [0.8, 7.3], [0.9, 7.34], [1.6, 7.43], [2.2, 7.52], [2.6, 7.6], [3.1, 7.66], [3.7, 7.76], [4.3, 7.84], [4.9, 7.9]],
    [[0, 8.02], [0.7, 8.12], [4.0, 8.72]]
  ];
  var PAUSAS = [2.5, 1.6, 2.5, 2.5, 3, 3, 2.5, 2.5, 2.5];
  var toca = function (i) { var r = RITMOS[i] || RITMOS[0]; return r[r.length - 1][0]; };
  var SOME = 0.4, VOLTA = 0.35, SUAVE = 0.45;
  var cena = { i: -1, s: 0, antes: 0, repetiu: false, raf: 0, suave: 0 }, visivel = true;
  var tDaCena = function () {
    var r = RITMOS[cena.i] || RITMOS[0], x = menos.matches ? Infinity : cena.s, g = r[r.length - 1][1];
    for (var k = 1; k < r.length; k++) { if (x <= r[k][0]) { g = mix(r[k - 1][1], r[k][1], faixa(x, r[k - 1][0], r[k][0])); break; } }
    return g - cena.i;
  };
  var tocando = function () { return !menos.matches && visivel && !document.hidden && cena.i >= 0 && !!raiz; };
  var pintar = function () { if (raiz && cena.i >= 0) desenhar({ i: cena.i, t: tDaCena() }); };
  // no recomeço some só o conteúdo (a página e o que fica por cima dela); a moldura, a barra lateral e a sombra ficam
  var opacidade = function (o) { if (!raiz) return; var v = r3(lim(o)); [E.conteudo, E.sobreC].forEach(function (el) { if (el._opc !== v) { el.style.opacity = String(v); el._opc = v; } }); };
  // pelo relógio, a peça anda sem as transições curtas; elas voltam só para suavizar a troca de momento
  var relogio = function (on) { if (raiz) liga(raiz, 't1-relogio', on); };
  var quadro = function (agora) {
    cena.raf = 0;
    if (!tocando()) { cena.antes = 0; return; }
    var dt = cena.antes ? Math.min(0.1, (agora - cena.antes) / 1000) : 0;
    cena.antes = agora;
    cena.s += dt;
    if (cena.suave > 0) { cena.suave -= dt; if (cena.suave <= 0) relogio(true); }
    var fimToca = toca(cena.i) + PAUSAS[cena.i];
    if (cena.s >= fimToca + SOME) {
      // recomeça: volta ao começo de uma vez, com a peça escondida, e reaparece
      // a barra lateral volta ao estado do começo numa transição curta, sem sumir; o conteúdo, escondido, salta
      cena.s = 0; cena.repetiu = true; opacidade(0); relogio(false); cena.suave = SUAVE;
      raiz.classList.add('t1-salto'); pintar(); void raiz.offsetWidth; raiz.classList.remove('t1-salto');
    }
    var o = 1;
    if (cena.s > fimToca) o = 1 - (cena.s - fimToca) / SOME;
    else if (cena.repetiu && cena.s < VOLTA) o = cena.s / VOLTA;
    opacidade(o);
    pintar();
    cena.raf = requestAnimationFrame(quadro);
  };
  var acordar = function () {
    if (cena.raf || !tocando()) return;
    cena.antes = 0;
    cena.raf = requestAnimationFrame(quadro);
  };
  var novaCena = function (i) {
    cena.i = i; cena.s = 0; cena.repetiu = false; cena.suave = SUAVE;
    relogio(false);
    opacidade(1);
    pintar();
    acordar();
  };

  // ===== a vida da peça =====
  var estado = function () { return sec.diaEstado || { i: 0, t: 0, forma: sec.dataset.forma || 'largo' }; };
  var preparar = function (f) {
    forma = f;
    montar();
    medir();
  };
  var passo = function (est) {
    if (sec.dataset.tela !== '1' && sec.dataset.tela !== undefined) return;
    var f = est.forma || sec.dataset.forma || 'largo', nova = false;
    if (f !== forma) { preparar(f); nova = true; }
    var esc = sec.style.getPropertyValue('--escala');
    if (esc !== lay.esc) { lay.esc = esc; medir(); }
    if (nova || est.i !== cena.i) novaCena(est.i);
  };
  sec.addEventListener('dia:passo', function (e) { passo(e.detail); });
  var remedir = function () { if (!raiz) return; medir(); pintar(); };
  window.addEventListener('resize', function () { requestAnimationFrame(remedir); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remedir);
  // o motor muda a escala (e, no celular, o tamanho das letras) também sem um aviso novo: medir de novo quando ela muda
  if (window.MutationObserver) new MutationObserver(function () {
    var esc = sec.style.getPropertyValue('--escala');
    if (raiz && esc !== lay.esc) { lay.esc = esc; requestAnimationFrame(remedir); }
  }).observe(sec, { attributes: true, attributeFilter: ['style'] });
  // a cena pausa com a seção fora da tela e com a aba escondida, e retoma de onde parou
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { visivel = es[es.length - 1].isIntersecting; acordar(); }).observe(sec);
  document.addEventListener('visibilitychange', function () { if (raiz) raiz.classList.toggle('t1-parado', document.hidden); acordar(); });
  if (menos.addEventListener) menos.addEventListener('change', function () { opacidade(1); relogio(!menos.matches); pintar(); acordar(); });
  passo(estado());
})();
