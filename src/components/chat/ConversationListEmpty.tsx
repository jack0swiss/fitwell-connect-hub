
interface ConversationListEmptyProps {
  message: string;
}

export function ConversationListEmpty({ message }: ConversationListEmptyProps) {
  return (
    <div className="p-4 text-center text-muted-foreground">
      {message}
    </div>
  );
}
