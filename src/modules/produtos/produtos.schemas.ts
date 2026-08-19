import { z } from 'zod';

export const CriarProdutoSchema = z.object({
  codigoSku: z
    .string({ message: 'O código SKU é obrigatório.' })
    .trim()
    .min(1, 'O código SKU é obrigatório.')
    .max(50, 'O código SKU deve ter no máximo 50 caracteres.'),
  nome: z
    .string({ message: 'O nome do produto é obrigatório.' })
    .trim()
    .min(1, 'O nome do produto é obrigatório.')
    .max(150, 'O nome do produto deve ter no máximo 150 caracteres.'),
  descricao: z.string().trim().optional().nullable(),
  categoria: z.string().trim().optional().nullable(),
  preco: z
    .number({ message: 'O preço deve ser um valor numérico.' })
    .min(0, 'O preço não pode ser negativo.'),
  estoque: z
    .number({ message: 'O estoque deve ser um número inteiro.' })
    .int('O estoque deve ser um número inteiro.')
    .min(0, 'O estoque não pode ser negativo.')
    .default(0),
  ativo: z.boolean().default(true),
});

export const AtualizarProdutoSchema = CriarProdutoSchema.extend({
  id: z.string().uuid('ID inválido.'),
});

export type CriarProdutoInput = z.infer<typeof CriarProdutoSchema>;
export type AtualizarProdutoInput = z.infer<typeof AtualizarProdutoSchema>;
