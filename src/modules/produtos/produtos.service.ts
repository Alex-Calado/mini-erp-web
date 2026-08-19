import { prisma } from '@/src/db/prisma';
import { AppError } from '@/src/lib/errors';
import { CriarProdutoInput, AtualizarProdutoInput } from './produtos.schemas';

export interface ListarProdutosParams {
  busca?: string;
  status?: 'todos' | 'ativo' | 'inativo';
  categoria?: string;
  pagina?: number;
  limite?: number;
}

export class ProdutosService {
  static async listarPaginado({
    busca,
    status = 'todos',
    categoria,
    pagina = 1,
    limite = 20,
  }: ListarProdutosParams = {}) {
    const pageNumber = Math.max(1, pagina);
    const pageSize = Math.max(1, limite);
    const skip = (pageNumber - 1) * pageSize;

    const condicaoStatus =
      status === 'ativo'
        ? { ativo: true }
        : status === 'inativo'
        ? { ativo: false }
        : undefined;

    const condicaoCategoria = categoria
      ? { categoria: { equals: categoria, mode: 'insensitive' as const } }
      : undefined;

    const condicaoBusca = busca
      ? {
          OR: [
            { nome: { contains: busca, mode: 'insensitive' as const } },
            { codigoSku: { contains: busca, mode: 'insensitive' as const } },
            { descricao: { contains: busca, mode: 'insensitive' as const } },
            { categoria: { contains: busca, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const where = {
      AND: [
        condicaoStatus || {},
        condicaoCategoria || {},
        condicaoBusca || {},
      ],
    };

    const [itens, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.produto.count({ where }),
    ]);

    const totalPaginas = Math.ceil(total / pageSize) || 1;

    return {
      itens,
      total,
      pagina: pageNumber,
      limite: pageSize,
      totalPaginas,
    };
  }

  static async listar(busca?: string) {
    const res = await this.listarPaginado({ busca, limite: 100 });
    return res.itens;
  }

  static async obterCategorias() {
    const produtos = await prisma.produto.findMany({
      where: { categoria: { not: null } },
      select: { categoria: true },
      distinct: ['categoria'],
      orderBy: { categoria: 'asc' },
    });
    return produtos.map((p) => p.categoria as string).filter(Boolean);
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
      throw new AppError('Já existe um produto cadastrado com este código SKU.', 'CONFLITO');
    }

    return prisma.$transaction(async (tx) => {
      const produto = await tx.produto.create({
        data: {
          codigoSku: dados.codigoSku,
          nome: dados.nome,
          descricao: dados.descricao || null,
          categoria: dados.categoria || null,
          preco: dados.preco,
          estoque: dados.estoque,
          ativo: dados.ativo ?? true,
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

  static async atualizar(id: string, dados: Omit<AtualizarProdutoInput, 'id'>) {
    const duplicado = await prisma.produto.findFirst({
      where: {
        codigoSku: dados.codigoSku,
        id: { not: id },
      },
    });

    if (duplicado) {
      throw new AppError('Este código SKU já está cadastrado em outro produto.', 'CONFLITO');
    }

    return prisma.produto.update({
      where: { id },
      data: {
        codigoSku: dados.codigoSku,
        nome: dados.nome,
        descricao: dados.descricao || null,
        categoria: dados.categoria || null,
        preco: dados.preco,
        estoque: dados.estoque,
        ativo: dados.ativo,
      },
    });
  }

  static async alternarStatus(id: string) {
    const produto = await prisma.produto.findUnique({ where: { id } });
    if (!produto) {
      throw new AppError('Produto não encontrado.', 'NAO_ENCONTRADO');
    }

    return prisma.produto.update({
      where: { id },
      data: { ativo: !produto.ativo },
    });
  }

  static async excluir(id: string) {
    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        _count: {
          select: { itensVenda: true },
        },
      },
    });

    if (!produto) {
      throw new AppError('Produto não encontrado.', 'NAO_ENCONTRADO');
    }

    if (produto._count.itensVenda > 0) {
      throw new AppError('Não é possível excluir um produto que já possui histórico de vendas.', 'REGRA_NEGOCIO');
    }

    return prisma.$transaction(async (tx) => {
      await tx.movimentacaoEstoque.deleteMany({
        where: { produtoId: id },
      });

      return tx.produto.delete({
        where: { id },
      });
    });
  }
}
