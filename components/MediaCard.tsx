'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { MediaItem } from '@/lib/types';

type Props = {
  item: MediaItem;
  priority?: boolean;
  onOpen: () => void;
};

export default function MediaCard({ item, priority, onOpen }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <figure className="media-block">
      <button
        type="button"
        className={`media-frame${loaded ? ' loaded' : ''}`}
        style={{ aspectRatio: `${item.width} / ${item.height}` }}
        onClick={onOpen}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        aria-label={`Open ${item.title}`}
      >
        {/* Provedores já entregam miniaturas redimensionadas: carrega direto do CDN, sem proxy. */}
        <Image
          src={item.thumb}
          alt={item.title}
          width={item.width}
          height={item.height}
          unoptimized
          referrerPolicy="no-referrer"
          priority={priority}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className="media-el"
        />

        {/* Preview em vídeo só é baixado no hover. */}
        {item.preview && hovering && (
          <video
            ref={videoRef}
            src={item.preview}
            muted
            loop
            autoPlay
            playsInline
            className="media-el media-preview"
          />
        )}

        {item.type !== 'image' && !hovering && <span className="play" aria-hidden="true">▶</span>}

        <span className="badges">
          {item.duration && <span className="badge">▶ {item.duration}</span>}
          {item.isAdult && <span className="badge nsfw">NSFW</span>}
        </span>

        <figcaption className="media-caption">
          <span className="media-title">{item.title}</span>
          <span className="media-meta">{item.credit}</span>
        </figcaption>
      </button>
    </figure>
  );
}
