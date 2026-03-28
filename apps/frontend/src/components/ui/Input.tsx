'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
}

/**
 * Composant Input - WCAG 2.2 compliant
 * Labels associés, messages d'erreur clairs, zone de clic 44px
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, hint, className = '', id, required, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    const stateClass = error ? 'input-error' : success ? 'input-success' : '';

    return (
      <div className="mb-4">
        {label && (
          <label
            htmlFor={inputId}
            className={`label ${required ? 'label-required' : ''}`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${stateClass} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          required={required}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
