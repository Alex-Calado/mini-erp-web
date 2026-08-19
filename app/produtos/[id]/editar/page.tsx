import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProdutosService } from '@/src/modules/produtos/produtos.service';
import { FormularioEditarProduto } from './FormularioEditarProduto';

export default async function PaginaEditarProduto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produto = await ProdutosService.obterPorId(id);

  if (!produto) {
    notFound();
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <Link href="/produtos" className="text-sm text-slate-500 hover:text-slate-800 inline-block font-medium">
        ← Voltar para a lista de produtos
      </Link>

      <FormularioEditarProduto produto={produto} />
    </div>
  );
}
