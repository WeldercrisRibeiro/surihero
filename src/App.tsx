import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Bot, 
  Cable, 
  Calculator, 
  ClipboardList, 
  Workflow, 
  LayoutGrid,
  Search,
  UserCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import Index from "./pages/Index.tsx";
import Connector from "./routes/index.tsx";

const queryClient = new QueryClient();

const HubDashboard = () => (
  <div className="animate-fade-in">
    <div className="module-header">
      <h1>Bem-vindo ao Suri Hero!</h1>
      <p>O herói da produtividade.</p>
    </div>
    
    <div className="hub-grid">
      <Link to="/vextflow" className="app-card glass-panel" style={{ '--card-color': 'var(--app-vext)' } as React.CSSProperties}>
        <div className="app-icon"><Workflow size={24} /></div>
        <div className="app-info">
          <h3>VextFlow</h3>
          <p>Produtividade, agenda e quadro de tarefas.</p>
        </div>
      </Link>
      
      <Link to="/appwork" className="app-card glass-panel" style={{ '--card-color': 'var(--app-work)' } as React.CSSProperties}>
        <div className="app-icon"><Bot size={24} /></div>
        <div className="app-info">
          <h3>AppWork AI</h3>
          <p>Documentos, fluxos e assistente interno.</p>
        </div>
      </Link>
      
      <Link to="/connector" className="app-card glass-panel" style={{ '--card-color': 'var(--app-connect)' } as React.CSSProperties}>
        <div className="app-icon"><Cable size={24} /></div>
        <div className="app-info">
          <h3>Suri API</h3>
          <p>Console interno de conectores e APIs.</p>
        </div>
      </Link>
      
      <Link to="/plancalc" className="app-card glass-panel" style={{ '--card-color': 'var(--app-calc)' } as React.CSSProperties}>
        <div className="app-icon"><Calculator size={24} /></div>
        <div className="app-info">
          <h3>Suri Plan Calc</h3>
          <p>Calculadora de planos e projeções.</p>
        </div>
      </Link>
    </div>
  </div>
);

const PlaceholderModule = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
  <div className="animate-fade-in glass-panel" style={{ padding: '40px', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
    <Icon size={64} color={color} />
    <h2>{title}</h2>
    <p style={{ color: 'var(--suri-text-muted)' }}>Módulo integrado com sucesso. Interface em desenvolvimento.</p>
  </div>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutGrid },
    { path: '/vextflow', label: 'VextFlow', icon: Workflow },
    { path: '/appwork', label: 'AppWork AI', icon: Bot },
    { path: '/plancalc', label: 'Plan Calc', icon: Calculator },
    { path: '/connector', label: 'Connector', icon: Cable }
    
  ];

  return (
    <div className="app-container">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div style={{ minWidth: 32, width: 32, height: 32, background: 'linear-gradient(135deg, var(--suri-primary), #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            H
          </div>
          <span className="logo-text">SURI HERO</span>
        </div>
        <nav className="nav-links">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} style={{ minWidth: 20 }} />
              <span className="label-text">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div 
          className="sidebar-footer" 
          onClick={() => setCollapsed(!collapsed)} 
          style={{ marginTop: 'auto', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end', cursor: 'pointer', color: 'var(--suri-text-muted)', borderTop: '1px solid var(--suri-border)', transition: 'all 0.3s ease' }}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </div>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--suri-surface-hover)', padding: '8px 16px', borderRadius: '20px', gap: '8px', border: '1px solid var(--suri-border)', width: '300px' }}>
            <Search size={16} color="var(--suri-text-muted)" />
            <input type="text" placeholder="Buscar no sistema..." style={{ background: 'transparent', border: 'none', color: 'var(--suri-text)', outline: 'none', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <ThemeToggle />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <UserCircle size={32} color="var(--suri-primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Admin</span>
            </div>
          </div>
        </header>
        <div className="page-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HubDashboard />} />
              <Route path="/vextflow" element={<PlaceholderModule title="VextFlow" icon={Workflow} color="var(--app-vext)" />} />
              <Route path="/appwork" element={<PlaceholderModule title="AppWork AI" icon={Bot} color="var(--app-work)" />} />
              <Route path="/templates" element={<PlaceholderModule title="Template Manager" icon={ClipboardList} color="var(--app-template)" />} />
              <Route path="/connector" element={<Connector />} />
              <Route path="/plancalc" element={<Index />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
