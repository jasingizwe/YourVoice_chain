import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Benefits from "./pages/Benefits";
import HowItWorks from "./pages/HowItWorks";
import Resources from "./pages/Resources";
import DashboardLayout from "./components/DashboardLayout";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import CasesList from "./pages/dashboard/CasesList";
import NewCase from "./pages/dashboard/NewCase";
import CaseDetail from "./pages/dashboard/CaseDetail";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AuditLogPage from "./pages/dashboard/AuditLogPage";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/TermsPage";
import { ReactNode } from "react";
import ThemeToggle from "./components/ThemeToggle";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function RoleRoute({ roles, children }: { roles: Array<'survivor' | 'authority' | 'admin'>; children: ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!role || !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function DashboardRoutes() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Routes>
          <Route index element={<DashboardRouter />} />
          <Route path="cases" element={<CasesList />} />
          <Route path="cases/new" element={<RoleRoute roles={['survivor', 'admin']}><NewCase /></RoleRoute>} />
          <Route path="cases/:id" element={<CaseDetail />} />
          <Route path="users" element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>} />
          <Route path="audit" element={<RoleRoute roles={['admin']}><AuditLogPage /></RoleRoute>} />
          <Route path="settings" element={<RoleRoute roles={['admin']}><div className="text-muted-foreground">Settings coming soon</div></RoleRoute>} />
        </Routes>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeToggle />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/guide/benefits" element={<Navigate to="/guide/features" replace />} />
            <Route path="/guide/features" element={<ProtectedRoute><Benefits /></ProtectedRoute>} />
            <Route path="/guide/how-it-works" element={<ProtectedRoute><HowItWorks /></ProtectedRoute>} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/dashboard/*" element={<DashboardRoutes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
