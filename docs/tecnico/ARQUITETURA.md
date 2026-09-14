# Arquitetura do CAIGE

## 1. Visão geral
O CAIGE segue uma arquitetura web em três camadas principais:

1. **Frontend**: interface do usuário;
2. **Backend**: API e regras de negócio;
3. **Banco de Dados**: persistência em MySQL.

Fluxo simplificado:

```text
Usuário → Frontend → Backend/API → MySQL → Backend → Frontend
```

## 2. Frontend
### Estrutura
O frontend está localizado em `Frontend/` e é composto por:
- `paginas/`: telas do sistema;
- `recursos/css/`: estilos globais e por página;
- `recursos/js/`: scripts utilitários e módulos de interface;
- `recursos/images/`: logos e imagens.

### Shell Global
As páginas autenticadas utilizam o **Shell Global** como base estrutural, concentrando:
- sidebar;
- cabeçalho;
- avatar/menu do usuário;
- navegação principal;
- comportamento global de escala em desktop.

Arquivos centrais:
- `Frontend/recursos/js/shell-global.js`
- `Frontend/recursos/js/sidebar-menu.js`
- `Frontend/recursos/js/menu-usuario.js`
- `Frontend/recursos/js/controle-acesso.js`

## 3. Backend
### Estrutura
O backend está em `Backend/`.

Arquivos principais:
- `src/server.js`: inicialização do servidor;
- `src/swagger.js`: integração com OpenAPI/Swagger;
- `src/routes/`: definição de rotas;
- `src/controllers/`: regras de negócio por módulo;
- `src/models/`: acesso a dados.

### Responsabilidades do backend
- autenticação e autorização;
- validação de acesso por perfil;
- regras de negócio de pacientes, frequência, prontuários e administração;
- integração com banco de dados;
- publicação da documentação da API.

## 4. Banco de dados
O banco é MySQL e a base estrutural fica em `Backend/database/`.

A V1 final trabalha com as tabelas operacionais atuais, incluindo:
- `usuarios`
- `permissoes`
- `cursos`
- `pacientes`
- `atividades_atendimento`
- `frequencia`
- `periodos_letivos`
- `grade_periodo_letivo`
- `excecoes_periodo_letivo`
- `perguntas`
- `perguntas_cursos`
- `questionarios`
- `questoes_questionarios`
- `respostas_questionarios`
- `movimentacoes`

## 5. API
A comunicação entre frontend e backend ocorre por API HTTP/JSON.

Prefixo base das rotas:
- `/api/autenticacao`
- `/api/usuarios`
- `/api/pacientes`
- `/api/dados-painel`
- `/api/frequencia`
- `/api/questionarios`
- `/api/cursos`
- `/api/atividades-atendimento`
- `/api/movimentacoes`
- `/api/periodos-letivos`

Documentação interativa:
- `/api-docs`

## 6. Segurança
- autenticação com JWT;
- uso de middleware para proteção de rotas;
- validação de perfil/permissão no backend;
- restrição de professor ao curso vinculado em fluxos operacionais;
- auditoria consolidada em `movimentacoes`.

## 7. Padrões adotados
- interface em PT-BR;
- separação frontend/backend;
- responsividade com comportamento específico para desktop e mobile;
- impressão/exportação em páginas específicas;
- documentação OpenAPI centralizada em `docs/api/openapi.yaml`.

