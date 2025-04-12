
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '@/components/TabBar';
import { SettingsDropdown } from '@/components/SettingsDropdown';
import { supabase } from '@/integrations/supabase/client';

interface ClientLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function ClientLayout({ children, title }: ClientLayoutProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated and has the client role
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not authenticated, redirect to login
          navigate('/login');
          return;
        }
        
        // Check user role from metadata
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.user_metadata?.role;
        
        // If not a client and specifically a coach, redirect to coach dashboard
        if (role === 'coach') {
          navigate('/coach');
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
      
      <TabBar baseRoute="/client" />
    </div>
  );
}
