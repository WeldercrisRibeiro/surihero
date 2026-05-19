import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Download, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { ChangelogModal, changelogs } from '@/components/ChangelogModal';
import { useState, useEffect } from 'react';
import { UserAvatar } from '@/lib/telegram-avatar';
import { AdminUsersModal } from '@/components/AdminUsersModal';

export const HubLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const { isInstallable, isInstalled, isIOS, installPWA } = usePWAInstall();
  
  const latestVersion = changelogs[0]?.version || '3.0.1';
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const sessionStr = localStorage.getItem('suri_session');
  const user = sessionStr ? JSON.parse(sessionStr) : null;

  const userProfileInfo = user ? (
    <div className="flex items-center gap-2 mr-2 border-r border-border pr-3">
      <UserAvatar token={user.token} name={user.name} size={32} />
      <div className="hidden sm:flex flex-col text-left">
        <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[120px]">{user.name}</span>
        {user.role === 'admin' && (
          <span className="text-[10px] text-muted-foreground leading-tight uppercase font-medium tracking-wide">
            🌟 Admin
          </span>
        )}
      </div>
    </div>
  ) : null;

  useEffect(() => {
    const versionKey = `suri_changelog_viewed_v${latestVersion}`;
    const hasViewed = localStorage.getItem(versionKey);
    if (!hasViewed) {
      setIsChangelogOpen(true);
      localStorage.setItem(versionKey, 'true');
    }
  }, [latestVersion]);

  return (
    <div className="app-container-simple">
      {/* Background Watermark - Agora em todas as telas */}
      <div 
        key={location.pathname}
        className="fixed inset-0 -top-[50px] flex items-start justify-center pointer-events-none opacity-[0.20] sm:opacity-[0.95] select-none z-0 sm:inset-auto sm:top-[-268px] sm:right-[-25%] sm:block"
      >
        <img
          src="/identidadevisual/icons/totvs.svg"
          alt="Background Watermark"
          className="w-[1500vw] sm:w-[1450px] max-none h-auto brightness-0 transform rotate-[15deg] animate-logo-entrance"
        />
      </div>

      {!isDashboard ? (
        <header className="suri-topbar-solid">
          <Link to="/" className="back-btn-solid shrink-0">
            <ChevronLeft size={15} strokeWidth={2.5} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Portal target for module headers */}
          <div id="topbar-portal-target" className="flex-1 min-w-0 flex items-center justify-between h-full px-2 sm:px-6" />

          {/* Theme toggle disabled for now */}
          {/* <ThemeToggle /> */}
          <div className="flex items-center">
            {userProfileInfo}
            {user?.role === 'admin' && (
              <button 
                onClick={() => setIsAdminModalOpen(true)} 
                className="mr-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center border border-border bg-card shadow-sm"
                title="Gestão de Usuários"
              >
                <Shield size={14} />
              </button>
            )}
            <button onClick={() => { localStorage.removeItem('suri_session'); window.location.href='/login'; }} className="text-sm font-medium hover:underline text-destructive px-2">Sair</button>
          </div>
        </header>
      ) : (
        <div className="theme-toggle-dash flex items-center gap-1 bg-card/60 backdrop-blur-md border border-border p-1.5 rounded-2xl shadow-sm">
          {userProfileInfo}
          {user?.role === 'admin' && (
            <button 
              onClick={() => setIsAdminModalOpen(true)} 
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center border border-border bg-card shadow-sm mr-1"
              title="Gestão de Usuários"
            >
              <Shield size={14} />
            </button>
          )}
          {(isInstallable || isIOS) && !isInstalled && (
            <button onClick={installPWA} className="pwa-install-btn-dash mr-2">
              <Download size={16} />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}
          {/* <ThemeToggle /> */}
          <button onClick={() => { localStorage.removeItem('suri_session'); window.location.href='/login'; }} className="text-sm font-medium hover:bg-destructive/10 text-destructive px-3 py-1.5 rounded-xl transition-colors">Sair</button>
        </div>
      )}

      {/* ─── CONTENT ──────────────────────────────────────────── */}
      <main className="main-content-simple">
        <div className="page-wrapper">{children}</div>
      </main>

      <footer className="footer-simple">
        <div className="flex items-center gap-2">
          <span 
            className="cursor-pointer hover:text-[#4a54ff] hover:underline font-semibold transition-colors"
            onClick={() => setIsChangelogOpen(true)}
            title="Ver novidades"
          >
            v{latestVersion}
          </span>
          <span>•</span>
          <span>Feito por Weldercris Ribeiro</span>
        </div>
      </footer>

      <ChangelogModal open={isChangelogOpen} onOpenChange={setIsChangelogOpen} />
      {isAdminModalOpen && (
        <AdminUsersModal onClose={() => setIsAdminModalOpen(false)} onUsersUpdated={() => {}} />
      )}
    </div>
  );
};
