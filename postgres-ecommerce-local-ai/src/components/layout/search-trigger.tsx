'use client';

import { useRouter } from 'next/navigation';

export default function SearchTrigger() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/search')}
      className="w-full bg-canvas border border-border rounded px-4 py-2 font-mono text-sm text-text/60 text-left cursor-pointer hover:border-accent-primary/50 transition-colors"
    >
      [Press ⌘K to ask AI]
    </button>
  );
}
