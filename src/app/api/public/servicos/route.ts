import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET - Listar serviços públicos (sem auth)
export async function GET() {
  try {
    // Pegar tenant do subdomain (middleware já injeta)
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug");

    if (!tenantSlug) {
      return NextResponse.json({ error: "Tenant não identificado" }, { status: 400 });
    }

    // Buscar estabelecimento
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { slug: tenantSlug },
    });

    if (!estabelecimento) {
      return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 });
    }

    // Buscar serviços ativos
    const servicos = await prisma.servico.findMany({
      where: {
        estabelecimentoId: estabelecimento.id,
        ativo: true,
      },
      orderBy: [
        { categoria: "asc" },
        { nome: "asc" },
      ],
    });

    return NextResponse.json(servicos);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviços" },
      { status: 500 }
    );
  }
}

