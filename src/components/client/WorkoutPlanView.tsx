import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan, Workout, weekDays } from '@/types/workout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Dumbbell, Clock, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface WorkoutPlanViewProps {
  onSelectWorkout: (workout: Workout) => void;
}

export const WorkoutPlanView = ({ onSelectWorkout }: WorkoutPlanViewProps) => {
  const [assignedPlan, setAssignedPlan] = useState<WorkoutPlan | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedPlan = async () => {
      try {
        setLoading(true);
        
        const { data: assignments, error: assignmentsError } = await supabase
          .from('workout_assignments')
          .select(`
            *,
            plan:workout_plans(*)
          `)
          .is('end_date', null)
          .order('start_date', { ascending: false })
          .limit(1);
          
        if (assignmentsError) throw assignmentsError;
        
        if (assignments && assignments.length > 0) {
          const plan = assignments[0].plan as WorkoutPlan;
          setAssignedPlan(plan);
          
          const { data: workoutsData, error: workoutsError } = await supabase
            .from('workouts')
            .select('*')
            .eq('plan_id', plan.id)
            .order('day_of_week');
            
          if (workoutsError) throw workoutsError;
          setWorkouts(workoutsData || []);
        }
      } catch (error) {
        console.error('Error fetching assigned plan:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your workout plan',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignedPlan();
  }, []);

  const getCurrentDayWorkout = () => {
    const today = new Date().getDay();
    return workouts.find(workout => workout.day_of_week === today);
  };

  const getNextWorkout = () => {
    const today = new Date().getDay();
    
    for (let i = 1; i <= 7; i++) {
      const nextDay = (today + i) % 7;
      const workout = workouts.find(w => w.day_of_week === nextDay);
      if (workout) return { workout, daysUntil: i };
    }
    
    if (workouts.length > 0) {
      const sortedWorkouts = [...workouts].sort((a, b) => {
        const dayA = a.day_of_week === null ? 7 : a.day_of_week;
        const dayB = b.day_of_week === null ? 7 : b.day_of_week;
        return dayA - dayB;
      });
      
      return { 
        workout: sortedWorkouts[0],
        daysUntil: sortedWorkouts[0].day_of_week === null ? 
          null : 
          (7 - today + sortedWorkouts[0].day_of_week) % 7 || 7
      };
    }
    
    return null;
  };

  const todayWorkout = getCurrentDayWorkout();
  const nextWorkoutInfo = !todayWorkout ? getNextWorkout() : null;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
      </div>
    );
  }

  if (!assignedPlan) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
        <h3 className="mt-4 text-lg font-medium">No Active Workout Plan</h3>
        <p className="text-muted-foreground mt-1">
          You don't have an active workout plan assigned. Contact your coach to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="fitness-card">
        <CardHeader>
          <CardTitle>{assignedPlan.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedPlan.description && (
            <p className="text-sm text-muted-foreground mb-4">{assignedPlan.description}</p>
          )}
          
          {todayWorkout ? (
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Today's Workout</h3>
              <Card 
                className="bg-fitwell-purple/10 cursor-pointer"
                onClick={() => onSelectWorkout(todayWorkout)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{todayWorkout.name}</h4>
                      {todayWorkout.day_of_week !== null && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{weekDays[todayWorkout.day_of_week]}</span>
                        </div>
                      )}
                    </div>
                    <Button size="sm">
                      Start Workout
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : nextWorkoutInfo ? (
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Next Workout</h3>
              <Card 
                className="bg-card cursor-pointer"
                onClick={() => onSelectWorkout(nextWorkoutInfo.workout)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{nextWorkoutInfo.workout.name}</h4>
                      {nextWorkoutInfo.workout.day_of_week !== null && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            {weekDays[nextWorkoutInfo.workout.day_of_week]}
                            {nextWorkoutInfo.daysUntil !== null
                              ? ` (in ${nextWorkoutInfo.daysUntil} ${nextWorkoutInfo.daysUntil === 1 ? 'day' : 'days'})`
                              : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWorkout(nextWorkoutInfo.workout);
                      }}
                    >
                      Preview
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
          
          <h3 className="text-md font-medium mb-2">Weekly Schedule</h3>
          <div className="space-y-2">
            {workouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No workouts in this plan yet.
              </p>
            ) : (
              weekDays.map((day, index) => {
                const workout = workouts.find(w => w.day_of_week === index);
                const isToday = new Date().getDay() === index;
                
                return (
                  <div 
                    key={index}
                    className={`p-3 rounded-md flex justify-between items-center 
                      ${isToday ? 'bg-fitwell-purple/10' : 'bg-card'} 
                      ${workout ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => workout && onSelectWorkout(workout)}
                  >
                    <div className="flex items-center">
                      <span className={`font-medium w-24 ${isToday ? 'text-fitwell-purple' : ''}`}>{day}</span>
                      {workout ? (
                        <span className="text-sm">{workout.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Rest Day</span>
                      )}
                    </div>
                    {workout && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectWorkout(workout);
                        }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
