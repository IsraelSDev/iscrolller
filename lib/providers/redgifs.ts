// RedGIFs API v2 (imagens e vídeos adultos em HD). Token anônimo temporário, sem cadastro.
import { ProviderApiError, TIMEOUT_MS, cached, safeUrl } from '../cache';
import type { MediaItem } from '../types';

const API = 'https://api.redgifs.com/v2';
const TTL_MS = 5 * 60_000;
const TOKEN_TTL_MS = 12 * 60 * 60_000;
const HOSTS = ['redgifs.com'];

type RedgifsGif = {
  id: string;
  type: number; // 1 = vídeo, 2 = imagem
  width: number;
  height: number;
  duration?: number;
  userName?: string;
  description?: string | null;
  tags?: string[];
  urls: { hd?: string; sd?: string; poster?: string; thumbnail?: string };
};

// ---------- Token (cacheado; renovado ao expirar ou em 401) ----------

let token: { value: string; expiresAt: number } | null = null;
let tokenRequest: Promise<string> | null = null;

function getToken(): Promise<string> {
  if (token && token.expiresAt > Date.now()) return Promise.resolve(token.value);
  tokenRequest ??= (async () => {
    const res = await fetch(`${API}/auth/temporary`, { cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new ProviderApiError(res.status, `RedGIFs token HTTP ${res.status}.`);
    const { token: value } = (await res.json()) as { token?: string };
    if (!value) throw new ProviderApiError(502, 'RedGIFs: token ausente.');
    token = { value, expiresAt: Date.now() + TOKEN_TTL_MS };
    return value;
  })().finally(() => {
    tokenRequest = null;
  });
  return tokenRequest;
}

async function request(url: string, retried = false): Promise<{ gifs: RedgifsGif[]; pages: number }> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${await getToken()}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 401 && !retried) {
    token = null;
    return request(url, true);
  }
  if (!res.ok) throw new ProviderApiError(res.status, `RedGIFs respondeu HTTP ${res.status}.`);
  return res.json();
}

const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export async function fetchRedgifs({
  query,
  media,
  page,
  perPage,
}: {
  query: string;
  media: 'image' | 'video';
  page: number;
  perPage: number;
}) {
  const params = new URLSearchParams({ order: 'trending', count: String(perPage), page: String(page) });
  if (query) params.set('search_text', query);
  if (media === 'image') params.set('type', 'i');
  const url = `${API}/gifs/search?${params}`;

  const data = await cached(url, TTL_MS, () => request(url));

  const items = (data.gifs ?? []).flatMap((g): MediaItem[] => {
    if (g.width <= 0 || g.height <= 0) return [];
    const hd = safeUrl(g.urls.hd, HOSTS);
    const sd = safeUrl(g.urls.sd, HOSTS);
    const poster = safeUrl(g.urls.poster, HOSTS) ?? safeUrl(g.urls.thumbnail, HOSTS);
    const base = {
      id: `rg_${g.id}`,
      title: g.description?.trim() || g.tags?.slice(0, 3).join(' · ') || 'RedGIFs',
      credit: g.userName ? `@${g.userName} · RedGIFs` : 'RedGIFs',
      link: null, // sem link externo para o RedGIFs
      isAdult: true,
      width: g.width,
      height: g.height,
      embed: null,
    };

    if (g.type === 2) {
      const full = hd ?? sd;
      if (!full) return [];
      return [{ ...base, type: 'image', thumb: sd ?? full, full, video: null, preview: null, duration: null }];
    }
    const video = hd ?? sd;
    if (!video || !poster) return [];
    return [
      {
        ...base,
        type: 'video',
        thumb: poster,
        full: poster,
        video,
        preview: sd ?? video,
        duration: g.duration ? formatDuration(g.duration) : null,
      },
    ];
  });

  return { items, hasMore: page < (data.pages ?? 0) };
}
