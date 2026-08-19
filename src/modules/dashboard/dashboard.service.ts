import { prisma } from '@/src/db/prisma';

export interface MetricasDashboard {
  clientesAtivos: number;
  produtosAtivos: number;
  quantidadePedidos: number;
  faturamentoTotal: number;
  pedidosRecentes: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: Date;
    customer: {
      id: string;
      nome: string;
      cpfCnpj: string;
      email: string | null;
    };
  }>;
}

export class DashboardService {
  /**
   * Obtém todas as métricas do dashboard realizando agregações diretamente no banco de dados.
   * Não carrega tabelas completas na memória.
   */
  static async obterMetricas(): Promise<MetricasDashboard> {
    const [clientesAtivos, produtosAtivos, quantidadePedidos, faturamentoAgg, pedidosRecentes] =
      await Promise.all([
        // Agregação 1: Contagem de clientes ativos no banco
        prisma.cliente.count({
          where: { ativo: true },
        }),

        // Agregação 2: Contagem de produtos ativos no banco
        prisma.produto.count({
          where: { ativo: true },
        }),

        // Agregação 3: Contagem total de pedidos no banco
        prisma.order.count(),

        // Agregação 4: Soma do valor total dos pedidos confirmados no banco
        prisma.order.aggregate({
          _sum: {
            total: true,
          },
          where: {
            status: 'CONFIRMED',
          },
        }),

        // Agregação 5: Busca apenas os 10 pedidos mais recentes no banco (LIMIT 10)
        prisma.order.findMany({
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            customer: {
              select: {
                id: true,
                nome: true,
                cpfCnpj: true,
                email: true,
              },
            },
          },
        }),
      ]);

    return {
      clientesAtivos,
      produtosAtivos,
      quantidadePedidos,
      faturamentoTotal: Number(faturamentoAgg._sum.total || 0),
      pedidosRecentes: pedidosRecentes.map((order) => ({
        ...order,
        total: Number(order.total),
      })),
    };
  }
}
