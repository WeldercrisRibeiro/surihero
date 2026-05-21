import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { HubLayout } from "./layouts/HubLayout";
import { HubDashboard } from "./pages/Dashboard";

import Kanban from "./pages/Kanban";
import WorkFlow from "./pages/WorkFlow";
import SuriApi from "./pages/ApiSuri";
import SuriCalc from "./pages/Calcs";
import Docs from "./pages/Docs";
import Login from "./pages/Login";
import { loadCredentials } from "@/lib/suri/storage";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const queryClient = new QueryClient();

// Guardião de Autenticação - Protege todas as páginas caso não exista token
function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const creds = loadCredentials();

  // Verifica token ao montar
  useEffect(() => {
    if (!loadCredentials().token) {
      navigate('/login', { replace: true });
    }
  }, []);

  // Escuta mudanças no localStorage (ex: logout em outra aba)
  useEffect(() => {
    const check = () => {
      if (!loadCredentials().token) {
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  if (!creds.token)  return null;
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota pública do Login (Fora do HubLayout) */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas pelo RequireAuth */}
            <Route path="/*" element={
              <RequireAuth>
                <HubLayout>
                  <Routes>
                    <Route path="/" element={<HubDashboard />} />
                    <Route path="/kanban" element={<Kanban />} />
                    <Route path="/workflow" element={<WorkFlow />} />
                    <Route path="/apisuri" element={<SuriApi />} />
                    <Route path="/calcs" element={<SuriCalc />} />
                    <Route path="/docs" element={<Docs />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </HubLayout>
              </RequireAuth>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
