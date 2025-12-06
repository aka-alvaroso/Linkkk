"use client"
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TbLayoutDashboard, TbLogin, TbPlus, TbSettings } from "react-icons/tb";
import * as motion from "motion/react-client";
import CreateLinkDrawer from "../Drawer/CreateLinkDrawer";
import { useAuth } from "@/app/hooks";

export default function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [createLinkDrawer, setCreateLinkDrawer] = useState(false);

  // Simple navigation based on authentication
  const navigationItems = isAuthenticated
    ? [
        // Authenticated users
        { id: "dashboard", label: "Dashboard", icon: TbLayoutDashboard, href: "/dashboard" },
        { id: "settings", label: "Settings", icon: TbSettings, href: "/profile" }, // Will be /settings in the future
        { id: "create", label: "Create", icon: TbPlus, action: "create", isFAB: true },
      ]
    : [
        // Guest users
        { id: "dashboard", label: "Dashboard", icon: TbLayoutDashboard, href: "/dashboard" },
        { id: "login", label: "Login", icon: TbLogin, href: "/auth/login" },
        { id: "create", label: "Create", icon: TbPlus, action: "create", isFAB: true },
      ];

  const handleClick = (item: typeof navigationItems[0]) => {
    if (item.action === "create") {
      setCreateLinkDrawer(true);
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const isActive = (item: typeof navigationItems[0]) => {
    if (!item.href) return false;
    if (item.href === "/dashboard") {
      return pathname.startsWith("/dashboard");
    }
    if (item.href === "/auth/login") {
      return pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Bottom Navigation Bar - Pill Style */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="md:hidden fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-4"
      >
        {/* Pill Container */}
        <div className="flex items-center gap-1 bg-dark/95 backdrop-blur-md rounded-2xl p-1.5 border border-dark shadow-lg">
          {navigationItems.map((item) => (
            <NavButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={isActive(item)}
              isFAB={item.isFAB}
              onClick={() => handleClick(item)}
            />
          ))}
        </div>
      </motion.nav>

      {/* Create Link Drawer */}
      <CreateLinkDrawer
        open={createLinkDrawer}
        onClose={() => setCreateLinkDrawer(false)}
      />
    </>
  );
}

/**
 * Navigation button component - Icon only
 */
interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  isFAB?: boolean;
  onClick: () => void;
}

function NavButton({ icon: Icon, label, active, isFAB, onClick }: NavButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        flex items-center justify-center
        size-12 rounded-xl
        transition-all duration-200
        ${isFAB
          ? "bg-primary text-dark"
          : active
            ? "bg-light text-dark"
            : "text-light/90 hover:text-light hover:bg-light/10"
        }
      `}
      aria-label={label}
    >
      <Icon size={22} strokeWidth={active || isFAB ? 2.5 : 2} />
    </motion.button>
  );
}
