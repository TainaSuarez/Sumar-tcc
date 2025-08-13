import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Proteger rutas de administración
    if (pathname.startsWith('/admin')) {
      // Verificar que el usuario esté autenticado
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin?callbackUrl=' + encodeURIComponent(pathname), req.url));
      }

      // Verificar que el usuario tenga rol de administrador
      if (token.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Proteger rutas de moderación
    if (pathname.startsWith('/moderation')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin?callbackUrl=' + encodeURIComponent(pathname), req.url));
      }

      // Verificar que el usuario tenga rol de administrador o moderador
      if (token.role !== UserRole.ADMIN && token.role !== UserRole.MODERATOR) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Permitir acceso a rutas públicas
        if (!pathname.startsWith('/admin') && !pathname.startsWith('/moderation')) {
          return true;
        }

        // Para rutas protegidas, requerir token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/moderation/:path*'
  ],
};
