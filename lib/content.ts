// Agrega os provedores num feed único, paginado por número de página (cursor opaco para o client).
// NSFW ligado → só provedores adultos. Desligado → só Pexels.
import { ProviderConfigError } from './cache';
import { fetchEporner } from './providers/eporner';
import { fetchPexels } from './providers/pexels';
import { fetchRedgifs } from './providers/redgifs';
import type { Category, ContentPage, MediaItem } from './types';

export { ProviderConfigError };

type Result = { items: MediaItem[]; hasMore: boolean };

// Round-robin entre fontes, preservando a ordem de cada uma.
function interleave(lists: MediaItem[][]) {
  const out: MediaItem[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) {
    for (const l of lists) if (i < l.length) out.push(l[i]);
  }
  return out;
}

export async function fetchContent({
  category,
  query,
  page,
  includeAdult,
}: {
  category: Category | null; // null = "Tudo"
  query: string;
  page: number;
  includeAdult: boolean;
}): Promise<ContentPage> {
  const term = [category?.query, query].filter(Boolean).join(' ');

  const sources: Promise<Result>[] = includeAdult
    ? [
        // 2 imagens : 1 vídeo RedGIFs : 1 vídeo Eporner
        fetchRedgifs({ query: term, media: 'image', page, perPage: 12 }),
        fetchRedgifs({ query: term, media: 'video', page, perPage: 6 }),
        fetchEporner({ query: term, order: term ? 'most-popular' : 'top-weekly', page, perPage: 6 }),
      ]
    : [fetchPexels({ query: term, page, perPage: 24 })];

  // Uma fonte falhando não derruba as outras; só propaga erro se todas falharem.
  const results = await Promise.allSettled(sources);
  const ok = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
  if (ok.length === 0) throw (results[0] as PromiseRejectedResult).reason;
  results.forEach((r) => r.status === 'rejected' && console.error('[content] fonte falhou:', r.reason));

  // Imagens RedGIFs vêm em dobro: divide em duas "filas" para manter a proporção 2:1:1.
  const lists = ok.map((r) => r.items);
  if (includeAdult && lists.length > 1) {
    const [images, ...rest] = lists;
    const odd = images.filter((_, i) => i % 2 === 1);
    lists.splice(0, lists.length, images.filter((_, i) => i % 2 === 0), odd, ...rest);
  }

  return {
    content: interleave(lists),
    after: ok.some((r) => r.hasMore) ? String(page + 1) : null,
  };
}
