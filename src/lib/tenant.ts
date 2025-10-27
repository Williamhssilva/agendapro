import { headers } from 'next/headers';
import { prisma } from './prisma';

/**
 * Busca o tenant baseado no subdomain da requisição
 * Retorna null se não encontrar
 */
export async function getTenantBySubdomain() {
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
}

/**
 * Busca o tenant pelo ID
 * Útil para área admin onde temos o estabelecimentoId do usuário
 */
export async function getTenantById(estabelecimentoId: string) {
  const estabelecimento = await prisma.estabelecimento.findUnique({
    where: { id: estabelecimentoId },
    include: {
      plano: true,
      configuracoes: true,
    },
  });
  
  return estabelecimento;
}

/**
 * Busca o tenant e lança erro se não encontrar
 * Para área admin: usa o estabelecimentoId da session
 * Para área pública: usa subdomain
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
    throw new Error('Estabelecimento não encontrado');
  }
  
  return tenant;
}

/**
 * Verifica se o tenant pode usar uma feature baseado no plano
 */
export function canUseFeature(tenant: any, feature: 'personalizacao' | 'dominio' | 'api') {
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

