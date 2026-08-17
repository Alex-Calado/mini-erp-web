'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ClientesService } from './clientes.service';
import { CriarClienteSchema, AtualizarClienteSchema } from './clientes.schemas';

export async function criarClienteAction(prevState: any, formData: FormData) {
  const dadosBrutos = {
    cpfCnpj: formData.get('cpfCnpj') as string,
    nome: formData.get('nome') as string,
    email: (formData.get('email') as string) || undefined,
    telefone: (formData.get('telefone') as string) || undefined,
    ativo: formData.get('ativo') !== 'false',
  };

  const validacao = CriarClienteSchema.safeParse(dadosBrutos);

  if (!validacao.success) {
    return {
      sucesso: false,
      erros: validacao.error.flatten().fieldErrors,
      mensagem: 'Verifique os campos preenchidos.',
    };
  }

  try {
    await ClientesService.criar(validacao.data);
  } catch (error: any) {
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao cadastrar cliente.',
    };
  }

  revalidatePath('/clientes');
  redirect('/clientes');
}

export async function atualizarClienteAction(prevState: any, formData: FormData) {
  const dadosBrutos = {
    id: formData.get('id') as string,
    cpfCnpj: formData.get('cpfCnpj') as string,
    nome: formData.get('nome') as string,
    email: (formData.get('email') as string) || undefined,
    telefone: (formData.get('telefone') as string) || undefined,
    ativo: formData.get('ativo') === 'true' || formData.get('ativo') === 'on',
  };

  const validacao = AtualizarClienteSchema.safeParse(dadosBrutos);

  if (!validacao.success) {
    return {
      sucesso: false,
      erros: validacao.error.flatten().fieldErrors,
      mensagem: 'Verifique os campos preenchidos.',
    };
  }

  try {
    const { id, ...dados } = validacao.data;
    await ClientesService.atualizar(id, dados);
  } catch (error: any) {
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao atualizar cliente.',
    };
  }

  revalidatePath('/clientes');
  redirect('/clientes');
}

export async function alternarStatusClienteAction(id: string) {
  try {
    await ClientesService.alternarStatus(id);
    revalidatePath('/clientes');
    return { sucesso: true };
  } catch (error: any) {
    return { sucesso: false, mensagem: error.message };
  }
}

export async function excluirClienteAction(id: string) {
  try {
    await ClientesService.excluir(id);
    revalidatePath('/clientes');
    return { sucesso: true, mensagem: 'Cliente excluído com sucesso.' };
  } catch (error: any) {
    return { sucesso: false, mensagem: error.message || 'Erro ao excluir cliente.' };
  }
}
