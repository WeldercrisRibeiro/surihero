const KEY_BASE = "suri.baseUrl";
const KEY_TOKEN = "suri.token";
const KEY_USER_NAME = "suri.userName";
const KEY_USER_EMAIL = "suri.userEmail";

export type Credentials = {
  baseUrl: string;
  token: string;
  userName?: string;
  userEmail?: string;
};

export function loadCredentials(): Credentials {
  if (typeof window === "undefined") return { baseUrl: "", token: "" };
  return {
    baseUrl: localStorage.getItem(KEY_BASE) ?? "",
    token: localStorage.getItem(KEY_TOKEN) ?? "",
    userName: localStorage.getItem(KEY_USER_NAME) ?? "",
    userEmail: localStorage.getItem(KEY_USER_EMAIL) ?? "",
  };
}

export function saveCredentials(c: Credentials) {
  localStorage.setItem(KEY_BASE, c.baseUrl);
  localStorage.setItem(KEY_TOKEN, c.token);
  localStorage.setItem(KEY_USER_NAME, c.userName ?? "");
  localStorage.setItem(KEY_USER_EMAIL, c.userEmail ?? "");
  // if (c.userName) localStorage.setItem(KEY_USER_NAME, c.userName);
  // if (c.userEmail) localStorage.setItem(KEY_USER_EMAIL, c.userEmail);
}

export function clearCredentials() {
  localStorage.removeItem(KEY_BASE);
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER_NAME);
  localStorage.removeItem(KEY_USER_EMAIL);
}