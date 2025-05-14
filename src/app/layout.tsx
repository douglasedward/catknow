import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'CatKnow - Discover Cat Breeds',
  description: 'Explore and learn about different cat breeds',
  icons: {
    icon: [
      {
        url: '/favicon-dark.ico',
        media: '(prefers-color-scheme: light)'
      },
      {
        url: '/favicon-light.ico',
        media: '(prefers-color-scheme: dark)'
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <main className="container mx-auto px-4">
            <div className="flex flex-col items-center mt-10">
              <h1 className="text-6xl font-bold">CATKNOW</h1>
            </div>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
