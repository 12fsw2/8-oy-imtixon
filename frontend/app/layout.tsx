import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Retail ERP — Do\'kon Boshqaruv Tizimi',
  description: 'Multi-tenant Retail ERP SaaS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
