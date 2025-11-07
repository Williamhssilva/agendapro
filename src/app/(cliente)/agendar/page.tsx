// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Servico = {
  id: string;
  nome: string;
  duracao: number;
  preco: number;
};

type Profissional = {
  id: string;
  nome: string;
  especialidade?: string | null;
};

type HorariosResponse = {
  horarios: string[];
};

export default function AgendarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horarioSelecionado, setHorarioSelecionado] = useState("");

  // Carregar serviços e profissionais (APIs públicas)
  useEffect(() => {
    async function carregar() {
      try {
        const [resServicos, resProfissionais] = await Promise.all([
          fetch("/api/public/servicos"),
          fetch("/api/public/profissionais"),
        ]);

        if (resServicos.ok) {
          const data: Servico[] = await resServicos.json();
          setServicos(Array.isArray(data) ? data : []);
        }
        if (resProfissionais.ok) {
          const data: Profissional[] = await resProfissionais.json();
          setProfissionais(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    carregar();
  }, []);

  const buscarHorarios = useCallback(async () => {
    if (!servicoSelecionado || !profissionalSelecionado || !dataSelecionada) {
      return;
    }
    setLoadingHorarios(true);
    setHorarioSelecionado("");
    try {
      const response = await fetch(
        `/api/horarios-disponiveis?servicoId=${servicoSelecionado}&profissionalId=${profissionalSelecionado}&data=${dataSelecionada}`
      );
      if (response.ok) {
        const data: HorariosResponse | string[] = await response.json();
        const horarios = Array.isArray(data) ? data : data?.horarios ?? [];
        setHorariosDisponiveis(horarios);
      }
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
    } finally {
      setLoadingHorarios(false);
    }
  }, [servicoSelecionado, profissionalSelecionado, dataSelecionada]);

  useEffect(() => {
    if (servicoSelecionado && profissionalSelecionado && dataSelecionada) {
      buscarHorarios();
    } else {
      setHorariosDisponiveis([]);
      setHorarioSelecionado("");
    }
  }, [servicoSelecionado, profissionalSelecionado, dataSelecionada, buscarHorarios]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    const dataHoraCompleta = new Date(`${dataSelecionada}T${horarioSelecionado}:00`);

    const data = {
      clienteNome: formData.get("nome"),
      clienteTelefone: formData.get("telefone"),
      clienteEmail: formData.get("email") || "",
      servicoId: servicoSelecionado,
      profissionalId: profissionalSelecionado,
      dataHora: dataHoraCompleta.toISOString(),
      observacoes: formData.get("observacoes") || "",
    };

    try {
      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        // Se o horário foi tomado no meio do caminho, mostra mensagem amigável e recarrega horários
        if (response.status === 400 || response.status === 409) {
          setError(result.error || "Este horário acabou de ser ocupado. Selecione outro.");
          await buscarHorarios();
          setHorarioSelecionado("");
        } else {
          setError(result.error || "Erro ao criar agendamento");
        }
        setLoading(false);
        return;
      }

      const agendamento = await response.json();
      
      // Redirecionar para confirmação com dados
      router.push(`/agendar/confirmacao?id=${agendamento.id}`);
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao criar agendamento. Tente novamente.");
      setLoading(false);
    }
  }

  const servicoAtual = servicos.find(s => s.id === servicoSelecionado);
  const profissionalAtual = profissionais.find(p => p.id === profissionalSelecionado);

  const dataMinima = new Date(); // permite hoje; slots de hoje serão filtrados pela antecedência mínima (2h)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Agendar Horário</h1>
        <p className="text-gray-600">Escolha o serviço, profissional e horário desejado</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Escolher Serviço */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. Escolha o Serviço</h2>
          <div className="space-y-3">
            {servicos.map((servico) => (
              <label key={servico.id} className="block cursor-pointer">
                <input
                  type="radio"
                  name="servico"
                  value={servico.id}
                  checked={servicoSelecionado === servico.id}
                  onChange={(e) => setServicoSelecionado(e.target.value)}
                  className="sr-only peer"
                  required
                />
                <div className="p-4 border-2 border-gray-200 rounded-lg peer-checked:border-indigo-600 peer-checked:bg-indigo-50 hover:border-gray-300 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{servico.nome}</p>
                      <p className="text-sm text-gray-600">{servico.duracao} minutos</p>
                    </div>
                    <p className="text-xl font-bold text-indigo-600">
                      R$ {servico.preco.toFixed(2)}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Escolher Profissional */}
        {servicoSelecionado && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Escolha o Profissional</h2>
            <div className="space-y-3">
              {profissionais.map((profissional) => (
                <label key={profissional.id} className="block cursor-pointer">
                  <input
                    type="radio"
                    name="profissional"
                    value={profissional.id}
                    checked={profissionalSelecionado === profissional.id}
                    onChange={(e) => setProfissionalSelecionado(e.target.value)}
                    className="sr-only peer"
                    required
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-lg peer-checked:border-indigo-600 peer-checked:bg-indigo-50 hover:border-gray-300 transition">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {profissional.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{profissional.nome}</p>
                        {profissional.especialidade && (
                          <p className="text-sm text-gray-600">{profissional.especialidade}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 3. Escolher Data e Horário */}
        {profissionalSelecionado && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Escolha Data e Horário</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                min={dataMinima.toISOString().split("T")[0]}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
              />
            </div>

            {dataSelecionada && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Horários Disponíveis {loadingHorarios && <span className="text-xs text-gray-500">(Carregando...)</span>}
                </label>
                
                {horariosDisponiveis.length === 0 && !loadingHorarios ? (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                    😔 Nenhum horário disponível para esta data. Tente outro dia ou profissional.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {horariosDisponiveis.map((horario) => {
                      const disabled = loading || loadingHorarios;
                      return (
                      <label key={horario} className={disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}>
                        <input
                          type="radio"
                          name="horario"
                          value={horario}
                          checked={horarioSelecionado === horario}
                          onChange={(e) => setHorarioSelecionado(e.target.value)}
                          className="sr-only peer"
                          required
                          disabled={disabled}
                        />
                        <div className={"py-3 px-2 text-center border-2 border-gray-200 rounded-lg peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition font-medium " + (disabled ? "pointer-events-none" : "hover:border-gray-300") }>
                          {horario}
                        </div>
                      </label>
                    );})}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. Seus Dados */}
        {horarioSelecionado && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Seus Dados</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Seu nome"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  name="observacoes"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Alguma preferência ou informação adicional..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Resumo e Confirmar */}
        {horarioSelecionado && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Resumo do Agendamento</h2>
            <div className="space-y-2 mb-6">
              <p><strong>Serviço:</strong> {servicoAtual?.nome} - R$ {servicoAtual?.preco.toFixed(2)}</p>
              <p><strong>Profissional:</strong> {profissionalAtual?.nome}</p>
              <p><strong>Data:</strong> {new Date(dataSelecionada).toLocaleDateString("pt-BR")}</p>
              <p><strong>Horário:</strong> {horarioSelecionado}</p>
              <p><strong>Duração:</strong> {servicoAtual?.duracao} minutos</p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-indigo-700 py-4 rounded-lg font-bold hover:bg-opacity-90 transition text-lg disabled:opacity-50"
            >
              {loading ? "Confirmando..." : "✓ Confirmar Agendamento"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

