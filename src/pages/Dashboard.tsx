import React from 'react';
import { Link } from 'react-router-dom';
import { Cable, Calculator, Workflow, ArrowRight, BookOpen } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

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
  {
    path: '/kanban',
    label: 'Kanban',
    description: 'Quadro de tarefas Kanban.',
    icon: Workflow,
    color: 'var(--app-vext)',
    tag: 'Kanban',
  },
  {
    path: '/workflow',
    label: 'WorkFlow',
    description: 'Fluxos visuais para processos',
    icon: Workflow,
    color: 'var(--app-work)',
    tag: 'IA',
  },
  {
    path: '/docs',
    label: 'Docs',
    description: 'Documentações internas',
    icon: BookOpen,
    color: 'var(--app-template)',
    tag: 'Docs',
  },
];

export const HubDashboard = () => {
  const { theme } = useTheme();
  const currentLogo = theme === 'light' ? LOGO_LIGHT : LOGO_DARK;

  const visibleApps = apps;

  return (
    <div className="hub-page relative">
      <div className="hub-page__header">
        {/* Linha superior: logo + label + toggle espaçado */}
        <div className="hub-page__brand-row">
          <img src={currentLogo} alt="Logo" className="hub-page__logo" />
          <p className="hub-page__eyebrow">Suri Tools</p>
        </div>
        <h1 className="hub-page__title">Bem vindo!</h1>
        <p className="hub-page__subtitle">Selecione um módulo para começar</p>
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
