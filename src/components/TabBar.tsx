
import { Home, Dumbbell, Utensils, TrendingUp, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TabBarProps {
  baseRoute: string; // Either '/coach' or '/client'
}

const TabBar = ({ baseRoute }: TabBarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const tabs = [
    { 
      icon: Home, 
      label: 'Home', 
      path: `${baseRoute}`,
      exact: true
    },
    { 
      icon: Dumbbell, 
      label: 'Workouts', 
      path: `${baseRoute}/workouts` 
    },
    { 
      icon: Utensils, 
      label: 'Nutrition', 
      path: `${baseRoute}/nutrition` 
    },
    { 
      icon: TrendingUp, 
      label: 'Progress', 
      path: `${baseRoute}/progress` 
    },
    { 
      icon: MessageCircle, 
      label: 'Chat', 
      path: `${baseRoute}/chat` 
    },
  ];
  
  const isActive = (path: string, exact = false) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1",
              isActive(tab.path, tab.exact) ? "tab-active" : "tab-inactive"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default TabBar;
