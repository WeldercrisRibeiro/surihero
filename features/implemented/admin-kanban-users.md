# [F-002] Painel Admin & Gestão de Usuários no Kanban

## 📋 Descrição Geral
Esta funcionalidade introduz um nível robusto de controle administrativo e de governança à plataforma **Suri Tools**. Ela implementa um sistema de Controle de Acesso Baseado em Papéis (RBAC), permitindo que usuários identificados com o papel `'admin'` gerenciem perfis e visualizem os quadros de Kanban dos respectivos membros da equipe. Adicionalmente, o painel Kanban foi otimizado para permitir flexibilidade estética na exibição ou ocultação dos cargos dos membros associados aos cards.

## 🛠️ Detalhes da Implementação
*   **Módulo Afetado**: Kanban, Painel Admin, Layout Principal.
*   **Arquivos Criados/Alterados**:
    *   `src/pages/AdminUsers.tsx` (Tela dedicada para exibição e controle de membros)
    *   `src/components/AdminUsersModal.tsx` (Modal de gerência rápida de permissões)
    *   `src/pages/Kanban.tsx` (Quadro ágil atualizado com controle multiusuário para Admins)
    *   `src/layouts/HubLayout.tsx` (Proteção visual e adição do atalho administrativo com ícone de escudo)
    *   `database/init-db.sql` (Enum de roles e perfis default criados)
*   **Data de Implementação**: 2026-05-19

## ⚙️ Regras de Negócio Associadas
*   **Privilégios Restritos**: Apenas usuários autenticados cuja role seja igual a `'admin'` podem interagir com modais administrativos e gerenciar permissões.
*   **Flexibilidade do Kanban**: Permite a seleção visual de múltiplos quadros para monitoramento técnico, enquanto usuários normais visualizam exclusivamente suas próprias tarefas para foco e produtividade.
*   **Exibição Opcional de Roles**: Ajustado para ocultar ou exibir cargos de membros nos cards, otimizando a legibilidade e densidade de informação visual do quadro.

## 🗄️ Estrutura de Banco de Dados (se aplicável)
*   **Enum `user_role`**: Tipo personalizado contendo as roles `'user'` e `'admin'`.
*   **Tabela `profiles`**: O campo `role` controla dinamicamente as permissões nos endpoints e fluxos do frontend.
