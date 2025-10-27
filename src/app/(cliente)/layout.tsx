import { getTenantBySubdomain } from "@/lib/tenant";
import { redirect } from "next/navigation";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantBySubdomain();

  // Se não tem tenant (sem subdomain), redireciona para área de marketing
  if (!tenant) {
    redirect("/");
  }

  // Aplicar cor primária do tenant
  const corPrimaria = tenant.corPrimaria || "#4F46E5";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Aplicar cor do tenant via style tag normal */}
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
            <a href="/" className="flex items-center space-x-3">
              {tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.nome} className="h-12 w-12 object-cover rounded-lg" />
              ) : (
                <div className="tenant-primary-bg h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {tenant.nome.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{tenant.nome}</h1>
                {tenant.endereco && (
                  <p className="text-xs text-gray-600">📍 {tenant.cidade}, {tenant.estado}</p>
                )}
              </div>
            </a>
            
            <a
              href="/agendar"
              className="tenant-primary-bg px-6 py-2 rounded-lg text-white font-medium hover:opacity-90 transition"
            >
              Agendar
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm mb-2">{tenant.nome}</p>
          {tenant.telefone && <p className="text-sm mb-2">📱 {tenant.telefone}</p>}
          {tenant.email && <p className="text-sm mb-4">📧 {tenant.email}</p>}
          <p className="text-xs text-gray-500">
            Powered by <span className="text-indigo-400 font-medium">AgendaPro</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

