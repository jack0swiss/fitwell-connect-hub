
import { Bell, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserSettingsDialog } from '@/components/client/UserSettingsDialog';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  unreadMessages: number;
}

export const DashboardHeader = ({ unreadMessages }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">FitWell Connect</h1>
      <div className="flex space-x-2">
        <UserSettingsDialog />
        <Button variant="outline" size="icon" className="relative" onClick={() => navigate('/client/chat')}>
          <MessageCircle className="h-5 w-5" />
          {unreadMessages > 0 && (
            <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-fitwell-purple">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </Badge>
          )}
        </Button>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-fitwell-purple rounded-full"></span>
        </Button>
      </div>
    </header>
  );
};
