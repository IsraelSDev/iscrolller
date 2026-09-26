import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://iscrolller.com'),
  title: { default: 'iscrolller', template: '%s · iscrolller' },
  description: 'Role infinitamente por imagens e vídeos em HD, organizados por tema.',
  applicationName: 'iscrolller',
  openGraph: {
    type: 'website',
    siteName: 'iscrolller',
    url: 'https://iscrolller.com',
    title: 'iscrolller',
    description: 'Role infinitamente por imagens e vídeos em HD, organizados por tema.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
