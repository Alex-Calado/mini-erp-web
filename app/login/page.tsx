'use client';

import Link from 'next/link';

export default function PaginaLogin() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full p-8 space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white font-extrabold text-2xl rounded-2xl shadow-lg mb-2">
          ERP
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Modo Livre de Testes Ativado</h1>
          <p className="text-slate-500 text-sm">
            A autenticação foi desativada temporariamente. Você tem acesso direto e irrestrito a todas as rotas do sistema.
          </p>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
          ✅ Não é necessário digitar usuário nem senha. Clique no botão abaixo para acessar o Dashboard.
        </div>

        <Link
          href="/"
          className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-md text-center"
        >
          🚀 Acessar o Mini ERP sem Login
        </Link>
      </div>
    </div>
  );
}
