'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { MediaItem } from '@/lib/types';

type Props = {
  item: MediaItem;
  position: string; // ex.: "3 / 48"
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

const WHEEL_COOLDOWN_MS = 450;
const SWIPE_MIN_PX = 50;

// Visualizador vertical: ↑/↓ (ou ←/→), roda do mouse e swipe trocam de item;
// vídeo avança sozinho ao terminar.
export default function Lightbox({ item, position, onClose, onPrev, onNext }: Props) {
  const lastWheel = useRef(0);
  const touchY = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev?.();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        onNext?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  // Trava o scroll do body enquanto aberto.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 20) return;
    const now = Date.now();
    if (now - lastWheel.current < WHEEL_COOLDOWN_MS) return;
    lastWheel.current = now;
    if (e.deltaY > 0) onNext?.();
    else onPrev?.();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchY.current === null) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    touchY.current = null;
    if (dy > SWIPE_MIN_PX) onNext?.();
    else if (dy < -SWIPE_MIN_PX) onPrev?.();
  };

  const stop = (fn?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };

  return (
    <div
      className="overlay lightbox"
      onClick={onClose}
      onWheel={onWheel}
      onTouchStart={(e) => (touchY.current = e.touches[0].clientY)}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <button type="button" className="lb-close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className="lb-rail" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lb-nav" onClick={stop(onPrev)} disabled={!onPrev} aria-label="Previous">
          ▲
        </button>
        <span className="lb-pos">{position}</span>
        <button type="button" className="lb-nav" onClick={stop(onNext)} disabled={!onNext} aria-label="Next">
          ▼
        </button>
      </div>

      <div key={item.id} className="lb-content" onClick={(e) => e.stopPropagation()}>
        {item.type === 'video' && item.video ? (
          <video
            src={item.video}
            poster={item.full}
            controls
            autoPlay
            playsInline
            onEnded={() => onNext?.()}
            className="lb-media"
          />
        ) : item.type === 'embed' && item.embed ? (
          // Player oficial do provedor. Sandbox sem allow-popups/top-navigation bloqueia pop-ups de anúncio.
          <iframe
            src={item.embed}
            title={item.title}
            className="lb-embed"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        ) : (
          <Image
            src={item.full}
            alt={item.title}
            width={item.width}
            height={item.height}
            unoptimized
            referrerPolicy="no-referrer"
            priority
            className="lb-media"
          />
        )}
        <div className="lb-info">
          <strong>{item.title}</strong>
          <span>
            {item.credit}
            {item.duration ? ` · ${item.duration}` : ''}
            {item.isAdult ? ' · NSFW' : ''}
          </span>
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer nofollow" className="lb-link">
              View original ↗
            </a>
          )}
        </div>
      </div>

      <p className="lb-hint" aria-hidden="true">↑ ↓ to navigate · Esc to close</p>
    </div>
  );
}
