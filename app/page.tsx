import Link from 'next/link';
import { DashboardService } from '@/src/modules/dashboard/dashboard.service';
import { exigirSessaoServidor } from '@/src/lib/session';

export default async function DashboardPage() {
  await exigirSessaoServidor();

  let metricas = {
    clientesAtivos: 0,
    produtosAtivos: 0,
    quantidadePedidos: 0,
    faturamentoTotal: 0,
    pedidosRecentes: [] as Awaited<ReturnType<typeof DashboardService.obterMetricas>>['pedidosRecentes'],
  };

  try {
    metricas = await DashboardService.obterMetricas();
  } catch (error) {
    console.error('Erro ao carregar agregações do Dashboard:', error);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header do Dashboard */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão Geral - Dashboard ERP</h1>
        <p className="text-slate-500 text-sm">Agregações em tempo real processadas no banco de dados</p>
      </div>

      {/* Cards de Métricas Solicitadas (Agregações no Banco) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Clientes Ativos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clientes Ativos</p>
          <p className="text-2xl font-extrabold text-blue-600">
            {metricas.clientesAtivos}
          </p>
          <p className="text-xs text-slate-400">Ativos na base</p>
        </div>

        {/* Card 2: Produtos Ativos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Produtos Ativos</p>
          <p className="text-2xl font-extrabold text-indigo-600">
            {metricas.produtosAtivos}
          </p>
          <p className="text-xs text-slate-400">Produtos no catálogo</p>
        </div>

        {/* Card 3: Quantidade de Pedidos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quantidade de Pedidos</p>
          <p className="text-2xl font-extrabold text-slate-900">
            {metricas.quantidadePedidos}
          </p>
          <p className="text-xs text-slate-400">Pedidos cadastrados</p>
        </div>

        {/* Card 4: Faturamento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faturamento</p>
          <p className="text-2xl font-extrabold text-emerald-600">
            R$ {metricas.faturamentoTotal.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400">Pedidos confirmados</p>
        </div>
      </div>

      {/* Seção Principal: 10 Pedidos Recentes e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Esquerdo: 10 Pedidos Recentes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">10 Pedidos Recentes</h2>
              <p className="text-slate-400 text-xs">Busca otimizada no banco via ordenação e limite</p>
            </div>
            <Link href="/vendas" className="text-xs text-blue-600 font-semibold hover:underline">
              Ver todos →
            </Link>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Cliente</th>
                <th className="p-3 text-right">Valor Total</th>
                <th className="p-3 text-center">Data</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {metricas.pedidosRecentes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Nenhum pedido realizado.{' '}
                    <Link href="/vendas/nova" className="text-blue-600 underline font-medium">
                      Emitir primeiro pedido
                    </Link>
                  </td>
                </tr>
              ) : (
                metricas.pedidosRecentes.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">#{order.id.substring(0, 8)}</td>
                    <td className="p-3 font-medium text-slate-900">{order.customer.nome}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">R$ {order.total.toFixed(2)}</td>
                    <td className="p-3 text-center text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          order.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Lado Direito: Ações Rápidas */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="font-bold text-slate-900 text-sm">Ações Rápidas</h2>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/vendas/nova"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg text-xs text-center transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>🛒</span> Novo Pedido
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
        </div>
      </div>
    </div>
  );
}
