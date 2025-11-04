import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function MeuPlanoPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const estabelecimentoId = session.user.estabelecimentoId as string;

  // Carregar tenant + plano + uso básico (com tolerância a erros)
  const results = await Promise.allSettled([
    prisma.estabelecimento.findUnique({
      where: { id: estabelecimentoId },
      include: { plano: true },
    }),
    prisma.profissional.count({
      where: { estabelecimentoId, ativo: true },
    }),
  ]);

  const tenant = results[0].status === "fulfilled" ? (results[0].value as any) : null;
  const profissionaisAtivosCount = results[1].status === "fulfilled" ? (results[1].value as number) : 0;
  const hadError = results.some(r => r.status === "rejected");

  if (!tenant) {
    redirect("/login");
  }

  const plano = tenant.plano;
  const limiteProfissionais = plano.limiteProfissionais; // -1 = ilimitado
  const usoProfissionais = profissionaisAtivosCount;
  const usoProfissionaisText =
    limiteProfissionais === -1
      ? `${usoProfissionais} ativos (ilimitado)`
      : `${usoProfissionais} / ${limiteProfissionais}`;

  const status = tenant.subscriptionStatus; // trial, active, cancelled, past_due
  const trialEndsAt = tenant.trialEndsAt ? new Date(tenant.trialEndsAt) : null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Meu Plano</h1>
        <p className="text-sm text-gray-600 mb-6">Veja detalhes do seu plano atual e limites de uso.</p>

        {hadError && (
          <div className="mb-4 rounded border border-amber-300 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
            Algumas informações podem estar indisponíveis no momento. Tente recarregar em instantes.
          </div>
        )}

        {/* Card do Plano Atual */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{plano.nome}</h2>
              <p className="text-sm text-gray-600">R$ {plano.precoMensal.toFixed(2)} / mês</p>
              <div className="mt-3 text-sm text-gray-700 space-y-1">
                <p>Profissionais: {limiteProfissionais === -1 ? "Ilimitado" : limiteProfissionais}</p>
                <p>Notificações: {plano.limiteNotificacoes === -1 ? "Ilimitado" : plano.limiteNotificacoes} / mês</p>
                <p>Personalização: {plano.temPersonalizacao ? "Sim" : "Não"}</p>
                <p>Domínio próprio: {plano.temDominioProprio ? "Sim" : "Não"}</p>
                <p>API: {plano.temAPI ? "Sim" : "Não"}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                status === "active"
                  ? "bg-green-100 text-green-800"
                  : status === "trial"
                  ? "bg-blue-100 text-blue-800"
                  : status === "past_due"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {status}
              </span>
              {trialEndsAt && (
                <p className="mt-2 text-xs text-gray-500">Trial até {trialEndsAt.toLocaleDateString("pt-BR")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Uso Atual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Profissionais Ativos</p>
            <p className="text-2xl font-bold text-gray-900">{usoProfissionaisText}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Notificações (mês)</p>
            <p className="text-2xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-500 mt-1">(contagem será adicionada após notificações)</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Armazenamento</p>
            <p className="text-2xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-500 mt-1">(opcional para versões futuras)</p>
          </div>
        </div>

        {/* CTA Upgrade / Gerenciar Assinatura */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Precisa de mais recursos?</h3>
          <p className="text-sm text-gray-600 mb-4">Faça upgrade para um plano superior ou gerencie sua assinatura.</p>
          <div className="flex flex-wrap gap-3">
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
              disabled
              title="Em breve"
            >
              Fazer Upgrade (em breve)
            </button>
            <button
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
              disabled
              title="Em breve"
            >
              Gerenciar Assinatura (em breve)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


