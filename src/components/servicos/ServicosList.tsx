"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string;
  duracao: number;
  preco: number;
  ativo: boolean;
};

type Props = {
  servicos: Servico[];
  categorias: Record<string, { nome: string; emoji: string }>;
};

export default function ServicosList({ servicos, categorias }: Props) {
  const router = useRouter();

  // Agrupar por categoria
  const servicosPorCategoria = servicos.reduce((acc, servico) => {
    if (!acc[servico.categoria]) {
      acc[servico.categoria] = [];
    }
    acc[servico.categoria].push(servico);
    return acc;
  }, {} as Record<string, Servico[]>);

  async function handleDelete(servicoId: string) {
    if (!confirm("Tem certeza que deseja deletar este serviço?")) {
      return;
    }

    try {
      const response = await fetch(`/api/servicos/${servicoId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Erro ao deletar serviço");
        return;
      }

      router.refresh();
    } catch (error) {
      alert("Erro ao deletar serviço");
    }
  }

  return (
    <div className="space-y-6">
      {Object.entries(servicosPorCategoria).map(([categoria, servicosCategoria]) => (
        <div key={categoria} className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {categorias[categoria]?.emoji} {categorias[categoria]?.nome || categoria}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {servicosCategoria.map((servico) => (
              <div key={servico.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{servico.nome}</h3>
                      {!servico.ativo && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                          Inativo
                        </span>
                      )}
                    </div>
                    {servico.descricao && (
                      <p className="text-sm text-gray-600 mt-1">{servico.descricao}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {servico.duracao} min
                      </span>
                      <span className="flex items-center font-semibold text-indigo-600">
                        R$ {servico.preco.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/servicos/${servico.id}/editar`}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(servico.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

