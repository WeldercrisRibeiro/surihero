// Rastreador especial: busca mensagens do contato e isola o quickReplyPostbacks.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { loadCredentials } from "@/lib/suri/storage";
import { extractQuickReplyPostback } from "@/lib/suri/flow-tracker";
import { Activity, ChevronRight, MessageSquare, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function FlowTracker() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [postback, setPostback] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [raw, setRaw] = useState<unknown>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [searched, setSearched] = useState(false);

  async function track() {
    if (!userId.trim()) {
      toast.error("Informe o user_id do contato");
      return;
    }
    const { baseUrl, token } = loadCredentials();
    if (!baseUrl || !token) {
      toast.error("Configure as credenciais primeiro");
      return;
    }

    setLoading(true);
    setSearched(false);
    try {
      const url = `${baseUrl.replace(/\/+$/, "")}/contacts/${encodeURIComponent(userId.trim())}/messages`;
      const res = await fetch(url, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let payload: unknown = text;
      try { payload = JSON.parse(text); } catch { /* keep text */ }

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) toast.error("Token inválido ou sem permissão");
        else if (res.status === 404) toast.error("Contato não encontrado");
        else toast.error(`Erro ${res.status}`);
        setRaw(payload);
        setPostback(null);
        setTotal(0);
        setSearched(true);
        return;
      }

      const result = extractQuickReplyPostback(payload);
      setRaw(payload);
      setPostback(result.postback);
      setTotal(result.totalMessages);
      setSearched(true);

      if (result.postback) toast.success("Fluxo localizado");
      else toast.message("Nenhum quickReplyPostbacks nas mensagens");
    } catch (err) {
      toast.error("Falha de rede", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-heading uppercase">Rastreador de Fluxo</h2>
        <p className="text-sm text-muted-foreground/60 font-medium leading-relaxed max-w-xl">
          Analise o histórico de mensagens para identificar o <code className="font-mono text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">quickReplyPostback</code> atual do contato.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-end bg-accent/20 p-8 rounded-2xl border border-border/40">
        <div className="flex-1 space-y-2.5">
          <Label htmlFor="userId" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 font-mono block px-1">
            User ID (Suri/WhatsApp)
          </Label>
          <Input
            id="userId"
            placeholder="Ex: wp704805416039002:5585997697864"
            className="bg-background/40 border-border/40 h-11 rounded-xl font-mono text-xs focus-visible:ring-primary/20 transition-all"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && track()}
          />
        </div>
        <Button onClick={track} disabled={loading} size="lg" className="h-11 px-10 rounded-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-heading uppercase">
          {loading ? "PROCESSANDO..." : "RASTREAR FLUXO"}
        </Button>
      </div>

      {searched && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          {postback ? (
            <div className="rounded-[2rem] border border-primary/30 bg-primary/5 p-10 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
              
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-primary text-primary-foreground font-mono text-[9px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                  RESULTADO ENCONTRADO
                </Badge>
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              </div>

              <div className="space-y-4 relative z-10">
                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] font-mono">Current Postback Path</p>
                <div className="bg-background/40 p-6 rounded-2xl border border-primary/20 font-mono text-lg font-bold text-primary break-all shadow-sm">
                  {postback}
                </div>
                
                <div className="flex items-center gap-2 pt-4">
                  <MessageSquare size={14} className="text-primary/50" />
                  <p className="text-xs text-muted-foreground/60 font-medium">
                    Extraído com sucesso de <span className="text-foreground font-bold font-mono">{total}</span> mensagens analisadas.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-border/40 p-16 text-center bg-muted/5 flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted/10 flex items-center justify-center border border-border/20">
                <Info size={24} className="text-muted-foreground/30" />
              </div>
              <div className="max-w-[320px]">
                <p className="text-sm font-bold text-foreground/40 font-heading uppercase tracking-widest">Nenhum Postback</p>
                <p className="text-xs text-muted-foreground/30 mt-2 font-medium leading-relaxed font-mono">
                  Não foi localizado nenhum <code className="text-primary/40">quickReplyPostback</code> nas {total} mensagens recentes deste contato.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border/20" />
            <Button variant="ghost" size="sm" onClick={() => setShowRaw((s) => !s)} className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono hover:bg-primary/5 hover:text-primary transition-all">
              {showRaw ? "OCULTAR_RAW_DATA" : "VER_RAW_DATA"}
            </Button>
            <div className="h-px flex-1 bg-border/20" />
          </div>

          {showRaw && (
            <pre className="max-h-[50vh] overflow-auto rounded-2xl border border-border/40 bg-[#0a0d12] p-8 text-[11px] font-mono leading-relaxed text-primary/60 selection:bg-primary/20">
              {JSON.stringify(raw, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
