import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfissionalSchema } from "@/lib/validations";
import { canAddProfissional } from "@/lib/tenant";

// GET - Listar todos os profissionais do estabelecimento
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const profissionais = await prisma.profissional.findMany({
      where: {
        estabelecimentoId: session.user.estabelecimentoId,
      },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(profissionais);
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    return NextResponse.json(
      { error: "Erro ao buscar profissionais" },
      { status: 500 }
    );
  }
}

// POST - Criar novo profissional
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se pode adicionar mais profissionais (limite do plano)
    const podeAdicionar = await canAddProfissional(session.user.estabelecimentoId);

    if (!podeAdicionar) {
      return NextResponse.json(
        { error: "Limite de profissionais atingido. Faça upgrade do seu plano." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar dados
    const validacao = ProfissionalSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validacao.error.flatten() },
        { status: 400 }
      );
    }

    const profissional = await prisma.profissional.create({
      data: {
        ...validacao.data,
        estabelecimentoId: session.user.estabelecimentoId,
        // Horários padrão (seg-sex 9-18)
        horariosTrabalho: JSON.stringify({
          segunda: { aberto: true, inicio: "09:00", fim: "18:00" },
          terca: { aberto: true, inicio: "09:00", fim: "18:00" },
          quarta: { aberto: true, inicio: "09:00", fim: "18:00" },
          quinta: { aberto: true, inicio: "09:00", fim: "18:00" },
          sexta: { aberto: true, inicio: "09:00", fim: "18:00" },
          sabado: { aberto: true, inicio: "09:00", fim: "14:00" },
          domingo: { aberto: false },
        }),
      },
    });

    return NextResponse.json(profissional, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar profissional:", error);
    return NextResponse.json(
      { error: "Erro ao criar profissional" },
      { status: 500 }
    );
  }
}

