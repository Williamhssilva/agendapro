import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;
  
  // Extrair subdomain
  const subdomain = extractSubdomain(hostname);
  
  if (subdomain) {
    // TEM subdomain = Área do Cliente
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', subdomain);
    
    // Se está na raiz, redireciona para área do cliente
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/(cliente)';
      return NextResponse.rewrite(url, {
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    // Para outras rotas, só injeta o header
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  // SEM subdomain = Área de Marketing/Admin
  return NextResponse.next();
}

function extractSubdomain(hostname: string): string | null {
  // Desenvolvimento: demo.localhost:3000
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }
    // Sem subdomain, retorna null (será a área de marketing)
    return null;
  }
  
  // Produção: salaobella.agendapro.com.br
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    // Ignorar "www"
    if (parts[0] === 'www') {
      return null;
    }
    return parts[0];
  }
  
  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};

