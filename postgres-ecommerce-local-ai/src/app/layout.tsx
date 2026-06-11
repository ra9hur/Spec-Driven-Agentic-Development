import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/layout/header';
import MobileNav from '@/components/layout/mobile-nav';
import KbdShortcut from '@/components/layout/kbd-shortcut';
import { CartProvider } from '@/contexts/cart-context';

export const metadata: Metadata = {
  title: 'Postgres E-Com',
  description: 'Local AI-powered e-commerce platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas text-text" style={{ backgroundColor: '#090D16' }}>
        <CartProvider>
          <KbdShortcut />
          <Header />
          <MobileNav />
          <main className="min-h-screen">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
