import { NextResponse, type NextRequest } from 'next/server';
import { ProviderApiError } from '@/lib/cache';
import { findCategory } from '@/lib/categories';
import { ProviderConfigError, fetchContent } from '@/lib/content';
import { readNsfwPreference } from '@/lib/nsfw';
import { MAX_QUERY_LENGTH } from '@/lib/search';

const MAX_PAGE = 500;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const slug = params.get('c') || 'all';
  const query = (params.get('q') ?? '').trim();
  const page = Number(params.get('after') ?? '1');

  // NSFW decidido no servidor (flag global + cookie), nunca por query string.
  const includeAdult = await readNsfwPreference();
  const category = slug === 'all' ? null : findCategory(slug);

  // Categoria precisa bater com o modo: NSFW ligado = só adulto; desligado = só SFW.
  if (slug !== 'all' && (!category || category.nsfw !== includeAdult)) {
    return NextResponse.json({ error: 'Categoria inválida.' }, { status: 400 });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: 'Busca muito longa.' }, { status: 400 });
  }
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
    return NextResponse.json({ error: 'Cursor inválido.' }, { status: 400 });
  }

  try {
    const data = await fetchContent({ category: category ?? null, query, page, includeAdult });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err) {
    console.error('[api/content]', err);
    if (err instanceof ProviderConfigError) {
      return NextResponse.json({ error: 'Provedor de conteúdo não configurado.' }, { status: 503 });
    }
    const status = err instanceof ProviderApiError && err.status === 429 ? 429 : 502;
    return NextResponse.json({ error: 'Falha ao buscar conteúdo.' }, { status });
  }
}
