import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const HubLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="app-container-simple">
      {!isDashboard ? (
        <header className="suri-topbar-solid">
          <Link to="/" className="back-btn-solid">
            <ChevronLeft size={15} strokeWidth={2.5} />
            <span>Dashboard</span>
          </Link>
          
          {/* Portal target for module headers */}
          <div id="topbar-portal-target" className="flex-1 flex items-center justify-between h-full px-6" />

          <ThemeToggle />
        </header>
      ) : (
        <div className="theme-toggle-dash">
          <ThemeToggle />
        </div>
      )}

      {/* ─── CONTENT ──────────────────────────────────────────── */}
      <main className="main-content-simple">
        <div className="page-wrapper">{children}</div>
      </main>
    </div>
  );
};
