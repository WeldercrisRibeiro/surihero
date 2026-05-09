import { Info, MessageCircle, Send, Zap, ShoppingBag, AlertTriangle } from "lucide-react";

interface PricingInfoProps {
  variant?: "dashboard" | "print";
}

export default function PricingInfo({ variant = "dashboard" }: PricingInfoProps) {
  const ACCENT = "hsl(243 75% 59%)";
  const CYAN = "#0891b2";
  const content = {
    title: "Informativos",
    items: [
      {
        icon: <AlertTriangle style={{ width: 20, height: 20 }} />,
        label: "IMPORTANTE",
        description: "Toda solicitação de alteração de plano (Upsell) realizada após o dia 1º de cada mês será aplicada somente no segundo mês seguinte à solicitação. Exemplo prático: Solicitação: 17/04 (Abril) | Plano refletido em: Junho",
        highlight: true
      },
      {
        icon: <MessageCircle style={{ width: 20, height: 20, color: CYAN }} />,
        label: "CONTATO RECEPTIVO",
        description: "Contatos que se comunicam com a empresa por WhatsApp, Facebook, Instagram ou Webchat. O contato é contabilizado uma única vez por mês como 1 interação, independente de quantas conversas iniciar."
      },
      {
        icon: <Send style={{ width: 20, height: 20, color: CYAN }} />,
        label: "MENSAGEM ATIVA",
        description: "Mensagens enviadas pela empresa pelo WhatsApp usando templates de Marketing, Utilidade ou Autenticação. Cada envio é contabilizado como uma interação."
      },
      {
        icon: <Zap style={{ width: 20, height: 20, color: CYAN }} />,
        label: "INTERAÇÕES EXCEDENTES",
        description: "São as interações que ultrapassam o volume contratado no seu plano mensal. Elas garantem que seu atendimento nunca pare, sendo faturadas individualmente com base no valor unitário do seu plano atual."
      },
      {
        icon: <ShoppingBag style={{ width: 20, height: 20, color: CYAN }} />,
        label: "SURI SHOP ASSISTANT",
        description: "O Suri Shop Assistant é uma IA generativa focada em vendas e atendimento. Ele guia o cliente por toda a jornada de compra — da busca de produtos (por texto, áudio ou imagem) até o pagamento — utilizando o catálogo da loja. Além disso, automatiza respostas a dúvidas frequentes com base em sites ou documentos e sugere respostas em tempo real para otimizar o trabalho dos atendentes."
      },
      
    ]
  };

  if (variant === "print") {
    return (
      <div style={{ 
        marginTop: 16, 
        padding: "24px 28px", 
        border: "1px solid #e2e8f0", 
        borderRadius: 24, 
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: 10, backgroundColor: "#f0f0ff",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Info style={{ width: 14, height: 14, color: CYAN }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{content.title}</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {content.items.map((item, idx) => {
            const isHighlight = item.highlight;
            return (
              <div key={idx} style={{ display: "flex", gap: 14, alignItems: "flex-start", ...(isHighlight ? { padding: 12, backgroundColor: "#fffbeb", borderRadius: 12, border: "2px solid #fcd34d" } : {}) }}>
                <div style={{ 
                  width: 36, height: 36, borderRadius: "50%", 
                  backgroundColor: isHighlight ? "#fef3c7" : "#f0f0ff",
                  color: isHighlight ? "#d97706" : CYAN,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: isHighlight ? "#b45309" : "#1e293b", marginBottom: 2 }}>{item.label}</p>
                  <p style={{ fontSize: 10, color: isHighlight ? "#92400e" : "#64748b", lineHeight: 1.5, fontWeight: isHighlight ? 600 : 400 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-[2.5rem] border-none glass-card dark:bg-slate-900/40">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
          <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{content.title}</h3>
      </div>

      <div className="space-y-6">
        {content.items.map((item, idx) => {
          const isHighlight = item.highlight;
          return (
            <div key={idx} className={`flex gap-4 p-4 rounded-3xl transition-all ${isHighlight ? "bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 shadow-md" : "bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60"}`}>
              <div className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center shrink-0 ${isHighlight ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400" : "bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400"}`}>
                {item.icon}
              </div>
              <div>
                <h4 className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isHighlight ? "text-amber-800 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"}`}>{item.label}</h4>
                <p className={`text-[10px] leading-relaxed ${isHighlight ? "text-amber-900/80 dark:text-amber-200/80 font-semibold" : "text-slate-500 font-medium"}`}>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
