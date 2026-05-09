import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Layout, ExternalLink, UserCheck, Building2, User, Phone, Mail } from "lucide-react";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export interface DownsellData {
  downsellPlanValue: number;
  contractStart: string;
  downsellDate: string;
  usedMonths: number;
  remainingMonths: number;
  remainingBalance: number;
  penaltyAmount: number;
  overdueInvoices: number;
  totalDue: number;
}

interface DownsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DownsellData;
}

export default function DownsellModal({ open, onOpenChange, data }: DownsellModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [client, setClient] = useState({
    empresa: "", responsavel: "", email: "", telefone: "", negociador: "",
  });

  const rowStyle = { display: "flex", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #f1f5f9" };
  const rowAltStyle = { display: "flex", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: "#64748b" };
  const valueStyle = { fontSize: 14, fontWeight: 800, color: "#0f172a" };
  const highlightStyle = { fontSize: 14, fontWeight: 800, color: "#0891b2" };

  const today = new Date().toLocaleDateString("pt-BR");

  const handlePrint = (autoPrint: boolean = true) => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head>
      <title>Extrato de Downsell/Multa Suri</title>
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
          background: linear-gradient(135deg, #00e5ff 0%, #0891b2 100%);
          color: white;
          padding: 16px 48px;
          border-radius: 20px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 20px -5px rgba(6, 182, 212, 0.4);
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
        .data-row {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .data-row:last-child {
          border-bottom: none;
        }
        .data-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
        }
        .data-value {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }
        .data-highlight {
          color: #0891b2;
        }
      </style></head>
      <body>
        <div class="main-container">
          ${content.innerHTML}
          
          <div style="margin-top: 32px; display: flex; gap: 12px; justify-content: center;">
            <div class="pill"><p>Documento gerado em ${today} • suri.ai</p></div>
            <div class="pill"><p>Valores calculados automaticamente baseados na vigência contratual</p></div>
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
                      <div style={{ width: 44, height: 44, backgroundColor: "#ecfeff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Layout style={{ width: 22, height: 22, color: "#0891b2" }} />
                      </div>
                      <div>
                        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#0891b2", letterSpacing: "-0.04em" }}>Extrato de Multa / Downsell</h1>
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

                {/* Extrato Details */}
                <div style={{ marginBottom: 20, marginTop: 32 }}>
                  <p style={{ fontSize: 10, fontWeight: 900, color: "#0891b2", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Resumo de Cálculos</p>
                  
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 24, overflow: "hidden" }}>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Valor Mensal Atual do Plano</span>
                      <span style={valueStyle}>R$ {fmt(data.downsellPlanValue)}</span>
                    </div>
                    <div style={rowAltStyle}>
                      <span style={labelStyle}>Data de Início do Contrato</span>
                      <span style={valueStyle}>{formatDate(data.contractStart)}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Data da Solicitação Downsell/Cancelamento</span>
                      <span style={valueStyle}>{formatDate(data.downsellDate)}</span>
                    </div>
                    <div style={rowAltStyle}>
                      <span style={labelStyle}>Meses Já Utilizados</span>
                      <span style={valueStyle}>{data.usedMonths} {data.usedMonths === 1 ? 'mês' : 'meses'}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Meses Restantes (até 12 meses)</span>
                      <span style={valueStyle}>{data.remainingMonths} {data.remainingMonths === 1 ? 'mês' : 'meses'}</span>
                    </div>
                    <div style={rowAltStyle}>
                      <span style={labelStyle}>Saldo Contratual Restante</span>
                      <span style={valueStyle}>R$ {fmt(data.remainingBalance)}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Faturas Vencidas</span>
                      <span style={valueStyle}>R$ {fmt(data.overdueInvoices)}</span>
                    </div>
                    <div style={rowAltStyle}>
                      <span style={labelStyle}>Multa Contratual (30%)</span>
                      <span style={highlightStyle}>{data.usedMonths >= 12 ? "SEM MULTA" : `R$ ${fmt(data.penaltyAmount)}`}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 24, padding: "24px 32px", backgroundColor: "#ecfeff", borderRadius: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: "#0e7490", textTransform: "uppercase", letterSpacing: "0.05em" }}>Valor Total Devido</span>
                    <span style={{ fontSize: 32, fontWeight: 900, color: "#0891b2" }}>R$ {fmt(data.totalDue)}</span>
                  </div>
                  
                  <div style={{ marginTop: 20, padding: 16, backgroundColor: "#f8fafc", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
                    <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
                      <strong>Importante:</strong> Caso o cliente tenha mais de 12 meses, não haverá multa. A multa segue cláusula contratual de 30% do saldo restante. O boleto é gerado a partir do momento que o cliente der o aceite para pagar o downsell.
                    </p>
                  </div>
                </div>
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
