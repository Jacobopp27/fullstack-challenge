import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'User & Posts Portal',
  description: 'Portal de gestión de usuarios y posts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className={`${geist.className} min-h-full bg-gray-50 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
