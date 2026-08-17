import Link from 'next/link';
import { ClientesService } from '@/src/modules/clientes/clientes.service';
import { ProdutosService } from '@/src/modules/produtos/produtos.service';
import { VendasService } from '@/src/modules/vendas/vendas.service';

export default async function DashboardPage() {
  let clientes: Awaited<ReturnType<typeof ClientesService.listar>> = [];
  let produtos: Awaited<ReturnType<typeof ProdutosService.listar>> = [];
  let vendas: Awaited<ReturnType<typeof VendasService.listar>> = [];

  try {
    clientes = await ClientesService.listar();
    produtos = await ProdutosService.listar();
    vendas = await VendasService.listar();
  } catch (error) {
    console.error('Erro ao carregar dados do Dashboard:', error);
  }

  const faturamentoTotal = vendas
    .filter((v) => v.status === 'CONFIRMADA')
    .reduce((acc, v) => acc + Number(v.valorTotal), 0);

  const produtosEstoqueBaixo = produtos.filter((p) => p.estoque < 5);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header do Dashboard */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão Geral - Dashboard ERP</h1>
        <p className="text-slate-500 text-sm">Resumo operacional, vendas e alertas de estoque</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faturamento Total</p>
          <p className="text-2xl font-extrabold text-emerald-600">
            R$ {faturamentoTotal.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400">Vendas confirmadas</p>
        </div>

        {/* Card 2: Vendas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vendas Realizadas</p>
          <p className="text-2xl font-extrabold text-slate-900">{vendas.length}</p>
          <p className="text-xs text-slate-400">Pedidos registrados</p>
        </div>

        {/* Card 3: Clientes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clientes</p>
          <p className="text-2xl font-extrabold text-slate-900">{clientes.length}</p>
          <p className="text-xs text-slate-400">Clientes na base</p>
        </div>

        {/* Card 4: Alerta Estoque */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alertas de Estoque</p>
          <p className={`text-2xl font-extrabold ${produtosEstoqueBaixo.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {produtosEstoqueBaixo.length}
          </p>
          <p className="text-xs text-slate-400">Produtos &lt; 5 unidades</p>
        </div>
      </div>

      {/* Seção Principal: Atalhos e Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Últimas Vendas */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-sm">Últimas Vendas Emitidas</h2>
            <Link href="/vendas" className="text-xs text-blue-600 font-semibold hover:underline">
              Ver todas →
            </Link>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Cliente</th>
                <th className="p-3 text-right">Valor Total</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">
                    Nenhuma venda realizada.{' '}
                    <Link href="/vendas/nova" className="text-blue-600 underline font-medium">
                      Emitir primeira venda
                    </Link>
                  </td>
                </tr>
              ) : (
                vendas.slice(0, 5).map((venda) => (
                  <tr key={venda.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">#{venda.numeroVenda}</td>
                    <td className="p-3 font-medium text-slate-900">{venda.cliente.nome}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">R$ {Number(venda.valorTotal).toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        venda.status === 'CONFIRMADA' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {venda.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Lado Direito: Ações Rápidas e Estoque Crítico */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="font-bold text-slate-900 text-sm">Ações Rápidas</h2>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/vendas/nova"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg text-xs text-center transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>🛒</span> Nova Venda
              </Link>
              <Link
                href="/clientes/novo"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg text-xs text-center transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>👤</span> Cadastrar Cliente
              </Link>
              <Link
                href="/produtos/novo"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-3 rounded-lg text-xs text-center transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>📦</span> Cadastrar Produto
              </Link>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="font-bold text-slate-900 text-sm">Produtos com Estoque Crítico</h2>
            {produtosEstoqueBaixo.length === 0 ? (
              <p className="text-xs text-slate-400">Todos os produtos estão com estoque regular.</p>
            ) : (
              <div className="space-y-2 divide-y divide-slate-100">
                {produtosEstoqueBaixo.map((p) => (
                  <div key={p.id} className="pt-2 flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-800">{p.nome}</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {p.estoque} un
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
