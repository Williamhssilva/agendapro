"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [servicos, setServicos] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horarioSelecionado, setHorarioSelecionado] = useState("");

  // Carregar serviços e profissionais
  useEffect(() => {
    async function carregar() {
      try {
        const [resServicos, resProfissionais] = await Promise.all([
          fetch("/api/servicos"),
          fetch("/api/profissionais"),
        ]);

        if (resServicos.ok) setServicos(await resServicos.json());
        if (resProfissionais.ok) setProfissionais(await resProfissionais.json());
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    carregar();
  }, []);

  // Calcular horários disponíveis quando selecionar serviço, profissional e data
  useEffect(() => {
    if (servicoSelecionado && profissionalSelecionado && dataSelecionada) {
      buscarHorariosDisponiveis();
    } else {
      setHorariosDisponiveis([]);
    }
  }, [servicoSelecionado, profissionalSelecionado, dataSelecionada]);

  async function buscarHorariosDisponiveis() {
    setLoadingHorarios(true);
    try {
      const response = await fetch(
        `/api/horarios-disponiveis?servicoId=${servicoSelecionado}&profissionalId=${profissionalSelecionado}&data=${dataSelecionada}`
      );
      if (response.ok) {
        const data = await response.json();
        setHorariosDisponiveis(data.horarios);
      }
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
    } finally {
      setLoadingHorarios(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    // Combinar data + hora
    const dataHoraCompleta = new Date(`${dataSelecionada}T${horarioSelecionado}:00`);

    const data = {
      clienteNome: formData.get("clienteNome"),
      clienteTelefone: formData.get("clienteTelefone"),
      clienteEmail: formData.get("clienteEmail"),
      servicoId: servicoSelecionado,
      profissionalId: profissionalSelecionado,
      dataHora: dataHoraCompleta.toISOString(),
      observacoes: formData.get("observacoes"),
    };

    try {
      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao criar agendamento");
        setLoading(false);
        return;
      }

      // Mostrar mensagem de sucesso
      alert("✅ Agendamento criado com sucesso!");
      
      // Redirecionar para a agenda com a data do agendamento
      const dataAgendamento = new Date(dataHoraCompleta).toISOString().split("T")[0];
      router.push(`/agenda?data=${dataAgendamento}`);
      router.refresh();
    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
      setError("Erro ao criar agendamento. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/agenda" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Novo Agendamento</h1>
              <p className="text-sm text-gray-600">Criar agendamento manualmente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados do Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Cliente</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      name="clienteNome"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Nome do cliente"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        name="clienteTelefone"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (opcional)
                      </label>
                      <input
                        type="email"
                        name="clienteEmail"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Serviço e Profissional */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviço e Profissional</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serviço *
                    </label>
                    <select
                      required
                      value={servicoSelecionado}
                      onChange={(e) => setServicoSelecionado(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Selecione...</option>
                      {servicos.filter(s => s.ativo).map((servico) => (
                        <option key={servico.id} value={servico.id}>
                          {servico.nome} - R$ {servico.preco.toFixed(2)} ({servico.duracao}min)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profissional *
                    </label>
                    <select
                      required
                      value={profissionalSelecionado}
                      onChange={(e) => setProfissionalSelecionado(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Selecione...</option>
                      {profissionais.filter(p => p.ativo).map((profissional) => (
                        <option key={profissional.id} value={profissional.id}>
                          {profissional.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Data e Hora */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data e Horário</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={dataSelecionada}
                      onChange={(e) => setDataSelecionada(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Horários Disponíveis */}
                  {servicoSelecionado && profissionalSelecionado && dataSelecionada && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário * {loadingHorarios && <span className="text-xs text-gray-500">(Carregando...)</span>}
                      </label>
                      {horariosDisponiveis.length === 0 && !loadingHorarios ? (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                          Nenhum horário disponível para esta data. Tente outra data ou profissional.
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {horariosDisponiveis.map((horario) => (
                            <label key={horario} className="cursor-pointer">
                              <input
                                type="radio"
                                name="horario"
                                value={horario}
                                checked={horarioSelecionado === horario}
                                onChange={(e) => setHorarioSelecionado(e.target.value)}
                                className="sr-only peer"
                                required
                              />
                              <div className="py-3 text-center border-2 border-gray-200 rounded-lg peer-checked:border-indigo-600 peer-checked:bg-indigo-50 hover:border-gray-300">
                                {horario}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  name="observacoes"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Alguma informação adicional..."
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link
                  href="/agenda"
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading || !horarioSelecionado}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                >
                  {loading ? "Criando..." : "Criar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

