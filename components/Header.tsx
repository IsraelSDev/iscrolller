'use client';

import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { setNsfw } from '@/app/actions';
import AgeGate from './AgeGate';
import SearchBar from './SearchBar';

type Props = { nsfwAllowed: boolean; nsfw: boolean; query: string };

export default function Header({ nsfwAllowed, nsfw, query }: Props) {
  const [optimisticNsfw, setOptimisticNsfw] = useOptimistic(nsfw);
  const [pending, startTransition] = useTransition();
  const [showAgeGate, setShowAgeGate] = useState(false);

  // A Server Action grava o cookie; o Next re-renderiza a rota com o novo feed.
  const apply = (value: boolean) =>
    startTransition(async () => {
      setOptimisticNsfw(value);
      await setNsfw(value);
    });

  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="iscrolller - home">
        <span className="brand-mark" aria-hidden="true">i</span>
        <span className="brand-name">
          scrolller<span className="brand-dim">.com</span>
        </span>
      </Link>

      <SearchBar query={query} />

      {nsfwAllowed && (
        <div className="filter-menu">
          <span className="filter-label" id="nsfw-label">NSFW</span>
          <button
            type="button"
            role="switch"
            aria-checked={optimisticNsfw}
            aria-labelledby="nsfw-label"
            disabled={pending}
            onClick={() => (optimisticNsfw ? apply(false) : setShowAgeGate(true))}
            className={`switch${optimisticNsfw ? ' active' : ''}`}
          >
            <span className="switch-thumb" />
          </button>
        </div>
      )}

      {showAgeGate && (
        <AgeGate
          onConfirm={() => {
            setShowAgeGate(false);
            apply(true);
          }}
          onCancel={() => setShowAgeGate(false)}
        />
      )}
    </header>
  );
}
