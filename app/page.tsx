import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import CategoryChips from '@/components/CategoryChips';
import Feed from '@/components/Feed';
import FeedbackButton from '@/components/FeedbackButton';
import { findCategory, visibleCategories } from '@/lib/categories';
import { ProviderConfigError, fetchContent } from '@/lib/content';
import { isNsfwEnabled, readNsfwPreference } from '@/lib/nsfw';
import { MAX_QUERY_LENGTH } from '@/lib/search';
import type { ContentPage } from '@/lib/types';

type Props = { searchParams: Promise<{ c?: string | string[]; q?: string | string[] }> };

export default async function Home({ searchParams }: Props) {
  const { c, q } = await searchParams;
  const nsfw = await readNsfwPreference();
  const categories = visibleCategories(nsfw);
  const slug = typeof c === 'string' ? c : 'all';
  const query = typeof q === 'string' ? q.trim().slice(0, MAX_QUERY_LENGTH) : '';

  // Categoria inexistente ou adulta com NSFW desligado: volta para o feed geral.
  if (slug !== 'all' && !categories.some((x) => x.slug === slug)) {
    redirect(query ? `/?q=${encodeURIComponent(query)}` : '/');
  }

  let firstPage: ContentPage | null = null;
  let error: string | null = null;
  try {
    firstPage = await fetchContent({
      category: slug === 'all' ? null : (findCategory(slug) ?? null),
      query,
      page: 1,
      includeAdult: nsfw,
    });
  } catch (err) {
    console.error('[page]', err);
    error =
      err instanceof ProviderConfigError
        ? err.message
        : 'Could not load content right now. Please try again shortly.';
  }

  return (
    <>
      <Header nsfwAllowed={isNsfwEnabled()} nsfw={nsfw} query={query} />
      <CategoryChips categories={categories} active={slug} query={query} />
      <main className="feed-container">
        {firstPage ? (
          <Feed
            key={`${slug}:${nsfw}:${query}`}
            category={slug}
            query={query}
            initialItems={firstPage.content}
            initialAfter={firstPage.after}
          />
        ) : (
          <div className="empty" role="alert">
            <p>{error}</p>
          </div>
        )}
      </main>
      <footer className="site-footer">
        {nsfw ? (
          <>
            Content via{' '}
            <a href="https://www.redgifs.com" target="_blank" rel="noopener noreferrer nofollow">RedGIFs</a>
            {' '}and{' '}
            <a href="https://www.eporner.com" target="_blank" rel="noopener noreferrer nofollow">Eporner</a>
          </>
        ) : (
          <>
            Photos provided by{' '}
            <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>
          </>
        )}
      </footer>
      <FeedbackButton />
    </>
  );
}
