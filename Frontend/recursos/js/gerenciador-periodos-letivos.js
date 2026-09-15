(() => {
  const DIAS_SEMANA = Object.freeze({
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
    7: 'Domingo'
  });

  const DIAS_CURTOS = Object.freeze({
    1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb', 7: 'Dom'
  });

  const estado = {
    periodos: [],
    periodoAtual: null,
    cursos: [],
    grade: [],
    configuracaoEditando: null,
    excecoes: []
  };

  const $ = (seletor) => document.querySelector(seletor);

  function formatarData(dataIso) {
    if (!dataIso) return '-';
    const [ano, mes, dia] = String(dataIso).slice(0, 10).split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : dataIso;
  }

  function statusClasse(status) {
    if (status === 'ATIVO') return 'active';
    if (status === 'ENCERRADO') return 'inactive';
    return 'planned';
  }

  function chaveConfiguracao(item) {
    return `${Number(item.idCurso)}:${item.idAtividade ? Number(item.idAtividade) : 0}`;
  }

  function descricaoConfiguracao(configuracao) {
    return configuracao.atividade
      ? `${configuracao.curso} · ${configuracao.atividade}`
      : `${configuracao.curso} · Atendimento geral`;
  }

  async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(url, opcoes);
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      throw new Error(dados.message || 'Não foi possível concluir a operação');
    }
    return dados;
  }

  function preencherFormularioPeriodo(periodo = null) {
    $('#periodo-letivo-id').value = periodo?.id || '';
    $('#periodo-letivo-ano').value = periodo?.ano || new Date().getFullYear();
    $('#periodo-letivo-semestre').value = periodo?.semestre || (new Date().getMonth() < 6 ? 1 : 2);
    $('#periodo-letivo-inicio').value = periodo?.dataInicio ? String(periodo.dataInicio).slice(0, 10) : '';
    $('#periodo-letivo-fim').value = periodo?.dataFim ? String(periodo.dataFim).slice(0, 10) : '';
    $('#periodo-letivo-status').value = periodo?.status || 'PLANEJADO';
    $('#periodo-letivo-form-titulo').textContent = periodo ? 'Editar semestre' : 'Novo semestre';
    $('#periodo-letivo-cancelar').hidden = !periodo;
  }

  function ordenarPeriodosMaisRecentes(periodos) {
    return [...periodos].sort((a, b) => {
      const ano = Number(b.ano) - Number(a.ano);
      if (ano !== 0) return ano;
      return Number(b.semestre) - Number(a.semestre);
    });
  }

  function htmlPeriodo(periodo, { historico = false } = {}) {
    const selecionado = Number(estado.periodoAtual?.id) === Number(periodo.id);
    return `
      <article class="periodo-item lista-entidades__item lista-entidades__item--horizontal ${historico ? 'periodo-item--historico' : ''} ${selecionado ? 'periodo-item--selecionado' : ''}">
        <div class="lista-entidades__conteudo">
          <div class="lista-entidades__titulo">${periodo.ano}/${periodo.semestre}</div>
          <div class="lista-entidades__meta">${formatarData(periodo.dataInicio)} a ${formatarData(periodo.dataFim)}</div>
          <div class="lista-entidades__meta"><span class="status-badge ${statusClasse(periodo.status)}">${periodo.status}</span></div>
        </div>
        <div class="lista-entidades__acoes">
          <button type="button" class="btn-small" data-periodo-gerenciar="${periodo.id}">Calendário</button>
          ${periodo.status !== 'ENCERRADO' ? `<button type="button" class="btn-small" data-periodo-editar="${periodo.id}">Editar</button>` : ''}
        </div>
      </article>
    `;
  }

  function htmlHistoricoPeriodos(periodos) {
    const porAno = periodos.reduce((grupos, periodo) => {
      const ano = String(periodo.ano);
      if (!grupos[ano]) grupos[ano] = [];
      grupos[ano].push(periodo);
      return grupos;
    }, {});

    return Object.keys(porAno)
      .sort((a, b) => Number(b) - Number(a))
      .map((ano) => `
        <section class="periodos-historico__ano">
          <h4 class="periodos-historico__titulo-ano">${ano}</h4>
          <div class="periodos-historico__lista">
            ${porAno[ano].map((periodo) => htmlPeriodo(periodo, { historico: true })).join('')}
          </div>
        </section>
      `)
      .join('');
  }

  function renderizarPeriodos() {
    const lista = $('#periodos-letivos-lista');
    if (!lista) return;

    if (!estado.periodos.length) {
      lista.innerHTML = '<p class="admin-empty-state lista-entidades__vazio">Nenhum semestre cadastrado.</p>';
      return;
    }

    const ordenados = ordenarPeriodosMaisRecentes(estado.periodos);
    const atuais = ordenados.filter((periodo) => periodo.status !== 'ENCERRADO');
    const encerrados = ordenados.filter((periodo) => periodo.status === 'ENCERRADO');
    const encerradosRecentes = encerrados.slice(0, 2);
    const historico = encerrados.slice(2);
    const principais = [...atuais, ...encerradosRecentes];

    lista.innerHTML = `
      <div class="periodos-principais">
        ${principais.map((periodo) => htmlPeriodo(periodo)).join('')}
      </div>
      ${historico.length ? `
        <div class="periodos-historico">
          <button
            type="button"
            class="periodos-historico__accordion"
            data-periodos-historico-toggle
            aria-expanded="false"
          >
            <span class="periodos-historico__resumo">
              <strong>Histórico de semestres</strong>
              <span class="periodos-historico__contador">${historico.length} ${historico.length === 1 ? 'período' : 'períodos'}</span>
            </span>
            <span class="periodos-historico__seta" aria-hidden="true"></span>
          </button>
          <div class="periodos-historico__conteudo" data-periodos-historico hidden>
            ${htmlHistoricoPeriodos(historico)}
          </div>
        </div>
      ` : ''}
    `;
  }

  async function carregarPeriodos({ preservarSelecao = true } = {}) {
    const idAtual = preservarSelecao ? estado.periodoAtual?.id : null;
    estado.periodos = await requisicao('/api/periodos-letivos');
    estado.periodoAtual = idAtual
      ? estado.periodos.find((item) => Number(item.id) === Number(idAtual)) || null
      : null;
    renderizarPeriodos();
  }

  async function salvarPeriodo(evento) {
    evento.preventDefault();
    const id = $('#periodo-letivo-id').value;
    const payload = {
      ano: Number($('#periodo-letivo-ano').value),
      semestre: Number($('#periodo-letivo-semestre').value),
      dataInicio: $('#periodo-letivo-inicio').value,
      dataFim: $('#periodo-letivo-fim').value,
      status: $('#periodo-letivo-status').value
    };

    try {
      const periodo = await requisicao(id ? `/api/periodos-letivos/${id}` : '/api/periodos-letivos', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      notify.success(id ? 'Semestre atualizado' : 'Semestre criado');
      preencherFormularioPeriodo();
      await carregarPeriodos({ preservarSelecao: true });
      if (estado.periodoAtual && Number(estado.periodoAtual.id) === Number(periodo.id)) {
        estado.periodoAtual = periodo;
        atualizarCabecalhoPeriodo();
      }
    } catch (error) {
      notify.error(error.message);
    }
  }

  function atualizarCabecalhoPeriodo() {
    const bloco = $('#periodo-letivo-detalhes');
    if (!bloco) return;
    bloco.hidden = !estado.periodoAtual;
    if (!estado.periodoAtual) return;

    $('#periodo-selecionado-titulo').textContent = `Semestre ${estado.periodoAtual.ano}/${estado.periodoAtual.semestre}`;
    $('#periodo-selecionado-meta').textContent = `${formatarData(estado.periodoAtual.dataInicio)} a ${formatarData(estado.periodoAtual.dataFim)} · ${estado.periodoAtual.status}`;

    const bloqueado = estado.periodoAtual.status === 'ENCERRADO';
    $('#grade-periodo-form')?.querySelectorAll('input, select, button').forEach((elemento) => {
      elemento.disabled = bloqueado;
    });
    $('#excecao-periodo-form')?.querySelectorAll('input, select, button').forEach((elemento) => {
      elemento.disabled = bloqueado;
    });
  }

  async function abrirCalendarioHistorico(id) {
    const periodo = estado.periodos.find((item) => Number(item.id) === Number(id));
    if (!periodo) return;

    const modal = $('#modal-calendario-periodo');
    if (!modal) {
      selecionarPeriodo(id);
      return;
    }

    $('#modal-calendario-periodo-titulo').textContent = `Calendário do semestre ${periodo.ano}/${periodo.semestre}`;
    $('#modal-calendario-periodo-datas').textContent = `${formatarData(periodo.dataInicio)} a ${formatarData(periodo.dataFim)}`;
    $('#modal-calendario-periodo-status').textContent = periodo.status;
    $('#modal-calendario-periodo-dias').textContent = 'Carregando...';
    modal.style.display = 'flex';

    try {
      const grade = await requisicao(`/api/periodos-letivos/${periodo.id}/grade`);
      const dias = [...new Set((Array.isArray(grade) ? grade : [])
        .map((item) => Number(item.diaSemana))
        .filter((dia) => DIAS_SEMANA[dia]))]
        .sort((a, b) => a - b);

      $('#modal-calendario-periodo-dias').textContent = dias.length
        ? dias.map((dia) => DIAS_SEMANA[dia]).join(', ')
        : 'Nenhum dia cadastrado';
    } catch (error) {
      $('#modal-calendario-periodo-dias').textContent = 'Não foi possível carregar';
      notify.error(error.message);
    }
  }

  async function selecionarPeriodo(id) {
    estado.periodoAtual = estado.periodos.find((item) => Number(item.id) === Number(id)) || null;
    estado.configuracaoEditando = null;
    renderizarPeriodos();
    atualizarCabecalhoPeriodo();
    limparFormularioGrade();
    if (!estado.periodoAtual) return;
    await Promise.all([carregarGrade(), carregarExcecoes()]);
  }

  async function carregarCursos() {
    const cursos = await requisicao('/api/cursos');
    estado.cursos = (Array.isArray(cursos) ? cursos : cursos.cursos || []).filter((curso) => curso.ativo !== false);

    const select = $('#grade-curso');
    select.innerHTML = '<option value="">Selecione um curso</option>' + estado.cursos
      .map((curso) => `<option value="${curso.id}">${curso.nome}</option>`)
      .join('');
  }

  async function carregarAtividadesCurso(idCurso, idAtividadeSelecionada = null) {
    const atividadeSelect = $('#grade-atividade');
    atividadeSelect.innerHTML = '<option value="">Carregando...</option>';

    if (!idCurso) {
      atividadeSelect.innerHTML = '<option value="">Selecione o curso primeiro</option>';
      return;
    }

    try {
      const atividades = await requisicao(`/api/atividades-atendimento?idCurso=${encodeURIComponent(idCurso)}`);
      atividadeSelect.innerHTML = '<option value="">Atendimento geral do curso</option>' + (Array.isArray(atividades) ? atividades : [])
        .filter((atividade) => atividade.ativo !== false)
        .map((atividade) => `<option value="${atividade.id}">${atividade.nome}</option>`)
        .join('');
      atividadeSelect.value = idAtividadeSelecionada ? String(idAtividadeSelecionada) : '';
    } catch (error) {
      atividadeSelect.innerHTML = '<option value="">Erro ao carregar atividades</option>';
      notify.error(error.message);
    }
  }

  function agruparGrade() {
    const mapa = new Map();
    estado.grade.forEach((item) => {
      const chave = chaveConfiguracao(item);
      if (!mapa.has(chave)) {
        mapa.set(chave, {
          idCurso: Number(item.idCurso),
          curso: item.curso,
          idAtividade: item.idAtividade ? Number(item.idAtividade) : null,
          atividade: item.atividade || null,
          diasSemana: []
        });
      }
      mapa.get(chave).diasSemana.push(Number(item.diaSemana));
    });
    return [...mapa.values()].map((item) => ({
      ...item,
      diasSemana: [...new Set(item.diasSemana)].sort((a, b) => a - b)
    }));
  }

  async function carregarGrade() {
    if (!estado.periodoAtual) return;
    try {
      estado.grade = await requisicao(`/api/periodos-letivos/${estado.periodoAtual.id}/grade`);
      renderizarGrade();
      atualizarOpcoesExcecao();
    } catch (error) {
      notify.error(error.message);
    }
  }

  function renderizarGrade() {
    const lista = $('#grade-periodo-lista');
    if (!lista) return;
    const configuracoes = agruparGrade();

    if (!configuracoes.length) {
      lista.innerHTML = '<p class="admin-empty-state lista-entidades__vazio">Nenhum dia de atendimento cadastrado para este semestre.</p>';
      return;
    }

    lista.innerHTML = configuracoes.map((item) => `
      <article class="grade-item lista-entidades__item lista-entidades__item--horizontal">
        <div class="lista-entidades__conteudo">
          <div class="lista-entidades__titulo">${descricaoConfiguracao(item)}</div>
          <div class="grade-item-dias">
            ${item.diasSemana.map((dia) => `<span class="grade-dia-badge">${DIAS_SEMANA[dia]}</span>`).join('')}
          </div>
        </div>
        <div class="lista-entidades__acoes">
          ${estado.periodoAtual?.status !== 'ENCERRADO' ? `
            <button type="button" class="btn-small" data-grade-editar="${chaveConfiguracao(item)}">Editar</button>
            <button type="button" class="btn-small btn-small-danger" data-grade-remover="${chaveConfiguracao(item)}">Remover</button>
          ` : ''}
        </div>
      </article>
    `).join('');
  }

  function diasMarcados() {
    return Array.from(document.querySelectorAll('input[name="grade-dia"]:checked'))
      .map((input) => Number(input.value))
      .filter(Boolean);
  }

  function marcarDias(dias = []) {
    const conjunto = new Set(dias.map(Number));
    document.querySelectorAll('input[name="grade-dia"]').forEach((input) => {
      input.checked = conjunto.has(Number(input.value));
    });
  }

  function limparFormularioGrade() {
    estado.configuracaoEditando = null;
    $('#grade-periodo-form')?.reset();
    if ($('#grade-atividade')) $('#grade-atividade').innerHTML = '<option value="">Selecione o curso primeiro</option>';
    marcarDias([]);
    $('#grade-periodo-cancelar').hidden = true;
  }

  async function editarConfiguracao(chave) {
    const configuracao = agruparGrade().find((item) => chaveConfiguracao(item) === chave);
    if (!configuracao) return;
    estado.configuracaoEditando = configuracao;
    $('#grade-curso').value = String(configuracao.idCurso);
    await carregarAtividadesCurso(configuracao.idCurso, configuracao.idAtividade);
    marcarDias(configuracao.diasSemana);
    $('#grade-periodo-cancelar').hidden = false;
  }

  async function salvarDias(evento) {
    evento.preventDefault();
    if (!estado.periodoAtual) return;

    const idCurso = Number($('#grade-curso').value);
    const idAtividade = $('#grade-atividade').value ? Number($('#grade-atividade').value) : null;
    const diasSemana = diasMarcados();

    if (!idCurso) {
      notify.error('Selecione um curso');
      return;
    }
    if (!diasSemana.length) {
      notify.error('Marque ao menos um dia da semana');
      return;
    }

    try {
      await requisicao(`/api/periodos-letivos/${estado.periodoAtual.id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCurso, idAtividade, diasSemana })
      });
      notify.success('Dias de atendimento salvos');
      limparFormularioGrade();
      await Promise.all([carregarGrade(), carregarExcecoes()]);
    } catch (error) {
      notify.error(error.message);
    }
  }

  async function removerConfiguracao(chave) {
    const configuracao = agruparGrade().find((item) => chaveConfiguracao(item) === chave);
    if (!configuracao || !estado.periodoAtual) return;

    try {
      await requisicao(`/api/periodos-letivos/${estado.periodoAtual.id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCurso: configuracao.idCurso,
          idAtividade: configuracao.idAtividade,
          diasSemana: []
        })
      });
      notify.success('Atendimento removido do calendário');
      limparFormularioGrade();
      await Promise.all([carregarGrade(), carregarExcecoes()]);
    } catch (error) {
      notify.error(error.message);
    }
  }

  function atualizarOpcoesExcecao() {
    const select = $('#excecao-atendimento');
    if (!select) return;
    const configuracoes = agruparGrade();
    select.innerHTML = '<option value="">Selecione</option>' + configuracoes
      .map((item) => `<option value="${chaveConfiguracao(item)}">${descricaoConfiguracao(item)}</option>`)
      .join('');
  }

  function atualizarEscopoExcecao() {
    const especifico = $('#excecao-escopo').value === 'ATENDIMENTO';
    $('#excecao-atendimento-campo').hidden = !especifico;
    $('#excecao-atendimento').required = especifico;
    if (!especifico) $('#excecao-atendimento').value = '';
  }

  async function carregarExcecoes() {
    if (!estado.periodoAtual) return;
    try {
      estado.excecoes = await requisicao(`/api/periodos-letivos/${estado.periodoAtual.id}/excecoes`);
      renderizarExcecoes();
    } catch (error) {
      notify.error(error.message);
    }
  }

  function renderizarExcecoes() {
    const lista = $('#excecoes-periodo-lista');
    if (!lista) return;

    if (!estado.excecoes.length) {
      lista.innerHTML = '<p class="admin-empty-state lista-entidades__vazio">Nenhuma data sem atendimento cadastrada.</p>';
      return;
    }

    lista.innerHTML = estado.excecoes.map((item) => {
      const alvo = item.idGrade
        ? (item.atividade ? `${item.curso} · ${item.atividade}` : `${item.curso} · Atendimento geral`)
        : 'Todo o CAIGE';
      return `
        <article class="excecao-item lista-entidades__item lista-entidades__item--horizontal">
          <div class="lista-entidades__conteudo">
            <div class="lista-entidades__titulo excecao-item__data">${formatarData(item.data)}</div>
            <div class="lista-entidades__meta">${alvo}</div>
            ${item.motivo ? `<div class="lista-entidades__meta">${item.motivo}</div>` : ''}
          </div>
          <div class="lista-entidades__acoes">
            ${estado.periodoAtual?.status !== 'ENCERRADO' ? `<button type="button" class="btn-small btn-small-danger" data-excecao-remover="${item.id}">Remover</button>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  async function salvarExcecao(evento) {
    evento.preventDefault();
    if (!estado.periodoAtual) return;

    const escopo = $('#excecao-escopo').value;
    const payload = {
      data: $('#excecao-data').value,
      escopo,
      motivo: $('#excecao-motivo').value.trim()
    };

    if (escopo === 'ATENDIMENTO') {
      const chave = $('#excecao-atendimento').value;
      const configuracao = agruparGrade().find((item) => chaveConfiguracao(item) === chave);
      if (!configuracao) {
        notify.error('Selecione o atendimento que não ocorreu');
        return;
      }
      payload.idCurso = configuracao.idCurso;
      payload.idAtividade = configuracao.idAtividade;
    }

    try {
      await requisicao(`/api/periodos-letivos/${estado.periodoAtual.id}/excecoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      notify.success('Data sem atendimento adicionada');
      $('#excecao-periodo-form').reset();
      atualizarEscopoExcecao();
      await carregarExcecoes();
    } catch (error) {
      notify.error(error.message);
    }
  }

  async function removerExcecao(idExcecao) {
    if (!estado.periodoAtual) return;
    try {
      await requisicao(`/api/periodos-letivos/${estado.periodoAtual.id}/excecoes/${idExcecao}`, { method: 'DELETE' });
      notify.success('Data sem atendimento removida');
      await carregarExcecoes();
    } catch (error) {
      notify.error(error.message);
    }
  }

  function vincularEventos() {
    $('#periodo-letivo-form')?.addEventListener('submit', salvarPeriodo);
    $('#periodo-letivo-cancelar')?.addEventListener('click', () => preencherFormularioPeriodo());
    $('#periodos-letivos-lista')?.addEventListener('click', (evento) => {
      const alternarHistorico = evento.target.closest('[data-periodos-historico-toggle]');
      if (alternarHistorico) {
        const historico = $('#periodos-letivos-lista')?.querySelector('[data-periodos-historico]');
        const aberto = alternarHistorico.getAttribute('aria-expanded') === 'true';
        alternarHistorico.setAttribute('aria-expanded', String(!aberto));
        if (historico) historico.hidden = aberto;
        // Accordion faz parte do fluxo normal do documento:
        // expande/recolhe sem scrollIntoView, scrollTo ou reposicionamento.
        return;
      }

      const gerenciar = evento.target.closest('[data-periodo-gerenciar]');
      if (gerenciar) {
        const periodo = estado.periodos.find((item) => Number(item.id) === Number(gerenciar.dataset.periodoGerenciar));
        if (gerenciar.closest('.periodo-item--historico') && periodo?.status === 'ENCERRADO') {
          abrirCalendarioHistorico(gerenciar.dataset.periodoGerenciar);
        } else {
          selecionarPeriodo(gerenciar.dataset.periodoGerenciar);
        }
      }

      const editar = evento.target.closest('[data-periodo-editar]');
      if (editar) {
        const periodo = estado.periodos.find((item) => Number(item.id) === Number(editar.dataset.periodoEditar));
        if (periodo) preencherFormularioPeriodo(periodo);
      }
    });

    $('#grade-curso')?.addEventListener('change', (evento) => carregarAtividadesCurso(evento.target.value));
    $('#grade-periodo-form')?.addEventListener('submit', salvarDias);
    $('#grade-periodo-cancelar')?.addEventListener('click', limparFormularioGrade);
    $('#grade-periodo-lista')?.addEventListener('click', (evento) => {
      const editar = evento.target.closest('[data-grade-editar]');
      if (editar) editarConfiguracao(editar.dataset.gradeEditar);
      const remover = evento.target.closest('[data-grade-remover]');
      if (remover) removerConfiguracao(remover.dataset.gradeRemover);
    });

    $('#excecao-escopo')?.addEventListener('change', atualizarEscopoExcecao);
    $('#excecao-periodo-form')?.addEventListener('submit', salvarExcecao);
    $('#excecoes-periodo-lista')?.addEventListener('click', (evento) => {
      const remover = evento.target.closest('[data-excecao-remover]');
      if (remover) removerExcecao(remover.dataset.excecaoRemover);
    });
  }

  async function iniciar() {
    if (!$('#tab-panel-periodos')) return;
    preencherFormularioPeriodo();
    atualizarEscopoExcecao();
    vincularEventos();
    try {
      await Promise.all([carregarPeriodos({ preservarSelecao: false }), carregarCursos()]);
    } catch (error) {
      console.error('Erro ao iniciar calendário de frequência:', error);
      notify.error(error.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
