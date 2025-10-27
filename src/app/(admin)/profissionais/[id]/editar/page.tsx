"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarProfissionalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [profissional, setProfissional] = useState<any>(null);
  const [profissionalId, setProfissionalId] = useState<string>("");

  useEffect(() => {
    async function init() {
      const resolvedParams = await params;
      setProfissionalId(resolvedParams.id);
      
      try {
        const response = await fetch(`/api/profissionais/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfissional(data);
        }
      } catch (err) {
        setError("Erro ao carregar profissional");
      } finally {
        setLoadingData(false);
      }
    }
    init();
  }, [params]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get("nome"),
      email: formData.get("email") || "",
      telefone: formData.get("telefone"),
      especialidade: formData.get("especialidade"),
      ativo: formData.get("ativo") === "on",
    };

    try {
      const response = await fetch(`/api/profissionais/${profissionalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.error || "Erro ao atualizar profissional");
        setLoading(false);
        return;
      }

      router.push("/profissionais");
      router.refresh();
    } catch (err) {
      setError("Erro ao atualizar profissional. Tente novamente.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja deletar este profissional?")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/profissionais/${profissionalId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Erro ao deletar profissional");
        setLoading(false);
        return;
      }

      router.push("/profissionais");
      router.refresh();
    } catch (err) {
      alert("Erro ao deletar profissional");
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!profissional) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Profissional não encontrado</p>
          <Link href="/profissionais" className="text-indigo-600 hover:underline">
            Voltar para profissionais
          </Link>
        </div>
      </div>
    );
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
              <h1 className="text-2xl font-bold text-gray-900">Editar Profissional</h1>
              <p className="text-sm text-gray-600">{profissional.nome}</p>
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
                  defaultValue={profissional.nome}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={profissional.email || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    defaultValue={profissional.telefone || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  defaultValue={profissional.especialidade || ""}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Cabeleireira, Barbeiro..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ativo"
                  id="ativo"
                  defaultChecked={profissional.ativo}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                  Profissional ativo (disponível para agendamentos)
                </label>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                >
                  Deletar Profissional
                </button>
                
                <div className="flex space-x-4">
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
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

