import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfissionalSchema } from "@/lib/validations";

// GET - Buscar um profissional específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    const profissional = await prisma.profissional.findFirst({
      where: {
        id,
        estabelecimentoId: session.user.estabelecimentoId,
      },
    });

    if (!profissional) {
      return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
    }

    return NextResponse.json(profissional);
  } catch (error) {
    console.error("Erro ao buscar profissional:", error);
    return NextResponse.json(
      { error: "Erro ao buscar profissional" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar profissional
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

    // Validar dados
    const validacao = ProfissionalSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validacao.error.flatten() },
        { status: 400 }
      );
    }

    // Verificar se o profissional pertence ao tenant (SEGURANÇA)
    const profissionalExistente = await prisma.profissional.findFirst({
      where: {
        id,
        estabelecimentoId: session.user.estabelecimentoId,
      },
    });

    if (!profissionalExistente) {
      return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
    }

    const profissional = await prisma.profissional.update({
      where: { id },
      data: validacao.data,
    });

    return NextResponse.json(profissional);
  } catch (error) {
    console.error("Erro ao atualizar profissional:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar profissional" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar profissional
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

    // Verificar se o profissional pertence ao tenant (SEGURANÇA)
    const profissional = await prisma.profissional.findFirst({
      where: {
        id,
        estabelecimentoId: session.user.estabelecimentoId,
      },
    });

    if (!profissional) {
      return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
    }

    // Verificar se tem agendamentos futuros
    const agendamentosFuturos = await prisma.agendamento.count({
      where: {
        profissionalId: id,
        dataHora: { gte: new Date() },
        status: { in: ["pendente", "confirmado"] },
      },
    });

    if (agendamentosFuturos > 0) {
      return NextResponse.json(
        { error: `Não é possível deletar. Existem ${agendamentosFuturos} agendamentos futuros com este profissional.` },
        { status: 400 }
      );
    }

    await prisma.profissional.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar profissional:", error);
    return NextResponse.json(
      { error: "Erro ao deletar profissional" },
      { status: 500 }
    );
  }
}

