import { useEffect } from "react";
import { DashboardView } from "@/components/DashboardView";
import { TitleBar } from "@/components/TitleBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UpdateBanner } from "@/components/UpdateBanner";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { Toaster } from "sonner";

function App() {
  const { loadSettings } = useSettings();
  useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col bg-background text-foreground">
        <TitleBar />
        <DashboardView />
        <UpdateBanner />
      </div>
      <Toaster position="bottom-right" richColors />
    </ErrorBoundary>
  );
}

export default App;
