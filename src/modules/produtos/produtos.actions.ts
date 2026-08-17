'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ProdutosService } from './produtos.service';
import { CriarProdutoSchema, AjustarEstoqueSchema } from './produtos.schemas';

export async function criarProdutoAction(prevState: any, formData: FormData) {
  const dadosBrutos = {
    codigoSku: formData.get('codigoSku') as string,
    nome: formData.get('nome') as string,
    descricao: (formData.get('descricao') as string) || undefined,
    preco: formData.get('preco') as string,
    estoque: formData.get('estoque') as string,
  };

  const validacao = CriarProdutoSchema.safeParse(dadosBrutos);

  if (!validacao.success) {
    return {
      sucesso: false,
      erros: validacao.error.flatten().fieldErrors,
      mensagem: 'Verifique os campos do produto.',
    };
  }

  try {
    await ProdutosService.criar(validacao.data);
  } catch (error: any) {
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao cadastrar produto.',
    };
  }

  revalidatePath('/produtos');
  redirect('/produtos');
}

export async function ajustarEstoqueAction(prevState: any, formData: FormData) {
  const dadosBrutos = {
    produtoId: formData.get('produtoId') as string,
    tipo: formData.get('tipo') as string,
    quantidade: formData.get('quantidade') as string,
    motivo: formData.get('motivo') as string,
  };

  const validacao = AjustarEstoqueSchema.safeParse(dadosBrutos);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem: 'Dados de ajuste de estoque inválidos.',
    };
  }

  try {
    await ProdutosService.ajustarEstoque(validacao.data);
    revalidatePath('/produtos');
    revalidatePath(`/produtos/${validacao.data.produtoId}`);
    return { sucesso: true, mensagem: 'Estoque atualizado com sucesso!' };
  } catch (error: any) {
    return { sucesso: false, mensagem: error.message || 'Erro ao ajustar estoque.' };
  }
}
