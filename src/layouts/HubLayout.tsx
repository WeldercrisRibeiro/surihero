import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bot,
  Cable,
  Calculator,
  Workflow,
  LayoutGrid,
  Search,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutGrid },
  { path: '/apisuri', label: 'Suri Api', icon: Bot },
  { path: '/calcs', label: 'Suri Calcs', icon: Calculator },
  { path: '/kanbam', label: 'Kanbam', icon: Cable },
  { path: '/workflow', label: 'Workflow', icon: Workflow },
  
  
  ,
];

// URLs dos logos (substituir pelos links reais)
const LOGO_LIGHT = "/totvs.svg"; 
const LOGO_DARK = "/totvs.svg";

export const HubLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();

  const currentLogo = theme === 'light' ? LOGO_LIGHT : LOGO_DARK;

  return (
    <div className="app-container">
      {/* ─── SIDEBAR ─────────────────────────────────────────── */}
      <aside className={cn('suri-sidebar', collapsed && 'suri-sidebar--collapsed')}>
        <div className="suri-sidebar__brand">
          <div className="suri-sidebar__logo overflow-hidden">
            {currentLogo ? (
              <img src={currentLogo} alt="Logo" className="w-full h-full object-contain p-[0.35rem]" />
            ) : (
              <Sparkles size={16} strokeWidth={2.5} />
            )}
          </div>
          <span className="suri-sidebar__brand-name">SURI TOOLS</span>
        </div>

        {/* Nav */}
        <nav className="suri-sidebar__nav">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn('suri-nav-item', active && 'suri-nav-item--active')}
              >
                <span className="suri-nav-item__icon">
                  <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className="suri-nav-item__label">{item.label}</span>
                {active && <span className="suri-nav-item__pill" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer collapse */}
        <button
          className="suri-sidebar__collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="suri-nav-item__label">Recolher</span>}
        </button>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────────── */}
      <main className="main-content">
        {/* Topbar */}
        <header className="suri-topbar">
          <div className="suri-topbar__search">
            <Search size={15} className="suri-topbar__search-icon" />
            <input
              type="text"
              placeholder="Buscar no sistema..."
              className="suri-topbar__search-input"
            />
            <kbd className="suri-topbar__search-kbd">⌘K</kbd>
          </div>

          <div className="suri-topbar__actions">
            <ThemeToggle />
            <div className="suri-topbar__user">
              <div className="suri-topbar__user-avatar">A</div>
              {/* <span className="suri-topbar__user-name">Admin</span> */}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="page-wrapper">{children}</div>
      </main>
    </div>
  );
};
