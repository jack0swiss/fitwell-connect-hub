
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { toast } from '@/components/ui/use-toast';

export const useClientAssignments = (planId: string) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientsAndAssignments = async () => {
      try {
        setLoading(true);
        
        // Fetch actual clients from the profiles table
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) throw profilesError;
        
        // Convert profiles to client format
        const clientsData: Client[] = profilesData.map(profile => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          email: profile.email || '',
        }));
        
        // Fetch existing assignments for this plan
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('workout_assignments')
          .select('*')
          .eq('plan_id', planId);
          
        if (assignmentsError) throw assignmentsError;
        
        // Mark clients as assigned if they have an assignment for this plan
        const clientsWithAssignments = clientsData.map(client => {
          const assignment = assignmentsData?.find(a => a.client_id === client.id);
          return {
            ...client,
            isAssigned: !!assignment,
            assignmentId: assignment?.id,
            assignmentStartDate: assignment?.start_date,
            assignmentEndDate: assignment?.end_date
          };
        });
        
        setClients(clientsWithAssignments);
        console.log('Fetched clients:', clientsWithAssignments);
      } catch (error) {
        console.error('Error fetching clients and assignments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load clients and assignments',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientsAndAssignments();
  }, [planId]);

  const toggleAssignment = async (client: Client) => {
    try {
      if (client.isAssigned) {
        // Remove assignment
        if (client.assignmentId) {
          const { error } = await supabase
            .from('workout_assignments')
            .delete()
            .eq('id', client.assignmentId);
            
          if (error) throw error;
          
          setClients(clients.map(c => 
            c.id === client.id 
              ? { ...c, isAssigned: false, assignmentId: undefined, assignmentStartDate: undefined, assignmentEndDate: undefined } 
              : c
          ));
          
          toast({
            title: 'Success',
            description: `Plan unassigned from ${client.name}`,
          });
        }
      } else {
        // Create new assignment starting today
        const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        const { data, error } = await supabase
          .from('workout_assignments')
          .insert({
            plan_id: planId,
            client_id: client.id,
            start_date: today
          })
          .select()
          .single();
          
        if (error) {
          console.error('Assignment error details:', error);
          throw error;
        }
        
        setClients(clients.map(c => 
          c.id === client.id 
            ? { 
                ...c, 
                isAssigned: true, 
                assignmentId: data.id,
                assignmentStartDate: data.start_date,
                assignmentEndDate: data.end_date
              } 
            : c
        ));
        
        toast({
          title: 'Success',
          description: `Plan assigned to ${client.name}`,
        });
      }
    } catch (error) {
      console.error('Error toggling assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assignment',
        variant: 'destructive',
      });
    }
  };

  return {
    clients,
    loading,
    toggleAssignment
  };
};
