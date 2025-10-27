import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTenantById } from "@/lib/tenant";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Buscar tenant pelo estabelecimentoId do usuário logado
  const tenant = await getTenantById(session.user.estabelecimentoId);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-indigo-700">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 py-5 border-b border-indigo-800">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-indigo-700">
              {tenant?.nome.substring(0, 2).toUpperCase() || "AG"}
            </div>
            <div className="ml-3">
              <p className="text-white font-bold truncate">{tenant?.nome || "AgendaPro"}</p>
              <p className="text-indigo-300 text-xs">{tenant?.plano.nome || "Plano"}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex-1 px-2 space-y-1 overflow-y-auto">
            <Link
              href="/dashboard"
              className="text-white hover:bg-indigo-600 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/agenda"
              className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agenda
            </Link>

            <Link
              href="/servicos"
              className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Serviços
            </Link>

            <Link
              href="/profissionais"
              className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Profissionais
            </Link>

            <div className="border-t border-indigo-800 my-4"></div>

            <Link
              href="/configuracoes"
              className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações
            </Link>

            <Link
              href="/meu-plano"
              className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Meu Plano
            </Link>
          </nav>

          {/* User Info */}
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <div className="flex items-center w-full">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                {session.user?.name?.substring(0, 2).toUpperCase() || "US"}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
                <form action={async () => {
                  "use server";
                  const { signOut } = await import("@/auth");
                  await signOut({ redirectTo: "/login" });
                }}>
                  <button className="text-xs text-indigo-300 hover:text-white">Sair</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

