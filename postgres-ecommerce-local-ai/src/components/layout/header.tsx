import Link from 'next/link';
import { CartNavBadge } from '@/components/layout/cart-nav-badge';
import SearchTrigger from '@/components/layout/search-trigger';

export default function Header() {
  return (
    <header className="hidden xl:block w-full bg-container border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-text font-bold text-xl">
          Postgres E-Com
        </Link>

        <div className="flex-1 max-w-xl mx-8">
          <SearchTrigger />
        </div>

        <nav className="flex gap-6 text-text">
          <Link href="/shop">Shop</Link>
          <CartNavBadge>Cart</CartNavBadge>
          <Link href="/account">Account</Link>
        </nav>
      </div>
    </header>
  );
}
