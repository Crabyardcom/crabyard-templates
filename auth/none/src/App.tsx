import { useEffect } from "react";
import { DashboardView } from "@/components/DashboardView";
import { TitleBar } from "@/components/TitleBar";
import { useSettings } from "@/hooks/useSettings";

function App() {
  const { loadSettings } = useSettings();

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TitleBar />
      <DashboardView />
    </div>
  );
}

export default App;
