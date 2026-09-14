# Banco de Dados

## 1. Visão geral
O CAIGE utiliza **MySQL** como banco de dados principal. A estrutura e os scripts de apoio ficam em `Backend/database/`.

Esta documentação descreve a estrutura **vigente** do banco de dados da V1.

## 2. Scripts principais
- `Backend/database/CAIGE BANCO LIMPO.sql`
- `Backend/database/CAIGE BANCO TESTE.sql`

## 3. Tabelas operacionais atuais
### Estrutura institucional
- `cursos`
- `usuarios`
- `permissoes`

### Pacientes e prontuário
- `pacientes`
- `perguntas`
- `perguntas_cursos`
- `questionarios`
- `questoes_questionarios`
- `respostas_questionarios`

### Frequência
- `atividades_atendimento`
- `frequencia`
- `periodos_letivos`
- `grade_periodo_letivo`
- `excecoes_periodo_letivo`

### Auditoria
- `movimentacoes`

## 4. Relações principais
- `usuarios.id_curso` → `cursos.id`
- `usuarios.id_permissao` → `permissoes.id`
- `pacientes` é a entidade central dos dados clínicos e cadastrais
- `atividades_atendimento.id_curso` → `cursos.id`
- `frequencia.id_paciente` → `pacientes.id`
- `frequencia.id_atividade` → `atividades_atendimento.id`
- `frequencia.id_profissional` → `usuarios.id`
- `questionarios.id_curso` → `cursos.id`
- `questoes_questionarios.id_questionario` → `questionarios.id`
- `respostas_questionarios.id_paciente` → `pacientes.id`
- `respostas_questionarios.id_questionario` → `questionarios.id`
- `respostas_questionarios.id_profissional` → `usuarios.id`
- `movimentacoes.usuario_id` ou equivalente lógico referencia o contexto de usuário responsável pela ação

## 5. Destaques funcionais
### Pacientes
A tabela `pacientes` concentra:
- dados cadastrais;
- dados clínicos essenciais;
- status operacional do paciente;
- ocultação lógica quando aplicável.

### Frequência
A frequência foi simplificada para usar `registrado_em` como campo oficial do momento do registro.

### Prontuário
O prontuário é interdisciplinar:
- perguntas podem ser reaproveitadas em vários cursos;
- vínculos por curso são mantidos em `perguntas_cursos`;
- respostas preservam histórico do profissional e estrutura da aplicação no momento do registro.

### Auditoria
A auditoria oficial utiliza a tabela `movimentacoes`.

## 6. Observações para manutenção
- toda alteração estrutural deve ser acompanhada de migration;
- antes de alterar tabelas críticas, gerar backup;
- manter documentação e scripts alinhados;
- manter a estrutura documentada alinhada ao schema vigente e às regras de negócio da aplicação.
