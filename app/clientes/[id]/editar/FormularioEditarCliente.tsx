'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { atualizarClienteAction } from '@/src/modules/clientes/clientes.actions';

interface ClienteData {
  id: string;
  cpfCnpj: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
}

export function FormularioEditarCliente({ cliente }: { cliente: ClienteData }) {
  const [state, formAction, isPending] = useActionState(atualizarClienteAction, null);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Editar Cliente</h1>
      <p className="text-slate-500 text-sm mb-6">
        Atualize as informações do cliente registrado no sistema.
      </p>

      {state?.mensagem && !state?.sucesso && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg font-medium">
          ⚠️ {state.mensagem}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Campo Oculto para ID */}
        <input type="hidden" name="id" value={cliente.id} />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            CPF ou CNPJ *
          </label>
          <input
            type="text"
            name="cpfCnpj"
            defaultValue={cliente.cpfCnpj}
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
            defaultValue={cliente.nome}
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
            defaultValue={cliente.email || ''}
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
            defaultValue={cliente.telefone || ''}
            placeholder="(11) 99999-9999"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Checkbox de Status Ativo */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="ativo"
            name="ativo"
            value="true"
            defaultChecked={cliente.ativo}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="ativo" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
            Cliente Ativo no Sistema
          </label>
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
            {isPending ? 'Salvando Alterações...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
