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
        <h2 id="age-title">Conteúdo adulto</h2>
        <p>
          Este conteúdo é destinado apenas a maiores de 18 anos. Você confirma que tem 18 anos ou
          mais?
        </p>
        <div className="dialog-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn primary" ref={confirmRef} onClick={onConfirm}>
            Tenho 18+
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
