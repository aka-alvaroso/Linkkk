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
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Docs.layout");
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = [
    { href: "/docs/getting-started", label: t("nav.gettingStarted"), icon: TbRocket, color: "bg-primary text-dark" },
    { href: "/docs/links",           label: t("nav.links"),           icon: TbLink,                    color: "bg-info text-dark" },
    { href: "/docs/rules",           label: t("nav.rules"),           icon: TbAdjustmentsHorizontal,   color: "bg-warning text-dark" },
    { href: "/docs/analytics",       label: t("nav.analytics"),       icon: TbChartBar,                color: "bg-secondary text-light" },
    { href: "/docs/qr-codes",        label: t("nav.qrCodes"),         icon: TbQrcode,                  color: "bg-primary text-dark" },
    { href: "/pricing",               label: t("nav.plans"),           icon: TbCrown,                   color: "bg-warning text-dark" },
    { href: "/docs/security",        label: t("nav.security"),        icon: TbShieldLock,              color: "bg-danger text-light" },
  ];

  const sidebar = (
    <nav className="flex flex-col gap-2">
      {sections.map((section, i) => {
        const Icon = section.icon;
        const isActive = pathname === section.href;
        return (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={section.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150
                ${isActive
                  ? `${section.color} border border-dark shadow-[3px_3px_0_var(--color-dark)]`
                  : "text-dark/70 hover:bg-dark/5 hover:text-dark"
                }
              `}
            >
              <Icon size={18} strokeWidth={2.5} />
              {section.label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-light text-dark">
      <Navigation />

      <div className="w-full md:max-w-3/4 mx-auto px-4 md:px-8 pt-24 md:pt-32 pb-20">
        {/* Mobile sidebar toggle */}
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "backOut" }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-dark/5 text-dark font-bold text-sm cursor-pointer"
        >
          {sidebarOpen ? <TbX size={18} /> : <TbMenu2 size={18} />}
          {sidebarOpen ? t("menuClose") : t("menuOpen")}
        </motion.button>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "backOut" }}
              className="md:hidden mb-6 bg-dark/5 rounded-2xl p-4"
            >
              {sidebar}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 shrink-0 sticky top-32 self-start">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="text-xs font-black italic text-dark/40 uppercase tracking-wider mb-4 px-4"
            >
              {t("documents")}
            </motion.p>
            {sidebar}
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "backOut" }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
