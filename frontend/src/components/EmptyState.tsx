interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon = 'inbox', title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-surface border border-outline-variant rounded-xl max-w-lg mx-auto w-full">
      <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl text-primary">{icon}</span>
      </div>
      <h3 className="text-headline-md font-bold text-primary mb-2">{title}</h3>
      <p className="text-body-md text-on-surface-variant mb-6">{message}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          <span className="material-symbols-outlined text-[20px]">add</span>
          {action.label}
        </button>
      )}
    </div>
  );
}
