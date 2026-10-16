/* sol-a: a pilha (V6, 13/10/2026). A Legora ao pé da letra, na pele do Plexus. Uma placa de vidro por parte desce
 * e assenta sobre a pilha, com o nome dela no plano; o nome das de baixo aparece apagado através do vidro. Na parte
 * 1 os sete aplicativos caem como ladrilhos em volta do Plexus e acendem uma linha verde até ele, e flutua o mapa do
 * primeiro dia. No fim, uma caixa de vidro fecha a pilha com o laço em cima. Tudo é função de (i, t), a parte e o
 * quanto se andou nela: quem sobe a página vê tudo voltar. Só transform e opacity mudam a cada quadro. */
(function () {
  'use strict';
  var sec = document.getElementById('solucao');
  if (!sec || sec.dataset.op !== 'a') return;
  var palco = sec.querySelector('.sol-palco');
  if (!palco) return;

  // a placa: 340 de lado, 12 de espessura, cantos de 18; as placas ficam a 32 uma da outra
  var S = 340, T = 12, R = 18, G = 32, ALTO = 380, SEN = Math.sin(Math.PI / 3);
  var CX = 314, CY = 292;
  var NOMES = ['Integrações', 'Contexto completo', 'Cartões', 'Tarefas vivas', 'Plexus no WhatsApp', 'Loops', 'Chat Plexus'];
  var FONTES = ['gmail', 'outlook', 'agenda', 'drive', 'onedrive', 'whatsapp', 'meet'];
  var GRAU = Math.PI / 180;
  // de pé: desfaz a rotação do mundo, para o logo ficar de frente para quem olha
  var DE_PE = 'translateZ(1px) rotateZ(-45deg) rotateX(-60deg) translateZ(34px)';

  function cria(tag, cls, pai) { var e = document.createElement(tag); if (cls) e.className = cls; if (pai) pai.appendChild(e); return e; }
  function lim(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(t, a, b) { return lim((t - a) / (b - a)); }
  function sai(x) { return 1 - Math.pow(1 - x, 3); }
  function suave(x) { return x * x * (3 - 2 * x); }
  function px(v) { return v.toFixed(2) + 'px'; }

  // grava só o que mudou (o aviso chega a cada quadro de rolagem)
  function tr(e, v) { if (e._tr !== v) { e._tr = v; e.style.transform = v; } }
  function vis(e, v) { var h = v > 0 ? '' : 'hidden'; if (e._vi !== h) { e._vi = h; e.style.visibility = h; } }
  function op(e, v) { v = Math.round(v * 1000) / 1000; if (e._op !== v) { e._op = v; e.style.opacity = v; } vis(e, v); }
  function ov(e, v) { v = Math.round(v * 1000) / 1000; if (e._ov !== v) { e._ov = v; e.style.setProperty('--o', v); } vis(e, v); }
  function gv(e, v) { v = Math.round(v * 1000) / 1000; if (e._gv !== v) { e._gv = v; e.style.setProperty('--g', v); } }
  function cl(e, c, v) { if (e['_c' + c] !== v) { e['_c' + c] = v; e.classList.toggle(c, v); } }

  // O contorno de um retângulo de cantos redondos, em segmentos, na ordem em que a normal de cada um aponta para fora
  function contorno(w, h, r, n) {
    var s = [];
    function arco(cx, cy, a0, a1) {
      for (var q = 0; q < n; q++) {
        var p0 = a0 + (a1 - a0) * q / n, p1 = a0 + (a1 - a0) * (q + 1) / n;
        s.push([cx + r * Math.cos(p0), cy + r * Math.sin(p0), cx + r * Math.cos(p1), cy + r * Math.sin(p1)]);
      }
    }
    s.push([r, h, w - r, h]); arco(w - r, h - r, 90 * GRAU, 0);
    s.push([w, h - r, w, r]); arco(w - r, r, 0, -90 * GRAU);
    s.push([w - r, 0, r, 0]); arco(r, r, -90 * GRAU, -180 * GRAU);
    s.push([0, r, 0, h - r]); arco(r, h - r, 180 * GRAU, 90 * GRAU);
    return s;
  }

  // Um bloco de vidro: o fundo, as laterais que se veem (as da frente) e a face de cima
  function bloco(pai, w, h, th, r, n, cls) {
    var b = cria('div', 'pa-bloco' + (cls ? ' ' + cls : ''), pai);
    b.style.width = w + 'px'; b.style.height = h + 'px'; b.style.setProperty('--r', r + 'px');
    var f = cria('div', 'pa-fundo', b); f.style.transform = 'translateZ(' + (-th) + 'px)';
    contorno(w, h, r, n).forEach(function (s) {
      var dx = s[2] - s[0], dy = s[3] - s[1], len = Math.sqrt(dx * dx + dy * dy);
      var nx = -dy / len, ny = dx / len;
      if (nx + ny < -0.3) return;
      var ux = dx / len, uy = dy / len, ext = 0.5;
      var p = cria('div', 'pa-parede', b);
      p.style.left = px(s[0] - ux * ext); p.style.top = px(s[1] - uy * ext);
      p.style.width = px(len + 2 * ext); p.style.height = th + 'px';
      p.style.setProperty('--l', ((nx - ny) / 1.4142).toFixed(2));
      p.style.transform = 'rotateZ(' + Math.atan2(dy, dx).toFixed(4) + 'rad) rotateX(-90deg)';
    });
    var face = cria('div', 'pa-face', b);
    return { el: b, face: face };
  }

  function marca(pai, cls) {
    var d = cria('div', cls, pai);
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 514 540'); svg.setAttribute('aria-hidden', 'true');
    var u = document.createElementNS(ns, 'use'); u.setAttribute('href', '#marca');
    svg.appendChild(u); d.appendChild(svg);
    return d;
  }

  // ===== A cena =====
  var pa = cria('div', 'pa', palco);
  var zoom = cria('div', 'pa-zoom', pa);
  var cam = cria('div', 'pa-cam', zoom);
  var mundo = cria('div', 'pa-mundo', cam);
  var chao = cria('div', 'pa-chao', mundo);
  chao.style.transform = 'translate3d(16px, 16px, -16px)';

  var placas = NOMES.map(function (nome, k) {
    var pl = cria('div', 'pa-placa', mundo);
    var b = bloco(pl, S, S, T, R, 3, 'pa-vidro');
    var nm = cria('div', 'pa-nome', b.face); nm.textContent = nome;
    var g = cria('div', 'pa-grupo', pl);
    return { el: pl, vidro: b.el, nome: nm, grupo: g, u: 0, k: k };
  });

  // ===== A parte 1: os aplicativos em volta do Plexus =====
  var C = S / 2, RAIO = 124, LT = 58, TT = 12, NO = 50, LG = 34;
  var g0 = placas[0].grupo;
  function sombra(pai, w, h) { var s = cria('div', 'pa-sombra-l', pai); s.style.width = w + 'px'; s.style.height = h + 'px'; return s; }
  var halo = cria('div', 'pa-halo', g0);
  halo.style.transform = 'translate3d(' + px(C - 120) + ',' + px(C - 120) + ',0.8px)';
  var no = { sb: sombra(g0, NO, NO) };
  var noB = bloco(g0, NO, NO, TT, 12, 1, 'pa-lad pa-no');
  no.b = noB.el;
  cria('div', 'pa-aceso', no.b);
  [marca(no.b, 'pa-logo'), marca(no.b, 'pa-logo verde')].forEach(function (m) {
    m.style.left = px((NO - LG) / 2); m.style.top = px((NO - LG * 1.05) / 2); m.style.transform = DE_PE;
  });
  var lads = FONTES.map(function (f, j) {
    var a = (225 + j * 360 / 7) * GRAU;
    var cx = C + RAIO * Math.cos(a), cy = C + RAIO * Math.sin(a);
    var ux = -Math.cos(a), uy = -Math.sin(a);
    var sb = sombra(g0, LT, LT);
    var fio = cria('div', 'pa-fio', g0);
    var fa = cria('div', 'pa-faisca', g0);
    var b = bloco(g0, LT, LT, TT, 12, 1, 'pa-lad');
    cria('div', 'pa-aceso', b.el);
    var lg = cria('div', 'pa-logo', b.el);
    var img = cria('img', '', lg); img.src = '/assets/img/fontes/' + f + '.svg'; img.alt = ''; img.decoding = 'async';
    lg.style.left = px((LT - LG) / 2); lg.style.top = px((LT - LG) / 2); lg.style.transform = DE_PE;
    var d0 = LT / 2 + 9, d1 = NO / 2 + 7, L = RAIO - d0 - d1;
    fio.style.width = px(L);
    return { b: b.el, sb: sb, fio: fio, fa: fa, x: cx - LT / 2, y: cy - LT / 2, ax: cx + ux * d0, ay: cy + uy * d0, ux: ux, uy: uy, L: L, ang: Math.atan2(uy, ux) };
  });

  // os selos do primeiro dia, de frente, ao lado da pilha
  var selos = cria('div', 'pa-selos', pa);
  var s1 = cria('div', 'pa-selo s1', selos);
  s1.innerHTML = '<span class="l"><i></i><span><span class="n">148</span> pessoas mapeadas</span></span>' +
    '<span class="papeis"><span>Sérgio, cliente</span><span>Renata, cliente</span></span>';
  var s2 = cria('div', 'pa-selo s2', selos);
  s2.innerHTML = '<span class="l"><i></i><span><span class="n">6</span> conversas esperando você</span></span>';

  function parte1(i, t) {
    var dentro = i === 0, depois = i === 1;
    // o Plexus no centro: cai logo depois da placa; na parte 2 sobe e sai
    var nu = dentro ? seg(t, 0.25, 0.34) : depois ? 1 : 0;
    var nv = depois ? seg(t, 0.07, 0.17) : 0;
    tr(no.b, 'translate3d(' + px(C - NO / 2) + ',' + px(C - NO / 2) + ',' + px(TT + 0.4 + (1 - sai(nu)) * 150 + sai(nv) * 44) + ')');
    ov(no.b, lim(nu / 0.4) * (1 - nv));
    var luz = dentro ? seg(t, 0.79, 0.85) : depois ? 1 : 0;
    gv(no.b, luz);
    op(halo, luz * (1 - nv));
    tr(no.sb, 'translate3d(' + px(C - NO / 2 + 4) + ',' + px(C - NO / 2 + 5) + ',0.4px) scale(' + (1.7 - 0.7 * sai(nu)).toFixed(3) + ')');
    op(no.sb, 0.9 * Math.pow(sai(nu), 3) * (1 - nv));
    // o nome sai quando o Plexus chega ao centro e volta quando os ladrilhos saem
    placas[0].extra = dentro ? 1 - seg(t, 0.24, 0.31) : depois ? seg(t, 0.12, 0.3) : 1;
    lads.forEach(function (l, j) {
      var a = 0.27 + j * 0.058;
      var u = dentro ? seg(t, a, a + 0.13) : depois ? 1 : 0;
      var v = depois ? seg(t, 0.01 + j * 0.01, 0.11 + j * 0.01) : 0;
      var e = sai(u);
      tr(l.b, 'translate3d(' + px(l.x) + ',' + px(l.y) + ',' + px(TT + 0.4 + (1 - e) * 170 + sai(v) * 44) + ')');
      ov(l.b, lim(u / 0.35) * (1 - v));
      tr(l.sb, 'translate3d(' + px(l.x + 4) + ',' + px(l.y + 5) + ',0.4px) scale(' + (1.7 - 0.7 * e).toFixed(3) + ')');
      op(l.sb, 0.9 * Math.pow(e, 3) * (1 - v));
      // a linha verde, do ladrilho até o centro, com a faísca na ponta
      var b0 = 0.74 + j * 0.008;
      var p = dentro ? sai(seg(t, b0, b0 + 0.06)) : depois ? 1 : 0;
      var fo = dentro ? (p > 0 ? 1 : 0) : depois ? 1 - seg(t, 0, 0.07) : 0;
      gv(l.b, dentro ? seg(t, b0, b0 + 0.03) : depois ? 1 : 0);
      tr(l.fio, 'translate3d(' + px(l.ax) + ',' + px(l.ay) + ',1.2px) rotateZ(' + l.ang.toFixed(4) + 'rad) scaleX(' + Math.max(0.001, p).toFixed(4) + ')');
      op(l.fio, fo);
      tr(l.fa, 'translate3d(' + px(l.ax + l.ux * l.L * p) + ',' + px(l.ay + l.uy * l.L * p) + ',1.6px)');
      op(l.fa, dentro ? Math.sin(Math.PI * p) : 0);
    });
    var a1 = dentro ? seg(t, 0.78, 0.84) : depois ? 1 - seg(t, 0, 0.08) : 0;
    var a2 = dentro ? seg(t, 0.81, 0.87) : depois ? 1 - seg(t, 0, 0.08) : 0;
    tr(s1, 'translateY(' + px((1 - sai(a1)) * 12) + ')'); op(s1, a1);
    tr(s2, 'translateY(' + px((1 - sai(a2)) * 12) + ')'); op(s2, a2);
  }

  // ===== As partes 2 a 7: poucos ladrilhos de texto por parte, em volta do nome da placa =====
  // x e y no plano da placa (de 0 a 340); o nome ocupa a faixa do meio, e os ladrilhos ficam atrás e na frente dele.
  function img(f, cls) { return '<img src="/assets/img/fontes/' + f + '.svg" alt=""' + (cls ? ' class="' + cls + '"' : '') + '>'; }
  var OK = '<svg class="ic" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#4a643c"/><path d="M4.6 8.3l2.2 2.2 4.6-4.8" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ANEL = '<svg class="ic" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.6" fill="none" stroke="rgba(27,27,25,0.45)" stroke-width="1.6" stroke-dasharray="2.6 2.2"/></svg>';
  var VOLTA = '<svg class="ic" viewBox="0 0 16 16"><path d="M13.4 8.4a5.4 5.4 0 1 1-1.6-4.1" fill="none" stroke="#4a643c" stroke-width="1.7" stroke-linecap="round"/><path d="M12.6 1.4v3.4H9.2" fill="none" stroke="#4a643c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ONDA = '<span class="onda">' + [5, 9, 13, 8, 11, 6, 12, 7, 10, 5, 8, 4].map(function (h) { return '<i style="height:' + h + 'px"></i>'; }).join('') + '</span>';
  var PARTES = [
    [ // 2. Contexto completo: tudo o que chega vira contexto, com a origem
      { x: 18, y: 36, w: 150, h: 68, html: '<span class="t1">' + img('meet') + 'A ata</span><span class="t2">reunião de terça</span>' },
      { x: 178, y: 36, w: 146, h: 68, html: '<span class="t1">' + img('drive') + 'Extratos</span><span class="t2">de setembro</span>' },
      { x: 58, y: 234, w: 224, h: 68, html: '<span class="t1">' + img('whatsapp') + 'O combinado com o Sérgio</span><span class="t2">a guia até o dia 20</span>' }
    ],
    [ // 3. Cartões: o que depende de você, com as opções e a resposta pronta
      { x: 20, y: 24, w: 250, h: 112, cls: 'cartao', html: '<span class="t2">Depende de você</span><span class="t1">Sérgio pede para adiar a guia</span><span class="ops"><span class="op sim">Resposta pronta</span><span class="op">Opções</span></span>' },
      { x: 80, y: 212, w: 240, h: 104, cls: 'cartao', html: '<span class="t2">Falta uma informação</span><span class="t1">Qual regime a Renata prefere?</span><span class="ops"><span class="op">Responder</span></span>' }
    ],
    [ // 4. Tarefas vivas: a promessa vira espera, e a entrega fecha
      { x: 22, y: 38, w: 248, h: 70, cls: 'tarefa', html: '<span class="t1"><span class="troca"><span class="antes">' + ANEL + '</span><span class="depois">' + OK + '</span></span>Extratos de setembro</span><span class="t2 troca"><span class="antes">esperando o banco</span><span class="depois">chegaram, tarefa fechada</span></span>' },
      { x: 84, y: 232, w: 236, h: 70, html: '<span class="t1">' + ANEL + 'Guia do dia 20</span><span class="t2">abriu pelo e-mail do Sérgio</span>' }
    ],
    [ // 5. Plexus no WhatsApp: um áudio na saída do almoço, a apresentação pronta para revisar
      { x: 22, y: 38, w: 216, h: 68, html: '<span class="t1">' + img('whatsapp') + ONDA + '<span class="dur">0:42</span></span><span class="t2">um áudio para o Plexus</span>' },
      { x: 84, y: 230, w: 236, h: 70, html: '<span class="t1">' + OK + 'Apresentação pronta</span><span class="t2">dois regimes, para você revisar</span>' }
    ],
    [ // 6. Loops: o que se repete roda sozinho, e a correção melhora o próximo
      { x: 22, y: 38, w: 220, h: 68, html: '<span class="t1">' + VOLTA + 'Relatório da semana</span><span class="t2">roda sozinho toda sexta</span>' },
      { x: 84, y: 230, w: 236, h: 70, html: '<span class="t1">' + OK + 'Pronto para você aprovar</span><span class="t2">com a sua última correção</span>' }
    ],
    [ // 7. Chat Plexus: a resposta com a origem, e o mesmo contexto no Claude e no ChatGPT
      { x: 20, y: 30, w: 296, h: 72, html: '<span class="t1">O que falta na guia do dia 20?</span><span class="t2">' + img('gmail', 'mini') + 'o extrato, pelo e-mail do banco</span>' },
      { x: 62, y: 236, w: 108, h: 54, cls: 'selo', html: '<span class="t1">Claude</span>' },
      { x: 182, y: 236, w: 126, h: 54, cls: 'selo', html: '<span class="t1">ChatGPT</span>' }
    ]
  ];
  var extras = PARTES.map(function (lista, q) {
    var pl = placas[q + 1];
    return lista.map(function (d) {
      var sb = sombra(pl.grupo, d.w, d.h);
      var b = bloco(pl.grupo, d.w, d.h, 10, 12, 1, 'pa-lad pa-txt' + (d.cls ? ' ' + d.cls : ''));
      b.face.innerHTML = d.html;
      return { b: b.el, sb: sb, x: d.x, y: d.y };
    });
  });

  function partes(i, t, veu) {
    extras.forEach(function (lista, q) {
      var k = q + 1, ultima = k === 6;
      lista.forEach(function (l, j) {
        var a = ultima ? 0.34 + j * 0.07 : 0.5 + j * 0.1, d = ultima ? 0.13 : 0.15;
        var u = i === k ? seg(t, a, a + d) : i > k ? 1 : 0;
        var v = ultima ? 0 : i === k + 1 ? seg(t, 0.01 + j * 0.02, 0.12 + j * 0.02) : i > k + 1 ? 1 : 0;
        var e = sai(u);
        tr(l.b, 'translate3d(' + px(l.x) + ',' + px(l.y) + ',' + px(10.4 + (1 - e) * 150 + sai(v) * 44) + ')');
        ov(l.b, lim(u / 0.35) * (1 - v) * (ultima ? 1 - 0.55 * veu : 1));
        tr(l.sb, 'translate3d(' + px(l.x + 4) + ',' + px(l.y + 5) + ',0.4px) scale(' + (1.4 - 0.4 * e).toFixed(3) + ')');
        op(l.sb, 0.75 * Math.pow(e, 3) * (1 - v));
        // na parte 4, a tarefa de espera fecha quando a entrega chega
        if (k === 3 && j === 0) gv(l.b, i === 3 ? seg(t, 0.8, 0.9) : i > 3 ? 1 : 0);
      });
    });
  }

  // ===== O fim: a caixa de vidro fecha a pilha, e o laço aparece em cima =====
  var CS = S + 26, CT = 6 * G + 44, CA = CT + T + 6;
  var caixa = bloco(mundo, CS, CS, CA, R + 8, 3, 'pa-caixa');
  var brilho = marca(caixa.el, 'pa-laco sombra');
  brilho.style.left = px((CS - 150) / 2 + 8); brilho.style.top = px((CS - 157.6) / 2 + 8);
  brilho.style.transform = 'translateZ(0.6px) rotateZ(-45deg)';
  for (var q = 0; q < 6; q++) {
    var m = marca(caixa.el, 'pa-laco' + (q === 5 ? ' topo' : ''));
    m.style.left = px((CS - 150) / 2); m.style.top = px((CS - 157.6) / 2);
    m.style.transform = 'translateZ(' + (1.2 + q * 1.8).toFixed(1) + 'px) rotateZ(-45deg)';
  }
  function fim(i, t) {
    var u = i === 6 ? seg(t, 0.6, 0.84) : 0;
    tr(caixa.el, 'translate3d(' + (-CS / 2) + 'px,' + (-CS / 2) + 'px,' + px(CT + (1 - sai(u)) * 330) + ')');
    ov(caixa.el, lim(u / 0.45));
    gv(caixa.el, i === 6 ? sai(seg(t, 0.8, 0.95)) : 0);
    return u;
  }

  function desenha(i, t) {
    var c = 1;
    placas.forEach(function (pl, k) {
      var dur = k === 0 ? 0.25 : k === 6 ? 0.4 : 0.5;
      var u = k < i ? 1 : k > i ? 0 : seg(t, 0, dur);
      pl.u = u;
      tr(pl.el, 'translate3d(' + (-S / 2) + 'px,' + (-S / 2) + 'px,' + px(k * G + (1 - sai(u)) * ALTO) + ')');
      ov(pl.vidro, k === 0 ? lim(u / 0.4) : seg(u, 0.14, 0.5));
      if (k === i) c = Math.max(1, k + suave(u));
      pl.extra = 1;
    });
    var fechou = fim(i, t), veu = suave(seg(fechou, 0.45, 1));
    parte1(i, t);
    partes(i, t, veu);
    // o nome de cada placa coberta fica apagado através do vidro, mais quanto mais funda ela está
    var topo = 0;
    placas.forEach(function (pl, k) { if (pl.u > 0.7) topo = k; });
    if (fechou > 0.7) topo = 7;
    placas.forEach(function (pl, k) {
      var fundo = topo - k;
      cl(pl.el, 'sob', fundo > 0);
      op(pl.nome, (fundo <= 0 ? 1 : fundo === 1 ? 0.42 : 0.2) * pl.extra * (1 - 0.5 * veu));
    });
    op(chao, sai(placas[0].u) * (0.72 + 0.04 * c));
    tr(cam, 'translate(' + CX + 'px,' + px(CY + (c - 1) * G * SEN * 0.44 - 14 * suave(fechou)) + ')');
  }

  function aviso(e) { var d = (e && e.detail) || sec.solEstado || { i: 0, t: 0 }; desenha(d.i, d.t); }
  sec.addEventListener('sol:passo', aviso);
  aviso();
})();
