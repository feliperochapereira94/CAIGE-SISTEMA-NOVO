# Instalação e Execução

## 1. Pré-requisitos
Antes de iniciar, tenha instalado:
- **Node.js** (recomendado: versão LTS);
- **npm**;
- **MySQL**;
- navegador moderno (Chrome, Edge ou equivalente).

## 2. Estrutura esperada
Projeto com as pastas:
- `Backend/`
- `Frontend/`
- `docs/`

## 3. Configuração do banco de dados
### 3.1 Criar o banco
Crie um banco chamado `caige` no MySQL.

### 3.2 Importar a estrutura
Use o script base disponível em `Backend/database/`, preferencialmente:
- `CAIGE BANCO LIMPO.sql`

## 4. Configuração do backend
Entre na pasta do backend:
```bash
cd Backend
```

Instale as dependências:
```bash
npm install
```

Copie o arquivo de exemplo de ambiente:
```bash
cp .env.example .env
```

Ajuste as variáveis conforme seu ambiente:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=caige
DB_PORT=3306
PORT=3000
NODE_ENV=development
JWT_SECRET=sua_chave_segura
JWT_EXPIRES_IN=8h
```

## 5. Executar o backend
### Modo normal
```bash
npm start
```

### Modo desenvolvimento
```bash
npm run dev
```

A aplicação ficará disponível em:
- `http://localhost:3000`

A documentação da API ficará em:
- `http://localhost:3000/api-docs`

## 6. Executar o frontend isoladamente (opcional)
O backend já serve o frontend de forma integrada. Mesmo assim, para desenvolvimento visual isolado, é possível executar o frontend separadamente.

Entre na pasta:
```bash
cd Frontend
```

Instale as dependências:
```bash
npm install
```

Inicie:
```bash
npm run serve
```

A aplicação ficará disponível em:
- `http://localhost:5500`

## 7. Portas utilizadas
- **3000**: backend e frontend servido pelo backend;
- **5500**: frontend isolado com `live-server`.

## 8. Fluxo recomendado de uso local
### Opção A — ambiente integrado
1. subir MySQL;
2. executar backend;
3. acessar `http://localhost:3000`.

### Opção B — desenvolvimento visual do frontend
1. subir MySQL;
2. executar backend em `3000`;
3. executar frontend em `5500`;
4. acessar `http://localhost:5500`.

## 9. Solução de problemas comuns
### Erro de conexão com banco
Verifique:
- se o MySQL está ativo;
- host, porta, usuário e senha do `.env`;
- se o banco `caige` existe.

### Porta 3000 ocupada
Altere a variável `PORT` no `.env`.

### Login não funciona
Verifique:
- se há dados de usuário no banco;
- se o JWT está configurado;
- se o backend iniciou sem erro.

### Swagger não abre
Verifique se o backend carregou corretamente `docs/api/openapi.yaml`.

## 10. Boas práticas
- manter `.env` fora de versionamento;
- não subir `node_modules` para Git ou pacotes finais;
- documentar migrations executadas;
- realizar backup antes de alterar estrutura de banco.
