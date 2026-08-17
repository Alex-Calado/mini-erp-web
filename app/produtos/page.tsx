import Link from 'next/link';
import { ProdutosService } from '@/src/modules/produtos/produtos.service';

export default async function PaginaProdutos({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>;
}) {
  const params = await searchParams;
  const busca = params.busca || '';

  let produtos: Awaited<ReturnType<typeof ProdutosService.listar>> = [];
  try {
    produtos = await ProdutosService.listar(busca);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produtos e Estoque</h1>
          <p className="text-slate-500 text-sm">Gerencie o catálogo e controle os saldos de estoque</p>
        </div>

        <Link
          href="/produtos/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors shadow-xs text-sm flex items-center gap-2"
        >
          <span>+</span> Novo Produto
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form method="GET" className="flex gap-3">
          <input
            type="text"
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por nome ou código SKU..."
            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Filtrar
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-4">SKU</th>
              <th className="p-4">Nome do Produto</th>
              <th className="p-4 text-right">Preço Unitário</th>
              <th className="p-4 text-center">Saldo em Estoque</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {produtos.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <tr key={produto.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-600">{produto.codigoSku}</td>
                  <td className="p-4 font-medium text-slate-900">
                    <div>{produto.nome}</div>
                    {produto.descricao && (
                      <div className="text-xs text-slate-400 font-normal">{produto.descricao}</div>
                    )}
                  </td>
                  <td className="p-4 text-right font-medium text-slate-900">
                    R$ {Number(produto.preco).toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                        produto.estoque === 0
                          ? 'bg-rose-100 text-rose-800'
                          : produto.estoque < 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {produto.estoque} un
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                        produto.ativo
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-rose-700 bg-rose-50 border-rose-200'
                      }`}
                    >
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
