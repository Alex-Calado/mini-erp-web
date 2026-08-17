import Link from 'next/link';
import { ClientesService } from '@/src/modules/clientes/clientes.service';
import { ProdutosService } from '@/src/modules/produtos/produtos.service';
import { FormularioVenda } from './FormularioVenda';

export default async function PaginaNovaVenda() {
  let clientes: { id: string; nome: string; cpfCnpj: string }[] = [];
  let produtos: { id: string; nome: string; codigoSku: string; preco: number; estoque: number }[] = [];

  try {
    const todosClientes = await ClientesService.listar();
    clientes = todosClientes
      .filter((c) => c.ativo)
      .map((c) => ({ id: c.id, nome: c.nome, cpfCnpj: c.cpfCnpj }));

    const todosProdutos = await ProdutosService.listar();
    produtos = todosProdutos
      .filter((p) => p.ativo)
      .map((p) => ({
        id: p.id,
        nome: p.nome,
        codigoSku: p.codigoSku,
        preco: Number(p.preco),
        estoque: p.estoque,
      }));
  } catch (error) {
    console.error('Erro ao carregar dados para nova venda:', error);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-4">
      <Link href="/vendas" className="text-sm text-slate-500 hover:text-slate-800 inline-block font-medium">
        ← Voltar para a lista de vendas
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Emissão de Nova Venda</h1>
        <p className="text-slate-500 text-sm">
          Selecione o cliente, monte o carrinho e confirme o pedido para baixar o estoque no banco de dados.
        </p>
      </div>

      <FormularioVenda clientes={clientes} produtos={produtos} />
    </div>
  );
}
