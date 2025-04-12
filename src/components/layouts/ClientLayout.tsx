
import React from 'react';
import TabBar from '@/components/TabBar';
import { SettingsDropdown } from '@/components/SettingsDropdown';

interface ClientLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function ClientLayout({ children, title }: ClientLayoutProps) {
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
