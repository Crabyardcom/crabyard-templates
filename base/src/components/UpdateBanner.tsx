import { useUpdater } from "@/hooks/useUpdater";

export function UpdateBanner() {
  const { available, version, downloading, progress, error, installUpdate, dismiss } = useUpdater();

  if (!available) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-xl">
      {downloading ? (
        <div>
          <p className="text-sm font-medium mb-2">Downloading update…</p>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 mt-1">{progress}%</p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium">
            Update available: <span className="text-orange-400">v{version}</span>
          </p>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          <div className="flex gap-2 mt-3">
            <button
              onClick={installUpdate}
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
            >
              Update now
            </button>
            <button
              onClick={dismiss}
              className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 transition cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
