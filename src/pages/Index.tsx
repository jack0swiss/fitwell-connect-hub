
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // User is authenticated, get their role from metadata
          const { data: { user } } = await supabase.auth.getUser();
          const role = user?.user_metadata?.role || 'client';
          
          // Navigate to the appropriate dashboard
          navigate(role === 'coach' ? '/coach' : '/client');
        } else {
          // User is not authenticated, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Session check error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-fitwell-dark">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">FitWell Connect</h1>
        <p className="text-xl text-gray-300">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
