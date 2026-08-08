import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`relative bg-surface rounded-xl shadow-level-2 w-full ${maxWidth} flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-outline-variant">
          <h2 className="text-headline-md font-bold text-primary">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-outline-variant bg-surface-container-lowest rounded-b-xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
