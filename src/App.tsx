import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Payroll from "./pages/Payroll";
import Attendance from "./pages/Attendance";
import YearlyBonus from "./pages/YearlyBonus";
import DynamicInvoiceGenerator from "./pages/DynamicInvoiceGenerator";
import SavedInvoices from "./pages/SavedInvoices";
import ImportData from "./pages/ImportData";
import KPKInvoice from "./pages/KPKInvoice";
import ProjectInvoice from "./pages/ProjectInvoice";
import WeedGrassCuttingInvoice from "./pages/WeedGrassCuttingInvoice";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/employees" element={
        <ProtectedRoute>
          <Layout>
            <Employees />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/departments" element={
        <ProtectedRoute>
          <Layout>
            <Departments />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/payroll" element={
        <ProtectedRoute>
          <Layout>
            <Payroll />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute>
          <Layout>
            <Attendance />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/yearly-bonus" element={
        <ProtectedRoute>
          <Layout>
            <YearlyBonus />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/dynamic-invoice" element={
        <ProtectedRoute>
          <Layout>
            <DynamicInvoiceGenerator />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/import" element={
        <ProtectedRoute>
          <Layout>
            <ImportData />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/kpk-invoice" element={
        <ProtectedRoute>
          <Layout>
            <KPKInvoice />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/saved-invoices" element={
        <ProtectedRoute>
          <Layout>
            <SavedInvoices />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/project-invoice" element={
        <ProtectedRoute>
          <Layout>
            <ProjectInvoice />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/weed-grass-cutting" element={
        <ProtectedRoute>
          <Layout>
            <WeedGrassCuttingInvoice />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
