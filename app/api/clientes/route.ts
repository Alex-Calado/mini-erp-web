import { NextResponse } from 'next/server';
import { ClientesService } from '@/src/modules/clientes/clientes.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const busca = searchParams.get('busca') || undefined;

    const clientes = await ClientesService.listar(busca);

    return NextResponse.json(clientes, { status: 200 });
  } catch (error: any) {
    console.error('Erro na API GET /api/clientes:', error);
    return NextResponse.json(
      { mensagem: 'Erro interno ao buscar clientes.' },
      { status: 500 }
    );
  }
}
