'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface TenantLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Link customizado que preserva o query parameter ?tenant= automaticamente
 * Usado para navegação na área do cliente quando acessado via query parameter
 */
export function TenantLink({ href, children, className }: TenantLinkProps) {
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');
  
  // Se tiver tenant no query param, adiciona à URL de destino
  const finalHref = tenant ? `${href}${href.includes('?') ? '&' : '?'}tenant=${tenant}` : href;
  
  return (
    <Link href={finalHref} className={className}>
      {children}
    </Link>
  );
}

