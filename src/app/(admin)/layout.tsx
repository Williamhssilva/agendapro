import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTenantById } from "@/lib/tenant";
import Link from "next/link";
import { adminNavItems } from "@/components/admin/navItems";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const tenant = await getTenantById(session.user.estabelecimentoId);

  const signOutAction = async () => {
    "use server";
    const { signOut } = await import("@/auth");
    await signOut({ redirectTo: "/login" });
  };

  const userInitials = session.user?.name?.substring(0, 2).toUpperCase() || "US";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-indigo-700">
          <div className="flex items-center flex-shrink-0 px-4 py-5 border-b border-indigo-800">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-indigo-700">
              {tenant?.nome.substring(0, 2).toUpperCase() || "AG"}
            </div>
            <div className="ml-3">
              <p className="text-white font-bold truncate">{tenant?.nome || "AgendaPro"}</p>
              <p className="text-indigo-300 text-xs">{tenant?.plano.nome || "Plano"}</p>
            </div>
          </div>

          <nav className="mt-5 flex-1 px-2 space-y-1 overflow-y-auto">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                {item.icon("mr-3 h-5 w-5")}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <div className="flex items-center w-full">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                {userInitials}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
                <form action={signOutAction}>
                  <button className="text-xs text-indigo-300 hover:text-white">Sair</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <AdminMobileNav
          tenantName={tenant?.nome}
          tenantPlan={tenant?.plano.nome}
          userName={session.user?.name}
          userInitials={session.user?.name?.substring(0, 2).toUpperCase() || "US"}
          navItems={adminNavItems}
          signOutAction={signOutAction}
        />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

