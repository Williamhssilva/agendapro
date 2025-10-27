import { getTenantBySubdomain } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ClienteHomePage() {
  const tenant = await getTenantBySubdomain();

  if (!tenant) {
    return <div>Estabelecimento não encontrado</div>;
  }

  // Buscar serviços ativos
  const servicos = await prisma.servico.findMany({
    where: {
      estabelecimentoId: tenant.id,
      ativo: true,
    },
    orderBy: { categoria: "asc" },
  });

  // Buscar profissionais ativos
  const profissionais = await prisma.profissional.findMany({
    where: {
      estabelecimentoId: tenant.id,
      ativo: true,
    },
    orderBy: { nome: "asc" },
  });

  // Agrupar serviços por categoria
  const servicosPorCategoria = servicos.reduce((acc, servico) => {
    if (!acc[servico.categoria]) {
      acc[servico.categoria] = [];
    }
    acc[servico.categoria].push(servico);
    return acc;
  }, {} as Record<string, typeof servicos>);

  const categorias = {
    cabelo: { nome: "Cabelo", emoji: "💇‍♀️" },
    barba: { nome: "Barba", emoji: "🧔" },
    unhas: { nome: "Unhas", emoji: "💅" },
    estetica: { nome: "Estética", emoji: "✨" },
    spa: { nome: "Spa", emoji: "🧖‍♀️" },
  };

  return (
    <>
      {/* Hero */}
      <div className="tenant-primary-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Agende seu horário online</h2>
          <p className="text-xl mb-8 opacity-90">Rápido, fácil e sem complicação</p>
          <Link
            href="/agendar"
            className="tenant-primary-text inline-block bg-white px-8 py-4 rounded-lg font-bold hover:bg-opacity-90 transition text-lg"
          >
            Agendar Agora →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Nossos Serviços */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nossos Serviços</h2>
          
          <div className="space-y-8">
            {Object.entries(servicosPorCategoria).map(([categoria, servicosCategoria]) => (
              <div key={categoria}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {categorias[categoria as keyof typeof categorias]?.emoji}{" "}
                  {categorias[categoria as keyof typeof categorias]?.nome}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servicosCategoria.map((servico) => (
                    <div key={servico.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                      <h4 className="font-bold text-gray-900 mb-2">{servico.nome}</h4>
                      {servico.descricao && (
                        <p className="text-sm text-gray-600 mb-4">{servico.descricao}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">⏱️ {servico.duracao} min</span>
                        <span className="tenant-primary-text text-xl font-bold">
                          R$ {servico.preco.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nossa Equipe */}
        {profissionais.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nossa Equipe</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {profissionais.map((profissional, index) => {
                const cores = [
                  "from-indigo-500 to-purple-600",
                  "from-purple-500 to-pink-600",
                  "from-green-500 to-emerald-600",
                  "from-blue-500 to-cyan-600",
                ];
                const iniciais = profissional.nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

                return (
                  <div key={profissional.id} className="bg-white rounded-xl shadow-md p-6 text-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${cores[index % cores.length]} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}>
                      {iniciais}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{profissional.nome}</h3>
                    {profissional.especialidade && (
                      <p className="text-sm text-gray-600">{profissional.especialidade}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA Final */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto para agendar?</h2>
            <p className="text-gray-600 mb-8 text-lg">Escolha o melhor horário para você!</p>
            <Link
              href="/agendar"
              className="tenant-primary-bg inline-block px-10 py-4 rounded-lg text-white font-bold text-lg hover:opacity-90 transition"
            >
              Agendar Meu Horário →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

