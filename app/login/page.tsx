import { redirect } from 'next/navigation';

/**
 * Tela de login desativada. Redireciona imediatamente para o Dashboard (/),
 * eliminando a exigência de autenticação no sistema.
 */
export default function PaginaLogin() {
  redirect('/');
}
