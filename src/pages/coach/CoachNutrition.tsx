
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TabBar from '@/components/TabBar';
import { Card, CardContent } from '@/components/ui/card';
import NutritionPlanList from '@/components/coach/NutritionPlanList';
import ClientNutritionStats from '@/components/coach/ClientNutritionStats';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const CoachNutrition = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const handleCreatePlan = () => {
    navigate('/coach/nutrition/plan/new');
  };
  
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
  };
  
  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Nutrition</h1>
        <Button 
          onClick={handleCreatePlan}
          size="sm"
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Plan
        </Button>
      </header>
      
      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-9 bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {selectedClientId ? (
          <ClientNutritionStats 
            clientId={selectedClientId} 
            onBack={() => setSelectedClientId(null)}
          />
        ) : (
          <NutritionPlanList 
            searchQuery={searchQuery} 
            onClientSelect={handleClientSelect}
          />
        )}
      </main>
      
      <TabBar baseRoute="/coach" />
    </div>
  );
};

export default CoachNutrition;
