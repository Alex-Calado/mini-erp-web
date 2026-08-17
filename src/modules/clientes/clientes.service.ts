import { prisma } from '@/src/db/prisma';
import { CriarClienteInput, AtualizarClienteInput } from './clientes.schemas';

export class ClientesService {
  static async listar(busca?: string) {
    return prisma.cliente.findMany({
      where: busca
        ? {
            OR: [
              { nome: { contains: busca, mode: 'insensitive' } },
              { cpfCnpj: { contains: busca } },
              { email: { contains: busca, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
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
      throw new Error('Já existe um cliente cadastrado com este CPF/CNPJ.');
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
    // Verificar se existe outro cliente usando o mesmo CPF/CNPJ
    const duplicado = await prisma.cliente.findFirst({
      where: {
        cpfCnpj: dados.cpfCnpj,
        id: { not: id },
      },
    });

    if (duplicado) {
      throw new Error('Este CPF/CNPJ já está cadastrado em outro cliente.');
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
    if (!cliente) throw new Error('Cliente não encontrado.');

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
      throw new Error('Cliente não encontrado.');
    }

    if (cliente._count.vendas > 0) {
      throw new Error('Não é possível excluir um cliente que já possui vendas vinculadas.');
    }

    return prisma.cliente.delete({
      where: { id },
    });
  }
}
