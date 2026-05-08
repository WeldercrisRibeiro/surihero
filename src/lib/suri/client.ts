// Cliente HTTP central para a API Suri.
// Lê credenciais do localStorage, monta headers obrigatórios e trata erros com toasts.
import { toast } from "sonner";
import { loadCredentials } from "./storage";
import type { EndpointDef } from "./endpoints";

export interface RequestArgs {
  endpoint: EndpointDef;
  values: Record<string, string>;
}

export interface RequestResult {
  ok: boolean;
  status: number;
  data: unknown;
  url: string;
}

/**
 * Substitui :params no path e monta query string.
 */
function buildUrl(baseUrl: string, endpoint: EndpointDef, values: Record<string, string>) {
  let path = endpoint.path;
  const query = new URLSearchParams();

  for (const p of endpoint.params ?? []) {
    const v = values[p.name] ?? p.defaultValue ?? "";
    if (p.in === "path") {
      path = path.replace(`:${p.name}`, encodeURIComponent(v));
    } else if (p.in === "query" && v !== "") {
      query.set(p.name, v);
    }
  }

  const base = baseUrl.replace(/\/+$/, "");
  const qs = query.toString();
  return `${base}${path}${qs ? `?${qs}` : ""}`;
}

/**
 * Executa a requisição com Accept + Authorization e trata os erros mais comuns.
 */
export async function callEndpoint({ endpoint, values }: RequestArgs): Promise<RequestResult> {
  const { baseUrl, token } = loadCredentials();

  if (!baseUrl || !token) {
    toast.error("Credenciais ausentes", {
      description: "Informe a URL base e o Bearer Token antes de executar.",
    });
    return { ok: false, status: 0, data: null, url: "" };
  }

  const url = buildUrl(baseUrl, endpoint, values);
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  let body: string | undefined;
  if (endpoint.method === "POST") {
    const payload: Record<string, string> = {};
    for (const p of endpoint.params ?? []) {
      if (p.in === "body") payload[p.name] = values[p.name] ?? "";
    }
    if (Object.keys(payload).length) {
      body = JSON.stringify(payload);
      headers["Content-Type"] = "application/json";
    }
  }

  try {
    const res = await fetch(url, { method: endpoint.method, headers, body });
    const text = await res.text();
    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {
      // resposta não-JSON, mantém texto
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        toast.error("Token inválido ou sem permissão", { description: `HTTP ${res.status}` });
      } else if (res.status === 404) {
        toast.error("Recurso não encontrado", { description: `HTTP 404 — ${url}` });
      } else {
        toast.error(`Erro ${res.status}`, { description: typeof data === "string" ? data : JSON.stringify(data).slice(0, 200) });
      }
      return { ok: false, status: res.status, data, url };
    }

    // Mensagem de sucesso (respeita success: true quando presente)
    const isObj = data && typeof data === "object";
    const successFlag = isObj && "success" in (data as Record<string, unknown>) ? (data as Record<string, unknown>).success : true;
    if (successFlag !== false) {
      toast.success("Requisição concluída", { description: `${endpoint.method} ${endpoint.path}` });
    } else {
      toast.error("A API retornou success: false", {
        description: isObj && "message" in (data as Record<string, unknown>) ? String((data as Record<string, unknown>).message) : undefined,
      });
    }

    return { ok: true, status: res.status, data, url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    toast.error("Falha de rede", { description: msg });
    return { ok: false, status: 0, data: null, url };
  }
}
