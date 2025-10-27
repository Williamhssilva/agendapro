import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extrai o subdomain da URL para identificar o tenant
 * Ex: salaobella.agendapro.com.br => "salaobella"
 */
export function extractSubdomain(hostname: string): string | null {
  const parts = hostname.split('.');
  
  // Localhost
  if (hostname.includes('localhost')) {
    return null; // ou 'demo' para desenvolvimento
  }
  
  // Produção: subdomain.agendapro.com.br
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

/**
 * Formata data para display
 */
export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data);
}

/**
 * Formata hora para display
 */
export function formatarHora(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
}

/**
 * Formata moeda brasileira
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

