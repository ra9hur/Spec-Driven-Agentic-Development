import Link from 'next/link';

export default function MobileBottomNav() {
  return (
    <nav
      data-testid="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 bg-container border-t border-border md:hidden z-50"
    >
      <div className="flex justify-around py-2">
        <Link href="/" className="flex flex-col items-center text-text text-xs px-3 py-2">
          <span>Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center text-text text-xs px-3 py-2">
          <span>Search</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center text-text text-xs px-3 py-2">
          <span>Cart</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center text-text text-xs px-3 py-2">
          <span>Account</span>
        </Link>
      </div>
    </nav>
  );
}
