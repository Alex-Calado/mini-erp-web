import { obterSessaoServidor } from '@/src/lib/session';
import { BotaoSair } from './BotaoSair';

export async function Header() {
  const session = await obterSessaoServidor();

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-slate-800">Ambiente de Desenvolvimento Local</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          ● Banco PostgreSQL Conectado
        </span>
      </div>

      {session ? (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900">{session.user.name}</p>
            <p className="text-[11px] text-slate-500">{session.user.email}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
            {session.user.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <BotaoSair />
        </div>
      ) : (
        <div className="text-xs text-slate-400">Não autenticado</div>
      )}
    </header>
  );
}
