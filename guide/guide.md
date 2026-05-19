# Guia Geral do Projeto (Suri Tools)

Bem-vindo ao **Suri Tools**! Este arquivo serve como o manual definitivo sobre a estrutura, as dependências, as tecnologias e o funcionamento geral do projeto. Ele foi projetado para auxiliar novos desenvolvedores e guiar a evolução técnica da plataforma.

---

## 🚀 Visão Geral da Plataforma

O **Suri Tools** é um hub de ferramentas modulares voltado para otimizar fluxos de trabalho, precificar propostas comerciais (Upsell/Downsell), gerenciar tarefas através de quadros Kanban, automatizar fluxos de processos visuais e realizar testes rápidos integrados de API. 

A plataforma foi desenvolvida focando em **extrema performance**, **design premium (glassmorphism)** e **capacidade offline** (PWA).

---

## 🛠️ Tecnologias e Dependências

A plataforma utiliza uma stack moderna e extremamente eficiente de desenvolvimento frontend e backend:

### Core & Framework
*   **React 19** (`react`, `react-dom`): Biblioteca principal para a interface.
*   **Vite 7** (`vite`): Build tool e dev server de altíssima velocidade.
*   **TypeScript 5**: Tipagem estática para robustez do código.
*   **React Router DOM 7**: Roteamento client-side modular e eficiente.

