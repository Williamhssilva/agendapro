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

    // Antecedência mínima (2h no mínimo)
    const config = await prisma.configuracao.findUnique({ where: { estabelecimentoId } });
    const antecedenciaMinimaConfig = config?.antecedenciaMinima ?? 0;
    const antecedenciaMinimaMin = Math.max(antecedenciaMinimaConfig, 120);
    const agora = new Date();
    const dataAlvo = new Date(dataHora);
    const limiteMinimo = new Date(agora.getTime() + antecedenciaMinimaMin * 60000);
    if (dataAlvo < limiteMinimo) {
      return NextResponse.json(
        { error: `Agendamentos devem ser feitos com pelo menos ${antecedenciaMinimaMin} minutos de antecedência.` },
        { status: 400 }
      );
    }

    // Verificar disponibilidade
    const disponivel = await verificarDisponibilidade({
      estabelecimentoId,
      profissionalId,
      dataHora: dataAlvo,
      duracao: servico.duracao,
    });

    if (!disponivel) {
      return NextResponse.json(
        { error: "Horário não disponível. Já existe um agendamento neste horário." },
        { status: 400 }
      );
    }

    // Verificação adicional: buscar agendamentos exatos no mesmo horário (proteção contra corrida)
    const agendamentoExistente = await prisma.agendamento.findFirst({
      where: {
        estabelecimentoId,
        profissionalId,
        dataHora: new Date(dataHora),
        status: { in: ["pendente", "confirmado"] },
      },
    });

    if (agendamentoExistente) {
      console.log(`❌ DUPLICAÇÃO DETECTADA! Agendamento ${agendamentoExistente.id} já existe no horário ${dataHora}`);
      return NextResponse.json(
        { error: "Este horário acabou de ser ocupado por outro cliente. Tente outro horário." },
        { status: 409 }
      );
    }

    // Criar dentro de transação serializável com advisory lock por profissional+dia
    const dataAlvo = new Date(dataHora);
    const diaChave = `${dataAlvo.getUTCFullYear()}-${String(dataAlvo.getUTCMonth()+1).padStart(2,'0')}-${String(dataAlvo.getUTCDate()).padStart(2,'0')}`;

    // Retry simples para conflitos de escrita (P2034)
    const MAX_RETRY = 3;
    let lastErr: any = null;
    let agendamento: any = null;
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        agendamento = await prisma.$transaction(async (tx) => {
      // Bloqueio transacional por profissional+dia (evita corridas simultâneas)
      await tx.$executeRawUnsafe(
        "SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
        profissionalId,
        diaChave
      );

      // Revalidar disponibilidade dentro da transação
      const aindaDisponivel = await (async () => {
        const inicioDia = new Date(Date.UTC(dataAlvo.getUTCFullYear(), dataAlvo.getUTCMonth(), dataAlvo.getUTCDate(), 0, 0, 0, 0));
        const fimDia = new Date(Date.UTC(dataAlvo.getUTCFullYear(), dataAlvo.getUTCMonth(), dataAlvo.getUTCDate(), 23, 59, 59, 999));
        const existentes = await tx.agendamento.findMany({
          where: {
            estabelecimentoId,
            profissionalId,
            status: { in: ["pendente", "confirmado"] },
            dataHora: { gte: inicioDia, lte: fimDia },
          },
          include: { servico: true },
        });
        const novoInicio = new Date(dataHora);
        const novoFim = new Date(novoInicio.getTime() + servico.duracao * 60000);
        const novoInicioTime = novoInicio.getHours() * 60 + novoInicio.getMinutes();
        const novoFimTime = novoFim.getHours() * 60 + novoFim.getMinutes();
        for (const ag of existentes) {
          const eInicio = new Date(ag.dataHora);
          const eFim = new Date(eInicio.getTime() + ag.servico.duracao * 60000);
          const eInicioTime = eInicio.getHours() * 60 + eInicio.getMinutes();
          const eFimTime = eFim.getHours() * 60 + eFim.getMinutes();
          if (novoInicioTime < eFimTime && novoFimTime > eInicioTime) {
            return false;
          }
        }
        return true;
      })();

      if (!aindaDisponivel) {
        const err: any = new Error("TIME_CONFLICT");
        err.code = "TIME_CONFLICT";
        throw err;
      }

      // Buscar ou criar cliente dentro da transação
      let cliente = await tx.cliente.findFirst({
        where: { estabelecimentoId, telefone: clienteTelefone },
      });
      if (!cliente) {
        cliente = await tx.cliente.create({
          data: {
            estabelecimentoId,
            nome: clienteNome,
            telefone: clienteTelefone,
            email: clienteEmail || null,
          },
        });
      }

      // Status: admin confirma automaticamente, público fica pendente
      const status = session ? "confirmado" : "pendente";
      return await tx.agendamento.create({
        data: {
          estabelecimentoId,
          clienteId: cliente.id,
          servicoId,
          profissionalId,
          dataHora: new Date(dataHora),
          duracao: servico.duracao,
          status,
          observacoes: observacoes || null,
        },
        include: { cliente: true, servico: true, profissional: true },
          });
        }, { isolationLevel: 'Serializable' });
        break; // sucesso
      } catch (e: any) {
        lastErr = e;
        // Prisma P2034: write conflict/deadlock → tenta novamente
        if (e?.code === 'P2034' && attempt < MAX_RETRY) {
          continue;
        }
        // Repropaga outros erros
        throw e;
      }
    }

    console.log("✅ Agendamento criado:", {
      id: agendamento.id,
      dataHora: agendamento.dataHora,
      cliente: agendamento.cliente.nome,
      servico: agendamento.servico.nome,
    });

    return NextResponse.json(agendamento, { status: 201 });
  } catch (error: any) {
    // Conflito detectado pela camada de aplicação/transação
    if (error?.code === 'TIME_CONFLICT' || error?.message === 'TIME_CONFLICT') {
      return NextResponse.json(
        { error: "Este horário acabou de ser ocupado por outro cliente. Tente outro horário." },
        { status: 409 }
      );
    }
    // Conflito/Deadlock mesmo após retries
    if (error?.code === 'P2034') {
      return NextResponse.json(
        { error: "Conflito de concorrência. O horário acabou de ser ocupado. Tente outro." },
        { status: 409 }
      );
    }
    // Prisma/Postgres errors mapeáveis (opcionalmente tratar P2002, etc.)
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento. Tente novamente." },
      { status: 500 }
    );
  }
}

