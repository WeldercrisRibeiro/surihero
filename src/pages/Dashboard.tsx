import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Cable, Calculator, Workflow, ArrowRight } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

// URLs dos logos
const LOGO_LIGHT = "/totvs-cyan.svg"; 
const LOGO_DARK = "/totvs.svg";

const apps = [
  {
    path: '/apisuri',
    label: 'Suri API',
    description: 'Console interno de conectores e endpoints.',
    icon: Cable,
    color: 'var(--app-connect)',
    tag: 'API',
  },
  {
    path: '/Calcs',
    label: 'Suri Calcs',
    description: 'Calculadora de planos, preços e projeções.',
    icon: Calculator,
    color: 'var(--app-calc)',
    tag: 'Planos, Upsell',
  },
  {
    path: '/kanbam',
    label: 'Kanban',
    description: 'Produtividade, agenda e quadro de tarefas Kanban.',
    icon: Workflow,
    color: 'var(--app-vext)',
    tag: 'Kanban',
  },
  {
    path: '/workflow',
    label: 'WorkFlow',
    description: 'Fluxos de trabalho.',
    icon: Workflow,
    color: 'var(--app-work)',
    tag: 'IA',
  },
];

export const HubDashboard = () => {
  const { theme } = useTheme();
  const currentLogo = theme === 'light' ? LOGO_LIGHT : LOGO_DARK;

  return (
    <div className="hub-page">
      <div className="hub-page__header">
        {/* Linha superior: logo + label + toggle espaçado */}
        <div className="hub-page__brand-row">
          <img src={currentLogo} alt="Logo" className="hub-page__logo" />
          <p className="hub-page__eyebrow">SURI TOOLS</p>
        </div>
        <h1 className="hub-page__title">Bem-vindo!</h1>
        <p className="hub-page__subtitle">Módulos disponíveis</p>
      </div>

    <div className="hub-grid">
      {apps.map((app) => (
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
