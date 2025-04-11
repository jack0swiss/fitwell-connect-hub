
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, Dumbbell, MessageCircle, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientDetailCardProps {
  client: {
    id: string;
    name: string;
    avatarUrl?: string;
    email: string;
    recentActivities: {
      type: 'workout' | 'nutrition' | 'message';
      title: string;
      date: string;
    }[];
    nextSessions: {
      title: string;
      date: string;
    }[];
  };
  onBack: () => void;
}

const ClientDetailCard = ({ client, onBack }: ClientDetailCardProps) => {
  const initials = client.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="h-4 w-4 text-fitwell-purple" />;
      case 'nutrition':
        return <Utensils className="h-4 w-4 text-fitwell-blue" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        className="flex items-center text-sm h-8 mb-2"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to clients
      </Button>
      
      <Card className="fitness-card">
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <Avatar className="h-16 w-16 border-2 border-fitwell-purple">
            <AvatarImage src={client.avatarUrl} alt={client.name} />
            <AvatarFallback className="bg-fitwell-purple-dark text-white text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{client.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{client.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-md font-semibold mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-fitwell-purple" />
              Upcoming Sessions
            </h3>
            {client.nextSessions.length > 0 ? (
              <ul className="space-y-2">
                {client.nextSessions.map((session, index) => (
                  <li key={index} className="text-sm p-2 bg-muted rounded-md flex justify-between">
                    <span>{session.title}</span>
                    <span className="text-muted-foreground">{session.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
            )}
          </div>
          
          <div>
            <h3 className="text-md font-semibold mb-2">Recent Activity</h3>
            {client.recentActivities.length > 0 ? (
              <ul className="space-y-2">
                {client.recentActivities.map((activity, index) => (
                  <li key={index} className="text-sm p-2 bg-muted rounded-md flex justify-between items-center">
                    <div className="flex items-center">
                      {getActivityIcon(activity.type)}
                      <span className="ml-2">{activity.title}</span>
                    </div>
                    <span className="text-muted-foreground">{activity.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activities.</p>
            )}
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button className="flex-1 h-9 bg-fitwell-purple hover:bg-fitwell-purple/90">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button className="flex-1 h-9 bg-fitwell-blue hover:bg-fitwell-blue/90">
              <Dumbbell className="h-4 w-4 mr-2" />
              Assign Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetailCard;
