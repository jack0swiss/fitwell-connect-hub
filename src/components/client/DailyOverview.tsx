
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Utensils, TrendingUp } from 'lucide-react';
import ProgressCard from './ProgressCard';

interface DailyOverviewProps {
  userName: string;
  motivationalQuote?: string;
  workout?: {
    title: string;
    duration: string;
    exercises: number;
  };
  nutrition?: {
    caloriesConsumed: number;
    caloriesGoal: number;
    nextMeal: string;
  };
  progress?: {
    weeklyWorkouts: number;
    weeklyGoal: number;
    weightChange: string;
  };
}

const DailyOverview = ({
  userName,
  motivationalQuote,
  workout,
  nutrition,
  progress,
}: DailyOverviewProps) => {
  return (
    <div className="space-y-4">
      <div className="fitness-card">
        <h1 className="text-2xl font-bold">Hello, {userName}!</h1>
        {motivationalQuote && (
          <p className="text-muted-foreground italic mt-1">{motivationalQuote}</p>
        )}
      </div>

      {workout && (
        <Card className="fitness-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Dumbbell className="h-5 w-5 mr-2 text-fitwell-purple" />
              Today's Workout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-semibold text-md">{workout.title}</h3>
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{workout.duration}</span>
                <span>{workout.exercises} exercises</span>
              </div>
            </div>
            <Button className="w-full bg-fitwell-purple hover:bg-fitwell-purple/90">
              Start Workout
            </Button>
          </CardContent>
        </Card>
      )}

      {nutrition && (
        <Card className="fitness-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-fitwell-blue" />
              Nutrition Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Calories</span>
                  <span className="text-sm font-medium">
                    {nutrition.caloriesConsumed} / {nutrition.caloriesGoal}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="progress-bar h-full bg-fitwell-blue" 
                    style={{
                      width: `${Math.min(
                        (nutrition.caloriesConsumed / nutrition.caloriesGoal) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Next suggested meal: {nutrition.nextMeal}
              </p>
            </div>
            <Button className="w-full bg-fitwell-blue hover:bg-fitwell-blue/90">
              Log Meal
            </Button>
          </CardContent>
        </Card>
      )}

      {progress && <ProgressCard progress={progress} />}
    </div>
  );
};

export default DailyOverview;
