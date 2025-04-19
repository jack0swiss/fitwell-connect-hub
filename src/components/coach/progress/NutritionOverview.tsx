
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ClientNutritionData } from '@/types/nutrition';

interface NutritionOverviewProps {
  data: ClientNutritionData | null;
  isLoading: boolean;
}

const NutritionOverview = ({ data, isLoading }: NutritionOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nutrition Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Calories</div>
                <div className="text-lg font-semibold">{data.totals?.total_calories || 0}</div>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Protein</div>
                <div className="text-lg font-semibold">{data.totals?.total_protein || 0}g</div>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Carbs</div>
                <div className="text-lg font-semibold">{data.totals?.total_carbs || 0}g</div>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Fat</div>
                <div className="text-lg font-semibold">{data.totals?.total_fat || 0}g</div>
              </div>
            </div>
            
            {data.dailyCalories && data.dailyCalories.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyCalories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="calories" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Daily Calories"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                No nutrition history data
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">No nutrition data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionOverview;
