
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CoachLayout } from '@/components/layouts/CoachLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useClientWorkoutData } from '@/hooks/useClientWorkoutData';
import { useClientNutritionData } from '@/hooks/useClientNutritionData';
import { useClientBodyMetrics } from '@/hooks/useClientBodyMetrics';
import WorkoutCompletionChart from '@/components/coach/progress/WorkoutCompletionChart';
import NutritionOverview from '@/components/coach/progress/NutritionOverview';
import BodyMetricsChart from '@/components/coach/progress/BodyMetricsChart';
import { toast } from '@/components/ui/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import WorkoutBuilder from '@/components/coach/WorkoutBuilder';

interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showWorkoutBuilder, setShowWorkoutBuilder] = useState(false);

  const form = useForm<ClientFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: ''
    }
  });

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
        form.reset({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
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
  }, [clientId, form]);

  const handleSubmit = async (data: ClientFormData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Client information updated successfully',
      });
      setIsEditing(false);
      setClient({ ...client, ...data });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to update client information',
        variant: 'destructive',
      });
    }
  };
  
  const handleBack = () => {
    navigate('/coach');
  };

  if (showWorkoutBuilder) {
    return (
      <CoachLayout title={client ? `Create Workout for ${client.first_name || ''} ${client.last_name || ''}` : 'Create Workout'}>
        <WorkoutBuilder
          planId={null}
          onBack={() => setShowWorkoutBuilder(false)}
        />
      </CoachLayout>
    );
  }

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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Client Information</CardTitle>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Client
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} type="tel" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="font-medium">{client.first_name} {client.last_name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{client.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="font-medium">{client.phone || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Workouts</CardTitle>
                <Button onClick={() => setShowWorkoutBuilder(true)}>
                  Add Workout
                </Button>
              </CardHeader>
              <CardContent>
                <WorkoutCompletionChart data={workoutData} isLoading={workoutLoading} />
              </CardContent>
            </Card>
            
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
