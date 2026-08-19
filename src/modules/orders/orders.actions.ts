'use server';

import { revalidatePath } from 'next/cache';
import { OrdersService } from './orders.service';
import { CriarPedidoSchema, CriarPedidoInput } from './orders.schemas';
import { tratarErroAction, ActionResult } from '@/src/lib/errors';

export async function criarPedidoAction(dados: CriarPedidoInput): Promise<ActionResult> {
  const validacao = CriarPedidoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      tipo: 'VALIDACAO',
      erros: validacao.error.flatten().fieldErrors,
      mensagem: 'Verifique os itens do pedido.',
    };
  }

  try {
    const order = await OrdersService.criar(validacao.data);
    revalidatePath('/vendas');
    revalidatePath('/produtos');
    revalidatePath('/');
    return {
      sucesso: true,
      mensagem: 'Pedido emitido com sucesso!',
      dados: order,
    };
  } catch (error) {
    return tratarErroAction(error);
  }
}

export async function cancelarPedidoAction(id: string): Promise<ActionResult> {
  try {
    await OrdersService.cancelar(id);
    revalidatePath('/vendas');
    revalidatePath('/produtos');
    revalidatePath('/');
    return {
      sucesso: true,
      mensagem: 'Pedido cancelado e estoque estornado com sucesso.',
    };
  } catch (error) {
    return tratarErroAction(error);
  }
}
