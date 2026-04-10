import { NextRequest, NextResponse } from 'next/server';

// Rutas que no requieren estar autenticado
const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Si no hay token y la ruta no es pública, mandamos al login
  if (!token && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si ya tiene token y trata de ir al login, mandamos al home
  if (token && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Aplica el middleware a todas las rutas excepto assets y api de next
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
