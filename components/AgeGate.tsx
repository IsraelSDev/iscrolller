'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type Props = { onConfirm: () => void; onCancel: () => void };

export default function AgeGate({ onConfirm, onCancel }: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // Portal: o header usa backdrop-filter, que prenderia o overlay fixo dentro dele.
  return createPortal(
    <div className="overlay" onClick={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-badge">18+</div>
        <h2 id="age-title">Adult content</h2>
        <p>
          This content is intended for adults only. Please confirm you are 18 years of age or older.
        </p>
        <div className="dialog-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn primary" ref={confirmRef} onClick={onConfirm}>
            I'm 18+
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
