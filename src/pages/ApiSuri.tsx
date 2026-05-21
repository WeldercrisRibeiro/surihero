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
import { useApiStatus } from "@/hooks/useApiStatus";

type Selection = { kind: "flow-tracker" } | { kind: "endpoint"; endpoint: EndpointDef };

export default function SuriApi() {
  const [selection, setSelection] = useState<Selection>({ kind: "flow-tracker" });
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  // Credenciais salvas para o status
  const [savedBaseUrl, setSavedBaseUrl] = useState("");
  const [savedToken, setSavedToken] = useState("");

  const apiStatus = useApiStatus(savedBaseUrl, savedToken);

  const grouped = useMemo(() => {
    return ENDPOINT_GROUPS.map((g) => ({ group: g, items: ENDPOINTS.filter((e) => e.group === g) }));
  }, []);

  useEffect(() => {
    setPortalNode(document.getElementById('topbar-portal-target'));
    // Carrega credenciais salvas
    const c = loadCredentials();
    setSavedBaseUrl(c.baseUrl);
    setSavedToken(c.token);
  }, []);

  return (
    <div className="flex h-full w-full flex-col text-slate-900 dark:text-slate-100 overflow-hidden antialiased" style={{ flex: 1, minHeight: 0 }}>
      {portalNode && createPortal(
        <div className="flex w-full items-center justify-between gap-2 min-w-0">
          {/* TITLE */}
          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <div className="hidden sm:block">
              <h1 className="text-base font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2 leading-none">
                Api SURI
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Developer Console</p>
            </div>
          </div>

          {/* COMMAND SELECTOR */}
          <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
            <div className="relative">
              <button
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="flex items-center gap-2 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 px-3 sm:px-5 py-2 rounded-full transition-all cursor-pointer group shadow-sm active:scale-95"
              >
                <div className="p-1 sm:p-1.5 bg-primary-50 dark:bg-primary-500/10 rounded-full transition-colors">
                  <Settings size={13} className="text-primary-500 dark:text-primary-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700 dark:text-slate-300 max-w-[100px] sm:max-w-none truncate">
                  {selection.kind === "flow-tracker" ? "Rastr. Fluxo" : selection.endpoint.label}
                </span>
                <ChevronDown size={11} className={cn("text-slate-500 transition-transform duration-300 shrink-0", isSelectorOpen && "rotate-180")} />
              </button>

              {isSelectorOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSelectorOpen(false)} />
                  <div className="absolute top-12 right-0 sm:left-0 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 mb-1">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ações Disponíveis</span>
                    </div>

                    <button
                      onClick={() => { setSelection({ kind: "flow-tracker" }); setIsSelectorOpen(false); }}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all",
                        selection.kind === "flow-tracker" ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <Activity size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Rastreador de Fluxo</span>
                    </button>

                    <div className="my-2 h-px bg-slate-100 dark:bg-slate-800/50 mx-2" />

                    <div className="px-3 py-2">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Endpoints da API</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto px-1 pb-1">
                      {ENDPOINTS.map((e) => {
                        const active = selection.kind === "endpoint" && selection.endpoint.id === e.id;
                        return (
                          <button
                            key={e.id}
                            onClick={() => { setSelection({ kind: "endpoint", endpoint: e }); setIsSelectorOpen(false); }}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all group/item mb-1",
                              active ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            <Cable size={14} className={cn("transition-colors shrink-0", active ? "text-primary-500" : "text-slate-400 group-hover/item:text-slate-600")} />
                            <span className="text-[11px] font-bold uppercase tracking-wider">{e.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ✅ STATUS BADGE DINÂMICO */}
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <Badge variant="outline" className="text-[9px] font-mono border-primary-200 dark:border-slate-700 bg-primary-50 dark:bg-slate-800/50 text-primary-600 dark:text-primary-400 h-6 px-4 rounded-full lowercase tracking-tight">
                api.suri.ai
              </Badge>

              <div className={cn(
                "flex items-center gap-2 border px-3 py-1 rounded-full transition-all duration-500",
                apiStatus === "online"   && "bg-primary-500/10 border-primary-500/20",
                apiStatus === "offline"  && "bg-red-500/10 border-red-500/20",
                apiStatus === "checking" && "bg-slate-500/10 border-slate-500/20",
              )}>
                {apiStatus === "checking" ? (
                  <div className="h-1.5 w-1.5 rounded-full border border-slate-400 border-t-transparent animate-spin" />
                ) : (
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    apiStatus === "online"  && "bg-primary-500 animate-pulse",
                    apiStatus === "offline" && "bg-red-500",
                  )} />
                )}
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest",
                  apiStatus === "online"   && "text-primary-600 dark:text-primary-400",
                  apiStatus === "offline"  && "text-red-500",
                  apiStatus === "checking" && "text-slate-400",
                )}>
                  {apiStatus === "online"   && "Online"}
                  {apiStatus === "offline"  && "Offline"}
                  {apiStatus === "checking" && "Verificando..."}
                </span>
              </div>
            </div>

            {/* CredentialsBar */}
            <div className="hidden sm:flex items-center ml-2">
              <CredentialsBar onSave={(url, token) => { setSavedBaseUrl(url); setSavedToken(token); }} />
            </div>
          </div>
        </div>,
        portalNode
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden relative" style={{ minHeight: 0 }}>
        <div className="absolute inset-0 flex flex-col p-3 sm:p-6 max-w-[1500px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out z-10">
          {selection.kind === "flow-tracker" ? (
            <div className="flex-1 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-slate-900/40 dark:backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-300 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800/50">
              <div className="px-4 py-4 sm:px-8 sm:py-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-primary-500" />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-300">Monitor de Tráfego em tempo real</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Live</span>
                </div>
              </div>
              <div className="p-4 sm:p-10 overflow-y-auto flex-1">
                <FlowTracker />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden gap-3 sm:gap-4">
              <div className="flex items-center justify-between px-1 sm:px-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary-50 dark:bg-slate-800/50 rounded-lg">
                    <ChevronRight size={14} className="text-primary-500 dark:text-slate-400" />
                  </div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    <span className="hidden sm:inline">Console / </span>
                    <span className="text-slate-800 dark:text-slate-300 tracking-normal">{selection.endpoint.label}</span>
                  </h2>
                </div>
                <div className="hidden sm:block text-[9px] font-mono text-slate-400 dark:text-slate-500">ID: {selection.endpoint.id}</div>
              </div>

              <div className="flex-1 overflow-y-auto rounded-2xl sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/40 dark:backdrop-blur-sm flex flex-col shadow-sm dark:shadow-none">
                <EndpointRunner key={selection.endpoint.id} endpoint={selection.endpoint} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="shrink-0 h-9 px-4 sm:px-8 border-t flex items-center justify-between" style={{ background: 'var(--suri-surface)', borderColor: 'var(--suri-border)' }}>
        <div className="flex items-center gap-2 sm:gap-4">
          <p className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.15em]">
            <span className="hidden sm:inline">Suri Connect </span>Enterprise
          </p>
          <div className="hidden sm:block h-3 w-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[8px] sm:text-[9px] text-primary-500 dark:text-slate-400 font-bold uppercase tracking-[0.1em]">Protocolo: HTTP/1.1</span>
          <div className="h-1.5 w-1.5 rounded-full bg-primary-500 dark:bg-primary-500/50" />
          <span className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-mono">Latência: 12ms</span>
        </div>
      </footer>
    </div>
  );
}