import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';

interface BaseProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' };
type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { as: 'select'; options: { value: string; label: string }[] };

type FormFieldProps = InputProps | TextareaProps | SelectProps;

const FormField = forwardRef<HTMLElement, FormFieldProps>((props, ref) => {
  const { label, error, helperText, required, className = '', as = 'input', ...rest } = props;

  const id = props.id || label.toLowerCase().replace(/\s+/g, '-');
  const baseClasses = `input-field ${error ? 'border-error focus:border-error focus:ring-error' : ''} ${className}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-label-md text-on-surface flex gap-1">
        {label}
        {required && <span className="text-error">*</span>}
      </label>
      
      {as === 'textarea' ? (
        <textarea
          id={id}
          ref={ref as any}
          className={baseClasses}
          {...(rest as any)}
        />
      ) : as === 'select' ? (
        <select
          id={id}
          ref={ref as any}
          className={baseClasses}
          {...(rest as any)}
        >
          <option value="" disabled selected>Select {label.toLowerCase()}</option>
          {(props as SelectProps).options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          ref={ref as any}
          className={baseClasses}
          {...(rest as any)}
        />
      )}

      {error && <p className="text-label-sm text-error">{error}</p>}
      {!error && helperText && <p className="text-label-sm text-on-surface-variant">{helperText}</p>}
    </div>
  );
});

FormField.displayName = 'FormField';
export default FormField;
