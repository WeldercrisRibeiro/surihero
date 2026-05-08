// Extrai o último quickReplyPostbacks do array `data` retornado por
// GET /contacts/:user_id/messages — esse é o ID do fluxo onde o contato parou.

export interface FlowTrackerResult {
  postback: string | null;
  matchedMessage: unknown | null;
  totalMessages: number;
}

export function extractQuickReplyPostback(payload: unknown): FlowTrackerResult {
  const empty: FlowTrackerResult = { postback: null, matchedMessage: null, totalMessages: 0 };
  if (!payload || typeof payload !== "object") return empty;

  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) return empty;

  let postback: string | null = null;
  let matchedMessage: unknown = null;

  // Percorre do mais recente para o mais antigo. Se a API já vier ordenada
  // do mais antigo, o último encontrado ainda será o mais recente.
  for (let i = data.length - 1; i >= 0; i--) {
    const msg = data[i];
    const custom = (msg as { custom?: { quickReplyPostbacks?: unknown } } | null)?.custom;
    const value = custom?.quickReplyPostbacks;
    if (typeof value === "string" && value.trim() !== "") {
      postback = value;
      matchedMessage = msg;
      break;
    }
    if (Array.isArray(value) && value.length > 0) {
      postback = value.join("~;");
      matchedMessage = msg;
      break;
    }
  }

  return { postback, matchedMessage, totalMessages: data.length };
}
