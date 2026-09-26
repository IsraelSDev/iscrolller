import Link from 'next/link';
import type { Category } from '@/lib/types';

type Props = { categories: Category[]; active: string; query: string };

// Troca de categoria preserva a busca atual.
function hrefFor(slug: string, query: string) {
  const params = new URLSearchParams();
  if (slug !== 'all') params.set('c', slug);
  if (query) params.set('q', query);
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

export default function CategoryChips({ categories, active, query }: Props) {
  const all: Pick<Category, 'slug' | 'name' | 'nsfw'> = { slug: 'all', name: 'Tudo', nsfw: false };

  return (
    <nav className="chips" aria-label="Categorias">
      {[all, ...categories].map((c) => (
        <Link
          key={c.slug}
          href={hrefFor(c.slug, query)}
          className={`chip${active === c.slug ? ' active' : ''}${c.nsfw ? ' nsfw' : ''}`}
          aria-current={active === c.slug ? 'page' : undefined}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
