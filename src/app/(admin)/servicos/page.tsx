import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ServicosList from "@/components/servicos/ServicosList";

const categorias = {
  cabelo: { nome: "Cabelo", emoji: "💇‍♀️" },
  barba: { nome: "Barba", emoji: "🧔" },
  unhas: { nome: "Unhas", emoji: "💅" },
  estetica: { nome: "Estética", emoji: "✨" },
  spa: { nome: "Spa", emoji: "🧖‍♀️" },
};

export default async function ServicosPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Buscar todos os serviços do estabelecimento
  const servicos = await prisma.servico.findMany({
    where: {
      estabelecimentoId: session.user.estabelecimentoId,
    },
    orderBy: [
      { categoria: "asc" },
      { nome: "asc" },
    ],
  });

  // Converter para JSON simples (para passar para Client Component)
  const servicosData = servicos.map(s => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Serviços</h1>
            <p className="text-sm text-gray-600">Gerencie os serviços oferecidos</p>
          </div>
          <Link
            href="/servicos/novo"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Serviço
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total de Serviços</p>
            <p className="text-3xl font-bold text-gray-900">{servicos.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Serviços Ativos</p>
            <p className="text-3xl font-bold text-green-600">
              {servicos.filter((s) => s.ativo).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Preço Médio</p>
            <p className="text-3xl font-bold text-indigo-600">
              R$ {servicos.length > 0 ? (servicos.reduce((acc, s) => acc + s.preco, 0) / servicos.length).toFixed(0) : 0}
            </p>
          </div>
        </div>

        {/* Serviços */}
        {servicosData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-gray-600 mb-6">Comece adicionando os serviços que você oferece</p>
            <Link
              href="/servicos/novo"
              className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Primeiro Serviço
            </Link>
          </div>
        ) : (
          <ServicosList servicos={servicosData} categorias={categorias} />
        )}
      </div>
    </div>
  );
}

