import Link from 'next/link';
import { getTenantBySubdomain } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

export default async function LojaHomePage() {
  const tenant = await getTenantBySubdomain();
  if (!tenant) return null;

  const [servicos, profissionais] = await Promise.all([
    prisma.servico.findMany({
      where: { estabelecimentoId: tenant.id, ativo: true },
      orderBy: { categoria: 'asc' },
    }),
    prisma.profissional.findMany({
      where: { estabelecimentoId: tenant.id, ativo: true },
      orderBy: { nome: 'asc' },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="tenant-primary-bg text-white rounded-2xl p-12 mb-12">
        <h2 className="text-4xl font-bold mb-2">{tenant.nome}</h2>
        <p className="opacity-90 mb-6">Agende seu horário online</p>
        <Link
          href="/agendar"
          className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-opacity-90 transition"
        >
          Agendar Agora →
        </Link>
      </div>

      {/* Serviços */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Serviços</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicos.map((servico) => (
            <div key={servico.id} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6 hover:shadow-md transition">
              <h4 className="font-semibold text-gray-900 mb-1">{servico.nome}</h4>
              {servico.descricao && (
                <p className="text-sm text-gray-600 mb-4">{servico.descricao}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">⏱️ {servico.duracao} min</span>
                <span className="tenant-primary-text text-lg font-bold">R$ {servico.preco.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profissionais */}
      {profissionais.length > 0 && (
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Nossa equipe</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {profissionais.map((prof) => {
              const iniciais = prof.nome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
              return (
                <div key={prof.id} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6 text-center hover:shadow-md transition">
                  <div className="w-20 h-20 tenant-primary-bg rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {iniciais}
                  </div>
                  <h4 className="font-semibold text-gray-900">{prof.nome}</h4>
                  {prof.especialidade && (
                    <p className="text-sm text-gray-600">{prof.especialidade}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-10 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pronto para agendar?</h3>
        <p className="text-gray-600 mb-6">Escolha o melhor horário e confirme online.</p>
        <Link
          href="/agendar"
          className="tenant-primary-bg text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition"
        >
          Agendar meu horário →
        </Link>
      </div>
    </div>
  );
}


