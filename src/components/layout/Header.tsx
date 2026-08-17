export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-slate-800">Ambiente de Desenvolvimento Local</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          ● Banco PostgreSQL Conectado
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-900">Operador ERP</p>
          <p className="text-xs text-slate-500">Administrador</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
          OP
        </div>
      </div>
    </header>
  );
}
