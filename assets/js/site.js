// O roteiro comum do site do Plexus: a barra que ganha o creme ao rolar, o pedido de entrada e o
// índice do «Um dia com o Plexus». Sem ele a página continua inteira: a barra fica creme desde o
// começo, o pedido envia pelo próprio formulário e o índice vira uma lista de links.
(function () {
  // A barra: transparente sobre o topo verde; ganha o creme assim que a página rola (a Legora).
  var nav = document.getElementById('nav');
  var palco = document.querySelector('.hero .stage');
  if (nav && palco) {
    var rolar = function () {
      nav.classList.toggle('rolou', window.scrollY > 8);
    };
    window.addEventListener('scroll', rolar, { passive: true });
    window.addEventListener('resize', rolar, { passive: true });
    rolar();
  }

  // O pedido de entrada. A resposta é sempre a mesma frase, exista ou não o e-mail (a spec, F4).
  // Só o endereço do site no ar envia de verdade; a prévia na rede privada mostra a resposta sem enviar.
  var noAr = ['plexusbrain.com', 'www.plexusbrain.com'].indexOf(location.hostname) >= 0;
  var RECEBIDO = 'Você está na lista de espera. Se a sua entrada for liberada, o convite chega neste e-mail.';
  var CONTATO = 'matheus@plexusbrain.com';
  // Enquanto a máquina não recebe o pedido do site (16/10: a rota não está no ar e o site manda o corpo
  // em formulário, quando a borda pede JSON), o envio não sai e a pessoa lê para onde escrever (a opção A dele).
  var RECEBENDO = false;
  var FECHADO = 'Ainda não estamos recebendo inscrições por aqui. Escreva para ' + CONTATO + ' e eu te coloco na lista.';
  document.querySelectorAll('.ask form').forEach(function (form) {
    var caixa = form.parentElement;
    var campo = form.querySelector('input[type=email]');
    var isca = form.querySelector('.isca');
    var botao = form.querySelector('button[type=submit]');
    var erro = form.querySelector('.erro');
    var aviso = caixa.querySelector('.aviso');
    // o roteiro confere o e-mail e escreve o erro em texto; sem ele, o navegador confere sozinho
    form.noValidate = true;
    var feito = function () {
      caixa.classList.add('feito');
      aviso.textContent = RECEBIDO + (noAr ? '' : ' Nesta prévia, nada foi enviado.');
      aviso.focus();
    };
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      erro.textContent = '';
      campo.removeAttribute('aria-invalid');
      campo.value = campo.value.trim();
      if (!campo.value || !campo.checkValidity()) {
        erro.textContent = campo.value ? 'Confira o e-mail. Falta o @ ou o domínio.' : 'Escreva o seu e-mail para entrar na lista de espera.';
        campo.setAttribute('aria-invalid', 'true');
        campo.focus();
        return;
      }
      if (isca && isca.value) { feito(); return; }
      if (!RECEBENDO) { aviso.textContent = FECHADO; aviso.focus(); return; }
      if (!noAr) { feito(); return; }
      botao.disabled = true;
      aviso.textContent = 'Enviando o seu pedido.';
      var sinal = window.AbortSignal && AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined;
      fetch(form.action, {
        method: 'POST', mode: 'cors', credentials: 'omit', signal: sinal,
        body: new URLSearchParams({ email: campo.value })
      }).then(function (r) {
        if (r.ok) { feito(); return; }
        if (r.status === 429) {
          var s = Number(r.headers.get('Retry-After')) || 60;
          var min = Math.max(1, Math.ceil(s / 60));
          aviso.textContent = 'Muitos pedidos agora. Tente de novo em ' + min + (min > 1 ? ' minutos.' : ' minuto.');
          return;
        }
        throw new Error('resposta ' + r.status);
      }).catch(function () {
        aviso.textContent = 'Não conseguimos registrar o seu e-mail. Tente de novo em instantes ou escreva para ' + CONTATO + '.';
      }).then(function () { botao.disabled = false; });
    });
  });

  // O índice preso do «Um dia com o Plexus»: o momento no meio da tela fica escuro no índice.
  var links = document.querySelectorAll('.day-index a');
  if (links.length && 'IntersectionObserver' in window) {
    var porId = {};
    links.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });
    var marcar = function (a) {
      links.forEach(function (l) { l.removeAttribute('aria-current'); });
      a.setAttribute('aria-current', 'step');
    };
    marcar(links[0]);
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting && porId[e.target.id]) marcar(porId[e.target.id]); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('.moment').forEach(function (m) { io.observe(m); });
  }
})();
