
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ContextFeedbackButtonProps {
  entityType: string;
  entityId: string;
  entityTitle: string;
  receiverId: string;
  children?: React.ReactNode;
}

export function ContextFeedbackButton({
  entityType,
  entityId,
  entityTitle,
  receiverId,
  children
}: ContextFeedbackButtonProps) {
  const [message, setMessage] = useState(`Feedback on ${entityType}: ${entityTitle}\n\n`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendFeedback = async () => {
    if (!message.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to send feedback');
      }
      
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          receiver_id: receiverId,
          content: message,
          related_entity_type: entityType,
          related_entity_id: entityId
        }]);
      
      if (error) throw error;
      
      toast({
        title: 'Feedback sent',
        description: 'Your feedback has been sent successfully.'
      });
      
      setIsOpen(false);
      
      // Navigate to chat with this user
      const userRole = window.location.pathname.includes('/coach') ? 'coach' : 'client';
      navigate(`/${userRole}/chat`);
    } catch (err) {
      console.error('Error sending feedback:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to send feedback'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-1">
            <MessageCircle className="h-4 w-4" />
            Send Feedback
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Send Feedback</SheetTitle>
          <SheetDescription>
            Send feedback about {entityType} "{entityTitle}".
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your feedback here..."
            className="min-h-[200px]"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendFeedback} 
            disabled={!message.trim() || isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
