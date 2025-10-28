import Link from 'next/link';
import { getTenantBySubdomain } from '@/lib/tenant';

  // Sem tenant = Página de marketing do AgendaPro
export default async function HomePage() {
  const tenant = await getTenantBySubdomain();
  if (tenant) {
    // Quando houver subdomínio, deixamos o middleware reescrever para /(cliente)/loja
    return null;
  }
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
