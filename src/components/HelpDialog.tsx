
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HelpDialogProps {
  trigger?: React.ReactNode;
}

export function HelpDialog({ trigger }: HelpDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>FitWell Connect - Hilfe</DialogTitle>
          <DialogDescription>
            Erfahren Sie, wie Sie FitWell Connect effektiv nutzen können.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="nutrition">Ernährung</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Navigation</h3>
            <p>Verwenden Sie die Navigationsleiste am unteren Rand des Bildschirms, um zwischen den verschiedenen Bereichen der App zu wechseln:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Home</strong> - Übersicht und Dashboard</li>
              <li><strong>Workouts</strong> - Trainingspläne und Übungen</li>
              <li><strong>Ernährung</strong> - Ernährungspläne und Tracking</li>
              <li><strong>Fortschritt</strong> - Verfolgen Sie Ihre Fortschritte</li>
              <li><strong>Chat</strong> - Kommunikation mit Ihrem Coach/Klienten</li>
            </ul>
          </TabsContent>
          <TabsContent value="workouts" className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Workout-Bereich</h3>
            <p>Im Workout-Bereich können Sie:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Trainingspläne einsehen und bearbeiten</li>
              <li>Eine Bibliothek von Übungen durchsuchen</li>
              <li>Trainingsergebnisse protokollieren</li>
              <li>Fortschritte verfolgen</li>
            </ul>
          </TabsContent>
          <TabsContent value="nutrition" className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Ernährungs-Bereich</h3>
            <p>Im Ernährungs-Bereich können Sie:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ernährungspläne einsehen und erstellen</li>
              <li>Ihre tägliche Nahrungsaufnahme protokollieren</li>
              <li>Wasseraufnahme verfolgen</li>
              <li>Nährwertstatistiken einsehen</li>
            </ul>
          </TabsContent>
        </Tabs>
        <div className="mt-6 text-sm text-muted-foreground">
          <p>Für weitere Unterstützung kontaktieren Sie bitte unseren Support unter support@fitwell.com</p>
          <p className="mt-2">FitWell Connect Version 1.0.0</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
