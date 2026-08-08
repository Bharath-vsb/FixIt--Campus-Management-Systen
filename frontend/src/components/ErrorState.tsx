interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-error-container/20 border border-error/20 rounded-xl max-w-lg mx-auto w-full">
      <span className="material-symbols-outlined text-4xl text-error mb-4">error</span>
      <h3 className="text-headline-md font-bold text-on-surface mb-2">Error</h3>
      <p className="text-body-md text-on-surface-variant mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Try Again
        </button>
      )}
    </div>
  );
}
