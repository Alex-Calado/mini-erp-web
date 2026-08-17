'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const itemsNav = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/clientes', label: 'Clientes', icon: '👥' },
  { href: '/produtos', label: 'Produtos e Estoque', icon: '📦' },
  { href: '/vendas', label: 'Vendas', icon: '🛒' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-sm">
          E
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-tight leading-none">Mini ERP</h1>
          <span className="text-xs text-slate-400">Gestão Comercial</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        {itemsNav.map((item) => {
          const ativo = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                ativo
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 text-center">
        Next.js 16 • PostgreSQL + Prisma
      </div>
    </aside>
  );
}
