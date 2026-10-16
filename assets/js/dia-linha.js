// A linha do tempo de «Um dia com o Plexus» (V7, 14/10/2026), nos três desenhos (?linha=a|b|c; o CSS em
// dia-linha.css). Monta os pontos do dia (o c no computador; os três no celular) e o relógio do c, e mede a linha
// do a: onde ela começa e termina (o primeiro e o último ponto) e até onde o verde desce (o ponto do momento, mais
// o quanto se andou até o próximo). Tudo segue o aviso «dia:passo» do motor; quem sobe a página vê tudo voltar.
(function () {
  var sec = document.getElementById('um-dia');
  if (!sec || !sec.classList.contains('dia')) return;
  var grade = sec.querySelector('.dia-grade');
  var lista = sec.querySelector('.dia-linha');
  var itens = [].slice.call(sec.querySelectorAll('.dia-m'));
  var n = itens.length;
  if (!grade || !lista || !n) return;

  // ===== os pontos do dia =====
  var pontos = document.createElement('div');
  pontos.className = 'dia-pontos';
  pontos.setAttribute('aria-hidden', 'true');
  pontos.innerHTML = itens.map(function (li, k) { return '<button type="button" tabindex="-1" data-k="' + k + '"></button>'; }).join('');
  grade.appendChild(pontos);
  var botoes = [].slice.call(pontos.children);
  botoes.forEach(function (b, k) { b.addEventListener('click', function () { if (sec.irPara) sec.irPara(k); }); });

  // ===== o relógio do c: a hora grande, que rola para a do momento seguinte =====
  var DIAS = ['Terça, 13/10', 'Terça, 13/10', 'Terça, 13/10', 'Terça, 13/10', 'Terça, 13/10', 'Terça, 13/10', 'Terça, 13/10', 'Quinta, 15/10', 'Todo dia'];
  var horas = itens.map(function (li) { return (li.querySelector('.dia-hora') || {}).textContent || ''; });
  var relogio = document.createElement('div');
  relogio.className = 'dia-relogio';
  relogio.setAttribute('aria-hidden', 'true');
  relogio.innerHTML =
    '<span class="dia-relogio-dia"><span>' + itens.map(function (li, k) { return '<i>' + (DIAS[k] || '') + '</i>'; }).join('') + '</span></span>' +
    '<span class="dia-relogio-hora"><span>' + horas.map(function (h) {
      // «Quinta, 10:14» mostra só a hora (o dia está em cima); o que não é hora fica menor
      var so = h.replace(/^.*?(\d{1,2}:\d{2})$/, '$1');
      return /^\d{1,2}:\d{2}$/.test(so) ? '<i>' + so + '</i>' : '<i class="txt">' + h + '</i>';
    }).join('') + '</span></span>';
  grade.insertBefore(relogio, lista);
  var rolos = [].slice.call(relogio.querySelectorAll('.dia-relogio-dia > span, .dia-relogio-hora > span'));

  // ===== a linha do a =====
  var pontoY = function (li) { return li.offsetTop + 11; };  // o centro do ponto: 4 de cima mais 7 do raio
  var medirLinha = function (i, t) {
    if (sec.dataset.linha !== 'a' || sec.dataset.forma === 'alto') return;
    var ini = pontoY(itens[0]);
    var fim = pontoY(itens[n - 1]);
    var y = pontoY(itens[i]);
    if (i < n - 1) y += (pontoY(itens[i + 1]) - y) * t;
    lista.style.setProperty('--l-ini', ini + 'px');
    lista.style.setProperty('--l-tudo', Math.max(0, fim - ini) + 'px');
    lista.style.setProperty('--l-cheio', Math.max(0, y - ini) + 'px');
  };

  var estado = { i: 0, t: 0 };
  var acompanhar = 0;
  var passo = function (e) {
    var s = e && e.detail ? e.detail : sec.diaEstado;
    if (!s) return;
    var mudou = s.i !== estado.i;
    estado = s;
    botoes.forEach(function (b, k) { b.classList.toggle('ativo', k === s.i); b.classList.toggle('visto', k < s.i); });
    rolos.forEach(function (r) { r.style.setProperty('--k', s.i); });
    medirLinha(s.i, s.t);
    // o texto do momento abre e fecha em 480 ms e empurra os pontos: a linha acompanha até assentar
    if (mudou) {
      var ate = performance.now() + 620;
      cancelAnimationFrame(acompanhar);
      var seguir = function () { medirLinha(estado.i, estado.t); if (performance.now() < ate) acompanhar = requestAnimationFrame(seguir); };
      acompanhar = requestAnimationFrame(seguir);
    }
  };
  sec.addEventListener('dia:passo', passo);
  window.addEventListener('resize', function () { medirLinha(estado.i, estado.t); });
  // a página aberta direto em #um-dia: o texto do primeiro momento abre depois da primeira medida e empurra os pontos
  // sem trocar de momento; a linha mede de novo sempre que um momento muda de tamanho e quando as letras chegam
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { medirLinha(estado.i, estado.t); }); itens.forEach(function (li) { ro.observe(li); }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { medirLinha(estado.i, estado.t); });
  passo();
})();
