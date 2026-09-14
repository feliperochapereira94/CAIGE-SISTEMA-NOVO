# API do CAIGE

## Finalidade
A API atende o frontend do CAIGE por meio do prefixo `/api`.

## OpenAPI oficial
- arquivo fonte: `docs/api/openapi.yaml`;
- interface Swagger UI: `/api-docs`;
- URL local padrão: `http://localhost:3000/api-docs`.

## Autenticação
As rotas protegidas utilizam:
- JWT Bearer;
- middleware `requireAuth`;
- permissões por papel quando necessário;
- `req.user` como identidade autenticada;
- escopo de curso para operações do perfil PROFESSOR quando aplicável.

## Módulos documentados
- Autenticação;
- Usuários;
- Pacientes;
- Dados do Painel;
- Frequência;
- Arquivo;
- Perguntas;
- Questionários;
- Respostas;
- Cursos;
- Atividades de Atendimento;
- Movimentações;
- Períodos Letivos.

## Rotas base montadas no backend
```text
/api/autenticacao
/api/usuarios
/api/pacientes
/api/dados-painel
/api/frequencia
/api/arquivo
/api/questionarios
/api/cursos
/api/atividades-atendimento
/api/movimentacoes
/api/periodos-letivos
```

A rota antiga `/api/atividades` não faz parte da V1 final. O histórico operacional atual é atendido por `/api/movimentacoes/recentes`.

### Escopo das movimentações
- `SUPERVISOR` recebe a visão global das movimentações.
- `PROFESSOR` recebe somente registros cujo `movimentacoes.id_curso` corresponde a `req.user.idCurso`.
- movimentações sem curso (`id_curso = NULL`) são tratadas como globais e não são retornadas ao PROFESSOR.
- o mesmo escopo é aplicado aos eventos recentes retornados por `/api/dados-painel`.
- o cliente não informa nem amplia esse escopo por query string; o curso do PROFESSOR vem da identidade autenticada.

### Edição administrativa de usuários
- `PUT /api/usuarios/{id}` é exclusivo de `SUPERVISOR`;
- nome e senha são alterações sensíveis;
- para alterar o nome ou redefinir a senha de outro usuário, o payload deve enviar `senhaSupervisor` com a senha atual do Supervisor autenticado;
- `novaSenha` é opcional, possui mínimo de 6 caracteres e nunca é retornada pela API;
- a validação da senha do Supervisor ocorre no backend, sem confiar em confirmação visual do frontend.

## Convenções
- `docs/api/openapi.yaml` é a fonte documental do contrato da API.
- A documentação usa os caminhos finais montados no Express, incluindo `/api`.
- Endpoints protegidos devem declarar `BearerAuth`.
- Mudança de método, path, parâmetros, query, body, resposta, status HTTP, autenticação, permissão ou regra de escopo exige revisão do OpenAPI.
- Mudanças internas sem alteração do contrato observável não exigem necessariamente mudança do OpenAPI.

## Status HTTP
A API utiliza principalmente:
- `200`: consulta ou atualização bem-sucedida;
- `201`: criação bem-sucedida;
- `400`: dados inválidos ou regra de validação;
- `401`: ausência/falha de autenticação;
- `403`: permissão, papel ou escopo negado;
- `404`: recurso não encontrado;
- `409`: conflito de regra, quando aplicável;
- `500`: erro interno;
- `503`: estrutura/migration necessária ainda não disponível, em pontos específicos.

Padrão de erro:
```json
{
  "message": "Mensagem legível para o cliente."
}
```

Payloads de sucesso permanecem específicos de cada operação.

## Períodos letivos e calendário de frequência
A API da V1 possui endpoints administrativos para:
- listar/criar/atualizar período letivo;
- consultar/salvar dias previstos do curso ou atividade;
- listar/adicionar/remover datas sem atendimento.

Todas essas rotas exigem autenticação e perfil `SUPERVISOR`.

## Validação do Swagger
Após alterar o OpenAPI:
1. validar o YAML;
2. confirmar `openapi: 3.0.3`;
3. confirmar que não existem `$ref` quebrados;
4. iniciar o backend;
5. abrir `http://localhost:3000/api-docs`;
6. comparar os endpoints documentados com os arquivos em `Backend/src/routes/`.

## Regra de atualização
Qualquer alteração de contrato deve ser documentada no mesmo ciclo da alteração de código.
