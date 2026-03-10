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
    title: "Welcome to {{APP_NAME}} 👋",
    description:
      "This is your new desktop app, built with Tauri and React. Let's take a quick look around.",
  },
  {
    title: "Settings",
    description:
      "Click your avatar in the title bar to open Settings. You can configure your workspace folder, theme, and more.",
  },
  {
    title: "You're all set!",
    description:
      "Start building by editing src/components/DashboardView.tsx. Happy coding!",
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
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-muted-foreground">
            {current + 1} / {steps.length}
          </span>
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
