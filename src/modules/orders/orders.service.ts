import { prisma } from '@/src/db/prisma';
import { AppError } from '@/src/lib/errors';
import { CriarPedidoInput } from './orders.schemas';
import { calcularTotalPedido } from './orders.calculator';
import {
  validarEntidadeAtiva,
  validarEstoqueDisponivel,
  calcularEstornoCancelamento,
} from './orders.validator';

export class OrdersService {
  static async listar() {
    return prisma.order.findMany({
      include: {
        customer: {
          select: { id: true, nome: true, cpfCnpj: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, nome: true, codigoSku: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async obterPorId(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Criação de pedido atômica em transação Prisma.
   * Busca preços no servidor, valida estoque e calcula totais 100% no backend.
   */
  static async criar(dados: CriarPedidoInput) {
    // 1. Validar Cliente
    const customer = await prisma.cliente.findUnique({
      where: { id: dados.customerId },
    });

    if (!customer) {
      throw new AppError('Cliente informado não foi encontrado.', 'NAO_ENCONTRADO');
    }

    validarEntidadeAtiva({ tipo: 'Cliente', nome: customer.nome, ativo: customer.ativo });

    // 2. Buscar Produtos em Lote (Evita N+1 queries)
    const productIds = [...new Set(dados.items.map((i) => i.productId))];
    const produtos = await prisma.produto.findMany({
      where: { id: { in: productIds } },
    });

    const mapaProdutos = new Map(produtos.map((p) => [p.id, p]));

    // Validar existência, status ativo e saldo de estoque de cada produto
    const itensParaCalculo = dados.items.map((item) => {
      const produto = mapaProdutos.get(item.productId);

      if (!produto) {
        throw new AppError(`Produto de ID "${item.productId}" não foi encontrado.`, 'NAO_ENCONTRADO');
      }

      validarEntidadeAtiva({ tipo: 'Produto', nome: produto.nome, ativo: produto.ativo });
      validarEstoqueDisponivel({
        productId: produto.id,
        produtoNome: produto.nome,
        estoqueDisponivel: produto.estoque,
        quantidadeSolicitada: item.quantity,
      });

      return {
        productId: produto.id,
        quantity: item.quantity,
        unitPrice: Number(produto.preco), // Preço confiável lido do PostgreSQL
      };
    });

    // 3. Calcular Totais no Servidor
    const calculo = calcularTotalPedido(itensParaCalculo);

    // 4. Executar Transação Atômica no PostgreSQL
    return prisma.$transaction(async (tx) => {
      // 4.1 Criar Registro do Pedido (Order)
      const order = await tx.order.create({
        data: {
          customerId: dados.customerId,
          total: calculo.total,
          status: 'CONFIRMED',
        },
      });

      // 4.2 Criar Itens do Pedido (OrderItems)
      await tx.orderItem.createMany({
        data: calculo.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      });

      // 4.3 Atualizar Estoque (Decremento Atômico) e Inserir Auditoria de Movimentação
      for (const item of calculo.items) {
        await tx.produto.update({
          where: { id: item.productId },
          data: {
            estoque: { decrement: item.quantity },
          },
        });

        await tx.movimentacaoEstoque.create({
          data: {
            produtoId: item.productId,
            tipo: 'SAIDA',
            quantidade: item.quantity,
            motivo: `Saída por Emissão de Pedido #${order.id.substring(0, 8)}`,
          },
        });
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
        },
      });
    });
  }

  static async cancelar(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new AppError('Pedido não encontrado.', 'NAO_ENCONTRADO');
    }

    const estornos = calcularEstornoCancelamento(order.status, order.items);

    return prisma.$transaction(async (tx) => {
      // Estornar estoque dos produtos
      for (const item of estornos) {
        await tx.produto.update({
          where: { id: item.productId },
          data: {
            estoque: { increment: item.incrementoEstoque },
          },
        });

        await tx.movimentacaoEstoque.create({
          data: {
            produtoId: item.productId,
            tipo: 'ENTRADA',
            quantidade: item.incrementoEstoque,
            motivo: `Estorno por Cancelamento do Pedido #${order.id.substring(0, 8)}`,
          },
        });
      }

      return tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });
  }
}
