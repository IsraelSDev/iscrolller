import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://iscrolller.com'),
  title: { default: 'iscrolller', template: '%s · iscrolller' },
  description: 'Endless scrolling through HD images and videos, organized by topic.',
  applicationName: 'iscrolller',
  openGraph: {
    type: 'website',
    siteName: 'iscrolller',
    url: 'https://iscrolller.com',
    title: 'iscrolller',
    description: 'Endless scrolling through HD images and videos, organized by topic.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}
        <Analytics />
      </body>
    </html>
  );
}

