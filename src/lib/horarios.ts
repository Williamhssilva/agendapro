import { prisma } from "./prisma";
import { format, addMinutes, parse, isBefore, isAfter, isSameDay } from "date-fns";

/**
 * Calcula horários disponíveis para um profissional em uma data
 */
export async function calcularHorariosDisponiveis({
  profissionalId,
  servicoId,
  data,
  estabelecimentoId,
}: {
  profissionalId: string;
  servicoId: string;
  data: Date;
  estabelecimentoId: string;
}) {
  // 1. Buscar profissional e seus horários
  const profissional = await prisma.profissional.findUnique({
    where: { id: profissionalId },
  });

  if (!profissional || !profissional.horariosTrabalho) {
    return [];
  }

  // 2. Buscar serviço para saber a duração
  const servico = await prisma.servico.findUnique({
    where: { id: servicoId },
  });

  if (!servico) {
    return [];
  }

  // 3. Buscar configurações do estabelecimento
  const configuracao = await prisma.configuracao.findUnique({
    where: { estabelecimentoId },
  });

  const intervaloMinutos = configuracao?.intervaloMinutos || 0;

  // 4. Parse dos horários de trabalho
  const horarios = JSON.parse(profissional.horariosTrabalho);
  const diaSemana = getDiaSemana(data);
  const horarioDia = horarios[diaSemana];

  if (!horarioDia || !horarioDia.aberto) {
    return []; // Profissional não trabalha neste dia
  }

  // 5. Buscar agendamentos do profissional neste dia
  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      profissionalId,
      dataHora: {
        gte: inicioDia,
        lte: fimDia,
      },
      status: {
        in: ["pendente", "confirmado"],
      },
    },
    include: {
      servico: true,
    },
  });

  // 6. Gerar slots de horários
  const slots: string[] = [];
  const horaInicio = parse(horarioDia.inicio, "HH:mm", data);
  const horaFim = parse(horarioDia.fim, "HH:mm", data);

  let horaAtual = horaInicio;

  while (isBefore(horaAtual, horaFim)) {
    const horaFimSlot = addMinutes(horaAtual, servico.duracao);

    // Verificar se o slot completo cabe no horário de trabalho
    if (isAfter(horaFimSlot, horaFim)) {
      break;
    }

    // Verificar se não conflita com agendamentos existentes
    const conflito = agendamentos.some((agendamento) => {
      const agendamentoInicio = new Date(agendamento.dataHora);
      const agendamentoFim = addMinutes(agendamentoInicio, agendamento.servico.duracao);

      // Verifica se há sobreposição
      return (
        (isBefore(horaAtual, agendamentoFim) && isAfter(horaFimSlot, agendamentoInicio)) ||
        horaAtual.getTime() === agendamentoInicio.getTime()
      );
    });

    if (!conflito) {
      slots.push(format(horaAtual, "HH:mm"));
    }

    // Próximo slot (duração do serviço + intervalo)
    horaAtual = addMinutes(horaAtual, servico.duracao + intervaloMinutos);
  }

  return slots;
}

/**
 * Retorna o dia da semana em português
 */
function getDiaSemana(data: Date): string {
  const dias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  return dias[data.getDay()];
}

/**
 * Verifica se um horário está disponível
 */
export async function verificarDisponibilidade({
  profissionalId,
  dataHora,
  duracao,
  agendamentoIdExcluir,
}: {
  profissionalId: string;
  dataHora: Date;
  duracao: number;
  agendamentoIdExcluir?: string;
}) {
  const fimAgendamento = addMinutes(dataHora, duracao);

  // Buscar agendamentos conflitantes
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      profissionalId,
      id: agendamentoIdExcluir ? { not: agendamentoIdExcluir } : undefined,
      status: {
        in: ["pendente", "confirmado"],
      },
      OR: [
        {
          // Início do novo agendamento cai durante um agendamento existente
          dataHora: {
            lte: dataHora,
          },
          // Calculamos o fim baseado na duração
        },
      ],
    },
    include: {
      servico: true,
    },
  });

  // Verificar sobreposição manualmente
  for (const agendamento of agendamentos) {
    const agendamentoInicio = new Date(agendamento.dataHora);
    const agendamentoFim = addMinutes(agendamentoInicio, agendamento.servico.duracao);

    // Há sobreposição se:
    // - Novo início < existente fim E novo fim > existente início
    if (isBefore(dataHora, agendamentoFim) && isAfter(fimAgendamento, agendamentoInicio)) {
      return false;
    }
  }

  return true;
}

