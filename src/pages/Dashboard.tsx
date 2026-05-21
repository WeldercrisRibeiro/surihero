import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cable, Calculator, Workflow, ArrowRight, BookOpen, CircleDollarSign, ShieldCheck, LogOut, User } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { clearCredentials } from '@/lib/suri/storage';
import { loadCredentials } from "@/lib/suri/storage";

// URLs dos logos
const LOGO_LIGHT = "/identidadevisual/icons/suri-blue.svg";
const LOGO_DARK = "/identidadevisual/icons/suri-white.svg";

const apps = [
  {
    path: '/apisuri',
    label: 'Suri API',
    description: 'Testes via API',
    icon: Cable,
    color: 'var(--app-connect)',
    tag: 'API',
  },
  {
    path: '/calcs',
    label: 'Suri Calcs',
    description: 'Calculadora Suri para UpSell e DownSell',
    icon: Calculator,
    color: 'var(--app-calc)',
    tag: 'Upsell, Downsell',
  },
  // {
  //   path: '/kanban',
  //   label: 'Kanban',
  //   description: 'Quadro de tarefas Kanban.',
  //   icon: Workflow,
  //   color: 'var(--app-vext)',
  //   tag: 'Kanban',
  // },
  {
    path: '/workflow',
    label: 'Flows',
    description: 'Fluxos visuais para processos',
    icon: Workflow,
    color: 'var(--app-work)',
    tag: 'Fluxos',
  },
  {
    path: '/docs',
    label: 'Docs',
    description: 'Documentações internas',
    icon: BookOpen,
    color: 'var(--app-template)',
    tag: 'Docs',
  },
  // {
  //   path: '/ca',
  //   label: 'Integração Conta Azul',
  //   description: 'Integração com Conta Azul',
  //   icon: CircleDollarSign,
  //   color: 'var(--app-template)',
  //   tag: 'Financeiro',
  // },
];

export const HubDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const creds = loadCredentials();
  const userName = creds.userName || "Usuário";
  const currentLogo = theme === 'light' ? LOGO_LIGHT : LOGO_DARK;

  const visibleApps = apps;

  return (
    <div className="hub-page relative">
      <div className="hub-page__header">
        {/* Linha superior: logo + usuário/logout */}
        <div className="hub-page__brand-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <img src={currentLogo} alt="Logo" className="hub-page__logo" style={{ height: '32px' }} />
          
          <div className="hub-page__user-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="hub-page__user-info" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.4rem 1rem 0.4rem 0.4rem', 
              borderRadius: '100px', 
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ background: 'var(--brand-primary)', color: 'white', borderRadius: '50%', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} />
              </div>
              <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logado como</span>
                <strong style={{ fontSize: '0.875rem', color: 'white', fontWeight: '600' }}>
                  {userName || "Usuário"}
                </strong>
              </div>
            </div>
            
            <button 
  className="hub-logout-btn" 
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(239, 68, 68, 0.15)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 4px 24px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    color: 'rgb(239, 68, 68)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
    e.currentTarget.style.boxShadow = '0 4px 24px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
    e.currentTarget.style.color = 'rgb(255, 100, 100)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
    e.currentTarget.style.boxShadow = '0 4px 24px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
    e.currentTarget.style.color = 'rgb(239, 68, 68)';
  }}
  onClick={() => {
    clearCredentials();
    navigate('/login');
  }}
  title="Sair da conta"
>
  <LogOut size={18} />
</button>
          </div>
        </div>
        
        <h1 className="hub-page__title">Bem vindo!</h1>
        <p className="hub-page__subtitle">Selecione um módulo abaixo:</p>
      </div>

      <div className="hub-grid">
        {visibleApps.map((app) => (
          <Link
            key={app.path}
            to={app.path}
            className="hub-app-card"
            style={{ '--card-accent': app.color } as React.CSSProperties}
          >
            <div className="hub-app-card__top">
              <div className="hub-app-card__icon">
                <app.icon size={22} strokeWidth={1.8} />
              </div>
              <span className="hub-app-card__tag">{app.tag}</span>
            </div>
            <div className="hub-app-card__body">
              <h3 className="hub-app-card__name">{app.label}</h3>
              <p className="hub-app-card__desc">{app.description}</p>
            </div>
            <div className="hub-app-card__footer">
              <span className="hub-app-card__cta">Abrir módulo</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
