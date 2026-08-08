export default function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div className="w-8 h-8 border-4 border-surface-container-highest border-t-primary rounded-full animate-spin"></div>
      <p className="text-label-sm text-on-surface-variant font-medium">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  return spinner;
}
