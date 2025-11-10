'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook que retorna uma função fetch customizada que automaticamente
 * adiciona o ?tenant= quando presente na URL
 */
export function useTenantFetch() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');

  // CRITICAL: useCallback para evitar loop infinito
  return useCallback((url: string, options?: RequestInit) => {
    // Se tiver tenant no query param, adiciona à URL
    if (tenant) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}tenant=${tenant}`;
    }
    
    return fetch(url, options);
  }, [tenant]); // Só recria se tenant mudar
}

