'use client';

import { useState } from 'react';
import { excluirProdutoAction } from '@/src/modules/produtos/produtos.actions';

export function BotaoExcluirProduto({
  produtoId,
  produtoNome,
}: {
  produtoId: string;
  produtoNome: string;
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleExcluir = async () => {
    setExcluindo(true);
    setErro(null);

    const resultado = await excluirProdutoAction(produtoId);

    if (resultado.sucesso) {
      setModalAberto(false);
    } else {
      setErro(resultado.mensagem || 'Erro ao excluir produto.');
    }
    setExcluindo(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErro(null);
          setModalAberto(true);
        }}
        className="text-xs font-medium text-rose-600 hover:text-rose-800 underline cursor-pointer"
      >
        Excluir
      </button>

      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold text-slate-900">Confirmar Exclusão</h3>
            </div>

            <p className="text-sm text-slate-600">
              Tem certeza que deseja excluir o produto <strong className="text-slate-900">{produtoNome}</strong>? Esta ação não pode ser desfeita.
            </p>

            {erro && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {erro}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                disabled={excluindo}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExcluir}
                disabled={excluindo}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {excluindo ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
