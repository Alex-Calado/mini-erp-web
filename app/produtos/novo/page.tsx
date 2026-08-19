import Link from 'next/link';
import { FormularioNovoProduto } from './FormularioNovoProduto';

export default function PaginaNovoProduto() {
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <Link href="/produtos" className="text-sm text-slate-500 hover:text-slate-800 inline-block font-medium">
        ← Voltar para a lista de produtos
      </Link>

      <FormularioNovoProduto />
    </div>
  );
}
