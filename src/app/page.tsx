import Link from 'next/link';
import { getTenantBySubdomain } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  // Verificar se é um tenant (subdomain)
  const tenant = await getTenantBySubdomain();
  
  // Se tem tenant, mostrar home do cliente
  if (tenant) {
    // Buscar serviços ativos
    const servicos = await prisma.servico.findMany({
      where: {
        estabelecimentoId: tenant.id,
        ativo: true,
      },
      orderBy: { categoria: "asc" },
    });

    // Buscar profissionais ativos
     const profissionais = await prisma.profissional.findMany({
       where: {
         estabelecimentoId: tenant.id,
         ativo: true,
       },
       orderBy: { nome: "asc" },
     });
 
     const corPrimaria = tenant.corPrimaria || "#4F46E5";

     // Renderizar home do cliente
     return (
       <div className="min-h-screen bg-gray-50">
         {/* Aplicar cor do tenant via CSS */}
         <style dangerouslySetInnerHTML={{ __html: `
           .tenant-primary-bg {
             background-color: ${corPrimaria};
           }
           .tenant-primary-text {
             color: ${corPrimaria};
           }
         `}} />

         {/* Header */}
         <header className="bg-white shadow-sm sticky top-0 z-50">
           <div className="max-w-7xl mx-auto px-4 py-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                 {tenant.logoUrl ? (
                   <img src={tenant.logoUrl} alt={tenant.nome} className="h-12 w-12 object-cover rounded-lg" />
                 ) : (
                   <div className="tenant-primary-bg h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                     {tenant.nome.substring(0, 2).toUpperCase()}
                   </div>
                 )}
                 <div>
                   <h1 className="text-xl font-bold text-gray-900">{tenant.nome}</h1>
                   {tenant.cidade && (
                     <p className="text-xs text-gray-600">📍 {tenant.cidade}, {tenant.estado}</p>
                   )}
                 </div>
               </div>
               
               <Link
                 href="/agendar"
                 className="tenant-primary-bg px-6 py-2 rounded-lg text-white font-medium hover:opacity-90 transition"
               >
                 Agendar
               </Link>
             </div>
           </div>
         </header>

         {/* Main Content */}
        {/* Hero */}
        <div className="tenant-primary-bg text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Agende seu horário online</h2>
            <p className="text-xl mb-8 opacity-90">Rápido, fácil e sem complicação</p>
            <Link
              href="/agendar"
              className="tenant-primary-text inline-block bg-white px-8 py-4 rounded-lg font-bold hover:bg-opacity-90 transition text-lg"
            >
              Agendar Agora →
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Nossos Serviços */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nossos Serviços</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicos.map((servico) => (
                <div key={servico.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <h4 className="font-bold text-gray-900 mb-2">{servico.nome}</h4>
                  {servico.descricao && (
                    <p className="text-sm text-gray-600 mb-4">{servico.descricao}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">⏱️ {servico.duracao} min</span>
                    <span className="tenant-primary-text text-xl font-bold">
                      R$ {servico.preco.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nossa Equipe */}
          {profissionais.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nossa Equipe</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {profissionais.map((profissional) => {
                  const iniciais = profissional.nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

                  return (
                    <div key={profissional.id} className="bg-white rounded-xl shadow-md p-6 text-center">
                      <div className="w-20 h-20 tenant-primary-bg rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                        {iniciais}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{profissional.nome}</h3>
                      {profissional.especialidade && (
                        <p className="text-sm text-gray-600">{profissional.especialidade}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA Final */}
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto para agendar?</h2>
              <p className="text-gray-600 mb-8 text-lg">Escolha o melhor horário para você!</p>
              <Link
                href="/agendar"
                className="tenant-primary-bg inline-block px-10 py-4 rounded-lg text-white font-bold text-lg hover:opacity-90 transition"
              >
                Agendar Meu Horário →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sem tenant = Página de marketing do AgendaPro
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl">
              A
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            AgendaPro
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Sistema SaaS de Agendamento Multi-Tenant
          </p>
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-full font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Sistema funcionando!</span>
          </div>
        </div>

        {/* Status */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Implementado</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ Autenticação</span>
                  <span className="font-bold text-green-600">100%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ Multi-tenancy</span>
                  <span className="font-bold text-green-600">100%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ CRUD Serviços</span>
                  <span className="font-bold text-green-600">100%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ CRUD Profissionais</span>
                  <span className="font-bold text-green-600">100%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ Agendamento Admin</span>
                  <span className="font-bold text-green-600">100%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ Área do Cliente</span>
                  <span className="font-bold text-green-600">100%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">⏳ Billing</span>
                  <span className="font-bold text-blue-600">Próximo</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">⏳ Notificações</span>
                  <span className="font-bold text-blue-600">Próximo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navegação Rápida */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white mb-8">
            <h2 className="text-2xl font-bold mb-6">🚀 Acesso Rápido</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/cadastro"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition"
              >
                <h3 className="font-bold mb-1">📝 Criar Conta</h3>
                <p className="text-sm text-indigo-100">Cadastrar novo estabelecimento</p>
              </Link>
              
              <Link 
                href="/login"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition"
              >
                <h3 className="font-bold mb-1">🔐 Login</h3>
                <p className="text-sm text-indigo-100">Acessar área administrativa</p>
              </Link>
              
              <Link 
                href="/dashboard"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition"
              >
                <h3 className="font-bold mb-1">💼 Dashboard</h3>
                <p className="text-sm text-indigo-100">Painel administrativo</p>
              </Link>
              
              <a 
                href="http://demo.localhost:3000"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition"
              >
                <h3 className="font-bold mb-1">👤 Site do Cliente (Demo)</h3>
                <p className="text-sm text-indigo-100">Ver como cliente vê</p>
              </a>
            </div>
          </div>

          {/* Features Implementadas */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Progresso do MVP: 40%</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Autenticação</h3>
                  <p className="text-sm text-gray-600">Login, cadastro e proteção de rotas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Multi-Tenancy</h3>
                  <p className="text-sm text-gray-600">Isolamento perfeito por estabelecimento</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">CRUDs Completos</h3>
                  <p className="text-sm text-gray-600">Serviços, Profissionais e Agendamentos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Área do Cliente</h3>
                  <p className="text-sm text-gray-600">White-label + Agendamento online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