### Estilização & UI
*   **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/vite`): Framework CSS utilitário integrado de forma nativa ao Vite para compilação super rápida.
*   **Radix UI**: Primitivos de componentes acessíveis e sem estilo (Accordion, Dialog, Popover, Select, Tabs, etc.).
*   **Lucide React**: Biblioteca padrão de ícones vetoriais.
*   **Glassmorphism**: Efeitos visuais nativos implementados com desfoque de fundo e gradientes radiais no `src/index.css`.

### Estado & Banco de Dados
*   **Supabase Client (`@supabase/supabase-js`)**: Integração direta com banco de dados em nuvem e autenticação.
*   **React Query v5 (`@tanstack/react-query`)**: Gerenciamento de estado de dados assíncronos, cache e sincronização em tempo real.
*   **Zod**: Validação de esquemas e dados.

### Integrações e Bots
*   **Node Telegram Bot API (`node-telegram-bot-api`)**: Usado para comunicação ativa com o Telegram para envio de OTPs e checagem de avatares.
*   **Input-OTP**: Primitivos de entrada visual para inserção fluida de códigos numéricos de segurança.

### Outras Ferramentas Relevantes
*   **Recharts**: Biblioteca de gráficos interativos e responsivos.
*   **VextFlow / React Flow (`@xyflow/react`)**: Biblioteca para construção de fluxos de processos visuais interativos.
*   **HTML-to-Image / Canvas**: Utilitários para exportação de propostas e relatórios comerciais.

---

## 📂 Estrutura de Pastas e Arquivos

```
suri-tools/
├── .env.example              # Exemplo de variáveis de ambiente (Supabase, Telegram, etc.)
├── api/                      # Serverless Functions para ambientes de produção
│   └── bot.js                # Webhook do Telegram integrado para deploy na Vercel
├── database/                 # Estruturas locais de migração e schemas do banco
│   └── init-db.sql           # Schema SQL completo e seeds para PostgreSQL
├── docker-compose.yml        # Docker para orquestração de Postgres local e PostgREST
├── features/                 # Demandas e solicitações futuras/implementadas
│   ├── implemented/          # Demandas concluídas e integradas com documentação detalhada
│   └── pending/              # Demandas em análise, criação ou desenvolvimento
├── guide/                    # Pasta com guias dedicados
│   ├── Style.md              # Documentação visual, cores e tipografia (Sora)
│   ├── backend-setup.md      # Instruções de configuração do backend e docker-compose
│   ├── deploy-producao.md    # Fluxo de deploy na Vercel e apontamento de Webhooks
│   ├── guide.md              # Este manual geral do projeto
│   ├── models.md             # Modelagem de banco, relacionamentos, tabelas e enums
│   └── rules.md              # Regras de negócio comerciais, Kanban e Autenticação
├── public/                   # Recursos estáticos (Logos, SVGs, etc.)
├── src/                      # Código fonte da aplicação
│   ├── App.tsx               # Roteamento global, proteção de sessões e Providers
│   ├── index.css             # Folha de estilo global e tokens do design system
│   ├── main.tsx              # Ponto de entrada do React
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ui/               # Primitivos Shadcn/Radix (Button, Dialog, etc.)
│   │   ├── suri/             # Componentes específicos Suri
│   │   ├── AdminUsersModal.tsx   # Modal de controle de usuários (acesso de administradores)
│   │   ├── PricingCalculator.tsx # Calculadora principal de Upsell/Downsell
│   │   ├── ChangelogModal.tsx    # Modal de novidades dinâmico
│   │   ├── DownsellModal.tsx     # Modal de retenção/downsell comercial
│   │   └── QuoteModal.tsx        # Modal para geração de propostas e PDF
│   ├── data/                 # Arquivos de dados estáticos do projeto
│   │   └── changelogs/       # Registros markdown de atualizações por versão
│   ├── docs/                 # Documentações e Manifestos internos
│   │   ├── authors.ts        # Registro de autores da plataforma
│   │   └── manifest.ts       # Metadados e páginas de documentação cadastrados
│   ├── hooks/                # Hooks customizados (useTheme, usePWAInstall)
│   ├── layouts/              # Templates de página
│   │   └── HubLayout.tsx     # Layout geral com informações do perfil ativo e de versão
│   ├── lib/                  # Serviços e clientes de API
│   │   ├── supabase.ts       # Inicialização do cliente Supabase
│   │   ├── kanban-service.ts # Serviços de manipulação do Kanban
│   │   ├── telegram-avatar.tsx # Utilidades e hooks de imagem de perfil do Telegram
│   │   └── utils.ts          # Utilitários gerais (como a função cn)
│   ├── pages/                # Páginas e Módulos principais do Hub
│   │   ├── Dashboard.tsx     # Menu principal de seleção de módulos
│   │   ├── Calcs.tsx         # Interface para a calculadora comercial
│   │   ├── Kanban.tsx        # Quadro Kanban para gestão de demandas
│   │   ├── WorkFlow.tsx      # Editor visual de fluxos de processos
│   │   ├── ApiSuri.tsx       # Sandbox para testes de requisições de API
│   │   ├── Docs.tsx          # Visualizador e editor dinâmico de documentação
│   │   ├── Login.tsx         # Interface de login seguro via OTP Telegram
│   │   └── AdminUsers.tsx    # Painel administrativo de usuários
│   └── test/                 # Testes unitários e de integração
├── sync-docs.js              # Script utilitário de sincronização local de markdown com o banco
├── telegram-bot.js           # Bot de Telegram executando localmente por Polling
├── vercel.json               # Configurações de deploy para a Vercel
└── vite.config.ts            # Configurações do compilador Vite e plugins (PWA)
```

---

## 🚀 Fluxo de Inicialização e Desenvolvimento

1.  **Instalação**: Instale as dependências com `npm install`.
2.  **Variáveis de Ambiente**: Copie o `.env.example` para `.env` e configure as credenciais do Supabase e o token do Bot do Telegram.
3.  **Execução do Bot Local**: Rode `node telegram-bot.js` para ligar o escutador de comandos do Telegram localmente.
4.  **Execução do Frontend**: Rode o comando `npm run dev` para iniciar o servidor de desenvolvimento em `http://localhost:5173`.
5.  **Banco de Dados Local (Opcional)**: Use o `docker-compose up -d` para rodar o banco PostgreSQL local em conjunto com os scripts do diretório `database/`.
6.  **Sincronização de Docs**: Se estiver usando banco local, execute `node sync-docs.js` para preencher as tabelas de documentações.
7.  **Produção**: Use `npm run build` para compilar o bundle estático altamente otimizado para deploy na Vercel ou Cloudflare.
