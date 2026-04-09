"use client"
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TbHome, TbLayoutGrid, TbUser, TbPlus, TbSettings, TbSparkles } from "react-icons/tb";
import * as motion from "motion/react-client";
import CreateLinkDrawer from "../Drawer/CreateLinkDrawer";
import SelectPlanModal from "../Modal/SelectPlanModal";
import { useAuth } from "@/app/hooks";
import { useTranslations } from 'next-intl';

export default function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [createLinkDrawer, setCreateLinkDrawer] = useState(false);
  const [showSelectPlanModal, setShowSelectPlanModal] = useState(false);
  const t = useTranslations('Navigation');

  const navigationItems = isAuthenticated
    ? user && user.role === 'STANDARD'
      ? [
          { id: "home", icon: TbHome, href: "/" },
          { id: "dashboard", icon: TbLayoutGrid, href: "/dashboard" },
          { id: "settings", icon: TbSettings, href: "/settings" },
        ]
      : [
          { id: "home", icon: TbHome, href: "/" },
          { id: "dashboard", icon: TbLayoutGrid, href: "/dashboard" },
          { id: "settings", icon: TbSettings, href: "/settings" },
        ]
    : [
        { id: "home", icon: TbHome, href: "/" },
        { id: "dashboard", icon: TbLayoutGrid, href: "/dashboard" },
        { id: "login", icon: TbUser, href: "/auth/login" },
      ];

  const isActive = (item: typeof navigationItems[0]) => {
    if (item.href === "/") return pathname === "/";
    if (item.href === "/dashboard") return pathname.startsWith("/dashboard");
    if (item.href === "/auth/login") return pathname.startsWith("/auth");
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Bottom Navigation Bar — uses CSS animation instead of motion
          to avoid transform interfering with fixed positioning during GSAP pins */}
      <nav
        className="md:hidden fixed bottom-6 left-0 right-0 z-[100] flex items-center justify-between px-6 animate-slide-up"
      >
        {/* Nav Pill - Left */}
        <div className="flex items-center gap-1 bg-dark/95 backdrop-blur-md rounded-full py-2.5 px-3.5 border border-dark shadow-lg">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push(item.href)}
                className={`
                  relative flex items-center justify-center
                  size-11 rounded-xl
                  transition-all duration-200
                  ${active
                    ? "text-primary before:content-[''] before:absolute before:h-1 before:w-3 before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:bg-primary before:rounded-full"
                    : "text-light"
                  }
                `}
                aria-label={item.id}
              >
                <Icon size={32} strokeWidth={2} />
              </motion.button>
            );
          })}
        </div>

        {/* FAB - Right */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCreateLinkDrawer(true)}
          className="flex items-center justify-center p-4 rounded-full bg-primary text-dark border-2 border-dark shadow-[3px_3px_0_var(--color-dark)]"
          aria-label={t('create')}
        >
          <TbPlus size={32} strokeWidth={2} />
        </motion.button>
      </nav>

      {/* Create Link Drawer */}
      <CreateLinkDrawer
        open={createLinkDrawer}
        onClose={() => setCreateLinkDrawer(false)}
      />

      {/* Select Plan Modal */}
      <SelectPlanModal
        open={showSelectPlanModal}
        onClose={() => setShowSelectPlanModal(false)}
      />
    </>
  );
}
