import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ClientesService } from '@/src/modules/clientes/clientes.service';
import { FormularioEditarCliente } from './FormularioEditarCliente';

export default async function PaginaEditarCliente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await ClientesService.obterPorId(id);

  if (!cliente) {
    notFound();
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <Link href="/clientes" className="text-sm text-slate-500 hover:text-slate-800 inline-block font-medium">
        ← Voltar para a lista de clientes
      </Link>

      <FormularioEditarCliente cliente={cliente} />
    </div>
  );
}
