# DESIGN SYSTEM — CAIGE

Este documento é a fonte oficial de decisões visuais do frontend do CAIGE.

> Regra principal: se duas telas precisam da mesma aparência ou comportamento, a regra não pertence à tela; ela deve ser centralizada.

---

## 1. Arquitetura visual oficial

```text
Frontend/recursos/css/
├── base.css
├── layout.css
├── componentes.css
├── responsive.css
└── paginas/
    ├── cursos.css
    ├── dashboard.css
    ├── frequencia.css
    ├── login.css
    ├── movimentacoes.css
    ├── pacientes.css
    ├── prontuarios.css
    ├── prontuario-paciente.css
    ├── prontuario-documento.css
    └── usuarios.css
```

Responsabilidades:

- `base.css`: tokens, cores, fonte, reset e fundação visual.
- `layout.css`: sidebar, cabeçalho, largura da página e estrutura compartilhada.
- `componentes.css`: botões, inputs, cards, grids, tabelas, filtros, badges, modais e paginação.
- `responsive.css`: comportamento responsivo compartilhado.
- `paginas/*.css`: somente particularidades reais da página.

Não criar um segundo arquivo global para resolver algo que já pertence a um dos quatro arquivos acima.

### Shell Global

As páginas autenticadas utilizam o Shell Global como estrutura oficial de navegação e identidade de layout.

Arquivo principal:

```text
Frontend/recursos/js/shell-global.js
```

Responsabilidades do Shell:

- montar a sidebar;
- montar o cabeçalho;
- centralizar a navegação;
- centralizar as rotas do menu;
- definir o item ativo;
- fornecer quick-nav mobile;
- fornecer o markup do menu do usuário.

Módulos relacionados:

- `shell-global.js`: estrutura do Shell e fonte canônica de navegação;
- `sidebar-menu.js`: comportamento da sidebar e quick-nav;
- `menu-usuario.js`: identidade, avatar, dropdown, conta e logout;
- `controle-acesso.js`: identidade, perfil e RBAC;
- `layout.css`: estrutura visual global do Shell;
- `componentes.css`: componentes compartilhados do Shell;
- `responsive.css`: adaptação global do Shell.

Regra obrigatória:

- páginas autenticadas não devem conter cópia manual de `<aside class="sidebar">`, `<header class="content__header">`, menu do usuário, avatar, dropdown, logout ou quick-nav;
- a página deve consumir `#shell-sidebar`, `#shell-header` e `shell-global.js`;
- o login em `Frontend/paginas/autenticacao/entrar.html` não usa o Shell autenticado.

### Contrato de página autenticada

Uma página autenticada deve:

- informar `data-page-title`;
- informar `data-page-subtitle`;
- conter `#shell-sidebar`;
- conter `#shell-header`;
- carregar `shell-global.js`.

Se a página for filha de outra rota do menu, deve usar `rotasRelacionadas` no Shell Global e manter o item pai ativo.

### Rotas e item ativo

As rotas do menu existem em uma única fonte canônica no `shell-global.js`.

As páginas não devem criar versões próprias dos `href` da sidebar.

O item ativo da sidebar é calculado a partir de:

- `window.location.pathname`;
- destinos do menu;
- `rotasRelacionadas`.

### Painel de Gerenciamento

Nome oficial da área:

```text
Painel de Gerenciamento
```

Não usar como sinônimos de interface:

- Administração;
- Gerenciar Usuários;
- Painel Administrativo;

quando estiverem se referindo à mesma área.

### Perfis

- `SUPERVISOR`: vê o Painel de Gerenciamento completo;
- `PROFESSOR`: vê o Painel de Gerenciamento com escopo restrito ao próprio curso.

O frontend controla a experiência visual, mas o backend continua sendo a autoridade real de autorização.

Ocultar item ou aba não substitui autorização backend.

### Avatar

O menu do avatar concentra as ações de perfil e sessão:

- conta ("Minha Conta");
- alteração de senha;
- logout.

**Acesso Administrativo no Mobile (Mobile 1)**:
Como a barra inferior móvel (Bottom Navigation) comporta estritamente os 5 itens canônicos operacionais para preservar a ergonomia e legibilidade sem esmagamento, o acesso do perfil `SUPERVISOR` ao "Painel de Gerenciamento" é disponibilizado no topo do menu do avatar com ícone minimalista de escudo. Usuários do perfil `PROFESSOR` não possuem este link.

### Navegação Inferior Mobile (Bottom Navigation — Mobile 1 e Mobile 1.1)

A barra inferior móvel (`.mobile-bottom-nav`) é gerada centralmente pelo `shell-global.js` e estilizada em `responsive.css`:

