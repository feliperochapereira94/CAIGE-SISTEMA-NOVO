# Regras de Negócio

## 1. Estrutura central
Fluxo operacional principal:

```text
CURSO → ATIVIDADE DE ATENDIMENTO → FREQUÊNCIA
```

No domínio clínico:

```text
PACIENTE → PRONTUÁRIO → LANÇAMENTOS/RESPOSTAS
```

## 2. Perfis
Existem dois papéis principais:
- `SUPERVISOR`;
- `PROFESSOR`.

O SUPERVISOR possui escopo administrativo ampliado.

O PROFESSOR possui `usuarios.id_curso` e deve atuar dentro do curso vinculado nas operações com escopo de curso.

## 3. Administração de usuários
- criação e edição administrativa de usuários são exclusivas do `SUPERVISOR`;
- o Supervisor pode redefinir a senha de um usuário pela edição administrativa;
- se houver alteração de nome ou senha, o backend exige confirmação da senha atual do Supervisor autenticado;
- a nova senha deve possuir no mínimo 6 caracteres;
- senha em texto puro nunca é armazenada nem registrada em movimentações.

## 4. Pacientes
- pacientes podem ser cadastrados, consultados e editados conforme permissões;
- o ciclo operacional utiliza os status `ativo`, `inativo` e `arquivado`;
- a ocultação definitiva da interface é lógica, preservando histórico relacional;
- registros históricos não devem ser destruídos apenas para retirar o paciente das listagens operacionais.

## 5. Atividades de atendimento
- cada atividade pertence a um curso;
- o PROFESSOR pode gerenciar atividades somente do próprio curso;
- o SUPERVISOR pode administrar atividades de cursos distintos;
- atividades de atendimento são a estrutura vigente para frequência;
- a antiga tabela/rota genérica `atividades` não faz parte da V1 final.

## 6. Prontuário interdisciplinar
- o prontuário possui finalidade clínica;
- perguntas podem ser vinculadas a um ou vários cursos sem duplicar a pergunta;
- `perguntas_cursos` mantém esses vínculos;
- questionários pertencem a um curso;
- PROFESSOR cria/altera conteúdo apenas no curso autenticado;
- SUPERVISOR possui visão administrativa ampliada;
- leitura do histórico do paciente é interdisciplinar conforme as rotas de respostas;
- cada lançamento registra o profissional responsável;
- a estrutura do prontuário no momento do lançamento é preservada por snapshot quando disponível, evitando reinterpretar um registro antigo após mudanças no modelo.

## 7. Frequência — registro
- frequência relaciona paciente, atividade de atendimento e profissional;
- o momento oficial do registro é `frequencia.registrado_em`;
- PROFESSOR fica restrito ao próprio curso nas consultas e registros;
- SUPERVISOR possui escopo ampliado;
- o registro depende da permissão `pode_registrar_frequencia`.

## 8. Calendário de frequência

### 8.1 Período letivo
O calendário usa `periodos_letivos` com:
- ano;
- semestre `1` ou `2`;
- data inicial;
- data final;
- status `PLANEJADO`, `ATIVO` ou `ENCERRADO`.

Regras:
- períodos não podem se sobrepor;
- somente um período pode estar `ATIVO` por vez;
- período `ENCERRADO` fica bloqueado para alteração de datas/status, grade e exceções;
- anos não são hardcoded na interface/regra.

### 8.2 Grade semanal
`grade_periodo_letivo` define em quais dias da semana existe atendimento.

- dias usam padrão ISO `1` a `7`;
- a configuração pode ser geral para o curso (`id_atividade = NULL`);
- ou específica para uma atividade;
- para um relatório filtrado por atividade, uma grade específica da atividade tem prioridade;
- na ausência de grade específica, o sistema pode usar a grade geral do curso para aquela atividade;
- sem atividade selecionada, o cálculo usa a grade geral do curso.

### 8.3 Datas sem atendimento
`excecoes_periodo_letivo` permite excluir do calendário:
- uma data para todo o CAIGE/período;
- ou uma data vinculada a um atendimento específico da grade.

Exemplos:
- feriado;
- recesso;
- cancelamento de atendimento.

Uma exceção específica só pode ser criada se aquele atendimento estiver previsto no dia da semana informado.

## 9. Cálculo do percentual de frequência
O relatório monta primeiro as **datas previstas válidas** dentro do intervalo solicitado.

São considerados:
1. período letivo `ATIVO` ou `ENCERRADO` que cubra o intervalo;
2. curso/atividade selecionado;
3. dias configurados na grade;
4. exclusão das datas sem atendimento.

Quando o calendário é compatível com o filtro e o paciente possui participação dentro do filtro, o sistema calcula:

```text
Percentual de frequência =
encontros com presença em datas previstas
÷
encontros previstos válidos
× 100
```

Também são retornados:
- `encontrosPrevistos`;
- `encontrosComPresenca`;
- `faltas`;
- `percentualFrequencia`;
- `calculoFrequenciaDisponivel`.

`faltas` corresponde a:

```text
encontros previstos - encontros com presença
```

com mínimo igual a zero.

## 10. Quando o cálculo de frequência não fica disponível
O calendário simplificado não calcula percentual quando, entre outros casos:
- o filtro usa profissional, pois o calendário não diferencia profissionais;
- não foi selecionado curso nem atividade;
- não existe período letivo ativo/encerrado cobrindo o intervalo;
- não existe grade compatível;
- não existem encontros previstos válidos no intervalo;
- o paciente não possui participação no filtro atual, conforme a regra implementada na V1.

Nesses casos, o relatório deve indicar que a frequência não foi calculada em vez de inventar um percentual.

## 11. Administração do calendário
Criação/edição de períodos, grade semanal e datas sem atendimento são operações exclusivas de `SUPERVISOR`.

O PROFESSOR utiliza o calendário configurado pelo Supervisor para registro e relatórios, mas não altera a estrutura do período letivo.

## 12. Auditoria
- a estrutura oficial de auditoria é `movimentacoes`;
- ações relevantes de cadastro/alteração devem usar o mecanismo atual de movimentações;
- movimentações operacionais de curso devem registrar `id_curso` quando o contexto possuir curso definido;
- SUPERVISOR possui visão global das movimentações;
- PROFESSOR visualiza no Painel e em Movimentações somente registros com `id_curso` igual ao curso autenticado;
- registros sem curso são globais e não entram na visão operacional do PROFESSOR;
- a auditoria e o histórico de ações devem utilizar `movimentacoes` como estrutura oficial.

## 13. Arquivamento
As rotas administrativas de arquivo são exclusivas do SUPERVISOR.

Pacientes arquivados podem ser recuperados conforme o fluxo atual. A exclusão administrativa da interface preserva a integridade histórica conforme a estratégia de ocultação lógica adotada.

## 14. Regra de manutenção
Se uma mudança alterar qualquer regra deste documento, a alteração de código e a atualização desta documentação devem fazer parte da mesma entrega.
