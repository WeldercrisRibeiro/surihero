import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim()) {
      toast.error('Preencha o Token do Telegram.');
      return;
    }

    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      toast.error('Token do Telegram não configurado no .env!');
      return;
    }

    const chatId = phone.trim();

    try {
      // 1. Busca os dados reais do usuário direto do Telegram
      const chatResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`);
      const chatData = await chatResponse.json();

      if (!chatResponse.ok || !chatData.ok) {
        console.error("Telegram API Error:", chatData);
        toast.error(`Token inválido ou o bot não tem permissão para ler seus dados. (Você já deu /start no bot?)`);
        return;
      }

      const telegramName = `${chatData.result.first_name || ''} ${chatData.result.last_name || ''}`.trim() || chatData.result.username || 'Usuário Telegram';
      setName(telegramName);

      // Gera um código aleatório de 6 dígitos
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedCode(generatedCode);

      // Em produção, você faria um SELECT no banco buscando o telegram_token real se o usuário digitasse o celular.
      // O chatId já foi limpo no início da função.

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🔐 Seu código de acesso Suri Tools é: *${generatedCode}*`,
          parse_mode: 'Markdown'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Telegram API Error:", data);
        toast.error(`Erro do Telegram: ${data.description}`);
        return;
      }

      toast.success('Código enviado para o seu Telegram!');
      setStep(2);
      setCooldown(60);
    } catch (error) {
      console.error(error);
      toast.error('Erro de conexão ao enviar o código.');
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('O código deve ter 6 dígitos.');
      return;
    }
    
    // Validate against the dynamically generated code
    if (code === expectedCode) {
      toast.success('Login realizado com sucesso!');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Verifica se o usuário é admin baseado nos IDs configurados no .env
      const adminIds = import.meta.env.VITE_ADMIN_CHAT_IDS?.split(',') || [];
      const isUserAdmin = adminIds.includes(phone.trim());
      const role = isUserAdmin ? 'admin' : 'Membro';

      localStorage.setItem('suri_session', JSON.stringify({
        userId: phone,
        name: name || 'Usuário',
        phone,
        role: role,
        token: phone,
        expiresAt: expiresAt.toISOString()
      }));
      navigate('/');
    } else {
      toast.error('Código inválido.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center sm:justify-start bg-[#e6f3ff] relative overflow-hidden sm:pl-[15%]">
      {/* Background Watermark - Idêntica à tela comum */}
      <div className="fixed inset-0 -top-[50px] flex items-start justify-center pointer-events-none opacity-[0.20] sm:opacity-[0.95] select-none z-0 sm:inset-auto sm:top-[-268px] sm:right-[-25%] sm:block">
        <img
          src="/identidadevisual/icons/totvs.svg"
          alt="Background Watermark"
          className="w-[1500vw] sm:w-[1450px] max-none h-auto brightness-0 transform rotate-[15deg] animate-logo-entrance"
        />
      </div>

      <div className="w-full max-w-md p-8 glass-card rounded-2xl z-10 mx-4 border border-border/50 shadow-2xl relative">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Suri Tools</h1>
          <p className="text-muted-foreground">Faça login para acessar a plataforma</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="phone">Token do Telegram (Chat ID)</Label>
              <Input 
                id="phone" 
                placeholder="Ex: 2146671843" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                className="bg-card"
              />
              <p className="text-[11px] text-muted-foreground pt-1">
                Envie <strong>/token</strong> para <a href="https://t.me/SuriToolsBot" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">@SuriToolsBot</a> no Telegram para descobrir o seu ID.
              </p>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-md font-medium mt-6">
              Receber Código
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4 animate-fade-in">
            <div className="space-y-2 text-left">
              <Label htmlFor="code">Código de Verificação (6 dígitos)</Label>
              <Input 
                id="code" 
                placeholder="000000" 
                maxLength={6}
                value={code} 
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
                className="bg-card text-center text-lg tracking-[0.5em] font-mono"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-md font-medium mt-6">
              Entrar
            </Button>
            <div className="text-center mt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleSendCode} 
                disabled={cooldown > 0}
                className="text-muted-foreground hover:text-foreground"
              >
                {cooldown > 0 ? `Reenviar código em ${cooldown}s` : 'Reenviar código'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
