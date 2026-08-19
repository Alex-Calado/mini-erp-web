'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ProdutosService } from './produtos.service';
import { CriarProdutoSchema, AtualizarProdutoSchema } from './produtos.schemas';
import { tratarErroAction, ActionResult } from '@/src/lib/errors';

export async function criarProdutoAction(prevState: any, formData: FormData): Promise<ActionResult> {
  const dadosBrutos = {
    codigoSku: formData.get('codigoSku') as string,
    nome: formData.get('nome') as string,
    descricao: (formData.get('descricao') as string) || undefined,
    preco: formData.get('preco') as string,
    estoque: formData.get('estoque') as string,
    ativo: formData.get('ativo') !== 'false',
  };

  const validacao = CriarProdutoSchema.safeParse(dadosBrutos);

  if (!validacao.success) {
    return {
      sucesso: false,
      tipo: 'VALIDACAO',
      erros: validacao.error.flatten().fieldErrors,
      mensagem: 'Verifique os campos do produto.',
      inputs: dadosBrutos,
    };
  }

  try {
    await ProdutosService.criar(validacao.data);
  } catch (error) {
    return tratarErroAction(error, dadosBrutos);
  }

  revalidatePath('/produtos');
  redirect('/produtos');
}

export async function atualizarProdutoAction(prevState: any, formData: FormData): Promise<ActionResult> {
  const dadosBrutos = {
    id: formData.get('id') as string,
    codigoSku: formData.get('codigoSku') as string,
    nome: formData.get('nome') as string,
    descricao: (formData.get('descricao') as string) || undefined,
    preco: formData.get('preco') as string,
    estoque: formData.get('estoque') as string,
    ativo: formData.get('ativo') === 'true' || formData.get('ativo') === 'on',
  };

  const validacao = AtualizarProdutoSchema.safeParse(dadosBrutos);

  if (!validacao.success) {
    return {
      sucesso: false,
      tipo: 'VALIDACAO',
      erros: validacao.error.flatten().fieldErrors,
      mensagem: 'Verifique os campos do produto.',
      inputs: dadosBrutos,
    };
  }

  try {
    const { id, ...dados } = validacao.data;
    await ProdutosService.atualizar(id, dados);
  } catch (error) {
    return tratarErroAction(error, dadosBrutos);
  }

  revalidatePath('/produtos');
  redirect('/produtos');
}

export async function alternarStatusProdutoAction(id: string): Promise<ActionResult> {
  try {
    await ProdutosService.alternarStatus(id);
    revalidatePath('/produtos');
    return { sucesso: true };
  } catch (error) {
    return tratarErroAction(error);
  }
}

export async function excluirProdutoAction(id: string): Promise<ActionResult> {
  try {
    await ProdutosService.excluir(id);
    revalidatePath('/produtos');
    return { sucesso: true, mensagem: 'Produto excluído com sucesso.' };
  } catch (error) {
    return tratarErroAction(error);
  }
}
