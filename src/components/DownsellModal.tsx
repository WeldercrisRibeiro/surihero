import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Layout, ExternalLink, UserCheck, Building2, User, Phone, Mail, Download } from "lucide-react";

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
  monthsUsed: number;
  contractDuration: number;
  contractTotal: number;
  valueUsed: number;
  remainingBalance: number;
  penaltyAmount: number;
  penaltyPercent: number;
  overdueInvoices: number;
  overdueDueDate: string;
  totalDue: number;
}

interface DownsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DownsellData;
}

export default function DownsellModal({ open, onOpenChange, data }: DownsellModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [client, setClient] = useState({
    empresa: "", responsavel: "", email: "", telefone: "", negociador: "",
  });

  const rowStyle = { display: "flex", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #f1f5f9" };
  const rowAltStyle = { display: "flex", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: "#64748b" };
  const valueStyle = { fontSize: 14, fontWeight: 800, color: "#0f172a" };
  const highlightStyle = { fontSize: 14, fontWeight: 800, color: "#4a54ff" };

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
      <title>Extrato de Downsell/Multa Suri</title>
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
                      <UserCheck className="w-4 h-4 opacity-40" /> Responsável pela Retenção
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
                {/* Document Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, backgroundColor: "#ffffff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={`${window.location.origin}/identidadevisual/icons/suri-blue.svg`} alt="Logo" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#ffffff", padding: 6 }} />
                    </div>
                    <div>
                      <h1 style={{ fontSize: 20, fontWeight: 900, color: "#4a54ff", letterSpacing: "-0.04em" }}>Extrato de Multa / Downsell</h1>
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
                    {client.negociador && <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Responsável Retenção: {client.negociador}</p>}
                  </div>
                </div>

                {/* Extrato Details */}
                <div style={{ marginBottom: 20, marginTop: 32 }}>
                  <p style={{ fontSize: 10, fontWeight: 900, color: "#4a54ff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Resumo de Cálculos</p>

                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 24, overflow: "hidden" }}>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Valor Mensal</span>
                      <span style={valueStyle}>R$ {fmt(data.downsellPlanValue)}</span>
                    </div>
                    <div style={rowAltStyle}>
                      <span style={labelStyle}>Vigência do Contrato</span>
                      <span style={valueStyle}>{data.contractDuration} meses</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Meses Já Utilizados</span>
                      <span style={valueStyle}>{data.monthsUsed} {data.monthsUsed === 1 ? 'mês' : 'meses'}</span>
                    </div>
                    <div style={rowAltStyle}>
                      <span style={labelStyle}>Valor Total do Contrato</span>
                      <span style={valueStyle}>R$ {fmt(data.contractTotal)}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Valor Utilizado</span>
                      <span style={valueStyle}>R$ {fmt(data.valueUsed)}</span>
                    </div>
                    <div style={rowAltStyle}>
                      <span style={labelStyle}>Saldo Contratual Remanescente</span>
                      <span style={valueStyle}>R$ {fmt(data.remainingBalance)}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Multa Rescisória ({data.penaltyPercent}%)</span>
                      <span style={highlightStyle}>{data.monthsUsed >= data.contractDuration ? "SEM MULTA" : `R$ ${fmt(data.penaltyAmount)}`}</span>
                    </div>
                    <div style={rowAltStyle}>
                      <span style={labelStyle}>Fatura em Aberto (venc. {formatDate(data.overdueDueDate)})</span>
                      <span style={valueStyle}>R$ {fmt(data.overdueInvoices)}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 24, padding: "24px 32px", backgroundColor: "#ffffff", borderRadius: 24, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: "#000f9b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Valor Total Devido</span>
                    <span style={{ fontSize: 32, fontWeight: 900, color: "#4a54ff" }}>R$ {fmt(data.totalDue)}</span>
                  </div>

                  <div style={{ marginTop: 20, padding: 16, backgroundColor: "#f8fafc", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
                    <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
                      <strong>Importante:</strong> Caso tenha cumprido a vigência total, não haverá multa. A multa segue cláusula contratual de {data.penaltyPercent}% do saldo restante. O boleto é gerado a partir do momento que o cliente der o aceite para o cancelamento/downsell.
                    </p>
                  </div>
                </div>

                {mode === 'preview' && (
                  <div style={{ marginTop: 48, borderTop: "1px solid #f1f5f9", paddingTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
                    <div className="pill"><p>Documento gerado em {today} • suri.ai</p></div>
                    <div className="pill"><p>Valores calculados automaticamente baseados na vigência contratual.</p></div>
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
