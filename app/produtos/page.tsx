import Link from 'next/link';
import { ProdutosService } from '@/src/modules/produtos/produtos.service';
import { alternarStatusProdutoAction } from '@/src/modules/produtos/produtos.actions';
import { BotaoExcluirProduto } from './BotaoExcluirProduto';
import { Paginacao } from '@/src/components/ui/Paginacao';
import { exigirSessaoServidor } from '@/src/lib/session';

export default async function PaginaProdutos({
  searchParams,
}: {
  searchParams: Promise<{
    busca?: string;
    status?: 'todos' | 'ativo' | 'inativo';
    categoria?: string;
    pagina?: string;
  }>;
}) {
  await exigirSessaoServidor();

  const params = await searchParams;
  const busca = params.busca || '';
  const status = params.status || 'todos';
  const categoria = params.categoria || '';
  const pagina = Number(params.pagina) || 1;

  let resultado = {
    itens: [] as Awaited<ReturnType<typeof ProdutosService.listarPaginado>>['itens'],
    total: 0,
    pagina: 1,
    limite: 20,
    totalPaginas: 1,
  };
  let categoriasDisponiveis: string[] = [];

  try {
    [resultado, categoriasDisponiveis] = await Promise.all([
      ProdutosService.listarPaginado({
        busca,
        status,
        categoria,
        pagina,
        limite: 20,
      }),
      ProdutosService.obterCategorias(),
    ]);
  } catch (error) {
    console.error('Erro ao carregar lista de produtos:', error);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de Produtos</h1>
          <p className="text-slate-500 text-sm">Gerencie o portfólio de produtos, categorias e estoques</p>
        </div>

        <Link
          href="/produtos/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors shadow-xs text-sm flex items-center gap-2"
        >
          <span>+</span> Novo Produto
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form method="GET" className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por SKU, nome, categoria ou descrição..."
            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />

          <select
            name="categoria"
            defaultValue={categoria}
            className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
          >
            <option value="">Todas as Categorias</option>
            {categoriasDisponiveis.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={status}
            className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Somente Ativos</option>
            <option value="inativo">Somente Inativos</option>
          </select>

          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors cursor-pointer"
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
              <th className="p-4">Categoria</th>
              <th className="p-4 text-right">Preço</th>
              <th className="p-4 text-center">Estoque</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {resultado.itens.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              resultado.itens.map((produto) => (
                <tr key={produto.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900 text-xs">
                    {produto.codigoSku}
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    <div>{produto.nome}</div>
                    {produto.descricao && (
                      <div className="text-xs text-slate-400 font-normal">{produto.descricao}</div>
                    )}
                  </td>
                  <td className="p-4">
                    {produto.categoria ? (
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {produto.categoria}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-semibold text-slate-900">
                    R$ {Number(produto.preco).toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md ${
                        produto.estoque < 5
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
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
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/produtos/${produto.id}/editar`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        Editar
                      </Link>

                      <form
                        action={async () => {
                          'use server';
                          await alternarStatusProdutoAction(produto.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs font-medium text-slate-600 hover:text-blue-600 underline cursor-pointer"
                        >
                          {produto.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </form>

                      <BotaoExcluirProduto produtoId={produto.id} produtoNome={produto.nome} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Paginacao
          paginaAtual={resultado.pagina}
          totalPaginas={resultado.totalPaginas}
          totalRegistros={resultado.total}
          limite={resultado.limite}
          baseUrl="/produtos"
          params={{ busca, status, categoria }}
        />
      </div>
    </div>
  );
}
