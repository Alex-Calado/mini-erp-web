import Link from 'next/link';
import { OrdersService } from '@/src/modules/orders/orders.service';
import { cancelarPedidoAction } from '@/src/modules/orders/orders.actions';
import { exigirSessaoServidor } from '@/src/lib/session';

export default async function PaginaVendas() {
  await exigirSessaoServidor();

  let orders: Awaited<ReturnType<typeof OrdersService.listar>> = [];
  try {
    orders = await OrdersService.listar();
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Histórico de Pedidos (Orders)</h1>
          <p className="text-slate-500 text-sm">Visualize os pedidos emitidos e gerencie o faturamento</p>
        </div>

        <Link
          href="/vendas/nova"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors shadow-xs text-sm flex items-center gap-2"
        >
          <span>🛒</span> Novo Pedido
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-4">Pedido ID</th>
              <th className="p-4">Cliente</th>
              <th className="p-4 text-center">Itens</th>
              <th className="p-4 text-right">Valor Total</th>
              <th className="p-4 text-center">Data</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Nenhum pedido emitido ainda.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900 text-xs">
                    #{order.id.substring(0, 8)}
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    <div>{order.customer.nome}</div>
                    <div className="text-xs text-slate-400 font-mono">{order.customer.cpfCnpj}</div>
                  </td>
                  <td className="p-4 text-center font-medium text-slate-700">
                    {order.items.reduce((acc, item) => acc + item.quantity, 0)} un
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-700">
                    R$ {Number(order.total).toFixed(2)}
                  </td>
                  <td className="p-4 text-center text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                        order.status === 'CONFIRMED'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-rose-700 bg-rose-50 border-rose-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {order.status === 'CONFIRMED' && (
                      <form
                        action={async () => {
                          'use server';
                          await cancelarPedidoAction(order.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs font-medium text-rose-600 hover:text-rose-800 underline cursor-pointer"
                        >
                          Cancelar Pedido
                        </button>
                      </form>
                    )}
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
