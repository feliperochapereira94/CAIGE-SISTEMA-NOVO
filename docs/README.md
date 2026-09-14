# CAIGE — Sistema de Gestão de Pacientes, Frequência e Prontuários

## Sobre o projeto
O **CAIGE** é uma aplicação web voltada ao apoio do atendimento interdisciplinar, com foco no cadastro de pacientes, controle de frequência, prontuário, atividades por curso, auditoria e administração de usuários.

Esta versão corresponde à **V1 congelada**, com frontend e backend revisados, padronizados e documentados.

## Principais módulos
- **Autenticação**
- **Painel**
- **Movimentações**
- **Pacientes**
- **Gestão de Prontuários**
- **Frequência**
- **Painel de Gerenciamento**
- **Auditoria**

## Perfis de acesso
- **SUPERVISOR**: acesso administrativo ampliado.
- **PROFESSOR**: acesso operacional com restrição ao curso vinculado.

## Tecnologias principais
### Frontend
- HTML5
- CSS3
- JavaScript Vanilla
- Flatpickr (datas)
- jsPDF + jsPDF AutoTable (PDF)
- ExcelJS (Excel)

### Backend
- Node.js
- Express
- MySQL2
- JWT (`jsonwebtoken`)
- Bcrypt (`bcryptjs`)
- Dotenv
- Swagger UI Express
- YAML

### Banco de dados
- MySQL

## Estrutura do projeto
```text
CAIGE/
├── Backend/
│   ├── database/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── Frontend/
│   ├── paginas/
│   ├── recursos/css/
│   ├── recursos/js/
│   ├── recursos/images/
│   └── package.json
├── docs/
│   ├── usuario/
│   ├── tecnico/
│   ├── api/
│   └── manutencao/
├── DESIGN_SYSTEM.md
├── REGRAS_PROJETO.md
└── PROMPT_IA.md
```

## Execução rápida
### 1) Banco de dados
Crie e configure o banco MySQL utilizado pelo CAIGE conforme o guia técnico de instalação.

### 2) Aplicação
Na pasta do Backend:

```bash
cd Backend
npm install
```

Crie o arquivo `.env` com base em `.env.example` e ajuste os dados do ambiente.

Depois execute:

```bash
npm start
```

O backend também disponibiliza o frontend do CAIGE.

Acesso padrão:

```text
http://localhost:3000
```

## Documentação
- **Índice geral**: `docs/README.md`
- **Guia do projeto**: `docs/GUIA_DO_PROJETO.md`
- **Tecnologias utilizadas**: `docs/tecnico/TECNOLOGIAS_UTILIZADAS.md`
- **Arquitetura**: `docs/tecnico/ARQUITETURA.md`
- **Instalação e execução**: `docs/tecnico/INSTALACAO_EXECUCAO.md`
- **Banco de dados**: `docs/tecnico/BANCO_DE_DADOS.md`
- **Manual do usuário**: `docs/usuario/MANUAL_USUARIO.md`
- **Roteiro do manual ilustrado**: `docs/usuario/ROTEIRO_MANUAL_ILUSTRADO.md`
- **API**: `docs/api/README_API.md` e `docs/api/openapi.yaml`

## Observações importantes
- Não versionar `.env` com dados reais.
- Não incluir `node_modules` nos pacotes finais.
- Para documentação de API, usar também `http://localhost:3000/api-docs`.
- Esta documentação corresponde à V1 consolidada do CAIGE.
