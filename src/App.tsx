import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
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
import AdminUsers from "./pages/AdminUsers";
import Login from "./pages/Login";
import { useAuth } from "./hooks/useAuth";
import { Navigate } from 'react-router-dom';

import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
    </div>
  );
  
  if (!profile) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <HubLayout>
                <Routes>
                  <Route path="/" element={<HubDashboard />} />
                  <Route path="/kanban" element={<ProtectedRoute><Kanban /></ProtectedRoute>} />
                  <Route path="/workflow" element={<ProtectedRoute><WorkFlow /></ProtectedRoute>} />
                  <Route path="/apisuri" element={<SuriApi />} />
                  <Route path="/calcs" element={<SuriCalc />} />
                </Routes>
              </HubLayout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
}

export default App;
