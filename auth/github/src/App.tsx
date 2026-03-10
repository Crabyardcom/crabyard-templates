import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoginView } from "@/components/LoginView";
import { DashboardView } from "@/components/DashboardView";
import { TitleBar } from "@/components/TitleBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { UpdateBanner } from "@/components/UpdateBanner";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

function App() {
  const { auth, authLoading, restore } = useAuth();
  const { loadSettings } = useSettings();
  useTheme();

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
      <ErrorBoundary>
        <TooltipProvider>
          <div className="flex h-screen flex-col bg-background">
            <TitleBar />
            <LoginView />
          </div>
        </TooltipProvider>
        <Toaster position="bottom-right" richColors />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="flex h-screen flex-col bg-background text-foreground">
          <TitleBar />
          <DashboardView />
          <UpdateBanner />
        </div>
      </TooltipProvider>
      <Toaster position="bottom-right" richColors />
    </ErrorBoundary>
  );
}

export default App;
