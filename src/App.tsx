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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={
              <HubLayout>
                <Routes>
                  <Route path="/" element={<HubDashboard />} />
                  <Route path="/kanban" element={<Kanban />} />
                  <Route path="/workflow" element={<WorkFlow />} />
                  <Route path="/apisuri" element={<SuriApi />} />
                  <Route path="/calcs" element={<SuriCalc />} />
                </Routes>
              </HubLayout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
