"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [servico, setServico] = useState<any>(null);
  const [servicoId, setServicoId] = useState<string>("");

  useEffect(() => {
    async function init() {
      const resolvedParams = await params;
      setServicoId(resolvedParams.id);
      
      try {
        const response = await fetch(`/api/servicos/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setServico(data);
        }
      } catch (err) {
        setError("Erro ao carregar serviço");
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
      descricao: formData.get("descricao"),
      categoria: formData.get("categoria"),
      duracao: Number(formData.get("duracao")),
      preco: Number(formData.get("preco")),
      ativo: formData.get("ativo") === "on",
    };

    try {
      const response = await fetch(`/api/servicos/${servicoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.error || "Erro ao atualizar serviço");
        setLoading(false);
        return;
      }

      router.push("/servicos");
      router.refresh();
    } catch (err) {
      setError("Erro ao atualizar serviço. Tente novamente.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja deletar este serviço?")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/servicos/${servicoId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Erro ao deletar serviço");
        setLoading(false);
        return;
      }

      router.push("/servicos");
      router.refresh();
    } catch (err) {
      alert("Erro ao deletar serviço");
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

  if (!servico) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Serviço não encontrado</p>
          <Link href="/servicos" className="text-indigo-600 hover:underline">
            Voltar para serviços
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
            <Link href="/servicos" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Serviço</h1>
              <p className="text-sm text-gray-600">{servico.nome}</p>
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
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  defaultValue={servico.nome}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  rows={3}
                  defaultValue={servico.descricao || ""}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    name="categoria"
                    required
                    defaultValue={servico.categoria}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="cabelo">💇‍♀️ Cabelo</option>
                    <option value="barba">🧔 Barba</option>
                    <option value="unhas">💅 Unhas</option>
                    <option value="estetica">✨ Estética</option>
                    <option value="spa">🧖‍♀️ Spa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (minutos) *
                  </label>
                  <input
                    type="number"
                    name="duracao"
                    required
                    min="5"
                    step="5"
                    defaultValue={servico.duracao}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    name="preco"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={servico.preco}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ativo"
                  id="ativo"
                  defaultChecked={servico.ativo}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                  Serviço ativo (disponível para agendamento)
                </label>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                >
                  Deletar Serviço
                </button>
                
                <div className="flex space-x-4">
                  <Link
                    href="/servicos"
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

