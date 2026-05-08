# Guia: Como Adicionar Novos Endpoints no Suri Connector

Este documento detalha como a arquitetura do **Suri Support Console** funciona e o passo a passo para você mesmo adicionar ou editar endpoints da API da Suri futuramente.

---

## 🛠️ Stack Tecnológica Utilizada

O projeto utiliza uma arquitetura moderna e reativa focada no frontend, sem a necessidade de um backend (Node.js/Express) próprio para intermediar as requisições (as chamadas são feitas direto pelo Client).

- **Core**: React 18 + Vite
- **Roteamento**: `@tanstack/react-router` (TanStack Start para roteamento baseado em arquivos)
- **Estilização**: TailwindCSS v4 + CSS Variables (Dark mode por padrão)
- **Componentes UI**: Componentes baseados no Shadcn/UI (Radix UI) e `sonner` para toasts (alertas visuais).
- **Linguagem**: TypeScript para tipagem estrita de parâmetros e respostas.

---

## 🏗️ Como Funciona a Camada de Rede ("Backend" do Client)

A aplicação possui um **HTTP Client centralizado** no arquivo `src/lib/suri/client.ts`. Ele é responsável por:
1. Ler a **URL Base** e o **Bearer Token** diretamente do `localStorage` (salvos pelo componente `CredentialsBar`).
2. Substituir variáveis de rota (ex: `/flows/:flowId`).
3. Montar *Query Strings* (ex: `?page=10`).
4. Montar o corpo da requisição (*JSON body*) para chamadas `POST`.
5. Fazer o `fetch` e tratar os códigos HTTP (401, 403, 404, etc.) disparando os Toasts visuais para o usuário.

**Você nunca precisará alterar o `client.ts` ou criar componentes visuais novos para adicionar um endpoint padrão.** O sistema visual é 100% dinâmico.

---

## 🚀 Passo a Passo: Como Adicionar um Novo Endpoint

Toda a mágica acontece no arquivo **`src/lib/suri/endpoints.ts`**. Ele atua como um "Catálogo" de rotas. O componente visual da tela lê esse array e **gera os campos de input e botões automaticamente**.

Para adicionar um novo endpoint, você só precisa inserir um novo objeto dentro do array `ENDPOINTS`.

### A estrutura base (`EndpointDef`)
Cada endpoint possui o seguinte formato:

```typescript
{
  id: "identificador-unico", // ID do endpoint (deve ser único, ex: "get-user")
  group: "Nome do Grupo",    // A categoria que aparecerá no Menu Lateral (ex: "Contatos")
  label: "Título Visual",    // Título que aparece no botão do Menu (ex: "Buscar Cliente")
  method: "GET" | "POST",    // O verbo HTTP da requisição
  path: "/sua/rota",         // A rota da API (ex: "/api/users/:id"). 
                             // Atenção: Use ":variavel" para indicar parâmetros de URL.
  description: "Opcional",   // Uma breve explicação do endpoint
  params: [                  // Lista de campos que o usuário precisará preencher na tela
    // ... definições de parâmetros
  ]
}
```

---

### Exemplo 1: Adicionando um GET com Query e Path params

Imagine que você descobriu a rota `GET /api/v1/contacts/:contactId/messages?limit=10`.
Basta abrir o arquivo `src/lib/suri/endpoints.ts` e adicionar:

```typescript
{
  id: "contact-messages",
  group: "Contatos",
  label: "Ver Mensagens",
  method: "GET",
  path: "/api/v1/contacts/:contactId/messages",
  params: [
    { 
      name: "contactId",     // Nome exato da variável no 'path' (/:contactId)
      in: "path",            // Diz ao sistema que isso vai na URL
      required: true,        // Torna o campo obrigatório na tela
      placeholder: "ID do Contato" 
    },
    { 
      name: "limit",         // Nome da query string (?limit=)
      in: "query",           // Diz ao sistema que isso é Query Params
      defaultValue: "10",    // Valor padrão que já vem preenchido no Input
      placeholder: "Limite de mensagens" 
    }
  ]
}
```

---

### Exemplo 2: Adicionando um POST com JSON Body

Se você descobrir que o endpoint real para criar contatos é `POST /api/v1/contacts/create`, e ele espera um JSON como `{"name": "Welder", "phone": "1199999"}`:

Abra o arquivo `src/lib/suri/endpoints.ts` e adicione:

```typescript
{
  id: "create-contact-v1",
  group: "Contatos",
  label: "Criar Contato (v1)",
  method: "POST",
  path: "/api/v1/contacts/create", // URL exata do recurso
  params: [
    { 
      name: "name",          // Chave do JSON
      in: "body",            // "body" avisa o sistema para colocar no JSON Payload
      required: true, 
      placeholder: "Nome completo do usuário" 
    },
    { 
      name: "phone",         // Chave do JSON
      in: "body", 
      required: true, 
      placeholder: "Telefone com DDD" 
    }
  ]
}
```

### O que acontece no Frontend?

No momento em que você salvar o arquivo `endpoints.ts`:
1. O Menu Lateral (`index.tsx`) detectará o novo grupo/label e renderizará o botão.
2. Ao clicar, o `EndpointRunner.tsx` criará uma caixa de texto (`<input>`) para cada parâmetro definido no array `params`.
3. Ao clicar em **Executar**, o `client.ts` varrerá os inputs, montará a URL final (substituindo o `path`), criará o JSON (juntando os que têm `in: "body"`) e fará a chamada exibindo a tabela no `ResultPanel.tsx`.

### Dicas Finais
- **Erros 404**: Se você tentar um `POST /users` e tomar 404, significa que aquele caminho de URL não existe no backend da Suri. Verifique a documentação oficial ou a URL Base para garantir que o *path* está exato.
- **Param Locations**: Os tipos permitidos no `in:` são `"path"` (para /:variavel), `"query"` (para ?var=valor) e `"body"` (para atributos JSON no POST).
- **Types**: Se o retorno do endpoint for muito complexo e você quiser tipá-lo, você pode adicionar a interface no arquivo `src/lib/suri/models.ts` criado anteriormente!
