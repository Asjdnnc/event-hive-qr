
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import TeamRegistration from "./pages/TeamRegistration";
import TeamManagement from "./pages/TeamManagement";
import QRScanner from "./pages/QRScanner";
import AdminManagement from "./pages/AdminManagement";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/team-registration" element={
            <ProtectedRoute requiredRole={["admin"]}>
              <TeamRegistration />
            </ProtectedRoute>
          } />
          <Route path="/team-management" element={
            <ProtectedRoute requiredRole={["admin"]}>
              <TeamManagement />
            </ProtectedRoute>
          } />
          <Route path="/qr-scanner" element={
            <ProtectedRoute requiredRole={["admin", "volunteer"]}>
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route path="/admin-management" element={
            <ProtectedRoute requiredRole={["admin"]}>
              <AdminManagement />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
