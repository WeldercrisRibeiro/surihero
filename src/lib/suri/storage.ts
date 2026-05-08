// Persistência simples das credenciais no localStorage.
const KEY_BASE = "suri.baseUrl";
const KEY_TOKEN = "suri.token";

export type Credentials = { baseUrl: string; token: string };

export function loadCredentials(): Credentials {
  if (typeof window === "undefined") return { baseUrl: "", token: "" };
  return {
    baseUrl: localStorage.getItem(KEY_BASE) ?? "",
    token: localStorage.getItem(KEY_TOKEN) ?? "",
  };
}

export function saveCredentials(c: Credentials) {
  localStorage.setItem(KEY_BASE, c.baseUrl);
  localStorage.setItem(KEY_TOKEN, c.token);
}

export function clearCredentials() {
  localStorage.removeItem(KEY_BASE);
  localStorage.removeItem(KEY_TOKEN);
}
