import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoginView } from "@/components/LoginView";
import { DashboardView } from "@/components/DashboardView";
import { TitleBar } from "@/components/TitleBar";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { Loader2 } from "lucide-react";

function App() {
  const { auth, authLoading, restore } = useAuth();
  const { loadSettings } = useSettings();

  useEffect(() => {
    restore();
    loadSettings();
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TitleBar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!auth.authenticated) {
    return (
      <TooltipProvider>
        <div className="flex h-screen flex-col bg-background">
          <TitleBar />
          <LoginView />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background text-foreground">
        <TitleBar />
        <DashboardView />
      </div>
    </TooltipProvider>
  );
}

export default App;
