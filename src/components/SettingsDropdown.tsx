
import { useNavigate } from "react-router-dom";
import { LogOut, HelpCircle, Info, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function SettingsDropdown() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Sie wurden abgemeldet.",
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast({
        title: "Fehler beim Abmelden",
        description: "Es gab ein Problem beim Abmelden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  };

  const handleHelp = () => {
    // Open help dialog
    toast({
      title: "Hilfe",
      description: "Brauchen Sie Unterstützung? Kontaktieren Sie support@fitwell.com",
    });
  };

  const handleAbout = () => {
    // Show about/version info
    toast({
      title: "Über FitWell Connect",
      description: "Version 1.0.0 - Mit ♥ erstellt für Fitness-Enthusiasten",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Einstellungen</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Einstellungen</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleHelp}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Hilfe</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAbout}>
          <Info className="mr-2 h-4 w-4" />
          <span>Über FitWell</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Abmelden</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
