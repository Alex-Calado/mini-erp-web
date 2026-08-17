'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { criarVendaAction } from '@/src/modules/vendas/vendas.actions';

interface ClienteOption {
  id: string;
  nome: string;
  cpfCnpj: string;
}

interface ProdutoOption {
  id: string;
  nome: string;
  codigoSku: string;
  preco: number;
  estoque: number;
}

interface ItemCarrinho {
  produtoId: string;
  produtoNome: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
  estoqueDisponivel: number;
}

export function FormularioVenda({
  clientes,
  produtos,
}: {
  clientes: ClienteOption[];
  produtos: ProdutoOption[];
}) {
  const router = useRouter();

  const [clienteId, setClienteId] = useState('');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState('');
  const [quantidadeInput, setQuantidadeInput] = useState(1);
  const [mensagemErro, setMensagemErro] = useState('');
  const [processando, setProcessando] = useState(false);

  const adicionarItem = () => {
    setMensagemErro('');
    if (!produtoSelecionadoId) {
      setMensagemErro('Selecione um produto.');
      return;
    }

    const prod = produtos.find((p) => p.id === produtoSelecionadoId);
    if (!prod) return;

    if (quantidadeInput <= 0) {
      setMensagemErro('A quantidade deve ser maior que zero.');
      return;
    }

    if (prod.estoque < quantidadeInput) {
      setMensagemErro(`Estoque insuficiente! Saldo atual de "${prod.nome}": ${prod.estoque} un.`);
      return;
    }

    const itemExistenteIndex = carrinho.findIndex((item) => item.produtoId === prod.id);

    if (itemExistenteIndex >= 0) {
      const novaQtd = carrinho[itemExistenteIndex].quantidade + quantidadeInput;
      if (prod.estoque < novaQtd) {
        setMensagemErro(`Quantidade total no carrinho excede o estoque (${prod.estoque} un).`);
        return;
      }

      const novoCarrinho = [...carrinho];
      novoCarrinho[itemExistenteIndex].quantidade = novaQtd;
      novoCarrinho[itemExistenteIndex].subtotal = novaQtd * prod.preco;
      setCarrinho(novoCarrinho);
    } else {
      setCarrinho([
        ...carrinho,
        {
          produtoId: prod.id,
          produtoNome: prod.nome,
          precoUnitario: prod.preco,
          quantidade: quantidadeInput,
          subtotal: quantidadeInput * prod.preco,
          estoqueDisponivel: prod.estoque,
        },
      ]);
    }

    setProdutoSelecionadoId('');
    setQuantidadeInput(1);
  };

  const removerItem = (index: number) => {
    setCarrinho(carrinho.filter((_, i) => i !== index));
  };

  const valorTotal = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  const handleFinalizarVenda = async () => {
    setMensagemErro('');
    if (!clienteId) {
      setMensagemErro('Selecione um cliente para a venda.');
      return;
    }

    if (carrinho.length === 0) {
      setMensagemErro('Adicione pelo menos 1 produto ao carrinho.');
      return;
    }

    setProcessando(true);

    try {
      const resultado = await criarVendaAction({
        clienteId,
        itens: carrinho.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
      });

      if (resultado.sucesso) {
        router.push('/vendas');
      } else {
        setMensagemErro(resultado.mensagem || 'Erro ao processar venda.');
      }
    } catch (error: any) {
      setMensagemErro('Falha na comunicação com o servidor.');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="space-y-6">
      {mensagemErro && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
          ⚠️ {mensagemErro}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo: Cliente e Adicionar Produtos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seleção do Cliente */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              1. Selecione o Cliente
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cliente Comprador *
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Escolha um cliente cadastrado --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.cpfCnpj})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Adicionar Itens ao Carrinho */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              2. Adicionar Produtos
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Produto *
                </label>
                <select
                  value={produtoSelecionadoId}
                  onChange={(e) => setProdutoSelecionadoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Selecione o produto --</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.estoque === 0}>
                      {p.nome} (SKU: {p.codigoSku}) - R$ {p.preco.toFixed(2)} [Estoque: {p.estoque} un]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Qtd *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantidadeInput}
                  onChange={(e) => setQuantidadeInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={adicionarItem}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-xs cursor-pointer"
            >
              + Adicionar ao Pedido
            </button>
          </div>
        </div>

        {/* Painel Direito: Resumo do Pedido / Carrinho */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              3. Resumo do Pedido
            </h2>

            {carrinho.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                Nenhum produto adicionado ao carrinho ainda.
              </p>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {carrinho.map((item, index) => (
                  <div key={index} className="pt-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{item.produtoNome}</p>
                      <p className="text-xs text-slate-500">
                        {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="font-bold text-slate-900">
                        R$ {item.subtotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removerItem(index)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center text-lg font-bold text-slate-900">
              <span>Total da Venda:</span>
              <span className="text-emerald-700">R$ {valorTotal.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={handleFinalizarVenda}
              disabled={processando || carrinho.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-base transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {processando ? 'Processando e Baixando Estoque...' : 'Emitir e Finalizar Venda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
