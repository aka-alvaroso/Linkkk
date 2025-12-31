"use client"
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TbLayoutDashboard, TbLogin, TbPlus, TbSettings, TbSparkles } from "react-icons/tb";
import * as motion from "motion/react-client";
import CreateLinkDrawer from "../Drawer/CreateLinkDrawer";
import { useAuth } from "@/app/hooks";
import { useToast } from "@/app/hooks/useToast";
import { useTranslations } from 'next-intl';
import { subscriptionService } from "@/app/services/api/subscriptionService";

export default function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [createLinkDrawer, setCreateLinkDrawer] = useState(false);
  const toast = useToast();
  const t = useTranslations('Navigation');

  // Simple navigation based on authentication and user role
  const navigationItems = isAuthenticated
    ? user && user.role === 'STANDARD'
      ? [
          // STANDARD users - show upgrade button
          { id: "dashboard", label: t('dashboard'), icon: TbLayoutDashboard, href: "/dashboard" },
          { id: "settings", label: t('settings'), icon: TbSettings, href: "/settings" },
          { id: "upgrade", label: t('upgradeToPro'), icon: TbSparkles, action: "upgrade", isUpgrade: true },
          { id: "create", label: t('create'), icon: TbPlus, action: "create", isFAB: true },
        ]
      : [
          // PRO users - show settings
          { id: "dashboard", label: t('dashboard'), icon: TbLayoutDashboard, href: "/dashboard" },
          { id: "settings", label: t('settings'), icon: TbSettings, href: "/settings" },
          { id: "create", label: t('create'), icon: TbPlus, action: "create", isFAB: true },
        ]
    : [
        // Guest users
        { id: "dashboard", label: t('dashboard'), icon: TbLayoutDashboard, href: "/dashboard" },
        { id: "login", label: t('login'), icon: TbLogin, href: "/auth/login" },
        { id: "create", label: t('create'), icon: TbPlus, action: "create", isFAB: true },
      ];

  const handleClick = async (item: typeof navigationItems[0]) => {
    if (item.action === "create") {
      setCreateLinkDrawer(true);
    } else if (item.action === "upgrade") {
      try {
        await subscriptionService.createCheckoutSession();
      } catch (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Failed to start checkout. Please try again.');
      }
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
              isUpgrade={item.isUpgrade}
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
  isUpgrade?: boolean;
  onClick: () => void;
}

function NavButton({ icon: Icon, label, active, isFAB, isUpgrade, onClick }: NavButtonProps) {
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
          : isUpgrade
            ? "bg-info text-light"
            : active
              ? "bg-light text-dark"
              : "text-light/90 hover:text-light hover:bg-light/10"
        }
      `}
      aria-label={label}
    >
      <Icon size={22} strokeWidth={active || isFAB || isUpgrade ? 2.5 : 2} />
    </motion.button>
  );
}
