'use client';

import { ReactNode } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const icons: Record<AlertType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

/**
 * Composant Alert - Gestion des erreurs (Bastien & Scapin)
 * Messages clairs avec niveau de sévérité visuel
 */
export function Alert({ type, title, children, onClose, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`alert alert-${type} ${className}`}
    >
      <span className="text-xl" aria-hidden="true">
        {icons[type]}
      </span>
      <div className="flex-1">
        {title && <strong className="block mb-1">{title}</strong>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          aria-label="Fermer l'alerte"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Alert;
