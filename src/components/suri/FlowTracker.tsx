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
  const [flowName, setFlowName] = useState<string | null>(null);
  const [fetchingFlow, setFetchingFlow] = useState(false);

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
    setFlowName(null);
    setRaw(null);

    try {
      const messagesUrl = `${baseUrl.replace(/\/+$/, "")}/contacts/${encodeURIComponent(userId.trim())}/messages`;
      const flowsUrl = `${baseUrl.replace(/\/+$/, "")}/flows`;

      // Busca mensagens e fluxos em paralelo para maior agilidade
      const [messagesRes, flowsRes] = await Promise.all([
        fetch(messagesUrl, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }),
        fetch(flowsUrl, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }).catch(() => null)
      ]);

      const messagesText = await messagesRes.text();
      let messagesPayload: unknown = messagesText;
      try { messagesPayload = JSON.parse(messagesText); } catch { /* ignore */ }

      if (!messagesRes.ok) {
        if (messagesRes.status === 401 || messagesRes.status === 403) toast.error("Token inválido ou sem permissão");
        else if (messagesRes.status === 404) toast.error("Contato não encontrado");
        else toast.error(`Erro ${messagesRes.status}`);
        setRaw(messagesPayload);
        setPostback(null);
        setTotal(0);
        setSearched(true);
        return;
      }

      const result = extractQuickReplyPostback(messagesPayload);
      setRaw(messagesPayload);
      setPostback(result.postback);
      setTotal(result.totalMessages);
      setSearched(true);

      if (result.postback) {
        toast.success("Mensagem com fluxo localizada");
        
        if (flowsRes && flowsRes.ok) {
          const flowData = await flowsRes.json();
          // Aceita tanto array direto quanto objeto com chave 'data'
          const flows = Array.isArray(flowData) ? flowData : (flowData?.data && Array.isArray(flowData.data) ? flowData.data : []);
          
          if (flows.length > 0) {
            // Extração de IDs: busca por padrões cbXXXXX em todas as partes
            const parts = result.postback.split(/[~;|\s]+/);
            const extractedIds = parts
              .map(p => p.match(/cb\d+/)?.[0])
              .filter((id): id is string => !!id);
            
            const searchCandidates = Array.from(new Set([
              result.postback,
              ...extractedIds,
              ...parts
            ]));

            const match = flows.find((f: any) => 
              searchCandidates.some(c => 
                String(f.id) === c || 
                String(f.chatbotId) === c ||
                String(f.id).includes(c) ||
                c.includes(String(f.id))
              )
            );

            if (match) {
              setFlowName(match.name);
            } else {
              setFlowName(`(Nome não localizado para ${extractedIds[0] || result.postback})`);
            }
          } else {
            setFlowName("(Lista de fluxos vazia)");
          }
        }
      } else {
        toast.message("Nenhum quickReplyPostback nas mensagens");
      }
    } catch (err) {
      toast.error("Falha de rede", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2 mb-8">
        <h2 className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white uppercase">
          RASTREADOR DE FLUXO
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
          Analise o histórico de mensagens para identificar o <code className="font-mono text-primary bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 px-1.5 py-0.5 rounded text-xs">quickReplyPostback</code> atual do contato.
        </p>
      </div>

      <div className="relative flex flex-col justify-center bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-800/50 shadow-sm dark:shadow-none transition-all focus-within:border-primary/50 dark:focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
        <Label htmlFor="userId" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-mono mb-1 px-4">
          USER ID (SURI/WHATSAPP)
        </Label>
        <div className="flex items-center">
          <Input
            id="userId"
            placeholder="Ex: wp704805416039002:5585997697864"
            className="flex-1 bg-transparent border-0 h-10 font-mono text-sm text-slate-700 dark:text-slate-200 pl-4 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && track()}
          />
          <Button 
            onClick={track} 
            disabled={loading} 
            size="lg" 
            className="h-10 px-8 ml-4 rounded-full font-bold bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider text-[11px]"
          >
            {loading ? "PROCESSANDO..." : "RASTREAR FLUXO"}
          </Button>
        </div>
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
                <div className="bg-background/40 p-6 rounded-2xl border border-primary/20 font-mono flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">ID DO FLUXO</span>
                    {fetchingFlow && <span className="text-[9px] animate-pulse text-primary/60">BUSCANDO NOME...</span>}
                  </div>
                  <div className="text-lg font-bold text-primary break-all">
                    {postback}
                  </div>
                  {flowName && (
                    <div className="mt-4 pt-4 border-t border-primary/10">
                      <span className="text-[10px] font-bold text-primary/60 dark:text-primary/40 uppercase tracking-widest block mb-1">NOME IDENTIFICADO</span>
                      <div className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                        {flowName}
                      </div>
                    </div>
                  )}
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
