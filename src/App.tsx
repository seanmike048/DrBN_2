import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./pages/DashboardLayout";
import TodayPlan from "./pages/TodayPlan";
import Evolution from "./pages/Evolution";
import MyProducts from "./pages/MyProducts";
import Tools from "./pages/Tools";
import Nutrition from "./pages/Nutrition";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component (allows both auth and guest users)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Allow both authenticated users and guest users
  if (!user && !isGuest) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={<Index />} />

    {/* Dashboard Routes */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard/today" replace />} />
      <Route path="today" element={<TodayPlan />} />
      <Route path="evolution" element={<Evolution />} />
      <Route path="products" element={<MyProducts />} />
      <Route path="tools" element={<Tools />} />
      <Route path="nutrition" element={<Nutrition />} />
      <Route path="chat" element={<div className="p-6 text-center text-body-secondary">Chat page coming soon (Plus mode feature)</div>} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
