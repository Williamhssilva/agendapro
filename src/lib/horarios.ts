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

  if (!profissional) {
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
  

  // 4. Determinar horários finais considerando Estabelecimento e Profissional
  // Regras:
  // - Se Estabelecimento estiver FECHADO no dia → retorna [] (independentemente do profissional)
  // - Se Profissional não tiver horário no dia → usa horário do Estabelecimento
  // - Se ambos tiverem, usa início/fim do Profissional
  let horariosProf: any = {};
  let horariosEstab: any = {};
  try {
    if (profissional.horariosTrabalho) horariosProf = JSON.parse(profissional.horariosTrabalho);
  } catch { horariosProf = {}; }
  try {
    if (configuracao?.horariosFuncionamento) horariosEstab = JSON.parse(configuracao.horariosFuncionamento);
  } catch { horariosEstab = {}; }

  const diaSemana = getDiaSemana(dataLocal);
  const diaEstab = horariosEstab[diaSemana];
  const diaProf = horariosProf[diaSemana];

  // Regra 1: Se Estabelecimento tem o dia definido E está fechado → bloqueia (independente do profissional)
  // Verificar se aberto é explicitamente false (pode ser false, "false", ou undefined)
  if (diaEstab && (diaEstab.aberto === false || diaEstab.aberto === "false")) {
    return [];
  }

  // Regra 2: Determinar se o dia está aberto e quais horários usar (interseção Estabelecimento x Profissional)
  const estabAberto = !!(diaEstab && (diaEstab.aberto === true || diaEstab.aberto === "true"));
  const profAberto = !!(diaProf && (diaProf.aberto === true || diaProf.aberto === "true"));

  if (!estabAberto && !profAberto) {
    return [];
  }

  const toMin = (hhmm?: string) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const estabStart = toMin(diaEstab?.inicio);
  const estabEnd = toMin(diaEstab?.fim);
  const profStart = toMin(diaProf?.inicio);
  const profEnd = toMin(diaProf?.fim);

  let startMin: number | null = null;
  let endMin: number | null = null;

  if (estabAberto && profAberto) {
    startMin = Math.max(estabStart ?? -Infinity, profStart ?? -Infinity);
    endMin = Math.min(estabEnd ?? Infinity, profEnd ?? Infinity);
  } else if (estabAberto) {
    startMin = estabStart ?? null;
    endMin = estabEnd ?? null;
  } else if (profAberto) {
    startMin = profStart ?? null;
    endMin = profEnd ?? null;
  }

  if (startMin === null || endMin === null || !(startMin < endMin)) {
    return [];
  }

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const inicioFinal = `${pad(Math.floor(startMin / 60))}:${pad(startMin % 60)}`;
  const fimFinal = `${pad(Math.floor(endMin / 60))}:${pad(endMin % 60)}`;

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

  // 6. Verificar horário de almoço (se existir)
  const almocoInicio = toMin(diaProf?.almocoInicio);
  const almocoFim = toMin(diaProf?.almocoFim);

  // 7. Gerar slots de horários
  const slots: string[] = [];
  const horaInicio = parse(inicioFinal, "HH:mm", data);
  const horaFim = parse(fimFinal, "HH:mm", data);

  let horaAtual = horaInicio;
  const agora = new Date();
  const limiteMinimo = addMinutes(agora, antecedenciaMinimaMinutos);

  while (isBefore(horaAtual, horaFim)) {
    const horaFimSlot = addMinutes(horaAtual, servico.duracao);

    // Verificar se o slot completo cabe no horário de trabalho
    if (isAfter(horaFimSlot, horaFim)) {
      break;
    }

    // Verificar se o slot conflita com horário de almoço
    if (almocoInicio !== null && almocoFim !== null) {
      const horaAtualMin = horaAtual.getHours() * 60 + horaAtual.getMinutes();
      const horaFimSlotMin = horaFimSlot.getHours() * 60 + horaFimSlot.getMinutes();
      
      // Se o slot sobrepõe o horário de almoço (início antes do fim do almoço E fim depois do início do almoço)
      if (horaAtualMin < almocoFim && horaFimSlotMin > almocoInicio) {
        // Pular para depois do almoço
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        const almocoFimStr = `${pad(Math.floor(almocoFim / 60))}:${pad(almocoFim % 60)}`;
        const almocoFimDate = parse(almocoFimStr, "HH:mm", data);
        
        // Garantir que não ultrapasse o fim do dia
        if (isBefore(almocoFimDate, horaFim)) {
          horaAtual = almocoFimDate;
        } else {
          break; // Almoço vai até o fim do dia, não há mais slots
        }
        continue;
      }
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

