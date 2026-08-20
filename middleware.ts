import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware com autenticação temporariamente desativada para testes livres.
 * Permite navegação completa em todas as rotas do Mini ERP sem exigir login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
