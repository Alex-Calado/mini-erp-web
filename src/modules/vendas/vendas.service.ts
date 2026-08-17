import { prisma } from '@/src/db/prisma';
import { CriarVendaInput } from './vendas.schemas';

export class VendasService {
  static async listar() {
    return prisma.venda.findMany({
      include: {
        cliente: { select: { id: true, nome: true, cpfCnpj: true } },
        itens: {
          include: {
            produto: { select: { id: true, nome: true, codigoSku: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async obterPorId(id: string) {
    return prisma.venda.findUnique({
      where: { id },
      include: {
        cliente: true,
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });
  }

  static async criar(dados: CriarVendaInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Validar Cliente
      const cliente = await tx.cliente.findUnique({
        where: { id: dados.clienteId },
      });

      if (!cliente || !cliente.ativo) {
        throw new Error('Cliente não encontrado ou inativo.');
      }

      // 2. Buscar Produtos e Validar Estoque / Preço
      let valorTotalVenda = 0;
      const itensProcessados = [];

      for (const item of dados.itens) {
        const produto = await tx.produto.findUnique({
          where: { id: item.produtoId },
        });

        if (!produto || !produto.ativo) {
          throw new Error(`Produto #${item.produtoId} não encontrado ou inativo.`);
        }

        if (produto.estoque < item.quantidade) {
          throw new Error(
            `Estoque insuficiente para o produto "${produto.nome}". Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}`
          );
        }

        const precoUnitario = Number(produto.preco);
        const subtotal = precoUnitario * item.quantidade;
        valorTotalVenda += subtotal;

        itensProcessados.push({
          produtoId: produto.id,
          quantidade: item.quantidade,
          precoUnitario,
          subtotal,
          produtoNome: produto.nome,
          estoqueAtual: produto.estoque,
        });
      }

      // 3. Criar o Registro da Venda
      const venda = await tx.venda.create({
        data: {
          clienteId: cliente.id,
          valorTotal: valorTotalVenda,
          status: 'CONFIRMADA',
          itens: {
            create: itensProcessados.map((item) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          itens: true,
        },
      });

      // 4. Baixar Estoque e Registrar Movimentação para cada Item
      for (const item of itensProcessados) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: item.estoqueAtual - item.quantidade },
        });

        await tx.movimentacaoEstoque.create({
          data: {
            produtoId: item.produtoId,
            tipo: 'SAIDA',
            quantidade: item.quantidade,
            motivo: `Venda #${venda.numeroVenda}`,
          },
        });
      }

      return venda;
    });
  }

  static async cancelar(id: string) {
    return prisma.$transaction(async (tx) => {
      const venda = await tx.venda.findUnique({
        where: { id },
        include: { itens: true },
      });

      if (!venda) throw new Error('Venda não encontrada.');
      if (venda.status === 'CANCELADA') throw new Error('Venda já está cancelada.');

      // Estornar estoque
      for (const item of venda.itens) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { increment: item.quantidade } },
        });

        await tx.movimentacaoEstoque.create({
          data: {
            produtoId: item.produtoId,
            tipo: 'ENTRADA',
            quantidade: item.quantidade,
            motivo: `Estorno Venda #${venda.numeroVenda}`,
          },
        });
      }

      return tx.venda.update({
        where: { id },
        data: { status: 'CANCELADA' },
      });
    });
  }
}
