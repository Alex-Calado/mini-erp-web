import { z } from 'zod';

export const CriarProdutoSchema = z.object({
  codigoSku: z.string().min(3, 'SKU deve ter pelo menos 3 caracteres'),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  preco: z.coerce.number().positive('O preço deve ser maior que zero'),
  estoque: z.coerce.number().int().nonnegative('Estoque inicial não pode ser negativo'),
});

export const AjustarEstoqueSchema = z.object({
  produtoId: z.string().uuid('ID de produto inválido'),
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  quantidade: z.coerce.number().int().positive('Quantidade deve ser maior que zero'),
  motivo: z.string().min(3, 'Informe o motivo do ajuste'),
});

export type CriarProdutoInput = z.infer<typeof CriarProdutoSchema>;
export type AjustarEstoqueInput = z.infer<typeof AjustarEstoqueSchema>;
