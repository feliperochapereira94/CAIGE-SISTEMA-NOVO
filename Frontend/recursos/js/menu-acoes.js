// =========================================================
// CAIGE - MENU FLUTUANTE DE AÇÕES
// =========================================================
//
// Componente reutilizável para menus de "⋮".
// O menu é renderizado diretamente no <body>, evitando cortes
// por overflow de tabelas, cards, modais e containers.
//
// Uso:
// MenuAcoes.abrir(botao, [
//   { rotulo: 'Ver perfil', acao: () => {} },
//   { rotulo: 'Editar', acao: () => {} }
// ]);
// =========================================================

class MenuAcoes {
  static elemento = null;
  static botaoAtual = null;
  static fechamentoPendente = null;

  static _garantirElemento() {
    if (this.elemento) {
      return this.elemento;
    }

    const menu = document.createElement('div');

    menu.className = 'floating-actions-menu';
    menu.setAttribute('role', 'menu');
    menu.hidden = true;

    document.body.appendChild(menu);

    this.elemento = menu;

    document.addEventListener('click', (evento) => {
      if (
        this.elemento &&
        !this.elemento.contains(evento.target) &&
        !this.botaoAtual?.contains(evento.target)
      ) {
        this.fechar();
      }
    });

    window.addEventListener(
      'resize',
      () => this.fechar(),
      { passive: true }
    );

    window.addEventListener(
      'scroll',
      () => this.fechar(),
      true
    );

    return menu;
  }

  static _obterEscalaInterface() {
    const corpo = document.body;

    if (!corpo?.classList.contains('caige-ui-escalada')) {
      return 1;
    }

    const valor = getComputedStyle(document.documentElement)
      .getPropertyValue('--escala-ui-desktop')
      .trim();

    const escala = Number.parseFloat(valor);

    return Number.isFinite(escala) && escala > 0
      ? escala
      : 1;
  }

  static abrir(botao, itens = []) {
    if (!botao || !Array.isArray(itens)) {
      return;
    }

    const menu = this._garantirElemento();

    this._cancelarFechamentoPendente();

    const mesmoBotao =
      this.botaoAtual === botao &&
      !menu.hidden;

    if (mesmoBotao) {
      this.fechar();
      return;
    }

    this.fechar(true);

    menu.innerHTML = '';

    itens
      .filter((item) => item && item.rotulo)
      .forEach((item) => {
        const opcao = document.createElement('button');

        opcao.type = 'button';
        opcao.className =
          `floating-actions-menu__item${item.perigo ? ' floating-actions-menu__item--danger' : ''}`;

        opcao.textContent = item.rotulo;

        opcao.addEventListener('click', async () => {
          this.fechar();

          if (typeof item.acao === 'function') {
            await item.acao();
          }
        });

        menu.appendChild(opcao);
      });

    if (!menu.children.length) {
      return;
    }

    menu.hidden = false;
    menu.style.visibility = 'hidden';

    this.botaoAtual = botao;

    /*
      O Shell desktop pode estar dentro de uma viewport virtual escalada
      com transform: scale(). getBoundingClientRect() devolve coordenadas
      físicas da viewport, enquanto left/top do menu, por estar dentro do
      body transformado, trabalham no sistema virtual. Convertemos tudo
      para a mesma unidade antes de posicionar o menu.
    */
    const escala = this._obterEscalaInterface();
    const retanguloFisico = botao.getBoundingClientRect();
    const retangulo = {
      left: retanguloFisico.left / escala,
      right: retanguloFisico.right / escala,
      top: retanguloFisico.top / escala,
      bottom: retanguloFisico.bottom / escala
    };

    const largura = Math.max(140, menu.offsetWidth || 140);
    const altura = menu.offsetHeight || 80;

    const larguraViewport =
      (document.documentElement.clientWidth || window.innerWidth) / escala;
    const alturaViewport =
      (document.documentElement.clientHeight || window.innerHeight) / escala;

    let esquerda = retangulo.right - largura;
    let topo = retangulo.bottom + 6;

    const margem = 8;

    if (esquerda < margem) {
      esquerda = margem;
    }

    if (esquerda + largura > larguraViewport - margem) {
      esquerda = larguraViewport - largura - margem;
    }

    if (topo + altura > alturaViewport - margem) {
      topo = retangulo.top - altura - 6;
    }

    if (topo < margem) {
      topo = margem;
    }

    menu.style.left = `${Math.round(esquerda)}px`;
    menu.style.top = `${Math.round(topo)}px`;
    menu.style.visibility = 'visible';

    botao.setAttribute('aria-haspopup', 'menu');
    botao.setAttribute('aria-expanded', 'true');
  }

  static _cancelarFechamentoPendente() {
    if (!this.elemento) {
      return;
    }

    if (this.fechamentoPendente) {
      this.elemento.removeEventListener(
        'animationend',
        this.fechamentoPendente
      );
      this.fechamentoPendente = null;
    }

    this.elemento.classList.remove('caige-dropdown-closing');
  }

  static fechar(imediato = false) {
    if (!this.elemento) {
      return;
    }

    const menu = this.elemento;
    const botaoAnterior = this.botaoAtual;

    if (botaoAnterior) {
      botaoAnterior.setAttribute('aria-expanded', 'false');
    }

    this.botaoAtual = null;

    const finalizarFechamento = () => {
      this._cancelarFechamentoPendente();
      menu.hidden = true;
      menu.innerHTML = '';
      menu.style.visibility = '';
    };

    if (menu.hidden) {
      finalizarFechamento();
      return;
    }

    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

    if (imediato || prefersReducedMotion) {
      finalizarFechamento();
      return;
    }

    if (menu.classList.contains('caige-dropdown-closing')) {
      return;
    }

    this.fechamentoPendente = (event) => {
      if (event.animationName !== 'caige-dropdown-sair') {
        return;
      }

      finalizarFechamento();
    };

    menu.addEventListener(
      'animationend',
      this.fechamentoPendente
    );

    menu.classList.add('caige-dropdown-closing');
  }
}

window.MenuAcoes = MenuAcoes;
