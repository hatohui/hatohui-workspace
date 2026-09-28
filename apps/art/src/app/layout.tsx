import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { themeInitScript } from '@hatohui/libs/theme-init';
import { Providers } from '@/components/layout/Providers';
import { SiteHeader } from '@/components/layout/SiteHeader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Art',
  description: 'Gallery and commission requests',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
