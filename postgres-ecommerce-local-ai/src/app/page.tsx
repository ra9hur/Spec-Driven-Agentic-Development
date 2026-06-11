import Link from 'next/link';

export default function Home() {
  return (
    <section className="w-full bg-gradient-to-br from-container via-canvas to-container py-20 md:py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text leading-tight">
          Discover Your{' '}
          <span className="text-accent-primary">Style</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-text/60 max-w-2xl mx-auto">
          AI-powered product discovery with real-time semantic search.
          Shop smarter, find exactly what you need.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="inline-block bg-accent-primary text-canvas font-semibold px-8 py-3 text-lg hover:bg-accent-primary/90 transition-colors"
          >
            Shop Now
          </Link>
          <Link
            href="/search"
            className="inline-block border border-accent-primary text-accent-primary font-semibold px-8 py-3 text-lg hover:bg-accent-primary/10 transition-colors"
          >
            AI Search
          </Link>
        </div>
      </div>
    </section>
  );
}
