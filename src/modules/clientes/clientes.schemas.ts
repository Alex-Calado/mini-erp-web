import { z } from 'zod';

export const CriarClienteSchema = z.object({
  cpfCnpj: z
    .string()
    .min(1, 'CPF/CNPJ é obrigatório')
    .min(11, 'CPF/CNPJ deve ter no mínimo 11 caracteres')
    .max(18, 'CPF/CNPJ inválido'),
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z
    .string()
    .transform((val) => val.trim())
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Informe um e-mail válido.',
    }),
  telefone: z
    .string()
    .transform((val) => val.trim())
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  ativo: z.boolean().optional().default(true),
});

export const AtualizarClienteSchema = CriarClienteSchema.extend({
  id: z.string().uuid('ID de cliente inválido'),
  ativo: z.boolean().default(true),
});

export type CriarClienteInput = z.infer<typeof CriarClienteSchema>;
export type AtualizarClienteInput = z.infer<typeof AtualizarClienteSchema>;
