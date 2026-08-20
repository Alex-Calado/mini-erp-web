import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/src/lib/auth';
import { prisma } from '@/src/db/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const isMaster = normalizedEmail === 'master@master.com' && password === 'master';

    if (!isMaster) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Credenciais inválidas.' },
        { status: 400 }
      );
    }

    // Tentar persistir/garantir o usuário no banco de dados (se o banco estiver acessível)
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: 'master@master.com' },
      });

      if (!existingUser) {
        await auth.api.signUpEmail({
          body: {
            email: 'master@master.com',
            password: 'master',
            name: 'Usuário Master (Manutenção)',
          },
        });
      }

      // Tentar login normal via Better Auth para gerar cookie oficial
      const signInRes = await auth.api.signInEmail({
        body: {
          email: 'master@master.com',
          password: 'master',
        },
        asResponse: true,
      });

      if (signInRes.ok) {
        // Retornar a resposta do Better Auth que inclui os cookies de sessão oficiais
        const response = new NextResponse(JSON.stringify({ sucesso: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

        // Copiar os cookies de sessão gerados pelo Better Auth
        const setCookieHeader = signInRes.headers.get('set-cookie');
        if (setCookieHeader) {
          response.headers.set('set-cookie', setCookieHeader);
        }

        // Definir cookie de contingência também
        const cookieStore = await cookies();
        cookieStore.set('master_maintenance_session', 'true', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 86400,
        });

        return response;
      }
    } catch (dbError) {
      console.warn('Banco indisponível ou erro no Better Auth. Ativando sessão master de contingência:', dbError);
    }

    // Contingência total: Definir cookie de manutenção master (funciona mesmo se o banco estiver vazio ou offline)
    const cookieStore = await cookies();
    cookieStore.set('master_maintenance_session', 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
    });

    return NextResponse.json({ sucesso: true, mensagem: 'Login master de manutenção ativado.' });
  } catch (error: any) {
    console.error('Erro na rota de login de manutenção:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: error?.message || 'Erro ao processar login master.' },
      { status: 500 }
    );
  }
}
