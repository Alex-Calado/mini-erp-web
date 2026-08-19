import { AppError } from '@/src/lib/errors';

export interface ItemCalculadoInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface ItemCalculadoResultado {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PedidoCalculadoResultado {
  items: ItemCalculadoResultado[];
  total: number;
}

/**
 * Arredonda um valor numérico para 2 casas decimais de forma precisa.
 */
export function arredondarMoeda(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula o total de um item do pedido (quantidade * preço unitário obtido do servidor).
 */
export function calcularTotalItem(quantidade: number, precoUnitario: number): number {
  if (quantidade <= 0) {
    throw new AppError('A quantidade do item deve ser maior que zero (0).', 'VALIDACAO');
  }

  if (precoUnitario < 0) {
    throw new AppError('O preço unitário do produto não pode ser negativo.', 'VALIDACAO');
  }

  return arredondarMoeda(quantidade * precoUnitario);
}

/**
 * Calcula o total do pedido somando o total de cada item.
 */
export function calcularTotalPedido(itensInput: ItemCalculadoInput[]): PedidoCalculadoResultado {
  if (!itensInput || itensInput.length === 0) {
    throw new AppError('O pedido deve conter pelo menos 1 item.', 'VALIDACAO');
  }

  const items: ItemCalculadoResultado[] = itensInput.map((item) => {
    const totalItem = calcularTotalItem(item.quantity, item.unitPrice);
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: arredondarMoeda(item.unitPrice),
      total: totalItem,
    };
  });

  const totalPedido = arredondarMoeda(
    items.reduce((acc, item) => acc + item.total, 0)
  );

  return {
    items,
    total: totalPedido,
  };
}
