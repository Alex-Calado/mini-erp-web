import { prisma } from '@/src/db/prisma';
import { CriarProdutoInput, AjustarEstoqueInput } from './produtos.schemas';

export class ProdutosService {
  static async listar(busca?: string) {
    return prisma.produto.findMany({
      where: busca
        ? {
            OR: [
              { nome: { contains: busca, mode: 'insensitive' } },
              { codigoSku: { contains: busca, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async obterPorId(id: string) {
    return prisma.produto.findUnique({
      where: { id },
      include: {
        movimentacoes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  static async criar(dados: CriarProdutoInput) {
    const skuExistente = await prisma.produto.findUnique({
      where: { codigoSku: dados.codigoSku },
    });

    if (skuExistente) {
      throw new Error('Já existe um produto com este código SKU.');
    }

    return prisma.$transaction(async (tx) => {
      const produto = await tx.produto.create({
        data: {
          codigoSku: dados.codigoSku,
          nome: dados.nome,
          descricao: dados.descricao,
          preco: dados.preco,
          estoque: dados.estoque,
        },
      });

      if (dados.estoque > 0) {
        await tx.movimentacaoEstoque.create({
          data: {
            produtoId: produto.id,
            tipo: 'ENTRADA',
            quantidade: dados.estoque,
            motivo: 'Estoque Inicial de Cadastro',
          },
        });
      }

      return produto;
    });
  }

  static async ajustarEstoque(dados: AjustarEstoqueInput) {
    return prisma.$transaction(async (tx) => {
      const produto = await tx.produto.findUnique({
        where: { id: dados.produtoId },
      });

      if (!produto) throw new Error('Produto não encontrado.');

      if (dados.tipo === 'SAIDA' && produto.estoque < dados.quantidade) {
        throw new Error(`Estoque insuficiente. Saldo atual: ${produto.estoque}`);
      }

      const novoSaldo =
        dados.tipo === 'ENTRADA'
          ? produto.estoque + dados.quantidade
          : produto.estoque - dados.quantidade;

      await tx.produto.update({
        where: { id: dados.produtoId },
        data: { estoque: novoSaldo },
      });

      return tx.movimentacaoEstoque.create({
        data: {
          produtoId: dados.produtoId,
          tipo: dados.tipo,
          quantidade: dados.quantidade,
          motivo: dados.motivo,
        },
      });
    });
  }

  static async alternarStatus(id: string) {
    const produto = await prisma.produto.findUnique({ where: { id } });
    if (!produto) throw new Error('Produto não encontrado');

    return prisma.produto.update({
      where: { id },
      data: { ativo: !produto.ativo },
    });
  }
}
