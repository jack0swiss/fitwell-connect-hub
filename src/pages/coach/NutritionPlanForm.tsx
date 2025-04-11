
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import TabBar from '@/components/TabBar';
import { supabase } from '@/integrations/supabase/client';
import { NutritionPlan } from '@/types/nutrition';
import { toast } from '@/components/ui/use-toast';

const NutritionPlanForm = () => {
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
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [carbsPct, setCarbsPct] = useState(40);
  const [proteinPct, setProteinPct] = useState(30);
  const [fatPct, setFatPct] = useState(30);
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
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
            setCalorieTarget(plan.daily_calorie_target || 2000);
            setCarbsPct(plan.macro_carbs_pct || 40);
            setProteinPct(plan.macro_protein_pct || 30);
            setFatPct(plan.macro_fat_pct || 30);
            setNotes(plan.plan_notes || '');
            
            // Set client info
            const clientId = plan.client_id;
            if (clientId) {
              // In a real app, fetch client name from profiles table
              // For mock, use predefined names
              const mockNames: { [key: string]: string } = {
                '1': 'Sarah Johnson',
                '2': 'Michael Chen',
                '3': 'Emma Rodriguez'
              };
              
              setClient({
                id: clientId,
                name: mockNames[clientId] || `Client ${clientId}`
              });
            }
          }
        } else if (queryClientId) {
          // New plan with specified client
          const mockNames: { [key: string]: string } = {
            '1': 'Sarah Johnson',
            '2': 'Michael Chen',
            '3': 'Emma Rodriguez'
          };
          
          setClient({
            id: queryClientId,
            name: mockNames[queryClientId] || `Client ${queryClientId}`
          });
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
      setCarbsPct(value);
      // Adjust protein and fat proportionally
      const remaining = total - value;
      const ratio = proteinPct / (proteinPct + fatPct);
      const newProtein = Math.round(remaining * ratio);
      setProteinPct(newProtein);
      setFatPct(total - value - newProtein);
    } else if (type === 'protein') {
      setProteinPct(value);
      // Adjust carbs and fat proportionally
      const remaining = total - value;
      const ratio = carbsPct / (carbsPct + fatPct);
      const newCarbs = Math.round(remaining * ratio);
      setCarbsPct(newCarbs);
      setFatPct(total - value - newCarbs);
    } else {
      setFatPct(value);
      // Adjust carbs and protein proportionally
      const remaining = total - value;
      const ratio = carbsPct / (carbsPct + proteinPct);
      const newCarbs = Math.round(remaining * ratio);
      setCarbsPct(newCarbs);
      setProteinPct(total - value - newCarbs);
    }
  };
  
  const handleSave = async () => {
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
      
      const planData = {
        client_id: client.id,
        daily_calorie_target: calorieTarget,
        macro_carbs_pct: carbsPct,
        macro_protein_pct: proteinPct,
        macro_fat_pct: fatPct,
        plan_notes: notes,
        updated_at: new Date().toISOString()
      };
      
      if (isNewPlan) {
        // Create new plan
        const { error } = await supabase
          .from('nutrition_plans')
          .insert(planData);
          
        if (error) throw error;
        
        toast({
          title: 'Plan Created',
          description: 'Nutrition plan has been created successfully'
        });
      } else {
        // Update existing plan
        const { error } = await supabase
          .from('nutrition_plans')
          .update(planData)
          .eq('id', planId);
          
        if (error) throw error;
        
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

  if (loading) {
    return (
      <div className="min-h-screen bg-fitwell-dark text-white pb-20">
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
          <h1 className="text-xl font-bold">{isNewPlan ? 'New Nutrition Plan' : 'Edit Nutrition Plan'}</h1>
        </header>
        
        <main className="p-4 max-w-2xl mx-auto">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
          </div>
        </main>
        
        <TabBar baseRoute="/coach" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{isNewPlan ? 'New Nutrition Plan' : 'Edit Nutrition Plan'}</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Plan'}
        </Button>
      </header>
      
      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          className="flex items-center text-sm h-8 mb-2"
          onClick={() => navigate('/coach/nutrition')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to nutrition
        </Button>
        
        <Card className="fitness-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Client: {client.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calorie-target">Daily Calorie Target</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="calorie-target"
                  type="number"
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span>kcal</span>
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-medium">Macronutrient Distribution</h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="carbs-pct">Carbohydrates</Label>
                    <span>{carbsPct}%</span>
                  </div>
                  <Slider
                    id="carbs-pct"
                    min={10}
                    max={70}
                    step={1}
                    value={[carbsPct]}
                    onValueChange={(value) => handleMacroChange('carbs', value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="protein-pct">Protein</Label>
                    <span>{proteinPct}%</span>
                  </div>
                  <Slider
                    id="protein-pct"
                    min={10}
                    max={70}
                    step={1}
                    value={[proteinPct]}
                    onValueChange={(value) => handleMacroChange('protein', value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="fat-pct">Fat</Label>
                    <span>{fatPct}%</span>
                  </div>
                  <Slider
                    id="fat-pct"
                    min={10}
                    max={70}
                    step={1}
                    value={[fatPct]}
                    onValueChange={(value) => handleMacroChange('fat', value[0])}
                  />
                </div>
              </div>
              
              <div className="flex justify-between py-2 border-t border-border/50 mt-2">
                <span>Total</span>
                <span>{carbsPct + proteinPct + fatPct}%</span>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="plan-notes">Plan Notes</Label>
              <Textarea
                id="plan-notes"
                placeholder="Add meal recommendations, dietary restrictions, and other notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
            </div>
          </CardContent>
        </Card>
      </main>
      
      <TabBar baseRoute="/coach" />
    </div>
  );
};

export default NutritionPlanForm;
