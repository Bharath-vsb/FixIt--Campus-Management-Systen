import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-0 md:right-6 left-0 md:left-auto flex flex-col items-center md:items-end gap-2 z-[200] pointer-events-none px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-level-2 pointer-events-auto transform transition-all duration-300 animate-fade-in-up ${
              toast.type === 'error' ? 'bg-error-container text-on-error-container' :
              toast.type === 'success' ? 'bg-[#D1FAE5] text-[#065F46]' :
              'bg-surface-container-highest text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {toast.type === 'error' ? 'error' : toast.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <span className="text-label-md">{toast.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
