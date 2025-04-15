
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

// Page imports
import Index from "./pages/Index";
import Login from "./pages/login/Login";
import NotFound from "./pages/NotFound";

// Coach pages
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachWorkouts from "./pages/coach/CoachWorkouts";
import CoachNutrition from "./pages/coach/CoachNutrition";
import CoachProgress from "./pages/coach/CoachProgress";
import CoachChat from "./pages/coach/CoachChat";
import NutritionPlanForm from "./pages/coach/NutritionPlanForm";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientWorkouts from "./pages/client/ClientWorkouts";
import ClientNutrition from "./pages/client/ClientNutrition";
import ClientProgress from "./pages/client/ClientProgress";
import ClientChat from "./pages/client/ClientChat";

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'coach' | 'client';
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get the session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        
        // Get user role from metadata
        const { data: { user } } = await supabase.auth.getUser();
        const userRole = user?.user_metadata?.role || 'client';
        console.log("User has role:", userRole, "Allowed role:", allowedRole);
        
        setIsAllowed(userRole === allowedRole);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [allowedRole]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-fitwell-dark">
      <div className="text-white">Loading...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    return <Navigate to={allowedRole === 'coach' ? '/client' : '/coach'} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    // Initial auth check
    const checkInitialAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthUser(session?.user || null);
      setIsInitialized(true);
    };
    
    checkInitialAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setAuthUser(session?.user || null);
        
        if (event === 'SIGNED_OUT') {
          queryClient.clear();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fitwell-dark">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">FitWell Connect</h1>
          <p className="text-xl text-gray-300">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              authUser ? (
                <Navigate to={authUser.user_metadata?.role === 'coach' ? '/coach' : '/client'} replace />
              ) : (
                <Login />
              )
            } />
            <Route path="/" element={<Index />} />

            {/* Coach Routes */}
            <Route path="/coach" element={
              <ProtectedRoute allowedRole="coach">
                <CoachDashboard />
              </ProtectedRoute>
            } />
            <Route path="/coach/workouts" element={
              <ProtectedRoute allowedRole="coach">
                <CoachWorkouts />
              </ProtectedRoute>
            } />
            <Route path="/coach/nutrition" element={
              <ProtectedRoute allowedRole="coach">
                <CoachNutrition />
              </ProtectedRoute>
            } />
            <Route path="/coach/nutrition/plan/:planId" element={
              <ProtectedRoute allowedRole="coach">
                <NutritionPlanForm />
              </ProtectedRoute>
            } />
            <Route path="/coach/progress" element={
              <ProtectedRoute allowedRole="coach">
                <CoachProgress />
              </ProtectedRoute>
            } />
            <Route path="/coach/chat" element={
              <ProtectedRoute allowedRole="coach">
                <CoachChat />
              </ProtectedRoute>
            } />

            {/* Client Routes */}
            <Route path="/client" element={
              <ProtectedRoute allowedRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/client/workouts" element={
              <ProtectedRoute allowedRole="client">
                <ClientWorkouts />
              </ProtectedRoute>
            } />
            <Route path="/client/nutrition" element={
              <ProtectedRoute allowedRole="client">
                <ClientNutrition />
              </ProtectedRoute>
            } />
            <Route path="/client/progress" element={
              <ProtectedRoute allowedRole="client">
                <ClientProgress />
              </ProtectedRoute>
            } />
            <Route path="/client/chat" element={
              <ProtectedRoute allowedRole="client">
                <ClientChat />
              </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