- **Dois Estados Adaptativos (Mobile 1.1)**:
  - **Expandido**: Altura de 56px, largura máxima de 480px, 5 ícones com rótulos visíveis e safe-area (`bottom: calc(env(safe-area-inset-bottom, 0px) + 8px)`).
  - **Compacto (`.mobile-bottom-nav--compact`)**: Modo pílula discreto durante leitura/scroll contínuo: largura máxima ~268px, altura de 48px, `border-radius: var(--radius-full)`, rótulos ocultados visualmente mas 100% preservados via `aria-label`, 5 destinos ativos com alvos de toque confortáveis (>= 44x44px).
- **Detecção de Scroll Global com Histerese**:
  - Centralizada em `shell-global.js` via listener passivo e `requestAnimationFrame`.
  - Descida: 50px contínuos -> ativa estado compacto.
  - Subida: 30px contínuos -> retorna ao estado expandido.
  - Zona do Topo (`scrollY <= 70px`) -> força estado expandido incondicionalmente.
  - Inversão de direção zera o acumulador, eliminando qualquer jitter/piscamento.
- **Congelamento em Formulários (Form Freeze)**:
  - Ao focar (`focusin`) qualquer campo editável (`input, textarea, select, [contenteditable]`), a detecção é suspensa temporariamente para evitar oscilações causadas pelo teclado virtual. É retomada 200ms após `focusout`.
- **Rótulos Mobile**:
  - O item "Movimentações" utiliza no mobile o `tituloMobile`: **"Movimentos"**, eliminando o truncamento em telas de 360px–390px, mantendo o desktop estritamente como "Movimentações".
- **Superfície Translúcida Discreta e Tokens Semânticos**:
  - Utiliza `--surface-translucent` (`rgba(255, 255, 255, 0.93)`) e `--border-translucent` (`rgba(228, 235, 245, 0.85)`).
  - Com suporte a `backdrop-filter`, aplica desfoque sutil (`blur(8px)`). Sem suporte, degrada perfeitamente para `--surface` sólido via `@supports`.
- **Ocultação Visual da Barra de Rolagem Mobile**:
  - `html, body` com `scrollbar-width: none; ::-webkit-scrollbar { display: none; }` isolado sob `max-width: 767px`. A rolagem permanece 100% funcional.
- **Compensação Inferior Estável (Zero Layout Shift)**:
  - O padding inferior do `body.caige-has-mobile-bottom-nav` é fixado na altura expandida (`calc(env(safe-area-inset-bottom, 0px) + 84px)`), impedindo saltos de layout durante alternância entre estados.
- **Ocultação em Tablet e Desktop**: Em resoluções `>= 768px`, a barra é estritamente ocultada com `display: none !important`.

### Guias de Workspace e Subnavegação Segmentada (Mobile 1)

- **Ocultação de Guias de Workspace**: As guias de topo (`.workspace-tabs-shell`) geradas por `abas-navegacao.js` são ocultadas no mobile (`display: none !important` sob `max-width: 767px`) para evitar duplicidade e rolagem horizontal conflituosa.
- **Controle Segmentado Reutilizável (`.subnav-tabs` / `.subnav-tab`)**:
  - Definido globalmente em `componentes.css`.
  - Utilizado no topo de áreas que possuem fluxo alternado no mobile.
  - Na Gestão de Prontuários, a ordem canônica é **Cadastro de Perguntas → Prontuários Cadastrados**, igual à subnavegação do Shell.
  - O helper `.subnav-tabs--mobile-only` exibe o componente apenas em telas `<= 767px` e o oculta completamente no desktop e tablet.

### Escala Tipográfica Mobile e Indicadores

- Nenhuma tela mobile deve conter fontes microscópicas abaixo de 9.5px–10px. Tamanhos antigos de 6px a 7.8px foram abolidos.
- No Dashboard, sob `max-width: 767px`, os cards de indicadores organizam-se em 1 coluna compacta horizontal (`grid-template-columns: 1fr`), contendo ícone à esquerda, título (13px)/nota (11.5px) ao centro e valor (22px)/delta à direita, mantendo o desktop estritamente em 3 colunas (`repeat(3, minmax(0, 1fr))`).

### Preparação para Temas (Claro / Escuro / Sistema)

