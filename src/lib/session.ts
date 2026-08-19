import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';

/**
 * Validação real da sessão no lado do servidor (Server Components / Actions).
 * Consulta a validade da sessão no banco PostgreSQL via Better Auth API.
 */
export async function obterSessaoServidor() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error: any) {
    // Repassar o sinal de servidor dinâmico para o Next.js marcar as rotas como (Dynamic)
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('DYNAMIC_SERVER_USAGE')) {
      throw error;
    }
    console.error('Erro ao verificar sessão no servidor:', error);
    return null;
  }
}

/**
 * Garante que a requisição possui uma sessão ativa válida.
 * Redireciona para /login se a sessão não for válida no banco de dados.
 */
export async function exigirSessaoServidor() {
  const session = await obterSessaoServidor();

  if (!session) {
    redirect('/login');
  }

  return session;
}
