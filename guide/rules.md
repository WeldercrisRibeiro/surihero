# Regras de Negócio (Business Rules)

Este documento centraliza todas as regras de negócio aplicadas no desenvolvimento do ecossistema **Suri Tools**, garantindo consistência operacional entre os diferentes módulos da plataforma.

---

## 💰 1. Regras de Precificação e Planos (Suri Calcs)

O módulo **Suri Calcs** é a ferramenta oficial de simulação comercial e vendas para equipes comerciais. Ele é estruturado em três planos principais: **Essencial**, **Pro** e **Advanced**.

### 1.1 Plano Essencial (Essential)
*   **Público-alvo**: Empresas que buscam canais básicos de contato inicial.
*   **Limites e Valores**:
    *   Possui franquia base de interações fixas.
    *   Adicionais sob demanda não alteram dinamicamente a estrutura complexa de custos do formulário, sendo limitados às definições padrão.

### 1.2 Plano Pro
*   **Público-alvo**: Empresas em estágio de crescimento.
*   **Limites e Valores**:
    *   Possui franquia base maior e recursos avançados de CRM.
    *   A precificação de adicionais segue faixas estáticas padrão definidas pelo comercial.

### 1.3 Plano Advanced (Regras Críticas)
*   **Custo Unitário Adicional Fixo**: Mensagens excedentes/adicionais têm custo de tabela fixado em **R$ 0,25** por mensagem em todas as categorias:
    *   *Marketing* (Disparos ativados pela marca)
    *   *Utility* (Mensagens de transação)
    *   *Authentication* (Mensagens de código de segurança/OTP)
    *   *Service / Receptive* (Mensagens receptivas de suporte)
*   **Bloqueio de Edição**: No modal "Ajuste de Preços", os campos de valor de custo adicional para o plano Advanced são de **apenas leitura (readonly)**, bloqueados em **R$ 0,25** para evitar erros humanos na proposta.
*   **Descontos Customizados e Modulares**:
    *   Permite aplicação de descontos percentuais personalizados por categoria de mensagem diretamente na proposta comercial.
    *   O cálculo final aplica o desconto modular em cima do preço unitário de R$ 0,25.

### 1.4 Regras de Transição e Propostas (Upsell & Downsell)
*   **Downsell Comercial**: Caso o cliente atual de planos corporativos queira reduzir o volume de contratos, o sistema dispara fluxos de simulação no **DownsellModal** com descontos de retenção pré-calculados para incentivar a permanência.
*   **Exportação para PDF**: Propostas simuladas geram orçamentos formais com validade padrão de **15 dias**, discriminando custos fixos mensais e custos variáveis estimados em tabela limpa e profissional.

---

## 📋 2. Regras de Gestão de Tarefas (Kanban)

O painel de tarefas segue o framework ágil de controle de demandas e bugs.

### 2.1 Fluxo de Trabalho (Workflow de Estados)
*   Os cards navegam horizontalmente entre as colunas respeitando a ordenação sequencial definida no campo `position` de `kanban_columns`.
*   A movimentação (Drag and Drop) atualiza instantaneamente no banco de dados a coluna (`column_id`) e a ordem vertical (`position`) de todos os cards impactados para manter a integridade visual.

### 2.2 Priorização de Demandas
*   Os cards possuem classificação de prioridade estrita: `BAIXO`, `MÉDIO`, `ALTO` ou `URGENTE`.
*   Demandas de prioridade `URGENTE` acionam alertas visuais destacados (pulsação ou bordas avermelhadas) na interface para foco imediato da equipe de engenharia.

### 2.3 Relação e Propriedade de Dados (RLS)
*   Qualquer ação de leitura, inserção ou atualização no Kanban exige validação de propriedade baseada no ID do usuário autenticado (`user_id`).
*   Usuários padrão só podem ver/modificar suas próprias colunas e cartões. Admins têm visão consolidada em painéis analíticos específicos.

---

## ⚡ 3. Regras de Integração e Testes (Suri API)

*   **Autenticação**: O sandbox de API respeita os tokens de acesso gerados para a conta do usuário. Em caso de token inválido, a resposta retorna `401 Unauthorized` e impede requisições automáticas subsequentes.
*   **Throttling**: Para simular cenários de produção, requisições disparadas consecutivamente no sandbox têm intervalo mínimo de **200ms**, evitando sobrecarga do gateway Suri.
