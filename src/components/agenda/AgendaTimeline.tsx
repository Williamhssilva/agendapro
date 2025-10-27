"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Agendamento = {
  id: string;
  dataHora: string;
  status: string;
  observacoes: string | null;
  duracao: number;
  cliente: {
    nome: string;
    telefone: string;
  };
  servico: {
    nome: string;
    preco: number;
  };
  profissional: {
    nome: string;
  };
};

const statusConfig = {
  pendente: { bg: "bg-yellow-50", border: "border-yellow-500", badge: "bg-yellow-100 text-yellow-700" },
  confirmado: { bg: "bg-green-50", border: "border-green-500", badge: "bg-green-100 text-green-700" },
  concluido: { bg: "bg-gray-100", border: "border-gray-400", badge: "bg-gray-200 text-gray-700" },
  cancelado: { bg: "bg-red-50", border: "border-red-500", badge: "bg-red-100 text-red-700" },
  noshow: { bg: "bg-orange-50", border: "border-orange-500", badge: "bg-orange-100 text-orange-700" },
};

export default function AgendaTimeline({ agendamentos }: { agendamentos: Agendamento[] }) {
  const router = useRouter();

  async function handleMudarStatus(agendamentoId: string, novoStatus: string) {
    try {
      const response = await fetch(`/api/agendamentos/${agendamentoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao mudar status:", error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 space-y-6">
        {agendamentos.map((agendamento) => {
          const config = statusConfig[agendamento.status as keyof typeof statusConfig] || statusConfig.pendente;
          const dataHora = new Date(agendamento.dataHora);
          const horaInicio = format(dataHora, "HH:mm");
          const horaFim = format(new Date(dataHora.getTime() + agendamento.duracao * 60000), "HH:mm");

          return (
            <div key={agendamento.id} className="flex space-x-4 pb-6 border-b last:border-b-0">
              {/* Horário */}
              <div className="w-24 flex-shrink-0 text-right">
                <p className="text-sm font-bold text-gray-700">{horaInicio}</p>
                <p className="text-xs text-gray-500">{horaFim}</p>
              </div>

              {/* Card */}
              <div className={`flex-1 border-l-4 ${config.border} ${config.bg} rounded-r-lg p-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-gray-900">{agendamento.cliente.nome}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.badge}`}>
                        {agendamento.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {agendamento.servico.nome} • R$ {agendamento.servico.preco.toFixed(2)}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>⏰ {agendamento.duracao} min</span>
                      <span>👤 {agendamento.profissional.nome}</span>
                      <span>📱 {agendamento.cliente.telefone}</span>
                    </div>
                    {agendamento.observacoes && (
                      <div className="mt-2 bg-blue-50 p-2 rounded text-xs text-blue-800">
                        <strong>Obs:</strong> {agendamento.observacoes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap gap-2">
                  {agendamento.status === "pendente" && (
                    <button
                      onClick={() => handleMudarStatus(agendamento.id, "confirmado")}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                    >
                      ✓ Confirmar
                    </button>
                  )}
                  {agendamento.status === "confirmado" && (
                    <button
                      onClick={() => handleMudarStatus(agendamento.id, "concluido")}
                      className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
                    >
                      ✓ Concluir
                    </button>
                  )}
                  {(agendamento.status === "pendente" || agendamento.status === "confirmado") && (
                    <button
                      onClick={() => {
                        if (confirm("Cancelar este agendamento?")) {
                          handleMudarStatus(agendamento.id, "cancelado");
                        }
                      }}
                      className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

