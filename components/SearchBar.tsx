'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { MAX_QUERY_LENGTH } from '@/lib/search';

const DEBOUNCE_MS = 300;

export default function SearchBar({ query }: { query: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(query);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Mantém o input em sincronia com a URL (voltar/avançar do navegador).
  useEffect(() => setValue(query), [query]);

  const navigate = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next) params.set('q', next);
    else params.delete('q');
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  // Busca enquanto digita, com debounce.
  useEffect(() => {
    const next = value.trim();
    if (next === query) return;
    const id = setTimeout(() => navigate(next), DEBOUNCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, query]);

  // Atalho "/" foca a busca.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key !== '/' || target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <form
      role="search"
      className={`search${pending ? ' pending' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        navigate(value.trim());
      }}
    >
      <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setValue('')}
        placeholder="Pesquisar conteúdo…"
        aria-label="Pesquisar conteúdo"
        maxLength={MAX_QUERY_LENGTH}
        autoComplete="off"
        spellCheck={false}
      />
      {value ? (
        <button type="button" className="search-clear" onClick={() => setValue('')} aria-label="Limpar busca">
          ✕
        </button>
      ) : (
        <kbd className="search-kbd" aria-hidden="true">/</kbd>
      )}
    </form>
  );
}
