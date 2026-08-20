import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';

/**
 * Validação da sessão no servidor com fallback para usuário master de manutenção.
 */
export async function obterSessaoServidor() {
  // 1. Tentar validação de sessão oficial do Better Auth
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session) {
      return session;
    }
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('DYNAMIC_SERVER_USAGE')) {
      throw error;
    }
    console.error('Erro ao verificar sessão no Better Auth:', error);
  }

  // 2. Fallback de Manutenção: Verificar cookie de sessão master (master@master.com)
  try {
    const cookieStore = await cookies();
    const masterCookie = cookieStore.get('master_maintenance_session');

    if (masterCookie?.value === 'true') {
      return {
        user: {
          id: 'master-maintenance-user-id',
          name: 'Master Manutenção',
          email: 'master@master.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: 'master-maintenance-session-id',
          userId: 'master-maintenance-user-id',
          expiresAt: new Date(Date.now() + 86400 * 1000),
          token: 'master-maintenance-token',
          ipAddress: '127.0.0.1',
          userAgent: 'Master Maintenance Session',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any;
    }
  } catch (err) {
    console.error('Erro ao verificar cookie master:', err);
  }

  return null;
}

/**
 * Garante que a requisição possui uma sessão ativa válida.
 * Redireciona para /login se não houver sessão nem cookie master.
 */
export async function exigirSessaoServidor() {
  const session = await obterSessaoServidor();

  if (!session) {
    redirect('/login');
  }

  return session;
}
