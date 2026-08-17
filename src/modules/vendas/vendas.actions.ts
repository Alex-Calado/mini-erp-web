'use server';

import { revalidatePath } from 'next/cache';
import { VendasService } from './vendas.service';
import { CriarVendaSchema, CriarVendaInput } from './vendas.schemas';

export async function criarVendaAction(dados: CriarVendaInput) {
  const validacao = CriarVendaSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem: 'Dados da venda inválidos. Verifique os campos.',
      erros: validacao.error.flatten().fieldErrors,
    };
  }

  try {
    const venda = await VendasService.criar(validacao.data);

    revalidatePath('/vendas');
    revalidatePath('/produtos');
    revalidatePath('/');

    return { sucesso: true, vendaId: venda.id };
  } catch (error: any) {
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao processar venda.',
    };
  }
}

export async function cancelarVendaAction(id: string) {
  try {
    await VendasService.cancelar(id);
    revalidatePath('/vendas');
    revalidatePath(`/vendas/${id}`);
    revalidatePath('/produtos');
    revalidatePath('/');
    return { sucesso: true, mensagem: 'Venda cancelada com sucesso.' };
  } catch (error: any) {
    return { sucesso: false, mensagem: error.message || 'Erro ao cancelar venda.' };
  }
}
