import { AppError } from '@/src/lib/errors';

export interface EntityAtivaInput {
  tipo: 'Cliente' | 'Produto';
  nome: string;
  ativo: boolean;
}

export interface ItemEstoqueCheck {
  productId: string;
  produtoNome: string;
  estoqueDisponivel: number;
  quantidadeSolicitada: number;
}

export interface ItemEstornoInput {
  productId: string;
  quantity: number;
}

/**
 * [Regra 1 - Validação]: Garante que a entidade (Cliente ou Produto) está ativa para poder realizar transações.
 */
export function validarEntidadeAtiva(entidade: EntityAtivaInput): void {
  if (!entidade.ativo) {
    if (entidade.tipo === 'Cliente') {
      throw new AppError(`O cliente "${entidade.nome}" está inativo e não pode realizar pedidos.`, 'REGRA_NEGOCIO');
    } else {
      throw new AppError(`O produto "${entidade.nome}" está inativo no catálogo.`, 'REGRA_NEGOCIO');
    }
  }
}

/**
 * [Regra 2 - Integridade]: Valida se o saldo de estoque é suficiente para a quantidade solicitada.
 * Impede estoque negativo ou vendas sem saldo.
 */
export function validarEstoqueDisponivel(item: ItemEstoqueCheck): void {
  if (item.quantidadeSolicitada <= 0) {
    throw new AppError(`A quantidade solicitada para "${item.produtoNome}" deve ser maior que zero (0).`, 'VALIDACAO');
  }

  if (item.estoqueDisponivel < item.quantidadeSolicitada) {
    throw new AppError(
      `Estoque insuficiente para o produto "${item.produtoNome}". Saldo disponível: ${item.estoqueDisponivel} un, solicitado: ${item.quantidadeSolicitada} un.`,
      'REGRA_NEGOCIO'
    );
  }
}

/**
 * [Regra 3 - Integridade]: Valida as regras de cancelamento de pedido e calcula os incrementos de estorno de estoque.
 * Impede re-cancelamento de pedidos já cancelados.
 */
export function calcularEstornoCancelamento(
  statusAtual: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
  itensPedido: ItemEstornoInput[]
): Array<{ productId: string; incrementoEstoque: number }> {
  if (statusAtual === 'CANCELLED') {
    throw new AppError('Este pedido já está cancelado.', 'REGRA_NEGOCIO');
  }

  if (!itensPedido || itensPedido.length === 0) {
    throw new AppError('Não há itens no pedido para realizar o estorno de estoque.', 'VALIDACAO');
  }

  return itensPedido.map((item) => {
    if (item.quantity <= 0) {
      throw new AppError(`Quantidade de estorno inválida para o produto ID "${item.productId}".`, 'VALIDACAO');
    }
    return {
      productId: item.productId,
      incrementoEstoque: item.quantity,
    };
  });
}
