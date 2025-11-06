"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovoProfissionalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    // Construir horários de trabalho
    const dias = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
    const horarios: Record<string, any> = {};
    
    for (const dia of dias) {
      const aberto = formData.get(`${dia}_aberto`) === "on";
      if (aberto) {
        const inicio = (formData.get(`${dia}_inicio`) as string) || "09:00";
        const fim = (formData.get(`${dia}_fim`) as string) || "18:00";
        const almocoInicio = (formData.get(`${dia}_almocoInicio`) as string) || null;
        const almocoFim = (formData.get(`${dia}_almocoFim`) as string) || null;
        
        horarios[dia] = {
          aberto: true,
          inicio,
          fim,
          ...(almocoInicio && almocoFim ? { almocoInicio, almocoFim } : {}),
        };
      } else {
        horarios[dia] = { aberto: false };
      }
    }
    
    const data = {
      nome: formData.get("nome"),
      email: formData.get("email") || "",
      telefone: formData.get("telefone"),
      especialidade: formData.get("especialidade"),
      ativo: formData.get("ativo") === "on",
      horariosTrabalho: JSON.stringify(horarios),
    };

    try {
      const response = await fetch("/api/profissionais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao criar profissional");
        setLoading(false);
        return;
      }

      router.push("/profissionais");
      router.refresh();
    } catch (err) {
      setError("Erro ao criar profissional. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/profissionais" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Adicionar Profissional</h1>
              <p className="text-sm text-gray-600">Cadastre um novo membro da equipe</p>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ex: Maria Silva, João Santos..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="maria@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone (opcional)
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidade / Função
                </label>
                <input
                  type="text"
                  name="especialidade"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Cabeleireira, Barbeiro, Manicure, Esteticista..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ativo"
                  id="ativo"
                  defaultChecked
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                  Profissional ativo (disponível para agendamentos)
                </label>
              </div>

              {/* Seção de Horários de Trabalho e Almoço */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Horários de Trabalho e Almoço</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure os horários de trabalho e intervalo de almoço para cada dia da semana.
                  Os horários serão cruzados com os horários do estabelecimento (configurações gerais).
                  Deixe o horário de almoço em branco se o profissional não tiver intervalo.
                </p>
                
                <div className="space-y-4">
                  {(() => {
                    const dias = [
                      { k: "segunda", label: "Segunda-feira" },
                      { k: "terca", label: "Terça-feira" },
                      { k: "quarta", label: "Quarta-feira" },
                      { k: "quinta", label: "Quinta-feira" },
                      { k: "sexta", label: "Sexta-feira" },
                      { k: "sabado", label: "Sábado" },
                      { k: "domingo", label: "Domingo" },
                    ];
                    // Valores padrão para novo profissional
                    const defaults: Record<string, any> = {
                      segunda: { aberto: true, inicio: "09:00", fim: "18:00" },
                      terca: { aberto: true, inicio: "09:00", fim: "18:00" },
                      quarta: { aberto: true, inicio: "09:00", fim: "18:00" },
                      quinta: { aberto: true, inicio: "09:00", fim: "18:00" },
                      sexta: { aberto: true, inicio: "09:00", fim: "18:00" },
                      sabado: { aberto: true, inicio: "09:00", fim: "14:00" },
                      domingo: { aberto: false },
                    };
                    return dias.map(({ k, label }) => {
                      const d = defaults[k];
                      return (
                        <div key={k} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <input
                              id={`${k}_aberto`}
                              name={`${k}_aberto`}
                              type="checkbox"
                              defaultChecked={!!d.aberto}
                              className="h-4 w-4"
                            />
                            <label htmlFor={`${k}_aberto`} className="text-sm font-medium text-gray-700">
                              {label}
                            </label>
                          </div>
                          
                          {d.aberto && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 ml-6">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Início</label>
                                <input
                                  name={`${k}_inicio`}
                                  type="time"
                                  defaultValue={d.inicio || "09:00"}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Fim</label>
                                <input
                                  name={`${k}_fim`}
                                  type="time"
                                  defaultValue={d.fim || "18:00"}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Almoço Início (opcional)</label>
                                <input
                                  name={`${k}_almocoInicio`}
                                  type="time"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="12:00"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Almoço Fim (opcional)</label>
                                <input
                                  name={`${k}_almocoFim`}
                                  type="time"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="13:00"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link
                  href="/profissionais"
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Salvar Profissional"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

