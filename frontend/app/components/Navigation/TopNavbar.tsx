"use client"
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CreateLinkDrawer from "../Drawer/CreateLinkDrawer";
import { useAuth } from "@/app/hooks";
import { TbPlus, TbLogin, TbExternalLink } from "react-icons/tb";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import Button from "../ui/Button/Button";

interface TopNavbarProps {
  showCreate?: boolean;
}

export default function TopNavbar({ showCreate = false }: TopNavbarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [createLinkDrawer, setCreateLinkDrawer] = useState(false);

  return (
    <>
      {/* Top Navigation Bar - 3 Section Layout */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "backOut" }}
        className="hidden md:flex fixed top-6 left-0 right-0 z-50 px-4"
      >
        <div className="w-full max-w-3/4 mx-auto flex items-center relative">

          {/* Left Section - Logo */}
          <Link href="/" className="text-4xl font-black italic z-10">
            <span className="text-dark transition-all duration-300 ease-in-out hover:text-primary hover:text-shadow-[_4px_4px_0_var(--color-dark)]">
              k.
            </span>
          </Link>

          {/* Center Section - Navigation Links (Pill Style) - Absolutely Centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-2xl px-3 py-1.5 border border-dark shadow-[4px_4px_0_var(--color-dark)] bg-light">
            <NavItem
              href="/"
              label="Home"
              active={pathname === "/"}
            />
            <NavItem
              href="/dashboard"
              label="Dashboard"
              active={pathname.startsWith("/dashboard")}
            />

            {/* Create Button with Animation */}
            <AnimatePresence mode="wait">
              {showCreate && (
                <motion.div
                  initial={{ opacity: 0, width: 0, scale: 0.8 }}
                  animate={{ opacity: 1, width: "auto", scale: 1 }}
                  exit={{ opacity: 0, width: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: "backInOut" }}
                  className=""
                >
                  <Button
                    variant='solid'
                    size='sm'
                    rounded='xl'
                    leftIcon={<TbPlus size={18} />}
                    expandOnHover="text"
                    onClick={() => setCreateLinkDrawer(true)}
                    className="ml-1 bg-primary text-dark hover:shadow-[_4px_4px_0_var(--color-dark)] p-2 leading-4"
                  >
                    Create
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section - User/Login Button */}
          <div className="ml-auto z-10">
          {user ? (
            <Link href="/settings">
              <Button
                variant='solid'
                size='md'
                rounded='xl'
                rightIcon={<TbExternalLink size={20} />}
                expandOnHover="icon"
                className="hover:bg-warning hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)] leading-5"
              >
                {user.username}
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button
                variant='solid'
                size='md'
                rounded='xl'
                rightIcon={<TbLogin size={20} />}
                expandOnHover="icon"
                className="hover:bg-warning hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)] leading-5"
              >
                Login
              </Button>
            </Link>
          )}
          </div>
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
 * Navigation item component
 */
interface NavItemProps {
  href: string;
  label: string;
  active: boolean;
}

function NavItem({ href, label, active }: NavItemProps) {
  return (
    <Link href={href} className="relative group m-1">
      <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
      <p className="text-sm font-black italic z-20 relative inline-flex flex-col md:flex-row items-center">
        {label}
      </p>
    </Link>
  );
}