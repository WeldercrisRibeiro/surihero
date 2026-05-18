import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "sonner";
import {
  Minus, Plus, FileText,
  Lightbulb, Zap, Calculator, Megaphone, Settings, AlertTriangle, Shield, Send
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

const PRICE_PER_INTERACTION = { essential: 0.53, pro: 0.66, advanced: 0.66 };
const IMPLANTACAO = 1890;
const MARKETING_PRICE_ADVANCED = 0.25;
const MARKETING_PRICE = 0.90;
const UTILITY_PRICE = 0.90;
const UTILITY_PRICE_ADVANCED = 0.25;
const MIN_INTERACTIONS = 1000;
const INTERACTION_STEP = 500;
const ADVANCED_INITIAL_INTERACTIONS = 5000;
const MAX_INTERACTIONS = 9999500;
const PLAN_FIXED_INTERACTIONS: Record<string, number> = {
  Essential: 1000,
  Pro: 1000,
  Advanced: 5000,
};
const MAX_INTERACTION_DIGITS = String(MAX_INTERACTIONS).length;
const ADVANCED_PROPOSAL_DISCOUNTS = {
  interaction: 0,
  receptive: 0,
  marketing: 0,
  utility: 0,
  authentication: 0,
};
const AUTHENTICATION_PRICE = 0.25;
const PLAN_PRESETS = {
  Essential: {
    interactions: PLAN_FIXED_INTERACTIONS.Essential,
    discountPercent: 0,
    setupDiscount: 100,
    excessDiscountPercent: 0,
    utilityDiscountPercent: 0,
    receptiveDiscountPercent: 0,
    authenticationDiscountPercent: 0,
  },
  Advanced: {
    interactions: PLAN_FIXED_INTERACTIONS.Advanced,
    discountPercent: ADVANCED_PROPOSAL_DISCOUNTS.interaction,
    setupDiscount: 100,
    excessDiscountPercent: ADVANCED_PROPOSAL_DISCOUNTS.marketing,
    utilityDiscountPercent: ADVANCED_PROPOSAL_DISCOUNTS.utility,
    receptiveDiscountPercent: ADVANCED_PROPOSAL_DISCOUNTS.receptive,
    authenticationDiscountPercent: ADVANCED_PROPOSAL_DISCOUNTS.authentication,
  },
  Pro: {
    interactions: PLAN_FIXED_INTERACTIONS.Pro,
    discountPercent: 0,
    setupDiscount: 100,
    excessDiscountPercent: 0,
    utilityDiscountPercent: 0,
    receptiveDiscountPercent: 0,
    authenticationDiscountPercent: 0,
  },
};
type PlanName = keyof typeof PLAN_PRESETS;

function cleanInteractionInput(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, MAX_INTERACTION_DIGITS);
}

function normalizeInteractions(value: number) {
  if (!Number.isFinite(value)) return MIN_INTERACTIONS;

  const clamped = Math.min(MAX_INTERACTIONS, Math.max(MIN_INTERACTIONS, value));
  return Math.ceil(clamped / INTERACTION_STEP) * INTERACTION_STEP;
}

