import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const HubLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="app-container-simple">
      {/* Background Watermark - Agora em todas as telas */}
      <div className="fixed inset-0 -top-[50px] flex items-start justify-center pointer-events-none opacity-[0.05] sm:opacity-[0.95] select-none z-0 sm:inset-auto sm:top-[-268px] sm:right-[-25%] sm:block">
        <img
          src="/identidadevisual/icons/totvs.svg"
          alt="Background Watermark"
          className="w-[1500vw] sm:w-[1450px] max-none h-auto brightness-0 transform rotate-[20deg]"
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
        <div className="theme-toggle-dash">
          {/* <ThemeToggle /> */}
        </div>
      )}

      {/* ─── CONTENT ──────────────────────────────────────────── */}
      <main className="main-content-simple">
        <div className="page-wrapper">{children}</div>
      </main>
    </div>
  );
};
