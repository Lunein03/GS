import '@/shared/lib/polyfills/node-file';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '@/shared/ui/theme-provider';
import { QueryProvider } from '@/shared/providers/query-provider';
import { ParallaxBackground } from '@/shared/ui/parallax-background';
import { ConditionalNavbar } from './conditional-navbar';
import { ConditionalFooter } from './conditional-footer';
import { MainContent } from './main-content';

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://intranet.example.com'),
  title: {
    default: 'Layout Intranet - Página Inicial',
    template: '%s | Layout Intranet',
  },
  description:
    'Template de página inicial para intranet corporativa, com seções de destaque, serviços, portfólio e contato.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/gs-logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/images/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <meta name="theme-color" content="#151c2a" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                const storedTheme = localStorage.getItem('theme') || 'dark';
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (storedTheme === 'system' && systemPrefersDark)) {
                  document.documentElement.classList.add('dark');
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#151c2a');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff');
                }
              } catch (e) {
                console.error('Erro ao aplicar tema:', e);
              }
            })();
          `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans overflow-x-hidden`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <ParallaxBackground />
            <div className="flex min-h-screen flex-col overflow-x-hidden">
              <ConditionalNavbar />
              <MainContent>{children}</MainContent>
              <ConditionalFooter />
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}


