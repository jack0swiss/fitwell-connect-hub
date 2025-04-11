
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachWorkouts from "./pages/coach/CoachWorkouts";
import CoachNutrition from "./pages/coach/CoachNutrition";
import CoachProgress from "./pages/coach/CoachProgress";
import NutritionPlanForm from "./pages/coach/NutritionPlanForm";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientWorkouts from "./pages/client/ClientWorkouts";
import ClientNutrition from "./pages/client/ClientNutrition";
import ClientProgress from "./pages/client/ClientProgress";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
          <Route path="/coach/chat" element={<CoachDashboard />} />
          
          {/* Client Routes */}
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/client/workouts" element={<ClientWorkouts />} />
          <Route path="/client/nutrition" element={<ClientNutrition />} />
          <Route path="/client/progress" element={<ClientProgress />} />
          <Route path="/client/chat" element={<ClientDashboard />} />
          
          {/* Home redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
