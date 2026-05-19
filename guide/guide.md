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

### Outras Ferramentas Relevantes
*   **Recharts**: Biblioteca de gráficos interativos e responsivos.
*   **VextFlow / React Flow (`@xyflow/react`)**: Biblioteca para construção de fluxos de processos visuais interativos.
*   **HTML-to-Image / Canvas**: Utilitários para exportação de propostas e relatórios comerciais.

---

## 📂 Estrutura de Pastas e Arquivos

```
suri-tools/
├── .env.example              # Exemplo de variáveis de ambiente (Supabase, etc.)
├── Guide/                    # Pasta com guias dedicados
│   └── Style.md              # Documentação visual, cores e tipografia (Sora)
├── database/                 # Estruturas locais de migração de banco de dados
├── docker-compose.yml        # Docker para orquestração de Postgres local
├── features/                 # Demandas e solicitações futuras/implementadas
│   ├── implemented/          # Demandas concluídas e integradas
│   └── pending/              # Demandas em análise, criação ou desenvolvimento
├── public/                   # Recursos estáticos (Logos, SVGs, etc.)
├── src/                      # Código fonte da aplicação
│   ├── App.tsx               # Roteamento global e Providers
│   ├── index.css             # Folha de estilo global e tokens do design system
│   ├── main.tsx              # Ponto de entrada do React
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ui/               # Primitivos Shadcn/Radix (Button, Dialog, etc.)
│   │   ├── suri/             # Componentes específicos Suri
│   │   ├── PricingCalculator.tsx # Calculadora principal de Upsell/Downsell
│   │   ├── ChangelogModal.tsx    # Modal de novidades dinâmico
│   │   ├── DownsellModal.tsx     # Modal de retenção/downsell comercial
│   │   └── QuoteModal.tsx        # Modal para geração de propostas e PDF
│   ├── docs/                 # Documentações e Manifestos internos
│   │   ├── authors.ts        # Registro de autores da plataforma
│   │   └── manifest.ts       # Metadados e páginas de documentação cadastrados
│   ├── hooks/                # Hooks customizados (useTheme, usePWAInstall, useAuth)
│   ├── layouts/              # Templates de página
│   │   └── HubLayout.tsx     # Layout geral do Hub com Watermark e Footer de versão
│   ├── lib/                  # Serviços e clientes de API
│   │   ├── supabase.ts       # Inicialização do cliente Supabase
│   │   ├── kanban-service.ts # Serviços de manipulação do Kanban
│   │   └── utils.ts          # Utilitários gerais (como a função cn)
│   ├── pages/                # Páginas e Módulos principais do Hub
│   │   ├── Dashboard.tsx     # Menu principal de seleção de módulos
│   │   ├── Calcs.tsx         # Interface para a calculadora comercial
│   │   ├── Kanban.tsx        # Quadro Kanban para gestão de demandas
│   │   ├── WorkFlow.tsx      # Editor visual de fluxos de processos
│   │   ├── ApiSuri.tsx       # Sandbox para testes de requisições de API
│   │   ├── Docs.tsx          # Visualizador da documentação técnica
│   │   └── AdminUsers.tsx    # Painel administrativo de usuários
│   └── test/                 # Testes unitários e de integração
├── vercel.json               # Configurações de deploy para a Vercel
└── vite.config.ts            # Configurações do compilador Vite e plugins (PWA)
```

---

## 🚀 Fluxo de Inicialização e Desenvolvimento

1.  **Instalação**: Instale as dependências com `npm install`.
2.  **Variáveis de Ambiente**: Copie o `.env.example` para `.env` e configure as credenciais do Supabase.
3.  **Execução**: Rode o comando `npm run dev` para iniciar o servidor de desenvolvimento em `http://localhost:5173`.
4.  **Banco de Dados Local (Opcional)**: Use o `docker-compose up -d` para rodar o banco PostgreSQL local em conjunto com os scripts do diretório `database/`.
5.  **Produção**: Use `npm run build` para compilar o bundle estático altamente otimizado para deploy na Vercel ou Cloudflare.
