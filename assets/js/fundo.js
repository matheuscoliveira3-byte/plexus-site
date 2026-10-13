// O fundo verde em movimento do topo (a técnica medida pela frente 3 da pesquisa, 12/10/2026).
// O topo nasce com a imagem parada (fundo-960.webp, 5 KB, no CSS). O shader só liga depois da
// primeira pintura, em tela larga, com placa de vídeo e sem pedido de menos movimento; fora disso,
// fica a imagem parada. Desenha em 1x até 1,5 Mpx e importa só os módulos usados da Paper 0.0.81.
// V2: a paleta volta a ser a da V0 «cinema», com os tons claros que dão o movimento (o pedido dele), e o
// verde da marca #4a643c no lugar do #3e5433 de lá. O véu leve que escurece o fundo está no CSS do topo.
// 14/10 (a decisão dele de 13/10, 10:19, «C»): só o creme fica mais fechado, de #d8d3bd para #9c998a; os verdes não mudam.
const CORES = ['#141b10', '#4a643c', '#8ea57a', '#9c998a', '#24311d', '#5f7a4c'];
const VELOCIDADE = 0.22;

const el = document.querySelector('.hero-media');

function semPlaca() {
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const nome = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '';
  return /swiftshader|llvmpipe|basic render|software/i.test(nome);
}

async function ligar() {
  if (!el) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!matchMedia('(min-width: 1024px)').matches) return;
  if (semPlaca()) return;
  const { ShaderMount, meshGradientFragmentShader, getShaderColorFromString, ShaderFitOptions } =
    await import('../vendor/paper-shaders-0.0.81/fundo.js');
  const cores = CORES.map(getShaderColorFromString);
  let fundo;
  try {
    fundo = new ShaderMount(el, meshGradientFragmentShader, {
      u_colors: cores, u_colorsCount: cores.length,
      u_distortion: 0.85, u_swirl: 0.4, u_grainMixer: 0, u_grainOverlay: 0.14,
      u_fit: ShaderFitOptions.cover, u_scale: 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0,
      u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0,
    }, undefined, VELOCIDADE, 40, 1, 1.5e6);
  } catch {
    return; // sem WebGL 2: fica a imagem parada
  }
  requestAnimationFrame(() => el.classList.add('vivo'));

  // O vigia do primeiro segundo: se a máquina não der 30 quadros, o fundo para.
  let quadros = 0;
  const t0 = performance.now();
  (function contar(t) {
    quadros++;
    if (t - t0 < 1000) requestAnimationFrame(contar);
    else if (quadros < 30) fundo.setSpeed(0);
  })(t0);
  // O botão de pausar saiu na página provisória (o recado dele de 13/10, 10:48, «isso pode remover»).
  // Quem pede menos movimento no sistema continua com a imagem parada.
}

('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(ligar, { timeout: 1500 });
