## Suri Support Console — Plano

SPA interna para o time de Suporte consultar a API da Suri. Tudo vive em uma única rota (`/`) com painel de configuração, menu lateral de endpoints e área de resultado. Sem backend próprio — o navegador chama a API direto usando o Bearer Token informado.

### Stack
- TanStack Start (já configurado) + React + Tailwind v4 (já configurado)
- shadcn/ui (Button, Input, Card, Tabs, Sidebar, Badge) + sonner para toasts
- Fetch nativo, sem libs extras de HTTP

### Estrutura de arquivos
```text
src/
  routes/index.tsx              → layout com Sidebar + Header + área principal
  components/suri/
    CredentialsBar.tsx          → URL base + Bearer token + Salvar (localStorage)
    EndpointSidebar.tsx         → menu de endpoints agrupados
    ResultPanel.tsx             → tabela amigável OU JSON formatado (toggle)
    EndpointRunner.tsx          → renderiza inputs dinâmicos + botão Executar
    FlowTracker.tsx             → tela especial do rastreador de fluxo
  lib/suri/
    client.ts                   → fetch wrapper (Accept + Authorization, try/catch, toasts)
    endpoints.ts                → catálogo declarativo de todos os endpoints
    storage.ts                  → get/set credenciais no localStorage
    flow-tracker.ts             → varre mensagens e extrai quickReplyPostbacks
    models.ts                   → tipos baseados no instrucoes.md (User, Message, etc)
```

### Catálogo de endpoints (declarativo)
Cada item: `{ id, label, group, method, path, params: [{name, in: 'path'|'query'|'body'}] }`. O `EndpointRunner` lê isso e gera os inputs automaticamente — sem duplicar código por botão.

Grupos:
- Atendentes/Canais: `GET /attendants`, `GET /channels`
- Fluxos/Templates: `GET /flows`, `GET /templates`, `GET /templates/:template_id`
- Campanhas: `GET /campaigns/:id`, `GET /campaigns/:id/export`
- E-commerce: `GET /shop/stores`, `GET /shop/collections`, `GET /shop/products/list?page=10`, `POST /shop/products/:productId`, `GET /shop/orders/:id`, `GET /shop/users/:userId`
- Atendimentos: `GET /attendances/reasons`, `GET /attendances/reasons/:id`, `POST /attendances`
- Rastreador de Fluxo (especial): `GET /contacts/:user_id/messages`

> **Nota:** Para adicionar novos endpoints, consulte o guia completo em `como-adicionar-endpoints.md`. A referência completa dos modelos, webhooks e APIs está documentada em `instrucoes.md`.

### Cliente HTTP (`lib/suri/client.ts`)
- Lê `baseUrl` e `token` do localStorage
- Sempre envia headers `Accept: application/json` e `Authorization: Bearer <token>`
- `try/catch` central:
  - 401/403 → toast vermelho "Token inválido ou sem permissão"
  - 404 → toast vermelho "Recurso não encontrado"
  - Outros erros → toast vermelho com status + mensagem
  - Sucesso (e `success: true` quando presente) → toast verde
- Substitui `:param` no path e monta query string para parâmetros `in: 'query'`

### Rastreador de Fluxo do Contato
Componente dedicado no topo da sidebar:
1. Input `user_id` + botão "Rastrear"
2. Chama `GET /contacts/:user_id/messages`
3. Itera `data[]`, lê `msg.custom?.quickReplyPostbacks` (pega a última ocorrência não-vazia, mais recente)
4. Renderiza em destaque (Card grande, badge verde):
   > **O contato está no fluxo:** `flow://cb150396481/2/0~;flow://cb150396481/2/1`
5. Botão secundário "Ver JSON bruto" abre collapsible com o payload completo
6. Se nenhum `quickReplyPostbacks` for encontrado → mensagem amigável "Nenhum postback de fluxo localizado nas mensagens deste contato"

### Webhooks & Models
A API também permite trabalhar com integração via Webhooks. Os eventos suportados (`new-contact`, `change-queue`, `finish-attendance`, `message-received`, `message-sent`) e as tipagens TypeScript (`User`, `Message`, `Template`, `Campaign`, etc.) estão detalhados em `instrucoes.md`.

### Painel de resultado
- Toggle **Tabela / JSON**
- Tabela: se `data` for array de objetos, gera colunas a partir das chaves de 1º nível; valores complexos viram `[object]` clicável que expande JSON
- JSON: `JSON.stringify(payload, null, 2)` em `<pre>` com syntax highlight leve (CSS apenas)
- Botão "Copiar JSON"

### Credenciais
- Salvas em `localStorage` (`suri.baseUrl`, `suri.token`)
- Token mascarado como `password` input
- Indicador visual no header: badge verde "Conectado" quando ambos preenchidos, cinza "Sem credenciais" caso contrário
- Botão "Limpar"

### UX/Design
- Tema claro com acento único (azul Suri-like) definido em `src/styles.css` via tokens — sem cores hardcoded
- Layout: Sidebar fixa à esquerda (collapsible), header sticky com credenciais, main com `ResultPanel`
- Toasts via `sonner` (já no template)
- Responsivo: sidebar vira sheet no mobile

### Index/SEO
- `head()` da rota: title "Suri Support Console", description curta, sem indexação especial (ferramenta interna)

### Fora de escopo
- Sem autenticação de usuário (a ferramenta é interna, o Bearer já é o "login")
- Sem persistência de histórico de requisições (pode ser adicionado depois)
- Sem proxy backend — chamadas vão direto do browser para a API Suri (assume CORS liberado; se não estiver, sinalizo para você)
