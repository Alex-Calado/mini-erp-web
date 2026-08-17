import { z } from 'zod';

export const ItemVendaSchema = z.object({
  produtoId: z.string().uuid('Produto inválido'),
  quantidade: z.number().int().positive('Quantidade deve ser pelo menos 1'),
});

export const CriarVendaSchema = z.object({
  clienteId: z.string().uuid('Selecione um cliente válido'),
  itens: z.array(ItemVendaSchema).min(1, 'A venda deve ter pelo menos 1 item'),
});

export type ItemVendaInput = z.infer<typeof ItemVendaSchema>;
export type CriarVendaInput = z.infer<typeof CriarVendaSchema>;
