
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WorkoutData {
  date: string;
  completed: number;
  total: number;
}

interface WorkoutCompletionChartProps {
  data: WorkoutData[] | undefined;
  isLoading: boolean;
}

const WorkoutCompletionChart = ({ data, isLoading }: WorkoutCompletionChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Workout Completion</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
          </div>
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar name="Completed Workouts" dataKey="completed" fill="#8884d8" />
              <Bar name="Total Workouts" dataKey="total" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No workout data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutCompletionChart;
