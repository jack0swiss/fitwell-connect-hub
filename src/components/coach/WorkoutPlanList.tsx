
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan } from '@/types/workout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Dumbbell, Edit, Users, Calendar, MoreVertical } from 'lucide-react';
import { WorkoutPlanBuilder } from './WorkoutPlanBuilder';
import { WorkoutPlanAssignment } from './WorkoutPlanAssignment';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

export const WorkoutPlanList = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isAssigningPlan, setIsAssigningPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching workout plans...");
        
        // Get user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error("No active session found");
          setError("Authentication required. Please log in again.");
          setLoading(false);
          return;
        }
        
        console.log("Session found:", session.user.id);
        
        // Fetch workout plans
        const { data, error } = await supabase
          .from('workout_plans')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error details:', error);
          setError(`Failed to load workout plans: ${error.message}`);
          throw error;
        }
        
        console.log('Workout plans fetched successfully:', data);
        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        setError("Failed to load workout plans. Please try again.");
        toast({
          title: 'Error',
          description: 'Failed to load workout plans',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      
      setPlans(plans.filter(p => p.id !== planId));
      toast({
        title: 'Success',
        description: 'Workout plan deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workout plan',
        variant: 'destructive',
      });
    }
  };

  const refreshPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error refreshing plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh workout plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (selectedPlan || isCreatingPlan) {
    return (
      <WorkoutPlanBuilder
        initialPlan={selectedPlan || undefined}
        onBack={() => {
          setSelectedPlan(null);
          setIsCreatingPlan(false);
          refreshPlans();
        }}
      />
    );
  }

  if (isAssigningPlan && selectedPlan) {
    return (
      <WorkoutPlanAssignment
        plan={selectedPlan}
        onBack={() => {
          setSelectedPlan(null);
          setIsAssigningPlan(false);
        }}
      />
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded-md bg-red-50 text-red-700">
        <h3 className="font-medium">Error</h3>
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={refreshPlans}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workout Plans</h2>
        <Button onClick={() => setIsCreatingPlan(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-md">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
          <h3 className="mt-4 text-lg font-medium">No Workout Plans Yet</h3>
          <p className="text-muted-foreground mt-1">Create your first workout plan to assign to clients.</p>
          <Button className="mt-4" onClick={() => setIsCreatingPlan(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workout Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => (
            <Card key={plan.id} className="fitness-card">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedPlan(plan);
                        setIsCreatingPlan(false);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedPlan(plan);
                        setIsAssigningPlan(true);
                      }}>
                        <Users className="h-4 w-4 mr-2" />
                        Assign to Clients
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        Delete Plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                )}
                
                <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Created: {new Date(plan.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsCreatingPlan(false);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsAssigningPlan(true);
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
