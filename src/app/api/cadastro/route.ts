import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, senha, nomeEstabelecimento, tipo } = body;

    // Validações
    if (!nome || !email || !senha || !nomeEstabelecimento || !tipo) {
      return NextResponse.json(
        { message: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { message: "Este email já está cadastrado" },
        { status: 400 }
      );
    }

    // Gerar slug único para o estabelecimento
    const slugBase = nomeEstabelecimento
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9]+/g, "-") // Substitui caracteres especiais por -
      .replace(/^-+|-+$/g, ""); // Remove - do início e fim

    let slug = slugBase;
    let tentativa = 1;

    // Garantir slug único
    while (await prisma.estabelecimento.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${tentativa}`;
      tentativa++;
    }

    // Buscar plano Profissional (padrão)
    const planoProfissional = await prisma.plano.findUnique({
      where: { slug: "profissional" },
    });

    if (!planoProfissional) {
      return NextResponse.json(
        { message: "Erro interno: planos não configurados" },
        { status: 500 }
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar estabelecimento + usuário + configurações (transação)
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar estabelecimento
      const estabelecimento = await tx.estabelecimento.create({
        data: {
          slug,
          nome: nomeEstabelecimento,
          tipo,
          planoId: planoProfissional.id,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
          subscriptionStatus: "trial",
        },
      });

      // Criar usuário admin
      const usuario = await tx.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          estabelecimentoId: estabelecimento.id,
          role: "admin",
        },
      });

      // Criar configurações padrão
      await tx.configuracao.create({
        data: {
          estabelecimentoId: estabelecimento.id,
          horariosFuncionamento: JSON.stringify({
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

      return { estabelecimento, usuario };
    });

    return NextResponse.json({
      success: true,
      slug: resultado.estabelecimento.slug,
      message: "Conta criada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json(
      { message: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}

