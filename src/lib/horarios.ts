import { prisma } from "./prisma";
import { format, addMinutes, parse, isBefore, isAfter, isSameDay } from "date-fns";

type HorarioConfigurado = {
  aberto?: boolean | string;
  inicio?: string;
  fim?: string;
  almocoInicio?: string;
  almocoFim?: string;
};

type HorariosConfigurados = Record<string, HorarioConfigurado>;

function formatOffset(minutes: number) {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  return `${sign}${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function parseHorariosJson(value?: string | null): HorariosConfigurados {
  if (!value) {
    return {};
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as HorariosConfigurados;
    }
  } catch {
    // ignora erros de parsing e usa objeto vazio
  }
  return {};
}

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

  // TODO: tornar configurável por estabelecimento
  const timezoneOffsetMinutes =
    (configuracao ? (configuracao as Record<string, any>).fusoHorarioMinutos : undefined) ?? -180; // São Paulo (UTC-3) por padrão
  const offsetStr = formatOffset(timezoneOffsetMinutes);
  const dataISO = format(data, "yyyy-MM-dd");

  const inicioDiaUtc = new Date(`${dataISO}T00:00:00${offsetStr}`);
  const fimDiaUtc = new Date(`${dataISO}T23:59:59${offsetStr}`);

  const dataSelecionadaLocal = addMinutes(inicioDiaUtc, timezoneOffsetMinutes);
  const agora = new Date();
  const agoraLocal = addMinutes(agora, timezoneOffsetMinutes);
  const ehHoje = isSameDay(agoraLocal, dataSelecionadaLocal);
  const limiteMinimoLocal = addMinutes(agoraLocal, antecedenciaMinimaMinutos);

  // 4. Determinar horários finais considerando Estabelecimento e Profissional
  // Regras:
  // - Se Estabelecimento estiver FECHADO no dia → retorna [] (independentemente do profissional)
  // - Se Profissional não tiver horário no dia → usa horário do Estabelecimento
  // - Se ambos tiverem, usa início/fim do Profissional
  const horariosProf: HorariosConfigurados = parseHorariosJson(profissional.horariosTrabalho);
  const horariosEstab: HorariosConfigurados = parseHorariosJson(configuracao?.horariosFuncionamento);

  const diaSemana = getDiaSemana(dataSelecionadaLocal);
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
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      profissionalId,
      dataHora: {
        gte: inicioDiaUtc,
        lte: fimDiaUtc,
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
  const horaInicioLocal = parse(inicioFinal, "HH:mm", dataSelecionadaLocal);
  const horaFimLocal = parse(fimFinal, "HH:mm", dataSelecionadaLocal);

  let horaAtualLocal = horaInicioLocal;

  while (isBefore(horaAtualLocal, horaFimLocal)) {
    const horaFimSlotLocal = addMinutes(horaAtualLocal, servico.duracao);

    // Verificar se o slot completo cabe no horário de trabalho
    if (isAfter(horaFimSlotLocal, horaFimLocal)) {
      break;
    }

    // Verificar se o slot conflita com horário de almoço
    if (almocoInicio !== null && almocoFim !== null) {
      const horaAtualMin = horaAtualLocal.getHours() * 60 + horaAtualLocal.getMinutes();
      const horaFimSlotMin = horaFimSlotLocal.getHours() * 60 + horaFimSlotLocal.getMinutes();
      
      // Se o slot sobrepõe o horário de almoço (início antes do fim do almoço E fim depois do início do almoço)
      if (horaAtualMin < almocoFim && horaFimSlotMin > almocoInicio) {
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        const almocoFimStr = `${pad(Math.floor(almocoFim / 60))}:${pad(almocoFim % 60)}`;
        const almocoFimDate = parse(almocoFimStr, "HH:mm", dataSelecionadaLocal);
        
        // Garantir que não ultrapasse o fim do dia
        if (isBefore(almocoFimDate, horaFimLocal)) {
          horaAtualLocal = almocoFimDate;
        } else {
          break; // Almoço vai até o fim do dia, não há mais slots
        }
        continue;
      }
    }

    // Respeitar antecedência mínima apenas se for hoje
    if (ehHoje) {
      const slotHora = horaAtualLocal.getHours() * 60 + horaAtualLocal.getMinutes();
      const limiteHora = limiteMinimoLocal.getHours() * 60 + limiteMinimoLocal.getMinutes();
      if (slotHora < limiteHora) {
        horaAtualLocal = addMinutes(horaAtualLocal, servico.duracao + intervaloMinutos);
        continue;
      }
    }

    const slotInicioMin = horaAtualLocal.getHours() * 60 + horaAtualLocal.getMinutes();
    const slotFimMin = horaFimSlotLocal.getHours() * 60 + horaFimSlotLocal.getMinutes();

    // Verificar se não conflita com agendamentos existentes
    const conflito = agendamentos.some((agendamento) => {
      const agendamentoInicioLocal = addMinutes(new Date(agendamento.dataHora), timezoneOffsetMinutes);
      const agendamentoFimLocal = addMinutes(agendamentoInicioLocal, agendamento.servico.duracao);

      const agendamentoInicioMin = agendamentoInicioLocal.getHours() * 60 + agendamentoInicioLocal.getMinutes();
      const agendamentoFimMin = agendamentoFimLocal.getHours() * 60 + agendamentoFimLocal.getMinutes();

      return (
        (slotInicioMin < agendamentoFimMin && slotFimMin > agendamentoInicioMin) ||
        slotInicioMin === agendamentoInicioMin
      );
    });

    if (!conflito) {
      slots.push(format(horaAtualLocal, "HH:mm"));
    }

    // Próximo slot (duração do serviço + intervalo)
    horaAtualLocal = addMinutes(horaAtualLocal, servico.duracao + intervaloMinutos);
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
  const timezoneOffsetMinutes = -180;
  const offsetStr = formatOffset(timezoneOffsetMinutes);

  const dataHoraLocal = addMinutes(dataHora, timezoneOffsetMinutes);
  const dataISO = format(dataHoraLocal, "yyyy-MM-dd");
  const inicioDiaUtc = new Date(`${dataISO}T00:00:00${offsetStr}`);
  const fimDiaUtc = new Date(`${dataISO}T23:59:59${offsetStr}`);

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      estabelecimentoId,
      profissionalId,
      id: agendamentoIdExcluir ? { not: agendamentoIdExcluir } : undefined,
      status: { in: ["pendente", "confirmado"] },
      dataHora: { gte: inicioDiaUtc, lte: fimDiaUtc },
    },
    include: { servico: true },
  });

  const novoInicioLocal = addMinutes(dataHora, timezoneOffsetMinutes);
  const novoFimLocal = addMinutes(fimAgendamento, timezoneOffsetMinutes);
  const novoInicioTime = novoInicioLocal.getHours() * 60 + novoInicioLocal.getMinutes();
  const novoFimTime = novoFimLocal.getHours() * 60 + novoFimLocal.getMinutes();

  for (const agendamento of agendamentos) {
    const agendamentoInicioLocal = addMinutes(new Date(agendamento.dataHora), timezoneOffsetMinutes);
    const agendamentoFimLocal = addMinutes(agendamentoInicioLocal, agendamento.servico.duracao);
    
    const agendamentoInicioTime = agendamentoInicioLocal.getHours() * 60 + agendamentoInicioLocal.getMinutes();
    const agendamentoFimTime = agendamentoFimLocal.getHours() * 60 + agendamentoFimLocal.getMinutes();
    
    // Sobreposição: novoInicio < existenteFim && novoFim > existenteInicio
    if (novoInicioTime < agendamentoFimTime && novoFimTime > agendamentoInicioTime) {
      return false;
    }
  }

  return true;
}

