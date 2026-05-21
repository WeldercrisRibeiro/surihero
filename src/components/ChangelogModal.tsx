import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, Sparkles, AlertCircle, FileText, ChevronRight } from "lucide-react";

interface ChangelogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface VersionChangelog {
  version: string;
  date: string;
  added: string[];
  changed: string[];
  fixed: string[];
}

function parseChangelog(content: string): Omit<VersionChangelog, "version"> {
  const added: string[] = [];
  const changed: string[] = [];
  const fixed: string[] = [];
  let date = "";

  const headerMatch = content.match(/##\s*\[?([0-9.]+)\]?\s*-\s*([0-9-]+)/);
  if (headerMatch) {
    date = headerMatch[2];
  }

  const sections = content.split(/###\s+/);

  for (const section of sections) {
    const lines = section.split("\n");
    if (lines.length === 0) continue;

    const title = lines[0].trim().toLowerCase();
    const items: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("-") || line.startsWith("*")) {
        const itemContent = line.replace(/^[-*]\s*/, "").trim();
        if (itemContent) items.push(itemContent);
      }
    }

    if (title.startsWith("adicionado") || title.startsWith("added")) {
      added.push(...items);
    } else if (title.startsWith("alterado") || title.startsWith("changed") || title.startsWith("modificado")) {
      changed.push(...items);
    } else if (title.startsWith("corrigido") || title.startsWith("fixed") || title.startsWith("correções")) {
      fixed.push(...items);
    }
  }

  return { date, added, changed, fixed };
}

const changelogModules = import.meta.glob("../data/changelogs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const changelogs: VersionChangelog[] = Object.entries(changelogModules)
  .map(([filePath, content]) => {
    const fileName = filePath.split("/").pop() || "";
    const version = fileName.replace(".md", "");
    const parsed = parseChangelog(content);
    return { version, ...parsed };
  })
  .sort((a, b) => {
    const aParts = a.version.split(".").map(Number);
    const bParts = b.version.split(".").map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] || 0;
      const bVal = bParts[i] || 0;
      if (aVal !== bVal) return bVal - aVal;
    }
    return 0;
  });

export function ChangelogModal({ open, onOpenChange }: ChangelogModalProps) {
  const hasChangelogs = changelogs.length > 0;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentChangelog = hasChangelogs ? changelogs[selectedIdx] : null;

  const renderItemText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, idx) =>
      idx % 2 === 1 ? (
        <strong key={idx} className="font-extrabold text-slate-900 dark:text-white">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] md:w-auto bg-white dark:bg-slate-900 border-none rounded-[2rem] p-0 overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-auto md:max-h-[85vh]">
        
        {/* Sidebar */}
        <div className="w-full md:w-56 bg-slate-50 dark:bg-slate-950/40 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80 p-4 md:p-5 flex flex-col flex-shrink-0">
          <div className="flex items-center gap-2 mb-3 md:mb-6">
            <div className="bg-indigo-600 p-1.5 md:p-2 rounded-xl text-white">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-md font-bold text-slate-800 dark:text-slate-200 leading-tight">Atualizações</h2>
              <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium">Histórico de Versões</span>
            </div>
          </div>

          {/* Mobile: scroll horizontal | Desktop: scroll vertical */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto pb-1 md:pb-0 scrollbar-none flex-shrink-0 md:flex-1">
            {changelogs.map((item, idx) => (
              <button
                key={item.version}
                onClick={() => setSelectedIdx(idx)}
                className={`flex items-center justify-between px-3 md:px-4 py-2 md:py-3 rounded-2xl font-semibold transition-all duration-200 shrink-0 text-left cursor-pointer ${
                  selectedIdx === idx
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-70" />
                  <span className="text-xs md:text-sm">v{item.version}</span>
                </div>
                <ChevronRight className={`w-3 h-3 hidden md:block transition-transform duration-200 ${selectedIdx === idx ? "translate-x-0.5" : "opacity-30"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {currentChangelog ? (
            <>
              {/* Header da versão */}
              <div className="bg-gradient-to-r from-[#4a54ff] to-[#2e1de8] p-5 md:p-6 text-white flex-shrink-0">
                <DialogTitle className="text-xl md:text-2xl font-black m-0 tracking-tight">
                  Versão {currentChangelog.version}
                </DialogTitle>
                <p className="text-white/80 text-xs md:text-sm font-medium mt-1">
                  Lançado em {currentChangelog.date.split("-").reverse().join("/")}
                </p>
              </div>

              {/* Detalhes */}
              <div className="p-5 md:p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin">
                {currentChangelog.added.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                      Novos Recursos
                    </h3>
                    <ul className="space-y-3">
                      {currentChangelog.added.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[0.88rem] leading-relaxed text-slate-600 dark:text-slate-400">
                          <div className="mt-1 bg-amber-50 dark:bg-amber-950/30 p-1 rounded-full flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                          </div>
                          <span className="flex-1">{renderItemText(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentChangelog.changed.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      Melhorias & Alterações
                    </h3>
                    <ul className="space-y-3">
                      {currentChangelog.changed.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[0.88rem] leading-relaxed text-slate-600 dark:text-slate-400">
                          <div className="mt-1 bg-indigo-50 dark:bg-indigo-950/30 p-1 rounded-full flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="flex-1">{renderItemText(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentChangelog.fixed.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Correções (Fixes)
                    </h3>
                    <ul className="space-y-3">
                      {currentChangelog.fixed.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[0.88rem] leading-relaxed text-slate-600 dark:text-slate-400">
                          <div className="mt-1 bg-emerald-50 dark:bg-emerald-950/30 p-1 rounded-full flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="flex-1">{renderItemText(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Nenhum registro de atualização encontrado.</p>
            </div>
          )}

          {/* Botão fechar */}
          <div className="p-4 md:p-6 pt-0 flex-shrink-0">
            <Button
              className="w-full h-11 md:h-12 rounded-2xl font-bold bg-[#4a54ff] hover:bg-[#3b43cc] text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-transform duration-100 cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Fechar novidades
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}