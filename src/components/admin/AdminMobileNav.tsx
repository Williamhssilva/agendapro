'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminNavItems } from "@/components/admin/navItems";

type AdminMobileNavProps = {
  tenantName?: string | null;
  tenantPlan?: string | null;
  userName?: string | null;
  userInitials?: string | null;
  signOutAction: () => Promise<void>;
};

export function AdminMobileNav({
  tenantName,
  tenantPlan,
  userName,
  userInitials,
  signOutAction,
}: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const initials = userInitials && userInitials.trim().length > 0 ? userInitials : "US";

  return (
    <header className="md:hidden bg-indigo-700 text-white shadow">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-indigo-700">
            {(tenantName?.substring(0, 2) || "AG").toUpperCase()}
          </div>
          <div className="leading-tight">
            <p className="font-semibold truncate max-w-[12rem]">{tenantName || "AgendaPro"}</p>
            <p className="text-indigo-300 text-xs">{tenantPlan || "Plano"}</p>
          </div>
        </div>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-indigo-600">
          <div className="px-4 py-3 flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white">
              {initials.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{userName || "Usuário"}</p>
            </div>
          </div>

          <nav className="px-2 pb-4 space-y-1">
            {adminNavItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    active ? "bg-indigo-600 text-white" : "text-indigo-100 hover:bg-indigo-600 hover:text-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.icon("mr-3 h-5 w-5")}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 pb-4 border-t border-indigo-600 pt-3">
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-sm font-medium rounded-md"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
