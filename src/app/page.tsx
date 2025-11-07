import Link from 'next/link';

// Sem tenant = Página de marketing do AgendaPro
// O middleware já cuida de redirecionar subdomínios para /loja
export default function HomePage() {
  return (
    <div className="min-h-screen relative bg-white">
      {/* Background decor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 blur-3xl opacity-50" />
        <div className="absolute top-64 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-rose-100 via-amber-100 to-emerald-100 blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-extrabold flex items-center justify-center">A</div>
            <span className="font-semibold text-gray-900">AgendaPro</span>
            <span className="hidden md:inline-block text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">SaaS de Agendamento</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <a href="#features" className="hover:text-gray-900">Funcionalidades</a>
            <a href="#planos" className="hover:text-gray-900">Planos</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Entrar</Link>
            <Link href="/cadastro" className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow transition-all">Começar</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4">
        {/* HERO VENDAS */}
        <section className="py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">Feito para salões e clínicas</span>
              <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.08]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">Reduza faltas</span>
                <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">e aumente sua agenda</span>
              </h1>
              <p className="mt-5 text-lg text-gray-600">
                O AgendaPro organiza seus horários, confirma clientes automaticamente e mostra um site bonito com sua marca. Mais agendamentos, menos trabalho manual.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/cadastro" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm hover:shadow-md active:translate-y-px transition-all">
                  Começar grátis
                </Link>
                <Link href="/login" className="px-5 py-3 border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg font-semibold transition-colors">
                  Ver demo
                </Link>
              </div>
              <div className="mt-6 text-sm text-gray-500">Sem cartão de crédito • White-label • Multi-tenant</div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100 rounded-3xl blur-2xl" />
              <div className="relative bg-white/70 backdrop-blur border border-gray-100 rounded-2xl shadow-xl p-4">
                {/* Mock card */}
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-xs text-gray-500">AgendaPro</div>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 h-40 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 shadow-inner flex items-center justify-center text-white font-semibold">Calendário</div>
                      <div className="space-y-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="h-12 rounded-md bg-gray-100 border border-gray-200" />
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-10 rounded-md bg-gray-50 border border-gray-200" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DORES E BENEFÍCIOS */}
        <section className="py-10">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {t:'Menos no-show', d:'Confirmações e lembretes reduzem faltas e atrasos.'},
              {t:'Mais vendas', d:'Site do cliente com agendamento 24h por dia.'},
              {t:'Sem dor de cabeça', d:'Agenda integrada para toda a equipe.'},
            ].map((b, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-3">{i+1}</div>
                <h3 className="font-semibold text-gray-900">{b.t}</h3>
                <p className="text-sm text-gray-600 mt-1">{b.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES ORIENTADAS A RESULTADO */}
        <section className="py-16" id="features">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Tudo que você precisa para agendar</h2>
            <p className="mt-3 text-gray-600">Admin gerencia; clientes agendam. Simples, bonito e eficiente.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              {t:'Agenda do Admin', d:'Visual timeline e calendário intuitivo'},
              {t:'Site do Cliente', d:'Página pública com serviços e profissionais'},
              {t:'Horários Disponíveis', d:'Cálculo automático com conflitos evitados'},
              {t:'Reagendamento', d:'Troque data/profissional com segurança'},
              {t:'Status e Confirmação', d:'Fluxo de confirmação/cancelamento'},
              {t:'Personalização', d:'Logo e cor primária do estabelecimento'},
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-3">{i+1}</div>
                <h3 className="font-semibold text-gray-900">{f.t}</h3>
                <p className="text-sm text-gray-600 mt-1">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROVA SOCIAL */}
        <section className="py-14">
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/60 p-8">
            {/* Logos */}
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-gray-600">Confiado por negócios locais</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
                {['Studio Bela','Barbearia Alfa','Clínica Vita','Spa Lumina'].map((n, i) => (
                  <div
                    key={i}
                    className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs flex items-center shadow-sm hover:shadow transition-shadow"
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
            {/* Depoimentos */}
            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {[
                {n:'Ana, Studio Bela', d:'“Reduzimos faltas e organizamos melhor a agenda.”'},
                {n:'Rafael, Barbearia Alfa', d:'“Equipe sincronizada e clientes felizes.”'},
                {n:'Dra. Paula, Clínica Vita', d:'“Agendamento no celular facilitou muito para os pacientes.”'},
              ].map((c, i) => (
                <div
                  key={i}
                  className="relative bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md">
                    <span className="text-lg leading-none">“</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-lg flex items-center justify-center font-bold shadow-sm">
                      {c.n.substring(0,1)}
                    </div>
                    <div className="text-sm text-gray-800 font-semibold">{c.n}</div>
                  </div>
                  <p className="mt-3 text-[15px] text-gray-700 italic">{c.d}</p>
                  <div className="mt-3 flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, s) => (
                      <svg key={s} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.035a1 1 0 00-1.175 0L6.109 16.9c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.474 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANOS VENDAS */}
        <div className="mt-12" id="planos">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Planos simples e transparentes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Básico */}
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 hover:ring-1 hover:ring-indigo-200">
              <h3 className="text-xl font-semibold text-gray-900">Básico</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">R$ 49<span className="text-base font-normal text-gray-500">/mês</span></p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li>• 2 profissionais</li>
                <li>• 100 notificações/mês</li>
                <li>• Agenda admin</li>
                <li>• Site do cliente</li>
              </ul>
              <button className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md active:translate-y-px transition-all">Começar</button>
            </div>
            {/* Profissional */}
            <div className="bg-white rounded-2xl shadow p-6 ring-2 ring-indigo-600 transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 mb-2">Recomendado</div>
              <h3 className="text-xl font-semibold text-gray-900">Profissional</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">R$ 99<span className="text-base font-normal text-gray-500">/mês</span></p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li>• 5 profissionais</li>
                <li>• 1.000 notificações/mês</li>
                <li>• Personalização de cores/logo</li>
                <li>• Relatórios básicos</li>
              </ul>
              <button className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md active:translate-y-px transition-all">Começar</button>
            </div>
            {/* Premium */}
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 hover:ring-1 hover:ring-indigo-200">
              <h3 className="text-xl font-semibold text-gray-900">Premium</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">R$ 199<span className="text-base font-normal text-gray-500">/mês</span></p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li>• Profissionais ilimitados</li>
                <li>• Notificações ilimitadas</li>
                <li>• Domínio próprio</li>
                <li>• API e integrações</li>
              </ul>
              <button className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md active:translate-y-px transition-all">Começar</button>
            </div>
          </div>
        </div>

        {/* Benefícios Rápidos */}
        <div className="mt-16">
          <div className="grid md:grid-cols-4 gap-4">
            {[{t:'White-label', d:'Logo e cores do seu negócio'}, {t:'Multi-tenant', d:'Vários estabelecimentos isolados'}, {t:'Rápido', d:'UX otimizada e responsiva'}, {t:'Seguro', d:'Prisma + Postgres (Supabase)'}].map((b, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <p className="text-sm text-indigo-600 font-semibold">{b.t}</p>
                <p className="mt-1 text-gray-800 font-medium">{b.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div id="faq" className="mt-16 max-w-3xl mx-auto scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900">Perguntas frequentes</h2>
          <div className="mt-6 space-y-4">
            {[
              {q:'Preciso de cartão para começar?', a:'Não. O cadastro é gratuito e o trial não exige cartão.'},
              {q:'Consigo usar meu domínio?', a:'Sim, no plano Premium há suporte a domínio próprio.'},
              {q:'Posso cancelar quando quiser?', a:'Sim. Cancelamento a qualquer momento, sem multas.'},
              {q:'Tem suporte por email?', a:'Sim. Suporte para dúvidas técnicas e operacionais.'},
            ].map((f, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white">
                <p className="font-semibold text-gray-900">{f.q}</p>
                <p className="text-sm text-gray-600 mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final + Footer */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white text-center transition-transform hover:-translate-y-0.5">
            <h3 className="text-2xl md:text-3xl font-extrabold">Pronto para modernizar seus agendamentos?</h3>
            <p className="mt-2 text-indigo-100">Comece grátis agora. Leva menos de 2 minutos.</p>
            <div className="mt-6">
              <Link href="/cadastro" className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 rounded-lg font-semibold inline-block shadow-sm hover:shadow-md active:translate-y-px transition-all">Criar minha conta</Link>
            </div>
          </div>
          <div className="mt-8 py-8 text-sm text-gray-500 flex flex-wrap items-center justify-between">
            <p>© {new Date().getFullYear()} AgendaPro</p>
            <div className="flex gap-4">
              <a className="hover:text-gray-700" href="#">Planos</a>
              <Link className="hover:text-gray-700" href="/login">Login</Link>
              <Link className="hover:text-gray-700" href="/cadastro">Cadastro</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
