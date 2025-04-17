
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type NutritionPlanFormData = {
  calorieTarget: number;
  carbsPct: number;
  proteinPct: number;
  fatPct: number;
  notes: string;
};

export const useNutritionPlan = () => {
  const { planId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isNewPlan = planId === 'new';
  
  // Extract client ID from query params if present
  const searchParams = new URLSearchParams(location.search);
  const queryClientId = searchParams.get('clientId');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState({ id: '', name: '' });
  
  // Form state
  const [formData, setFormData] = useState<NutritionPlanFormData>({
    calorieTarget: 2000,
    carbsPct: 40,
    proteinPct: 30,
    fatPct: 30,
    notes: ''
  });
  
  const updateFormField = <K extends keyof NutritionPlanFormData>(
    field: K,
    value: NutritionPlanFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // First, get the current coach ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        if (!isNewPlan) {
          // Fetch existing plan
          const { data: plan, error: planError } = await supabase
            .from('nutrition_plans')
            .select('*')
            .eq('id', planId)
            .maybeSingle();
            
          if (planError) throw planError;
          
          if (plan) {
            // Set form values
            setFormData({
              calorieTarget: plan.daily_calorie_target || 2000,
              carbsPct: plan.macro_carbs_pct || 40,
              proteinPct: plan.macro_protein_pct || 30,
              fatPct: plan.macro_fat_pct || 30,
              notes: plan.plan_notes || ''
            });
            
            // Set client info
            const clientId = plan.client_id;
            if (clientId) {
              // Fetch client info from profiles
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', clientId)
                .single();
                
              if (profileError && profileError.code !== 'PGRST116') {
                throw profileError;
              }
              
              if (profileData) {
                setClient({
                  id: clientId,
                  name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || `Client ${clientId.substring(0, 6)}`
                });
              }
            }
          }
        } else if (queryClientId) {
          // New plan with specified client
          // Fetch client info from profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', queryClientId)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          
          if (profileData) {
            setClient({
              id: queryClientId,
              name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || `Client ${queryClientId.substring(0, 6)}`
            });
          }
        }
      } catch (error) {
        console.error('Error fetching plan data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load nutrition plan',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isNewPlan, planId, queryClientId]);
  
  const handleMacroChange = (type: 'carbs' | 'protein' | 'fat', value: number) => {
    // Adjust the other macros to maintain 100% total
    const total = 100;
    
    if (type === 'carbs') {
      const remaining = total - value;
      const ratio = formData.proteinPct / (formData.proteinPct + formData.fatPct);
      const newProtein = Math.round(remaining * ratio);
      
      setFormData(prev => ({
        ...prev,
        carbsPct: value,
        proteinPct: newProtein,
        fatPct: total - value - newProtein
      }));
    } else if (type === 'protein') {
      const remaining = total - value;
      const ratio = formData.carbsPct / (formData.carbsPct + formData.fatPct);
      const newCarbs = Math.round(remaining * ratio);
      
      setFormData(prev => ({
        ...prev,
        proteinPct: value,
        carbsPct: newCarbs,
        fatPct: total - value - newCarbs
      }));
    } else {
      const remaining = total - value;
      const ratio = formData.carbsPct / (formData.carbsPct + formData.proteinPct);
      const newCarbs = Math.round(remaining * ratio);
      
      setFormData(prev => ({
        ...prev,
        fatPct: value,
        carbsPct: newCarbs,
        proteinPct: total - value - newCarbs
      }));
    }
  };
  
  const saveNutritionPlan = async () => {
    if (!client.id) {
      toast({
        title: 'Client Required',
        description: 'Please select a client for this nutrition plan',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSaving(true);
      console.log('Attempting to save nutrition plan for client:', client.id);
      
      // Get the current coach ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const coachId = user.id;
      
      const planData = {
        client_id: client.id,
        coach_id: coachId,
        daily_calorie_target: formData.calorieTarget,
        macro_carbs_pct: formData.carbsPct,
        macro_protein_pct: formData.proteinPct,
        macro_fat_pct: formData.fatPct,
        plan_notes: formData.notes,
        updated_at: new Date().toISOString()
      };
      
      if (isNewPlan) {
        // Create new plan
        console.log('Creating new plan with data:', planData);
        const { data, error } = await supabase
          .from('nutrition_plans')
          .insert(planData)
          .select();
          
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Plan created successfully:', data);
        
        toast({
          title: 'Plan Created',
          description: 'Nutrition plan has been created successfully'
        });
      } else {
        // Update existing plan
        console.log('Updating plan with data:', planData);
        const { data, error } = await supabase
          .from('nutrition_plans')
          .update(planData)
          .eq('id', planId)
          .select();
          
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Plan updated successfully:', data);
        
        toast({
          title: 'Plan Updated',
          description: 'Nutrition plan has been updated successfully'
        });
      }
      
      // Navigate back to nutrition page
      navigate('/coach/nutrition');
    } catch (error) {
      console.error('Error saving nutrition plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save nutrition plan',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  return {
    planId,
    isNewPlan,
    loading,
    saving,
    client,
    formData,
    updateFormField,
    handleMacroChange,
    saveNutritionPlan,
    navigate
  };
};
