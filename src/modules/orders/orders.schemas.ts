import { z } from 'zod';

export const ItemPedidoInputSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z
    .number({ message: 'Quantidade deve ser um número válido' })
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'A quantidade deve ser maior que zero (0)'),
});

export const CriarPedidoSchema = z.object({
  customerId: z.string().uuid('ID do cliente inválido'),
  items: z
    .array(ItemPedidoInputSchema)
    .min(1, 'O pedido deve conter pelo menos 1 item'),
});

export type CriarPedidoInput = z.infer<typeof CriarPedidoSchema>;
