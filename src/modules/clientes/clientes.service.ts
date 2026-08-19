import { prisma } from '@/src/db/prisma';
import { AppError } from '@/src/lib/errors';
import { CriarClienteInput, AtualizarClienteInput } from './clientes.schemas';

export interface ListarClientesParams {
  busca?: string;
  status?: 'todos' | 'ativo' | 'inativo';
  pagina?: number;
  limite?: number;
}

export class ClientesService {
  static async listarPaginado({
    busca,
    status = 'todos',
    pagina = 1,
    limite = 20,
  }: ListarClientesParams = {}) {
    const pageNumber = Math.max(1, pagina);
    const pageSize = Math.max(1, limite);
    const skip = (pageNumber - 1) * pageSize;

    const condicaoStatus =
      status === 'ativo'
        ? { ativo: true }
        : status === 'inativo'
        ? { ativo: false }
        : undefined;

    const condicaoBusca = busca
      ? {
          OR: [
            { nome: { contains: busca, mode: 'insensitive' as const } },
            { cpfCnpj: { contains: busca, mode: 'insensitive' as const } },
            { email: { contains: busca, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const where = {
      AND: [
        condicaoStatus || {},
        condicaoBusca || {},
      ],
    };

    const [itens, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.cliente.count({ where }),
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

  static async obterPorId(id: string) {
    return prisma.cliente.findUnique({
      where: { id },
    });
  }

  static async criar(dados: CriarClienteInput) {
    const clienteExistente = await prisma.cliente.findUnique({
      where: { cpfCnpj: dados.cpfCnpj },
    });

    if (clienteExistente) {
      throw new AppError('Já existe um cliente cadastrado com este CPF/CNPJ.', 'CONFLITO');
    }

    return prisma.cliente.create({
      data: {
        cpfCnpj: dados.cpfCnpj,
        nome: dados.nome,
        email: dados.email || null,
        telefone: dados.telefone || null,
        ativo: dados.ativo ?? true,
      },
    });
  }

  static async atualizar(id: string, dados: Omit<AtualizarClienteInput, 'id'>) {
    const duplicado = await prisma.cliente.findFirst({
      where: {
        cpfCnpj: dados.cpfCnpj,
        id: { not: id },
      },
    });

    if (duplicado) {
      throw new AppError('Este CPF/CNPJ já está cadastrado em outro cliente.', 'CONFLITO');
    }

    return prisma.cliente.update({
      where: { id },
      data: {
        cpfCnpj: dados.cpfCnpj,
        nome: dados.nome,
        email: dados.email || null,
        telefone: dados.telefone || null,
        ativo: dados.ativo,
      },
    });
  }

  static async alternarStatus(id: string) {
    const cliente = await this.obterPorId(id);
    if (!cliente) {
      throw new AppError('Cliente não encontrado.', 'NAO_ENCONTRADO');
    }

    return prisma.cliente.update({
      where: { id },
      data: { ativo: !cliente.ativo },
    });
  }

  static async excluir(id: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        _count: {
          select: { vendas: true },
        },
      },
    });

    if (!cliente) {
      throw new AppError('Cliente não encontrado.', 'NAO_ENCONTRADO');
    }

    if (cliente._count.vendas > 0) {
      throw new AppError('Não é possível excluir um cliente que já possui vendas vinculadas.', 'REGRA_NEGOCIO');
    }

    return prisma.cliente.delete({
      where: { id },
    });
  }
}
