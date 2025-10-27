import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ServicoSchema } from "@/lib/validations";

// GET - Buscar um serviço específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params; // Next.js 15: await params

    const servico = await prisma.servico.findFirst({
      where: {
        id,
        estabelecimentoId: session.user.estabelecimentoId, // Segurança: só busca do próprio tenant
      },
    });

    if (!servico) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    return NextResponse.json(servico);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviço" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar serviço
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params; // Next.js 15: await params
    const body = await request.json();

    // Validar dados
    const validacao = ServicoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validacao.error.flatten() },
        { status: 400 }
      );
    }

    // Verificar se o serviço pertence ao tenant (SEGURANÇA)
    const servicoExistente = await prisma.servico.findFirst({
      where: {
        id,
        estabelecimentoId: session.user.estabelecimentoId,
      },
    });

    if (!servicoExistente) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    const servico = await prisma.servico.update({
      where: { id },
      data: validacao.data,
    });

    return NextResponse.json(servico);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar serviço" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar serviço
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params; // Next.js 15: await params

    // Verificar se o serviço pertence ao tenant (SEGURANÇA)
    const servico = await prisma.servico.findFirst({
      where: {
        id,
        estabelecimentoId: session.user.estabelecimentoId,
      },
    });

    if (!servico) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    // Verificar se tem agendamentos futuros
    const agendamentosFuturos = await prisma.agendamento.count({
      where: {
        servicoId: id,
        dataHora: { gte: new Date() },
        status: { in: ["pendente", "confirmado"] },
      },
    });

    if (agendamentosFuturos > 0) {
      return NextResponse.json(
        { error: `Não é possível deletar. Existem ${agendamentosFuturos} agendamentos futuros com este serviço.` },
        { status: 400 }
      );
    }

    await prisma.servico.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao deletar serviço" },
      { status: 500 }
    );
  }
}

