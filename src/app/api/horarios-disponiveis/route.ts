import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { calcularHorariosDisponiveis } from "@/lib/horarios";

// GET - Buscar horários disponíveis
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profissionalId = searchParams.get("profissionalId");
    const servicoId = searchParams.get("servicoId");
    const data = searchParams.get("data");

    if (!profissionalId || !servicoId || !data) {
      return NextResponse.json(
        { error: "Parâmetros faltando: profissionalId, servicoId, data" },
        { status: 400 }
      );
    }

    const horarios = await calcularHorariosDisponiveis({
      profissionalId,
      servicoId,
      data: new Date(data),
      estabelecimentoId: session.user.estabelecimentoId,
    });

    return NextResponse.json({ horarios });
  } catch (error) {
    console.error("Erro ao calcular horários:", error);
    return NextResponse.json(
      { error: "Erro ao calcular horários disponíveis" },
      { status: 500 }
    );
  }
}

