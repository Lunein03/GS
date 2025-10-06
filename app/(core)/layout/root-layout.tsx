import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import '../styles/globals.css';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const neoverse = localFont({
  src: '../../../public/fonts/neoversesans-regular.woff2',
  variable: '--font-neoverse',
  display: 'swap',
});

const neoverseBold = localFont({
  src: '../../../public/fonts/neoversesans-bold.woff2',
  variable: '--font-neoverse-bold',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
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
      <body className={`${neoverse.variable} ${neoverseBold.variable} ${inter.variable} font-sans overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
