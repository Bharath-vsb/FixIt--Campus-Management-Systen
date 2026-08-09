import { useRef, useState } from 'react';

interface PhotoUploadProps {
  label: string;
  hint?: string;
  currentFile: File | null;
  onFileSelected: (file: File | null) => void;
  error?: string | null;
  /** If true, adds capture="environment" for mobile rear camera */
  captureCamera?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PhotoUpload({
  label,
  hint,
  currentFile,
  onFileSelected,
  error,
  captureCamera = false,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValidationError(null);

    if (!file) {
      setPreview(null);
      onFileSelected(null);
      return;
    }

    // Client-side validation (server validates too)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError('Please upload a JPG, PNG, or WEBP image.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      setValidationError('Image must be smaller than 5 MB.');
      e.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelected(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setValidationError(null);
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayError = validationError || error;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-label-md font-semibold text-on-surface block mb-1">
          {label}
        </label>
        {hint && (
          <p className="text-body-md text-on-surface-variant mb-3">{hint}</p>
        )}
      </div>

      {/* Preview */}
      {currentFile && preview ? (
        <div className="flex items-start gap-4 bg-surface-container-low rounded-xl p-4 border border-outline-variant">
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg border border-outline-variant shrink-0"
          />
          <div className="flex-grow min-w-0">
            <p className="text-label-md font-semibold text-primary truncate">{currentFile.name}</p>
            <p className="text-body-md text-on-surface-variant">{formatBytes(currentFile.size)}</p>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="btn-secondary text-sm py-1 px-3"
              >
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-error hover:text-error/80 text-sm flex items-center gap-1 font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Remove
              </button>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#10B981]">check_circle</span>
        </div>
      ) : (
        /* Drop / Click zone */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer
            ${displayError
              ? 'border-error bg-error-container/20'
              : 'border-outline-variant hover:border-primary hover:bg-primary/5'
            }`}
        >
          <span className="material-symbols-outlined text-[48px] text-outline">
            add_a_photo
          </span>
          <div className="text-center">
            <p className="text-label-md font-semibold text-on-surface">
              Click to upload photo
            </p>
            <p className="text-body-md text-on-surface-variant mt-1">
              JPG, PNG, or WEBP · Max 5 MB
            </p>
          </div>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        {...(captureCamera ? { capture: 'environment' as const } : {})}
        onChange={handleChange}
        className="hidden"
      />

      {/* Error */}
      {displayError && (
        <div className="flex items-center gap-2 text-error text-body-md">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {displayError}
        </div>
      )}
    </div>
  );
}
