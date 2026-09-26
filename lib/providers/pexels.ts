// Pexels API (fotos SFW licenciadas). Docs: https://www.pexels.com/api/documentation/
// Termos exigem link visível para o Pexels e crédito ao fotógrafo.
import { ProviderApiError, ProviderConfigError, TIMEOUT_MS, cached, safeUrl } from '../cache';
import type { MediaItem } from '../types';

const API = 'https://api.pexels.com/v1';
const TTL_MS = 5 * 60_000;
const HOSTS = ['images.pexels.com'];

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  alt: string | null;
  photographer: string;
  src: { original: string };
};

type PexelsResponse = { photos: PexelsPhoto[]; next_page?: string };

export async function fetchPexels({ query, page, perPage }: { query: string; page: number; perPage: number }) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new ProviderConfigError('Defina PEXELS_API_KEY em .env.local (chave gratuita em pexels.com/api).');

  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (query) {
    params.set('query', query);
    params.set('locale', 'pt-BR');
  }
  const url = `${API}/${query ? 'search' : 'curated'}?${params}`;

  const data = await cached(url, TTL_MS, async () => {
    const res = await fetch(url, {
      headers: { Authorization: key },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new ProviderApiError(res.status, `Pexels respondeu HTTP ${res.status}.`);
    return (await res.json()) as PexelsResponse;
  });

  const items = data.photos.flatMap((p): MediaItem[] => {
    const original = safeUrl(p.src?.original, HOSTS);
    if (!original || p.width <= 0 || p.height <= 0) return [];
    // Imagens do Pexels aceitam parâmetros de redimensionamento na URL.
    const sized = (w: number) => `${original}?auto=compress&cs=tinysrgb&w=${w}`;
    return [
      {
        id: `px_${p.id}`,
        type: 'image',
        title: p.alt?.trim() || `Foto de ${p.photographer}`,
        credit: `📷 ${p.photographer} · Pexels`,
        link: p.url,
        isAdult: false,
        width: p.width,
        height: p.height,
        thumb: sized(600),
        full: sized(2400),
        video: null,
        preview: null,
        embed: null,
        duration: null,
      },
    ];
  });

  return { items, hasMore: Boolean(data.next_page) };
}
