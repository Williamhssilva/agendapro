"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get("nome") as string,
      email: formData.get("email") as string,
      senha: formData.get("senha") as string,
      nomeEstabelecimento: formData.get("nomeEstabelecimento") as string,
      tipo: formData.get("tipo") as string,
    };

    try {
      const response = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.message || "Erro ao criar conta");
        setLoading(false);
        return;
      }

      // Redirecionar para onboarding ou dashboard
      router.push("/onboarding");
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            A
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h1>
          <p className="text-gray-600">Comece seu teste grátis de 14 dias</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seu nome
              </label>
              <input
                type="text"
                name="nome"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="João da Silva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="joao@seusalao.com.br"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                name="senha"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Seu Estabelecimento</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do estabelecimento
                </label>
                <input
                  type="text"
                  name="nomeEstabelecimento"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Salão Bella, Barber King..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  name="tipo"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione...</option>
                  <option value="salao">Salão de Beleza</option>
                  <option value="barbearia">Barbearia</option>
                  <option value="clinica">Clínica de Estética</option>
                  <option value="esmalteria">Esmalteria</option>
                  <option value="spa">Spa</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

