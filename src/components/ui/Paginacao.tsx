import Link from 'next/link';

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  limite: number;
  baseUrl: string;
  params: Record<string, string | undefined>;
}

export function Paginacao({
  paginaAtual,
  totalPaginas,
  totalRegistros,
  limite,
  baseUrl,
  params,
}: PaginacaoProps) {
  if (totalRegistros === 0) return null;

  const inicio = (paginaAtual - 1) * limite + 1;
  const fim = Math.min(paginaAtual * limite, totalRegistros);

  const criarUrlPagina = (numPagina: number) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([chave, valor]) => {
      if (valor && chave !== 'pagina') {
        searchParams.set(chave, valor);
      }
    });

    searchParams.set('pagina', String(numPagina));
    return `${baseUrl}?${searchParams.toString()}`;
  };

  const temAnterior = paginaAtual > 1;
  const temProxima = paginaAtual < totalPaginas;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
      <div>
        Mostrando <strong className="text-slate-900">{inicio}</strong> a{' '}
        <strong className="text-slate-900">{fim}</strong> de{' '}
        <strong className="text-slate-900">{totalRegistros}</strong> registros
      </div>

      <div className="flex items-center gap-2">
        {temAnterior ? (
          <Link
            href={criarUrlPagina(paginaAtual - 1)}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 font-medium rounded-lg text-slate-700 transition-colors shadow-xs"
          >
            ← Anterior
          </Link>
        ) : (
          <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-400 font-medium rounded-lg cursor-not-allowed">
            ← Anterior
          </span>
        )}

        <span className="px-3 py-1.5 font-bold text-slate-800 bg-white border border-slate-200 rounded-lg">
          Página {paginaAtual} de {totalPaginas}
        </span>

        {temProxima ? (
          <Link
            href={criarUrlPagina(paginaAtual + 1)}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 font-medium rounded-lg text-slate-700 transition-colors shadow-xs"
          >
            Próxima →
          </Link>
        ) : (
          <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-400 font-medium rounded-lg cursor-not-allowed">
            Próxima →
          </span>
        )}
      </div>
    </div>
  );
}
