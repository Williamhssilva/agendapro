import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import AgendaCalendar from "@/components/calendar/AgendaCalendar";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Buscar tenant pelo estabelecimentoId do usuário logado
  const tenant = await requireTenant(session.user.estabelecimentoId);

  // Buscar estatísticas
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const [agendamentosHoje, totalServicos, totalProfissionais, totalClientes] =
    await Promise.all([
      prisma.agendamento.count({
        where: {
          estabelecimentoId: tenant.id,
          dataHora: { gte: hoje, lt: amanha },
        },
      }),
      prisma.servico.count({
        where: { estabelecimentoId: tenant.id, ativo: true },
      }),
      prisma.profissional.count({
        where: { estabelecimentoId: tenant.id, ativo: true },
      }),
      prisma.cliente.count({
        where: { estabelecimentoId: tenant.id },
      }),
    ]);

  // Buscar agendamentos de hoje (para a lista)
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      estabelecimentoId: tenant.id,
      dataHora: { gte: hoje, lt: amanha },
    },
    include: {
      cliente: true,
      servico: true,
      profissional: true,
    },
    orderBy: { dataHora: "asc" },
    take: 10,
  });

  // Buscar agendamentos para o calendário (próximos 30 dias)
  const dataInicioCalendario = new Date(hoje);
  dataInicioCalendario.setDate(dataInicioCalendario.getDate() - 7); // 7 dias atrás
  const dataFimCalendario = new Date(hoje);
  dataFimCalendario.setDate(dataFimCalendario.getDate() + 30); // 30 dias à frente

  const agendamentosCalendario = await prisma.agendamento.findMany({
    where: {
      estabelecimentoId: tenant.id,
      dataHora: {
        gte: dataInicioCalendario,
        lte: dataFimCalendario,
      },
    },
    include: {
      cliente: true,
      servico: true,
      profissional: true,
    },
    orderBy: { dataHora: "asc" },
  });

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Bem-vindo, {session.user?.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Hoje</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{agendamentosHoje}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Serviços</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{totalServicos}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Profissionais</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{totalProfissionais}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Clientes</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{totalClientes}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agendamentos de Hoje */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Agendamentos de Hoje</h2>
          </div>
          <div className="p-6">
            {agendamentos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum agendamento para hoje</p>
            ) : (
              <div className="space-y-3">
                {agendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {agendamento.cliente.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{agendamento.cliente.nome}</p>
                        <p className="text-sm text-gray-600">
                          {agendamento.servico.nome} • {agendamento.profissional.nome}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(agendamento.dataHora).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {agendamento.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Calendário de Agendamentos */}
        <div className="mt-8">
          <AgendaCalendar 
            agendamentos={agendamentosCalendario.map(agendamento => ({
              id: agendamento.id,
              title: `${agendamento.cliente.nome} - ${agendamento.servico.nome}`,
              start: agendamento.dataHora,
              end: new Date(agendamento.dataHora.getTime() + agendamento.duracao * 60000),
              resource: {
                cliente: agendamento.cliente.nome,
                servico: agendamento.servico.nome,
                profissional: agendamento.profissional.nome,
                status: agendamento.status,
                ids: {
                  agendamentoId: agendamento.id,
                  profissionalId: agendamento.profissionalId,
                  servicoId: agendamento.servicoId,
                },
              },
            }))}
          />
        </div>
      </div>
    </div>
  );
}

