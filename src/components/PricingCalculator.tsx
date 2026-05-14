import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "sonner";
import {
  Minus, Plus, FileText,
  Lightbulb, Zap, Calculator, Megaphone
} from "lucide-react";
import QuoteModal, { type QuoteData } from "./QuoteModal";
import DownsellModal from "./DownsellModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const PRICE_PER_INTERACTION = { essential: 0.53, pro: 0.66, advanced: 0.00 };
const IMPLANTACAO = 1890;

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtN(v: number) {
  return v.toLocaleString("pt-BR");
}

export default function PricingCalculator() {
  const [interactions, setInteractions] = useState(1000);
  const [essPrice, setEssPrice] = useState(PRICE_PER_INTERACTION.essential);
  const [proPrice, setProPrice] = useState(PRICE_PER_INTERACTION.pro);
  const [advPrice, setAdvPrice] = useState(PRICE_PER_INTERACTION.advanced);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [setupPrice, setSetupPrice] = useState(IMPLANTACAO);
  const [setupDiscount, setSetupDiscount] = useState(100);
  const [excessDiscountPercent, setExcessDiscountPercent] = useState(0);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [downsellModalOpen, setDownsellModalOpen] = useState(false);
  const [marketingPrice, setMarketingPrice] = useState(0.49);
  const [utilityPrice, setUtilityPrice] = useState(0.25);
  const [activeTab, setActiveTab] = useState<"upsell" | "downsell">("upsell");

  // Downsell Calculator States
  const [downsellPlanValue, setDownsellPlanValue] = useState(2640.00);
  const [contractDuration, setContractDuration] = useState(12);
  const [monthsUsed, setMonthsUsed] = useState(4);
  const [penaltyPercent, setPenaltyPercent] = useState(30);
  const [contractStart, setContractStart] = useState("2025-09-30");
  const [downsellDate, setDownsellDate] = useState("2026-05-07");
  const [overdueInvoices, setOverdueInvoices] = useState(2640.00);
  const [overdueDueDate, setOverdueDueDate] = useState("2026-05-15");

  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalNode(document.getElementById('topbar-portal-target'));
  }, []);

  useEffect(() => {
    if (!contractStart || !downsellDate) return;
    const [sy, sm, sd] = contractStart.split("-").map(Number);
    const [ey, em, ed] = downsellDate.split("-").map(Number);
    if (!sy || !ey) return;
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) {
      months--;
    }
    setMonthsUsed(Math.max(0, months));
  }, [contractStart, downsellDate]);

  const contractTotal = downsellPlanValue * contractDuration;
  const valueUsed = downsellPlanValue * monthsUsed;
  const remainingBalance = Math.max(0, contractTotal - valueUsed);
  const penaltyAmount = monthsUsed >= contractDuration ? 0 : remainingBalance * (penaltyPercent / 100);
  const totalDue = penaltyAmount + overdueInvoices;


  const togglePlan = (plan: string) => {
    setSelectedPlans((prev) => {
      const next = new Set(prev);
      if (next.has(plan)) next.delete(plan); else next.add(plan);
      return next;
    });
  };

  const getQuotePlans = (): QuoteData[] => {
    const plans: QuoteData[] = [];
    if (selectedPlans.has("Essential")) {
      plans.push({
        plan: "Essential", interactions, interactionPrice: essPrice,
        basePrice: calc.essential.base, finalPrice: calc.essential.final,
        discount: calc.essential.discount, hasDiscount: discountPercent > 0,
        discountPercent,
        implantacao: calc.implantacao.final, marketingPrice, utilityPrice,
        excessDiscountPercent,
        suriShopCommission: ""
      });
    }
    if (selectedPlans.has("Advanced")) {
      plans.push({
        plan: "Advanced", interactions, interactionPrice: advPrice,
        basePrice: calc.advanced.base, finalPrice: calc.advanced.final,
        discount: calc.advanced.discount, hasDiscount: discountPercent > 0,
        discountPercent,
        implantacao: calc.implantacao.final, marketingPrice, utilityPrice,
        excessDiscountPercent,
        suriShopCommission: ""
      });
    }
    if (selectedPlans.has("Pro")) {
      plans.push({
        plan: "Pro", interactions, interactionPrice: proPrice,
        basePrice: calc.pro.base, finalPrice: calc.pro.final,
        discount: calc.pro.discount, hasDiscount: discountPercent > 0,
        discountPercent,
        implantacao: calc.implantacao.final, marketingPrice, utilityPrice,
        excessDiscountPercent,
        suriShopCommission: ""
      });
    }
    return plans;
  };

  const calc = useMemo(() => {
    const essBase = interactions * essPrice;
    const proBase = interactions * proPrice;
    const advBase = interactions * advPrice;
    const applyDiscount = (price: number) => price * (1 - discountPercent / 100);
    const setupFinal = Math.max(0, setupPrice * (1 - setupDiscount / 100));

    return {
      essential: { base: essBase, final: applyDiscount(essBase), discount: essBase - applyDiscount(essBase) },
      pro: { base: proBase, final: applyDiscount(proBase), discount: proBase - applyDiscount(proBase) },
      advanced: { base: advBase, final: applyDiscount(advBase), discount: advBase - applyDiscount(advBase) },
      implantacao: { base: setupPrice, final: setupFinal, discount: setupPrice - setupFinal }
    };
  }, [interactions, essPrice, proPrice, advPrice, discountPercent, setupPrice, setupDiscount]);

  return (
    <div className="flex-1 overflow-y-auto pt-4 pb-12 px-4 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">

        {/* HEADER MOVED TO PORTAL */}
        {portalNode && createPortal(
          <div className="flex w-full items-center justify-between gap-2 min-w-0">
            {/* Título — oculto em mobile, visível em sm+ */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-white dark:bg-slate-900 rounded-lg shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-800">
                <Calculator className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              <h1 className="text-sm font-black italic tracking-tighter text-cyan-900 dark:text-cyan-400 whitespace-nowrap">
                Suri Calcs
              </h1>
            </div>

            {/* Tabs — labels curtos em mobile, completos em sm+ */}
            <div className="bg-slate-100 dark:bg-slate-800/50 p-0.5 rounded-full flex gap-0.5 border border-slate-200 dark:border-slate-700 ml-auto">
              <button
                onClick={() => setActiveTab("upsell")}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === "upsell"
                    ? "bg-white dark:bg-slate-900 text-cyan-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <span className="sm:hidden">Upsell</span>
                <span className="hidden sm:inline">Upsell / Nova Venda</span>
              </button>
              <button
                onClick={() => setActiveTab("downsell")}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === "downsell"
                    ? "bg-white dark:bg-slate-900 text-cyan-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <span className="sm:hidden">Downsell</span>
                <span className="hidden sm:inline">Downsell / Multa</span>
              </button>
            </div>
          </div>,
          portalNode
        )}

        {activeTab === "upsell" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Grid */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">

          {/* Interaction Control Card */}
          <Card className="h-full p-8 rounded-[2.5rem] border-none glass-card dark:bg-slate-900/40 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Interações / Mês</h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Configure o volume de conversas</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4">
              <button
                onClick={() => setInteractions(p => Math.max(1000, p - 500))}
                className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-all border border-cyan-100/50 dark:border-cyan-500/20"
              >
                <Minus className="w-6 h-6" />
              </button>

              <div className="flex-1 bg-white dark:bg-slate-800/50 rounded-2xl h-14 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner px-4">
                <Input
                  type="text" value={fmtN(interactions)}
                  onChange={(e) => setInteractions(Math.max(1000, parseInt(e.target.value.replace(/\D/g, "")) || 0))}
                  className="border-none bg-transparent text-center text-2xl font-black text-slate-900 dark:text-white focus-visible:ring-0 shadow-none h-full w-full font-sans" />
              </div>

              <button
                onClick={() => setInteractions(p => p + 500)}
                className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-all border border-cyan-100/50 dark:border-cyan-500/20"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 font-bold mb-10 italic">
              Mínimo: 1.000 • Incrementos de 500
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-cyan-500" />
                  </div>
                  <Label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase leading-none">Desc. Mensal (%)</Label>
                </div>
                <div className="relative">
                  <Select value={String(discountPercent)} onValueChange={(v) => setDiscountPercent(Number(v))}>
                    <SelectTrigger className="h-10 border-none bg-cyan-50/30 dark:bg-slate-900/40 font-black text-slate-700 dark:text-white rounded-xl">
                      <SelectValue placeholder="0%" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 5, 10, 15, 20, 25].map(v => (
                        <SelectItem key={v} value={String(v)}>{v}%</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-cyan-500" />
                  </div>
                  <Label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase leading-none">Desc. Implantação (%)</Label>
                </div>
                <div className="relative">
                  <Input
                    type="number" min={0} max={100} value={setupDiscount || ""} placeholder="0"
                    onChange={(e) => setSetupDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="h-10 border-none bg-cyan-50/30 dark:bg-slate-900/40 font-black text-cyan-600 dark:text-cyan-400 rounded-xl text-center" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300 text-xs font-black">%</div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-green-500" />
                  </div>
                  <Label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase leading-none">Desc. Excedentes (%)</Label>
                </div>
                <div className="relative">
                  <Select value={String(excessDiscountPercent)} onValueChange={(v) => setExcessDiscountPercent(Number(v))}>
                    <SelectTrigger className="h-10 border-none bg-green-50/30 dark:bg-green-900/20 font-black text-green-600 dark:text-green-400 rounded-xl">
                      <SelectValue placeholder="0%" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 5, 10, 15, 20, 25].map(v => (
                        <SelectItem key={v} value={String(v)}>{v}%</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing Adjust Table Card */}
          <Card className="h-full p-8 rounded-[2.5rem] border-none glass-card dark:bg-slate-900/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="text-slate-600 dark:text-slate-400 font-black">$</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Ajuste de Preços</h3>
              <span className="ml-auto text-slate-100 dark:text-slate-800 opacity-50"><Calculator className="w-12 h-12" /></span>
            </div>

            <div className="space-y-2">
              {[
                { label: "Essential (R$)", value: essPrice, setter: setEssPrice },
                { label: "Advanced (R$)", value: advPrice, setter: setAdvPrice },
                { label: "Pro (R$)", value: proPrice, setter: setProPrice },
                { label: "Implantação (R$)", value: setupPrice, setter: setSetupPrice, color: "bg-cyan-50 dark:bg-cyan-900/20", inputColor: "text-cyan-600 dark:text-cyan-400" },
                { label: "Mensagens de Marketing (R$)", value: marketingPrice, setter: setMarketingPrice, isExcess: true },
                { label: "Mensagens de Utilidades (R$)", value: utilityPrice, setter: setUtilityPrice, isExcess: true }
              ].map((f, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${f.color || "bg-slate-50/70 dark:bg-slate-800/40"} border border-transparent transition-all hover:border-slate-200 dark:hover:border-slate-700`}>
                  <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">{f.label}</Label>
                  <div className="flex items-center gap-2">
                    {f.isExcess && excessDiscountPercent > 0 && (
                      <span className="text-xs font-bold text-green-500 mr-2 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-md">
                        R$ {fmt(f.value * (1 - excessDiscountPercent / 100))}
                      </span>
                    )}
                    <Input
                      type="number" step="0.01" value={f.value}
                      onChange={e => f.setter(Number(e.target.value))}
                      className={`h-8 w-24 text-right font-black text-sm border-none bg-transparent shadow-none focus-visible:ring-0 ${f.inputColor || "text-slate-900 dark:text-slate-200"} ${f.isExcess && excessDiscountPercent > 0 ? "opacity-50 line-through" : ""}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Lower Row: Plan Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12 items-stretch">

          {/* Essential Plan Card */}
          <Card
            onClick={() => togglePlan("Essential")}
            className={`group h-full p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[22rem]
              bg-white dark:bg-[#083344] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_-12px_rgba(8,51,68,0.4)]
              ${selectedPlans.has("Essential") ? "border-cyan-500 ring-4 ring-cyan-500/20 dark:ring-cyan-500/50" : "border-transparent"}
              hover:scale-[1.02] active:scale-95 duration-300
            `}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlans.has("Essential") ? "border-cyan-500 bg-cyan-500" : "border-slate-200 dark:border-white/20"}`}>
                  {selectedPlans.has("Essential") && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Essential</h2>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mb-8 uppercase tracking-widest">Ideal para começar</p>

              <div className="items-baseline flex gap-1 mb-8">
                <span className="text-slate-400 dark:text-slate-500 font-bold text-lg">R$</span>
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{fmt(calc.essential.final)}</span>
                <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">/mês</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest">
                <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-white"><Plus className="w-3 h-3" /></div>
                Implantação
              </div>
              <span className="text-cyan-500 font-black italic">R$ {fmt(calc.implantacao.final)}</span>
            </div>
          </Card>

          {/* Advanced Plan Card */}
          <Card
            onClick={() => togglePlan("Advanced")}
            className={`group h-full p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[22rem]
              bg-cyan-600 dark:bg-cyan-700 shadow-[0_20px_50px_-12px_rgba(8,145,178,0.4)]
              ${selectedPlans.has("Advanced") ? "border-white ring-4 ring-white/20" : "border-transparent"}
              hover:scale-[1.02] active:scale-95 duration-300
            `}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlans.has("Advanced") ? "border-white bg-white" : "border-white/40"}`}>
                  {selectedPlans.has("Advanced") && <div className="w-2 h-2 rounded-full bg-cyan-600" />}
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Advanced</h2>
              <p className="text-cyan-100 text-xs font-medium mb-8 uppercase tracking-widest">O mais popular</p>

              <div className="items-baseline flex gap-1 mb-8">
                <span className="text-cyan-100 font-bold text-lg">R$</span>
                <span className="text-5xl font-black text-white tracking-tighter">{fmt(calc.advanced.final)}</span>
                <span className="text-cyan-100 font-bold text-sm">/mês</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-cyan-600"><Plus className="w-3 h-3" /></div>
                Implantação
              </div>
              <span className="text-white font-black italic">R$ {fmt(calc.implantacao.final)}</span>
            </div>
          </Card>

          {/* Pro Plan Card */}
          <Card
            onClick={() => togglePlan("Pro")}
            className={`group h-full p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between duration-500 min-h-[22rem]
              bg-[#083344] dark:bg-white border-transparent shadow-[0_20px_50px_-12px_rgba(8,51,68,0.4)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]
              ${selectedPlans.has("Pro") ? "border-cyan-500 ring-4 ring-cyan-500/50 dark:ring-cyan-500/20" : "border-transparent"}
              hover:scale-[1.02] active:scale-95
            `}
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-cyan-500/20 dark:bg-cyan-50 text-cyan-400 dark:text-cyan-600">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlans.has("Pro") ? 'border-cyan-400 dark:border-cyan-500 bg-cyan-400 dark:bg-cyan-500' : 'border-white/20 dark:border-slate-200'}`}>
                  {selectedPlans.has("Pro") && <div className="w-2 h-2 rounded-full bg-[#083344] dark:bg-white" />}
                </div>
              </div>
              <h2 className="text-2xl font-black text-white dark:text-slate-900 mb-1">Pro</h2>
              <p className="text-xs font-medium mb-8 uppercase tracking-widest text-slate-400">Para alta performance</p>

              <div className="items-baseline flex gap-1 mb-8">
                <span className="font-bold text-lg text-cyan-400 dark:text-slate-400">R$</span>
                <span className="text-5xl font-black tracking-tighter text-white dark:text-slate-900">{fmt(calc.pro.final)}</span>
                <span className="font-bold text-sm opacity-50 text-white dark:text-slate-500">/mês</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 dark:border-slate-100 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 dark:text-cyan-500">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-white bg-cyan-500"><Plus className="w-3 h-3" /></div>
                Implantação
              </div>
              <span className="font-black italic text-cyan-400">R$ {fmt(calc.implantacao.final)}</span>
            </div>
          </Card>
        </div>
      </div>
      )}

        {activeTab === "downsell" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Downsell / Penalty Calculator */}
            <div className="max-w-4xl mx-auto mb-12">
          <Card className="p-8 rounded-[2.5rem] border-none glass-card dark:bg-slate-900/40 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Calculadora de Downsell / Multa</h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Simule o cancelamento ou downsell antes de 12 meses</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Entradas */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Valor mensal (R$)</Label>
                    <div className="flex bg-white dark:bg-slate-800/50 rounded-2xl h-12 items-center border border-slate-100 dark:border-slate-700 px-4">
                      <Input
                        type="number"
                        value={downsellPlanValue}
                        onChange={(e) => setDownsellPlanValue(Number(e.target.value))}
                        className="bg-transparent border-0 text-slate-900 dark:text-white font-bold h-full focus-visible:ring-0 p-0 text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Vigência (meses)</Label>
                    <div className="flex bg-white dark:bg-slate-800/50 rounded-2xl h-12 items-center border border-slate-100 dark:border-slate-700 px-4">
                      <Input
                        type="number"
                        value={contractDuration}
                        onChange={(e) => setContractDuration(Number(e.target.value))}
                        className="bg-transparent border-0 text-slate-900 dark:text-white font-bold h-full focus-visible:ring-0 p-0 text-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Meses Utilizados</Label>
                    <div className="flex bg-white dark:bg-slate-800/50 rounded-2xl h-12 items-center border border-slate-100 dark:border-slate-700 px-4">
                      <Input
                        type="number"
                        value={monthsUsed}
                        onChange={(e) => setMonthsUsed(Number(e.target.value))}
                        className="bg-transparent border-0 text-slate-900 dark:text-white font-bold h-full focus-visible:ring-0 p-0 text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Multa (%)</Label>
                    <div className="flex bg-white dark:bg-slate-800/50 rounded-2xl h-12 items-center border border-slate-100 dark:border-slate-700 px-4">
                      <Input
                        type="number"
                        value={penaltyPercent}
                        onChange={(e) => setPenaltyPercent(Number(e.target.value))}
                        className="bg-transparent border-0 text-slate-900 dark:text-white font-bold h-full focus-visible:ring-0 p-0 text-lg text-cyan-600 dark:text-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-2 opacity-50" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Início Contrato</Label>
                    <div className="flex bg-white dark:bg-slate-800/50 rounded-2xl h-12 items-center border border-slate-100 dark:border-slate-700 px-4">
                      <Input
                        type="date"
                        value={contractStart}
                        onChange={(e) => setContractStart(e.target.value)}
                        className="bg-transparent border-0 text-slate-900 dark:text-white font-bold h-full focus-visible:ring-0 p-0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Data Cancelamento</Label>
                    <div className="flex bg-white dark:bg-slate-800/50 rounded-2xl h-12 items-center border border-slate-100 dark:border-slate-700 px-4">
                      <Input
                        type="date"
                        value={downsellDate}
                        onChange={(e) => setDownsellDate(e.target.value)}
                        className="bg-transparent border-0 text-slate-900 dark:text-white font-bold h-full focus-visible:ring-0 p-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Fatura em Aberto (R$)</Label>
                    <div className="flex bg-white dark:bg-slate-800/50 rounded-2xl h-12 items-center border border-slate-100 dark:border-slate-700 px-4">
                      <Input
                        type="number"
                        value={overdueInvoices}
                        onChange={(e) => setOverdueInvoices(Number(e.target.value))}
                        className="bg-transparent border-0 text-slate-900 dark:text-white font-bold h-full focus-visible:ring-0 p-0 text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Vencimento Fatura</Label>
                    <div className="flex bg-white dark:bg-slate-800/50 rounded-2xl h-12 items-center border border-slate-100 dark:border-slate-700 px-4">
                      <Input
                        type="date"
                        value={overdueDueDate}
                        onChange={(e) => setOverdueDueDate(e.target.value)}
                        className="bg-transparent border-0 text-slate-900 dark:text-white font-bold h-full focus-visible:ring-0 p-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultados */}
              <div className="bg-cyan-50 dark:bg-cyan-900/10 rounded-3xl p-6 border border-cyan-100 dark:border-cyan-800/50 flex flex-col justify-center">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Valor total do contrato</span>
                    <span className="text-base font-bold text-slate-800 dark:text-slate-200">R$ {fmt(contractTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Valor utilizado</span>
                    <span className="text-base font-bold text-slate-800 dark:text-slate-200">R$ {fmt(valueUsed)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo remanescente</span>
                    <span className="text-base font-bold text-slate-800 dark:text-slate-200">R$ {fmt(remainingBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-900/20 p-2 rounded-xl border border-rose-100 dark:border-rose-900/40">
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">Multa rescisória ({penaltyPercent}%)</span>
                    <span className="text-base font-black text-rose-600 dark:text-rose-400">
                      {monthsUsed >= contractDuration ? "SEM MULTA" : `R$ ${fmt(penaltyAmount)}`}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-cyan-200 dark:border-cyan-800/50 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Total devido</span>
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">R$ {fmt(totalDue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Texto Cliente Block */}
            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-700 relative group">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Texto Sugerido para o Cliente</h4>
                <Button 
                  variant="ghost" size="sm" 
                  className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                  onClick={() => {
                    const text = `Conforme contrato vigente, o pedido de cancelamento realizado em ${new Date(downsellDate).toLocaleDateString('pt-BR')} está sujeito à multa rescisória de ${penaltyPercent}% sobre o saldo contratual remanescente, além da quitação das faturas já emitidas.\n\nDessa forma, temos:\n\nMulta rescisória: R$ ${fmt(penaltyAmount)}\nFatura em aberto (venc. ${new Date(overdueDueDate).toLocaleDateString('pt-BR')}): R$ ${fmt(overdueInvoices)}\n👉 Total devido: R$ ${fmt(totalDue)}`;
                    navigator.clipboard.writeText(text);
                    toast("Texto copiado para a área de transferência!");
                  }}
                >
                  Copiar Texto
                </Button>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed whitespace-pre-line">
                Conforme contrato vigente, o pedido de cancelamento realizado em <span className="font-bold text-slate-900 dark:text-slate-200">{new Date(downsellDate).toLocaleDateString('pt-BR')}</span> está sujeito à multa rescisória de <span className="font-bold text-slate-900 dark:text-slate-200">{penaltyPercent}%</span> sobre o saldo contratual remanescente, além da quitação das faturas já emitidas.
                {"\n\n"}
                Dessa forma, temos:
                {"\n\n"}
                Multa rescisória: <span className="font-bold text-slate-900 dark:text-slate-200">R$ {fmt(penaltyAmount)}</span>
                {"\n"}
                Fatura em aberto (venc. <span className="font-bold text-slate-900 dark:text-slate-200">{new Date(overdueDueDate).toLocaleDateString('pt-BR')}</span>): <span className="font-bold text-slate-900 dark:text-slate-200">R$ {fmt(overdueInvoices)}</span>
                {"\n"}
                <span className="text-sm">👉</span> <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">Total devido: R$ {fmt(totalDue)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
      )}

        {/* Sticky Action (Upsell) */}
        {activeTab === "upsell" && selectedPlans.size > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
            <Button
              onClick={() => setQuoteOpen(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-black px-10 h-16 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(79,70,229,0.5)] gap-3 border-4 border-white/20 backdrop-blur-md group animate-in fade-in slide-in-from-bottom-5 duration-500"
            >
              <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              GERAR ORÇAMENTO ({selectedPlans.size})
            </Button>
          </div>
        )}

        {/* Sticky Action (Downsell) */}
        {activeTab === "downsell" && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
            <Button
              onClick={() => setDownsellModalOpen(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-black px-10 h-16 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(79,70,229,0.5)] gap-3 border-4 border-white/20 backdrop-blur-md group animate-in fade-in slide-in-from-bottom-5 duration-500"
            >
              <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              GERAR EXTRATO DE DOWNSELL
            </Button>
          </div>
        )}
      </div>

      <QuoteModal open={quoteOpen} onOpenChange={setQuoteOpen} plans={getQuotePlans()} />
      <DownsellModal open={downsellModalOpen} onOpenChange={setDownsellModalOpen} data={{
        downsellPlanValue, contractStart, downsellDate, monthsUsed, contractDuration,
        contractTotal, valueUsed, remainingBalance, penaltyAmount, overdueInvoices, totalDue, penaltyPercent, overdueDueDate
      }} />
    </div>
  );
}
