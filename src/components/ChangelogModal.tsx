import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, Sparkles } from "lucide-react";

interface ChangelogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangelogModal({ open, onOpenChange }: ChangelogModalProps) {
  const features = [
    "Nova funcionalidade de cálculo avançado de preços com descontos modulares somente para o plano ADVANCED",
    "Refatoração do layout do Hub com tema e background de marca d'água.",
    "Adicionado no modal de orçamento a opção de exportação para PDF."
  ];

  const fixes = [
    "Removido loop de redirecionamento de autenticação no dashboard.",
    "Corrigido o problema de sincronização ao alterar a quantidade de interações.",
    "Ajuste na contagem de interações nos planos PRO e Essencial."
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-none rounded-[2rem] p-0 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#4a54ff] to-[#2e1de8] p-6 text-white flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <DialogTitle className="text-xl font-black m-0">Novidades da Versão</DialogTitle>
            <p className="text-white/80 text-sm font-medium mt-1">v2.1.1 - Atualizações e Correções</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-500" />
              Novos Recursos
            </h3>
            <ul className="space-y-3">
              {features.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="mt-0.5 bg-indigo-50 dark:bg-indigo-900/30 p-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Correções (Fixes)
            </h3>
            <ul className="space-y-3">
              {fixes.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="mt-0.5 bg-emerald-50 dark:bg-emerald-900/30 p-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-6 pt-0">
          <Button 
            className="w-full h-12 rounded-xl font-bold bg-[#4a54ff] hover:bg-[#3b43cc] text-white"
            onClick={() => onOpenChange(false)}
          >
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
