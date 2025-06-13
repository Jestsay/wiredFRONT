import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = '',
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="wf-modal-overlay">
      {/* Backdrop */}
      <div 
        className="wf-modal-backdrop"
        onClick={onClose}
      />
      
      {/* Dialog Content */}
      <div className={`wf-modal-container ${className}`}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between" style={{
            marginBottom: 'var(--space-xl)',
            padding: '0 var(--space-xl)',
            paddingTop: 'var(--space-xl)'
          }}>
            {title && (
              <h2 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text)'
              }}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="wf-modal-close"
              >
                <X style={{
                  width: 'var(--text-sm)',
                  height: 'var(--text-sm)'
                }} />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div style={{
          padding: title || showCloseButton ? '0 var(--space-xl) var(--space-xl) var(--space-xl)' : 'var(--space-xl)'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}