import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { callEndpoint } from "@/lib/suri/client";
import type { EndpointDef } from "@/lib/suri/endpoints";
import { ResultPanel } from "./ResultPanel";
import { Info, Settings } from "lucide-react";

export function EndpointRunner({ endpoint }: { endpoint: EndpointDef }) {
  const initial: Record<string, string> = {};
  (endpoint.params ?? []).forEach((p) => (initial[p.name] = p.defaultValue ?? ""));

  const [values, setValues] = useState<Record<string, string>>(initial);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ data: unknown; url: string } | null>(null);

  async function run() {
    setLoading(true);
    try {
      const res = await callEndpoint({ endpoint, values });
      setResult({ data: res.data, url: res.url });
    } catch (e: any) {
      toast.error(e.message || "Erro ao executar requisição");
    } finally {
      setLoading(false);
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada");
  }

  function openUrl(url: string) {
    window.open(url, "_blank");
  }

  const displayUrl = result?.url || endpoint.path;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-card px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-semibold text-[10px] tracking-wider rounded-md">
                {endpoint.method}
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{endpoint.id}</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{endpoint.label}</h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {endpoint.description || "Inicie esta operação para consultar os dados da API."}
            </p>
          </div>
          <Button onClick={run} disabled={loading} className="h-10 px-8 rounded-md font-bold shadow-sm transition-all active:scale-[0.98]">
            {loading ? "PROCESSANDO..." : "EXECUTAR"}
          </Button>
        </div>

        <div className="p-6">
          {(endpoint.params ?? []).length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {endpoint.params!.map((p) => (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <Label htmlFor={p.name} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      {p.name}
                      {p.required && <span className="ml-1 text-destructive">*</span>}
                    </Label>
                    <span className="text-[8px] font-mono text-muted-foreground/50 uppercase">
                      {p.in}
                    </span>
                  </div>
                  <Input
                    id={p.name}
                    placeholder={p.placeholder || `Valor para ${p.name}...`}
                    value={values[p.name] ?? ""}
                    onChange={(e) => setValues((s) => ({ ...s, [p.name]: e.target.value }))}
                    className="bg-background border-border h-9 rounded-md font-mono text-xs"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center bg-muted/5">
              <p className="text-xs text-muted-foreground/60 italic font-mono">Sem parâmetros obrigatórios.</p>
            </div>
          )}

          <div className="mt-8 rounded-lg border border-border bg-muted/10 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Caminho do Endpoint:</p>
                <p className="font-mono text-xs text-primary/70 dark:text-white truncate bg-background/50 px-3 py-1.5 rounded border border-border/10">
                  {displayUrl}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => copyUrl(displayUrl)} className="h-8 px-4 rounded-md text-[10px] font-bold uppercase border-border hover:bg-muted transition-all">Copiar</Button>
                <Button variant="outline" size="sm" onClick={() => openUrl(displayUrl)} className="h-8 px-4 rounded-md text-[10px] font-bold uppercase border-border hover:bg-muted transition-all">Abrir ↗</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Panel */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-6 py-3">
          <div className="flex items-center gap-2">
            <div className={cn("h-1.5 w-1.5 rounded-full", result ? "bg-green-500" : "bg-muted-foreground/20")} />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Resposta da API</h3>
          </div>
          {result && (
            <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
              STATUS: 200 OK
            </Badge>
          )}
        </div>
        <div className="p-0">
          {result ? (
            <ResultPanel data={result.data} />
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center p-12 space-y-4 opacity-50">
              <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center border border-border">
                <Settings size={20} className="text-muted-foreground/40" />
              </div>
              <div className="max-w-[280px] space-y-1">
                <p className="text-sm font-bold text-foreground">Aguardando Execução</p>
                <p className="text-[11px] text-muted-foreground">
                  Preencha os campos e clique no botão para visualizar os dados aqui.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
