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
  implantacao: number;
  marketingPrice: number;
  utilityPrice: number;
  suriShopCommission: string;
}

interface QuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: QuoteData[];
}

const ACCENT = "#4f46e5";
const PURPLE = "#6366f1";
const GRAY = "#64748b";

const STORES = [
  "Loja - Suri", "Loja - Mercadapp", "Loja - Shopify", "Loja - Lexos by Totvs", "Loja - VTEX", "Loja - Neomode"
];

const PLAN_NAMES = ["Essential", "PRO"];

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
  const items = [
    { icon: <MessageCircle style={{ width: 16, height: 16, color: PURPLE }} />, label: "Interações", value: fmtN(d.interactions) },
    { icon: <Clock style={{ width: 16, height: 16, color: PURPLE }} />, label: "Preço/Interação", value: `R$ ${fmt(d.interactionPrice)}` },
    { icon: <Wallet style={{ width: 16, height: 16, color: PURPLE }} />, label: "Valor base", value: `R$ ${fmt(d.basePrice)}` },
    { icon: <ArrowUpRight style={{ width: 16, height: 16, color: PURPLE }} />, label: "Implantação", value: `R$ ${fmt(d.implantacao)}` },
    { icon: <Megaphone style={{ width: 16, height: 16, color: PURPLE }} />, label: "Mensagens de Marketing (Excedentes)", value: `R$ ${fmt(d.marketingPrice)}` },
    { icon: <Settings style={{ width: 16, height: 16, color: PURPLE }} />, label: "Mensagens de Utilidade (Excedentes)", value: `R$ ${fmt(d.utilityPrice)}` },
    { 
      icon: <ShoppingBag style={{ width: 16, height: 16, color: PURPLE }} />, 
      label: "Suri Shop Assistant", 
      value: d.plan.toUpperCase() === "PRO" ? "Incluso com IA" : "Incluso sem IA" 
    },
  ];

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: 24,
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      marginBottom: 20,
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
    }}>
      {/* Header */}
      <div style={{ 
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", 
        padding: "16px 24px", 
        display: "flex", 
        alignItems: "center", 
        gap: 12,
        color: "white" 
      }}>
        <div style={{ 
          width: 32, height: 32, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Zap style={{ width: 18, height: 18, fill: "white" }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>{d.plan}</h2>
      </div>

      {/* Body - 2 Columns Grid for "Evidence" */}
      <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
        {items.map((item, i) => (
          <div key={i} style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center", 
            padding: "8px 0", borderBottom: "1px solid #f1f5f9"
          }}>
             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {item.icon}
                <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{item.label}</span>
             </div>
             <span style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Price Box */}
      <div style={{ padding: "0 24px 24px 24px" }}>
        <div style={{ 
          backgroundColor: "#f8fafc", borderRadius: 20, padding: "16px", textAlign: "center",
          border: "1px solid #f1f5f9"
        }}>
           <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Mensal</p>
           <p style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>R$ {fmt(d.finalPrice)}</p>
        </div>
      </div>
    </div>
  );
}

export default function QuoteModal({ open, onOpenChange, plans }: QuoteModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [client, setClient] = useState({
    empresa: "", responsavel: "", email: "", telefone: "", negociador: "",
  });

  if (!plans.length) return null;

  const today = new Date().toLocaleDateString("pt-BR");

  const handlePrint = (autoPrint: boolean = true) => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head>
      <title>Orçamento Suri</title>
      <link rel="shortcut icon" href="https://portal.suri.ai/images/favicon.png">
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { 
          font-family:'DM Sans',sans-serif; 
          color:#1a1f36; 
          padding:20px; 
          max-width:850px; 
          margin:0 auto; 
          background-color: #f8fafc;
        }
        .main-container { background: white; border-radius: 40px; padding: 32px; border: 1px solid #e2e8f0; }
        @media print { 
          @page { margin: 5mm; size: portrait; }
          body { padding: 0; background: white; max-width: none; }
          .main-container { border: none; box-shadow: none; padding: 10px; border-radius: 0; }
          .no-print { display: none !important; }
        }
        .print-button {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          padding: 16px 48px;
          border-radius: 20px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
          display: block;
          margin: 40px auto 0;
        }
        .pill {
          background-color: #f1f5f9;
          border-radius: 100px;
          padding: 10px 24px;
          text-align: center;
          margin-top: 12px;
        }
        .pill p { font-size: 11px; font-weight: 600; color: #94a3b8; }
      </style></head>
      <body>
        <div class="main-container">
          ${content.innerHTML}
          
          <div style="margin-top: 32px; display: flex; gap: 12px; justify-content: center;">
            <div class="pill"><p>Orçamento gerado em ${today} • suri.ai</p></div>
            <div class="pill"><p>Preços calculados automaticamente</p></div>
          </div>
        </div>
        <button class="print-button no-print" onclick="window.print()">Baixar PDF</button>
      </body></html>`);
    printWindow.document.close();
    if (autoPrint) setTimeout(() => printWindow.print(), 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] max-h-[95vh] overflow-y-auto p-0 border-none rounded-[3rem]">
        <div className="p-10 pb-6">
           {/* Form Section */}
           <div className="mb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Informações do Cliente</p>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 flex items-center gap-2 ml-1">
                    <UserCheck className="w-4 h-4 opacity-40" /> Negociador
                  </Label>
                  <Input placeholder="Seu nome" value={client.negociador} onChange={e => setClient(c => ({...c, negociador: e.target.value}))} className="h-12 rounded-2xl border-slate-100 bg-cyan-50/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 flex items-center gap-2 ml-1">
                    <Building2 className="w-4 h-4 opacity-40" /> Empresa
                  </Label>
                  <Input placeholder="Nome da empresa" value={client.empresa} onChange={e => setClient(c => ({...c, empresa: e.target.value}))} className="h-12 rounded-2xl border-slate-100" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 flex items-center gap-2 ml-1">
                    <User className="w-4 h-4 opacity-40" /> Responsável
                  </Label>
                  <Input placeholder="Nome do responsável" value={client.responsavel} onChange={e => setClient(c => ({...c, responsavel: e.target.value}))} className="h-12 rounded-2xl border-slate-100" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 flex items-center gap-2 ml-1">
                    <Mail className="w-4 h-4 opacity-40" /> E-mail
                  </Label>
                  <Input placeholder="email@empresa.com" value={client.email} onChange={e => setClient(c => ({...c, email: e.target.value}))} className="h-12 rounded-2xl border-slate-100" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 flex items-center gap-2 ml-1">
                    <Phone className="w-4 h-4 opacity-40" /> Telefone
                  </Label>
                  <Input placeholder="(00) 00000-0000" value={client.telefone} onChange={e => setClient(c => ({...c, telefone: e.target.value}))} className="h-12 rounded-2xl border-slate-100" />
                </div>
              </div>
           </div>

           <Separator className="mb-10 opacity-50" />

           {/* Preview Container */}
           <div className="bg-slate-50/50 p-1 rounded-[2.5rem] border border-slate-100">
             <div ref={printRef} style={{ backgroundColor: "white", padding: "24px 32px", borderRadius: 36 }}>
                {/* Document Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 44, height: 44, backgroundColor: "#f0f0ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Layout style={{ width: 22, height: 22, color: "#4f46e5" }} />
                      </div>
                      <div>
                        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#4f46e5", letterSpacing: "-0.04em" }}>Orçamento Suri</h1>
                        <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>
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
                  <p style={{ fontSize: 10, fontWeight: 900, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Detalhes da Proposta</p>
                  {plans.map((p) => (
                    <PlanCard key={p.plan} d={p} />
                  ))}
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
                            <p style={{ fontSize: 10, fontWeight: 900, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, marginTop: 16 }}>Integração Disponível</p>
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
             </div>
           </div>
        </div>

        {/* Action Bar */}
        <div className="p-10 pt-0 flex gap-4">
          <Button variant="ghost" className="h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 px-8" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button className="flex-1 h-14 rounded-2xl font-black bg-cyan-600 hover:bg-cyan-700 shadow-xl shadow-cyan-200 transition-all gap-2" onClick={() => handlePrint(false)}>
            <ExternalLink className="w-5 h-5" /> VISUALIZAR RESULTADO
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
