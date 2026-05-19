# [F-003] Criador e Editor Dinâmico de Documentação (Docs Engine)

## 📋 Descrição Geral
Esta funcionalidade transforma o módulo de Documentação do **Suri Tools** de um sistema estático baseado em arquivos locais para um motor de documentação totalmente dinâmico integrado ao banco de dados Postgres/Supabase. Desenvolvedores administradores agora têm autonomia total para criar, editar, atualizar e excluir artigos técnicos diretamente a partir da tela visual do Docs. O sistema traz sumário de navegação lateral instantâneo (ToC), controle estético de banners em gradientes fluidos e metadados de autoria corporativa.

## 🛠️ Detalhes da Implementação
*   **Módulo Afetado**: Documentação (Docs), Painel de Exibição, Scripts de Integração.
*   **Arquivos Criados/Alterados**:
    *   `src/pages/Docs.tsx` (Reescrito com formulário visual de edição, suporte a customização de banners e validações)
    *   `database/init-db.sql` (Criação física da tabela `documents`)
    *   `sync-docs.js` (Script utilitário para importar documentações locais para o banco na primeira inicialização)
*   **Data de Implementação**: 2026-05-19

## ⚙️ Regras de Negócio Associadas
*   **Permissões de Escrita**: Somente usuários cadastrados com a role `'admin'` possuem acesso visível e operacional para criar ou modificar conteúdos técnicos. Usuários padrão (`user`) contam com interface de leitura focada.
*   **Estética Flexível**: Banners com gradientes de cores hexadecimais de início/fim (`banner_from`/`banner_to`) podem ser criados de forma customizada por post para garantir impacto e sintonia com as paletas da marca.
*   **Créditos de Autoria**: Os artigos mostram o autor (`author_name`) e cargo (`author_role`) correspondentes, valorizando o ownership de cada ferramenta.
*   **Mapeamento de Sumário**: O sistema analisa títulos `h2`, `h3` e `h4` no Markdown e gera um Table of Contents interativo que reflete o scroll-spy na barra lateral.

## 🗄️ Estrutura de Banco de Dados (se aplicável)
*   **Tabela `documents`**:
    *   `id` (UUID, PRIMARY KEY)
    *   `slug` (TEXT, UNIQUE, caminhos amigáveis)
    *   `title`, `category`, `content` (Metadados essenciais e texto do artigo)
    *   `author_name`, `author_role` (Dados do criador)
    *   `banner_from`, `banner_to`, `banner_title`, `banner_subtitle` (Aparência do cabeçalho)
