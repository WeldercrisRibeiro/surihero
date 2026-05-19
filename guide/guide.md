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

### Estado & Cache
*   **React Query v5 (`@tanstack/react-query`)**: Gerenciamento de estado de dados assíncronos e cache.
*   **Zod**: Validação de esquemas e dados.

### Outras Ferramentas Relevantes
*   **Recharts**: Biblioteca de gráficos interativos e responsivos.
*   **VextFlow / React Flow (`@xyflow/react`)**: Biblioteca para construção de fluxos de processos visuais interativos.
*   **HTML-to-Image / Canvas**: Utilitários para exportação de propostas e relatórios comerciais.

---

## 📂 Estrutura de Pastas e Arquivos

```
suri-tools/
├── features/                 # Demandas e solicitações futuras/implementadas
│   ├── implemented/          # Demandas concluídas e integradas com documentação detalhada
│   └── pending/              # Demandas em análise, criação ou desenvolvimento
├── guide/                    # Pasta com guias dedicados
│   ├── Style.md              # Documentação visual, cores e tipografia (Sora)
│   ├── guide.md              # Este manual geral do projeto
│   └── rules.md              # Regras de negócio comerciais e Kanban
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
│   ├── data/                 # Arquivos de dados estáticos do projeto
│   │   └── changelogs/       # Registros markdown de atualizações por versão
│   ├── docs/                 # Documentações e Manifestos internos
│   │   ├── authors.ts        # Registro de autores da plataforma
│   │   └── manifest.ts       # Metadados e páginas de documentação cadastrados
│   ├── hooks/                # Hooks customizados (useTheme, usePWAInstall)
│   ├── layouts/              # Templates de página
│   │   └── HubLayout.tsx     # Layout geral com informações de versão
│   ├── lib/                  # Serviços e clientes de API
│   │   └── utils.ts          # Utilitários gerais (como a função cn)
│   ├── pages/                # Páginas e Módulos principais do Hub
│   │   ├── Dashboard.tsx     # Menu principal de seleção de módulos
│   │   ├── Calcs.tsx         # Interface para a calculadora comercial
│   │   ├── Kanban.tsx        # Quadro Kanban para gestão de demandas
│   │   ├── WorkFlow.tsx      # Editor visual de fluxos de processos
│   │   ├── ApiSuri.tsx       # Sandbox para testes de requisições de API
│   │   └── Docs.tsx          # Visualizador de documentação
│   └── test/                 # Testes unitários e de integração
├── vercel.json               # Configurações de deploy para a Vercel
└── vite.config.ts            # Configurações do compilador Vite e plugins (PWA)
```

---

## 🚀 Fluxo de Inicialização e Desenvolvimento

1.  **Instalação**: Instale as dependências com `npm install`.
2.  **Execução do Frontend**: Rode o comando `npm run dev` para iniciar o servidor de desenvolvimento em `http://localhost:5173`.
3.  **Produção**: Use `npm run build` para compilar o bundle estático altamente otimizado para deploy na Vercel ou Cloudflare.
