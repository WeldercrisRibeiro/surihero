import { useMemo, useState, useEffect } from "react";
import { CredentialsBar } from "@/components/suri/CredentialsBar";
import { EndpointRunner } from "@/components/suri/EndpointRunner";
import { FlowTracker } from "@/components/suri/FlowTracker";
import { ENDPOINTS, ENDPOINT_GROUPS, type EndpointDef } from "@/lib/suri/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { clearCredentials, loadCredentials, saveCredentials } from "@/lib/suri/storage";
import { cn } from "@/lib/utils";
import { Activity, Settings, ChevronRight, Info, Zap, Moon, Sun, ShieldCheck, ShieldAlert, Trash2, ChevronDown } from "lucide-react";

type Selection = { kind: "flow-tracker" } | { kind: "endpoint"; endpoint: EndpointDef };

export default function Connector() {
  const [selection, setSelection] = useState<Selection>({ kind: "flow-tracker" });

  const grouped = useMemo(() => {
    return ENDPOINT_GROUPS.map((g) => ({ group: g, items: ENDPOINTS.filter((e) => e.group === g) }));
  }, []);

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground selection:bg-primary/20 overflow-hidden font-sans antialiased rounded-lg border border-border/40">
      {/* HEADER ULTRA-CLEAN COM GLASSMORPISM */}
      <header className="z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl shadow-[0_1px_10px_rgba(0,0,0,0.05)] shrink-0">
        <div className="flex h-14 items-center gap-6 px-6">
          {/* LOGO DESIGNER */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative group cursor-pointer" onClick={() => setSelection({ kind: "flow-tracker" })}>
              <div className="absolute -inset-1 bg-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 transform group-hover:scale-105 transition-all">
                S
              </div>
            </div>
            <div className="h-4 w-px bg-border/60" />
          </div>

          {/* CUSTOM COMMAND SELECTOR (UI ELITE) */}
          <div className="flex-1 flex items-center">
            <div className="relative">
              <button 
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="flex items-center gap-3 bg-muted/30 hover:bg-muted/50 border border-border/40 px-4 py-1.5 rounded-xl transition-all cursor-pointer group shadow-sm active:scale-95"
              >
                <div className="p-1 bg-primary/10 rounded group-hover:bg-primary/20 transition-colors">
                  <Settings size={13} className="text-primary" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/80">
                  {selection.kind === "flow-tracker" ? "Rastreador de Fluxo" : selection.endpoint.label}
                </span>
                <ChevronDown size={12} className={cn("text-muted-foreground/40 transition-transform duration-300", isSelectorOpen && "rotate-180")} />
              </button>

              {/* DROPDOWN CUSTOMIZADO */}
              {isSelectorOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSelectorOpen(false)} />
                  <div className="absolute top-12 left-0 z-50 w-72 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 mb-1">
                      <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Ações Disponíveis</span>
                    </div>
                    
                    <button
                      onClick={() => { setSelection({ kind: "flow-tracker" }); setIsSelectorOpen(false); }}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                        selection.kind === "flow-tracker" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      )}
                    >
                      <Activity size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Rastreador de Fluxo</span>
                    </button>

                    <div className="my-2 h-px bg-border/40 mx-2" />
                    
                    <div className="max-h-80 overflow-y-auto scrollbar-thin px-1 pb-1">
                      {ENDPOINTS.map((e) => {
                        const active = selection.kind === "endpoint" && selection.endpoint.id === e.id;
                        return (
                          <button
                            key={e.id}
                            onClick={() => { setSelection({ kind: "endpoint", endpoint: e }); setIsSelectorOpen(false); }}
                            className={cn(
                              "flex w-full items-center justify-between px-3 py-2 rounded-lg text-left transition-all group/item mb-1",
                              active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
                            )}
                          >
                            <span className="text-[11px] font-bold uppercase tracking-wider truncate mr-4">
                              {e.label}
                            </span>
                            <Badge variant="outline" className={cn(
                              "text-[8px] h-4 px-1 border-none font-black",
                              active 
                                ? "bg-white/20 text-white" 
                                : e.method === "GET" ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500"
                            )}>
                              {e.method}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="ml-6 flex items-center gap-2">
               <Badge variant="outline" className="text-[9px] font-mono border-border/30 bg-primary/[0.03] text-primary/70 h-5 px-3 rounded-full lowercase tracking-tight">
                 {selection.kind === "flow-tracker" ? "diagnostics / flow_engine" : `api / v1 / ${selection.endpoint.id}`}
               </Badge>
            </div>
          </div>

          {/* SYSTEM ACTIONS & STATUS */}
          <div className="shrink-0 flex items-center">
            <CredentialsBar />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT COM ANIMAÇÕES DE ENTRADA */}
      <main className="flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-muted/5 via-background to-background relative">
        <div className="absolute inset-0 flex flex-col p-8 max-w-[1500px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          {selection.kind === "flow-tracker" ? (
            <div className="flex-1 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-2xl shadow-black/5 overflow-hidden flex flex-col group transition-all duration-500 hover:border-primary/20">
              <div className="border-b border-border/40 bg-muted/10 px-8 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity size={18} className="text-primary" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-foreground/80">Monitor de Tráfego em Tempo Real</h2>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[9px] font-bold text-green-600/60 uppercase tracking-widest">Live</span>
                </div>
              </div>
              <div className="p-8 overflow-y-auto flex-1 scrollbar-thin">
                <FlowTracker />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden gap-4">
              <div className="flex items-center justify-between px-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-primary/10 rounded">
                    <ChevronRight size={14} className="text-primary" />
                  </div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">
                    Console de Operações / <span className="text-foreground tracking-normal">{selection.endpoint.label}</span>
                  </h2>
                </div>
                <div className="text-[9px] font-mono text-muted-foreground/30">ID: {selection.endpoint.id}</div>
              </div>
              
              <div className="flex-1 overflow-y-auto rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md shadow-2xl shadow-black/10 flex flex-col scrollbar-thin group transition-all duration-500 hover:border-primary/20">
                <EndpointRunner key={selection.endpoint.id} endpoint={selection.endpoint} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER REFINADO */}
      <footer className="shrink-0 h-8 px-6 border-t border-border/40 bg-background/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-[9px] text-muted-foreground/20 font-bold uppercase tracking-[0.4em]">
            Suri Connect Enterprise
          </p>
          <div className="h-3 w-px bg-border/40" />
          <span className="text-[9px] text-muted-foreground/30 font-mono">2026.05 • STABLE_RELEASE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-primary/40 font-bold uppercase tracking-widest">Protocolo: HTTP/1.1</span>
          <div className="h-1 w-1 rounded-full bg-primary/20" />
          <span className="text-[9px] text-muted-foreground/30 font-mono">Latência: 12ms</span>
        </div>
      </footer>
    </div>
  );
}
