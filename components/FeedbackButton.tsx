'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { sendFeedback, type FeedbackState } from '@/app/actions';

const RATINGS = [
  { value: 1, emoji: '😞', label: 'Bad' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'Ok' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😍', label: 'Great' },
];
const MAX = 1000;

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="feedback-fab" onClick={() => setOpen(true)}>
        💬 <span>Feedback</span>
      </button>
      {open && <FeedbackDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState<FeedbackState, FormData>(sendFeedback, { status: 'idle' });
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog feedback-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-title"
        onClick={(e) => e.stopPropagation()}
      >
        {state.status === 'ok' ? (
          <>
            <div className="fb-done" aria-hidden="true">💜</div>
            <h2 id="fb-title">Thanks for your feedback!</h2>
            <p>Your input helps make iscrolller better.</p>
            <div className="dialog-actions">
              <button type="button" className="btn primary" ref={firstRef} onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <form action={action}>
            <h2 id="fb-title">How are we doing?</h2>
            <p>Tell us what you like or what we could improve.</p>

            <div className="fb-ratings" role="radiogroup" aria-label="Rating">
              {RATINGS.map((r, i) => (
                <button
                  key={r.value}
                  ref={i === 0 ? firstRef : undefined}
                  type="button"
                  role="radio"
                  aria-checked={rating === r.value}
                  aria-label={r.label}
                  title={r.label}
                  className={`fb-rating${rating === r.value ? ' active' : ''}`}
                  onClick={() => setRating(r.value)}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
            <input type="hidden" name="rating" value={rating ?? ''} />
            <input type="hidden" name="page" value={typeof window !== 'undefined' ? location.pathname + location.search : '/'} />

            <textarea
              name="message"
              className="fb-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX}
              rows={4}
              placeholder="Tips, bugs, ideas… (optional)"
              aria-label="Message"
            />
            <div className="fb-counter">{message.length}/{MAX}</div>

            {state.status === 'error' && (
              <p className="fb-error" role="alert">{state.message}</p>
            )}

            <div className="dialog-actions">
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn primary" disabled={!rating || pending}>
                {pending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
