import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { Activity, Settings, ChevronRight, Info, Zap, Moon, Sun, ShieldCheck, ShieldAlert, Trash2, ChevronDown, Cable } from "lucide-react";

type Selection = { kind: "flow-tracker" } | { kind: "endpoint"; endpoint: EndpointDef };

export default function SuriApi() {
  const [selection, setSelection] = useState<Selection>({ kind: "flow-tracker" });

  const grouped = useMemo(() => {
    return ENDPOINT_GROUPS.map((g) => ({ group: g, items: ENDPOINTS.filter((e) => e.group === g) }));
  }, []);

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalNode(document.getElementById('topbar-portal-target'));
  }, []);

  return (
    <div className="flex h-full w-full flex-col text-slate-900 dark:text-slate-100 overflow-hidden antialiased" style={{ flex: 1, minHeight: 0 }}>
      {/* HEADER ULTRA-CLEAN MOVED TO TOPBAR PORTAL */}
      {portalNode && createPortal(
        <div className="flex w-full items-center justify-between">
          {/* LOGO DESIGNER */}
          <div className="kb-header-left">
            <div className="group flex items-center gap-4">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-white font-black text-sm shadow-sm transform group-hover:scale-105 transition-all">
                S
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                  Api SURI
                  <span className="text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full uppercase tracking-widest">v2.1</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Developer Console</p>
              </div>
            </div>
          </div>

          {/* CUSTOM COMMAND SELECTOR (UI ELITE) */}
          <div className="flex-1 flex items-center justify-end">
            <div className="relative">
              <button 
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="flex items-center gap-3 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 px-5 py-2 rounded-full transition-all cursor-pointer group shadow-sm active:scale-95"
              >
                <div className="p-1.5 bg-cyan-50 dark:bg-cyan-500/10 rounded-full transition-colors">
                  <Settings size={14} className="text-cyan-500 dark:text-cyan-400" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700 dark:text-slate-300">
                  {selection.kind === "flow-tracker" ? "Rastreador de Fluxo" : selection.endpoint.label}
                </span>
                <ChevronDown size={12} className={cn("text-slate-500 transition-transform duration-300", isSelectorOpen && "rotate-180")} />
              </button>

              {/* DROPDOWN CUSTOMIZADO */}
              {isSelectorOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSelectorOpen(false)} />
                  <div className="absolute top-12 left-0 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 mb-1">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ações Disponíveis</span>
                    </div>
                    
                    <button
                      onClick={() => { setSelection({ kind: "flow-tracker" }); setIsSelectorOpen(false); }}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all",
                        selection.kind === "flow-tracker" ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <Activity size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Rastreador de Fluxo</span>
                    </button>

                    <div className="my-2 h-px bg-slate-100 dark:bg-slate-800/50 mx-2" />
                    
                    <div className="px-3 py-2">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Endpoints da API</span>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto scrollbar-thin px-1 pb-1">
                      {ENDPOINTS.map((e) => {
                        const active = selection.kind === "endpoint" && selection.endpoint.id === e.id;
                        return (
                          <button
                            key={e.id}
                            onClick={() => { setSelection({ kind: "endpoint", endpoint: e }); setIsSelectorOpen(false); }}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all group/item mb-1",
                              active ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            <Cable size={14} className={cn("transition-colors", active ? "text-cyan-500" : "text-slate-400 group-hover/item:text-slate-600")} />
                            <span className="text-[11px] font-bold uppercase tracking-wider">{e.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="ml-6 flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
               <Badge variant="outline" className="text-[9px] font-mono border-cyan-200 dark:border-slate-700 bg-cyan-50 dark:bg-slate-800/50 text-cyan-600 dark:text-slate-400 h-6 px-4 rounded-full lowercase tracking-tight">
                 gateway.suri.bot
               </Badge>
               <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                 <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                 <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Gateway Online</span>
               </div>
            </div>
          </div>

          {/* SYSTEM ACTIONS & STATUS */}
          <div className="shrink-0 flex items-center ml-6">
            <CredentialsBar />
          </div>
        </div>,
        portalNode
      )}

      {/* MAIN CONTENT COM ANIMAÇÕES DE ENTRADA */}
      <main className="flex-1 overflow-hidden relative" style={{ minHeight: 0 }}>
        <div className="absolute inset-0 flex flex-col p-6 max-w-[1500px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out z-10">
          {selection.kind === "flow-tracker" ? (
            <div className="flex-1 rounded-[2.5rem] bg-white dark:bg-slate-900/40 dark:backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-300 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800/50">
              <div className="px-8 py-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-cyan-500" />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-300">Monitor de Tráfego em tempo real</h2>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                   <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Live</span>
                </div>
              </div>
              <div className="p-10 overflow-y-auto flex-1 scrollbar-thin">
                <FlowTracker />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden gap-4">
              <div className="flex items-center justify-between px-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-50 dark:bg-slate-800/50 rounded-lg">
                    <ChevronRight size={14} className="text-cyan-500 dark:text-slate-400" />
                  </div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Console de Operações / <span className="text-slate-800 dark:text-slate-300 tracking-normal">{selection.endpoint.label}</span>
                  </h2>
                </div>
                <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500">ID: {selection.endpoint.id}</div>
              </div>
              
              <div className="flex-1 overflow-y-auto rounded-[2.5rem] border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/40 dark:backdrop-blur-sm flex flex-col scrollbar-thin shadow-sm dark:shadow-none">
                <EndpointRunner key={selection.endpoint.id} endpoint={selection.endpoint} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER REFINADO */}
      <footer className="shrink-0 h-10 px-8 border-t flex items-center justify-between" style={{ background: 'var(--suri-surface)', borderColor: 'var(--suri-border)' }}>
        <div className="flex items-center gap-4">
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
            Suri Connect Enterprise
          </p>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">2026.05 • STABLE_RELEASE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-cyan-500 dark:text-slate-400 font-bold uppercase tracking-[0.1em]">Protocolo: HTTP/1.1</span>
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 dark:bg-cyan-500/50" />
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">Latência: 12ms</span>
        </div>
      </footer>
    </div>
  );
}
