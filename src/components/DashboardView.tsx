import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/**
 * DashboardView — the main screen shown after authentication.
 *
 * This is a placeholder. Replace it with your app's real UI.
 * See README.md for guidance on extending the scaffold.
 */
export function DashboardView() {
  const { auth } = useAppStore();
  const { logout } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome{auth.username ? `, ${auth.username}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your app is running. Start building here.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-muted-foreground">
          Edit{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
            src/components/DashboardView.tsx
          </code>{" "}
          to get started.
        </p>
        <Button variant="outline" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
