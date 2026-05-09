// Exibe resultado em duas abas: tabela amigável (quando aplicável) e JSON formatado.
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  data: unknown;
  url?: string;
}

function pickRows(data: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(data) && data.length && typeof data[0] === "object") {
    return data as Record<string, unknown>[];
  }
  if (data && typeof data === "object") {
    const inner = (data as { data?: unknown }).data;
    if (Array.isArray(inner) && inner.length && typeof inner[0] === "object") {
      return inner as Record<string, unknown>[];
    }
  }
  return null;
}

function renderCell(v: unknown) {
  if (v === null || v === undefined) return <span className="text-muted-foreground/30">—</span>;
  if (typeof v === "boolean") {
    return (
      <Badge variant="outline" className={cn(
        "text-[8px] h-4 px-1.5 font-bold uppercase",
        v ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
      )}>
        {String(v)}
      </Badge>
    );
  }
  if (typeof v === "object") return <span className="text-muted-foreground/40 italic text-[10px]">[obj]</span>;
  return <span className="truncate block max-w-[300px]" title={String(v)}>{String(v)}</span>;
}

export function ResultPanel({ data }: Omit<Props, 'url'>) {
  const [tab, setTab] = useState("table");
  const rows = useMemo(() => pickRows(data), [data]);
  const columns = useMemo(() => {
    if (!rows) return [];
    const cols = new Set<string>();
    rows.slice(0, 50).forEach((r) => Object.keys(r).forEach((k) => cols.add(k)));
    return Array.from(cols);
  }, [rows]);

  const json = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);

  function copy() {
    navigator.clipboard.writeText(json);
    toast.success("JSON copiado");
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs value={tab} onValueChange={setTab} className="w-full flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-2 bg-muted/5 border-b border-border/20 shrink-0">
          <TabsList className="bg-background/40 border border-border/30 h-7 p-0.5 rounded-md">
            <TabsTrigger 
              value="table" 
              disabled={!rows} 
              className="text-[8px] font-bold uppercase tracking-widest px-4 h-6 data-[state=active]:bg-card rounded-sm font-mono"
            >
              TABELA
            </TabsTrigger>
            <TabsTrigger 
              value="json" 
              className="text-[8px] font-bold uppercase tracking-widest px-4 h-6 data-[state=active]:bg-card rounded-sm font-mono"
            >
              JSON
            </TabsTrigger>
          </TabsList>
          <Button size="sm" variant="ghost" onClick={copy} className="h-7 text-[8px] font-bold uppercase tracking-widest hover:text-primary font-mono">
            COPIAR_JSON
          </Button>
        </div>
        
        <TabsContent value="table" className="mt-0 p-0 flex-1 overflow-hidden ring-0 focus-visible:ring-0">
          {rows ? (
            <div className="h-full overflow-auto scrollbar-thin">
              <table className="w-full text-[10px] border-collapse font-mono">
                <thead className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm shadow-[0_1px_0_rgba(var(--border),0.5)]">
                  <tr>
                    {columns.map((c) => (
                      <th key={c} className="px-4 py-2.5 text-left font-bold text-muted-foreground/50 uppercase tracking-tighter border-b border-border/20 whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {rows.map((row, i) => (
                    <tr key={i} className="group hover:bg-primary/[0.04] transition-colors odd:bg-muted/[0.02]">
                      {columns.map((c) => (
                        <td key={c} className="px-4 py-2 align-middle text-foreground/80 group-hover:text-foreground border-r border-border/5 last:border-r-0">
                          {renderCell(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-24 text-center space-y-4">
              <p className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em] italic font-mono">Schema mismatch — view JSON raw data.</p>
              <Button variant="link" onClick={() => setTab("json")} className="text-[10px] text-primary/40 uppercase font-mono tracking-widest">Switch to JSON view</Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="json" className="mt-0 p-0 ring-0 focus-visible:ring-0">
          <div className="relative group">
            <pre className="max-h-[550px] overflow-auto bg-[#0a0d12] p-10 text-[11px] font-mono leading-relaxed text-primary/80 selection:bg-primary/20">
              {json}
            </pre>
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge variant="outline" className="bg-background/10 text-[8px] border-border/20 text-muted-foreground/40 backdrop-blur-sm font-mono tracking-tighter">
                PRETTY_PRINTED
              </Badge>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
