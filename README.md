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
- live-server (desenvolvimento)

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
- Scripts SQL e migrations em `Backend/database/`

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
```

## Execução rápida
### 1) Banco de dados
- Criar o banco `caige` no MySQL.
- Importar o script base disponível em `Backend/database/`.

### 2) Backend
```bash
cd Backend
npm install
cp .env.example .env
```
Ajuste o `.env` com os dados reais do MySQL.

Depois:
```bash
npm start
```
Servidor padrão: `http://localhost:3000`

### 3) Frontend
O frontend estático é servido automaticamente pelo backend em produção/desenvolvimento integrado.

Para desenvolvimento isolado do frontend:
```bash
cd Frontend
npm install
npm run serve
```
Servidor padrão do frontend: `http://localhost:5500`

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
- Esta V1 já contempla as limpezas de legado aprovadas no backend e no frontend.
