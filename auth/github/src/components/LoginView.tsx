import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, ExternalLink, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { openUrl } from "@tauri-apps/plugin-opener";

export function LoginView() {
  const { deviceCode, polling, error, startLogin } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!deviceCode) return;
    await navigator.clipboard.writeText(deviceCode.userCode);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  return (
    <div className="flex flex-1 items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
      <div className="relative mx-auto w-full max-w-sm space-y-8 p-8">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight">{import.meta.env.VITE_APP_NAME}</h1>
            <p className="text-xs text-muted-foreground">
              Sign in to continue
            </p>
          </div>
        </div>

        {!deviceCode && !polling && (
          <Button onClick={startLogin} className="w-full h-10 text-sm" size="lg">
            Sign in with GitHub
          </Button>
        )}

        {deviceCode && (
          <div className="space-y-5 rounded-xl border border-border/50 bg-card/50 p-5">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-3">
                Enter this code on GitHub:
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="rounded-lg bg-background px-4 py-2.5 text-xl font-mono font-bold tracking-[0.25em] border border-border/50">
                  {deviceCode.userCode}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyCode}
                  className="shrink-0 h-8 w-8"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-9 text-xs"
              onClick={() => openUrl(deviceCode.verificationUri)}
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Open GitHub
            </Button>

            {polling && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Waiting for authorization…</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
