import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ServicoSchema } from "@/lib/validations";

// GET - Listar todos os serviços do estabelecimento
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const servicos = await prisma.servico.findMany({
      where: {
        estabelecimentoId: session.user.estabelecimentoId,
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

// POST - Criar novo serviço
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar dados
    const validacao = ServicoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validacao.error.flatten() },
        { status: 400 }
      );
    }

    const servico = await prisma.servico.create({
      data: {
        ...validacao.data,
        estabelecimentoId: session.user.estabelecimentoId,
      },
    });

    return NextResponse.json(servico, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 500 }
    );
  }
}

