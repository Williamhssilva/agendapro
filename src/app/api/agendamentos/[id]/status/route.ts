import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { status } = body as { status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido' };

    if (!status || !['pendente', 'confirmado', 'cancelado', 'concluido'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const agendamento = await prisma.agendamento.findUnique({ where: { id } });
    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }
    if (agendamento.estabelecimentoId !== session.user.estabelecimentoId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const updated = await prisma.agendamento.update({
      where: { id },
      data: { status },
      include: {
        cliente: true,
        servico: true,
        profissional: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}


