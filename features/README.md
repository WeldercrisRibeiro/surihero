# Controle de Recursos (Features & Demands Control)

Este diretório é o espaço oficial de registro, rastreamento e documentação de todas as solicitações de novos recursos, ajustes comerciais e demandas técnicas da plataforma **Suri Tools**.

---

## 📂 Estrutura de Fluxo de Trabalho

O ciclo de vida de uma nova solicitação segue a seguinte estrutura de pastas:

1.  **`features/pending/`**: Contém as demandas que estão em fase de criação, análise de viabilidade, design de arquitetura ou aguardando aprovação comercial.
2.  **`features/implemented/`**: Contém a documentação individual das demandas que já foram codificadas, testadas e implantadas no ambiente de produção.

---

## ⚡ Regra de Documentação Automática

Sempre que uma demanda for concluída e movida para a pasta **`features/implemented/`**, o desenvolvedor ou o assistente IA **deve sincronizar e atualizar obrigatoriamente** os seguintes arquivos:

*   **`models.md`**: Caso a demanda adicione, modifique ou remova tabelas, campos ou chaves no banco de dados.
*   **`rules.md`**: Caso a demanda envolva novas regras de negócio, limites de precificação, comportamentos comerciais ou novos estados de permissão.
*   **`guide.md`**: Caso a demanda introduza novas páginas, novas rotas, dependências adicionais no `package.json` ou reestruture pastas.

---

## 📝 Como cadastrar uma nova demanda

Utilize o template abaixo para criar um arquivo markdown (`nome-da-demanda.md`) dentro de `pending/` ou `implemented/`:

```markdown
# [ID da Demanda] Título da Demanda

## 📋 Descrição Geral
[Descreva o que a demanda resolve e seu objetivo principal]

## 🛠️ Detalhes da Implementação
*   **Módulo Afetado**: [ex: Suri Calcs, Kanban, etc.]
*   **Arquivos Criados/Alterados**: [Liste os arquivos]
*   **Data de Implementação**: [Data]

## ⚙️ Regras de Negócio Associadas
[Liste se houver novas regras de negócio]

## 🗄️ Estrutura de Banco de Dados (se aplicável)
[Descreva alterações em tabelas]
```
