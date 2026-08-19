import Link from 'next/link';
import { ClientesService } from '@/src/modules/clientes/clientes.service';
import { alternarStatusClienteAction } from '@/src/modules/clientes/clientes.actions';
import { BotaoExcluirCliente } from './BotaoExcluirCliente';
import { Paginacao } from '@/src/components/ui/Paginacao';
import { exigirSessaoServidor } from '@/src/lib/session';

export default async function PaginaClientes({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; status?: 'todos' | 'ativo' | 'inativo'; pagina?: string }>;
}) {
  await exigirSessaoServidor();

  const params = await searchParams;
  const busca = params.busca || '';
  const status = params.status || 'todos';
  const pagina = Number(params.pagina) || 1;

  let resultado = {
    itens: [] as Awaited<ReturnType<typeof ClientesService.listarPaginado>>['itens'],
    total: 0,
    pagina: 1,
    limite: 20,
    totalPaginas: 1,
  };

  try {
    resultado = await ClientesService.listarPaginado({
      busca,
      status,
      pagina,
      limite: 20,
    });
  } catch (error) {
    console.error('Erro ao listar clientes paginados:', error);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cadastro de Clientes</h1>
          <p className="text-slate-500 text-sm">Gerencie os clientes registrados no sistema</p>
        </div>

        <Link
          href="/clientes/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors shadow-xs text-sm flex items-center gap-2"
        >
          <span>+</span> Novo Cliente
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form method="GET" className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />

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
              <th className="p-4">CPF / CNPJ</th>
              <th className="p-4">Nome / Razão Social</th>
              <th className="p-4">E-mail</th>
              <th className="p-4">Telefone</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {resultado.itens.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              resultado.itens.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-slate-600 text-xs">{cliente.cpfCnpj}</td>
                  <td className="p-4 font-medium text-slate-900">{cliente.nome}</td>
                  <td className="p-4 text-slate-600">{cliente.email || '—'}</td>
                  <td className="p-4 text-slate-600">{cliente.telefone || '—'}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                        cliente.ativo
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-rose-700 bg-rose-50 border-rose-200'
                      }`}
                    >
                      {cliente.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/clientes/${cliente.id}/editar`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        Editar
                      </Link>

                      <form
                        action={async () => {
                          'use server';
                          await alternarStatusClienteAction(cliente.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs font-medium text-slate-600 hover:text-blue-600 underline cursor-pointer"
                        >
                          {cliente.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </form>

                      <BotaoExcluirCliente clienteId={cliente.id} clienteNome={cliente.nome} />
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
          baseUrl="/clientes"
          params={{ busca, status }}
        />
      </div>
    </div>
  );
}
