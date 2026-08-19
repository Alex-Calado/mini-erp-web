import { NextResponse } from 'next/server';
import { ClientesService } from '@/src/modules/clientes/clientes.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cliente = await ClientesService.obterPorId(id);

    if (!cliente) {
      return NextResponse.json(
        { mensagem: 'Cliente não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente, { status: 200 });
  } catch (error: any) {
    console.error(`Erro na API GET /api/clientes/[id]:`, error);
    return NextResponse.json(
      { mensagem: 'Erro interno ao buscar cliente.' },
      { status: 500 }
    );
  }
}
