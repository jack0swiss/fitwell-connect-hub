
import React from 'react';
import { Dumbbell, Utensils, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useClientDashboardMetrics } from '@/hooks/useClientDashboardMetrics';

interface ClientProgressCardProps {
  clientId: string;
}

export function ClientProgressCard({ clientId }: ClientProgressCardProps) {
  const { data: metrics, isLoading } = useClientDashboardMetrics(clientId);

  if (isLoading) {
    return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-background rounded p-2 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-2 bg-muted rounded mb-2"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const formatPercentage = (value: number) => {
    return Math.min(Math.max(Math.round(value), 0), 100);
  };

  const workoutPercentage = formatPercentage(metrics.workoutCompletionRate);
  const nutritionPercentage = formatPercentage(metrics.calorieAdherence);
  const goalsPercentage = metrics.goalsTotal > 0 
    ? formatPercentage((metrics.goalsAchieved / metrics.goalsTotal) * 100) 
    : 0;

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="bg-background rounded p-2">
        <div className="flex items-center mb-1">
          <Dumbbell className="h-3 w-3 mr-1" />
          <span className="text-xs">Workouts</span>
        </div>
        <Progress value={workoutPercentage} className="h-2" />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {metrics.workoutsCompleted}/{metrics.workoutsTotal}
          </span>
          <span className="text-xs text-muted-foreground">{workoutPercentage}%</span>
        </div>
      </div>
      
      <div className="bg-background rounded p-2">
        <div className="flex items-center mb-1">
          <Utensils className="h-3 w-3 mr-1" />
          <span className="text-xs">Nutrition</span>
        </div>
        <Progress value={nutritionPercentage} className="h-2" />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {metrics.caloriesConsumed}/{metrics.caloriesTarget}
          </span>
          <span className="text-xs text-muted-foreground">{nutritionPercentage}%</span>
        </div>
      </div>
      
      <div className="bg-background rounded p-2">
        <div className="flex items-center mb-1">
          <TrendingUp className="h-3 w-3 mr-1" />
          <span className="text-xs">Goals</span>
        </div>
        <Progress value={goalsPercentage} className="h-2" />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {metrics.goalsAchieved}/{metrics.goalsTotal}
          </span>
          <span className="text-xs text-muted-foreground">{goalsPercentage}%</span>
        </div>
      </div>
    </div>
  );
}
