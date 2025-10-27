import Link from 'next/link';

export default function HomePage() {
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
            <span>Projeto iniciado com sucesso!</span>
          </div>
        </div>

        {/* Status */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Status do Projeto</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ Protótipos</span>
                  <span className="font-bold text-green-600">15 telas</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ Documentação</span>
                  <span className="font-bold text-green-600">Completa</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ Schema Prisma</span>
                  <span className="font-bold text-green-600">Multi-tenant</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ Estrutura Next.js</span>
                  <span className="font-bold text-green-600">Criada</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ Instalação</span>
                  <span className="font-bold text-green-600">Completo</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ Auth</span>
                  <span className="font-bold text-green-600">Implementado</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">✅ Multi-tenancy</span>
                  <span className="font-bold text-green-600">Implementado</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">⏳ Features Core</span>
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
                href="http://localhost:5555"
                target="_blank"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition"
              >
                <h3 className="font-bold mb-1">🗄️ Prisma Studio</h3>
                <p className="text-sm text-indigo-100">Ver banco de dados</p>
              </a>
            </div>
          </div>

          {/* Features Implementadas */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Implementado</h2>
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
                  <p className="text-sm text-gray-600">Detecção por subdomain e isolamento</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dashboard Admin</h3>
                  <p className="text-sm text-gray-600">Painel com estatísticas em tempo real</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">⏳</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">CRUD Features</h3>
                  <p className="text-sm text-gray-600">Serviços e Profissionais (próximo)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

