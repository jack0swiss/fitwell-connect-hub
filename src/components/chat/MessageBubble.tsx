
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { CheckCheck } from 'lucide-react';
import { ChatMessage } from '@/hooks/use-chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const timestamp = new Date(message.sent_at);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  
  return (
    <div className={cn(
      "flex w-full max-w-[85%]",
      isCurrentUser ? "ml-auto justify-end" : "mr-auto justify-start"
    )}>
      <Card className={cn(
        "p-3 mb-2 shadow-sm",
        isCurrentUser 
          ? "bg-fitwell-purple text-white" 
          : "bg-muted"
      )}>
        {message.related_entity_type && (
          <div className="text-xs opacity-70 mb-1">
            Re: {message.related_entity_type} {message.related_entity_id?.slice(0, 8)}
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">{timeAgo}</span>
          {isCurrentUser && message.is_read && (
            <CheckCheck className="h-3 w-3 opacity-70" />
          )}
        </div>
      </Card>
    </div>
  );
}
