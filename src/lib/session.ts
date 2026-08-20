import { headers } from 'next/headers';
import { auth } from './auth';

const SESSAO_CONCURSO_LIVRE = {
  user: {
    id: 'operador-livre-id',
    name: 'Operador ERP (Modo Livre)',
    email: 'operador@minierp.com',
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: {
    id: 'sessao-livre-id',
    userId: 'operador-livre-id',
    expiresAt: new Date(Date.now() + 315360000000),
    token: 'sessao-livre-token',
    ipAddress: '127.0.0.1',
    userAgent: 'Sessão Livre',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * Obtém a sessão do servidor. Retorna a sessão do Better Auth ou uma sessão aberta de teste.
 */
export async function obterSessaoServidor() {
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
  }

  // Retornar sessão livre para liberar acesso total em modo de teste
  return SESSAO_CONCURSO_LIVRE as any;
}

/**
 * Retorna sempre uma sessão ativa válida sem realizar nenhum redirecionamento para /login.
 */
export async function exigirSessaoServidor() {
  const session = await obterSessaoServidor();
  return session || (SESSAO_CONCURSO_LIVRE as any);
}