function applyPercentDiscount(value: number, discount: number) {
  return value * (1 - discount / 100);
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtN(v: number) {
  return v.toLocaleString("pt-BR");
}

export default function PricingCalculator() {
  const [interactions, setInteractions] = useState(MIN_INTERACTIONS);
  const [interactionsInput, setInteractionsInput] = useState(String(MIN_INTERACTIONS));
  const [essPrice, setEssPrice] = useState(PRICE_PER_INTERACTION.essential);
  const [proPrice, setProPrice] = useState(PRICE_PER_INTERACTION.pro);
  const [advPrice, setAdvPrice] = useState(PRICE_PER_INTERACTION.advanced);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [setupPrice, setSetupPrice] = useState(IMPLANTACAO);
  const [setupDiscount, setSetupDiscount] = useState(100);
  const [excessDiscountPercent, setExcessDiscountPercent] = useState(0);
  const [utilityDiscountPercent, setUtilityDiscountPercent] = useState(0);
  const [receptiveDiscountPercent, setReceptiveDiscountPercent] = useState(0);
  const [authenticationDiscountPercent, setAuthenticationDiscountPercent] = useState(0);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [downsellModalOpen, setDownsellModalOpen] = useState(false);
  const [essMarketingPrice, setEssMarketingPrice] = useState(MARKETING_PRICE);
  const [essUtilityPrice, setEssUtilityPrice] = useState(UTILITY_PRICE);
  const [proMarketingPrice, setProMarketingPrice] = useState(MARKETING_PRICE);
  const [proUtilityPrice, setProUtilityPrice] = useState(UTILITY_PRICE);
  const [advReceptivePrice, setAdvReceptivePrice] = useState(0.25);
  const [advMarketingPrice, setAdvMarketingPrice] = useState(0.25);
  const [advUtilityPrice, setAdvUtilityPrice] = useState(0.25);
  const [advAuthenticationPrice, setAdvAuthenticationPrice] = useState(0.25);
  const [activeTab, setActiveTab] = useState<"nova-venda" | "upsell" | "downsell">("nova-venda");
  const controlsRef = useRef<HTMLDivElement>(null);
  const advancedProposalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);
  const dragStartX = useRef(0);
  const tabWidth = useRef(0);

  const handleTabTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDraggingTabs(true);
    dragStartX.current = e.touches[0].clientX;
    if (tabContainerRef.current) {
      tabWidth.current = tabContainerRef.current.getBoundingClientRect().width;
    }
  };

  const handleTabTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingTabs) return;
    const currentX = e.touches[0].clientX;
    const diffX = currentX - dragStartX.current;
    
    const maxOffset = tabWidth.current * 0.6666;
    const minOffset = -tabWidth.current * 0.6666;
    
    let clampedDiffX = diffX;
    if (activeTab === "nova-venda") {
      clampedDiffX = Math.max(0, diffX);
    } else if (activeTab === "downsell") {
      clampedDiffX = Math.min(0, diffX);
    }
    
    setDragOffset(Math.max(minOffset, Math.min(maxOffset, clampedDiffX)));
  };

  const handleTabTouchEnd = () => {
    if (!isDraggingTabs) return;
    setIsDraggingTabs(false);
    
    const threshold = tabWidth.current * 0.15;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Dragged right -> transition to next tab (Nova Venda -> Upsell -> Downsell)
        if (activeTab === "nova-venda") setActiveTab("upsell");
        else if (activeTab === "upsell") setActiveTab("downsell");
      } else {
        // Dragged left -> transition to previous tab (Downsell -> Upsell -> Nova Venda)
        if (activeTab === "downsell") setActiveTab("upsell");
        else if (activeTab === "upsell") setActiveTab("nova-venda");
      }
    }
    setDragOffset(0);
  };

  const handleTabMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingTabs(true);
    dragStartX.current = e.clientX;
    if (tabContainerRef.current) {
      tabWidth.current = tabContainerRef.current.getBoundingClientRect().width;
    }
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diffX = moveEvent.clientX - dragStartX.current;
      const maxOffset = tabWidth.current * 0.6666;
      const minOffset = -tabWidth.current * 0.6666;
      
      let clampedDiffX = diffX;
      if (activeTab === "nova-venda") {
        clampedDiffX = Math.max(0, diffX);
      } else if (activeTab === "downsell") {
        clampedDiffX = Math.min(0, diffX);
      }
      
      setDragOffset(Math.max(minOffset, Math.min(maxOffset, clampedDiffX)));
    };
    
    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsDraggingTabs(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      
      const finalDiffX = upEvent.clientX - dragStartX.current;
      const threshold = tabWidth.current * 0.15;
      
      let clampedDiffX = finalDiffX;
      if (activeTab === "nova-venda") {
        clampedDiffX = Math.max(0, finalDiffX);
      } else if (activeTab === "downsell") {
        clampedDiffX = Math.min(0, finalDiffX);
      }
      
      if (Math.abs(clampedDiffX) > threshold) {
        if (clampedDiffX > 0) {
          // Dragged right -> transition to next tab (Nova Venda -> Upsell -> Downsell)
          if (activeTab === "nova-venda") setActiveTab("upsell");
          else if (activeTab === "upsell") setActiveTab("downsell");
        } else {
          // Dragged left -> transition to previous tab (Downsell -> Upsell -> Nova Venda)
          if (activeTab === "downsell") setActiveTab("upsell");
          else if (activeTab === "upsell") setActiveTab("nova-venda");
        }
      }
      setDragOffset(0);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setSelectedPlans(new Set());
    setInteractions(MIN_INTERACTIONS);
    setInteractionsInput(String(MIN_INTERACTIONS));
    setDiscountPercent(0);
    setSetupDiscount(100);
    setExcessDiscountPercent(0);
    setUtilityDiscountPercent(0);
    setReceptiveDiscountPercent(0);
    setAuthenticationDiscountPercent(0);
  }, [activeTab]);

  useEffect(() => {
    setInteractionsInput(String(interactions));
  }, [interactions]);

  const commitInteractionsInput = (value = interactionsInput) => {
    const cleanedValue = cleanInteractionInput(value);
    const nextInteractions = normalizeInteractions(Number(cleanedValue));

    setInteractions(nextInteractions);
    setInteractionsInput(String(nextInteractions));
  };

  const changeInteractionsByStep = (direction: 1 | -1) => {
    const nextInteractions = normalizeInteractions(interactions + direction * INTERACTION_STEP);

    setInteractions(nextInteractions);
    setInteractionsInput(String(nextInteractions));
  };

  const handleInteractionsInputChange = (value: string) => {
    const nextInput = cleanInteractionInput(value);

    if (!nextInput) {
      setInteractionsInput("");
      return;
    }

    const typedInteractions = Number(nextInput);

    if (typedInteractions > MAX_INTERACTIONS) {
      setInteractions(MAX_INTERACTIONS);
      setInteractionsInput(String(MAX_INTERACTIONS));
      return;
    }

    setInteractionsInput(nextInput);

    if (typedInteractions >= MIN_INTERACTIONS && typedInteractions % INTERACTION_STEP === 0) {
      setInteractions(typedInteractions);
    }
  };

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

  const applyPlanPreset = (plan: PlanName) => {
    const preset = PLAN_PRESETS[plan];
    const nextInteractions = normalizeInteractions(preset.interactions);

    setInteractions(nextInteractions);
    setInteractionsInput(String(nextInteractions));
    setEssPrice(PRICE_PER_INTERACTION.essential);
    setAdvPrice(PRICE_PER_INTERACTION.advanced);
    setProPrice(PRICE_PER_INTERACTION.pro);
    setSetupPrice(IMPLANTACAO);
    setEssMarketingPrice(MARKETING_PRICE);
    setEssUtilityPrice(UTILITY_PRICE);
    setProMarketingPrice(MARKETING_PRICE);
    setProUtilityPrice(UTILITY_PRICE);
    setAdvReceptivePrice(0.25);
    setAdvMarketingPrice(0.25);
    setAdvUtilityPrice(0.25);
    setAdvAuthenticationPrice(0.25);
    setDiscountPercent(preset.discountPercent);
    setSetupDiscount(preset.setupDiscount);
    setExcessDiscountPercent(preset.excessDiscountPercent);
    setUtilityDiscountPercent(preset.utilityDiscountPercent);
    setReceptiveDiscountPercent(preset.receptiveDiscountPercent);
    setAuthenticationDiscountPercent(preset.authenticationDiscountPercent);
  };

  const getFallbackPresetPlan = (plans: Set<string>): PlanName | null => {
    if (plans.has("Advanced")) return "Advanced";
    if (plans.has("Pro")) return "Pro";
    if (plans.has("Essential")) return "Essential";
    return null;
  };

  const togglePlan = (plan: PlanName) => {
    const isSelected = selectedPlans.has(plan) && selectedPlans.size === 1;

    if (isSelected) {
      setSelectedPlans(new Set());
      return;
    }

    const next = new Set<string>([plan]);
    applyPlanPreset(plan);
    setSelectedPlans(next);

    setTimeout(() => {
      const scrollTarget = plan === "Advanced" ? advancedProposalRef.current : controlsRef.current;
      scrollTarget?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  };

  const getQuotePlans = (): QuoteData[] => {
    const plans: QuoteData[] = [];
    if (selectedPlans.has("Essential")) {
      plans.push({
        plan: "Essential", interactions, interactionPrice: essPrice,
        basePrice: calc.essential.base, finalPrice: calc.essential.final,
        discount: calc.essential.discount, hasDiscount: discountPercent > 0,
        discountPercent,
        implantacao: calc.implantacao.final,
        implantacaoBase: calc.implantacao.base,
        implantacaoDiscount: calc.implantacao.discount,
        marketingPrice: essMarketingPrice, utilityPrice: essUtilityPrice,
        excessDiscountPercent, utilityDiscountPercent,
        suriShopCommission: ""
      });
    }
    if (selectedPlans.has("Advanced")) {
      plans.push({
        plan: "Advanced", interactions, interactionPrice: advPrice,
        basePrice: calc.advanced.base, finalPrice: calc.advanced.final,
        discount: calc.advanced.discount, hasDiscount: discountPercent > 0,
        discountPercent,
        implantacao: calc.implantacao.final,
        implantacaoBase: calc.implantacao.base,
        implantacaoDiscount: calc.implantacao.discount,
        marketingPrice: advMarketingPrice, utilityPrice: advUtilityPrice,
        receptivePrice: advReceptivePrice, authenticationPrice: advAuthenticationPrice,
        excessDiscountPercent, utilityDiscountPercent,
        receptiveDiscountPercent, authenticationDiscountPercent,
        suriShopCommission: ""
      });
    }
    if (selectedPlans.has("Pro")) {
      plans.push({
        plan: "Pro", interactions, interactionPrice: proPrice,
        basePrice: calc.pro.base, finalPrice: calc.pro.final,
        discount: calc.pro.discount, hasDiscount: discountPercent > 0,
        discountPercent,
        implantacao: calc.implantacao.final,
        implantacaoBase: calc.implantacao.base,
        implantacaoDiscount: calc.implantacao.discount,
        marketingPrice: proMarketingPrice, utilityPrice: proUtilityPrice,
        excessDiscountPercent, utilityDiscountPercent,
        suriShopCommission: ""
      });
    }
    return plans;
  };

  const calc = useMemo(() => {
    const isEssSelected = selectedPlans.has("Essential");
    const isProSelected = selectedPlans.has("Pro");
    const isAdvSelected = selectedPlans.has("Advanced");

    const essFixedInt = isEssSelected ? interactions : PLAN_FIXED_INTERACTIONS.Essential;
    const proFixedInt = isProSelected ? interactions : PLAN_FIXED_INTERACTIONS.Pro;
    const advFixedInt = isAdvSelected ? interactions : PLAN_FIXED_INTERACTIONS.Advanced;

    const essBase = essFixedInt * essPrice;
    const proBase = proFixedInt * proPrice;
    const advBase = advFixedInt * advPrice;

    const essFinal = isEssSelected ? essBase * (1 - discountPercent / 100) : essBase;
    const proFinal = isProSelected ? proBase * (1 - discountPercent / 100) : proBase;
    const advFinal = isAdvSelected ? advBase * (1 - discountPercent / 100) : advBase;

    const setupFinal = Math.max(0, setupPrice * (1 - setupDiscount / 100));

    return {
      essential: { base: essBase, final: essFinal, discount: essBase - essFinal },
      pro: { base: proBase, final: proFinal, discount: proBase - proFinal },
      advanced: { base: advBase, final: advFinal, discount: advBase - advFinal },
      implantacao: { base: setupPrice, final: setupFinal, discount: setupPrice - setupFinal }
    };
  }, [interactions, essPrice, proPrice, advPrice, discountPercent, setupPrice, setupDiscount, selectedPlans]);

  const isTotalZero = useMemo(() => {
    if (selectedPlans.size === 0) return true;
    let total = 0;
    if (selectedPlans.has("Essential")) total += calc.essential.final + calc.implantacao.final;
    if (selectedPlans.has("Advanced")) total += calc.advanced.final + calc.implantacao.final;
    if (selectedPlans.has("Pro")) total += calc.pro.final + calc.implantacao.final;
    return total <= 0;
  }, [selectedPlans, calc]);

  const selectedPlanPriceFields = [
    { plan: "Essential", label: "Interação Essential (R$)", value: essPrice, setter: setEssPrice },
    { plan: "Advanced", label: "Interação Advanced (R$)", value: advPrice, setter: setAdvPrice },
    { plan: "Pro", label: "Interação Pro (R$)", value: proPrice, setter: setProPrice },
  ].filter((field) => selectedPlans.has(field.plan));

  const pricingAdjustFields = [
    ...selectedPlanPriceFields,
    {
      label: "Implantação (R$)",
      value: setupPrice,
      setter: setSetupPrice,
      color: "bg-primary-50 dark:bg-primary-900/20",
      inputColor: "text-primary-600 dark:text-primary-400",
    },
    ...(selectedPlans.has("Advanced") ? [
      { label: "Contato receptivo adicional (R$)", value: advReceptivePrice, setter: setAdvReceptivePrice, isExcess: true, type: "receptive" },
      { label: "Msg. ativa de marketing adicional (R$)", value: advMarketingPrice, setter: setAdvMarketingPrice, isExcess: true, type: "marketing" },
      { label: "Msg. ativa de utilidade adicional (R$)", value: advUtilityPrice, setter: setAdvUtilityPrice, isExcess: true, type: "utility" },
      { label: "Msg. ativa de autenticação adicional (R$)", value: advAuthenticationPrice, setter: setAdvAuthenticationPrice, isExcess: true, type: "authentication" },
    ] : selectedPlans.has("Pro") ? [
      { label: "Mensagens de Marketing (R$)", value: proMarketingPrice, setter: setProMarketingPrice, isExcess: true, type: "marketing" },
      { label: "Mensagens Excedentes (R$)", value: proUtilityPrice, setter: setProUtilityPrice, isExcess: true, type: "utility" },
    ] : [
      { label: "Mensagens de Marketing (R$)", value: essMarketingPrice, setter: setEssMarketingPrice, isExcess: true, type: "marketing" },
      { label: "Mensagens Excedentes (R$)", value: essUtilityPrice, setter: setEssUtilityPrice, isExcess: true, type: "utility" },
    ]),
  ];

  const advancedProposalRows = [
    { label: "Implantação", value: setupPrice, discount: setupDiscount },
    { label: "Preço da interação", value: advPrice, discount: discountPercent },
    { label: "Contato receptivo adicional", value: advReceptivePrice, discount: receptiveDiscountPercent },
    { label: "Msg. ativa de marketing adicional", value: advMarketingPrice, discount: excessDiscountPercent },
    { label: "Msg. ativa de utilidade adicional", value: advUtilityPrice, discount: utilityDiscountPercent },
    { label: "Msg. ativa de autenticação adicional", value: advAuthenticationPrice, discount: authenticationDiscountPercent },
  ];

  const advancedBaseTotal = interactions * advPrice;
  const advancedDiscountedTotal = interactions * applyPercentDiscount(advPrice, discountPercent);

  const renderVendaUpsellFlow = (flowType: "nova-venda" | "upsell") => {
    const isCurrentActive = activeTab === flowType;
    const hasSelection = isCurrentActive && selectedPlans.size > 0;

    return (
      <div className="space-y-8 pb-32">
        <div className="text-center mb-10 mt-6 animate-in zoom-in-95 duration-500">
          <div className="inline-flex flex-col items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl px-8 py-5 rounded-3xl">
            <h2 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">
              {flowType === "nova-venda" ? "Nova Venda" : "Upsell"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
              {flowType === "nova-venda" 
                ? "Selecione um plano para fazer a simulação de preços para o seu novo cliente." 
                : "Selecione o novo plano do cliente para calcular a alteração e o orçamento de Upsell."}
            </p>
          </div>
        </div>

        {/* Seletor de Planos */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8 items-stretch">
          {/* Essential Plan Card */}
          <Card
            onClick={() => isCurrentActive && togglePlan("Essential")}
            className={`group h-full p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[22rem]
              bg-white dark:bg-[#000f9b] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_-12px_rgba(0,15,155,0.4)]
              ${isCurrentActive && selectedPlans.has("Essential") ? "border-primary-500 ring-4 ring-primary-500/20 dark:ring-primary-500/50" : "border-transparent"}
              hover:scale-[1.02] active:scale-95 duration-300
            `}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-500/20 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCurrentActive && selectedPlans.has("Essential") ? "border-primary bg-primary" : "border-slate-200 dark:border-white/20"}`}>
                  {isCurrentActive && selectedPlans.has("Essential") && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Essential</h2>
              <span className="inline-flex items-center gap-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-2"><Zap className="w-3 h-3" />{isCurrentActive && selectedPlans.has("Essential") ? fmtN(interactions) : "1.000"} interações</span>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mb-8 uppercase tracking-widest">Ideal para começar</p>

              <div className="items-baseline flex gap-1 mb-8">
                <span className="text-slate-400 dark:text-slate-500 font-bold text-lg">R$</span>
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{fmt(calc.essential.final)}</span>
                <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">/mês</span>
              </div>
              {calc.essential.discount > 0 && (
                <div className="bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-900/40 inline-flex items-center gap-1.5 mb-6">
                  <Zap className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Economia de R$ {fmt(calc.essential.discount)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-black text-primary-500 uppercase tracking-widest">
                <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center text-white"><Plus className="w-3 h-3" /></div>
                Implantação
              </div>
              <span className="text-primary-500 font-black italic">
                {calc.implantacao.final === 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="line-through opacity-30 text-[8px] text-slate-400">R$ 1.500,00</span>
                    <span>R$ 0,00</span>
                  </span>
                ) : (
                  `R$ ${fmt(calc.implantacao.final)}`
                )}
              </span>
            </div>
          </Card>

          {/* Advanced Plan Card */}
          <Card
            onClick={() => isCurrentActive && togglePlan("Advanced")}
            className={`group h-full p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[22rem]
              bg-[#020519] shadow-[0_20px_50px_-12px_rgba(2,5,25,0.4)]
              ${isCurrentActive && selectedPlans.has("Advanced") ? "border-white ring-4 ring-white/20" : "border-white/10"}
              hover:scale-[1.02] active:scale-95 duration-300
            `}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCurrentActive && selectedPlans.has("Advanced") ? "border-white bg-white" : "border-white/40"}`}>
                  {isCurrentActive && selectedPlans.has("Advanced") && <div className="w-2 h-2 rounded-full bg-[#020519]" />}
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Advanced</h2>
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-2"><Zap className="w-3 h-3" />{isCurrentActive && selectedPlans.has("Advanced") ? fmtN(interactions) : "5.000"} interações</span>
              <p className="text-white/40 text-xs font-medium mb-8 uppercase tracking-widest">O mais adaptado para sua empresa</p>

              <div className="items-baseline flex gap-1 mb-8">
                <span className="text-white/60 font-bold text-lg">R$</span>
                <span className="text-5xl font-black text-white tracking-tighter">{fmt(calc.advanced.final)}</span>
                <span className="text-white/60 font-bold text-sm">/mês</span>
              </div>
              {calc.advanced.discount > 0 && (
                <div className="bg-white/20 px-3 py-1.5 rounded-xl border border-white/10 inline-flex items-center gap-1.5 mb-6">
                  <Zap className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">
                    Economia de R$ {fmt(calc.advanced.discount)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[#020519]"><Plus className="w-3 h-3" /></div>
                Implantação
              </div>
              <span className="text-white font-black italic">
                {calc.implantacao.final === 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="line-through opacity-30 text-[8px]">R$ 1.500,00</span>
                    <span>R$ 0,00</span>
                  </span>
                ) : (
                  `R$ ${fmt(calc.implantacao.final)}`
                )}
              </span>
            </div>
          </Card>

          {/* Pro Plan Card */}
          <Card
            onClick={() => isCurrentActive && togglePlan("Pro")}
            className={`group h-full p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between duration-500 min-h-[22rem]
              bg-[#000f9b] dark:bg-white border-transparent shadow-[0_20px_50px_-12px_rgba(0,15,155,0.4)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]
              ${isCurrentActive && selectedPlans.has("Pro") ? "border-primary-500 ring-4 ring-primary-500/50 dark:ring-primary-500/20" : "border-transparent"}
              hover:scale-[1.02] active:scale-95
            `}
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20 dark:bg-[#000f9b] text-white dark:text-white">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCurrentActive && selectedPlans.has("Pro") ? 'border-white dark:border-primary bg-white dark:bg-primary' : 'border-white/20 dark:border-slate-200'}`}>
                  {isCurrentActive && selectedPlans.has("Pro") && <div className="w-2 h-2 rounded-full bg-[#000f9b] dark:bg-white" />}
                </div>
              </div>
              <h2 className="text-2xl font-black text-white dark:text-slate-900 mb-1">Pro</h2>
              <span className="inline-flex items-center gap-1 bg-white/20 dark:bg-primary-50 text-white dark:text-primary-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-2"><Zap className="w-3 h-3" />{isCurrentActive && selectedPlans.has("Pro") ? fmtN(interactions) : "1.000"} interações</span>
              <p className="text-xs font-medium mb-8 uppercase tracking-widest text-slate-400">Para alta performance</p>

              <div className="items-baseline flex gap-1 mb-8">
                <span className="font-bold text-lg text-primary/40 dark:text-slate-400">R$</span>
                <span className="text-5xl font-black tracking-tighter text-white dark:text-slate-900">{fmt(calc.pro.final)}</span>
                <span className="font-bold text-sm opacity-50 text-white dark:text-slate-500">/mês</span>
              </div>
              {calc.pro.discount > 0 && (
                <div className="bg-orange-500/10 dark:bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-500/20 dark:border-orange-100 inline-flex items-center gap-1.5 mb-6">
                  <Zap className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-wider">
                    Economia de R$ {fmt(calc.pro.discount)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 dark:border-slate-100 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white dark:text-slate-900">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[#000f9b] bg-white dark:bg-[#000f9b] dark:text-white"><Plus className="w-3 h-3" /></div>
                Implantação
              </div>
              <span className="font-black italic text-white dark:text-slate-900">
                {calc.implantacao.final === 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="line-through opacity-30 dark:opacity-20 text-[8px]">R$ 1.500,00</span>
                    <span>R$ 0,00</span>
                  </span>
                ) : (
                  `R$ ${fmt(calc.implantacao.final)}`
                )}
              </span>
            </div>
          </Card>
        </div>

        {/* Aviso de Fidelidade */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">Plano de Fidelidade de 12 Meses</h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-400/80 font-medium leading-relaxed">
                Todos os planos possuem fidelidade de <span className="font-black">12 meses</span>. Esta condição se aplica tanto para <span className="font-black">novos contratos</span> quanto para <span className="font-black">mudanças de plano</span> em contratos vigentes.
              </p>
            </div>
          </div>
        </div>

        {/* Controls block */}
        {hasSelection && (
          <div ref={controlsRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Interaction Control Card */}
              <Card className="h-full p-8 rounded-[2.5rem] border-none glass-card dark:bg-slate-900/40 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Interações / Mês</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Configure o volume de conversas</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mb-4">
                  <button
                    onClick={() => changeInteractionsByStep(-1)}
                    className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all border border-primary-100/50 dark:border-primary-500/20"
                  >
                    <Minus className="w-6 h-6" />
                  </button>

                  <div className="flex-1 bg-white dark:bg-slate-800/50 rounded-2xl h-14 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner px-4">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={MAX_INTERACTION_DIGITS}
                      value={interactionsInput}
                      onChange={(e) => handleInteractionsInputChange(e.target.value)}
                      onBlur={() => commitInteractionsInput()}
                      onFocus={(e) => e.currentTarget.select()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                      }}
                      className="border-none bg-transparent text-center text-xl sm:text-2xl font-black tabular-nums text-slate-900 dark:text-white focus-visible:ring-0 shadow-none h-full w-full min-w-0 font-sans [appearance:textfield]" />
                  </div>

                  <button
                    onClick={() => changeInteractionsByStep(1)}
                    className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all border border-primary-100/50 dark:border-primary-500/20"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-center text-[10px] text-slate-400 font-bold mb-10 italic">
                  Mínimo: 1.000 • Incrementos de 500
                </p>

                <div className={`grid grid-cols-1 gap-4 ${selectedPlans.has("Advanced") ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                  <div className="p-4 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                        <Lightbulb className="w-4 h-4 text-primary-500" />
                      </div>
                      <Label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase leading-none">Desc. Mensal (%)</Label>
                    </div>
                    <div className="relative">
                      <Select value={String(discountPercent)} onValueChange={(v) => setDiscountPercent(Number(v))}>
                        <SelectTrigger className="h-10 border-none bg-primary-50/30 dark:bg-slate-900/40 font-black text-slate-700 dark:text-white rounded-xl">
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
                      <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary-500" />
                      </div>
                      <Label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase leading-none">Desc. Implantação (%)</Label>
                    </div>
                    <div className="relative">
                      <Input
                        type="number" min={0} max={100} value={setupDiscount || ""} placeholder="0"
                        onChange={(e) => setSetupDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="h-10 border-none bg-primary-50/30 dark:bg-slate-900/40 font-black text-primary-600 dark:text-primary-400 rounded-xl text-center" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-300 text-xs font-black">%</div>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                        <Send className="w-4 h-4 text-green-500" />
                      </div>
                      <Label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase leading-none">{selectedPlans.has("Advanced") ? "Desc. Exc. Marketing (%)" : "Desc. Excedentes (%)"}</Label>
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

                  {selectedPlans.has("Advanced") && (
                    <>
                      <div className="p-4 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-orange-500" />
                          </div>
                          <Label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase leading-none">Desc. Receptivo (%)</Label>
                        </div>
                        <div className="relative">
                          <Select value={String(receptiveDiscountPercent)} onValueChange={(v) => setReceptiveDiscountPercent(Number(v))}>
                            <SelectTrigger className="h-10 border-none bg-orange-50/30 dark:bg-orange-900/20 font-black text-orange-600 dark:text-orange-400 rounded-xl">
                              <SelectValue placeholder="0%" />
                            </SelectTrigger>
                            <SelectContent>
                              {[0, 5, 10, 15, 20, 25, 30, 40, 50, 65].map(v => (
                                <SelectItem key={v} value={String(v)}>{v}%</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-4 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                            <Send className="w-4 h-4 text-blue-500" />
                          </div>
                          <Label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase leading-none">Desc. Exc. Utilidades (%)</Label>
                        </div>
                        <div className="relative">
                          <Select value={String(utilityDiscountPercent)} onValueChange={(v) => setUtilityDiscountPercent(Number(v))}>
                            <SelectTrigger className="h-10 border-none bg-blue-50/30 dark:bg-blue-900/20 font-black text-blue-600 dark:text-blue-400 rounded-xl">
                              <SelectValue placeholder="0%" />
                            </SelectTrigger>
                            <SelectContent>
                              {[0, 5, 10, 15, 20, 25, 80].map(v => (
                                <SelectItem key={v} value={String(v)}>{v}%</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-4 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-purple-500" />
                          </div>
                          <Label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase leading-none">Desc. Autentic. (%)</Label>
                        </div>
                        <div className="relative">
                          <Select value={String(authenticationDiscountPercent)} onValueChange={(v) => setAuthenticationDiscountPercent(Number(v))}>
                            <SelectTrigger className="h-10 border-none bg-purple-50/30 dark:bg-purple-900/20 font-black text-purple-600 dark:text-purple-400 rounded-xl">
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
                    </>
                  )}
                </div>
              </Card>

              {/* Pricing Adjust Table Card */}
              <Card className="h-full p-8 rounded-[2.5rem] border-none glass-card dark:bg-slate-900/40">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="text-slate-600 dark:text-slate-400 font-black">$</span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Ajuste de Preços</h3>
                  <span className="ml-auto text-slate-300 dark:text-white/10"><Calculator className="w-12 h-12" /></span>
                </div>

                <div className="space-y-2">
                  {pricingAdjustFields.map((f: any, i: number) => {
                    const discountToUse = f.type === "utility" ? utilityDiscountPercent : f.type === "receptive" ? receptiveDiscountPercent : f.type === "authentication" ? authenticationDiscountPercent : excessDiscountPercent;
                    return (
                      <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${f.color || "bg-slate-50/70 dark:bg-slate-800/40"} border border-transparent transition-all hover:border-slate-200 dark:hover:border-slate-700`}>
                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">{f.label}</Label>
                        <div className="flex items-center gap-2">
                          {f.isExcess && discountToUse > 0 && (
                            <span className="text-xs font-bold text-green-500 mr-2 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-md">
                              R$ {fmt(f.value * (1 - discountToUse / 100))}
                            </span>
                          )}
                          <Input
                            type="number" step="0.01" value={f.value}
                            readOnly={f.readOnly}
                            onChange={e => !f.readOnly && f.setter(Number(e.target.value))}
                            className={`h-8 w-24 text-right font-black text-sm border-none bg-transparent shadow-none focus-visible:ring-0 ${f.inputColor || "text-slate-900 dark:text-slate-200"} ${f.isExcess && discountToUse > 0 ? "opacity-50 line-through" : ""}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Advanced Commercial Proposal */}
            {selectedPlans.has("Advanced") && (
              <div ref={advancedProposalRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-8 rounded-[2.5rem] border-none glass-card dark:bg-slate-900/40">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">Proposta Comercial Advanced</h3>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Detalhamento dos custos contratados</p>
                    </div>
                  </div>

                  <div className="mb-6 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Volume de Interações base</p>
                      <p className="text-lg font-black text-primary-600 dark:text-primary-400">{fmtN(interactions)} interações</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-white/75 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-700">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sem desconto</p>
                        <p className="text-base font-black text-slate-900 dark:text-white">R$ {fmt(advancedBaseTotal)}</p>
                      </div>
                      <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 p-3 border border-green-100 dark:border-green-900/40">
                        <p className="text-[9px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 mb-1">Com desconto</p>
                        <p className="text-base font-black text-green-600 dark:text-green-400">R$ {fmt(advancedDiscountedTotal)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {advancedProposalRows.map((row) => {
                      const finalValue = applyPercentDiscount(row.value, row.discount);

                      return (
                        <div key={row.label} className="rounded-2xl bg-white/75 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 px-3 py-2.5 min-w-0">
                          <p className="min-h-8 text-[9px] font-black text-slate-500 dark:text-slate-300 leading-tight">{row.label}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-900 dark:text-slate-100">R$ {fmt(row.value)}</span>
                            <span className="rounded-lg bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 text-[9px] font-black text-primary-600 dark:text-primary-400 border border-slate-100 dark:border-slate-700">{row.discount}%</span>
                            <span className="text-[10px] font-black text-green-600 dark:text-green-400">R$ {fmt(finalValue)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto pt-4 pb-40 px-4 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">

        {/* HEADER MOVED TO PORTAL */}
        {portalNode && createPortal(
          <div className="flex w-full items-center justify-between gap-2 min-w-0">
            {/* Título — oculto em mobile, visível em sm+ */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-white dark:bg-slate-900 rounded-lg shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-800">
                <Calculator className="w-3.5 h-3.5 text-primary-600" />
              </div>
              <h1 className="text-sm font-black italic tracking-tighter text-primary-900 dark:text-primary-400 whitespace-nowrap">
                Suri Calcs
              </h1>
            </div>

            {/* Submódulos Selector */}
            <div 
              ref={tabContainerRef}
              onTouchStart={handleTabTouchStart}
              onTouchMove={handleTabTouchMove}
              onTouchEnd={handleTabTouchEnd}
              onMouseDown={handleTabMouseDown}
              className="relative flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-full shadow-inner border border-slate-200/50 dark:border-slate-700/50 select-none cursor-pointer overflow-hidden w-[280px] xs:w-[310px] sm:w-[390px] h-9"
            >
              {/* Sliding Pill */}
              <div 
                className="absolute top-0.5 bottom-0.5 rounded-full bg-white dark:bg-slate-900 shadow-sm"
                style={{
                  left: `calc(${(activeTab === "nova-venda" ? 0 : activeTab === "upsell" ? 1 : 2) * 33.3333}% + 2px)`,
                  width: 'calc(33.3333% - 4px)',
                  transition: isDraggingTabs ? 'none' : 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isDraggingTabs ? `translate3d(${dragOffset}px, 0, 0)` : 'none'
                }}
              />

              <button
                onClick={() => !isDraggingTabs && setActiveTab("nova-venda")}
                className={`relative z-10 w-1/3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight transition-all whitespace-nowrap text-center ${
                  activeTab === "nova-venda"
                    ? "text-primary-600 dark:text-primary-400 font-extrabold"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
                }`}
              >
                Nova Venda
              </button>
              <button
                onClick={() => !isDraggingTabs && setActiveTab("upsell")}
                className={`relative z-10 w-1/3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight transition-all whitespace-nowrap text-center ${
                  activeTab === "upsell"
                    ? "text-primary-600 dark:text-primary-400 font-extrabold"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
                }`}
              >
                Upsell
              </button>
              <button
                onClick={() => !isDraggingTabs && setActiveTab("downsell")}
                className={`relative z-10 w-1/3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight transition-all whitespace-nowrap text-center ${
                  activeTab === "downsell"
                    ? "text-primary-600 dark:text-primary-400 font-extrabold"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
                }`}
              >
                <span className="sm:hidden">Downsell</span>
                <span className="hidden sm:inline">Downsell / Multa</span>
              </button>
            </div>
          </div>,
          portalNode
        )}

        <div 
          className="w-full overflow-hidden"
        >
          <div 
            className="flex transition-transform duration-500 ease-out items-start" 
            style={{ 
              transform: `translate3d(-${activeTab === "nova-venda" ? 0 : activeTab === "upsell" ? 33.3333 : 66.6666}%, 0, 0)`,
              width: '300%'
            }}
          >
            {/* Slide 1: Nova Venda */}
            <div className="w-1/3 shrink-0 px-2">
              {renderVendaUpsellFlow("nova-venda")}
            </div>

            {/* Slide 2: Upsell */}
            <div className="w-1/3 shrink-0 px-2">
              {renderVendaUpsellFlow("upsell")}
            </div>

            {/* Slide 3: Downsell / Multa */}
            <div className="w-1/3 shrink-0 px-2">
              <div className="animate-in fade-in duration-500">
                {/* Downsell / Penalty Calculator */}
                <div className="max-w-4xl mx-auto mb-12">
                  <Card className="p-8 rounded-[2.5rem] border-none glass-card bg-white dark:bg-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                        <Calculator className="w-5 h-5 text-primary-600 dark:text-primary-400" />
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
                            <div className="flex bg-white dark:bg-white/10 rounded-2xl h-12 items-center border border-slate-100 dark:border-white/5 px-4">
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
                            <div className="flex bg-white dark:bg-white/10 rounded-2xl h-12 items-center border border-slate-100 dark:border-white/5 px-4">
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
                            <div className="flex bg-white dark:bg-white/10 rounded-2xl h-12 items-center border border-slate-100 dark:border-white/5 px-4">
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
                            <div className="flex bg-white dark:bg-white/10 rounded-2xl h-12 items-center border border-slate-100 dark:border-white/5 px-4">
                              <Input
                                type="number"
                                value={penaltyPercent}
                                onChange={(e) => setPenaltyPercent(Number(e.target.value))}
                                className="bg-transparent border-0 text-slate-900 dark:text-white font-bold h-full focus-visible:ring-0 p-0 text-lg text-primary-600 dark:text-primary-400"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator className="my-2 opacity-50" />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Início Contrato</Label>
                            <div className="flex bg-white dark:bg-white/10 rounded-2xl h-12 items-center border border-slate-100 dark:border-white/5 px-4">
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
                            <div className="flex bg-white dark:bg-white/10 rounded-2xl h-12 items-center border border-slate-100 dark:border-white/5 px-4">
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
                            <div className="flex bg-white dark:bg-white/10 rounded-2xl h-12 items-center border border-slate-100 dark:border-white/5 px-4">
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
                            <div className="flex bg-white dark:bg-white/10 rounded-2xl h-12 items-center border border-slate-100 dark:border-white/5 px-4">
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
                      <div className="bg-primary-50 dark:bg-primary-900/10 rounded-3xl p-6 border border-primary-100 dark:border-primary-800/50 flex flex-col justify-center">
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
                          <div className="pt-4 border-t border-primary-200 dark:border-primary-800/50 flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Total devido</span>
                            <span className="text-2xl font-black text-primary-600 dark:text-primary-400">R$ {fmt(totalDue)}</span>
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
                          className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
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
                        <span className="text-sm">👉</span> <span className="text-sm font-black text-primary-600 dark:text-primary-400">Total devido: R$ {fmt(totalDue)}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action (Upsell) */}
      {(activeTab === "nova-venda" || activeTab === "upsell") && selectedPlans.size > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <Button
            onClick={() => {
              if (isTotalZero) {
                toast.error("O valor total do orçamento não pode ser R$ 0,00");
                return;
              }
              setQuoteOpen(true);
            }}
            disabled={isTotalZero}
            className={`${isTotalZero ? 'opacity-50 cursor-not-allowed grayscale' : ''} bg-primary text-white font-black px-10 h-16 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,84,255,0.5)] gap-3 border-4 border-white/20 backdrop-blur-md group animate-in fade-in slide-in-from-bottom-5 duration-500`}
          >
            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            GERAR ORÇAMENTO
          </Button>
        </div>
      )}

      {/* Sticky Action (Downsell) */}
      {activeTab === "downsell" && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <Button
            onClick={() => setDownsellModalOpen(true)}
            className="bg-primary text-white font-black px-10 h-16 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,84,255,0.5)] gap-3 border-4 border-white/20 backdrop-blur-md group animate-in fade-in slide-in-from-bottom-5 duration-500"
          >
            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            GERAR EXTRATO DE DOWNSELL
          </Button>
        </div>
      )}

      <QuoteModal open={quoteOpen} onOpenChange={setQuoteOpen} plans={getQuotePlans()} type={activeTab === "nova-venda" ? "nova-venda" : "upsell"} />
      <DownsellModal open={downsellModalOpen} onOpenChange={setDownsellModalOpen} data={{
        downsellPlanValue, contractStart, downsellDate, monthsUsed, contractDuration,
        contractTotal, valueUsed, remainingBalance, penaltyAmount, overdueInvoices, totalDue, penaltyPercent, overdueDueDate
      }} />
    </div>
  );
}
