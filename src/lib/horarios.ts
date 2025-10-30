import { prisma } from "./prisma";
import { format, addMinutes, parse, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";

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
  // Buscar profissional, serviço e configuração em paralelo
  const [profissional, servico, configuracao] = await Promise.all([
    prisma.profissional.findUnique({
      where: { id: profissionalId },
    }),
    prisma.servico.findUnique({
      where: { id: servicoId },
    }),
    prisma.configuracao.findUnique({
      where: { estabelecimentoId },
    }),
  ]);

  if (!profissional || !profissional.horariosTrabalho) {
    return [];
  }

  if (!servico) {
    return [];
  }

  const intervaloMinutos = configuracao?.intervaloMinutos || 0;
  // Antecedência mínima: regra atual exige 2h no mínimo
  const antecedenciaMinimaConfig = configuracao?.antecedenciaMinima ?? 0;
  const antecedenciaMinimaMinutos = Math.max(antecedenciaMinimaConfig, 120);
  
  // Verificar se é hoje para aplicar antecedência mínima
  const hoje = new Date();
  
  // Converter data UTC para local (Brasil UTC-3)
  const dataLocal = new Date(data.getTime() + (3 * 60 * 60 * 1000));
  const hojeLocal = new Date(hoje.getTime() + (3 * 60 * 60 * 1000));
  
  const dataSelecionada = new Date(dataLocal.getFullYear(), dataLocal.getMonth(), dataLocal.getDate());
  const hojeComparacao = new Date(hojeLocal.getFullYear(), hojeLocal.getMonth(), hojeLocal.getDate());
  const ehHoje = dataSelecionada.getTime() === hojeComparacao.getTime();
  

  // 4. Parse dos horários de trabalho
  const horarios = JSON.parse(profissional.horariosTrabalho);
  const diaSemana = getDiaSemana(dataLocal);
  const horarioDia = horarios[diaSemana];

  if (!horarioDia || !horarioDia.aberto) {
    return []; // Profissional não trabalha neste dia
  }

  // 5. Buscar agendamentos do profissional neste dia (usando limites do dia local)
  const inicioDia = startOfDay(dataLocal);
  const fimDia = endOfDay(dataLocal);

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
  const agora = new Date();
  const limiteMinimo = addMinutes(agora, antecedenciaMinimaMinutos);

  while (isBefore(horaAtual, horaFim)) {
    const horaFimSlot = addMinutes(horaAtual, servico.duracao);

    // Verificar se o slot completo cabe no horário de trabalho
    if (isAfter(horaFimSlot, horaFim)) {
      break;
    }

    // Respeitar antecedência mínima apenas se for hoje
    if (ehHoje) {
      const slotHora = horaAtual.getHours() * 60 + horaAtual.getMinutes();
      const limiteHora = limiteMinimo.getHours() * 60 + limiteMinimo.getMinutes();
      if (slotHora < limiteHora) {
        horaAtual = addMinutes(horaAtual, servico.duracao + intervaloMinutos);
        continue;
      }
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

  // Buscar todos os agendamentos do dia para verificar sobreposição corretamente
  // Converter dataHora UTC para local (Brasil UTC-3)
  const dataHoraLocal = new Date(dataHora.getTime() + (3 * 60 * 60 * 1000));
  const inicioDia = startOfDay(dataHoraLocal);
  const fimDia = endOfDay(dataHoraLocal);

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

  for (const agendamento of agendamentos) {
    const agendamentoInicio = new Date(agendamento.dataHora);
    const agendamentoFim = addMinutes(agendamentoInicio, agendamento.servico.duracao);
    
    // Comparar apenas os horários (HH:mm), não as datas completas
    const novoInicioTime = dataHora.getHours() * 60 + dataHora.getMinutes();
    const novoFimTime = fimAgendamento.getHours() * 60 + fimAgendamento.getMinutes();
    const agendamentoInicioTime = agendamentoInicio.getHours() * 60 + agendamentoInicio.getMinutes();
    const agendamentoFimTime = agendamentoFim.getHours() * 60 + agendamentoFim.getMinutes();
    
    // Sobreposição: novoInicio < existenteFim && novoFim > existenteInicio
    if (novoInicioTime < agendamentoFimTime && novoFimTime > agendamentoInicioTime) {
      return false;
    }
  }

  return true;
}

