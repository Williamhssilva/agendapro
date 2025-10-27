import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantById } from "@/lib/tenant";
import Link from "next/link";
import ProfissionaisList from "@/components/profissionais/ProfissionaisList";

export default async function ProfissionaisPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const tenant = await getTenantById(session.user.estabelecimentoId);

  if (!tenant) {
    return <div>Estabelecimento não encontrado</div>;
  }

  // Buscar todos os profissionais
  const profissionais = await prisma.profissional.findMany({
    where: {
      estabelecimentoId: session.user.estabelecimentoId,
    },
    orderBy: { nome: "asc" },
  });

  // Converter para JSON simples
  const profissionaisData = profissionais.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  // Verificar limite do plano
  const limite = tenant.plano.limiteProfissionais;
  const podeCriar = limite === -1 || profissionais.filter(p => p.ativo).length < limite;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Profissionais</h1>
            <p className="text-sm text-gray-600">
              {limite === -1 ? "Profissionais ilimitados" : `${profissionais.filter(p => p.ativo).length} / ${limite} profissionais ativos`}
            </p>
          </div>
          {podeCriar ? (
            <Link
              href="/profissionais/novo"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Profissional
            </Link>
          ) : (
            <div className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
              Limite atingido. Faça upgrade do plano.
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total de Profissionais</p>
            <p className="text-3xl font-bold text-gray-900">{profissionais.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Ativos</p>
            <p className="text-3xl font-bold text-green-600">
              {profissionais.filter(p => p.ativo).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Limite do Plano</p>
            <p className="text-3xl font-bold text-indigo-600">
              {limite === -1 ? "∞" : limite}
            </p>
          </div>
        </div>

        {/* Grid de Profissionais */}
        {profissionaisData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum profissional cadastrado</h3>
            <p className="text-gray-600 mb-6">Adicione os profissionais da sua equipe</p>
            <Link
              href="/profissionais/novo"
              className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Primeiro Profissional
            </Link>
          </div>
        ) : (
          <ProfissionaisList profissionais={profissionaisData} />
        )}
      </div>
    </div>
  );
}

