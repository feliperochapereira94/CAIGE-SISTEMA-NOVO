// Gerenciador de Usuários - PT-BR Schema
class GerenciadorUsuarios {
  constructor() {
    this.editandoIdUsuario = null;
    this.cursos = [];
    this.usuarios = [];
    this.API_BASE = '/api';
    this.paginacao = null;
    this.init();
  }

  async init() {
    await this.carregarCursos();
    this.setupFormularios();
    await this.carregarUsuarios();
  }

  // Carregar lista de cursos disponíveis
  async carregarCursos() {
    try {
      const response = await fetch(`${this.API_BASE}/cursos`);
      if (response.ok) {
        const data = await response.json();
        this.cursos = data.cursos || data;
        this.atualizarSelectCursos();
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  }

  // Atualizar selects de cursos
  atualizarSelectCursos() {
    const selectores = ['#curso-novo', '#curso-edicao'];
    selectores.forEach(selector => {
      const select = document.querySelector(selector);
      if (select) {
        // Limpar opções existentes
        select.innerHTML = '<option value="">Selecione um curso</option>';
        this.cursos.forEach(curso => {
          const option = document.createElement('option');
          option.value = curso.id;
          option.textContent = curso.nome;
          select.appendChild(option);
        });
      }
    });
  }

  // Atualizar exibição do campo de curso baseado no papel
  setupFormularios() {
    // Novo usuário
    const papelSelect = document.querySelector('#papel-novo');
    const cursoGroup = document.querySelector('[data-group="curso-novo"]');
    
    if (papelSelect && cursoGroup) {
      papelSelect.addEventListener('change', (e) => {
        const ehProfessor = e.target.value === 'PROFESSOR';
        cursoGroup.style.display = ehProfessor ? 'block' : 'none';
        if (!ehProfessor) {
          document.querySelector('#curso-novo').value = '';
        }
      });
    }

    const papelEdicao = document.querySelector('#papel-edicao');
    const cursoEdicaoGroup = document.querySelector('[data-group="curso-edicao"]');
    if (papelEdicao && cursoEdicaoGroup) {
      papelEdicao.addEventListener('change', (e) => {
        const ehProfessor = e.target.value === 'PROFESSOR';
        cursoEdicaoGroup.style.display = ehProfessor ? 'block' : 'none';
        if (!ehProfessor) {
          document.querySelector('#curso-edicao').value = '';
        }
      });
    }

    // Formulário de criação
    const formCriar = document.getElementById('form-criar-usuario');
    if (formCriar) {
      formCriar.addEventListener('submit', (e) => this.aoSubmeterNovo(e));
    }

    // Formulário de edição
    const formEditar = document.getElementById('form-editar-usuario');
    if (formEditar) {
      formEditar.addEventListener('submit', (e) => this.aoSubmeterEdicao(e));
    }
  }

  configurarPaginacao() {
    if (this.paginacao || typeof PaginacaoLista === 'undefined') {
      return;
    }

    this.paginacao = new PaginacaoLista({
      seletorQuantidade: '#usuarios-page-size',
      seletorPaginacao: '#usuarios-pagination',
      seletorIndicador: '#usuarios-page-indicator',
      seletorPrimeira: '#usuarios-first-page',
      seletorAnterior: '#usuarios-prev-page',
      seletorProxima: '#usuarios-next-page',
      seletorUltima: '#usuarios-last-page',
      tamanhoPadrao: 10,
      aoRenderizar: (usuariosDaPagina) => {
        this.renderizarUsuariosDaPagina(usuariosDaPagina);
      }
    });
  }


  async aoSubmeterNovo(e) {
    e.preventDefault();
    
    const email = document.querySelector('#email-novo').value.trim();
    const nome = document.querySelector('#nome-novo').value.trim();
    const senha = document.querySelector('#senha-nova').value;
    const papel = document.querySelector('#papel-novo').value;
    const idCurso = papel === 'PROFESSOR' ? document.querySelector('#curso-novo').value : null;
    const ativo = document.querySelector('#ativo-novo')?.checked ?? true;

    // Validações
    if (!email || !nome || !senha || !papel) {
      notify.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (papel === 'PROFESSOR' && !idCurso) {
      notify.error('Selecione um curso para professores');
      return;
    }

    const nomeNormalizado = window.FormatadorTexto ? window.FormatadorTexto.formatarNomePessoa(nome) : nome;

    try {
      const response = await fetch(`${this.API_BASE}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nome: nomeNormalizado,
          password: senha,
          papel,
          idCurso: idCurso ? parseInt(idCurso) : null,
          ativo
        })
      });

      const data = await response.json();
      if (response.ok) {
        notify.success('Usuário criado com sucesso!');
        document.getElementById('form-criar-usuario').reset();
        await this.carregarUsuarios();
      } else {
        notify.error(data.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro:', error);
      notify.error('Erro ao conectar com o servidor');
    }
  }

  async aoSubmeterEdicao(e) {
    e.preventDefault();

    if (!this.editandoIdUsuario) {
      notify.error('Nenhum usuário selecionado');
      return;
    }

    const email = document.querySelector('#email-edicao').value.trim();
    const nome = document.querySelector('#nome-edicao').value.trim();
    const papel = document.querySelector('#papel-edicao').value;
    const idCurso = papel === 'PROFESSOR' ? document.querySelector('#curso-edicao').value : null;
    const ativo = document.querySelector('#ativo-edicao')?.checked ?? true;
    const novaSenha = document.querySelector('#senha-edicao')?.value || '';
    const confirmacaoNovaSenha = document.querySelector('#senha-edicao-confirmacao')?.value || '';

    if (!email || !nome || !papel) {
      notify.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (papel === 'PROFESSOR' && !idCurso) {
      notify.error('Selecione um curso para professores');
      return;
    }

    if (novaSenha || confirmacaoNovaSenha) {
      if (novaSenha.length < 6) {
        notify.warning('A nova senha deve ter no mínimo 6 caracteres');
        return;
      }

      if (novaSenha !== confirmacaoNovaSenha) {
        notify.warning('A confirmação da nova senha não confere');
        return;
      }
    }

    const usuarioAtual = this.usuarios.find((usuario) => usuario.id === this.editandoIdUsuario);
    const nomeAtual = usuarioAtual?.nome || '';
    const alterouNome = nome !== nomeAtual;
    const alterouSenha = Boolean(novaSenha);
    let senhaSupervisor = null;

    if (alterouNome || alterouSenha) {
      senhaSupervisor = await this.solicitarSenhaSupervisor();
      if (!senhaSupervisor) return;
    }

    const nomeNormalizado = window.FormatadorTexto
      ? window.FormatadorTexto.formatarNomePessoa(nome)
      : nome;

    try {
      const response = await fetch(`${this.API_BASE}/usuarios/${this.editandoIdUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nome: nomeNormalizado,
          papel,
          idCurso: idCurso ? parseInt(idCurso) : null,
          ativo,
          ...(alterouSenha ? { novaSenha } : {}),
          ...((alterouNome || alterouSenha) ? { senhaSupervisor } : {})
        })
      });

      const data = await response.json();
      if (response.ok) {
        notify.success(alterouSenha ? 'Usuário e senha atualizados com sucesso!' : 'Usuário atualizado com sucesso!');
        document.getElementById('modal-editar-usuario').style.display = 'none';
        this.editandoIdUsuario = null;
        await this.carregarUsuarios();
      } else {
        notify.error(data.message || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      console.error('Erro:', error);
      notify.error('Erro ao conectar com o servidor');
    }
  }

  solicitarSenhaSupervisor() {
    return new Promise((resolve) => {
      const modal = document.getElementById('modal-confirmar-senha');
      const input = document.getElementById('senha-supervisor-confirmacao');
      const confirmar = document.getElementById('confirmar-senha-supervisor');
      if (!modal || !input || !confirmar) {
        resolve(null);
        return;
      }
      const finalizar = (senha) => {
        confirmar.removeEventListener('click', aoConfirmar);
        modal.querySelectorAll('.modal__close').forEach((botao) => botao.removeEventListener('click', aoCancelar));
        modal.style.display = 'none';
        input.value = '';
        resolve(senha);
      };
      const aoConfirmar = () => finalizar(input.value.trim() || null);
      const aoCancelar = () => finalizar(null);
      confirmar.addEventListener('click', aoConfirmar);
      modal.querySelectorAll('.modal__close').forEach((botao) => botao.addEventListener('click', aoCancelar));
      modal.style.display = 'flex';
      input.focus();
    });
  }

  async carregarUsuarios() {
    try {
      const response = await fetch(`${this.API_BASE}/usuarios`);

      if (response.ok) {
        const data = await response.json();

        this.usuarios = data.usuarios || data;

        this.configurarPaginacao();

        if (this.paginacao) {
          this.paginacao.definirItens(this.usuarios);
        } else {
          this.renderizarUsuariosDaPagina(this.usuarios);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      notify.error('Erro ao carregar usuários');
    }
  }

  renderizarUsuariosDaPagina(usuariosDaPagina) {
    const listContainer = document.getElementById('lista-usuarios');
    if (!listContainer) return;

    if (!Array.isArray(usuariosDaPagina) || usuariosDaPagina.length === 0) {
      listContainer.innerHTML = `
        <div class="admin-empty-state lista-entidades__vazio">
          Nenhum usuário cadastrado
        </div>
      `;
      return;
    }

    const nomesCursos = {};
    this.cursos.forEach((curso) => {
      nomesCursos[curso.id] = curso.nome;
    });

    listContainer.innerHTML = usuariosDaPagina.map((usuario) => {
      const curso = usuario.idCurso
        ? (nomesCursos[usuario.idCurso] || '-')
        : '-';

      const classePapel =
        usuario.papel === 'SUPERVISOR'
          ? 'supervisor'
          : 'professor';

      const status =
        usuario.ativo
          ? 'Ativo'
          : 'Inativo';

      return `
        <div class="user-item lista-entidades__item lista-entidades__item--horizontal lista-entidades__item--interativo admin-actionable-item">
          <div class="user-info lista-entidades__conteudo">
            <div class="user-name lista-entidades__titulo">
              ${(window.FormatadorTexto && usuario.nome) ? window.FormatadorTexto.formatarNomePessoa(usuario.nome) : (usuario.nome || usuario.email)}
            </div>

            <div class="user-primary-meta lista-entidades__meta">
              <span class="user-email-text">${usuario.email}</span>

              <span class="role-badge ${classePapel}">
                ${usuario.papel}
              </span>
            </div>

            <div class="user-course-line lista-entidades__meta">
              <span class="user-course-label">Curso:</span>
              <span class="user-course-value">${curso}</span>
              <span class="user-status-separator">•</span>
              <span class="user-status-text">${status}</span>
            </div>
          </div>

          <div class="user-actions lista-entidades__acoes">
            <button
              class="btn-small"
              onclick="gerenciadorUsuarios.abrirEdicao(${usuario.id})"
            >
              Editar
            </button>

            <button
              class="btn-small btn-small-danger"
              onclick="gerenciadorUsuarios.desativarUsuario(${usuario.id})"
            >
              Desativar
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  abrirEdicao(usuarioId) {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    if (!usuario) {
      notify.error('Usuário não encontrado');
      return;
    }

    this.editandoIdUsuario = usuarioId;
    
    document.querySelector('#email-edicao').value = usuario.email;
    document.querySelector('#nome-edicao').value = (window.FormatadorTexto && usuario.nome) ? window.FormatadorTexto.formatarNomePessoa(usuario.nome) : (usuario.nome || '');
    document.querySelector('#papel-edicao').value = usuario.papel;
    document.querySelector('#curso-edicao').value = usuario.idCurso || '';
    document.querySelector('#ativo-edicao').checked = usuario.ativo !== 0 && usuario.ativo !== false;
    const senhaEdicao = document.querySelector('#senha-edicao');
    const senhaEdicaoConfirmacao = document.querySelector('#senha-edicao-confirmacao');
    if (senhaEdicao) senhaEdicao.value = '';
    if (senhaEdicaoConfirmacao) senhaEdicaoConfirmacao.value = '';

    // Atualizar visibilidade do campo curso
    const cursoGroupEdicao = document.querySelector('[data-group="curso-edicao"]');
    if (cursoGroupEdicao) {
      cursoGroupEdicao.style.display = usuario.papel === 'PROFESSOR' ? 'block' : 'none';
    }

    document.getElementById('modal-editar-usuario').style.display = 'flex';
  }

  async desativarUsuario(usuarioId) {
    let confirmado = false;
    if (window.ModalConfirmacao && typeof window.ModalConfirmacao.confirmar === 'function') {
      confirmado = await window.ModalConfirmacao.confirmar({
        titulo: 'Desativar Usuário',
        mensagem: 'Tem certeza que deseja desativar este usuário?',
        variante: 'aviso',
        textoConfirmar: 'Desativar',
        textoCancelar: 'Cancelar',
        icone: 'alerta'
      });
    }
    if (!confirmado) return;

    try {
      const response = await fetch(`${this.API_BASE}/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: false })
      });

      if (response.ok) {
        notify.success('Usuário desativado com sucesso!');
        await this.carregarUsuarios();
      } else {
        notify.error('Erro ao desativar usuário');
      }
    } catch (error) {
      console.error('Erro:', error);
      notify.error('Erro ao conectar com o servidor');
    }
  }
}

// Instanciar ao carregar
let gerenciadorUsuarios;
document.addEventListener('DOMContentLoaded', () => {
  gerenciadorUsuarios = new GerenciadorUsuarios();
});
