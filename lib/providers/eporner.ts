// Eporner API v2 (vídeos adultos, pública e sem chave). Docs: https://www.eporner.com/api/v2/
// Reprodução só via iframe de embed oficial; não há MP4 direto.
import { ProviderApiError, TIMEOUT_MS, cached, safeUrl } from '../cache';
import type { MediaItem } from '../types';

const API = 'https://www.eporner.com/api/v2/video/search/';
const TTL_MS = 5 * 60_000;
const HOSTS = ['eporner.com'];

type Thumb = { src: string; width: number; height: number };
type EpornerVideo = {
  id: string;
  title: string;
  url: string;
  length_min: string;
  embed: string;
  default_thumb: Thumb;
};
type EpornerResponse = { videos: EpornerVideo[]; page: number; total_pages: number };

export async function fetchEporner({
  query,
  order,
  page,
  perPage,
}: {
  query: string;
  order: string;
  page: number;
  perPage: number;
}) {
  const params = new URLSearchParams({
    query: query || 'all',
    order,
    page: String(page),
    per_page: String(perPage),
    thumbsize: 'big',
    lq: '0',
    format: 'json',
  });
  const url = `${API}?${params}`;

  const data = await cached(url, TTL_MS, async () => {
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new ProviderApiError(res.status, `Eporner respondeu HTTP ${res.status}.`);
    return (await res.json()) as EpornerResponse;
  });

  const items = (data.videos ?? []).flatMap((v): MediaItem[] => {
    const thumb = safeUrl(v.default_thumb?.src, HOSTS);
    const embed = safeUrl(v.embed, HOSTS);
    const link = safeUrl(v.url, HOSTS);
    if (!thumb || !embed || !link) return [];
    return [
      {
        id: `ep_${v.id}`,
        type: 'embed',
        title: v.title,
        credit: 'Eporner',
        link,
        isAdult: true,
        width: v.default_thumb.width || 640,
        height: v.default_thumb.height || 360,
        thumb,
        full: thumb,
        video: null,
        preview: null,
        embed,
        duration: v.length_min || null,
      },
    ];
  });

  return { items, hasMore: page < (data.total_pages ?? 0) };
}
