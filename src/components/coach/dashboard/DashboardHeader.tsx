
import { Bell, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientManagementDialog } from '@/components/coach/ClientManagementDialog';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  unreadMessages: number;
}

export function DashboardHeader({ unreadMessages }: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Coach Dashboard</h1>
      <div className="flex items-center space-x-4">
        <ClientManagementDialog />
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" className="relative" onClick={() => navigate('/coach/chat')}>
            <MessageCircle className="h-5 w-5" />
            {unreadMessages > 0 && (
              <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-fitwell-purple">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
