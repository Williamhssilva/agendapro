import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PUT - Atualizar status do agendamento
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, motivoCancelamento } = body;

    // Verificar se o agendamento pertence ao tenant (SEGURANÇA)
    const agendamentoExistente = await prisma.agendamento.findFirst({
      where: {
        id,
        estabelecimentoId: session.user.estabelecimentoId,
      },
    });

    if (!agendamentoExistente) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        status,
        motivoCancelamento: motivoCancelamento || null,
      },
      include: {
        cliente: true,
        servico: true,
        profissional: true,
      },
    });

    return NextResponse.json(agendamento);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar agendamento
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar se o agendamento pertence ao tenant (SEGURANÇA)
    const agendamento = await prisma.agendamento.findFirst({
      where: {
        id,
        estabelecimentoId: session.user.estabelecimentoId,
      },
    });

    if (!agendamento) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    await prisma.agendamento.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao deletar agendamento" },
      { status: 500 }
    );
  }
}

