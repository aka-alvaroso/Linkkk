import { useState } from "react";
import Link from "next/link";
import Button from "../ui/Button/Button";
import CreateLinkDrawer from "../Drawer/CreateLinkDrawer";
import { useAuthStore } from "../../stores/authStore";
import { TbExternalLink, TbPlus } from "react-icons/tb";
import * as motion from "motion/react-client";

export default function DesktopNavbar() {
  const { user, logout } = useAuthStore();
  const [createLinkDrawer, setCreateLinkDrawer] = useState(false);


  return (
    <div className="hidden md:flex max-w-3/4 mx-auto gap-4 top-2 left-0 right-0 z-50 p-2 rounded-2xl ">

        {/* Logo - Animación primera (delay 0) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.4, ease: "backInOut" }}
        >
          <Link href="/" className="ml-2 text-5xl font-black italic">
              <span
                  className="
                  transition-all duration-300 ease-in-out
                  hover:text-primary
                  hover:text-shadow-[_4px_4px_0_var(--color-dark)]"
              >
                  k.
              </span>
          </Link>
        </motion.div>

        <div className="flex gap-4 items-center rounded-2xl flex-1 p-2">
            {/* Botón Create - Animación segunda (delay 0.1) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Button
                  variant="solid"
                  size="sm"
                  rounded="xl"
                  className="hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                  leftIcon={<TbPlus size={18} className="" />}
                  onClick={() => {setCreateLinkDrawer(true)}}
              >
                  <p className="font-black italic">Create</p>
              </Button>
            </motion.div>


            {/* Options */}
            {/*
                Home | Features | Blog | Docs
            */}
            <div className="flex gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4, ease: "backInOut" }}
                >
                  <Link href="/dashboard" className="relative group">
                      <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                      <p className="font-black italic z-20 relative">Dashboard</p>
                  </Link>
                </motion.div>
                
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: "backInOut" }}
                >
                  <Link href="/features" className="relative group">
                      <div className="absolute top-0 left-0 w-0 h-full bg-primary z-10 group-hover:w-full transition-all duration-300 ease-in-out" />
                      <p className="font-black italic z-20 relative">Features</p>
                  </Link>
                </motion.div>
            </div>

        </div>

        {/* Botón final (user o "Get full access") - Animación cuarta (delay 0.3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "backInOut" }}
          className="flex items-center gap-2"
        >
            {
                user ? (
                    <Button
                        variant="solid"
                        size="sm"
                        rounded="xl"
                        className="hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                        rightIcon={<TbExternalLink size={18} />}
                        onClick={() => {
                            window.location.href = `/profile`;
                        }}
                    >
                        <p className="font-black italic">
                            {user.username}
                        </p>
                    </Button>
                ) : (
                    <Button
                        variant="solid"
                        size="sm"
                        rounded="xl"
                        className="hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                        onClick={() => {
                            window.location.href = `/auth/login`;
                        }}
                    >
                        <p className="font-black italic">Get full access</p>
                    </Button>
                )
            }
        </motion.div>
            

        <CreateLinkDrawer open={createLinkDrawer} onClose={() => setCreateLinkDrawer(false)} />
    </div>
  );
}