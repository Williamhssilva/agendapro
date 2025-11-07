import { headers } from 'next/headers';
import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { isDbUnavailable } from './errors';

type TenantWithPlano = Prisma.EstabelecimentoGetPayload<{ include: { plano: true } }>;

/**
 * Busca o tenant baseado no subdomain da requisição
 * Retorna null se não encontrar ou se houver erro de conexão
 */
export async function getTenantBySubdomain() {
  try {
    const headersList = await headers();
    const tenantSlug = headersList.get('x-tenant-slug');
    
    if (!tenantSlug) {
      return null;
    }
    
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { slug: tenantSlug },
      include: {
        plano: true,
        configuracoes: true,
      },
    });
    
    return estabelecimento;
  } catch (error) {
    if (isDbUnavailable(error)) {
      console.error('getTenantBySubdomain: Database unavailable (P1001)');
      return null; // Retorna null em caso de erro de conexão
    }
    throw error; // Re-lança outros erros
  }
}

/**
 * Busca o tenant pelo ID
 * Útil para área admin onde temos o estabelecimentoId do usuário
 * Retorna null se não encontrar ou se houver erro de conexão
 */
export async function getTenantById(estabelecimentoId: string) {
  try {
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: estabelecimentoId },
      include: {
        plano: true,
        configuracoes: true,
      },
    });
    
    return estabelecimento;
  } catch (error) {
    if (isDbUnavailable(error)) {
      console.error('getTenantById: Database unavailable (P1001)');
      return null; // Retorna null em caso de erro de conexão
    }
    throw error; // Re-lança outros erros
  }
}

/**
 * Busca o tenant e lança erro se não encontrar
 * Para área admin: usa o estabelecimentoId da session
 * Para área pública: usa subdomain
 * 
 * Em caso de erro P1001 (DB indisponível), retorna null ao invés de lançar erro
 * para permitir tratamento específico na página
 */
export async function requireTenant(estabelecimentoId?: string) {
  let tenant;
  
  if (estabelecimentoId) {
    // Admin area: busca por ID
    tenant = await getTenantById(estabelecimentoId);
  } else {
    // Public area: busca por subdomain
    tenant = await getTenantBySubdomain();
  }
  
  if (!tenant) {
    // Se retornou null, pode ser porque não encontrou OU porque DB está indisponível
    // A função getTenantById/getTenantBySubdomain já trata P1001 e retorna null
    // Aqui assumimos que é "não encontrado" para manter compatibilidade
    throw new Error('Estabelecimento não encontrado');
  }
  
  return tenant;
}

/**
 * Verifica se o tenant pode usar uma feature baseado no plano
 */
export function canUseFeature(tenant: TenantWithPlano, feature: 'personalizacao' | 'dominio' | 'api') {
  switch (feature) {
    case 'personalizacao':
      return tenant.plano.temPersonalizacao;
    case 'dominio':
      return tenant.plano.temDominioProprio;
    case 'api':
      return tenant.plano.temAPI;
    default:
      return false;
  }
}

/**
 * Verifica se o tenant atingiu o limite de profissionais
 */
export async function canAddProfissional(tenantId: string) {
  const tenant = await prisma.estabelecimento.findUnique({
    where: { id: tenantId },
    include: {
      plano: true,
      profissionais: { where: { ativo: true } },
    },
  });
  
  if (!tenant) return false;
  
  const limite = tenant.plano.limiteProfissionais;
  
  // -1 = ilimitado
  if (limite === -1) return true;
  
  return tenant.profissionais.length < limite;
}

