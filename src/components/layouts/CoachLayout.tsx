
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '@/components/TabBar';
import { SettingsDropdown } from '@/components/SettingsDropdown';
import { supabase } from '@/integrations/supabase/client';

interface CoachLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function CoachLayout({ children, title }: CoachLayoutProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated and has the coach role
    const checkAuth = async () => {
      try {
        console.log("Checking authentication in CoachLayout");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not authenticated, redirect to login
          console.log("No session found, redirecting to login");
          navigate('/login');
          return;
        }
        
        // Check user role from metadata
        const { data: { user } } = await supabase.auth.getUser();
        console.log("User data:", user);
        
        const role = user?.user_metadata?.role;
        console.log("User role:", role);
        
        // If not a coach, redirect to client dashboard
        if (role !== 'coach') {
          console.log("User is not a coach, redirecting to client dashboard");
          navigate('/client');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fitwell-dark">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
        <SettingsDropdown />
      </header>
      
      <main>
        {children}
      </main>
      
      <TabBar baseRoute="/coach" />
    </div>
  );
}
