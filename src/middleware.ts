import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname, searchParams } = request.nextUrl;
  
  // Extrair subdomain (via hostname ou query parameter)
  let subdomain = extractSubdomain(hostname);
  
  // Suporte a ?tenant=SLUG para testes sem domínio customizado
  const tenantFromQuery = searchParams.get('tenant');
  if (tenantFromQuery && !subdomain) {
    subdomain = tenantFromQuery;
  }
  
  if (subdomain) {
    // TEM subdomain = Área do Cliente
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', subdomain);
    
    // Se está na raiz, reescreve para /loja (rota dentro do grupo /(cliente))
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/loja';
      // Preserva o query parameter tenant para próximas navegações
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      });
    }
    
    // Para demais rotas, apenas injeta o header do tenant
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
  
  // Ignorar domínios .vercel.app (são o domínio principal, não subdomain)
  if (hostname.includes('.vercel.app')) {
    // Se for algo.vercel.app (3 partes), é domínio principal
    const parts = hostname.split('.');
    if (parts.length === 3 && parts[2] === 'app' && parts[1] === 'vercel') {
      return null;
    }
    // Se for sub.algo.vercel.app (4+ partes), o primeiro é subdomain
    if (parts.length >= 4) {
      return parts[0];
    }
    return null;
  }
  
  // Produção com domínio customizado: salaobella.agendapro.com.br
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

