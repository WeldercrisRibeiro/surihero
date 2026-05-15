# Guia de Desenvolvimento e Manutenção

Este guia detalha como implementar persistência local de dados (`localStorage`) e como ajustar o layout (espaçamentos, larguras, etc.) de cada módulo da plataforma Suri Suite.

---

## 1. Módulo WorkFlow

### Como salvar os fluxos no LocalStorage

Atualmente, os fluxos salvos ficam na variável de estado `savedFlows`. Para mantê-los salvos ao recarregar a página, você precisa adicionar sincronização com o `localStorage`.

1. **Recuperar dados ao carregar:** Modifique a inicialização do estado `savedFlows` para ler do LocalStorage.
2. **Salvar ao atualizar:** Use um `useEffect` para escutar mudanças no `savedFlows`.

```tsx
// 1. Modifique a declaração do estado na linha ~54:
const [savedFlows, setSavedFlows] = useState<SavedFlow[]>(() => {
  const localData = localStorage.getItem('@suri:workflows');
  return localData ? JSON.parse(localData) : [];
});

// 2. Adicione este useEffect logo abaixo das declarações de estado:
useEffect(() => {
  localStorage.setItem('@suri:workflows', JSON.stringify(savedFlows));
}, [savedFlows]);
```

### Como alterar o Layout

- **Estrutura Base:** O layout está definido no wrapper principal em `WorkFlow.tsx`. Ele usa as classes do Tailwind como `flex-1` e style embutido para controle exato.
- **Painel Lateral (Fluxos Salvos):** Possui a classe fixa `w-80` (320px). Para mudar a largura, mude na div que envelopa a lista de `w-80` para `w-96` (384px) ou `w-[400px]`.
- **Área de Desenho (Canvas):** O `ReactFlow` ocupa todo o espaço dinamicamente devido à classe `flex-1`.
- **Paddings da Barra Superior:** O header do canvas possui a classe `p-4` (padding de 16px).

---

## 2. Módulo Kanban

### Como salvar Colunas e Cards no LocalStorage

Todo o conteúdo do quadro fica dentro do estado `columns` em `Kanban.tsx`.

```tsx
// 1. Modifique a declaração no componente KanbanBoard:
const [columns, setColumns] = useState<KanbanColumn[]>(() => {
  const localData = localStorage.getItem('@suri:kanban_cols');
  return localData ? JSON.parse(localData) : [];
});

// 2. Sincronize com o LocalStorage
useEffect(() => {
  localStorage.setItem('@suri:kanban_cols', JSON.stringify(columns));
}, [columns]);
```

### Como alterar o Layout

O layout do Kanban utiliza CSS centralizado em `src/index.css` (seção `KANBAN BOARD`).

- **Largura das Colunas:** Classe `.kb-column` → `min-width: 280px` e `max-width: 300px`.
- **Espaçamento do Quadro:** Classe `.kb-board` → `gap: 16px` entre colunas, `padding: 0 20px 20px`.
- **Cards:** Classe `.kb-card-inner` → `padding: 12px 12px 10px`.

---

## 3. Módulo Suri API

### Como salvar e criar novos Endpoints

Os endpoints são estáticos e vêm de `src/lib/suri/endpoints.ts`. Para criar endpoints customizados pelo usuário:

```tsx
const [customEndpoints, setCustomEndpoints] = useState<EndpointDef[]>(() => {
  const localData = localStorage.getItem('@suri:api_endpoints');
  return localData ? JSON.parse(localData) : ENDPOINTS;
});

useEffect(() => {
  localStorage.setItem('@suri:api_endpoints', JSON.stringify(customEndpoints));
}, [customEndpoints]);
```

### Como alterar o Layout

- **Largura Máxima:** Classe `max-w-[1500px]` no container principal. Altere para `max-w-[1200px]` se quiser mais estreito.
- **Padding interno:** Usa `p-6` (24px). Aumente para `p-8` para margens maiores.

---

## 4. Módulo Suri Calcs

### Como salvar configurações da Calculadora

```tsx
useEffect(() => {
  const calcData = { interactions, essPrice, proPrice, discountPercent, setupDiscount };
  localStorage.setItem('@suri:calc_config', JSON.stringify(calcData));
}, [interactions, essPrice, proPrice, discountPercent, setupDiscount]);
```

### Como alterar o Layout

- **Container Principal:** `py-12 px-4` — respiro vertical. `max-w-6xl mx-auto` — largura máxima (1152px).
- **Cards de Preço:** `p-8` interno, `min-h-[22rem]` para alinhamento entre cards.
- **Arredondamento:** `rounded-[2.5rem]` (40px). Para estilo mais tradicional, use `rounded-2xl` (16px).
