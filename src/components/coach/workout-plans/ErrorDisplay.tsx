
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  errorMessage: string;
  onRetry: () => void;
}

export const ErrorDisplay = ({ errorMessage, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="p-4 border border-red-300 rounded-md bg-red-50 text-red-700">
      <h3 className="font-medium">Error</h3>
      <p>{errorMessage}</p>
      <Button 
        variant="outline" 
        className="mt-2" 
        onClick={onRetry}
      >
        Try Again
      </Button>
    </div>
  );
};
