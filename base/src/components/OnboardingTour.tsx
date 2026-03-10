import { useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORE_KEY = "onboarding_completed";

interface Step {
  title: string;
  description: string;
}

const defaultSteps: Step[] = [
  {
    title: "Welcome to {{APP_NAME}}",
    description:
      "Your new desktop app is built with Tauri v2 and React. It runs natively on Windows, macOS, and Linux with a tiny bundle size.",
  },
  {
    title: "Project Layout",
    description:
      "Your frontend lives in src/ (React + TypeScript). The native backend is in src-tauri/ (Rust). They communicate through Tauri commands — type-safe function calls between JS and Rust.",
  },
  {
    title: "Built-in Features",
    description:
      "You already have settings management, theme switching, window controls, error boundaries, and auto-updates wired up. Open Settings from the title bar to explore.",
  },
  {
    title: "Add Capabilities",
    description:
      "Need notifications, clipboard, SQLite, or file system access? Run 'taurikit add <feature>' in your terminal — it handles Rust deps, JS deps, and permissions for you.",
  },
  {
    title: "You're All Set!",
    description:
      "Replace DashboardView.tsx with your app's real UI. Run your dev server to see changes instantly. Check out the docs at taurikit.com for guides and examples.",
  },
];

export function OnboardingTour({
  steps = defaultSteps,
}: {
  steps?: Step[];
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    (async () => {
      const store = await load("app-state.json", { autoSave: true, defaults: {} });
      const done = await store.get<boolean>(STORE_KEY);
      if (!done) {
        setOpen(true);
      }
    })();
  }, []);

  const step = steps[current];
  const isLast = current === steps.length - 1;

  async function complete() {
    const store = await load("app-state.json", { autoSave: true, defaults: {} });
    await store.set(STORE_KEY, true);
    setOpen(false);
  }

  function next() {
    if (isLast) {
      complete();
    } else {
      setCurrent((c) => c + 1);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && complete()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{step.title}</DialogTitle>
          <DialogDescription className="pt-1 leading-relaxed">
            {step.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === current
                    ? "w-4 bg-primary"
                    : i < current
                      ? "w-1.5 bg-primary/40"
                      : "w-1.5 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {current > 0 && (
              <Button variant="outline" size="sm" onClick={() => setCurrent((c) => c - 1)}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={next}>
              {isLast ? "Get started" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
