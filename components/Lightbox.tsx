'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import type { MediaItem } from '@/lib/types';

type Props = {
  item: MediaItem;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export default function Lightbox({ item, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev?.();
      else if (e.key === 'ArrowRight') onNext?.();
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

  return (
    <div className="overlay lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.title}>
      <button type="button" className="lb-close" onClick={onClose} aria-label="Fechar">
        ✕
      </button>

      {onPrev && (
        <button
          type="button"
          className="lb-nav prev"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Anterior"
        >
          ‹
        </button>
      )}

      <div className="lb-content" onClick={(e) => e.stopPropagation()}>
        {item.type === 'video' && item.video ? (
          <video
            key={item.id}
            src={item.video}
            poster={item.full}
            controls
            autoPlay
            loop
            playsInline
            className="lb-media"
          />
        ) : item.type === 'embed' && item.embed ? (
          // Player oficial do provedor. Sandbox sem allow-popups/top-navigation bloqueia pop-ups de anúncio.
          <iframe
            key={item.id}
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
            key={item.id}
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
          <a href={item.link} target="_blank" rel="noopener noreferrer nofollow" className="lb-link">
            Ver original ↗
          </a>
        </div>
      </div>

      {onNext && (
        <button
          type="button"
          className="lb-nav next"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Próximo"
        >
          ›
        </button>
      )}
    </div>
  );
}
