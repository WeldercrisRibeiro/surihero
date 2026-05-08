// Catálogo declarativo dos endpoints da API Suri (Versão Técnica).
export type ParamLocation = "path" | "query" | "body";

export interface EndpointParam {
  name: string;
  in: ParamLocation;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export interface EndpointDef {
  id: string;
  label: string;
  group: string;
  method: "GET" | "POST";
  path: string;
  description?: string;
  params?: EndpointParam[];
}

export const ENDPOINTS: EndpointDef[] = [
  // Atendentes e Canais
  { id: "attendants", group: "Atendentes & Canais", label: "attendants", method: "GET", path: "/attendants" },
  { id: "channels", group: "Atendentes & Canais", label: "channels", method: "GET", path: "/channels" },

  // Fluxos e Templates
  { id: "flows", group: "Fluxos & Templates", label: "flows", method: "GET", path: "/flows" },
  {
    id: "flow-by-id",
    group: "Fluxos & Templates",
    label: "flow-by-id",
    method: "GET",
    path: "/flows/:flowId",
    params: [{ name: "flowId", in: "path", required: true, placeholder: "ID do fluxo" }],
  },
  { id: "templates", group: "Fluxos & Templates", label: "templates", method: "GET", path: "/templates" },
  {
    id: "template-by-id",
    group: "Fluxos & Templates",
    label: "template-by-id",
    method: "GET",
    path: "/templates/:template_id",
    params: [{ name: "template_id", in: "path", required: true, placeholder: "ID do template" }],
  },

  // Campanhas
  {
    id: "campaign-metrics",
    group: "Campanhas",
    label: "campaign-metrics",
    method: "GET",
    path: "/campaigns/:id",
    params: [{ name: "id", in: "path", required: true, placeholder: "ID da campanha" }],
  },
  {
    id: "campaign-export",
    group: "Campanhas",
    label: "campaign-export",
    method: "GET",
    path: "/campaigns/:id/export",
    params: [{ name: "id", in: "path", required: true, placeholder: "ID da campanha" }],
  },

  // E-commerce
  { id: "shop-stores", group: "E-commerce", label: "shop-stores", method: "GET", path: "/shop/stores" },
  { id: "shop-collections", group: "E-commerce", label: "shop-collections", method: "GET", path: "/shop/collections" },
  {
    id: "shop-products",
    group: "E-commerce",
    label: "shop-products",
    method: "GET",
    path: "/shop/products/list",
    params: [{ name: "page", in: "query", placeholder: "Página", defaultValue: "10" }],
  },
  {
    id: "shop-product",
    group: "E-commerce",
    label: "shop-product",
    method: "POST",
    path: "/shop/products/:productId",
    params: [{ name: "productId", in: "path", required: true, placeholder: "ID do produto" }],
  },
  {
    id: "shop-order",
    group: "E-commerce",
    label: "shop-order",
    method: "GET",
    path: "/shop/orders/:id",
    params: [{ name: "id", in: "path", required: true, placeholder: "ID do pedido" }],
  },
  {
    id: "shop-user",
    group: "E-commerce",
    label: "shop-user",
    method: "GET",
    path: "/shop/users/:userId",
    params: [{ name: "userId", in: "path", required: true, placeholder: "ID do cliente" }],
  },

  // Atendimentos
  { id: "reasons", group: "Atendimentos", label: "reasons", method: "GET", path: "/attendances/reasons" },
  {
    id: "reason-by-id",
    group: "Atendimentos",
    label: "reason-by-id",
    method: "GET",
    path: "/attendances/reasons/:id",
    params: [{ name: "id", in: "path", required: true, placeholder: "ID do motivo" }],
  },
  { id: "attendances", group: "Atendimentos", label: "attendances", method: "POST", path: "/attendances" },
  
  // Mensagens
  {
    id: "send-message",
    group: "Mensagens",
    label: "send-message",
    method: "POST",
    path: "/messages",
    params: [
      { name: "conversationId", in: "body", required: true, placeholder: "ID da conversa" },
      { name: "type", in: "body", required: true, placeholder: "Tipo (0=Texto, 4=Template)" },
      { name: "text", in: "body", placeholder: "Texto da mensagem" },
    ],
  },

  // Contatos (Users)
  {
    id: "create-user",
    group: "Contatos",
    label: "create-user",
    method: "POST",
    path: "/users",
    params: [
      { name: "phone", in: "body", required: true, placeholder: "Telefone do contato" },
      { name: "name", in: "body", placeholder: "Nome do contato" },
    ],
  },

  // Webhooks
  { id: "wh-new-contact", group: "Webhooks", label: "wh:new-contact", method: "POST", path: "" },
  { id: "wh-message-received", group: "Webhooks", label: "wh:message-received", method: "POST", path: "" },
];

export const ENDPOINT_GROUPS = Array.from(new Set(ENDPOINTS.map((e) => e.group)));
