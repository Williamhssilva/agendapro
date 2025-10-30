import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { verificarDisponibilidade } from '@/lib/horarios';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { id: agendamentoId } = await context.params;

  try {
    const body = await request.json();
    const { dataHora, profissionalId: novoProfissionalId } = body as {
      dataHora: string;
      profissionalId?: string;
    };

    if (!dataHora) {
      return NextResponse.json({ error: 'dataHora é obrigatório' }, { status: 400 });
    }

    // Buscar agendamento atual
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: {
        servico: true,
        profissional: true,
      },
    });

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    if (agendamento.estabelecimentoId !== session.user.estabelecimentoId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const profissionalIdDestino = novoProfissionalId || agendamento.profissionalId;

    // Validar profissional de destino
    const profissionalDestino = await prisma.profissional.findFirst({
      where: {
        id: profissionalIdDestino,
        estabelecimentoId: agendamento.estabelecimentoId,
        ativo: true,
      },
    });

    if (!profissionalDestino) {
      return NextResponse.json({ error: 'Profissional inválido' }, { status: 400 });
    }

    const novaData = new Date(dataHora);
    const agora = new Date();

    if (novaData < agora) {
      return NextResponse.json({ error: 'Não é possível reagendar para o passado' }, { status: 400 });
    }

    // Regra de antecedência mínima (2h no mínimo para hoje)
    const config = await prisma.configuracao.findUnique({ where: { estabelecimentoId: agendamento.estabelecimentoId } });
    const antecedenciaMinimaConfig = config?.antecedenciaMinima ?? 0;
    const antecedenciaMinimaMin = Math.max(antecedenciaMinimaConfig, 120);
    const limiteMinimo = new Date(agora.getTime() + antecedenciaMinimaMin * 60000);

    const ehMesmoDia = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    if (ehMesmoDia(novaData, agora) && novaData < limiteMinimo) {
      return NextResponse.json(
        { error: `Reagendamento requer pelo menos ${antecedenciaMinimaMin} minutos de antecedência para hoje.` },
        { status: 400 }
      );
    }

    // Preparar chave de lock por profissional+dia (UTC day bucket)
    const diaChave = `${novaData.getUTCFullYear()}-${String(novaData.getUTCMonth() + 1).padStart(2, '0')}-${String(novaData.getUTCDate()).padStart(2, '0')}`;

    // Retry simples para conflitos de escrita
    const MAX_RETRY = 3;
    let updated: any = null;
    let lastErr: any = null;

    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        updated = await prisma.$transaction(async (tx) => {
          // Lock para evitar corrida no mesmo profissional/dia
          await tx.$executeRawUnsafe(
            'SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))',
            profissionalIdDestino,
            diaChave
          );

          // Revalidar disponibilidade dentro da transação
          const disponivel = await (async () => {
            return await verificarDisponibilidade({
              estabelecimentoId: agendamento.estabelecimentoId,
              profissionalId: profissionalIdDestino,
              dataHora: novaData,
              duracao: agendamento.duracao,
              agendamentoIdExcluir: agendamento.id,
            });
          })();

          if (!disponivel) {
            const err: any = new Error('TIME_CONFLICT');
            err.code = 'TIME_CONFLICT';
            throw err;
          }

          // Atualizar agendamento
          return await tx.agendamento.update({
            where: { id: agendamento.id },
            data: {
              dataHora: novaData,
              profissionalId: profissionalIdDestino,
            },
            include: {
              cliente: true,
              servico: true,
              profissional: true,
            },
          });
        }, { isolationLevel: 'Serializable' });
        break;
      } catch (err: any) {
        if (err.code === 'P2034' || err.code === 'TIME_CONFLICT') {
          lastErr = err;
          await new Promise((r) => setTimeout(r, 100 * attempt));
          continue;
        }
        throw err;
      }
    }

    if (!updated) {
      if (lastErr?.code === 'TIME_CONFLICT') {
        return NextResponse.json(
          { error: 'Este horário está indisponível para o reagendamento.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: 'Conflito de concorrência. Tente novamente.' }, { status: 409 });
    }

    console.log('✅ Reagendamento atualizado:', {
      id: updated.id,
      dataHoraAnterior: agendamento.dataHora,
      dataHoraNova: updated.dataHora,
      profissionalAnterior: agendamento.profissional?.nome,
      profissionalNovo: updated.profissional?.nome,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Erro no reagendamento:', error);
    return NextResponse.json({ error: 'Erro ao reagendar' }, { status: 500 });
  }
}


