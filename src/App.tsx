
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/login/Login";
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachWorkouts from "./pages/coach/CoachWorkouts";
import CoachNutrition from "./pages/coach/CoachNutrition";
import CoachProgress from "./pages/coach/CoachProgress";
import CoachChat from "./pages/coach/CoachChat";
import NutritionPlanForm from "./pages/coach/NutritionPlanForm";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientWorkouts from "./pages/client/ClientWorkouts";
import ClientNutrition from "./pages/client/ClientNutrition";
import ClientProgress from "./pages/client/ClientProgress";
import ClientChat from "./pages/client/ClientChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Log auth events for debugging
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Clear query cache when user logs out
        if (event === 'SIGNED_OUT') {
          queryClient.clear();
        }
      }
    );

    // Mark app as initialized
    setIsInitialized(true);

    // Clean up listener
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fitwell-dark">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">FitWell Connect</h1>
          <p className="text-xl text-gray-300">Initialisierung...</p>
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
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Coach Routes */}
            <Route path="/coach" element={<CoachDashboard />} />
            <Route path="/coach/workouts" element={<CoachWorkouts />} />
            <Route path="/coach/nutrition" element={<CoachNutrition />} />
            <Route path="/coach/nutrition/plan/:planId" element={<NutritionPlanForm />} />
            <Route path="/coach/progress" element={<CoachProgress />} />
            <Route path="/coach/chat" element={<CoachChat />} />
            
            {/* Client Routes */}
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/client/workouts" element={<ClientWorkouts />} />
            <Route path="/client/nutrition" element={<ClientNutrition />} />
            <Route path="/client/progress" element={<ClientProgress />} />
            <Route path="/client/chat" element={<ClientChat />} />
            
            {/* Home route checks auth and redirects */}
            <Route path="/" element={<Index />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
