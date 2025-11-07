"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Profissional = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  especialidade: string | null;
  fotoUrl: string | null;
  ativo: boolean;
};

type Props = {
  profissionais: Profissional[];
};

const cores = [
  "from-indigo-500 to-purple-600",
  "from-purple-500 to-pink-600",
  "from-green-500 to-emerald-600",
  "from-blue-500 to-cyan-600",
  "from-orange-500 to-red-600",
];

export default function ProfissionaisList({ profissionais }: Props) {
  const router = useRouter();

  async function handleDelete(profissionalId: string) {
    if (!confirm("Tem certeza que deseja deletar este profissional?")) {
      return;
    }

    try {
      const response = await fetch(`/api/profissionais/${profissionalId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Erro ao deletar profissional");
        return;
      }

      router.refresh();
    } catch {
      alert("Erro ao deletar profissional");
    }
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profissionais.map((profissional, index) => {
        const iniciais = profissional.nome
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        return (
          <div key={profissional.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header colorido */}
            <div className={`h-24 bg-gradient-to-r ${cores[index % cores.length]}`}></div>
            
            {/* Avatar */}
            <div className="px-6 pb-6">
              <div className="flex justify-center -mt-12 mb-4">
                <div className={`w-24 h-24 bg-gradient-to-br ${cores[index % cores.length]} rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white`}>
                  {iniciais}
                </div>
              </div>

              {/* Info */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{profissional.nome}</h3>
                  {!profissional.ativo && (
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      Inativo
                    </span>
                  )}
                </div>
                {profissional.especialidade && (
                  <p className="text-gray-600">{profissional.especialidade}</p>
                )}
              </div>

              {/* Contato */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {profissional.email && (
                  <p className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {profissional.email}
                  </p>
                )}
                {profissional.telefone && (
                  <p className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {profissional.telefone}
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="flex space-x-2">
                <Link
                  href={`/profissionais/${profissional.id}/editar`}
                  className={`flex-1 bg-gradient-to-r ${cores[index % cores.length]} text-white py-2 rounded-lg hover:opacity-90 text-sm font-medium text-center`}
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(profissional.id)}
                  className="px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

