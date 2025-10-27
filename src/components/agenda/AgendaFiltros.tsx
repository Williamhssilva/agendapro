"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Profissional = {
  id: string;
  nome: string;
};

export default function AgendaFiltros({ profissionais }: { profissionais: Profissional[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Data em formato YYYY-MM-DD (local, não UTC)
  const hoje = new Date();
  const dataLocal = hoje.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
  const dataAtual = searchParams.get("data") || dataLocal;
  const profissionalAtual = searchParams.get("profissionalId") || "";

  function handleDataChange(novaData: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("data", novaData);
    router.push(`/agenda?${params.toString()}`);
  }

  function handleProfissionalChange(profissionalId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (profissionalId) {
      params.set("profissionalId", profissionalId);
    } else {
      params.delete("profissionalId");
    }
    router.push(`/agenda?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Data</label>
          <input
            type="date"
            value={dataAtual}
            onChange={(e) => handleDataChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">Profissional</label>
          <select
            value={profissionalAtual}
            onChange={(e) => handleProfissionalChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Todos os profissionais</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

