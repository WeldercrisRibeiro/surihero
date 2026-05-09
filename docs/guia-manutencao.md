# Guia de Desenvolvimento e Manutenção - Suri Suite

Este guia detalha como implementar persistência local de dados (`localStorage`) e como ajustar o layout (espaçamentos, larguras, etc.) de cada módulo da plataforma Suri Suite.

---

## 1. Módulo WorkFlow (`src/pages/WorkFlow.tsx`)

### 💾 Como salvar os fluxos no LocalStorage
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

### 🎨 Como alterar o Layout (Padding, Width, Altura)
* **Estrutura Base:** O layout está definido no wrapper principal em `WorkFlow.tsx`. Ele usa as classes do Tailwind como `flex-1` e style embutido para controle exato.
* **Painel Lateral (Fluxos Salvos):** Possui a classe fixa `w-80` (320px). Para mudar a largura, mude na div que envelopa a lista (linha ~388) de `w-80` para `w-96` (384px) ou `w-[400px]`.
* **Área de Desenho (Canvas):** O `ReactFlow` ocupa todo o espaço dinamicamente devido à classe `flex-1`.
* **Paddings da Barra Superior:** O header do canvas possui a classe `p-4` (padding de 16px). Pode alterar para `p-6` para ficar mais espaçoso.

---

## 2. Módulo Kanban (`src/pages/Kanbam.tsx` e `src/index.css`)

### 💾 Como salvar Colunas e Cards no LocalStorage
Todo o conteúdo do quadro fica dentro do estado `columns` em `Kanbam.tsx` (linha ~335).

```tsx
// 1. Modifique a declaração no componente KanbanBoard:
const [columns, setColumns] = useState<KanbanColumn[]>(() => {
  const localData = localStorage.getItem('@suri:kanban_cols');
  return localData ? JSON.parse(localData) : []; // Pode popular com default se preferir
});

// 2. Sincronize com o LocalStorage
useEffect(() => {
  localStorage.setItem('@suri:kanban_cols', JSON.stringify(columns));
}, [columns]);
```

### 🎨 Como alterar o Layout (Padding, Width, Altura)
O layout do Kanban utiliza CSS tradicional centralizado no arquivo `src/index.css` (começando por volta da linha 365 na seção `KANBAN BOARD`).

* **Largura das Colunas:** Busque a classe `.kb-column` no `index.css`.
  * Você verá `min-width: 280px;` e `max-width: 300px;`. Altere esses valores para deixar as colunas mais largas ou mais estreitas.
* **Espaçamento do Quadro:** Busque a classe `.kb-board`. O espaçamento entre as colunas é gerido por `gap: 16px;`. Os paddings da área de arrasto são controlados por `padding: 0 20px 20px;`.
* **Cards:** A classe `.kb-card-inner` possui `padding: 12px 12px 10px;`. Modifique aqui para deixar o conteúdo dos cards com mais ou menos respiro.

---

## 3. Módulo Suri API (`src/pages/ApiSuri.tsx`)

### 💾 Como salvar e criar novos Endpoints
Atualmente, os endpoints (`ENDPOINTS`) são estáticos e vêm importados de `src/lib/suri/endpoints.ts`. Para permitir a criação pelo usuário via Interface, você deve transformar a constante em estado.

```tsx
// Substitua o uso direto de ENDPOINTS por um estado local no componente:
const [customEndpoints, setCustomEndpoints] = useState<EndpointDef[]>(() => {
  const localData = localStorage.getItem('@suri:api_endpoints');
  // Se existir no storage usa ele, senão usa os ENDPOINTS estáticos do arquivo base
  return localData ? JSON.parse(localData) : ENDPOINTS; 
});

// Salva sempre que houver modificações
useEffect(() => {
  localStorage.setItem('@suri:api_endpoints', JSON.stringify(customEndpoints));
}, [customEndpoints]);
```
*(Para a interface criar um endpoint de fato, você precisará conectar um botão que executa o `setCustomEndpoints([...customEndpoints, novoEndpoint])`)*

### 🎨 Como alterar o Layout (Padding, Width, Altura)
* **Paddings e Largura Máxima:** Em `ApiSuri.tsx`, observe o `<main>` e a div absoluta de contéudo (por volta da linha 127). 
  * Ela possui `max-w-[1500px]`. Altere para `max-w-[1200px]` se quiser a tela mais estreita nos monitores ultrawide.
  * O padding interno usa `p-6` (24px). Aumente para `p-8` ou `p-10` se quiser margens maiores.
* **Header da API:** O seletor de endpoints fica num `<header>` com `h-14` (56px) e `px-6`. Altere esses valores para controlar a altura da barra.

---

## 4. Módulo Suri Calcs (`src/components/PricingCalculator.tsx`)

### 💾 Como salvar configurações da Calculadora no Storage
A calculadora possui vários estados (interações, preços dos planos, descontos). Para manter as escolhas do usuário ao recarregar a tela:

```tsx
// Exemplo: Salvar todos os fatores num único objeto localStorage
useEffect(() => {
  const calcData = {
    interactions, essPrice, proPrice, discountPercent, setupDiscount
  };
  localStorage.setItem('@suri:calc_config', JSON.stringify(calcData));
}, [interactions, essPrice, proPrice, discountPercent, setupDiscount]);

// Para inicializar (você precisará extrair a inicialização do localStorage):
// Ex: const savedData = JSON.parse(localStorage.getItem('@suri:calc_config') || '{}')
// const [interactions, setInteractions] = useState(savedData.interactions || 1000);
```

### 🎨 Como alterar o Layout (Padding, Width, Altura)
A Calculadora foi construída usando exclusivamente classes Tailwind diretas (em `PricingCalculator.tsx`).

* **Container Principal:** 
  * A div raiz usa `py-12 px-4`. Controla o respiro vertical superior/inferior.
  * A div interna usa `max-w-6xl mx-auto`. Essa é a largura máxima de tudo (1152px). Altere para `max-w-5xl` ou `max-w-7xl` para expandir/diminuir.
* **Cards de Preço (Pro / Essential):** 
  * Possuem `p-8` (padding interno de 32px).
  * A altura mínima é forçada por `min-h-[22rem]` (352px) para que os cards fiquem alinhados independentemente do conteúdo.
* **Arredondamento:** Todos os cartões de interface possuem `rounded-[2.5rem]` (40px de raio de borda). Para um estilo mais tradicional e menos "bolha", substitua por `rounded-2xl` (16px) ou `rounded-3xl` (24px).
