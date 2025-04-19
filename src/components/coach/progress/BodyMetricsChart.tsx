
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BodyMetricData {
  date: string;
  weight: number;
  bodyFat: number;
}

interface BodyMetricsChartProps {
  data: BodyMetricData[] | undefined;
  isLoading: boolean;
}

const BodyMetricsChart = ({ data, isLoading }: BodyMetricsChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Body Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
          </div>
        ) : data && data.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#8884d8" 
                  name="Weight (kg)" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="bodyFat" 
                  stroke="#82ca9d" 
                  name="Body Fat %" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">No body metrics available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BodyMetricsChart;
