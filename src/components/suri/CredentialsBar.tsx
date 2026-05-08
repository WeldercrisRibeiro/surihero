import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { clearCredentials, loadCredentials, saveCredentials } from "@/lib/suri/storage";
import { cn } from "@/lib/utils";
import { Moon, Sun, Settings, Trash2, Globe, Shield, CheckCircle2, XCircle } from "lucide-react";

export function CredentialsBar() {
  const [baseUrl, setBaseUrl] = useState("");
  const [token, setToken] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [connected, setConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const c = loadCredentials();
    setBaseUrl(c.baseUrl);
    setToken(c.token);
    setConnected(Boolean(c.baseUrl && c.token));

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleSave = () => {
    if (!baseUrl || !token) {
      toast.error("Preencha URL e Token");
      return;
    }

    // Normalização Inteligente da URL
    let normalizedUrl = baseUrl.trim();
    // Remove barra final se houver
    if (normalizedUrl.endsWith("/")) normalizedUrl = normalizedUrl.slice(0, -1);
    // Adiciona /api se não existir
    if (!normalizedUrl.toLowerCase().endsWith("/api")) {
      normalizedUrl = `${normalizedUrl}/api`;
    }

    saveCredentials({ baseUrl: normalizedUrl, token: token.trim() });
    setConnected(true);
    setIsOpen(false);
    toast.success("Gateway conectado");
    // Recarrega para aplicar as novas credenciais globalmente
    setTimeout(() => window.location.reload(), 500);
  };

  const handleClear = () => {
    clearCredentials();
    setBaseUrl("");
    setToken("");
    setConnected(false);
    toast.info("Credenciais removidas");
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="relative z-50">
      <div className="flex h-12 items-center justify-between px-4 bg-background border-b border-border shadow-sm">
        {/* ESQUERDA: STATUS COMPACTO */}
        <div className="flex items-center gap-4">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-sm shadow-sm">
            S
          </div>
          <div className="h-4 w-px bg-border mx-1" />
          <div className="flex items-center gap-2">
            {connected ? (
              <CheckCircle2 size={14} className="text-green-500" />
            ) : (
              <XCircle size={14} className="text-muted-foreground/40" />
            )}
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em]",
              connected ? "text-green-600/80" : "text-muted-foreground/40"
            )}>
              {connected ? "Gateway Online" : "Desconectado"}
            </span>
          </div>
        </div>

        {/* DIREITA: BOTÕES DE AÇÃO */}
        <div className="flex items-center gap-2">
          <Button 
            variant={isOpen ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 gap-2 rounded-md px-3 text-[10px] font-bold uppercase tracking-wider"
          >
            <Settings size={14} />
            Configurar
          </Button>
          
          <div className="h-4 w-px bg-border mx-1" />
          
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 rounded-md hover:bg-muted">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </Button>
        </div>
      </div>

      {/* PAINEL DE CONFIGURAÇÃO (POPOVER) */}
      {isOpen && (
        <div className="absolute top-13 right-4 w-80 rounded-xl border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest">Gateway Suri</h3>
              {connected && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none text-[8px] h-4">
                  ATIVO
                </Badge>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                <Globe size={12} />
                Endpoint URL
              </label>
              <input
                className="w-full rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-mono focus:border-primary/50 focus:outline-none transition-colors"
                placeholder="https://api.suri.me/api"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                <Shield size={12} />
                Bearer Token
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-mono focus:border-primary/50 focus:outline-none transition-colors"
                placeholder="Bearer ..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 font-bold text-[10px] uppercase h-9">
                SALVAR E CONECTAR
              </Button>
              <Button variant="outline" onClick={handleClear} size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
