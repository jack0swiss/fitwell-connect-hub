
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
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "@/components/ui/use-toast";

export function SettingsDropdown() {
  const navigate = useNavigate();
  const supabaseClient = useSupabaseClient();

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleHelp = () => {
    // Open help dialog
    toast({
      title: "Help",
      description: "Need assistance? Contact support at support@fitwell.com",
    });
  };

  const handleAbout = () => {
    // Show about/version info
    toast({
      title: "About FitWell Connect",
      description: "Version 1.0.0 - Created with ♥ for fitness enthusiasts",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
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
