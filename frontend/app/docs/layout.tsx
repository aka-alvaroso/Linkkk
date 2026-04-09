"use client";
import Navigation from "@/app/components/Navigation/Navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  TbRocket,
  TbLink,
  TbAdjustmentsHorizontal,
  TbChartBar,
  TbQrcode,
  TbCrown,
  TbShieldLock,
  TbMenu2,
  TbX,
} from "react-icons/tb";
import { useState } from "react";

const sections = [
  { href: "/docs/getting-started", label: "Primeros pasos", icon: TbRocket },
  { href: "/docs/links", label: "Enlaces", icon: TbLink },
  { href: "/docs/rules", label: "Reglas", icon: TbAdjustmentsHorizontal },
  { href: "/docs/analytics", label: "Analytics", icon: TbChartBar },
  { href: "/docs/qr-codes", label: "Códigos QR", icon: TbQrcode },
  { href: "/docs/plans", label: "Planes", icon: TbCrown },
  { href: "/docs/security", label: "Seguridad", icon: TbShieldLock },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebar = (
    <nav className="flex flex-col gap-1">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = pathname === section.href;
        return (
          <Link
            key={section.href}
            href={section.href}
            onClick={() => setSidebarOpen(false)}
            className={`
              flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150
              ${isActive
                ? "bg-dark text-light shadow-[3px_3px_0_var(--color-primary)]"
                : "text-dark/70 hover:bg-dark/5 hover:text-dark"
              }
            `}
          >
            <Icon size={18} strokeWidth={2.5} />
            {section.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-light text-dark">
      <Navigation />

      <div className="w-full md:max-w-3/4 mx-auto px-4 md:px-8 pt-24 md:pt-32 pb-20">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-dark/5 text-dark font-bold text-sm cursor-pointer"
        >
          {sidebarOpen ? <TbX size={18} /> : <TbMenu2 size={18} />}
          Documentos
        </button>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="md:hidden mb-6 bg-white rounded-2xl border border-dark/10 p-4">
            {sidebar}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 shrink-0 sticky top-32 self-start">
            <p className="text-xs font-black italic text-dark/40 uppercase tracking-wider mb-4 px-4">
              Documentos
            </p>
            {sidebar}
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white p-6 md:p-10 rounded-3xl border border-dark/10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
