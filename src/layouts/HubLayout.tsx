import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Download } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { ChangelogModal, changelogs } from '@/components/ChangelogModal';
import { useState, useEffect } from 'react';

export const HubLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const { isInstallable, isInstalled, isIOS, installPWA } = usePWAInstall();
  
  const latestVersion = changelogs[0]?.version || '3.0.1';
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

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
        </header>
      ) : (
        <div className="theme-toggle-dash flex items-center gap-3">
          {(isInstallable || isIOS) && !isInstalled && (
            <button onClick={installPWA} className="pwa-install-btn-dash">
              <Download size={16} />
              <span>Instalar App</span>
            </button>
          )}
          {/* <ThemeToggle /> */}
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
    </div>
  );
};
