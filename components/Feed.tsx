'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ContentPage, MediaItem } from '@/lib/types';
import MediaCard from './MediaCard';
import Lightbox from './Lightbox';

type Props = {
  category: string;
  query: string;
  initialItems: MediaItem[];
  initialAfter: string | null;
};

// Colunas do masonry por breakpoint (maior primeiro).
const BREAKPOINTS: [string, number][] = [
  ['(min-width: 1400px)', 5],
  ['(min-width: 1080px)', 4],
  ['(min-width: 720px)', 3],
];

function subscribe(onChange: () => void) {
  const queries = BREAKPOINTS.map(([q]) => window.matchMedia(q));
  queries.forEach((q) => q.addEventListener('change', onChange));
  return () => queries.forEach((q) => q.removeEventListener('change', onChange));
}

function getColumns() {
  return BREAKPOINTS.find(([q]) => window.matchMedia(q).matches)?.[1] ?? 2;
}

// Distribuição gulosa na coluna mais baixa: estável ao anexar itens (os já exibidos não mudam de lugar).
function distribute(items: MediaItem[], columns: number) {
  const heights = new Array<number>(columns).fill(0);
  const out = Array.from({ length: columns }, () => [] as { item: MediaItem; index: number }[]);
  items.forEach((item, index) => {
    let target = 0;
    for (let c = 1; c < columns; c++) if (heights[c] < heights[target]) target = c;
    out[target].push({ item, index });
    heights[target] += item.height / item.width;
  });
  return out;
}

export default function Feed({ category, query, initialItems, initialAfter }: Props) {
  const columns = useSyncExternalStore(subscribe, getColumns, () => 4);
  const [items, setItems] = useState(initialItems);
  const [after, setAfter] = useState(initialAfter);
  const hasMore = after !== null;
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const inflight = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (inflight.current || after === null) return;
    inflight.current = true;
    setStatus('loading');
    try {
      const params = new URLSearchParams({ after, c: category, q: query });
      const res = await fetch(`/api/content?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ContentPage = await res.json();
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id));
        return [...prev, ...data.content.filter((i) => !seen.has(i.id))];
      });
      setAfter(data.after);
      setStatus('idle');
    } catch (err) {
      console.error('Falha ao carregar conteúdo:', err);
      setStatus('error');
    } finally {
      inflight.current = false;
    }
  }, [after, category, query]);

  // Scroll infinito: pré-carrega antes do fim da página.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || status === 'error') return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore(), {
      rootMargin: '1200px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore, status]);

  const lanes = useMemo(() => distribute(items, columns), [items, columns]);
  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(() => setOpenIndex((i) => (i === null ? i : i - 1)), []);
  const next = useCallback(() => setOpenIndex((i) => (i === null ? i : i + 1)), []);

  // Só mostra "vazio" quando não há mais o que buscar (uma página pode vir sem mídia).
  if (items.length === 0 && !hasMore) {
    return (
      <p className="empty">
        {query ? (
          <>
            Nenhum resultado para <strong>“{query}”</strong>.
          </>
        ) : (
          'Nada por aqui ainda.'
        )}
      </p>
    );
  }

  const current = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <div className="masonry" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {lanes.map((lane, i) => (
          <div key={i} className="lane">
            {lane.map(({ item, index }) => (
              <MediaCard
                key={item.id}
                item={item}
                priority={index < columns}
                onOpen={() => setOpenIndex(index)}
              />
            ))}
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="loader" aria-live="polite">
        {status === 'loading' && <span className="spinner" aria-label="Carregando" />}
        {status === 'error' && (
          <button type="button" className="btn primary" onClick={loadMore}>
            Erro ao carregar. Tentar novamente
          </button>
        )}
        {status === 'idle' && !hasMore && <span className="end">Você chegou ao fim ✨</span>}
      </div>

      {current && openIndex !== null && (
        <Lightbox
          item={current}
          onClose={close}
          onPrev={openIndex > 0 ? prev : undefined}
          onNext={openIndex < items.length - 1 ? next : undefined}
        />
      )}
    </>
  );
}
