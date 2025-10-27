import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { calcularHorariosDisponiveis } from "@/lib/horarios";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET - Buscar horários disponíveis (funciona com e sem auth)
export async function GET(request: Request) {
  try {
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

    // Tentar pegar estabelecimentoId da session (admin) ou do subdomain (cliente)
    const session = await auth();
    let estabelecimentoId: string | null = null;

    if (session) {
      // Área admin: usa session
      estabelecimentoId = session.user.estabelecimentoId;
    } else {
      // Área cliente: usa subdomain
      const headersList = await headers();
      const tenantSlug = headersList.get("x-tenant-slug");
      
      if (tenantSlug) {
        const tenant = await prisma.estabelecimento.findUnique({
          where: { slug: tenantSlug },
        });
        estabelecimentoId = tenant?.id || null;
      }
    }

    if (!estabelecimentoId) {
      return NextResponse.json({ error: "Estabelecimento não identificado" }, { status: 400 });
    }

    const horarios = await calcularHorariosDisponiveis({
      profissionalId,
      servicoId,
      data: new Date(data),
      estabelecimentoId,
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

