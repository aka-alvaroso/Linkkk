"use client"
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TbHome, TbPlus, TbUser } from "react-icons/tb";
import * as motion from "motion/react-client";
import CreateLinkDrawer from "../Drawer/CreateLinkDrawer";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [createLinkDrawer, setCreateLinkDrawer] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      icon: TbHome,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Profile",
      icon: TbUser,
      href: "/profile",
      active: pathname === "/profile",
    },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-light border-t-2 border-dark safe-bottom"
      >
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {/* Dashboard */}
          <NavButton
            icon={navItems[0].icon}
            label={navItems[0].label}
            active={navItems[0].active}
            onClick={() => router.push(navItems[0].href)}
          />

          {/* Center FAB Button - New Link */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setCreateLinkDrawer(true)}
            className="relative -top-4 flex flex-col items-center justify-center size-16 rounded-2xl bg-primary border-4 border-light shadow-[0_4px_0_var(--color-dark)] active:shadow-[0_2px_0_var(--color-dark)] active:translate-y-0.5 transition-all"
          >
            <TbPlus size={32} className="text-dark" strokeWidth={3} />
          </motion.button>

          {/* Profile */}
          <NavButton
            icon={navItems[1].icon}
            label={navItems[1].label}
            active={navItems[1].active}
            onClick={() => router.push(navItems[1].href)}
          />
        </div>
      </motion.nav>

      {/* Create Link Drawer */}
      <CreateLinkDrawer
        open={createLinkDrawer}
        onClose={() => setCreateLinkDrawer(false)}
      />

      {/* Spacer to prevent content being hidden behind nav */}
      {/* <div className="md:hidden h-20" /> */}
    </>
  );
}

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon: Icon, label, active, onClick }: NavButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-colors ${
        active
          ? "text-dark"
          : "text-dark/40"
      }`}
    >
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      <span
        className={`text-xs font-bold italic ${
          active ? "text-dark" : "text-dark/40"
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}
