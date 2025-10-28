import { prisma } from "./prisma";
import { format, addMinutes, parse, isBefore, isAfter } from "date-fns";

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

  // 5. Buscar agendamentos do profissional neste dia (limites em UTC para evitar problemas de fuso)
  const startUtc = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate(), 0, 0, 0, 0));
  const endUtc = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate(), 23, 59, 59, 999));

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      profissionalId,
      dataHora: {
        gte: startUtc,
        lte: endUtc,
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

      // Comparar apenas os horários (HH:mm), não as datas completas
      const horaAtualTime = horaAtual.getHours() * 60 + horaAtual.getMinutes();
      const horaFimSlotTime = horaFimSlot.getHours() * 60 + horaFimSlot.getMinutes();
      const agendamentoInicioTime = agendamentoInicio.getHours() * 60 + agendamentoInicio.getMinutes();
      const agendamentoFimTime = agendamentoFim.getHours() * 60 + agendamentoFim.getMinutes();

      // Verifica se há sobreposição de horários
      return (
        (horaAtualTime < agendamentoFimTime && horaFimSlotTime > agendamentoInicioTime) ||
        horaAtualTime === agendamentoInicioTime
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
  estabelecimentoId,
  profissionalId,
  dataHora,
  duracao,
  agendamentoIdExcluir,
}: {
  estabelecimentoId: string;
  profissionalId: string;
  dataHora: Date;
  duracao: number;
  agendamentoIdExcluir?: string;
}) {
  const fimAgendamento = addMinutes(dataHora, duracao);

  // Buscar todos os agendamentos do dia para verificar sobreposição corretamente (usando UTC)
  const inicioDia = new Date(Date.UTC(dataHora.getUTCFullYear(), dataHora.getUTCMonth(), dataHora.getUTCDate(), 0, 0, 0, 0));
  const fimDia = new Date(Date.UTC(dataHora.getUTCFullYear(), dataHora.getUTCMonth(), dataHora.getUTCDate(), 23, 59, 59, 999));

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      estabelecimentoId,
      profissionalId,
      id: agendamentoIdExcluir ? { not: agendamentoIdExcluir } : undefined,
      status: { in: ["pendente", "confirmado"] },
      dataHora: { gte: inicioDia, lte: fimDia },
    },
    include: { servico: true },
  });

  console.log(`🔍 Verificando disponibilidade: ${dataHora.toISOString()} (${dataHora.getHours()}:${dataHora.getMinutes().toString().padStart(2, '0')})`);
  console.log(`📅 Buscando agendamentos entre: ${inicioDia.toISOString()} e ${fimDia.toISOString()}`);
  console.log(`📊 Encontrados ${agendamentos.length} agendamentos no dia`);

  for (const agendamento of agendamentos) {
    const agendamentoInicio = new Date(agendamento.dataHora);
    const agendamentoFim = addMinutes(agendamentoInicio, agendamento.servico.duracao);
    
    // Comparar apenas os horários (HH:mm), não as datas completas
    const novoInicioTime = dataHora.getHours() * 60 + dataHora.getMinutes();
    const novoFimTime = fimAgendamento.getHours() * 60 + fimAgendamento.getMinutes();
    const agendamentoInicioTime = agendamentoInicio.getHours() * 60 + agendamentoInicio.getMinutes();
    const agendamentoFimTime = agendamentoFim.getHours() * 60 + agendamentoFim.getMinutes();
    
    console.log(`⏰ Agendamento existente: ${agendamentoInicio.toISOString()} (${agendamentoInicio.getHours()}:${agendamentoInicio.getMinutes().toString().padStart(2, '0')}) - ${agendamentoFim.getHours()}:${agendamentoFim.getMinutes().toString().padStart(2, '0')}`);
    console.log(`🆚 Comparando: ${dataHora.getHours()}:${dataHora.getMinutes().toString().padStart(2, '0')}-${fimAgendamento.getHours()}:${fimAgendamento.getMinutes().toString().padStart(2, '0')} vs ${agendamentoInicio.getHours()}:${agendamentoInicio.getMinutes().toString().padStart(2, '0')}-${agendamentoFim.getHours()}:${agendamentoFim.getMinutes().toString().padStart(2, '0')}`);
    
    // Sobreposição: novoInicio < existenteFim && novoFim > existenteInicio
    if (novoInicioTime < agendamentoFimTime && novoFimTime > agendamentoInicioTime) {
      console.log(`❌ CONFLITO DETECTADO!`);
      return false;
    }
  }

  return true;
}

