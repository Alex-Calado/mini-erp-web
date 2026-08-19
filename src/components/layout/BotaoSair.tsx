'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client';

export function BotaoSair() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
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
