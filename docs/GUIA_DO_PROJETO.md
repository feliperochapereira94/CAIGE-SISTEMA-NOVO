# Guia do Projeto CAIGE

## 1. Visão geral
O **CAIGE** é uma aplicação web de apoio ao atendimento interdisciplinar, com recursos para gestão de pacientes, prontuário, controle de frequência, movimentações e administração.

## 2. Objetivo da V1
Disponibilizar uma versão estável, visualmente padronizada e pronta para uso institucional, acompanhada de documentação de usuário, técnica e de manutenção.

## 3. Perfis do sistema

### SUPERVISOR
Perfil com acesso administrativo ampliado. Pode administrar usuários, cursos, calendário de frequência, auditoria, arquivados e demais rotinas previstas para o perfil.

### PROFESSOR
Perfil operacional vinculado a um curso. Pode utilizar os módulos liberados para o perfil e gerenciar atividades do próprio curso, sem acesso ao Painel de Gerenciamento.

## 4. Módulos principais
- **Autenticação**
- **Painel**
- **Movimentações**
- **Pacientes**
- **Gestão de Prontuários**
- **Frequência**
- **Meu Curso** (Professor)
- **Painel de Gerenciamento** (Supervisor)
- **Auditoria** (Supervisor)

## 5. Estrutura geral
- `Frontend/`: interface web;
- `Backend/`: API, autenticação, regras de negócio e acesso a dados;
- `Backend/database/`: scripts SQL e migrations;
- `docs/`: documentação oficial da V1.

## 6. Tecnologias
Resumo:
- Frontend: HTML, CSS e JavaScript Vanilla;
- Backend: Node.js + Express;
- Banco: MySQL;
- Autenticação: JWT;
- API: OpenAPI + Swagger UI.

Detalhamento: `tecnico/TECNOLOGIAS_UTILIZADAS.md`.

## 7. Fluxo de alto nível
```text
Usuário → Frontend → API Backend → MySQL → Backend → Frontend
```

## 8. Documentos principais

### Para utilização
- `usuario/MANUAL_USUARIO.md`
- `usuario/MANUAL_PROFESSOR.md`
- `usuario/MANUAL_SUPERVISOR.md`
- `usuario/ROTEIRO_MANUAL_ILUSTRADO.md`

### Para equipe técnica
- `tecnico/TECNOLOGIAS_UTILIZADAS.md`
- `tecnico/ARQUITETURA.md`
- `tecnico/INSTALACAO_EXECUCAO.md`
- `tecnico/BANCO_DE_DADOS.md`
- `tecnico/REGRAS_DE_NEGOCIO.md`
- `tecnico/SEGURANCA_PERMISSOES.md`

### Para integração e manutenção
- `api/README_API.md`
- `api/openapi.yaml`
- `manutencao/GUIA_MANUTENCAO.md`
- `manutencao/BACKUP_RESTAURACAO.md`
- `manutencao/CHANGELOG.md`

## 9. Convenções
- interface e documentação em **PT-BR**;
- nomes técnicos preservados quando fazem parte de contratos, bibliotecas, APIs ou semântica da linguagem;
- navegação autenticada centralizada no **Shell Global**;
- autorização real validada no backend;
- auditoria consolidada em `movimentacoes`;
- calendário de frequência administrado pelo Supervisor.

## 10. Documentação oficial
A pasta `docs/` contém a documentação oficial e vigente da V1 do CAIGE. Os documentos devem permanecer alinhados ao comportamento atual do sistema e ser atualizados sempre que uma alteração futura modificar regras, contratos ou fluxos documentados.

## 11. Status
**V1 congelada, com frontend e backend aprovados e documentação consolidada.**
