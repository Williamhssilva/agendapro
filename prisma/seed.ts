import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar Planos
  console.log('Criando planos...');
  const planoBasico = await prisma.plano.upsert({
    where: { slug: 'basico' },
    update: {},
    create: {
      nome: 'Básico',
      slug: 'basico',
      precoMensal: 79,
      limiteProfissionais: 2,
      limiteNotificacoes: 100,
      temPersonalizacao: false,
      temDominioProprio: false,
      temAPI: false,
    },
  });

  const planoProfissional = await prisma.plano.upsert({
    where: { slug: 'profissional' },
    update: {},
    create: {
      nome: 'Profissional',
      slug: 'profissional',
      precoMensal: 149,
      limiteProfissionais: 5,
      limiteNotificacoes: -1, // ilimitado
      temPersonalizacao: true,
      temDominioProprio: false,
      temAPI: false,
    },
  });

  const planoPremium = await prisma.plano.upsert({
    where: { slug: 'premium' },
    update: {},
    create: {
      nome: 'Premium',
      slug: 'premium',
      precoMensal: 299,
      limiteProfissionais: -1, // ilimitado
      limiteNotificacoes: -1,
      temPersonalizacao: true,
      temDominioProprio: true,
      temAPI: true,
    },
  });

  console.log('✅ Planos criados:', { planoBasico, planoProfissional, planoPremium });

  // Criar Estabelecimento de Demonstração
  console.log('Criando estabelecimento demo...');
  const demo = await prisma.estabelecimento.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      slug: 'demo',
      nome: 'Salão Demonstração',
      tipo: 'salao',
      email: 'demo@agendapro.com.br',
      telefone: '(11) 99999-9999',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      corPrimaria: '#EC4899', // Pink
      planoId: planoProfissional.id,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
    },
  });

  // Criar Profissionais Demo
  console.log('Criando profissionais demo...');
  const profissional1 = await prisma.profissional.create({
    data: {
      estabelecimentoId: demo.id,
      nome: 'Ana Paula Silva',
      email: 'ana@salaodemo.com',
      telefone: '(11) 98765-4321',
      especialidade: 'Cabeleireira Senior',
      horariosTrabalho: JSON.stringify({
        segunda: { aberto: true, inicio: '09:00', fim: '18:00' },
        terca: { aberto: true, inicio: '09:00', fim: '18:00' },
        quarta: { aberto: true, inicio: '09:00', fim: '18:00' },
        quinta: { aberto: true, inicio: '09:00', fim: '18:00' },
        sexta: { aberto: true, inicio: '09:00', fim: '18:00' },
        sabado: { aberto: true, inicio: '09:00', fim: '14:00' },
        domingo: { aberto: false },
      }),
    },
  });

  // Criar Serviços Demo
  console.log('Criando serviços demo...');
  await prisma.servico.createMany({
    data: [
      {
        estabelecimentoId: demo.id,
        nome: 'Corte Feminino',
        descricao: 'Corte personalizado com lavagem',
        categoria: 'cabelo',
        duracao: 45,
        preco: 60,
      },
      {
        estabelecimentoId: demo.id,
        nome: 'Corte Masculino',
        descricao: 'Corte moderno masculino',
        categoria: 'cabelo',
        duracao: 30,
        preco: 40,
      },
      {
        estabelecimentoId: demo.id,
        nome: 'Barba',
        descricao: 'Barba completa com acabamento',
        categoria: 'barba',
        duracao: 30,
        preco: 30,
      },
      {
        estabelecimentoId: demo.id,
        nome: 'Manicure',
        descricao: 'Esmaltação tradicional ou gel',
        categoria: 'unhas',
        duracao: 45,
        preco: 35,
      },
      {
        estabelecimentoId: demo.id,
        nome: 'Coloração Completa',
        descricao: 'Coloração ou mechas',
        categoria: 'cabelo',
        duracao: 120,
        preco: 150,
      },
    ],
  });

  // Criar Configurações Demo
  console.log('Criando configurações demo...');
  await prisma.configuracao.create({
    data: {
      estabelecimentoId: demo.id,
      horariosFuncionamento: JSON.stringify({
        segunda: { aberto: true, inicio: '09:00', fim: '18:00' },
        terca: { aberto: true, inicio: '09:00', fim: '18:00' },
        quarta: { aberto: true, inicio: '09:00', fim: '18:00' },
        quinta: { aberto: true, inicio: '09:00', fim: '18:00' },
        sexta: { aberto: true, inicio: '09:00', fim: '18:00' },
        sabado: { aberto: true, inicio: '09:00', fim: '14:00' },
        domingo: { aberto: false },
      }),
      intervaloMinutos: 0,
      antecedenciaMinima: 60,
      permiteCancelamento: true,
      antecedenciaCancelamento: 180,
      enviarConfirmacao: true,
      enviarLembrete: true,
      horasAntesLembrete: 24,
    },
  });

  console.log('✅ Seed completo!');
  console.log('');
  console.log('📊 Dados criados:');
  console.log('- 3 Planos (Básico, Profissional, Premium)');
  console.log('- 1 Estabelecimento demo (slug: "demo")');
  console.log('- 1 Profissional (Ana Paula)');
  console.log('- 5 Serviços');
  console.log('- 1 Configuração');
  console.log('');
  console.log('🔗 Acesse: http://localhost:3000');
  console.log('🔗 Tenant demo: http://demo.localhost:3000');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

