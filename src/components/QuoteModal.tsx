import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, Clock, Wallet, ArrowUpRight, Megaphone, Settings, MessageCircle, FileText, Building2, User, Phone, ExternalLink, UserCheck, Layout, Download, Zap, Mail, ShoppingBag } from "lucide-react";
import PricingInfo from "./PricingInfo";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtN(v: number) {
  return v.toLocaleString("pt-BR");
}

export interface QuoteData {
  plan: string;
  interactions: number;
  interactionPrice: number;
  basePrice: number;
  finalPrice: number;
  discount: number;
  hasDiscount: boolean;
  discountPercent: number;
  implantacao: number;
  implantacaoBase: number;
  implantacaoDiscount: number;
  marketingPrice: number;
  utilityPrice: number;
  excessDiscountPercent: number;
  suriShopCommission: string;
}

interface QuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: QuoteData[];
}

const ACCENT = "#4a54ff";
const CYAN = "#4a54ff";
const GRAY = "#64748b";

const STORES = [
  "Loja - Suri", "Loja - Mercadapp", "Loja - Shopify", "Loja - Lexos by Totvs", "Loja - VTEX", "Loja - Neomode"
];

const PLAN_NAMES = ["Essential", "Advanced", "PRO"];

function StoreIntegrations() {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 24, overflow: "hidden", backgroundColor: "white" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
        <thead>
          <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 800, color: "#1e293b" }}>Integração</th>
            {PLAN_NAMES.map(p => (
              <th key={p} style={{ padding: "12px 8px", fontWeight: 800, color: "#1e293b", textTransform: "uppercase", textAlign: "center" }}>{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STORES.map((store, idx) => (
            <tr key={store} style={{ borderBottom: idx === STORES.length - 1 ? "none" : "1px solid #f1f5f9" }}>
              <td style={{ padding: "10px 16px", color: "#475569", fontWeight: 500 }}>{store}</td>
              {PLAN_NAMES.map(p => (
                <td key={p} style={{ textAlign: "center", padding: "10px 8px" }}>
                  <div style={{
                    margin: "0 auto", width: 14, height: 14, border: "2px solid #1e293b", borderRadius: 4,
                    display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white"
                  }}>
                    <Check style={{ width: 10, height: 10, color: "#1e293b", strokeWidth: 4 }} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlanCard({ d }: { d: QuoteData }) {
  const hasExcessDiscount = d.excessDiscountPercent > 0;
  const mktPrice = hasExcessDiscount ? d.marketingPrice * (1 - d.excessDiscountPercent / 100) : d.marketingPrice;
  const utlPrice = hasExcessDiscount ? d.utilityPrice * (1 - d.excessDiscountPercent / 100) : d.utilityPrice;

  const items = [
    { icon: <MessageCircle style={{ width: 16, height: 16, color: CYAN }} />, label: "Interações", value: fmtN(d.interactions) },
    { icon: <Clock style={{ width: 16, height: 16, color: CYAN }} />, label: "Preço/Interação", value: `R$ ${fmt(d.interactionPrice)}` },
    { icon: <Wallet style={{ width: 16, height: 16, color: CYAN }} />, label: "Valor base", value: `R$ ${fmt(d.basePrice)}` },
    {
      icon: <ArrowUpRight style={{ width: 16, height: 16, color: CYAN }} />,
      label: "Implantação",
      value: d.implantacaoDiscount > 0 ? (
        <>
          <span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: 6 }}>R$ {fmt(d.implantacaoBase)}</span>
          <span style={{ color: '#16a34a' }}>R$ {fmt(d.implantacao)}</span>
        </>
      ) : `R$ ${fmt(d.implantacao)}`
    },
    { icon: <Megaphone style={{ width: 16, height: 16, color: CYAN }} />, label: "Marketing (Excedentes)", value: hasExcessDiscount ? <><span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: 6 }}>R$ {fmt(d.marketingPrice)}</span> <span style={{ color: '#16a34a' }}>R$ {fmt(mktPrice)}</span></> : `R$ ${fmt(d.marketingPrice)}` },
    { icon: <Settings style={{ width: 16, height: 16, color: CYAN }} />, label: "Utilidade (Excedentes)", value: hasExcessDiscount ? <><span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: 6 }}>R$ {fmt(d.utilityPrice)}</span> <span style={{ color: '#16a34a' }}>R$ {fmt(utlPrice)}</span></> : `R$ ${fmt(d.utilityPrice)}` },
    {
      icon: <ShoppingBag style={{ width: 16, height: 16, color: CYAN }} />,
      label: "Suri Shop Assistant",
      value: ["PRO", "ADVANCED"].includes(d.plan.toUpperCase()) ? "Incluso com IA" : "Incluso sem IA"
    },
  ];

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: 20,
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      marginBottom: 16,
      boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #4a54ff 0%, #2e1de8 100%)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "white"
      }}>
        <div style={{
          width: 28, height: 28, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Zap style={{ width: 14, height: 14, fill: "white" }} />
        </div>
        <h2 style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.02em" }}>{d.plan}</h2>
      </div>

      {/* Body - Grid */}
      <div className="plan-grid-mobile" style={{ padding: "12px 20px" }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "6px 0", borderBottom: "1px solid #f1f5f9"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {item.icon}
              <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{item.label}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Excedentes com Desconto em Evidência */}
      {d.excessDiscountPercent > 0 && (
        <div style={{ padding: "8px 20px", backgroundColor: "#f0fdf4", borderTop: "1px dashed #bbf7d0", borderBottom: "1px dashed #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Zap style={{ width: 14, height: 14, color: "#16a34a" }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {d.excessDiscountPercent}% de desconto em mensagens excedentes!
          </span>
        </div>
      )}

      {/* Desconto Mensal em Evidência */}
      {d.hasDiscount && (
        <div style={{ padding: "8px 20px", backgroundColor: "#fff7ed", borderTop: "1px dashed #fdba74", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Zap style={{ width: 14, height: 14, color: "#ea580c" }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
            {d.discountPercent}% (R$ {fmt(d.discount)}) de desconto na mensalidade!
          </span>
        </div>
      )}

      {/* Price Box */}
      <div style={{ padding: "0 24px 24px 24px" }}>
        <div style={{
          backgroundColor: "#f8fafc", borderRadius: 20, padding: "16px", textAlign: "center",
          border: "1px solid #f1f5f9"
        }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Mensal</p>
          {d.hasDiscount && (
            <p style={{ fontSize: 18, fontWeight: 800, color: "#94a3b8", textDecoration: "line-through", marginBottom: -4 }}>R$ {fmt(d.basePrice)}</p>
          )}
          <p style={{ fontSize: 36, fontWeight: 900, color: "#4a54ff" }}>R$ {fmt(d.finalPrice)}</p>
        </div>
      </div>
    </div>
  );
}

export default function QuoteModal({ open, onOpenChange, plans }: QuoteModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [client, setClient] = useState({
    empresa: "", responsavel: "", email: "", telefone: "", negociador: "",
  });

  if (!plans.length) return null;

  const today = new Date().toLocaleDateString("pt-BR");

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(`<!DOCTYPE html><html><head>
      <title>Orçamento - Suri</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { 
          font-family:'DM Sans',sans-serif; 
          color:#1a1f36; 
          padding: 0;
          background-color: white;
        }
        .main-container { 
          width: 100%;
          zoom: 0.92;
        }
        @media print { 
          @page { margin: 5mm; size: portrait; }
          .pill { background-color: #f1f5f9 !important; border-radius: 100px !important; padding: 8px 20px !important; text-align: center !important; margin-top: 10px !important; }
          .pill p { font-size: 10px !important; font-weight: 700 !important; color: #94a3b8 !important; margin: 0 !important; -webkit-print-color-adjust: exact; }
          h1 { font-size: 16pt !important; }
          div[style*="margin-top: 48px"] { margin-top: 20px !important; }
          div[style*="margin-bottom: 20px"] { margin-bottom: 10px !important; }
        }
        .pill { background-color: #f1f5f9; border-radius: 100px; padding: 8px 20px; text-align: center; margin-top: 10px; }
        .pill p { font-size: 10px; font-weight: 700; color: #94a3b8; margin: 0; }
      </style></head>
      <body>
        <div class="main-container">
          ${content.innerHTML}
        </div>
      </body></html>`);

    doc.close();

    // Wait for resources to load then print
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) setTimeout(() => setMode('edit'), 300); // Reset ao fechar
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`transition-all duration-500 p-0 border-none rounded-[3rem] overflow-hidden ${mode === 'preview' ? 'max-w-[1100px] bg-slate-100 dark:bg-slate-800' : 'max-w-[1200px] bg-white dark:bg-slate-900'}`}>
        <div className="flex flex-col h-[95vh]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {/* Form Section */}
            {mode === 'edit' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-6 px-2">Informações do Cliente</p>
                <div className="grid grid-cols-3 gap-6 px-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2 ml-1">
                      <UserCheck className="w-4 h-4 opacity-40" /> Negociador
                    </Label>
                    <Input placeholder="Maria Lima" value={client.negociador} onChange={e => setClient(c => ({ ...c, negociador: e.target.value }))} className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-indigo-50/30 dark:bg-slate-800/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2 ml-1">
                      <Building2 className="w-4 h-4 opacity-40" /> Empresa
                    </Label>
                    <Input placeholder="Empresa Teste Ltda" value={client.empresa} onChange={e => setClient(c => ({ ...c, empresa: e.target.value }))} className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-800/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2 ml-1">
                      <User className="w-4 h-4 opacity-40" /> Responsável
                    </Label>
                    <Input placeholder="Fulano de Tal" value={client.responsavel} onChange={e => setClient(c => ({ ...c, responsavel: e.target.value }))} className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-800/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2 ml-1">
                      <Mail className="w-4 h-4 opacity-40" /> E-mail
                    </Label>
                    <Input placeholder="email@exemplo.com" value={client.email} onChange={e => setClient(c => ({ ...c, email: e.target.value }))} className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-800/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2 ml-1">
                      <Phone className="w-4 h-4 opacity-40" /> Telefone
                    </Label>
                    <Input placeholder="(99) 99999-9999" value={client.telefone} onChange={e => setClient(c => ({ ...c, telefone: e.target.value }))} className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-800/50" />
                  </div>
                </div>
              </div>
            )}

            {mode === 'edit' && <Separator className="mb-10 opacity-50" />}

            {/* Preview Container */}
            <div className={`transition-all duration-500 ${mode === 'preview' ? 'max-w-[1000px] mx-auto shadow-2xl animate-in zoom-in-95 my-10' : 'bg-slate-50/50 dark:bg-slate-800/30 p-1 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-x-hidden'}`}>
              <div ref={printRef} className={`bg-white rounded-[2.25rem] transition-all duration-500 ${mode === 'preview' ? 'p-10 sm:p-12' : 'p-6 sm:p-8 md:p-10'}`}>
                <style>{`
                    .plan-grid-mobile { display: grid; grid-template-columns: 1fr; gap: 0 32px; padding: 16px 24px; }
                    @media (min-width: 640px) { .plan-grid-mobile { grid-template-columns: 1fr 1fr; } }
                    .pill { background-color: #f1f5f9; border-radius: 100px; padding: 8px 20px; text-align: center; }
                    .pill p { font-size: 10px; font-weight: 700; color: #94a3b8; margin: 0; }
                  `}</style>
                {/* Document Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, backgroundColor: "#ffffff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={`${window.location.origin}/identidadevisual/icons/suri-blue.svg`} alt="Logo" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#ffffff", padding: 6 }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 18, fontWeight: 900, color: "#4a54ff", letterSpacing: "-0.04em" }}>Orçamento Suri</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>
                        Responsável: {client.responsavel || "—"} • {client.empresa || "—"}
                      </p>
                      {(client.email || client.telefone) && (
                        <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginTop: 2 }}>
                          {client.email && <span>{client.email}</span>}
                          {client.email && client.telefone && <span> • </span>}
                          {client.telefone && <span>{client.telefone}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, color: "#1e293b", fontWeight: 700 }}>{today}</p>
                    {client.negociador && <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Por: {client.negociador}</p>}
                  </div>
                </div>

                {/* Section 1: Detailed Proposal (Full Width Highlight) */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 9, fontWeight: 900, color: "#0891b2", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Detalhes da Proposta</p>
                  <div style={{ display: "grid", gridTemplateColumns: plans.length > 1 ? "repeat(auto-fit, minmax(300px, 1fr))" : "1fr", gap: 24 }}>
                    {plans.map((p) => (
                      <PlanCard key={p.plan} d={p} />
                    ))}
                  </div>
                </div>

                {/* Section 2: Info & Conditionally Integrations */}
                {(() => {
                  const hasPro = plans.some(p => p.plan.toUpperCase() === "PRO");

                  if (hasPro) {
                    return (
                      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginTop: 8 }}>
                        <div style={{ flex: 1.3 }}>
                          <PricingInfo variant="print" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 10, fontWeight: 900, color: "#4a54ff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, marginTop: 16 }}>Integração Disponível</p>
                          <StoreIntegrations />
                          <div style={{ marginTop: 16, padding: 12, backgroundColor: "#f8fafc", borderRadius: 20, border: "1px dashed #e2e8f0" }}>
                            <p style={{ fontSize: 9, color: "#64748b", lineHeight: 1.4 }}>
                              A Suri oferece integração nativa com as principais plataformas de e-commerce do mercado.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div style={{ marginTop: 8 }}>
                      <PricingInfo variant="print" />
                    </div>
                  );
                })()}

                {mode === 'preview' && (
                  <div style={{ marginTop: 48, borderTop: "1px solid #f1f5f9", paddingTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
                    <div className="pill"><p>Orçamento gerado em {today}</p></div>
                    <div className="pill"><p>Preços calculados automaticamente conforme regras definidas pela empresa.</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Footer Action Bar */}
          <div className={`p-6 sm:p-10 pt-4 flex gap-4 border-t dark:border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10 ${mode === 'preview' ? 'bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-md' : 'bg-white dark:bg-slate-900'}`}>
            {mode === 'edit' ? (
              <>
                <Button variant="ghost" className="h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 px-8" onClick={() => onOpenChange(false)}>Fechar</Button>
                <Button className="flex-1 h-14 rounded-2xl font-black bg-primary hover:opacity-90 shadow-xl shadow-primary/20 transition-all gap-2" onClick={() => setMode('preview')}>
                  <ExternalLink className="w-5 h-5" /> VISUALIZAR RESULTADO
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 gap-2" onClick={() => setMode('edit')}>
                  Voltar para Edição
                </Button>
                <Button className="flex-1 h-14 rounded-2xl font-black bg-primary hover:opacity-90 shadow-xl shadow-primary/20 gap-2" onClick={() => handlePrint()}>
                  <Download className="w-5 h-5" /> BAIXAR PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
