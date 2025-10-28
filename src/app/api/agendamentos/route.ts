import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verificarDisponibilidade } from "@/lib/horarios";
import { headers } from "next/headers";

// GET - Listar agendamentos
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data");
    const profissionalId = searchParams.get("profissionalId");

    const where: any = {
      estabelecimentoId: session.user.estabelecimentoId,
    };

    // Filtrar por data se fornecida
    if (data) {
      const dataInicio = new Date(data);
      dataInicio.setHours(0, 0, 0, 0);
      const dataFim = new Date(data);
      dataFim.setHours(23, 59, 59, 999);

      where.dataHora = {
        gte: dataInicio,
        lte: dataFim,
      };
    }

    // Filtrar por profissional se fornecido
    if (profissionalId) {
      where.profissionalId = profissionalId;
    }

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        cliente: true,
        servico: true,
        profissional: true,
      },
      orderBy: { dataHora: "asc" },
    });

    return NextResponse.json(agendamentos);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}

// POST - Criar novo agendamento (funciona com e sem auth)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clienteNome, clienteTelefone, clienteEmail, servicoId, profissionalId, dataHora, observacoes } = body;

    // Validações básicas
    if (!clienteNome || !clienteTelefone || !servicoId || !profissionalId || !dataHora) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Identificar estabelecimento (session ou subdomain)
    const session = await auth();
    let estabelecimentoId: string | null = null;

    if (session) {
      // Admin logado
      estabelecimentoId = session.user.estabelecimentoId;
    } else {
      // Cliente público - pega do subdomain
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

    // Buscar serviço para pegar duração
    const servico = await prisma.servico.findFirst({
      where: {
        id: servicoId,
        estabelecimentoId,
      },
    });

    if (!servico) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    // Verificar disponibilidade
    const disponivel = await verificarDisponibilidade({
      estabelecimentoId,
      profissionalId,
      dataHora: new Date(dataHora),
      duracao: servico.duracao,
    });

    if (!disponivel) {
      return NextResponse.json(
        { error: "Horário não disponível. Já existe um agendamento neste horário." },
        { status: 400 }
      );
    }

    // Buscar ou criar cliente
    let cliente = await prisma.cliente.findFirst({
      where: {
        estabelecimentoId,
        telefone: clienteTelefone,
      },
    });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          estabelecimentoId,
          nome: clienteNome,
          telefone: clienteTelefone,
          email: clienteEmail || null,
        },
      });
    }

    // Criar agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        estabelecimentoId,
        clienteId: cliente.id,
        servicoId,
        profissionalId,
        dataHora: new Date(dataHora),
        duracao: servico.duracao,
        status: "confirmado",
        observacoes: observacoes || null,
      },
      include: {
        cliente: true,
        servico: true,
        profissional: true,
      },
    });

    console.log("✅ Agendamento criado:", {
      id: agendamento.id,
      dataHora: agendamento.dataHora,
      cliente: agendamento.cliente.nome,
      servico: agendamento.servico.nome,
    });

    return NextResponse.json(agendamento, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}

