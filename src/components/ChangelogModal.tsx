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

// Helper to parse individual markdown files
function parseChangelog(content: string): Omit<VersionChangelog, "version"> {
  const added: string[] = [];
  const changed: string[] = [];
  const fixed: string[] = [];
  let date = "";

  // Match header: ## [2.5.7] - 2026-05-14 or ## 2.5.7 - 2026-05-14
  const headerMatch = content.match(/##\s*\[?([0-9.]+)\]?\s*-\s*([0-9-]+)/);
  if (headerMatch) {
    date = headerMatch[2];
  }

  // Split by sections
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
        if (itemContent) {
          items.push(itemContent);
        }
      }
    }

    if (title.startsWith("adicionado") || title.startsWith("added")) {
      added.push(...items);
    } else if (
      title.startsWith("alterado") ||
      title.startsWith("changed") ||
      title.startsWith("modificado")
    ) {
      changed.push(...items);
    } else if (
      title.startsWith("corrigido") ||
      title.startsWith("fixed") ||
      title.startsWith("correções")
    ) {
      fixed.push(...items);
    }
  }

  return { date, added, changed, fixed };
}

// Dynamically import all markdown files in the changelogs folder at build-time using Vite glob
const changelogModules = import.meta.glob("../data/changelogs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// Parse and sort all changelogs descending by semver
export const changelogs: VersionChangelog[] = Object.entries(changelogModules)
  .map(([filePath, content]) => {
    const fileName = filePath.split("/").pop() || "";
    const version = fileName.replace(".md", "");
    const parsed = parseChangelog(content);
    return {
      version,
      ...parsed,
    };
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
  // If no changelogs loaded, fall back gracefully
  const hasChangelogs = changelogs.length > 0;
  const [selectedIdx, setSelectedIdx] = useState(0);

  const currentChangelog = hasChangelogs ? changelogs[selectedIdx] : null;

  // Simple parser to support markdown **bold** rendering
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
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-none rounded-[2rem] p-0 overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[85vh]">
        {/* Sidebar for Version Selection */}
        <div className="w-full md:w-56 bg-slate-50 dark:bg-slate-950/40 border-r border-slate-100 dark:border-slate-800/80 p-5 flex flex-col flex-shrink-0">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-md font-bold text-slate-800 dark:text-slate-200 leading-tight">Atualizações</h2>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Histórico de Versões</span>
            </div>
          </div>

          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none flex-1">
            {changelogs.map((item, idx) => (
              <button
                key={item.version}
                onClick={() => setSelectedIdx(idx)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 shrink-0 text-left cursor-pointer ${
                  selectedIdx === idx
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 opacity-70" />
                  <span>v{item.version}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 hidden md:block transition-transform duration-200 ${selectedIdx === idx ? "translate-x-0.5" : "opacity-30"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentChangelog ? (
            <>
              {/* Version Header */}
              <div className="bg-gradient-to-r from-[#4a54ff] to-[#2e1de8] p-6 text-white flex-shrink-0">
                <DialogTitle className="text-2xl font-black m-0 tracking-tight">
                  Versão {currentChangelog.version}
                </DialogTitle>
                <p className="text-white/80 text-sm font-medium mt-1">
                  Lançado em {currentChangelog.date.split("-").reverse().join("/")}
                </p>
              </div>

              {/* Version Details */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin">
                {/* ADICIONADO */}
                {currentChangelog.added.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500/20" />
                      Novos Recursos
                    </h3>
                    <ul className="space-y-3.5">
                      {currentChangelog.added.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[0.92rem] leading-relaxed text-slate-600 dark:text-slate-400">
                          <div className="mt-1 bg-amber-50 dark:bg-amber-950/30 p-1 rounded-full flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                          </div>
                          <span className="flex-1">{renderItemText(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ALTERADO */}
                {currentChangelog.changed.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                      Melhorias & Alterações
                    </h3>
                    <ul className="space-y-3.5">
                      {currentChangelog.changed.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[0.92rem] leading-relaxed text-slate-600 dark:text-slate-400">
                          <div className="mt-1 bg-indigo-50 dark:bg-indigo-950/30 p-1 rounded-full flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="flex-1">{renderItemText(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CORRIGIDO */}
                {currentChangelog.fixed.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                      Correções (Fixes)
                    </h3>
                    <ul className="space-y-3.5">
                      {currentChangelog.fixed.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[0.92rem] leading-relaxed text-slate-600 dark:text-slate-400">
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

          {/* Action button */}
          <div className="p-6 pt-0 flex-shrink-0">
            <Button
              className="w-full h-12 rounded-2xl font-bold bg-[#4a54ff] hover:bg-[#3b43cc] text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-transform duration-100 cursor-pointer"
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

