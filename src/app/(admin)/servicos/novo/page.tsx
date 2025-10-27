"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovoServicoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const response = await fetch("/api/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.error || "Erro ao criar serviço");
        setLoading(false);
        return;
      }

      router.push("/servicos");
      router.refresh();
    } catch (err) {
      setError("Erro ao criar serviço. Tente novamente.");
      setLoading(false);
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Adicionar Serviço</h1>
              <p className="text-sm text-gray-600">Cadastre um novo serviço</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ex: Corte Feminino, Barba Completa..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Descrição opcional do serviço"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione...</option>
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
                    defaultValue="30"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>
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
                  Serviço ativo (disponível para agendamento)
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
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
                  {loading ? "Salvando..." : "Salvar Serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

