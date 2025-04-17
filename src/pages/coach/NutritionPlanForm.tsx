
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TabBar from '@/components/TabBar';
import { useNutritionPlan } from '@/hooks/useNutritionPlan';
import NutritionPlanHeader from '@/components/coach/nutrition/NutritionPlanHeader';
import NutritionPlanFormCard from '@/components/coach/nutrition/NutritionPlanFormCard';
import LoadingSpinner from '@/components/coach/nutrition/LoadingSpinner';

const NutritionPlanForm = () => {
  const {
    isNewPlan,
    loading,
    saving,
    client,
    formData,
    updateFormField,
    handleMacroChange,
    saveNutritionPlan,
    navigate
  } = useNutritionPlan();

  if (loading) {
    return (
      <div className="min-h-screen bg-fitwell-dark text-white pb-20">
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
          <h1 className="text-xl font-bold">{isNewPlan ? 'New Nutrition Plan' : 'Edit Nutrition Plan'}</h1>
        </header>
        
        <main className="p-4 max-w-2xl mx-auto">
          <LoadingSpinner />
        </main>
        
        <TabBar baseRoute="/coach" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <NutritionPlanHeader 
        isNewPlan={isNewPlan}
        saving={saving}
        onSave={saveNutritionPlan}
      />
      
      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          className="flex items-center text-sm h-8 mb-2"
          onClick={() => navigate('/coach/nutrition')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to nutrition
        </Button>
        
        <NutritionPlanFormCard
          clientName={client.name}
          formData={formData}
          updateFormField={updateFormField}
          handleMacroChange={handleMacroChange}
        />
      </main>
      
      <TabBar baseRoute="/coach" />
    </div>
  );
};

export default NutritionPlanForm;
