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
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutGrid, color: 'var(--suri-primary)' },
  { path: '/workflow', label: 'Workflow', icon: Workflow, color: 'var(--app-vext)' },
  { path: '/apisuri', label: 'Suri Api', icon: Bot, color: 'var(--app-work)' },
  { path: '/kanbam', label: 'Kanbam', icon: Cable, color: 'var(--app-connect)' },
  { path: '/calcs', label: 'Suri Calcs', icon: Calculator, color: 'var(--app-calc)' },
];

export const HubLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();

  return (
    <div className="app-container">
      {/* ─── SIDEBAR ─────────────────────────────────────────── */}
      <aside className={cn('suri-sidebar', collapsed && 'suri-sidebar--collapsed')}>
        {/* Logo */}
        <div className="suri-sidebar__brand">
          <div className="suri-sidebar__logo">
            <Sparkles size={16} strokeWidth={2.5} />
          </div>
          <span className="suri-sidebar__brand-name">SURI HERO</span>
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
                style={{ '--item-color': item.color } as React.CSSProperties}
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
              <span className="suri-topbar__user-name">Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="page-wrapper">{children}</div>
      </main>
    </div>
  );
};
