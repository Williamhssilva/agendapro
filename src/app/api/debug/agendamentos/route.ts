import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// DEBUG - Ver TODOS os agendamentos sem filtro
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        estabelecimentoId: session.user.estabelecimentoId,
      },
      include: {
        cliente: true,
        servico: true,
        profissional: true,
      },
      orderBy: { dataHora: "desc" },
    });

    return NextResponse.json({
      total: agendamentos.length,
      agendamentos: agendamentos.map(a => ({
        id: a.id,
        dataHora: a.dataHora,
        dataHoraISO: a.dataHora.toISOString(),
        cliente: a.cliente.nome,
        servico: a.servico.nome,
        profissional: a.profissional.nome,
        status: a.status,
      })),
    });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