Toda a fundação móvel foi implementada utilizando exclusivamente tokens semânticos de `base.css` (`--surface`, `--surface-soft`, `--surface-translucent`, `--app-background`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-default`, `--border-translucent`, `--blue-50`, `--blue-600`):
- Nenhuma cor hexadecimal literal ou regra `#fff`/`#000` foi introduzida na Mobile 1 / Mobile 1.1.
- A arquitetura está 100% pronta para a ativação posterior dos temas Claro, Escuro e Sistema (via `prefers-color-scheme` ou `data-theme`), sem necessidade de refatorar componentes móveis.

### Nova página autenticada

Checklist oficial:

1. configurar título;
2. configurar subtítulo;
3. incluir os pontos do Shell;
4. carregar `shell-global.js`;
5. não copiar sidebar/header;
6. registrar rota no Shell se for novo destino de navegação;
7. usar `rotasRelacionadas` se for página filha;
8. validar item ativo;
9. validar mobile;
10. executar auditoria.

---

## 2. Fonte oficial

Fonte principal:

```css
--font-family:
    Arial,
    Helvetica,
    sans-serif;
```

A tipografia oficial do sistema é Arial/Helvetica, definida globalmente por `base.css`, para manter leitura institucional e menos arredondada em desktop, tablet e mobile.

### Regra

Não carregar Google Fonts diretamente em HTML.

Não declarar outra `font-family` em CSS de página, salvo necessidade técnica documentada. A exceção tipográfica do desktop deve permanecer centralizada em `base.css`.

---

## 3. Escala tipográfica oficial

Tokens atuais em `base.css`:

```css
--fonte-titulo-pagina: 18px;
--fonte-subtitulo-pagina: 13px;

--fonte-titulo-secao: 16px;
--fonte-subtitulo-secao: 12px;

--fonte-grid-cabecalho: 12px;
--fonte-grid-corpo: 13px;
--fonte-grid-badge: 11px;

--peso-titulo-pagina: 700;
--peso-titulo-secao: 700;
--peso-grid-cabecalho: 800;
--peso-grid-badge: 800;
```

Aliases semânticos globais já disponíveis em `base.css`:

```css
--fonte-corpo: var(--fonte-grid-corpo);
--fonte-label: var(--fonte-subtitulo-secao);
--fonte-botao: var(--fonte-grid-corpo);
--fonte-texto-auxiliar: var(--fonte-subtitulo-secao);
--fonte-navegacao: var(--fonte-subtitulo-pagina);
```

### Onde alterar

Se o tamanho do cabeçalho de todos os grids precisar mudar:

```text
ALTERAR: Frontend/recursos/css/base.css
TOKEN: --fonte-grid-cabecalho
```

Não alterar `dashboard.css`, `movimentacoes.css`, `pacientes.css` etc.

---

## 4. Paleta oficial

### Azul CAIGE

```css
--blue-50: #f5f8ff;
--blue-100: #e9f1ff;
--blue-200: #d6e5ff;
--blue-300: #b5d0ff;
--blue-400: #78aaff;
--blue-500: #2b7cff;
--blue-600: #1f60e8;
--blue-700: #1749b7;
--blue-800: #173c8f;
--blue-900: #18356f;
```

### Neutros

```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### Estados

Usar os tokens `--success-*`, `--warning-*`, `--danger-*` e `--purple-*` já definidos em `base.css`.

### Regra

Antes de adicionar um HEX novo, verificar se existe token equivalente.

Cores exclusivas de ilustração ou elemento institucional específico podem existir localmente, desde que justificadas.

---

## 5. Espaçamento

Escala global:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 28px;
--space-8: 32px;
```

Novos componentes compartilhados devem preferir essa escala.

---

## 6. Bordas, raios e sombras

### Raios

```css
--radius-xs: 2px;
--radius-sm: 3px;
--radius-md: 4px;
--radius-lg: 6px;
--radius-xl: 8px;
--radius-2xl: 10px;
--radius-full: 999px;
```

### Direção visual institucional

- botões, campos, modais, toasts e containers operacionais devem usar cantos discretos, evitando aparência de cápsula/soft UI;
- `--radius-full` fica reservado a elementos realmente circulares ou pílulas funcionais específicas;
- ações primárias usam a família azul CAIGE; vermelho fica reservado a ações destrutivas;
- cabeçalhos de tabelas/grids devem preservar a separação visual entre colunas, sem parecer uma única faixa contínua;
- toasts usam superfície neutra com acento lateral semântico, texto forte e ícones de traço reforçado;
- confirmações globais usam card compacto com acento lateral e ícone quadrado discreto, evitando círculos decorativos genéricos;
- o Login pode manter composição mais expressiva, com dois painéis, card institucional, gradientes, círculos decorativos e transição fumê suave entre a área clara e a área azul.

### Sombras

Usar:

```css
--shadow-xs
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
```

Evitar criar sombras diferentes em cada página.

---

## 7. Largura e cabeçalho das páginas

A largura compartilhada é definida por:

```css
.largura-pagina {
    width: 100%;
    max-width: 1560px;
    margin-left: auto;
    margin-right: auto;
}
```

O cabeçalho usa tokens:

```css
--altura-cabecalho-pagina: 92px;
--padding-cabecalho-pagina-y: 14px;
--padding-cabecalho-pagina-x: 18px;
--espaco-apos-cabecalho-pagina: 16px;
```

### Regra

Novas telas internas devem utilizar a estrutura global de página e `.largura-pagina`.

Não redefinir posição ou tamanho do título em CSS de página.

---

## 8. Padrões de apresentação de listas e dados

Existem três estruturas oficiais:

### Tabela semântica

```html
<table class="data-table">
```

### Grid operacional

```html
<div class="data-grid">
    <div class="data-grid__header">...</div>
    <div class="data-grid__body">
        <div class="data-grid__row">...</div>
    </div>
</div>
```

### Lista de entidades

```text
.lista-entidades
.lista-entidades__item
.lista-entidades__titulo
.lista-entidades__meta
.lista-entidades__acoes
```

Regra oficial de escolha:

- `data-table`: dado estritamente tabular, relação linha/coluna central, comparação entre registros e uso apropriado de `<table>`;
- `data-grid`: conteúdo operacional com aparência tabular, ações por linha, flexibilidade de composição das células e utilidade de resize;
- `lista de entidades`: cada registro percebido como bloco, hierarquia visual interna, comparação coluna a coluna não essencial e mobile naturalmente em cards/blocos.

Estrutura tÃ©cnica oficial:

```html
<div class="lista-entidades">
    <article class="lista-entidades__item lista-entidades__item--horizontal">
        <div class="lista-entidades__conteudo">
            <div class="lista-entidades__titulo">Nome da entidade</div>
            <div class="lista-entidades__meta">Metadados principais</div>
        </div>

        <div class="lista-entidades__acoes">
            ...
        </div>
    </article>
</div>
```

Modificadores atuais:

```text
.lista-entidades__item--horizontal
.lista-entidades__item--interativo
.lista-entidades__item--inativo
.lista-entidades__item--suave
```

Usar lista de entidades quando o registro tiver hierarquia prÃ³pria e for lido como bloco.

NÃ£o usar lista de entidades para dado estritamente tabular, relatÃ³rio comparativo ou matriz linha/coluna.

No mobile, a lista de entidades empilha conteÃºdo e aÃ§Ãµes sem scroll horizontal.

Casos atuais recomendados:

- Pacientes → `data-table`;
- Movimentações → `data-grid`;
- Dashboard → `data-grid`;
- Usuários → lista de entidades;
- Cursos → lista de entidades;
- Arquivados → lista de entidades;
- Auditoria → `data-table`;
- Frequência → decisão por bloco;
- Prontuários → não forçar estrutura tabular;
- Perguntas cadastradas → lista de entidades.

Classes principais:

```text
.data-table
.data-grid
.data-grid__header
.data-grid__body
.data-grid__row
.data-grid__cell
.lista-entidades
.lista-entidades__item
.lista-entidades__titulo
.lista-entidades__meta
.lista-entidades__acoes
.event-badge
```

### 8.1 Hierarquia de Superfícies e Containers Administrativos Mobile (R1.3)

Em telas mobile (`<= 767px`), a interface adota uma hierarquia estrita e limpa de três níveis:

```text
FUNDO DA APLICAÇÃO (--app-background: #eef3fb)
        ↓
SUPERFÍCIE PRINCIPAL BRANCA (.surface-primary / .admin-list)
  Contorno institucional delicado de 1px (var(--blue-200): #d6e5ff)
        ↓
REGISTROS ADMINISTRATIVOS (.admin-record / .record-accent)
  Acento lateral azul de 3px (var(--blue-600): #1f60e8) à esquerda
```

#### A) Superfície Principal (`.surface-primary` / `.card-surface--primary`)
- Container branco apoiado diretamente sobre o fundo da aplicação (`--app-background: #eef3fb`).
- Delimita e estabiliza a área administrativa através de uma borda institucional delicada de 1px (`border: 1px solid var(--blue-200)`).
- Não utilizar `var(--blue-600)` como contorno integral do container (ficaria pesado/excessivo).
- Não aplicar a borda azul indiscriminadamente em todo `.card` (KPIs, formulários, acordeões e filtros neutros preservam borda neutra).
- Utilizada em `.admin-list`, `.list-shell` e containers mestres equivalentes.

#### B) Registro com Acento Lateral (`.record-accent`)
- Registros administrativos listáveis utilizam acento lateral azul global de 3px (`border-left: 3px solid var(--blue-600)`).
- Cria ritmo de leitura e identificação imediata de itens ativos da base sem interferir na semântica interna de cada domínio.
- Compartilhado entre listagens de Pacientes (`.admin-record`), Movimentações (`.activities-row`) e eventos importantes do Dashboard (`.dashboard-event-row`).
- O acento lateral NÃO deve ser aplicado a KPIs, botões, filtros, inputs ou cards estáticos.

#### C) Princípio de Superfície Única (Proibição de Superfícies Redundantes)
- É terminantemente proibido empilhar superfícies brancas independentes sem função estrutural ("card dentro de card").
- O container principal deve agrupar diretamente os registros dentro do corpo com scroll interno (`.admin-list__body`).
- Elementos estruturais intermediários, como `table.data-table`, devem operar no mobile com `background: transparent; border: none; border-radius: 0; box-shadow: none;` para não gerar uma moldura branca duplicada em torno dos registros.

### Aparência global

Tokens em `base.css`:

```css
--fundo-cabecalho-destaque:
    linear-gradient(135deg,
        var(--blue-600) 0%,
        var(--blue-500) 100%);
--texto-cabecalho-destaque: var(--white);
--texto-cabecalho-destaque-suave: rgba(255, 255, 255, 0.78);
--borda-cabecalho-destaque: var(--blue-500);
--altura-cabecalho-destaque: 50px;
--padding-cabecalho-destaque-y: 11px;
--padding-cabecalho-destaque-x: 14px;

--cor-grid-cabecalho: var(--fundo-cabecalho-destaque);
--cor-grid-cabecalho-texto: var(--texto-cabecalho-destaque);
--cor-grid-linha: var(--white);
--cor-grid-zebra: var(--blue-50);
--cor-grid-divisoria: var(--blue-200);
--cor-grid-hover: var(--blue-100);
```

O cabeçalho destacado reutiliza o gradiente azul compacto consolidado no Dashboard (`blue-600` → `blue-500`). As classes globais `.cabecalho-destaque`, `.cabecalho-destaque__toggle` e `.cabecalho-destaque__toggle-icon` devem ser reutilizadas por faixas de seção equivalentes. O estado recolhido deve evitar massa visual desnecessária, ocultando subtítulo quando ele não for essencial. Tabelas e grids usam zebra azul suave para preservar legibilidade sem competir com o cabeçalho.

Para cabeçalhos que ocupam o topo de um `.panel`, usar `.cabecalho-destaque--encaixado`. Quando o painel também puder abrir e recolher, reutilizar a estrutura global `.painel-retratil`, `.painel-retratil__header`, `.painel-retratil__conteudo` e `.painel-retratil__conteudo-inner`, com o comportamento centralizado em `Frontend/recursos/js/painel-retratil.js`. Não recriar esse acordeão em CSS ou JavaScript de página.

O estado aberto/fechado dos painéis retráteis deve ser preservado em `sessionStorage`: navegar para outra página e voltar na mesma aba mantém o último estado; fechar a aba encerra essa preferência. Não usar `localStorage` para esse estado. Cada página define apenas seu estado inicial. Os painéis de criação de **Nova Pergunta** e **Criar Novo Prontuário** iniciam fechados em uma nova aba; o Dashboard inicia **Movimentações importantes** aberto e depois respeita o último clique da aba.

### Alinhamento desktop

Cabeçalho e conteúdo seguem centralização global no desktop.

Componentes internos da célula devem herdar o alinhamento da célula.

### Regra

CSS de página pode definir apenas a estrutura das colunas quando necessário.

Não pode definir localmente:

- zebra;
- cor de cabeçalho;
- padding comum das células;
- fonte comum do grid;
- divisórias;
- hover;
- alinhamento global.

---

## 9. Colunas redimensionáveis

Comportamento oficial:

```text
Frontend/recursos/js/redimensionar-grid.js
```

Para ativar:

```html
data-grid-redimensionavel="true"
data-grid-id="nome-unico"
```

Regras:

- desktop: redimensionamento permitido;
- largura mínima: controlada pelo JS global;
- preferência persistida em `localStorage`;
- mobile: redimensionamento desativado.

Não criar JS de resize específico para uma página.

---

## 10. Paginação

Comportamento oficial:

```text
Frontend/recursos/js/paginacao.js
```

Classe:

```js
PaginacaoLista
```

Opções oficiais:

```text
10
20
30
50
100
```

Desktop:

- seletor pesquisável;
- primeira página;
- anterior;
- indicador;
- próxima;
- última;
- seletor à esquerda;
- navegação à direita.

Mobile:

- select nativo;
- navegação compacta.

Toda listagem com potencial de muitos registros deve considerar `PaginacaoLista`.

Não criar paginação independente em HTML/JS quando o componente global atende ao caso.

---

## 11. Botões, inputs e formulários

Antes de criar nova classe de botão, input, select, checkbox ou search box, procurar implementação em `componentes.css`.

Campos de formulário devem usar a linguagem visual global.

Para seleção de vários valores em um único campo, reutilizar `.seletor-multiplo`, `.seletor-multiplo__controle`, `.seletor-multiplo__menu` e `.seletor-multiplo__opcoes` de `componentes.css`, em vez de duplicar um select simples e uma lista separada de checkboxes.

Erros de formulário relacionados diretamente a um campo devem aparecer próximos ao campo quando isso melhorar a compreensão.

---

## 11.1 Ícones de interface

Fonte oficial:

```text
Frontend/recursos/js/icones.js
```

Regras:

- ícones de interface não devem usar emoji nem caracteres cuja aparência dependa da fonte ou do sistema operacional;
- usar os SVGs centralizados em `icones.js` por meio de `data-icone`;
- tamanho e comportamento visual pertencem às classes globais `.icone` e seus modificadores em `componentes.css`;
- SVGs usam `currentColor`; a cor deve vir dos tokens e classes semânticas já existentes;
- ícones decorativos devem permanecer com `aria-hidden="true"`; ações continuam precisando de texto visível ou `aria-label`;
- conteúdo criado dinamicamente deve chamar `IconesCAIGE.aplicar(container)` depois de inserir elementos com `data-icone`;
- não criar SVG inline diferente em cada página quando um ícone equivalente já existir na fonte global;
- botões somente com ícone devem reutilizar o componente global já responsável por aquela ação, como `cabecalho-destaque__toggle` ou `menu-acoes-trigger`, em vez de receber estilo local.

Exemplo:

```html
<span class="icone icone--sm" data-icone="buscar" aria-hidden="true"></span>
```

A migração de emojis legados deve ser gradual, aproveitando alterações reais nas telas, sem refatoração massiva apenas por estética.

---

## 11.2 Visualização de prontuários registrados

A resposta de um prontuário já salva possui duas experiências diferentes do formulário de lançamento:

- histórico por curso: lista compacta, com detalhes mínimos e ação `Visualizar`;
- visualização somente leitura: documento clínico próprio; a tela permanece em HTML e a impressão é gerada em PDF institucional pelo sistema.

Fonte de renderização:

```text
Frontend/recursos/js/renderizador-prontuario.js
```

Composição visual do prontuário do paciente:

```text
Frontend/recursos/css/paginas/prontuario-paciente.css
```

Composição visual do documento somente leitura:

```text
Frontend/recursos/css/paginas/prontuario-documento.css
```

Regras:

- não reutilizar o formulário editável para apresentar um lançamento já salvo;
- visualização individual e comparação devem consumir o mesmo renderizador;
- `Comparar lançamentos` só deve ser oferecido quando existirem pelo menos dois registros no histórico do paciente, pode combinar lançamentos de cursos diferentes e deve limitar a seleção a três registros por vez;
- impressão deve usar o conteúdo já armazenado, sem criar ou anexar arquivos ao CAIGE; o PDF é montado localmente no navegador a partir do mesmo modelo usado na visualização;
- o PDF clínico deve reutilizar a logo horizontal oficial `Frontend/recursos/images/logocaige.png`; `logo-caige.png` é apenas o símbolo quadrado e não deve ser usado como marca horizontal em documentos;
- perguntas de texto podem ocupar largura total; perguntas objetivas podem aproveitar duas colunas quando houver espaço;
- a tela de evolução deve mostrar um resumo compacto do histórico e não repetir descrição completa de cada prontuário.

---

## 11.3 Documentos, relatórios e exportações

O CAIGE possui dois tipos oficiais de saída documental e cada um deve usar a tecnologia adequada ao conteúdo, mantendo a mesma identidade institucional.

### Relatórios tabulares

Relatórios estruturados em linhas e colunas, como **Auditoria** e **Frequência**, usam:

```text
jsPDF + jsPDF-AutoTable
Frontend/recursos/js/gerador-pdf.js
```

O `gerador-pdf.js` é a fonte compartilhada para:

- paleta institucional do documento;
- logo CAIGE / UNIVALE;
- cabeçalho;
- metadados e filtros;
- indicadores compactos;
- estilo-base das tabelas;
- rodapé;
- data e hora de emissão;
- numeração `Página X de Y`;
- configuração A4.

Regras:

- cabeçalhos de coluna devem ser repetidos automaticamente em páginas seguintes;
- não dividir relatórios por quantidade fixa de registros apenas para simular páginas; a paginação deve acompanhar o espaço real disponível;
- não rasterizar tabelas ou texto como imagem quando a saída puder ser construída diretamente em PDF;
- não recriar em cada tela a mesma rotina de logo, cores, margens, cabeçalho ou rodapé;
- relatórios extensos devem continuar naturalmente na página seguinte sem compactar excessivamente a tipografia;
- o relatório de Frequência não imprime o bloco explicativo sobre a fórmula de cálculo; essa orientação permanece apenas na interface quando necessária.

### Documentos clínicos

Prontuários individuais e comparações mantêm a **visualização em HTML/CSS**, mas a ação `Imprimir` gera um **PDF vetorial com jsPDF**, sem AutoTable. Essa separação preserva a composição clínica variável e elimina cabeçalhos/rodapés automáticos do navegador, como título da aba, URL/localhost e data/hora externa ao documento.

Arquivos canônicos:

```text
Frontend/recursos/js/renderizador-prontuario.js
Frontend/recursos/css/paginas/prontuario-documento.css
Frontend/recursos/js/gerador-pdf.js
```

O `renderizador-prontuario.js` continua sendo a fonte dos dados normalizados para visualização individual, comparação e impressão. O `gerador-pdf.js` apenas transforma esse mesmo modelo em A4, sem recriar regras clínicas nem converter perguntas e respostas para tabelas artificiais.

Regras de impressão do prontuário:

- preservar no PDF a mesma hierarquia aprovada da visualização: marca CAIGE/UNIVALE, `Documento clínico`, título, identificação, perguntas e respostas e rodapé;
- a data/hora do lançamento aparece somente no bloco de identificação do documento;
- o rodapé mostra a emissão: `Documento clínico gerado pelo CAIGE · Emitido em ...`;
- numeração `Página X de Y` só é acrescentada quando o documento possuir mais de uma página;
- a ação de impressão não deve usar `window.print()` sobre a página HTML, evitando título da aba, URL/localhost, data/hora e paginação adicionados pelo navegador;
- respostas extensas devem continuar em página seguinte sem reduzir excessivamente a tipografia;
- a comparação mantém cada lançamento como documento clínico independente dentro do mesmo PDF.

---

## 12. Login

O Login é uma exceção de layout, não uma exceção de identidade visual.

### Desktop

- painel claro à esquerda;
- painel institucional azul à direita;
- o painel azul utiliza gradiente institucional escuro, baseado na família `--blue-800` / `--blue-900`, preservando profundidade visual e evitando aparência chapada ou azul excessivamente claro;
- a transição entre o painel claro e o azul deve ser progressiva e suave, sem linha vertical perceptível;
- preservar os elementos circulares decorativos em duas camadas sobrepostas, com baixa opacidade, no canto superior direito e no canto inferior esquerdo;
- o card **Cuidado Interdisciplinar** permanece sobre o painel azul com superfície translúcida discreta e não deve perder contraste com o fundo;
- card branco de autenticação preservado;
- validações dentro do card;
- não substituir o gradiente aprovado por azul sólido ou por tons significativamente mais claros sem nova aprovação visual.

> **Visual aprovado da V1:** a composição, o gradiente azul escuro, a transição suave e os elementos circulares em camadas do login desktop são referência oficial e não devem ser reinterpretados por futuras padronizações globais.

### Mobile

- fundo azul em gradiente ocupando a tela;
- card branco centralizado vertical e horizontalmente;
- painel institucional desktop oculto;
- mensagens dentro do card.

Arquivo específico:

```text
Frontend/recursos/css/paginas/login.css
```

---

## 13. Responsividade

Arquivo oficial:

```text
Frontend/recursos/css/responsive.css
```

Breakpoints globais devem ser definidos ali quando afetarem componentes compartilhados.

CSS de página pode ter breakpoint local somente quando a necessidade for realmente exclusiva daquela tela.

### Bottom Navigation Adaptativa (Mobile <= 767px)

A navegação inferior para dispositivos móveis é gerada pelo Shell Global (`renderizarBottomNav` em `shell-global.js`) e possui comportamento adaptativo ergonômico:

- **Estado Expandido (Padrão e Topo)**:
  - Altura: 56px, largura `calc(100% - 24px)` (máx. 480px).
  - Exibe os 5 ícones com rótulos tipográficos de 10.5px.
  - Safe-area inferior preservada via padding no `body.caige-has-mobile-bottom-nav`.
- **Estado Compacto (`.mobile-bottom-nav--compact`)**:
  - Pílula flutuante centrada com 48px de altura e 268px de largura (`border-radius: var(--radius-full)`).
  - Rótulos ocultos suavemente (`opacity: 0; max-height: 0`), mantendo acessibilidade via `aria-label`.
- **Limiares de Histerese**:
  - Descida contínua >= **80px** ativa estado compacto.
  - Subida contínua >= **60px** ativa estado expandido.
  - Zona de topo (`scrollY <= 70px`) força expansão imediata e incondicional.
- **Proteção Temporal contra Oscilações (Cooldown)**:
  - Trava temporal de **280ms** após qualquer troca de estado, impedindo o efeito ping-pong em correções curtas de dedo.
- **Form Freeze**:
  - Suspensão imediata de alternâncias de estado durante o foco em qualquer elemento editável (`input`, `textarea`, `select`, `[contenteditable]`), evitando interferências com o teclado virtual.
- **Transição e Movimento**:
  - Duração suave de **280ms** (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Respeito a `@media (prefers-reduced-motion: reduce)` com `transition: none !important`.
- **Superfície e Translucidez**:
  - Superfície com `--surface-translucent: rgba(255, 255, 255, 0.93)` e borda `--border-translucent: rgba(228, 235, 245, 0.85)`.
  - Desfoque com `backdrop-filter: blur(8px)` via `@supports`.
- **Scrollbar Mobile (<= 767px)**:
  - O scroll permanece 100% funcional em todas as superfícies (toque, mouse/touchpad, teclado).
  - A representação visual da scrollbar é ocultada globalmente (`scrollbar-width: none` e `::-webkit-scrollbar { display: none; width: 0; height: 0; }`).
  - O comportamento é centralizado em `responsive.css` (`html, body, .admin-list__body, .list-shell__body, .modal__body, .scroll-discreto`).
  - NUNCA utilizar `overflow: hidden` apenas para esconder scrollbars.

---

## 14. JavaScript reutilizável

Componentes/comportamentos globais atuais:

```text
controle-acesso.js
date-picker-ptbr.js
icones.js
menu-acoes.js
menu-usuario.js
modal-confirmacao.js
notificacoes.js
paginacao.js
painel-retratil.js
redimensionar-grid.js
shell-global.js
sidebar-menu.js
text-normalizer.js
util-jwt.js
```

Antes de criar nova lógica de UI, verificar se existe comportamento reutilizável nesses arquivos.

---

## 15. Regra de decisão

Pergunta obrigatória antes de criar CSS:

> Esta regra é exclusiva desta tela?

Se a resposta for **não**, não deve ser colocada em `paginas/*.css`.

Mapa de decisão:

```text
cor / fonte / token
    → base.css

estrutura de página / sidebar / cabeçalho
    → layout.css

botão / input / card / grid / modal / filtro / paginação
    → componentes.css

responsivo compartilhado
    → responsive.css

comportamento compartilhado
    → JS global

apenas aquela tela
    → paginas/<tela>.css
```

---

## 16. Separação Arquitetural: Perfil Cadastral vs. Prontuário Clínico & Classificação de IMC

### 16.1 Separação de Responsabilidade das Telas
- **Perfil do Paciente (`visualizar.html`)**: Exclusivamente dados cadastrais e administrativos (identificação, dados de contato, endereço, responsável, status). NÃO exibe o bloco "Resumo Clínico". Contém botão de ação primária direta `[ Acessar Prontuário ]` precedendo os acordeões de informações cadastrais.
- **Prontuário do Paciente (`prontuario.html`)**: Referência clínica e assistencial oficial do sistema. Concentra o componente canônico `.clinical-summary` (IMC atual, condições de saúde, alergias, medicamentos em uso e observações clínicas) e a linha do tempo de atendimentos.

### 16.2 Fonte Canônica de Idade (`PatientFormUtils.calcularIdade`)
- O cálculo de idade e a transição exata de aniversário são centralizados unicamente em `PatientFormUtils.calcularIdade(dataNascimento, dataReferencia = new Date())`.
- Decomposição por partes (`ano`, `mês`, `dia`), imune a variações de fuso horário UTC/GMT-3 e segura contra falhas cross-realm em datas.
- Transição precisa no 60º aniversário: véspera = 59 anos (Adulto); dia do 60º aniversário = 60 anos (Idoso).

### 16.3 Classificação de IMC por Faixa Etária (`PatientFormUtils.classificarIMC`)
A classificação é calculada com o valor contínuo real antes do arredondamento visual (ex.: 24,96 kg/m² é classificado como "Peso normal" no adulto, exibindo "25,0"):

1. **Adultos (`idade < 60 anos`)**:
   - `IMC < 18.5`: "Abaixo do peso" (`status-pill--warning`)
   - `18.5 <= IMC < 25.0`: "Peso normal" (`status-pill--success`)
   - `25.0 <= IMC < 30.0`: "Sobrepeso" (`status-pill--warning`)
   - `30.0 <= IMC < 35.0`: "Obesidade Grau I" (`status-pill--danger`)
   - `35.0 <= IMC < 40.0`: "Obesidade Grau II" (`status-pill--danger`)
   - `IMC >= 40.0`: "Obesidade Grau III" (`status-pill--danger`)

2. **Idosos (`idade >= 60 anos`)**:
   - `IMC < 22.0`: "Baixo peso" (`status-pill--warning`)
   - `22.0 <= IMC < 27.0`: "Peso adequado (Eutrófico)" (`status-pill--success`)
   - `IMC >= 27.0`: "Sobrepeso" (`status-pill--warning`)

3. **Tratamento de Dados Incompletos**:
   - Se idade ou data de nascimento não puderem ser determinadas, a classificação retorna `null`, sem assumir regras silenciosas de adulto ou idoso.

