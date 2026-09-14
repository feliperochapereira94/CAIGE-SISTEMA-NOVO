# Documentacao para o Taiga

Este documento serve como base para organizar o trabalho do CAIGE no Taiga e orientar os desenvolvedores sobre onde cada parte do sistema esta localizada no repositorio.

## 1. Objetivo da documentacao

- registrar o escopo que sera acompanhado no Taiga
- facilitar a distribuicao de tarefas por sprint
- mostrar rapidamente onde estao os arquivos do projeto
- manter a apresentacao do progresso em partes, mesmo com o projeto geral ja avancado

## 2. Estrutura do projeto para consulta rapida

### Backend

- [Backend/src/server.js](../../Backend/src/server.js)
  - inicializacao do servidor, middlewares globais e registro das rotas
- [Backend/src/routes](../../Backend/src/routes)
  - definicao dos endpoints por dominio
- [Backend/src/controllers](../../Backend/src/controllers)
  - regras de negocio e orquestracao das operacoes
- [Backend/src/models](../../Backend/src/models)
  - acesso a dados, validacoes e utilitarios
- [Backend/database](../../Backend/database)
  - scripts SQL de setup e evolucao do banco

### Frontend

- [Frontend/paginas](../../Frontend/paginas)
  - telas da aplicacao separadas por area funcional
- [Frontend/recursos](../../Frontend/recursos)
  - estilos, imagens e scripts compartilhados

## 3. Onde os desenvolvedores devem pegar cada parte

### Login e autenticacao

- [Backend/src/routes/autenticacao.js](../../Backend/src/routes/autenticacao.js)
- [Backend/src/controllers/acessoController.js](../../Backend/src/controllers/acessoController.js)
- [Backend/src/controllers/autenticacaoController.js](../../Backend/src/controllers/autenticacaoController.js)

### Cadastro de cliente e pacientes

- [Backend/src/routes/pacientes.js](../../Backend/src/routes/pacientes.js)
- [Backend/src/controllers/pacientesController.js](../../Backend/src/controllers/pacientesController.js)
- [Backend/src/models/validacaoModel.js](../../Backend/src/models/validacaoModel.js)

### Usuarios e permissoes

- [Backend/src/routes/usuarios.js](../../Backend/src/routes/usuarios.js)
- [Backend/src/controllers/usuariosController.js](../../Backend/src/controllers/usuariosController.js)
- [Backend/src/controllers/acessoController.js](../../Backend/src/controllers/acessoController.js)

### Cursos, frequencia e questionarios

- [Backend/src/routes/cursos.js](../../Backend/src/routes/cursos.js)
- [Backend/src/controllers/cursosController.js](../../Backend/src/controllers/cursosController.js)
- [Backend/src/routes/frequencia.js](../../Backend/src/routes/frequencia.js)
- [Backend/src/controllers/frequenciaController.js](../../Backend/src/controllers/frequenciaController.js)
- [Backend/src/routes/questionarios.js](../../Backend/src/routes/questionarios.js)
- [Backend/src/controllers/questionariosController.js](../../Backend/src/controllers/questionariosController.js)

### Auditoria e painel

- [Backend/src/routes/atividades.js](../../Backend/src/routes/atividades.js)
- [Backend/src/controllers/atividadesController.js](../../Backend/src/controllers/atividadesController.js)
- [Backend/src/models/registroAtividadeModel.js](../../Backend/src/models/registroAtividadeModel.js)
- [Backend/src/routes/dados-painel.js](../../Backend/src/routes/dados-painel.js)
- [Backend/src/controllers/dadosPainelController.js](../../Backend/src/controllers/dadosPainelController.js)

### Arquivamento e suporte

- [Backend/src/routes/arquivo.js](../../Backend/src/routes/arquivo.js)
- [Backend/src/controllers/arquivoController.js](../../Backend/src/controllers/arquivoController.js)

## 4. Regra pratica para o Taiga

Para cada tarefa no Taiga, descreva:

- o objetivo funcional
- o arquivo principal onde a alteracao deve acontecer
- os endpoints impactados
- o resultado esperado para testes

## 5. Sugestao de organizacao das tarefas

- epico: autenticacao e acesso
- epico: cadastro de clientes
- epico: administracao e permissao
- epico: apoio ao painel e auditoria

## 6. Observacao para a apresentacao ao professor

Mesmo que o sistema ja tenha varias telas prontas, a documentacao no Taiga deve mostrar a entrega em etapas. A ideia e evidenciar evolucao progressiva, principalmente na parte de backend, para deixar claro o trabalho realizado por sprint.