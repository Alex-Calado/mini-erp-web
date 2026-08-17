'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { criarProdutoAction } from '@/src/modules/produtos/produtos.actions';

export default function FormularioNovoProduto() {
  const [state, formAction, isPending] = useActionState(criarProdutoAction, null);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <Link href="/produtos" className="text-sm text-slate-500 hover:text-slate-800 inline-block font-medium">
        ← Voltar para a lista de produtos
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Novo Produto</h1>
        <p className="text-slate-500 text-sm mb-6">
          Cadastre um produto no catálogo e defina o saldo inicial de estoque.
        </p>

        {state?.mensagem && !state?.sucesso && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
            {state.mensagem}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Código SKU *
              </label>
              <input
                type="text"
                name="codigoSku"
                required
                placeholder="Ex: PROD-001"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              {state?.erros?.codigoSku && (
                <p className="text-rose-600 text-xs mt-1">{state.erros.codigoSku[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Preço Unitário (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                name="preco"
                required
                placeholder="Ex: 149.90"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {state?.erros?.preco && (
                <p className="text-rose-600 text-xs mt-1">{state.erros.preco[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do Produto *
            </label>
            <input
              type="text"
              name="nome"
              required
              placeholder="Ex: Teclado Mecânico RGB"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {state?.erros?.nome && (
              <p className="text-rose-600 text-xs mt-1">{state.erros.nome[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estoque Inicial *
            </label>
            <input
              type="number"
              name="estoque"
              defaultValue="0"
              required
              min="0"
              placeholder="Ex: 50"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {state?.erros?.estoque && (
              <p className="text-rose-600 text-xs mt-1">{state.erros.estoque[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              name="descricao"
              rows={3}
              placeholder="Detalhes técnicos ou informações adicionais..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/produtos"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Salvando Produto...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
