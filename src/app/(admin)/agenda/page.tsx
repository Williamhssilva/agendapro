import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AgendaTimeline from "@/components/agenda/AgendaTimeline";
import AgendaFiltros from "@/components/agenda/AgendaFiltros";
import { startOfDay, endOfDay, addDays, subDays } from "date-fns";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; profissionalId?: string; status?: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;

  // Data padrão: hoje (formato YYYY-MM-DD)
  const dataStr = params.data || new Date().toISOString().split("T")[0];
  
  // Criar range do dia em UTC
  const dataFiltro = new Date(dataStr + "T00:00:00.000Z");
  const dataFim = new Date(dataStr + "T23:59:59.999Z");

  // Buscar agendamentos do dia
  const where: any = {
    estabelecimentoId: session.user.estabelecimentoId,
    dataHora: {
      gte: dataFiltro,
      lte: dataFim,
    },
  };

  if (params.profissionalId) {
    where.profissionalId = params.profissionalId;
  }
  if (params.status && ["pendente","confirmado","concluido","cancelado"].includes(params.status)) {
    where.status = params.status;
  }

  const agendamentos = await prisma.agendamento.findMany({
    where,
    include: {
      cliente: true,
      servico: true,
      profissional: true,
    },
    orderBy: { dataHora: "asc" },
  });

  // Buscar agendamentos dos próximos 7 dias (para mostrar datas com agendamentos)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const proximos7Dias = new Date(hoje);
  proximos7Dias.setDate(proximos7Dias.getDate() + 7);

  const agendamentosProximos = await prisma.agendamento.findMany({
    where: {
      estabelecimentoId: session.user.estabelecimentoId,
      dataHora: {
        gte: hoje,
        lte: proximos7Dias,
      },
    },
    select: {
      dataHora: true,
    },
  });

  // Agrupar por data
  const contagemPorDia = agendamentosProximos.reduce((acc, agendamento) => {
    const dataKey = agendamento.dataHora.toISOString().split("T")[0];
    acc[dataKey] = (acc[dataKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const proximosDias = Object.entries(contagemPorDia)
    .map(([data, total]) => ({ data, total }))
    .sort((a, b) => a.data.localeCompare(b.data));

  // Buscar profissionais para o filtro
  const profissionais = await prisma.profissional.findMany({
    where: {
      estabelecimentoId: session.user.estabelecimentoId,
      ativo: true,
    },
    orderBy: { nome: "asc" },
  });

  // Stats do dia
  const stats = {
    total: agendamentos.length,
    confirmados: agendamentos.filter((a) => a.status === "confirmado").length,
    pendentes: agendamentos.filter((a) => a.status === "pendente").length,
    concluidos: agendamentos.filter((a) => a.status === "concluido").length,
  };

  // Converter para JSON simples
  const agendamentosData = agendamentos.map(a => ({
    ...a,
    dataHora: a.dataHora.toISOString(),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    cliente: {
      ...a.cliente,
      createdAt: a.cliente.createdAt.toISOString(),
      updatedAt: a.cliente.updatedAt.toISOString(),
    },
    servico: {
      ...a.servico,
      createdAt: a.servico.createdAt.toISOString(),
      updatedAt: a.servico.updatedAt.toISOString(),
    },
    profissional: {
      ...a.profissional,
      createdAt: a.profissional.createdAt.toISOString(),
      updatedAt: a.profissional.updatedAt.toISOString(),
    },
  }));

  const profissionaisData = profissionais.map(p => ({
    id: p.id,
    nome: p.nome,
  }));

  const diasComAgendamentos = proximosDias;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
              <p className="text-sm text-gray-600">
                {new Date(dataStr).toLocaleDateString("pt-BR", { 
                  weekday: "long", 
                  day: "2-digit", 
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Link
              href="/agenda/novo"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Agendamento
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtro de Status */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">Status:</span>
            {[
              { k: "", l: "Todos" },
              { k: "pendente", l: "Pendentes" },
              { k: "confirmado", l: "Confirmados" },
              { k: "concluido", l: "Concluídos" },
              { k: "cancelado", l: "Cancelados" },
            ].map(s => (
              <Link
                key={s.k || 'todos'}
                href={`/agenda?data=${dataStr}${params.profissionalId ? `&profissionalId=${params.profissionalId}` : ''}${s.k ? `&status=${s.k}` : ''}`}
                className={`px-3 py-1 rounded border ${
                  (params.status || '') === s.k ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {s.l}
              </Link>
            ))}
          </div>
        </div>
        {/* Navegação de Datas (Mini Calendário) */}
        {diasComAgendamentos.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg shadow p-4 mb-6 text-white">
            <p className="text-sm mb-3 opacity-90">📅 Próximos dias com agendamentos:</p>
            <div className="flex flex-wrap gap-2">
              {diasComAgendamentos.map((dia) => (
                <Link
                  key={dia.data}
                  href={`/agenda?data=${dia.data}`}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    dia.data === dataStr
                      ? "bg-white text-indigo-700"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {new Date(dia.data + "T12:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                  <span className="ml-2 text-xs">({dia.total})</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Confirmados</p>
            <p className="text-3xl font-bold text-green-600">{stats.confirmados}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pendentes</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendentes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Concluídos</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.concluidos}</p>
          </div>
        </div>

        {/* Filtros */}
        <AgendaFiltros profissionais={profissionaisData} />

        {/* Timeline */}
        {agendamentosData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum agendamento para este dia</h3>
            <p className="text-gray-600 mb-6">
              {diasComAgendamentos.length > 0 
                ? "Selecione outra data acima ou crie um novo agendamento"
                : "Crie o primeiro agendamento"}
            </p>
            <Link
              href="/agenda/novo"
              className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Criar Agendamento
            </Link>
          </div>
        ) : (
          <AgendaTimeline agendamentos={agendamentosData} />
        )}
      </div>
    </div>
  );
}
