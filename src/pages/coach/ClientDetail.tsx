
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CoachLayout } from '@/components/layouts/CoachLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useClientWorkoutData } from '@/hooks/useClientWorkoutData';
import { useClientNutritionData } from '@/hooks/useClientNutritionData';
import { useClientBodyMetrics } from '@/hooks/useClientBodyMetrics';
import WorkoutCompletionChart from '@/components/coach/progress/WorkoutCompletionChart';
import NutritionOverview from '@/components/coach/progress/NutritionOverview';
import BodyMetricsChart from '@/components/coach/progress/BodyMetricsChart';
import { toast } from '@/components/ui/use-toast';

const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: workoutData, isLoading: workoutLoading } = useClientWorkoutData(clientId || null);
  const { data: nutritionData, isLoading: nutritionLoading } = useClientNutritionData(clientId || null);
  const { data: bodyMetrics, isLoading: bodyMetricsLoading } = useClientBodyMetrics(clientId || null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        if (!clientId) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', clientId)
          .single();
          
        if (error) throw error;
        setClient(data);
      } catch (error) {
        console.error('Error fetching client data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load client data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId]);
  
  const handleBack = () => {
    navigate('/coach');
  };

  return (
    <CoachLayout title={client ? `${client.first_name || ''} ${client.last_name || ''}` : 'Client Details'}>
      <div className="p-4 max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : client ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{client.first_name} {client.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{client.phone || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <WorkoutCompletionChart data={workoutData} isLoading={workoutLoading} />
            <NutritionOverview data={nutritionData} isLoading={nutritionLoading} />
            <BodyMetricsChart data={bodyMetrics} isLoading={bodyMetricsLoading} />
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Client not found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </CoachLayout>
  );
};

export default ClientDetail;
