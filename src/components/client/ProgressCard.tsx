
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface ProgressCardProps {
  progress: {
    weeklyWorkouts: number;
    weeklyGoal: number;
    weightChange: string;
  };
}

const ProgressCard = ({ progress }: ProgressCardProps) => {
  const workoutPercentage = (progress.weeklyWorkouts / progress.weeklyGoal) * 100;
  
  return (
    <Card className="fitness-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Weekly Workouts</span>
              <span className="text-sm font-medium">
                {progress.weeklyWorkouts} / {progress.weeklyGoal}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500" 
                style={{ width: `${Math.min(workoutPercentage, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-muted/50 p-2 rounded-lg mr-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Weight Change</p>
              <p className="text-xs text-muted-foreground">{progress.weightChange}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
