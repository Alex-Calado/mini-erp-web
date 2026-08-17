'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { criarClienteAction } from '@/src/modules/clientes/clientes.actions';

export default function FormularioNovoCliente() {
  const [state, formAction, isPending] = useActionState(criarClienteAction, null);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <Link href="/clientes" className="text-sm text-slate-500 hover:text-slate-800 inline-block font-medium">
        ← Voltar para a lista de clientes
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Novo Cliente</h1>
        <p className="text-slate-500 text-sm mb-6">
          Preencha os dados do cliente para salvar no banco de dados.
        </p>

        {state?.mensagem && !state?.sucesso && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
            {state.mensagem}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              CPF ou CNPJ *
            </label>
            <input
              type="text"
              name="cpfCnpj"
              required
              placeholder="Ex: 12.345.678/0001-90"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {state?.erros?.cpfCnpj && (
              <p className="text-rose-600 text-xs mt-1">{state.erros.cpfCnpj[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome Completo / Razão Social *
            </label>
            <input
              type="text"
              name="nome"
              required
              placeholder="Ex: Empresa Alfa Ltda"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {state?.erros?.nome && (
              <p className="text-rose-600 text-xs mt-1">{state.erros.nome[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-mail (Opcional)
            </label>
            <input
              type="email"
              name="email"
              placeholder="exemplo@empresa.com"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {state?.erros?.email && (
              <p className="text-rose-600 text-xs mt-1">{state.erros.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefone (Opcional)
            </label>
            <input
              type="text"
              name="telefone"
              placeholder="(11) 99999-9999"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/clientes"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
