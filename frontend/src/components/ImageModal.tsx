import { useEffect, useRef } from 'react';

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageModal({ src, alt, onClose }: ImageModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in"
    >
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-surface text-on-surface flex items-center justify-center shadow-lg hover:bg-surface-container transition-colors"
          aria-label="Close image"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <img
          src={src}
          alt={alt}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
        />
        {alt && (
          <p className="text-center text-white/70 text-sm mt-3">{alt}</p>
        )}
      </div>
    </div>
  );
}
