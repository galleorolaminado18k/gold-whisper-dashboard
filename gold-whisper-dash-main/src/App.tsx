// src/App.tsx
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CRMRoute from "./pages/CRM";                 // CRM actual (tabla + tabs)
import CRMInbox from "./pages/CRMInbox";            // 👈 NUEVO: inbox 3 paneles
import Conversations from "./pages/Conversations";
import Advertising from "./pages/Advertising";
import Sales from "./pages/Sales";                  // 👈 NUEVO: Ventas
import Billing from "./pages/Billing";              // 👈 NUEVO: Facturación
import Deliveries from "./pages/Deliveries";
import Payments from "./pages/Payments";
import Customers from "./pages/Customers";
import Birthdays from "./pages/Birthdays";
import Geography from "./pages/Geography";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />

              {/* CRM existente */}
              <Route
                path="/crm"
                element={
                  <ProtectedRoute>
                    <CRMRoute />
                  </ProtectedRoute>
                }
              />

              {/* 👇 NUEVA RUTA: Inbox tipo 3 paneles (no reemplaza al CRM existente) */}
              <Route
                path="/crm-inbox"
                element={
                  <ProtectedRoute>
                    <CRMInbox />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/conversations"
                element={
                  <ProtectedRoute>
                    <Conversations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advertising"
                element={
                  <ProtectedRoute>
                    <Advertising />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute>
                    <Sales />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deliveries"
                element={
                  <ProtectedRoute>
                    <Deliveries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <Payments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/birthdays"
                element={
                  <ProtectedRoute>
                    <Birthdays />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/geography"
                element={
                  <ProtectedRoute>
                    <Geography />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
