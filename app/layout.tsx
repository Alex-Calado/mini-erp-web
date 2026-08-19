import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';

export const metadata: Metadata = {
  title: 'Mini ERP - Gestão Comercial',
  description: 'Sistema de gestão ERP em Next.js 16 com PostgreSQL',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  const ehTelaPublica = pathname.startsWith('/login') || pathname.startsWith('/api/auth');

  return (
    <html lang="pt-BR">
      <body className="bg-slate-100 text-slate-900 font-sans antialiased">
        {ehTelaPublica ? (
          children
        ) : (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-y-auto">
              <Header />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
