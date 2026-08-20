'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client';

export function BotaoSair() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Limpar cookie de manutenção se existir
      document.cookie = 'master_maintenance_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      await authClient.signOut();
    } catch (err) {
      console.error('Erro ao efetuar logout:', err);
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
    >
      Sair 🚪
    </button>
  );
}
