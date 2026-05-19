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

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const sessionStr = localStorage.getItem('suri_session');
  if (!sessionStr) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const session = JSON.parse(sessionStr);
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem('suri_session');
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    localStorage.removeItem('suri_session');
    return <Navigate to="/login" replace />;
  }
  
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
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <HubLayout>
                  <Routes>
                    <Route path="/" element={<HubDashboard />} />
                    <Route path="/kanban" element={<Kanban />} />
                    <Route path="/workflow" element={<WorkFlow />} />
                    <Route path="/apisuri" element={<SuriApi />} />
                    <Route path="/calcs" element={<SuriCalc />} />
                    <Route path="/docs" element={<Docs />} />
                  </Routes>
                </HubLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
