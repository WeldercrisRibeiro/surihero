import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, Shield, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Password Change Flow
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { mockLogin } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Timeout de segurança para a tentativa de login (15s)
      const loginPromise = isRegistering 
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('A conexão com o servidor demorou muito. Verifique sua internet ou tente o modo Sandbox.')), 15000)
      );

      const { data, error }: any = await Promise.race([loginPromise, timeoutPromise]);
      
      if (error) throw error;

      if (isRegistering) {
        toast.success('Cadastro realizado!', { description: 'Verifique seu email para confirmar.' });
      } else if (data.user) {
        // Check if user needs to change password
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        
        if (profile?.require_password_change) {
          setTempUserId(data.user.id);
          setShowPasswordChange(true);
          toast.info('Alteração Obrigatória', { description: 'Sua senha inicial deve ser alterada.' });
        } else {
          toast.success('Login realizado com sucesso');
          navigate('/kanban');
        }
      }
    } catch (error: any) {
      console.error('Auth error detail:', error);
      toast.error(error.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ require_password_change: false })
        .eq('id', tempUserId);

      if (profileError) throw profileError;

      toast.success('Senha alterada com sucesso!');
      navigate('/kanban');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleMock = (role: 'user' | 'admin') => {
    mockLogin(role);
    navigate('/kanban');
  };

  if (showPasswordChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 mb-4">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Defina sua Senha</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Para sua segurança, escolha uma nova senha definitiva.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Repita a nova senha"
                      autoComplete="new-password"
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 group disabled:opacity-70 mt-6"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Atualizar e Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-4 font-sans relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[850px] flex flex-col lg:flex-row bg-white dark:bg-slate-900 rounded-[3rem] border border-white dark:border-slate-800 shadow-2xl relative z-10 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Left Side: Branding */}
        <div className="lg:w-[40%] p-12 lg:p-20 flex flex-col justify-center items-center lg:items-start text-center lg:text-left bg-slate-50 dark:bg-slate-800/40 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-cyan-500 mb-8 shadow-2xl shadow-cyan-500/10 flex items-center justify-center relative z-10">
            <Shield size={40} />
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 leading-none">SURI<br/>TOOLS</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-[280px]">
            {isRegistering ? 'Crie sua conta e escale seu workflow hoje.' : 'Acesse seu hub centralizado de ferramentas Suri.'}
          </p>
          
          <div className="hidden lg:flex items-center gap-2 mt-16 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistemas Ativos</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 lg:p-20 flex flex-col justify-center relative">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-cyan-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  placeholder="exemplo@empresa.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                {!isRegistering && <button type="button" className="text-[10px] font-bold text-cyan-500 hover:underline uppercase tracking-widest">Esqueci</button>}
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-cyan-500 transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  {isRegistering ? 'Criar Conta' : 'Acessar Painel'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center flex flex-col items-center gap-8">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-bold text-slate-400 hover:text-cyan-500 transition-colors uppercase tracking-widest"
            >
              {isRegistering ? 'Já possui acesso? Entre agora' : 'Novo por aqui? Solicite acesso'}
            </button>

            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Sandbox</span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            </div>
            
            <div className="flex gap-6">
              <button onClick={() => handleMock('user')} className="text-[10px] font-black text-slate-400 hover:text-cyan-500 transition-colors uppercase tracking-widest">Usuário</button>
              <button onClick={() => handleMock('admin')} className="text-[10px] font-black text-slate-400 hover:text-purple-500 transition-colors uppercase tracking-widest">Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
